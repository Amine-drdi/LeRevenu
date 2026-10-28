# Le Revenu — Communauté

Espace communautaire des lecteurs du Revenu : discussions, questions, sondages,
billets de blog, événements et classement des membres.

Monorepo **backend Strapi v5** (API + admin) et **frontend Next.js 15** (App Router),
base **PostgreSQL** (Supabase en cible, SQLite possible en local), interface en
**Tailwind CSS** (design system charte Le Revenu, clair/sombre automatique).

```
├── backend/                # API Strapi v5 (port 1337)
│   ├── config/             # serveur, base de données, plugins
│   ├── src/
│   │   ├── api/            # content-types + contrôleurs métier
│   │   │   ├── category/ discussion/ reply/     # cœur du forum
│   │   │   ├── blog-post/ event/ event-rsvp/    # communauté 
│   │   │   ├── follow/ like/ notification/ poll-vote/
│   │   │   └── member/     # contrôleur custom (pas de content-type dédié)
│   │   ├── bootstrap/permissions.ts  # sync idempotente des permissions U&P
│   │   ├── extensions/users-permissions/  # schéma User enrichi
│   │   ├── middlewares/    # normalisation des erreurs d'auth (403 → 401)
│   │   └── utils/community.ts  # points / niveaux / badges / notifications
│   ├── scripts/seed.ts     # seed de démonstration idempotent
│   └── tests/              # unit/ + integration/ (vitest)
├── frontend/               # Next.js 15 (port 3000)
│   ├── app/                # routes : /, /discussions/*, /blog/*, /evenements,
│   │                       # /classement, /membres/[username], /connexion
│   ├── components/         # Server & Client Components (design system)
│   ├── context/AuthContext.tsx  # session JWT (localStorage)
│   ├── lib/api.ts          # client API typé (lectures SSR + mutations)
│   ├── lib/avatar.ts       # avatar coloré déterministe
│   └── types/              # types miroir des contrats de l'API
└── package.json            # orchestration des deux sous-projets (concurrently)
```

---

## Prérequis

- **Node.js ≥ 20** et npm ≥ 10
- PostgreSQL (ou Supabase) pour un environnement réel ; 

## Installation

```bash
# À la racine : installe backend, frontend et la dépendance d'orchestration
npm install
```

## Configuration

### Backend — `backend/.env`

Copier `backend/.env.example` vers `backend/.env` et renseigner :

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | chaîne PostgreSQL (`postgresql://…`) — client `postgres` par défaut |
| `DATABASE_CLIENT` | `postgres` (défaut) ou `sqlite` |
| `DATABASE_FILENAME` | chemin du fichier SQLite (si `sqlite`, ex. `.tmp/data.db`) |
| `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET` | secrets Strapi — générer des valeurs uniques par environnement |

### Frontend — `frontend/.env.local`

Copier `frontend/.env.example` vers `frontend/.env.local` :

```
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

> Le préfixe `NEXT_PUBLIC_` embarque la valeur dans le bundle navigateur :
> **jamais** de secret dedans (le JWT transite par le header `Authorization`,
> jamais par une variable d'environnement ni une URL).

## Lancement

```bash
# Développement — backend (1337) + frontend (3000) ensemble
npm run dev

# …ou séparément
npm run dev:backend
npm run dev:frontend

# Données de démonstration (idempotent, utilise backend/.env)
npm run seed

