import type { StaticImageData } from 'next/image';

export async function loadEventBackground(eventId: string): Promise<StaticImageData | undefined> {
  for (const extension of ['png', 'jpg']) {
    try {
      const image = (await import(`../../events/${eventId}/background.${extension}`)) as { default: StaticImageData };

      return image.default;
    } catch (error) {
      if (!(error instanceof Error && 'code' in error && error.code === 'MODULE_NOT_FOUND')) {
        throw error;
      }
    }
  }
}
