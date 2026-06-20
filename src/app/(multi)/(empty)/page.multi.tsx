import Link from 'next/link';
import type { EventContext, EventScope } from '@/schema/event';
import { loadAllEvents } from '@/events';
import type { Locale } from '@/i18n/consts';
import { loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { homeUrl, logoBlackUrl } from '@/libs/urls';
import { H2 } from '@/components/ui/H2';

const EVENT_DISPLAY_ORDER = [
  'wagc',
  'kpmc',
  'egc',
  'epc',
  'esgc',
  'ewgc',
  'eygc',
  'pgc',
  'pwgc',
  'pygc',
  'pagc',
  'iegc',
  'hrgc',
  'wgl',
];

const EVENT_DISPLAY_ORDER_INDEX = new Map(EVENT_DISPLAY_ORDER.map((eventId, index) => [eventId, index]));

const SCOPE_LABELS: Record<EventScope, string> = {
  global: 'Global',
  european: 'European',
  national: 'National',
  local: 'Local',
};

type EventCard = {
  event: EventContext;
  locale: Locale;
  name: string;
};

type EventCardGroup = {
  scope: EventScope;
  cards: EventCard[];
};

export default async function Page() {
  const events = await loadAllEvents();
  const cards = (
    await Promise.all(
      events.map(async (event) => {
        const locale = event.locales.includes('en') ? 'en' : event.locales[0];
        const translations = await loadTranslations(event, locale);
        const t = getTranslator(translations);

        return {
          event,
          locale,
          name: t('site.name'),
        };
      })
    )
  ).toSorted(compareEventCards);
  const groups = groupCards(cards);

  return (
    <main className="flex-1 w-full">
      <div className="mx-auto flex w-full max-w-(--breakpoint-2xl) flex-col gap-8 p-4 sm:p-6">
        <h1 className="text-2xl md:text-4xl text-center font-bold">Go Tournament Archives</h1>
        {groups.map(({ scope, cards }) => (
          <section key={scope} className="flex flex-col gap-3">
            <H2>{SCOPE_LABELS[scope]}</H2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {cards.map(({ event, name }) => (
                <article key={event.id} className="flex min-h-52 flex-col rounded-md border border-event-soft bg-white">
                  <Link
                    href={homeUrl(event, event.locales[0])}
                    className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-4 p-6 text-center hover:bg-event-bg"
                  >
                    <img src={logoBlackUrl(event)} alt="" className="h-16 w-full max-w-48 object-contain" />
                    <h3 className="text-base font-bold leading-snug">{name}</h3>
                  </Link>
                  <nav className="flex items-center justify-center gap-2 border-t border-event-soft p-3">
                    {event.locales.map((locale) => (
                      <Link
                        key={locale}
                        href={homeUrl(event, locale)}
                        className="min-w-10 rounded-sm bg-event-bg px-3 py-1 text-center text-sm font-bold hover:bg-event-soft"
                      >
                        {locale.toUpperCase()}
                      </Link>
                    ))}
                  </nav>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

function compareEventCards(a: EventCard, b: EventCard) {
  const order = getEventDisplayOrder(a.event.id) - getEventDisplayOrder(b.event.id);

  if (order) {
    return order;
  }

  return a.event.id.localeCompare(b.event.id);
}

function getEventDisplayOrder(eventId: string) {
  return EVENT_DISPLAY_ORDER_INDEX.get(eventId) ?? Number.MAX_SAFE_INTEGER;
}

function groupCards(cards: EventCard[]): EventCardGroup[] {
  const groups: EventCardGroup[] = [];
  const cardsByScope = new Map<EventScope, EventCard[]>();

  for (const card of cards) {
    let groupCards = cardsByScope.get(card.event.scope);

    if (!groupCards) {
      groupCards = [];
      cardsByScope.set(card.event.scope, groupCards);
      groups.push({ scope: card.event.scope, cards: groupCards });
    }

    groupCards.push(card);
  }

  return groups;
}
