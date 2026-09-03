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
          'linear-gradient(to bottom, transparent, black 22%, black 75%, transparent), linear-gradient(to right, transparent 8%, black 60%, black 80%, transparent), radial-gradient(ellipse at 68% 45%, black 15%, transparent 72%)',
        maskComposite: 'intersect',
      }}
      aria-hidden="true"
    />
  );
}
