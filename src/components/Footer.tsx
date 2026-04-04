import { ExternalLink } from '@/components/ui/ExternalLink';

const START = 2024;

export function Footer() {
  const year = new Date().getFullYear();
  const copyright = year === START ? START : `${START} - ${year}`;

  return (
    <footer className="flex justify-center bg-event-gray py-3 mt-3 text-event-light">
      <p>
        <ExternalLink url="https://honte.pl" className="text-event-light hover:text-event-light">
          Honte
        </ExternalLink>{' '}
        &copy; {copyright}
      </p>
    </footer>
  );
}
