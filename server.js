
import { serve } from 'https://deno.land/std@0.98.0/http/server.ts';

export const ROOT = '@', ALL = '*', NOT_FOUND = '404';
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
			// if the path doesn't end with a slash, redirect to the same path with a slash
			if (!request.url.endsWith('/')) {
				request.respond({ status: 301, headers: new Headers({ Location: request.url + '/' }) });
				continue;
			}
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
			} else if (ALL in this.#handlers) {
				const handler = this.#handlers[ALL];
				if (handler.constructor.name == 'AsyncFunction')
					response = await handler(request);
				else response = handler(request);
				if (response !== undefined) request.respond(response);
				else request.respond({ status: 200, body: 'OK' });
			} else if (NOT_FOUND in this.#handlers) {
				const handler = this.#handlers[NOT_FOUND];
				if (handler.constructor.name == 'AsyncFunction')
					response = await handler(request);
				else response = handler(request);
				if (response !== undefined) request.respond(response);
				else request.respond({ status: 404, body: 'OK' });
			} else request.respond({ status: 404 });
		}
	}

}
