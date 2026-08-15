import Redis from 'ioredis';

const redisClientSingleton = () => {
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL environment variable is missing');
  }
  return new Redis(process.env.REDIS_URL);
};

declare global {
  var redisGlobal: undefined | ReturnType<typeof redisClientSingleton>;
}

export const redis = globalThis.redisGlobal ?? redisClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.redisGlobal = redis;
}
