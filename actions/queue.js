
import { Prefix as P, ordinal } from '../config.js';
import { programmable, programmables } from '../parser.js';
import { Chess } from '../components/chesscom.js';
import { Queue } from '../components/queue.js';

export const queue = new Queue();

programmable({
	commands: [ 'join' ],
	description: 'Join the current queue.',
	// execute needs to be a function to access `this`.
	execute: async function(data) {
		if (!queue.enabled) return `The queue is closed.`;
		if (this.permissions === 'sub' && !data.tags.sub)
			return `@${data.username}, the queue is currently sub-only.`;
		const username = data.message.match(/join\s+([^ ]+)\s*/i);
		if (username === null || username.length < 2)
			return `@${data.username}, try with ${P}join username`;
		if (!(await Chess.com.exists(username[1])))
			return `@${data.username}, there is no Chess.com user '${username[1]}'.`;
		const i = await queue.enqueue(data.username, username[1], data.tags.sub || data.tags.mod || data.tags.vip);
		if (i === undefined) return `@${data.username}, you're already in queue.`;
		if (i === null) return `@${username[1]} is already in queue.`;
		const p = "you're " + ordinal(i);
		if (data.username === username[1]) return `'${data.username}' ${p}.`;
		return `@${data.username} aka '${username[1]}' ${p}.`;
	}
});

programmable({
	commands: [ 'leave' ],
	description: 'Leave the current queue.',
	execute: async data => {
		if (await queue.remove(data.username))
			return `@${data.username}, you left the queue.`;
		else return `@${data.username}, you're not in queue.`;
	}
});

programmable({
	commands: [ 'position' ],
	description: 'Get your position in the queue.',
	execute: data => {
		const [ _u, i ] = queue.position(data.username);
		if (i === null) return `@${data.username}, you're not in queue.`;
		return `@${data.username} you're ${ordinal(i)} / ${queue.size}.`;
	}
});

programmable({
	commands: [ 'insert' ], permissions: 'mod',
	description: 'Insert somebody in the current queue.',
	execute: async data => {
		const username = data.message.match(/insert\s+@?(\w+)\s+(\w+)/i);
		if (username === null || username.length < 3)
			return `@${data.username}, try with ${P}insert "twitch" "Chess.com".`;
		if (!(await Chess.com.exists(username[2])))
			return `@${data.username}, there is no Chess.com user '${username[2]}'.`;
		const i = await queue.enqueue(username[1], username[2]);
		if (i === undefined || i === null)
			return `@${data.username}, ${username[2]} is already in queue.`;
		const j = ordinal(i);
		return `@${username[1]} aka '${username[2]}' is ${j}.`;
	}
});

programmable({
	commands: [ 'remove' ], permissions: 'mod',
	description: 'Remove a user from the queue.',
	execute: async data => {
		let username = data.message.match(/remove\s+@?(\w+)/i);
		if (username === null || username.length < 2) return;
		username = username[1].replace(/"|'|@/g, '');
		const result = await queue.remove(username);
		if (result === false) return `${username} is not in queue.`;
		const [ user, profile ] = result;
		if (user === null) return `'${username}' is not in queue.`;
		return `@${user} aka '${profile}' has been removed.`;
	}
});

programmable({
	commands: [ 'next' ], permissions: 'mod',
	description: 'Get the next in line in the queue.',
	execute: async () => {
		const element = await queue.dequeue();
		if (element === undefined) return `The queue is empty.`;
		if (element.user === element.profile) return `'${element.profile}' on Chess.com is next.`;
		return `@${element.user} aka '${element.profile}' on Chess.com is next.`;
	}
});

programmable({
	commands: [ 'queue', 'q' ], permissions: 'mod',
	description: 'Displays the current queue.',
	execute: () => {
		if (queue.list.length === 0) return 'The queue is empty.';
		return 'Queue: ' + queue.list.map(e => e.profile).join(' -> ');
	}
});

programmable({
	commands: [ 'clear' ], permissions: 'mod',
	description: 'Clears the current queue.',
	execute: async () => {
		await queue.clear();
		return 'The queue has been cleared.';
	}
});

programmable({
	commands: [ 'subq' ], permissions: 'mod',
	description: 'Toggles subonly mode for the current queue.',
	execute: () => {
		const join = programmables.find(p => p.commands.includes('join'));
		join.permissions = join.permissions == 'sub' ? 'all' : 'sub';
		return `Sub-only mode is now ${join.permissions == 'sub' ? 'on' : 'off'}.`;
	}
});

programmable({
	commands: [ 'toggleq' ], permissions: 'mod',
	description: 'Toggles the queue on and off.',
	execute: () => {
		queue.enabled = !queue.enabled;
		return `The queue is now ${queue.enabled ? 'open' : 'closed'}.`;
	}
});
