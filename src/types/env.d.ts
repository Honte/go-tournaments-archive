declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'test' | 'production';
      SGF_URL_PREFIX: string;
    }
  }
}

export {};
