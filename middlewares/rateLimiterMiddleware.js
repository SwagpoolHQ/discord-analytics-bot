import { RateLimiterMemory } from "rate-limiter-flexible";
import debug from "../mongodb/utils/debug.js";

const opts = {
  points: 8, // 3 points
  duration: 3, // Per 3second
}

const rateLimiter = new RateLimiterMemory(opts);

  
export default async function rateLimiterMiddleware (req, res, next) {

  //Both Promise resolve and reject return object of RateLimiterRes class if there is no any error. 
  try {
    const rateLimiterRes = await rateLimiter.consume(req.ip, 2) // consume 2 points
    debug('Accepted request', rateLimiterRes);
    // Allowed - 2 points consumed
    next();

    // ADD to res headers
    const headers = {
      "Retry-After": rateLimiterRes.msBeforeNext / 1000, // Number of milliseconds before next action can be done
      "X-RateLimit-Limit": opts.points, // Number of remaining points in current duration 
      "X-RateLimit-Remaining": rateLimiterRes.remainingPoints, // Number of consumed points in current duration
      "X-RateLimit-Reset": new Date(Date.now() + rateLimiterRes.msBeforeNext) // action is first in current duration 
    }
  } catch (rateLimiterRes) {
    // Blocked - Not enough points to consume
    debug('Too Many Requests', rateLimiterRes);
    res.status(429).send('Too Many Requests');

    // ADD to res headers
    const headers = {
      "Retry-After": rateLimiterRes.msBeforeNext / 1000, // Number of milliseconds before next action can be done
      "X-RateLimit-Limit": opts.points, // Number of remaining points in current duration 
      "X-RateLimit-Remaining": rateLimiterRes.remainingPoints, // Number of consumed points in current duration
      "X-RateLimit-Reset": new Date(Date.now() + rateLimiterRes.msBeforeNext) // action is first in current duration 
    }
  }
}