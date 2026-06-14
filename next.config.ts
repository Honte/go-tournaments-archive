import { BASE_PATH, EVENT } from './events/env';

/** @type {import('next').NextConfig} */
export default {
  output: 'export',
  basePath: BASE_PATH,

  // pass envs for client builds using legacy API
  // @TODO consider moving to NEXT_PUBLIC_ prefix
  env: {
    EVENT,
    BASE_PATH,
  },

  turbopack: {
    resolveAlias: {
      '@event/*': `./events/${EVENT}/*`,
    },
  },
  pageExtensions:
    process.env.NODE_ENV === 'production'
      ? ['tsx', 'ts', 'jsx', 'js']
      : ['dev.tsx', 'dev.ts', 'tsx', 'ts', 'jsx', 'js'],
};
