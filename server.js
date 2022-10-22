
import { serve } from 'https://deno.land/std@0.98.0/http/server.ts';

export const ROOT = '@';
const PRX = /(^\/+)|(\/+$)/g;

export class Server {

	#server = null;
	#handlers = {};

	constructor(port = 8080) {
		this.#server = serve({ port });
	}

	listen(path, handler) {
		if (Array.isArray(path)) {
			for (const p of path)
				this.#handlers[p.trim().replace(PRX, '').trim()] = handler;
		} else if (typeof path == 'string')
			this.#handlers[path.trim().replace(PRX, '').trim()] = handler;
	}

	async start() {
		if (this.#server === null) return;
		for await (const request of this.#server) {
			request.url = request.url.trim().replace(PRX, '').trim();
			let response;
			if (request.url in this.#handlers) {
				const handler = this.#handlers[request.url];
				if (handler.constructor.name == 'AsyncFunction')
					response = await handler(request);
				else response = handler(request);
				if (response !== undefined) request.respond(response);
				else request.respond({ status: 200, body: 'OK' });
			} else if (request.url.length === 0) {
				const handler = this.#handlers[ROOT];
				if (handler.constructor.name == 'AsyncFunction')
					response = await handler(request);
				else response = handler(request);
				if (response !== undefined) request.respond(response);
				else request.respond({ status: 200, body: 'OK' });
			} else request.respond({ status: 404 });
		}
	}

}
