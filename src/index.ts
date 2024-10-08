import { getFollowers } from '@/services/warpcast/get-followers';
import { User } from '@/services/warpcast/types';
import { getCache, setCache } from './cache';
import { env } from './config';
import { logger } from './logger';
import { getMe } from './services/warpcast/get-me';

// Constants
const CACHE_MAX_AGE_MS = 86400 * 1000; // 1 day in milliseconds

// Log environment information using structured logging
logger.info({ baseUrl: env.WARPCAST_BASE_URL }, 'Warpcast Base URL');
if (env.NODE_ENV !== 'production') {
  logger.info({ accessToken: env.WARPCAST_ACCESS_TOKEN }, 'Using Access Token');
} else {
  logger.info('Access token is set');
}
logger.info({ mode: env.NODE_ENV }, 'Application running mode');

// Example of handling some application logic with caching
void (async () => {
  try {
    // Attempt to get cached user data
    let user = await getCache<User>('me', CACHE_MAX_AGE_MS);

    if (user) {
      logger.info('User fetched from cache');
    } else {
      // Fetch the user if not in cache
      const response = await getMe(env);
      user = response.user;
      // Cache the result
      await setCache('me', user);
      logger.info({ user }, 'getMe function executed and cached successfully');
    }

    // Assuming that user will not be null at this point.
    // Fetch followers and use caching as well
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    let users = await getCache<User[]>(`followers_${user.fid}`, CACHE_MAX_AGE_MS);

    if (users) {
      logger.info('Followers fetched from cache');
    } else {
      // Fetch the followers if not in cache
      const response = await getFollowers(env, user.fid);
      users = response.users;
      // Cache the result
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      await setCache(`followers_${user.fid}`, users);
      logger.info(
        { users },
        'getFollowers function executed and cached successfully'
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error(
        { message: error.message, stack: error.stack },
        'Error executing async function'
      );
    } else {
      logger.error({ error }, 'Unknown error occurred');
    }
  }
})();
