import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';

import {
  IconBuilding,
  IconCalendar,
  IconCoffee,
  IconCoins,
  IconCreditCard,
  IconExternal,
  IconGlobe,
  IconHelp,
  IconHome,
  IconMessages,
  IconPen,
  IconPercent,
  IconShield,
  IconTrendingUp,
  IconTrophy,
  IconUmbrella,
  IconUsers,
  IconWallet,
  type IconProps,
} from '@/components/icons';
import type { Category } from '@/types';

/** Icône et couleur par slug d'espace (déterministes, charte Le Revenu). */
const SPACE_STYLE: Record<string, { icon: (p: IconProps) => ReactNode; c: string }> = {
  bourse: { icon: (p) => <IconTrendingUp {...p} />, c: '#0a7f99' },
  crypto: { icon: (p) => <IconCoins {...p} />, c: '#5856d6' },
  immobilier: { icon: (p) => <IconBuilding {...p} />, c: '#c93400' },
  fiscalite: { icon: (p) => <IconPercent {...p} />, c: '#1a8a4a' },
  retraite: { icon: (p) => <IconUmbrella {...p} />, c: '#d30f45' },
  'macro-economie': { icon: (p) => <IconGlobe {...p} />, c: '#6e6e73' },
  epargne: { icon: (p) => <IconWallet {...p} />, c: '#0a66d8' },
  'assurance-vie': { icon: (p) => <IconShield {...p} />, c: '#c9a032' },
  transmission: { icon: (p) => <IconUsers {...p} />, c: '#7a4bc9' },
  alternatifs: { icon: (p) => <IconCoins {...p} />, c: '#b8860b' },
  budget: { icon: (p) => <IconCreditCard {...p} />, c: '#0a7f99' },
  cafe: { icon: (p) => <IconCoffee {...p} />, c: '#d30f45' },
};

const FALLBACK = { icon: (p: IconProps) => <IconMessages {...p} />, c: '#6e6e73' };

const NAV_LINK =
  'flex cursor-pointer items-center gap-[11px] rounded-ctl px-2.5 py-[7px] text-sm font-medium text-ink-2 transition hover:bg-fill hover:text-ink';
const NAV_ON = 'bg-fill-2 font-semibold text-ink';
const NAV_TITLE = 'px-2.5 pb-1.5 pt-[18px] text-[11.5px] font-semibold text-ink-3 max-[1099px]:hidden';

/**
 * Navigation latérale (Server Component) : accueil + espaces de discussion
 * (filtres `?categorie=`, exécutés côté Strapi) + section Communauté.
 * Sous 1100 px la barre passe en rangée horizontale défilante.
 */
export default function SideNav({
  categories,
  active,
  activeSection,
}: {
  categories: Category[];
  active?: string;
  activeSection?: string;
}) {
  const link = (href: string, label: string, icon: ReactNode, isOn: boolean) => (
    <Link
      key={href}
      href={href}
      className={`${NAV_LINK} ${isOn ? NAV_ON : ''} max-[1099px]:flex-none max-[1099px]:border max-[1099px]:border-hairline max-[1099px]:bg-surface ${
        isOn ? 'max-[1099px]:border-transparent max-[1099px]:bg-brand max-[1099px]:text-white' : ''
      }`}
    >
      {icon}
      {label}
    </Link>
  );

  return (
    <nav
      className="top-[86px] flex flex-col gap-0.5 max-[1099px]:flex-row max-[1099px]:items-center max-[1099px]:gap-2 max-[1099px]:overflow-x-auto max-[1099px]:pb-1 min-[1100px]:sticky"
      aria-label="Espaces de discussion"
    >
      {link('/', 'Accueil', <IconHome className={`icon ${!active && !activeSection ? 'text-brand-text max-[1099px]:text-current' : ''}`} />, !active && !activeSection)}

      <p className={NAV_TITLE}>Espaces</p>
      {categories.map((category) => {
        const style = SPACE_STYLE[category.slug] ?? FALLBACK;
        return link(
          `/?categorie=${encodeURIComponent(category.slug)}`,
          category.name,
          <span className="sp-ic" style={{ '--c': style.c } as CSSProperties}>
            {style.icon({ className: 'icon' })}
          </span>,
          active === category.slug
        );
      })}

      <p className={NAV_TITLE}>Communauté</p>
      {link('/evenements', 'Événements', <IconCalendar className={`icon ${activeSection === 'evenements' ? 'text-brand-text max-[1099px]:text-current' : ''}`} />, activeSection === 'evenements')}
      {link('/blog', 'Blog', <IconPen className={`icon ${activeSection === 'blog' ? 'text-brand-text max-[1099px]:text-current' : ''}`} />, activeSection === 'blog')}
      {link('/classement', 'Classement', <IconTrophy className={`icon ${activeSection === 'classement' ? 'text-brand-text max-[1099px]:text-current' : ''}`} />, activeSection === 'classement')}

      <p className={NAV_TITLE}>Aide</p>
      {link('/discussions/nouvelle', 'Poser une question', <IconHelp className="icon" />, false)}
      <a
        href="https://www.lerevenu.com"
        className={`${NAV_LINK} mt-[18px] border-t border-hairline pt-3 text-[13px] text-ink-3 hover:text-brand-text max-[1099px]:hidden`}
        target="_blank"
        rel="noreferrer"
      >
        lerevenu.com
        <IconExternal className="ml-auto h-[13px] w-[13px]" />
      </a>
    </nav>
  );
}
