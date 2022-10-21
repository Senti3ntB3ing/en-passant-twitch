
import { Prefix, ordinal } from '../config.js';
import { programmable, programmables } from '../parser.js';
import { Chess } from '../components/chesscom.js';
import { Queue } from '../components/queue.js';

const queue = new Queue();

programmable({
	commands: [ 'join' ],
	description: 'Join the current queue.',
	execute: async data => {
		if (!queue.enabled) return `The queue is currently disabled.`;
		const join = programmables.find(p => p.commands.includes('join'));
		if (join.permissions == 'sub' && !data.badges.subscriber)
			return `@${data.username}, today the queue is only for subscribers.`;
		const username = data.message.match(/join\s+<?\s*([^> ]+)\s*>?/i);
		if (username == null || username.length < 2)
			return `@${data.username}, try with ${Prefix}join <Chess.com username>.`;
		if (!(await Chess.com.exists(username[1])))
			return `@${data.username}, there is no Chess.com account with the username ${username[1]}.`;
		const i = await queue.enqueue(data.username, username[1]);
		if (i === undefined) return `@${data.username}, you are already in the queue.`;
		if (i === null) return `@${username[1]} is already in the queue.`;
		const j = ordinal(i);
		return `@${data.username} aka '${username[1]}' on Chess.com is ${j} in the queue.`;
	}
});

programmable({
	commands: [ 'leave' ],
	description: 'Leave the current queue.',
	execute: async data => {
		if (!queue.enabled) return `The queue is currently disabled.`;
		if (await queue.remove(data.username))
			return `@${data.username}, you left the queue.`;
		else return `@${data.username}, you are not in the queue.`;
	}
});

programmable({
	commands: [ 'position' ],
	description: 'Get your position in the queue.',
	execute: async data => {
		if (!queue.enabled) return `The queue is currently disabled.`;
		const [ u, i ] = await queue.position(data.username);
		if (i === null) return `@${data.username}, you are not in the queue.`;
		const j = ordinal(i);
		return `@${data.username} aka '${u.profile}' on Chess.com, you are ${j} in the queue.`;
	}
});

programmable({
	commands: [ 'insert' ], permissions: 'mod',
	description: 'Insert somebody in the current queue.',
	execute: async data => {
		if (!queue.enabled) return `The queue is currently disabled.`;
		const username = data.message.match(/insert\s+@?([^>@ ]+)\s+([^> ]+)/i);
		if (username == null || username.length < 3)
			return `@${data.username}, try with ${Prefix}insert <twitch username> <chess.com username>.`;
		if (!(await Chess.com.exists(username[2])))
			return `@${data.username}, there is no Chess.com account with the username ${username[2]}.`;
		const i = await queue.enqueue(username[1], username[2]);
		if (i === undefined || i === null)
			return `@${data.username}, ${username[2]} is already in the queue.`;
		const j = ordinal(i);
		return `@${username[1]} aka '${username[2]}' on Chess.com is ${j} in the queue.`;
	}
});

programmable({
	commands: [ 'remove' ], permissions: 'mod',
	description: 'Remove a user from the queue.',
	execute: async data => {
		if (!queue.enabled) return `The queue is currently disabled.`;
		let username = data.message.match(/remove\s+@?\s*(\w+)/i);
		if (username == null || username.length < 2) return;
		username = username[1].replace(/<|>|@/g, '');
		const result = await queue.remove(username);
		if (result === false) return `${username} is not in the queue.`;
		const [ user, profile ] = result;
		if (user === null) return `'${username}' is not in the queue.`;
		return `@${user} aka '${profile}' on Chess.com, removed from the queue.`;
	}
});

programmable({
	commands: [ 'next' ], permissions: 'mod',
	description: 'Get the next in line in the queue.',
	execute: async () => {
		if (!queue.enabled) return `The queue is currently disabled.`;
		const element = await queue.dequeue();
		if (element === undefined) return `There is no one left in the queue.`;
		return `@${element.user} aka '${element.profile}' on Chess.com is next.`;
	}
});

programmable({
	commands: [ 'queue', 'q' ],
	description: 'Displays the current queue.',
	execute: async () => {
		if (!queue.enabled) return `The queue is currently disabled.`;
		const list = await queue.list();
		if (list.length === 0) return 'There is no one in the queue.';
		return 'Queue: ' + list.map(e => e.profile).join(', ');
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
	commands: [ 'subq', 'subonlyq' ], permissions: 'mod',
	description: 'Toggles subonly mode for the current queue.',
	execute: () => {
		const join = programmables.find(p => p.commands.includes('join'));
		join.permissions = join.permissions == 'sub' ? 'all' : 'sub';
		return `Queue subonly mode is now ${join.permissions == 'sub' ? 'on' : 'off'}.`;
	}
});

programmable({
	commands: [ 'toggleq' ], permissions: 'mod',
	description: 'Toggles the queue on and off.',
	execute: () => {
		queue.enabled = !queue.enabled;
		return `The queue is currently ${queue.enabled ? 'on' : 'off'}.`;
	}
});
