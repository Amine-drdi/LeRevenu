import { avatarOf } from '@/lib/avatar';

/**
 * Avatar coloré (initiales) — Server ou Client Component sans état.
 * La couleur est déterministe (hash du pseudo) : stable d'un rendu à l'autre.
 */
export default function Avatar({
  username,
  size,
}: {
  username: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const { initials, cls } = avatarOf(username);
  return (
    <span className={`av ${size ?? ''} ${cls}`.trim()} aria-hidden="true">
      {initials}
    </span>
  );
}
