
import { Lock } from "https://deno.land/x/unified_deno_lock@v0.1.1/mod.ts";

import { Database } from './database.js';

export class Persistent {

	#key = '';
	#lock = new Lock();

	constructor(key) {
		if (key == undefined || key == null || key == '')
			this.#key = Math.floor(Math.random() * 1000).toString();
		else this.#key = key;
	}

	lock() { this.#lock.lock(); return this; }
	unlock() { this.#lock.unlock(); return this; }
	async knock() { await this.#lock.knock(); return this; }

	async get() { return await Database.get(this.#key); }
	async set(value) { await Database.set(this.#key, value); return this; }

}
