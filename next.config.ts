import { BASE_PATH, EVENT, IS_DEVELOPMENT } from '@/env';

const pageExtensions = ['tsx', 'ts'];

if (EVENT) {
  pageExtensions.push('single.tsx', 'single.ts');
} else {
  pageExtensions.push('multi.tsx', 'multi.ts');
}

if (IS_DEVELOPMENT) {
  pageExtensions.push('dev.tsx', 'dev.ts');

  if (EVENT) {
    pageExtensions.push('single.dev.tsx', 'single.dev.ts');
  } else {
    pageExtensions.push('multi.dev.tsx', 'multi.dev.ts');
  }
}

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

  pageExtensions,
};
