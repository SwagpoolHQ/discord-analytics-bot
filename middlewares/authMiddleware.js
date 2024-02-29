import { lucia } from '../lucia/auth.js';
import debug from "../utils/debug.js";

export default async function authMiddleware (req, res, next) {

		const sessionId = lucia.readSessionCookie(req.headers.cookie ?? "");
		debug('sessionId = ',sessionId);
		if (!sessionId) {
			res.locals.user = {};
			res.locals.session = null;
			return next();
		}
	
		const { session, user } = await lucia.validateSession(sessionId);
	
		if (session && session.fresh) {
			res.appendHeader("Set-Cookie", lucia.createSessionCookie(session.id).serialize());
		}
		if (!session) {
			res.appendHeader("Set-Cookie", lucia.createBlankSessionCookie().serialize());
		}
		res.locals.session = session;
		res.locals.user = user;
		return next();

};
