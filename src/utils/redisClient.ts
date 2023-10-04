import { Redis } from "ioredis";
const host = process.env.REDIS_HOST;
const port = process.env.REDIS_PORT;
const password = process.env.REDIS_PASSWORD;
const username = process.env.REDIS_USERNAME

const getRedisClient = () => {
  if (host && port && password) {
    const redis = new Redis({
      host: host,
      port: parseInt(port),
      username: username,
      password: password,
    });
    return redis
  }
};
export default getRedisClient;
