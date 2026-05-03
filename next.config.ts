import EVENT from './events';
import { NORMALIZED_BASE_PATH } from './src/basePath';

/** @type {import('next').NextConfig} */
export default {
  output: 'export',
  basePath: NORMALIZED_BASE_PATH || undefined,

  // pass envs for client builds using legacy API
  // @TODO consider moving to NEXT_PUBLIC_ prefix
  env: {
    EVENT,
    BASE_PATH: NORMALIZED_BASE_PATH,
  },

  turbopack: {
    resolveAlias: {
      '@event': `./events/index.ts`,
      '@event/schema': `./events/schema.ts`,
      '@event/*': `./events/${EVENT}/*`,
    },
  },
  serverExternalPackages: ['@resvg/resvg-js'],
};
