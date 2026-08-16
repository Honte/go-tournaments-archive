import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);

export async function getChangedFiles(base: string): Promise<string[]> {
  try {
    await execFile('git', ['rev-parse', '--verify', `${base}^{commit}`]);
  } catch {
    throw new Error(`Cannot resolve base revision "${base}". Fetch more history or pass --base <git-revision>.`);
  }

  const { stdout } = await execFile('git', ['diff', '--name-only', '--no-renames', base, 'HEAD']);

  return stdout
    .split('\n')
    .map((file) => file.trim())
    .filter(Boolean);
}
