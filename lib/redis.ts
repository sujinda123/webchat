import { Redis } from "ioredis";

const redisClientSingleton = () => {
  if (!process.env.REDIS_URL) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("REDIS_URL environment variable is missing");
    }
    return {} as Redis;
  }
  return new Redis(process.env.REDIS_URL);
};

declare const globalThis: {
  redisGlobal: ReturnType<typeof redisClientSingleton>;
} & typeof global;

export const redis = globalThis.redisGlobal ?? redisClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.redisGlobal = redis;

//
export const redisPub = redis.duplicate();
export default redis;
