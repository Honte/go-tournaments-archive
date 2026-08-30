import { networkInterfaces } from 'node:os';
import { normalizeBasePath } from '@/libs/urls';
import { getEventConfigurations, IS_DEVELOPMENT, loadConfiguration } from '@/configuration';

export default async function getConfig() {
  const configuration = await loadConfiguration();
  const eventConfigurations = getEventConfigurations(configuration);
  const basePath = normalizeBasePath(configuration.basePath);
  const totalEvents = eventConfigurations.length;
  const pageExtensions = ['tsx', 'ts'];

  if (totalEvents === 1) {
    pageExtensions.push('single.tsx', 'single.ts');
  } else {
    pageExtensions.push('multi.tsx', 'multi.ts');
  }

  if (IS_DEVELOPMENT) {
    pageExtensions.push('dev.tsx', 'dev.ts');

    if (totalEvents === 1) {
      pageExtensions.push('single.dev.tsx', 'single.dev.ts');
    } else {
      pageExtensions.push('multi.dev.tsx', 'multi.dev.ts');
    }
  }

  return {
    output: configuration.dynamic ? 'standalone' : 'export',
    basePath,
    env: {
      VERSION: process.env.VERSION || Date.now().toString(36),
      BASE_PATH: basePath,
      ...(configuration.dynamic
        ? {
            FORCED_CONFIGURATION: JSON.stringify(configuration),
          }
        : {}),
    },
    pageExtensions,
    trailingSlash: configuration.trailingSlash,
    // it's weird next.js doesn't do that automatically
    allowedDevOrigins: IS_DEVELOPMENT ? getAllowedDevOrigins() : undefined,
  };
}

function getAllowedDevOrigins() {
  return Object.values(networkInterfaces()).flatMap((interfaces) =>
    (interfaces ?? []).filter(({ family, internal }) => family === 'IPv4' && !internal).map(({ address }) => address)
  );
}
