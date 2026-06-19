import { loadDefaultEvent } from '@/events';
import { serveLogo } from '@/routes/icons';

export const dynamic = 'force-static';

export async function GET() {
  return serveLogo(await loadDefaultEvent(), 'black');
}
