
import { Streamer, Time } from "../config.js";
import { programmable } from "../parser.js";
import { uptime, follow_count } from "../components/twitch.js";
import { refresh } from "../parser.js";
import { channel, connect } from "../main.js";

programmable({
	commands: [ "restart" ], permissions: "mod",
	description: "Reloads the commands in case of halt.",
	execute: async () => {
		await refresh();
		channel.send(`The bot is restarting.`);
		await connect();
		channel.send(`The bot is back online.`);
	}
});

programmable({
	commands: [ "kill" ], permissions: "mod",
	description: "Kills the bot.",
	execute: () => { Deno.exit(0); }
});

// ==== Challenge ==============================================================

export let challenge = false;

programmable({
	commands: [ "challenge" ],
	description: "Challenge Zach to a game.",
	execute: () => challenge ?
		"Zach is accepting challenges today, !join the queue to play him." :
		"Sorry, Zach is not accepting challenges today."
});

programmable({
	commands: [ "togglec" ], permissions: "mod",
	description: "Toggle the challenge message.",
	execute: () => {
		challenge = !challenge;
		return `Challenge mode is currently ${challenge ? "on" : "off"}.`;
	}
});

// ==== Generic Info ===========================================================

programmable({
	commands: [ "time", "timezone" ],
	description: "Gets Zach's current time.",
	execute: () => `For Zach it is ${(new Date()).toLocaleTimeString("en-US", {
		timeZone: "Europe/Amsterdam", //timeZone: "America/Montreal",
		hour12: true, second: "2-digit", minute: "2-digit", hour: "numeric"
	}).replace(/:\d\d ([AP]M)/g, "$1").toLocaleLowerCase()}.`
});

programmable({
	commands: [ "age", "birthday", "bday" ],
	description: "Gets Zach's birthday.",
	execute: () => {
		const d = Date.now() - new Date("30 July 2001");
		const m = new Date(d);
		const a = Math.abs(m.getUTCFullYear() - 1970);
		return `Zach was born on the 30th of July 2001, he is currently ${a}.`;
	}
});

programmable({
	commands: [ "uptime" ],
	description: "Gets the uptime of the stream.",
	execute: async () => {
		const up = await uptime(Streamer);
		if (up === null) return "Zach is not currently streaming.";
		return `Zach has been streaming for ${await uptime(Streamer)}.`
	}
});

programmable({
	commands: [ "followers" ],
	description: "Gets the current number of followers.",
	execute: async () => `Zach has ${await follow_count(Streamer)} followers.`
});

programmable({
	commands: [ "tos" ], permissions: "vip",
	description: "Chess.com terms of service.",
	execute: data => {
		let user = data.message.match(/@(\w+)/);
		if (user === null || user.length < 2)
			return `Please don't suggest moves for the current position ` +
			`as it's against chess.com terms of service!`;
		user = user[1];
		return `@${user} please don't suggest moves for the current position ` +
			`as it's against chess.com terms of service!`;
	}
});

// https://api.2g.be/twitch/followage/thechessnerdlive/user?format=ymwd)
programmable({
	commands: [ "followage" ], permissions: "all",
	description: "Gets your current follow age.",
	execute: async data => {
		const user = data.username;
		if (data.username === Streamer) {
			const d = Time.difference(new Date(), new Date(2022, 2, 19));
			let s = "Zach has been streaming for ";
			if (d.years  > 0) s += `${d.years} years, `;
			if (d.months > 0) s += `${d.months} months, `;
			if (d.weeks  > 0) s += `${d.weeks} weeks, `;
			if (d.days   > 0) s += `${d.days} days.`;
			return s;
		}
		const response = await fetch(
			`https://api.2g.be/twitch/followage/${Streamer}/${user}?format=ymwd`
		);
		if (response.status !== 200) return;
		return '@' + (await response.text()).replace(Streamer + ' ', "");
	}
});
