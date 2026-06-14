import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { input, select } from '@inquirer/prompts';
import { normalizeBasePath } from '@/libs/urls';

type BasePathMode = 'empty' | 'event' | 'custom';
type BuilderState = {
  event: string;
  basePath: string;
  basePathMode: BasePathMode;
};

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EVENTS_DIR = path.join(ROOT_DIR, 'events');
const STATE_PATH = path.join(ROOT_DIR, '.builder-state.json');
const SELECT_THEME = {
  style: {
    keysHelpTip: (keys: [key: string, action: string][]) =>
      [...keys, ['Ctrl+C', 'exit'] as [string, string]].map(([key, action]) => `${key} ${action}`).join(' • '),
  },
};

try {
  const state = await promptForBuild();

  await writeState(state);
  await runBuild(state);
} catch (error) {
  if (isPromptExit(error)) {
    process.exitCode = 0;
  } else {
    throw error;
  }
}

async function promptForBuild(): Promise<BuilderState> {
  const events = await getEvents();
  const state = await readState();
  const eventIds = events.map(({ id }) => id);
  const defaultEvent = eventIds.includes(state.event ?? '') ? state.event! : eventIds[0];

  console.log('Build archive\n');

  const event = await select({
    message: 'Event:',
    choices: events.map(({ id, siteName }) => ({
      name: `${id} (${siteName})`,
      value: id,
    })),
    default: defaultEvent,
    pageSize: events.length,
    loop: true,
    theme: SELECT_THEME,
  });

  const basePathMode = await select<BasePathMode>({
    message: 'Base Path:',
    choices: [
      {
        name: '/',
        value: 'empty',
        description: 'No base path',
      },
      {
        name: `/${event}`,
        value: 'event',
      },
      {
        name: '/<custom>',
        value: 'custom',
        description: 'Select to type',
      },
    ],
    default: state?.basePathMode ?? 'empty',
    theme: SELECT_THEME,
  });

  return {
    event,
    basePathMode,
    basePath: await resolveBasePath(basePathMode, event, state?.event === event ? state.basePath : event),
  };
}

async function getEvents() {
  const entries = await readdir(EVENTS_DIR);
  const events = [];

  for (const entry of entries) {
    const eventPath = path.join(EVENTS_DIR, entry);

    if ((await stat(eventPath)).isDirectory() && existsSync(path.join(eventPath, 'config.ts'))) {
      events.push({
        id: entry,
        siteName: await getEventSiteName(entry),
      });
    }
  }

  return events.sort((a, b) => a.id.localeCompare(b.id));
}

async function getEventSiteName(event: string) {
  try {
    const content = await readFile(path.join(EVENTS_DIR, event, 'i18n', 'en.json'), 'utf-8');
    const translations = JSON.parse(content) as { site?: { name?: unknown } };

    if (typeof translations.site?.name === 'string') {
      return translations.site.name;
    }
  } catch {}

  return event;
}

async function readState(): Promise<Partial<BuilderState>> {
  try {
    return JSON.parse(await readFile(STATE_PATH, 'utf-8')) as Partial<BuilderState>;
  } catch {
    return {};
  }
}

async function writeState(state: BuilderState) {
  await writeFile(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`);
}

async function resolveBasePath(choice: BasePathMode, event: string, defaultBasePath?: string): Promise<string> {
  if (choice === 'empty') {
    return '';
  }

  if (choice === 'event') {
    return event;
  }

  return await input({
    message: 'Custom Base Path:',
    default: defaultBasePath,
    validate: (value) => {
      if (!normalizeBasePath(value)) {
        return 'Enter a non-empty base path, or choose the empty option.';
      }

      return true;
    },
  });
}

function isPromptExit(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'AbortPromptError' || error.name === 'ExitPromptError' || error.name === 'CancelPromptError')
  );
}

async function runBuild({ event, basePath }: BuilderState): Promise<void> {
  console.log(`[builder] EVENT=${event} BASE_PATH=${basePath || '(empty)'}`);

  const child = spawn('npm run build', {
    cwd: ROOT_DIR,
    env: {
      ...process.env,
      EVENT: event,
      BASE_PATH: basePath,
    },
    shell: true,
    stdio: 'inherit',
  });

  const exitCode = await new Promise<number | null>((resolve, reject) => {
    child.on('error', reject);
    child.on('close', resolve);
  });

  if (exitCode !== 0) {
    process.exitCode = exitCode ?? 1;
    throw new Error(`npm run build failed with exit code ${process.exitCode}`);
  }
}
