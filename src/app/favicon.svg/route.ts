import { loadDefaultEvent } from '@/events';
import { createFaviconRoute } from '@/libs/icons';

export const dynamic = 'force-static';
export const GET = async () => createFaviconRoute(await loadDefaultEvent());
