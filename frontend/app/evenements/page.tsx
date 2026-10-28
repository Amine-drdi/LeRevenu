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
      <article key={event.documentId} className="card">
        <div className="ev">
          <div className="ev-date" aria-hidden="true">
            <span className="ev-day">{at.getDate()}</span>
            <span className="ev-mon">{MONTHS[at.getMonth()]}</span>
          </div>
          <div className="ev-body">
            <h2 className="ev-t">{event.title}</h2>
            <p className="ev-m">
              <span>
                {at.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
              {event.host && <span>· animé par {event.host}</span>}
              {event.category && <span className="chip chip-cat">{event.category.name}</span>}
            </p>
            <div className="ev-f">
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
        <div className="layout no-right">
          <SideNav categories={categories} activeSection="evenements" />
          <main className="main">
            <div className="page-head">
              <div>
                <h1 className="page-title">Événements</h1>
                <p className="page-sub">
                  Webinaires et ateliers animés par la rédaction et ses experts.
                </p>
              </div>
            </div>
            {upcoming.length === 0 ? (
              <div className="empty">
                <p className="t">Aucun événement à venir</p>
                <p>Les prochains rendez-vous seront annoncés ici.</p>
              </div>
            ) : (
              upcoming.map(card)
            )}
            {past.length > 0 && (
              <>
                <h2 className="sec-title" style={{ marginTop: 12 }}>
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
