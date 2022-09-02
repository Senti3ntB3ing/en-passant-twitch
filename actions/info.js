
import { Streamer, StreamerID } from '../config.js';
import { programmable } from '../parser.js';
import { uptime, sub_count, follow_count } from '../components/twitch.js';

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
	execute: async () => `Zach has been streaming for ${await uptime(Streamer)}.`
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

// https://api.2g.be/twitch/followage/thechessnerdlive/user?format=ymwd)
programmable({
	commands: [ 'followage' ], permissions: 'all',
	description: 'Gets your current follow age.',
	execute: async data => {
		const user = data.username;
		const response = await fetch(
			`https://api.2g.be/twitch/followage/${Streamer}/${user}?format=ymwd`
		);
		if (response.status != 200) return;
		return '@' + (await response.text()).replace(Streamer + ' ', '');
	}
});
