
import { Prefix, ordinal } from '../config.js';
import { programmable, programmables } from '../parser.js';
import { existsChess_com } from '../components/chess_com.js';

class Queue {

	#queue = [];

	enabled = true;

	constructor() { this.#queue = []; }

	enqueue(element, find_lambda) {
		if (this.#queue.findIndex(find_lambda) != -1) return null;
		this.#queue.push(element);
		const position = this.#queue.length;
		return position;
	}
	position(find_lambda) {
		const index = this.#queue.findIndex(find_lambda);
		if (index == -1) return [ null, null ];
		return [ this.#queue[index], index + 1 ];
	}
	dequeue() { return this.#queue.shift(); }
	remove(filter_lambda) {
		const index = this.#queue.findIndex(filter_lambda);
		if (index == -1) return [ null, null ];
		const removed = this.#queue[index];
		this.#queue = this.#queue.filter((_, i) => i != index);
		return [ removed.user, removed.profile ];
	}
	clear() { this.#queue = []; }
	list() { return this.#queue; }

}

const queue = new Queue();

programmable({
	commands: [ 'join' ],
	description: 'Join the current queue.',
	execute: async data => {
		if (!queue.enabled) return `The queue is currently disabled.`;
		const join = programmables.find(p => p.commands.includes('join'));
		if (join.permissions == 'sub' && !data.badges.subscriber)
			return `@${data.username}, today the queue is only for subscribers.`;
		const username = data.message.match(/join\s+<?\s*(\w+)\s*>?/);
		if (username == null || username.length < 2)
			return `@${data.username}, try with ${Prefix}join <Chess.com username>.`;
		if (!(await existsChess_com(username[1])))
			return `@${data.username}, there is no Chess.com account with the username ${username[1]}.`;
		const i = queue.enqueue({
			user: data.username, profile: username[1] },
			e => e.user == data.username
		);
		if (i == null) return `@${data.username}, you are already in the queue.`;
		const j = ordinal(i);
		return `@${data.username} aka '${username[1]}' on Chess.com is ${j} in the queue.`;
	}
});

programmable({
	commands: [ 'leave' ], permissions: 'all',
	description: 'Leave the current queue.',
	execute: data => {
		if (!queue.enabled) return `The queue is currently disabled.`;
		queue.remove(e => e.user == data.username);
		return `@${data.username}, you left the queue.`;
	}
});

programmable({
	commands: [ 'position' ], permissions: 'all',
	description: 'Get your position in the queue.',
	execute: data => {
		if (!queue.enabled) return `The queue is currently disabled.`;
		const [ u, i ] = queue.position(e => e.user == data.username);
		if (i == null) return `@${data.username}, you are not in the queue.`;
		const j = ordinal(i);
		return `@${data.username} aka '${u.profile}' on Chess.com, you are ${j} in the queue.`;
	}
});

programmable({
	commands: [ 'remove' ], permissions: 'mod',
	description: 'Remove a user from the queue.',
	execute: data => {
		if (!queue.enabled) return `The queue is currently disabled.`;
		let username = data.message.match(/remove\s+@?\s*(\w+)/);
		if (username == null || username.length < 2) return;
		username = username[1].replace(/<|>|@/g, '');
		const [ user, profile ] = queue.remove(
			e => e.user == username || e.profile == username
		);
		if (user == null) return `'${username}' is not in the queue.`;
		return `@${user} aka '${profile}' on Chess.com, removed from the queue.`;
	}
});

programmable({
	commands: [ 'next' ], permissions: 'mod',
	description: 'Get the next in line in the queue.',
	execute: () => {
		if (!queue.enabled) return `The queue is currently disabled.`;
		const element = queue.dequeue();
		if (element == undefined) return `There is no one in the queue.`;
		return `@${element.user} aka '${element.profile}' on Chess.com is next.`;
	}
});

programmable({
	commands: [ 'queue', 'q' ],
	description: 'Displays the current queue.',
	execute: () => {
		if (!queue.enabled) return `The queue is currently disabled.`;
		const list = queue.list();
		if (list.length == 0) return 'There is no one in the queue.';
		return 'Queue: ' + list.map(e => e.profile).join(', ');
	}
});

programmable({
	commands: [ 'clear' ], permissions: 'mod',
	description: 'Clears the current queue.',
	execute: () => {
		queue.clear();
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
