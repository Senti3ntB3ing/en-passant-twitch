
import { Streamer, Time } from '../config.js';
import { task } from '../parser.js';
import { live } from '../components/twitch.js';

task(async () => {
	if (await live(Streamer))
		return '🧡 Check out our premium handmade chess boards at The Red Drop -> thechessnerd.com/shop';
}, Time.minutes(30));
