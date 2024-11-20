import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Rate limit
const rateLimitMap = new Map();

// Configuration for rate limiting
const RATE_LIMIT_WINDOW_MS = 60 * 1000 * 2;
const MAX_REQUESTS = 20;

const rateLimit = asyncHandler(async (req, res, next) => {
  const ip = req.ip;
  console.log(ip);
  console.log(rateLimitMap);
  const currentTime = Date.now();

  if (!rateLimitMap.has(ip)) {
    // Add IP with initial data
    rateLimitMap.set(ip, { count: 1, firstRequestTime: currentTime });
    next();
  } else {
    const ipData = rateLimitMap.get(ip);
    const count = ipData.count;
    const timeElapsed = currentTime - ipData.firstRequestTime;

    if (timeElapsed > RATE_LIMIT_WINDOW_MS) {
      // Reset the count and timestamp for the new window
      rateLimitMap.set(ip, { count: 1, firstRequestTime: currentTime });
      next();
    } else if (count < MAX_REQUESTS) {
      // Increment the count and allow the request
      ipData.count += 1;
      rateLimitMap.set(ip, ipData);
      next();
    } else {
      throw new ApiError(429, "Too many requests, please try again later.");
    }
  }
});

export { rateLimit };
