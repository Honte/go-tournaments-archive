import { loadDefaultEvent } from '@/events';
import { serveLogo } from '@/routes/serverIcons';

export const dynamic = 'force-static';

export async function GET() {
  return serveLogo(await loadDefaultEvent(), 'white');
}
