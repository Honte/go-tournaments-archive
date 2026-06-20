import { normalizeBasePath } from './libs/urls'; // avoid alias imports for node

export const EVENT = process.env.EVENT;
export const BASE_PATH = normalizeBasePath(process.env.BASE_PATH);
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
