
import { Streamer } from '../config.js';
import { programmable } from '../parser.js';
import { uptime, follow_count } from '../components/twitch.js';
import { log } from '../parser.js';
import { channel } from '../main.js';

programmable({
	commands: [ 'restart' ], permissions: 'mod',
	description: 'Restarts the bot.',
	execute: () => {
		channel.send(`Force restart -> en-passant-twitch.cristian-98.repl.co`);
		log('status', 'force restart');
		setTimeout(() => Deno.exit(1), 1000);
	}
});

// ==== Challenge ==============================================================

export let challenge = false;

programmable({
	commands: [ 'challenge', 'match' ],
	description: 'Challenge Zach to a game.',
	execute: () => challenge ?
		"Zach is accepting challenges today, !join the queue to play him." :
		"Sorry, Zach is not accepting challenges today."
});

programmable({
	commands: [ 'togglechallenge', 'togglec' ], permissions: 'mod',
	description: 'Toggle the challenge message.',
	execute: () => {
		challenge = !challenge;
		return `Challenge mode is currently ${challenge ? 'on' : 'off'}.`;
	}
});

// ==== Generic Info ===========================================================

programmable({
	commands: [ 'time' ],
	description: 'Gets Zach\'s current time.',
	execute: () => `For Zach it is ${(new Date()).toLocaleTimeString('en-US', {
		timeZone: 'America/Montreal',
		hour12: true, second: '2-digit', minute: '2-digit', hour: 'numeric'
	}).replace(/:\d\d ([AP]M)/g, '$1').toLocaleLowerCase()}.`
});

programmable({
	commands: [ 'age', 'birthday', 'bday' ],
	description: 'Gets Zach\'s birthday.',
	execute: () => {
		const d = Date.now() - new Date('30 July 2001');
		const m = new Date(d);
		const a = Math.abs(m.getUTCFullYear() - 1970);
		return `Zach was born on the 30th of July 2001, he is currently ${a}.`;
	}
});

programmable({
	commands: [ 'uptime' ],
	description: 'Gets the uptime of the stream.',
	execute: async () => {
		const up = await uptime(Streamer);
		if (up === null) return 'Zach is not currently streaming.';
		return `Zach has been streaming for ${await uptime(Streamer)}.`
	}
});

programmable({
	commands: [ 'followers' ],
	description: 'Gets the current number of followers.',
	execute: async () => `Zach has ${await follow_count(Streamer)} followers.`
});

programmable({
	commands: [ 'so', 'shoutout' ], permissions: 'mod',
	description: 'Shout out to the specified streamer.',
	execute: data => {
		const args = data.message.split(/\s+/);
		if (args.length < 2) return;
		const streamer = args[1].replace(/^@+/, '');
		return `Follow @${streamer} at twitch.tv/${streamer}`;
	}
});

programmable({
	commands: [ 'tos' ], permissions: 'mod',
	description: 'Chess.com terms of service.',
	execute: data => {
		let user = data.message.match(/@(\w+)/);
		if (user == null || user.length < 2)
			return `Please don't suggest moves for the current position as ` +
			`it's against chess.com terms of service. Instead please ask ` +
			`Zach about a possible move after the position has passed`;
		user = user[1];
		return `@${user} please don't suggest moves for the current position ` +
			`as it's against chess.com terms of service. Instead please ask ` +
			`Zach about a possible move after the position has passed`;
	}
});

const leap = (y) => ((y % 4 == 0) && (y % 100 != 0)) || (y % 400 == 0);

function difference(major, minor) {
	if (major < minor) [ major, minor ] = [ minor, major ];
	const monthsDays = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
	const majorDays = Math.floor(major.valueOf() / 86400000);
	const minorDays = Math.floor(minor.valueOf() / 86400000);
	let delta = majorDays - minorDays, years = 0, months = 0;
	let i = minor.getFullYear(), l = leap(i) ? 366 : 365;
	while (delta >= l) delta -= l = (leap(i++) ? 366 : 365);
	years = i - minor.getFullYear();
	while (delta >= monthsDays[months]) delta -= monthsDays[months++];
	return { years, months, weeks: Math.floor(delta / 7), days: delta % 7 };
}

// https://api.2g.be/twitch/followage/thechessnerdlive/user?format=ymwd)
programmable({
	commands: [ 'followage' ], permissions: 'all',
	description: 'Gets your current follow age.',
	execute: async data => {
		const user = data.username;
		if (data.username == 'thechessnerdlive') {
			const d = difference(new Date(), new Date(2021, 9, 11));
			let s = 'Zach has been streaming for ';
			if (d.years > 0) s += `${d.years} years, `;
			if (d.months > 0) s += `${d.months} months, `;
			if (d.weeks > 0) s += `${d.weeks} weeks, `;
			if (d.days > 0) s += `${d.days} days.`;
			return s;
		}
		const response = await fetch(
			`https://api.2g.be/twitch/followage/${Streamer}/${user}?format=ymwd`
		);
		if (response.status != 200) return;
		return '@' + (await response.text()).replace(Streamer + ' ', '');
	}
});
