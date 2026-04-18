import EVENT from './events';

/** @type {import('next').NextConfig} */
export default {
  output: 'export',
  turbopack: {
    resolveAlias: {
      '@event': `./events/index.ts`,
      '@event/schema': `./events/schema.ts`,
      '@event/*': `./events/${EVENT}/*`,
    },
  },
  serverExternalPackages: ['@resvg/resvg-js'],
};
