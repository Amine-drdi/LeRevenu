import Header from '@/components/Header';
import RsvpButton from '@/components/RsvpButton';
import SideNav from '@/components/SideNav';
import { getCategories, getEvents } from '@/lib/api';

export const metadata = { title: 'Événements — Le Revenu' };
/** Données vivantes : rendu à la demande (pas de pré-rendu au build). */
export const dynamic = 'force-dynamic';

const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

/**
 * Événements « Le Revenu répond » (Server Component) — lecture publique,
 * RSVP en un clic pour les membres connectés (RsvpButton, Client Component).
 */
export default async function EvenementsPage() {
  const [categories, events] = await Promise.all([getCategories(), getEvents()]);
  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.at) >= now);
  const past = events.filter((e) => new Date(e.at) < now).slice(0, 3);

  const card = (event: (typeof events)[number]) => {
    const at = new Date(event.at);
    return (
      <article key={event.documentId} className="rounded-card border border-hairline bg-surface p-[18px] shadow-card">
        <div className="flex items-start gap-4">
          <div className="grid w-[58px] flex-none place-items-center rounded-ctl bg-brand-soft py-2 leading-none text-brand-text" aria-hidden="true">
            <span className="block font-display text-[22px] font-extrabold">{at.getDate()}</span>
            <span className="block text-[10.5px] font-bold uppercase tracking-[0.05em]">{MONTHS[at.getMonth()]}</span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <h2 className="font-display text-[17px] font-bold tracking-[-0.01em]">{event.title}</h2>
            <p className="flex flex-wrap items-center gap-2 text-[12.5px] text-ink-3">
              <span>{at.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
              {event.host && <span>· animé par {event.host}</span>}
              {event.category && (
                <span className="inline-flex h-[22px] items-center gap-[5px] whitespace-nowrap rounded-full border border-hairline px-[9px] text-[11.5px] font-medium text-ink-3">
                  {event.category.name}
                </span>
              )}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2.5">
              <RsvpButton
                eventDocumentId={event.documentId}
                initialGoing={!!event.me}
                initialCount={event.participants ?? 0}
              />
            </div>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div>
      <Header />
      <div className="wrap">
        <div className="grid items-start gap-7 pb-24 pt-6 min-[1100px]:grid-cols-[212px_minmax(0,1fr)]">
          <SideNav categories={categories} activeSection="evenements" />
          <main className="flex min-w-0 flex-col gap-[18px]">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-[28px] font-bold tracking-[-0.015em]">Événements</h1>
                <p className="mt-0.5 text-sm text-ink-3">
                  Webinaires et ateliers animés par la rédaction et ses experts.
                </p>
              </div>
            </div>
            {upcoming.length === 0 ? (
              <div className="rounded-card border-[1.5px] border-dashed border-line-strong bg-surface/50 p-11 text-center text-sm text-ink-3">
                <p className="mb-1 font-display text-lg font-bold text-ink">Aucun événement à venir</p>
                <p>Les prochains rendez-vous seront annoncés ici.</p>
              </div>
            ) : (
              upcoming.map(card)
            )}
            {past.length > 0 && (
              <>
                <h2 className="mt-3 font-display text-[21px] font-bold tracking-[-0.01em]">
                  Récemment passés
                </h2>
                {past.map(card)}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
