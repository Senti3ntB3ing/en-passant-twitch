
import { Streamer, Time } from "../config.js";
import { task } from "../parser.js";
import { live } from "../components/twitch.js";

task(async () => {
	if (await live(Streamer))
		return "🧡 Streamer Awards are almost here! " +
			"Show your support and vote thechessnerdlive for " +
			"the chess and rising star awards (10 and 23) " +
			"-> thestreamerawards.com";
}, Time.minutes(10));
