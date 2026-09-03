import { LuArrowRight } from 'react-icons/lu';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { allPlayersStatsUrl } from '@/libs/urls';
import { Button } from '@/components/ui/Button';

type AllPlayersStatsLinkProps = {
  event: EventContext;
  translations: Translations;
};

export function AllPlayersStatsLink({ event, translations }: AllPlayersStatsLinkProps) {
  const t = getTranslator(translations);

  return (
    <p className="mt-4 flex justify-center">
      <Button
        href={allPlayersStatsUrl(event, translations.locale)}
        className="group text-sm"
        icon={<LuArrowRight className="transition-transform group-hover:translate-x-0.5" />}
      >
        {t('stats.goToAllPlayersStats')}
      </Button>
    </p>
  );
}
