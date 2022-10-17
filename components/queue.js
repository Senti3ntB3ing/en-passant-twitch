
import { Persistent } from '../persistent.js';

export class Queue {

	#queue = [];
	#q = new Persistent('queue');
	enabled = true;

	constructor() { // threadsafe singleton
		if (!Queue.instance) Queue.instance = this;
		return Queue.instance;
	}

	async enqueue(user, profile) {
		this.#queue = (await this.#q.get()) || [];
		if (this.#queue.findIndex(e => e.user == user) != -1) return undefined;
		if (this.#queue.findIndex(e => e.profile == profile) != -1) return null;
		this.#queue.push({ user, profile });
		const position = this.#queue.length;
		if (!(await this.#q.set(this.#queue)))
			console.error('failed to enqueue user ' + user);
		return position;
	}
	async position(user) {
		this.#queue = (await this.#q.get()) || [];
		const index = this.#queue.findIndex(e => e.user == user);
		if (index == -1) return [ null, null ];
		return [ this.#queue[index], index + 1 ];
	}
	async dequeue() {
		this.#queue = (await this.#q.get()) || [];
		if (this.#queue.length == 0) return undefined;
		const removed = this.#queue.shift();
		if (!(await this.#q.set(this.#queue)))
			console.error('failed to dequeue');
		return removed;
	}
	async remove(data) {
		this.#queue = (await this.#q.get()) || [];
		const index = this.#queue.findIndex(
			e => e.user == data || e.profile == data
		);
		if (index == -1) return false;
		const removed = this.#queue[index];
		this.#queue = this.#queue.filter((_, i) => i != index);
		if (!(await this.#q.set(this.#queue)))
			console.error('failed to remove ' + data + ' from queue');
		return [ removed.user, removed.profile ];
	}
	async clear() {
		this.#queue = [];
		if (!(await this.#q.set(this.#queue)))
			console.error('failed to clear queue');
	}
	async list() {
		this.#queue = (await this.#q.get()) || [];
		return this.#queue;
	}

}
