import { createClient } from 'redis';
import { environmentVariables } from './env';

export const redisClient = createClient({
  username: environmentVariables.REDIS.REDIS_USERNAME,
  password: environmentVariables.REDIS.REDIS_PASSWORD,
  socket: {
    host: environmentVariables.REDIS.REDIS_HOST,
    port: Number(environmentVariables.REDIS.REDIS_PORT),
    connectTimeout: 5000,
  },
});

redisClient.on('error', () => {
  // Error handler for Redis client
});

export const connectRedis = async () => {
  if (redisClient.isOpen) {
    return;
  }

  try {
    await redisClient.connect();
  } catch (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _error
  ) {
    // Redis connection failed, OTP features may be unavailable
  }
};
