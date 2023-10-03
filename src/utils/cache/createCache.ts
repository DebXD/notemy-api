import { JsonObject } from "@prisma/client/runtime/library";
import getRedisClient from "../redisClient";

const redis = getRedisClient();
export async function cacheApiResponse(key: string, data: any) {
  // Convert the data to a JSON string
  const json = JSON.stringify(data);
  if (redis) {
    await redis.set(key, json, "EX", 3600);
  }
  return true;
  // Store the JSON string in Redis with an expiration of 1 hour (3600 seconds)
}
