import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { parseArgs } from 'node:util';

const PLACEHOLDER = "'__DEPLOY_TOKEN__'";

const { values: params } = parseArgs({
  options: {
    source: { type: 'string' },
    target: { type: 'string' },
  },
  strict: true,
});

const source = requireParam(params, 'source');
const target = requireParam(params, 'target');
const token = process.env.DEPLOY_TOKEN;

if (!token) {
  throw new Error('DEPLOY_TOKEN is required.');
}

const phpString = `'${token.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;
const sourceCode = readFileSync(source, 'utf8');
const output = sourceCode.replace(PLACEHOLDER, phpString);

if (output === sourceCode) {
  throw new Error('Deploy token placeholder was not found.');
}

mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, output);

function requireParam(params, name) {
  if (!params[name]) {
    throw new Error(`Missing required --${name} parameter.`);
  }

  return params[name];
}
