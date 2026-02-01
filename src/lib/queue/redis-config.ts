import type { RedisOptions} from "ioredis";

/**
 * Redis connection configuration for BullMQ
 * Returns options object instead of client instant to avoid version conflicts
 */
export function getRedisConfig(): RedisOptions {
    return {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        retryStrategy: (times) => {
            // Exponential backoff: 50ms, 100ms, 200ms, 400ms, max 3000ms
            const delay = Math.min(times * 50, 3000);
            return delay;
        },
    };
}

/**
 * Test Redis connection
 * Useful for health checks during startup
 */
export async function testRedisConnection(): Promise<boolean> {
   try {
       const Redis = (await import('ioredis')).default;
       const client = new Redis(getRedisConfig());

       const result = await client.ping();
       await client.quit();

       return result === 'PONG';
   } catch ( error ) {
       console.error('Redis connection test failed:', error);
       return false;
   }
}