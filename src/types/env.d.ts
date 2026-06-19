declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'test' | 'production';
      EVENT?: string;
      BASE_PATH?: string;
    }
  }
}

export {};
