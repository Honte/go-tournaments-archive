import { loadEventBackground } from '@/data/background';

type HeroBackgroundProps = {
  eventId: string;
};

export async function HeroBackground({ eventId }: HeroBackgroundProps) {
  const background = await loadEventBackground(eventId);

  if (!background) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute inset-y-0 right-0 w-full max-w-5xl bg-cover bg-[position:70%_center] opacity-45 md:opacity-70 [[data-theme=dark]_&]:opacity-35 md:[[data-theme=dark]_&]:opacity-60"
      style={{
        backgroundImage: `url("${background.src}")`,
        maskImage:
          'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent), linear-gradient(to right, transparent 4%, black 45%, black 85%, transparent), radial-gradient(ellipse at 68% 45%, black 25%, transparent 85%)',
        maskComposite: 'intersect',
      }}
      aria-hidden="true"
    />
  );
}
