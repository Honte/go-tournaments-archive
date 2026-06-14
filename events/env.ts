import { normalizeBasePath } from '../src/libs/basePath'; // avoid alias imports for node

export const EVENT = process.env.EVENT || 'pgc';
export const BASE_PATH = normalizeBasePath(process.env.BASE_PATH);
