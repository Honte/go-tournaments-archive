import EVENT from './events/index.ts';

/** @type {import('next').NextConfig} */
export default {
  output: 'export',
  trailingSlash: true,
  turbopack: {
    resolveAlias: {
      '@event': `./events/index.ts`,
      '@event/schema': `./events/schema.ts`,
      '@event/*': `./events/${EVENT}/*`,
    },
  },
};
