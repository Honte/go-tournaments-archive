declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'test' | 'production';
      BASE_PATH?: string;
    }
  }
}

export {};
