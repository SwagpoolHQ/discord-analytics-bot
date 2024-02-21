import { verifyRequestOrigin } from 'lucia';
import { parseCookies, serializeCookie } from "oslo/cookie";
import { nanoid } from 'nanoid'; 

export default function corsMiddleware (req, res, next) {

	const userCookieId = parseCookies(req.headers.cookie ?? "").get("id") ?? null;
	if (!userCookieId) {
		const id = nanoid(); //=> "R8_H-myT"
		res.appendHeader(
			"Set-Cookie",
			serializeCookie("id", id, {
			  path: "/",
			  secure: process.env.NODE_ENV === "production",
			  httpOnly: true,
			  maxAge: 60 * 10,
			  sameSite: "lax"
			}))
	}

	if (req.method === "GET") {
		return next();
	}
	const originHeader = req.headers.origin ?? null;
	const hostHeader = req.headers.host ?? null;
	if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
		return res.status(403).end();
	}
	return next();
};