# Production
npm run build
npm run start
```

### Comptes de démonstration (après `npm run seed`)

Mot de passe commun : `LeRevenu2026!` — `alice`, `bob`, `chloe`,
plus les comptes officiels `LaRedaction`, `Sandrine_CGP`, `Me_Garnier`.

## Scripts utiles

| Commande (racine) | Effet |
|---|---|
| `npm run dev` / `start` | les deux applications en parallèle |
| `npm run seed` | seed de démo (catégories, membres, discussions, sondages, événements, billets) |
| `npm run test` / `test:unit` / `test:integration` | vitest côté backend (dossiers `backend/tests/`) |
| `npm run ts:types` | régénère `backend/types/generated/contentTypes.d.ts` |

---

## Choix d'architecture

### Monorepo sans workspaces

Deux applications déployables séparément, orchestrées par des scripts racine
(`npm --prefix backend …` + `concurrently`). Pas de partage de code : le seul
contrat front/back est le **client API typé** (`frontend/lib/api.ts`) dont les
types (`frontend/types/`) miroient les réponses Strapi — renommer un champ côté
API casse la compilation frontend, jamais silencieusement à l'exécution.

### Backend Strapi : règles métier dans les contrôleurs, pas dans l'admin

- **Anti-usurpation** : l'auteur d'une discussion, d'une réponse ou d'un billet
  est **forcé depuis le JWT** (`ctx.state.user`) — le champ `author` d'une
  requête client est ignoré (whitelist stricte des champs acceptés).
- **Permissions en code** (`src/bootstrap/permissions.ts`) : union idempotente
  au démarrage — reproductible sur tout environnement, refus par défaut pour
  tout ce qui n'est pas listé. Public = lecture seule ; authentifié = écritures
  ciblées (créer, voter, réagir, suivre, s'inscrire à un événement…).
- **401 exacts** : un middleware normalise les refus de policy, les contrôleurs
  gardent une seconde ligne de contrôle — jamais de 403/400 ambigu côté client.
- **Gamification calculée, jamais stockée par le client** : points, niveaux et
  badges (`utils/community.ts`) sont recomptés depuis l'activité réelle
  (réponses, discussions, billets, « Utile » reçus, meilleures réponses, votes).
  La seule écriture passe par la route `member.sync` (nouveaux badges →
  notification). Impossible de s'attribuer des points par requête.
- **Notifications en écriture interne** : aucune route `create` exposée — les
  notifications sont émises par les contrôleurs (réponse, like, mention
  `@pseudo`, badge, niveau, meilleure réponse), jamais à soi-même.
- **Requêtes batchées** : les listes (discussions, billets, événements)
  enrichissent auteurs/compteurs/likes en 3-4 requêtes indépendantes de la
  taille de la page, au lieu d'une jointure par ligne.

### Frontend Next.js : SSR pour lire, client pour écrire

- **Lectures = Server Components** : fetch serveur-à-serveur vers Strapi avec
  ISR (`revalidate` 60 s + tags de cache). Le rendu initial arrive avec les
  données ; filtres, tri et pagination sont exécutés **côté Strapi** via les
  search params (aucune donnée codée en dur, aucune liste re-filtrée au client).
- **Écritures = Client Components** : login, création, votes, réactions —
  fetch navigateur avec `Authorization: Bearer` (JWT lu depuis le localStorage,
  jamais dans une variable `NEXT_PUBLIC_`). Les 401 renvoient vers
  `/connexion`.
- **Limite assumée du JWT en localStorage** : lisible par du JS (risque XSS).
  Alternative de production documentée dans le code : cookie `httpOnly` +
  route handler Next faisant proxy des appels authentifiés.
- **Design system Tailwind CSS** (imposé par le cahier des charges) : les
  utilitaires (`bg-surface`, `rounded-card`, `font-display`…) consomment des
  tokens déclarés dans `tailwind.config.ts` qui référencent les variables CSS
  de `globals.css` (`--ink`, `--surface`, `--brand-soft`…). Le thème
  clair/sombre bascule par `prefers-color-scheme` — les variables flippent,
  les utilitaires suivent, sans variante `dark:`. Seuls éléments hors
  utilitaires : les variables elles-mêmes, les dégradés dynamiques (avatars,
  icônes d'espaces via `--c`) et l'animation de skeleton.

### Modèle de données communautaire

Les likes, follows, votes et RSVP sont des **relations dédiées**
(`api::like`, `api::follow`, `api::poll-vote`, `api::event-rsvp`) — une ligne
par (membre, cible), bascule par upsert/delete, jamais de compteur déréglé.
`member` n'a **pas** de content-type : le profil public sert les données du
CT `User` enrichi (bio, titre, photo, rôles, badges) + statistiques calculées.


