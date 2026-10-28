/**
 * Icônes SVG du design system (style trait, 24×24, héritent de la couleur
 * courante). Aucune dépendance d'icônes : chaque icône est un petit composant.
 * Toutes acceptent `className` (ex. la classe utilitaire `.icon`, 18 px).
 */

export interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

function base(props: IconProps, children: React.ReactNode) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={props.className}
      style={props.style}
    >
      {children}
    </svg>
  );
}

export function IconSearch(props: IconProps) {
  return base(props, <>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </>);
}

export function IconBell(props: IconProps) {
  return base(props, <>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </>);
}

export function IconPlus(props: IconProps) {
  return base(props, <>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </>);
}

export function IconArrowLeft(props: IconProps) {
  return base(props, <>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </>);
}

export function IconChevronRight(props: IconProps) {
  return base(props, <polyline points="9 18 15 12 9 6" />);
}

export function IconCheck(props: IconProps) {
  return base(props, <polyline points="20 6 9 17 4 12" />);
}

export function IconExternal(props: IconProps) {
  return base(props, <>
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </>);
}

export function IconLogOut(props: IconProps) {
  return base(props, <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </>);
}

/* ----- Icônes d'espaces (barre latérale) ----- */

export function IconHome(props: IconProps) {
  return base(props, <>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </>);
}

export function IconMessages(props: IconProps) {
  return base(props, <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />);
}

export function IconHelp(props: IconProps) {
  return base(props, <>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </>);
}

export function IconTrendingUp(props: IconProps) {
  return base(props, <>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </>);
}

export function IconBuilding(props: IconProps) {
  return base(props, <>
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01" />
  </>);
}

export function IconPercent(props: IconProps) {
  return base(props, <>
    <line x1="19" y1="5" x2="5" y2="19" />
    <circle cx="6.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </>);
}

export function IconUmbrella(props: IconProps) {
  return base(props, <>
    <path d="M22 12a10 10 0 0 0-20 0z" />
    <path d="M12 12v8a2 2 0 0 0 4 0" />
    <path d="M12 2v1" />
  </>);
}

export function IconGlobe(props: IconProps) {
  return base(props, <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </>);
}

export function IconWallet(props: IconProps) {
  return base(props, <>
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </>);
}

export function IconShield(props: IconProps) {
  return base(props, <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />);
}

export function IconUsers(props: IconProps) {
  return base(props, <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>);
}

export function IconCoins(props: IconProps) {
  return base(props, <>
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
    <path d="m16.71 13.88.7.71-2.82 2.82" />
  </>);
}

export function IconCreditCard(props: IconProps) {
  return base(props, <>
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </>);
}

export function IconCoffee(props: IconProps) {
  return base(props, <>
    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
    <line x1="6" y1="2" x2="6" y2="4" />
    <line x1="10" y1="2" x2="10" y2="4" />
    <line x1="14" y1="2" x2="14" y2="4" />
  </>);
}

export function IconCalendar(props: IconProps) {
  return base(props, <>
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </>);
}

export function IconTrophy(props: IconProps) {
  return base(props, <>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </>);
}

export function IconHeart(props: IconProps) {
  return base(props, <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />);
}

export function IconPen(props: IconProps) {
  return base(props, <>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </>);
}
