
const FIREBASE_URL    = Deno.env.get("FIREBASE_URL");
const FIREBASE_SECRET = Deno.env.get("FIREBASE_SECRET");

export class Database {

	static async get(key) {
		return await fetch(FIREBASE_URL + encodeURIComponent(key) + "/.json?auth=" + FIREBASE_SECRET)
			.then(e => e.text())
			.then(value => {
				if (!value) return null;
				try { value = JSON.parse(value); }
				catch { return null; }
				if (value === undefined || value === null || value.error !== undefined) return null;
				return value;
			});
	}

	static async set(key, value) {
		await fetch(FIREBASE_URL + encodeURIComponent(key) + "/.json?auth=" + FIREBASE_SECRET, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(value),
		});
	}

	static async delete(key) {
		await fetch(
			FIREBASE_URL + encodeURIComponent(key) + "/.json?auth=" + FIREBASE_SECRET,
			{ method: "DELETE" }
		);
	}

	static async dictionary() {
		return await fetch(`${FIREBASE_URL}/.json?auth=${FIREBASE_SECRET}`)
			.then(e => e.text())
			.then(value => {
				if (!value) return null;
				try { value = JSON.parse(value); }
				catch { return null; }
				if (value === undefined || value === null || value.error !== undefined) return null;
				return value;
			});
	}

}
