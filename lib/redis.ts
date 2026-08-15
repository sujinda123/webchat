// lib/redis.ts
import { Redis } from 'ioredis';

const redisClientSingleton = () => {
  // During build time, process.env.REDIS_URL might not be present.
  // Return a dummy or check safely if you are in a build step.
  if (!process.env.REDIS_URL) {
    if (process.env.NODE_ENV === 'production') {
      // In production runtime, throw the error if it's truly missing
      throw new Error('REDIS_URL environment variable is missing');
    }
    // Return a mock or allow fallback during build compilation
    return {} as Redis; 
  }
  return new Redis(process.env.REDIS_URL);
};

declare const globalThis: {
  redisGlobal: ReturnType<typeof redisClientSingleton>;
} & typeof global;

export const redis = globalThis.redisGlobal ?? redisClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.redisGlobal = redis;
