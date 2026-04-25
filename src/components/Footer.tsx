import { FaGithub } from 'react-icons/fa';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { formatDate } from '@/libs/dates';
import { ExternalLink } from '@/components/ui/ExternalLink';

const REPOSITORY_URL = 'https://github.com/Honte/go-tournaments-archive';

export function Footer({ translations }: { translations: Translations }) {
  const generationTime = new Date();
  const t = getTranslator(translations);

  return (
    <footer className="bg-event-gray text-event-light mt-3">
      <div className="container mx-auto max-w-(--breakpoint-2xl) xs:flex items-center p-3">
        <p>
          <ExternalLink url="https://honte.pl" className="text-event-light hover:text-event-light">
            Honte
          </ExternalLink>{' '}
          &copy; {generationTime.getFullYear()}
        </p>
        <p className="ml-auto text-xs flex items-center gap-2">
          {t('site.lastUpdated', formatDate(generationTime, translations.locale))}
          <ExternalLink
            url={REPOSITORY_URL}
            title={t('site.github', REPOSITORY_URL)}
            className="text-white hover:text-black"
          >
            <FaGithub />
          </ExternalLink>
        </p>
      </div>
    </footer>
  );
}
