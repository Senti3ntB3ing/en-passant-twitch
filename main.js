
import { TwitchChat } from "https://deno.land/x/tmi_beta@v0.1.4/mod.ts";

import {
	log, resolve, actions, announcements, programmables, refresh
} from "./parser.js";
import { Time, Streamer, StreamerID, Prefix } from "./config.js";
import { Server, ROOT, NOT_FOUND } from "./server.js";
import { Database } from "./database.js";

import { queue } from "./actions/queue.js";
import { challenge } from "./actions/info.js";

import { live } from "./components/twitch.js";

// ==== Actions ============================

import "./actions/info.js";
import "./actions/queue.js";
import "./actions/ratings.js";
import "./actions/video.js";

// =========================================

// twitch bot:
export let chat = null, channel = null;
// current scopes generated by https://twitchapps.com/tokengen/:
// https://dev.twitch.tv/docs/authentication/scopes#twitch-access-token-scopes
// channel:moderate moderation:read moderator:read:chat_settings
// moderator:manage:chat_settings moderator:manage:chat_messages
// moderator:manage:announcements moderator:manage:banned_users
// chat:edit chat:read whispers:read whispers:edit
// user:manage:whispers user:manage:chat_color

export async function connect() {
	try {
		if (channel !== null) {
			channel.part();
			chat.disconnect();
			log("status", "twitch chat disconnected");
		}
		//chat = new TwitchChat(Deno.env.get("TWITCH_OAUTH_BOT"));
		chat = new TwitchChat(Database.get("twitch_oauth_bot"));
		await chat.connect();
		channel = chat.join(Streamer, StreamerID);
		channel.listener("privmsg", data => resolve(data, channel));
	} catch (e) {
		console.error(e);
		Deno.exit(1);
	}
	log("status", "twitch chat connected");
}

await connect();

// ==== Announcements ======================

let last = Math.floor(Math.random() * announcements.length);
setInterval(async () => {
	if (announcements.length === 0) return;
	last = (last + 1) % announcements.length;
	const a = announcements[last];
	const message = a.message, color = a.color || "green";
	if (message === undefined) return;
	if ((a.live || true) && !(await live(Streamer))) return;
	channel.commands.announce(message, color);
}, Time.minutes(7));

// =========================================

refresh();

const server = new Server();

server.listen(NOT_FOUND, () => ({ status: 404, body: "Not found" }));

server.listen("refresh", async _request => {
	await refresh();
	return {
		headers: new Headers({ "Content-Type": "text/html" }),
		status: 200, body: "Commands Refreshed!"
	};
});

server.listen([ ROOT, "mod" ], request => {
	const mod = request.url.includes("mod");
	return {
		headers: new Headers({ "Content-Type": "text/html" }),
		status: 200, body: new TextDecoder().decode(
			Deno.readFileSync("./help.html")
		).replace("`%ACTIONS%`", JSON.stringify(actions))
		.replace("`%PROGRAMMABLES%`", JSON.stringify(programmables))
		.replace("`%PREFIX%`", `'${Prefix}'`)
		.replace("`%MOD%`", JSON.stringify(mod))
	};
});

server.listen("time", () => ({
	headers: new Headers({ "Content-Type": "text/html" }),
	status: 200, body: new TextDecoder().decode(
		Deno.readFileSync("./time.html")
	)
}));

server.listen("queue", () => {
	const join = programmables.find(p => p.commands.includes("join"));
	return {
		headers: new Headers({ "Content-Type": "text/html" }),
		status: 200, body: new TextDecoder().decode(
			Deno.readFileSync("./queue.html")
		).replace("`%LIST%`", JSON.stringify(queue.list))
		.replace("`%QUEUE%`", queue.enabled ? "'on'" : "'off'")
		.replace("`%CHALLENGE%`", challenge ? "'on'" : "'off'")
		.replace("`%SUBONLY%`", join.permissions === 'sub' ? "'on'" : "'off'")
	};
});

server.listen("map", () => ({
	headers: new Headers({ "Content-Type": "text/html" }),
	status: 200, body: Deno.readFileSync("./map.html")
}));

server.listen("tourney", () => ({
	headers: new Headers({ "Content-Type": "text/html" }),
	status: 200, body: Deno.readFileSync("./tourney.html")
}));

server.start();
log("status", "server connected");
