
import { Lock } from "https://deno.land/x/unified_deno_lock@v0.1.1/mod.ts";

const ENDPOINT = Deno.env.get("REPLIT_DB_URL");

export class Persistent {

	#key = '';
	#lock = new Lock();

	constructor(key) {
		if (key == undefined || key == null || key == '')
			this.#key = Math.floor(Math.random() * 1000).toString();
		else this.#key = key;
	}

	async get() {
		try {
			const result = await fetch(ENDPOINT + "/" + this.#key);
			if (result.status == 200) return await result.json();
			if (result.status == 404) return undefined;
		} catch (e) { console.error(e); }
		return undefined;
	}
	async set(value) {
		await this.#lock.knock();
		this.#lock.lock();
		try {
			const result = await fetch(ENDPOINT, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: this.#key + "=" + JSON.stringify(value),
			});
			if (result.status == 200) return true;
		}
		catch (e) { console.error(e); }
		finally { this.#lock.unlock(); }
		return false;
	}
	async delete() {
		await this.#lock.knock();
		this.#lock.lock();
		try {
			const result = await fetch(ENDPOINT + "/" + this.#key, {
				method: "DELETE"
			});
			if (result.status == 204) return true;
			if (result.status == 404) return false;
		}
		catch (e) { console.error(e); }
		finally { this.#lock.unlock(); }
		return false;
	}

}
