import { loadDefaultEvent } from '@/events';
import { createLogoRoute } from '@/libs/icons';

export const GET = async () => createLogoRoute(await loadDefaultEvent(), 'white');
export const dynamic = 'force-static';
