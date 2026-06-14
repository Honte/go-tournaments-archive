import { loadDefaultEvent } from '@/events';
import { buildAssets } from '@tools/assets/build';

await buildAssets(await loadDefaultEvent());
