
import { programmable } from "../parser.js";
import { Database } from "../database.js";

programmable({
	commands: [ "video", "newvid", "newvideo" ],
	description: "Gets Zach's current video link.",
	execute: async () => "Check out Zach's new YouTube video: " +
		(await Database.get("yt_video_title")) + " -> " +
		(await Database.get("yt_video_link"))
});
