
import { DISCORD, Streamer, Time } from '../config.js';
import { task } from '../parser.js';
import { live } from '../components/twitch.js';

task(async () => {
	if (await live(Streamer))
		return '💙 Join our thriving Discord community -> ' + DISCORD;
}, Time.minutes(15));
