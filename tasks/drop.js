
import { Streamer, Time } from '../config.js';
import { task } from '../parser.js';
import { live } from '../components/twitch.js';

task(async () => {
	//if (await live(Streamer))
		return '🧡 The Red Drop is out now -> thechessnerd.com/shop';
}, Time.minutes(30));
