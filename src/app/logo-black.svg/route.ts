import { loadDefaultEvent } from '@/events';
import { createLogoRoute } from '@/libs/icons';

export const GET = async () => createLogoRoute(await loadDefaultEvent(), 'black');
export const dynamic = 'force-static';
