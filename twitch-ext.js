import jwt from "jsonwebtoken";

import { Database } from "./database";

// =========================================


const key = await Database.get("twitch_ext_secret");
const secret = Buffer.from(key, 'base64');

export function verifyAndDecode (header) {
    console.log("in verify")
    if (header.startsWith(bearerPrefix)) {
      try {
        const token = header.substring(bearerPrefix.length);
        return jwt.verify(token, secret, { algorithms: ['HS256'] });
      }
      catch (ex) {
        return console.log("Invalid JWT");
      }
    }
}