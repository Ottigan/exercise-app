export { };

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      GITHUB_ID: string;
      GITHUB_SECRET: string;
    }
  }
}
