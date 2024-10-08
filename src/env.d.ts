declare global {
  namespace NodeJS {
    interface ProcessEnv {
      WARPCAST_ACCESS_TOKEN: string;
      WARPCAST_BASE_URL: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }

  // Define Env type separately for further use
  type Env = NodeJS.ProcessEnv;
}

export {}; // Makes this file a module
