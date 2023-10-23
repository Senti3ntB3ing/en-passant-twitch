
import { Lock } from "https://deno.land/x/unified_deno_lock@v0.1.1/mod.ts";

import { Database } from '../database.js';

export class Queue {

	#queue = null;
	#lock_m = new Lock();
	#lock_d = new Lock();
	enabled = false;

	constructor() { // threadsafe singleton:
		if (!Queue.instance) Queue.instance = this;
		return Queue.instance;
	}

	async #prepare() {
		if (this.#queue !== null) return;
		await this.#lock_d.knock();
		this.#lock_d.lock();
		this.#queue = (await Database.get("queue")) || [];
		this.#lock_d.unlock();
	}

	async #update() {
		this.#prepare();
		await this.#lock_d.knock();
		this.#lock_d.lock();
		await Database.set("queue", this.#queue);
		this.#lock_d.unlock();
	}

	async #enter_critical_section() {
		await this.#lock_m.knock();
		this.#lock_m.lock();
	}

	#leave_critical_section() {
		this.#lock_m.unlock();
	}

	async enqueue(user, profile, sub = false) {
		await this.#prepare();
		await this.#enter_critical_section();
		if (this.#queue.findIndex(e => e.user === user) !== -1) {
			this.#leave_critical_section();
			return undefined;
		}
		if (this.#queue.findIndex(e => e.profile === profile) !== -1) {
			this.#leave_critical_section();
			return null;
		}
		let position;
		if (!sub) {
			this.#queue.push({ user, profile, sub });
			position = this.#queue.length;
		} else {
			let i = 0;
			while (i < this.#queue.length && this.#queue[i].sub) i++;
			this.#queue.splice(i, 0, { user, profile, sub });
			position = i + 1;
		}
		await this.#update();
		this.#leave_critical_section();
		return position;
	}
	async dequeue() {
		await this.#prepare();
		await this.#enter_critical_section();
		if (this.#queue.length === 0) {
			this.#leave_critical_section();
			return undefined;
		}
		const removed = this.#queue.shift();
		await this.#update();
		this.#leave_critical_section();
		return removed;
	}
	position(user) {
		const index = this.#queue.findIndex(e => e.user == user);
		if (index === -1) return [ null, null ];
		return [ this.#queue[index], index + 1 ];
	}
	async remove(data) {
		this.#prepare();
		await this.#enter_critical_section();
		const index = this.#queue.findIndex(
			e => e.user === data || e.profile === data
		);
		if (index === -1) {
			this.#leave_critical_section();
			return false;
		}
		const removed = this.#queue[index];
		this.#queue.splice(index, 1);
		await this.#update();
		this.#leave_critical_section();
		return [ removed.user, removed.profile ];
	}
	async clear() {
		await this.#enter_critical_section();
		this.#queue = [];
		await this.#update();
		this.leave_critical_section();
	}
	get list() { return this.#queue; }
	get size() { return this.#queue.length; }

}
