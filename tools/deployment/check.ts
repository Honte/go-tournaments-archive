import { appendFile } from 'node:fs/promises';
import type { ArchiveConfiguration } from '@/schema/event';
import { readCliParams } from '@tools/cli';
import { getChangedFiles } from './utils';
import { getEventConfigurations, loadNamedConfiguration } from '@/configuration';

const { base, config } = readCliParams({
  base: { type: 'string', short: 'b', default: 'HEAD^' },
  config: { positional: true, type: 'string', short: 'c', default: process.env.CONFIG },
});

if (!config) {
  throw new Error('Configuration is required. Pass it as a positional argument or set CONFIG.');
}

const [configuration, changedFiles] = await Promise.all([loadNamedConfiguration(config), getChangedFiles(base)]);
const [canDeploy, matchingFiles] = shouldDeploy(config, configuration, changedFiles);

if (process.env.GITHUB_OUTPUT) {
  await appendFile(process.env.GITHUB_OUTPUT, `deploy_${config}=${canDeploy}\n`);
}

console.log(`${config}: ${canDeploy ? 'deploy' : 'skip'}`);

if (matchingFiles.length) {
  console.log(`Matched changes:\n${matchingFiles.map((file) => `- ${file}`).join('\n')}`);
}

function shouldDeploy(
  config: string,
  configuration: ArchiveConfiguration,
  changedFiles: readonly string[]
): [boolean, string[]] {
  const dependencies = getDeploymentDependencies(config, configuration);
  const matchingFiles = changedFiles.filter((file) => dependencies.some((dependency) => file.startsWith(dependency)));

  return [matchingFiles.length > 0, matchingFiles];
}

function getDeploymentDependencies(config: string, configuration: ArchiveConfiguration): string[] {
  const eventDirectories = getEventConfigurations(configuration).map((event) => `events/${event.id}/`);

  return ['src/', `configurations/${config}.yml`, ...new Set(eventDirectories)];
}
