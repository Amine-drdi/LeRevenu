/** Initiales + classe de couleur déterministes pour un avatar coloré. */
export function avatarOf(username: string): { initials: string; cls: string } {
  const initials = username.trim().slice(0, 2) || '?';
  let hash = 0;
  for (const ch of username) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return { initials, cls: `av-${(hash % 5) + 1}` };
}
