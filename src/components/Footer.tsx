import { FaGithub } from 'react-icons/fa';
import { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { formatDate } from '@/libs/dates';
import { ExternalLink } from '@/components/ui/ExternalLink';

const REPOSITORY_URL = 'https://github.com/Honte/go-tournaments-archive';

export function Footer({ translations }: { translations: Translations }) {
  const generationTime = new Date();
  const t = getTranslator(translations);

  return (
    <footer className="xs:flex items-center bg-event-gray p-3 mt-3 text-event-light">
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
    </footer>
  );
}
