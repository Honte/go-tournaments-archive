import { loadDefaultEvent } from '@/events';
import { createAppleIconRoute } from '@/libs/icons';

export const dynamic = 'force-static';
export const GET = async () => createAppleIconRoute(await loadDefaultEvent());
