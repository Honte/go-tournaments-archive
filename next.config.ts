import { normalizeBasePath } from '@/libs/urls';
import { getEventConfigurations, IS_DEVELOPMENT, loadConfiguration } from '@/configuration';

export default async function getConfig() {
  const configuration = await loadConfiguration();
  const eventConfigurations = getEventConfigurations(configuration);
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
    basePath: normalizeBasePath(configuration.basePath),
    env: configuration.dynamic
      ? {
          FORCED_CONFIGURATION: JSON.stringify(configuration),
        }
      : {},
    pageExtensions,
    trailingSlash: configuration.trailingSlash,
  };
}
