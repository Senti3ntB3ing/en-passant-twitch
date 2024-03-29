
import { uptime } from "../components/twitch.js";
import { Chess } from "../components/chess.com.js";
import { lichess } from "../components/lichess.org.js";
import { FIDE } from "https://deno.land/x/fide_rs@v1.0.3/mod.ts";

import { Prefix, ZACH_FIDE_ID, saxon_genitive } from "../config.js";
import { programmable } from "../parser.js";
import { Database } from "../database.js";

const emojis = {
	blitz: "⚡️", bullet: "🔫", rapid: "⏱️", classical: "⏳", standard: "🕰",
	daily: "☀️", tactics: "🧩", "puzzle rush": "🔥",
};

const CHESS_COM_REGEX = new RegExp(Prefix + "(?:chess\\.?com|ratings)\\s+<?([A-Za-z0-9_\\-]+)>?");
const PUZZLES_REGEX = new RegExp(Prefix + "puzzles\\s+<?(\\w+)>?");
const LICHESS_REGEX = new RegExp(Prefix + "lichess(?:\\.org)?\\s+<?([A-Za-z0-9_\\-]+)>?");

programmable({
	commands: [ "fide" ], permissions: "all",
	description: "Gets Zach's FIDE official ratings.",
	execute: async () => {
		const player = await FIDE(ZACH_FIDE_ID);
		if (player === undefined || player === null)
			return "Zach's FIDE profile -> ratings.fide.com/profile/" + ZACH_FIDE_ID;
		return `Zach's FIDE ratings (ratings.fide.com/profile/${ZACH_FIDE_ID}) -> ` +
		player.ratings.filter(r => r.rating != "UNR").map(
			r => emojis[r.category] + ` ${r.category} ${r.rating}`
		).join(", ") + '.';
	}
});

programmable({
	commands: [ "personalbest", "pb", "peak", "ath" ], permissions: "all",
	description: "Gets Zach's peak ratings on Chess.com.",
	execute: async () => {
		const ratings = await Chess.com.best("thechessnerd");
		if (ratings === undefined)
			return "Zach's Chess.com profile -> chess.com/member/thechessnerd";
		return "Zach's Chess.com peak ratings -> " + ratings.map(
			r => emojis[r.category] + ` ${r.category} ${r.rating}`
		).join(", ") + '.';
	}
});

programmable({
	commands: [ "puzzles" ], permissions: "all",
	description: "Gets Chess.com puzzle stats for the specified user.",
	execute: async data => {
		const match = data.message.match(PUZZLES_REGEX);
		if (match === null || match.length < 2)
			return `Try with ${Prefix}chess.com <username>.`;
		const ratings = await Chess.com.puzzles(match[1]);
		if (ratings === undefined)
			return `Couldn't find Chess.com user '${match[1]}'.`;
		return saxon_genitive(match[1]) + " Chess.com puzzle stats -> " + ratings.map(
			r => emojis[r.category] + ` ${r.category} ${r.rating}`
		).join(", ") + '.';
	}
});

programmable({
	commands: [ "chess.com", "chesscom", "ratings" ], permissions: "all",
	description: "Gets Chess.com ratings for the specified user.",
	execute: async data => {
		const match = data.message.match(CHESS_COM_REGEX);
		if (match === null || match.length < 2) {
			const ratings = await Chess.com.ratings("thechessnerd");
			if (ratings === undefined)
				return "Zach's Chess.com profile -> chess.com/member/thechessnerd";
			return "Zach's Chess.com ratings -> " + ratings.map(
				r => emojis[r.category] + ` ${r.category} ${r.rating}`
			).join(", ") + '.';
		}
		const ratings = await Chess.com.ratings(match[1]);
		if (ratings === undefined)
			return `Couldn't find Chess.com user '${match[1]}'.`;
		return saxon_genitive(match[1]) + " Chess.com ratings -> " + ratings.map(
			r => emojis[r.category] + ` ${r.category} ${r.rating}`
		).join(", ") + '.';
	}
});

programmable({
	commands: [ "lichess", "lichess.org" ], permissions: "all",
	description: "Gets lichess.org ratings for the specified user.",
	execute: async data => {
		const match = data.message.match(LICHESS_REGEX);
		if (match === null || match.length < 2)
			return `Try with ${Prefix}lichess <username>.`;
		const ratings = await lichess.org.ratings(match[1]);
		if (ratings === undefined)
			return `Couldn't find lichess.org user '${match[1]}'.`;
		return saxon_genitive(match[1]) + " lichess.org ratings -> " + ratings.map(
			r => emojis[r.category] + ` ${r.category} ${r.rating}`
		).join(", ") + '.';
	}
});

programmable({
	commands: [ "starting" ], permissions: "all",
	description: "Gets Zach's starting rating for this stream.",
	execute: async () => {
		const up = await uptime(Streamer);
		if (up === null) return 'Zach is not currently streaming.';
		// fetch the rating from the database.
		let ratings = await Database.get("starting_rating");
		if (ratings === undefined || ratings === null) {
			ratings = await Chess.com.ratings("thechessnerd");
			await Database.set("starting_rating", ratings);
		}
		if (ratings === undefined || ratings === null)
			return "Zach's Chess.com profile -> chess.com/member/thechessnerd";	
		return "Zach's Chess.com starting rating for this stream -> " +
		ratings.map(
			r => emojis[r.category] + ` ${r.category} ${r.rating}`
		).join(", ") + '.';
	}
});
