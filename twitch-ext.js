import { verify } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

import { Database } from "./database";

// =========================================


const key = await Database.get("twitch_ext_secret");
const jwt = Buffer.from(key, 'base64');
const bearerPrefix = 'Bearer '; 

export async function verifyAndDecode (header) {
    console.log("in verify")
    if (header.startsWith(bearerPrefix)) {
      try {
        const token = header.substring(bearerPrefix.length);
        return await verify(jwt, key);
      }
      catch (ex) {
        return console.log("Invalid JWT");
      }
    }
}

// export function extMiddle(req, res, next) {
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
//     res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
//     // Note that the origin of an extension iframe will be null
//     // so the Access-Control-Allow-Origin has to be wildcard.
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     next();
// };