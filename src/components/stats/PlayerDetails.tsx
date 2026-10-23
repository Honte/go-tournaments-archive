import type { PlayerSummary } from '@/schema/data';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { ExternalLink } from '@/components/ui/ExternalLink';

type PlayerDetailsProps = {
  player: PlayerSummary;
  translations: Translations;
};

export function PlayerDetails({ player, translations }: PlayerDetailsProps) {
  const t = getTranslator(translations);

  if (!player.nickname?.length && !player.egd) {
    return null;
  }

  return (
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-3 text-sm text-archive-text-muted">
      {player.nickname?.length ? <span>{player.nickname.join(', ')}</span> : null}
      {player.egd && (
        <ExternalLink
          href={`https://europeangodatabase.eu/EGD/Player_Card.php?&key=${player.egd}`}
          title={t('details.goToEGD')}
        >
          {t('details.egd')}
        </ExternalLink>
      )}
    </div>
  );
}
