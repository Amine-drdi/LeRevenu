import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';

import {
  IconBuilding,
  IconCoffee,
  IconCoins,
  IconCreditCard,
  IconExternal,
  IconGlobe,
  IconHelp,
  IconHome,
  IconMessages,
  IconPercent,
  IconShield,
  IconTrendingUp,
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

/**
 * Navigation latérale (Server Component) : accueil + espaces de discussion.
 * Chaque espace est un filtre de la liste (paramètre `?categorie=`, le
 * filtrage est exécuté côté Strapi) avec son icône colorée.
 */
export default function SideNav({
  categories,
  active,
}: {
  categories: Category[];
  active?: string;
}) {
  return (
    <nav className="side" aria-label="Espaces de discussion">
      <Link href="/" className={`nav-link ${!active ? 'on' : ''}`}>
        <IconHome className="icon" />
        Accueil
      </Link>

      <p className="nav-title">Espaces</p>
      {categories.map((category) => {
        const style = SPACE_STYLE[category.slug] ?? FALLBACK;
        return (
          <Link
            key={category.documentId}
            href={`/?categorie=${encodeURIComponent(category.slug)}`}
            className={`nav-link ${active === category.slug ? 'on' : ''}`}
            title={category.description ?? category.name}
          >
            <span className="sp-ic" style={{ '--c': style.c } as CSSProperties}>
              {style.icon({ className: 'icon' })}
            </span>
            {category.name}
          </Link>
        );
      })}

      <p className="nav-title">Aide</p>
      <Link href="/discussions/nouvelle" className="nav-link">
        <IconHelp className="icon" />
        Poser une question
      </Link>
      <a
        href="https://www.lerevenu.com"
        className="nav-link nav-foot"
        target="_blank"
        rel="noreferrer"
      >
        lerevenu.com
        <IconExternal className="icon ext" />
      </a>
    </nav>
  );
}
