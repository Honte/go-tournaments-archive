import nextConfig from 'eslint-config-next';

export default [
  ...nextConfig,
  {
    rules: {
      curly: ['error', 'all'],
      'import/no-anonymous-default-export': 'off',
      '@next/next/no-img-element': 'off',
    },
  },
];
