/**
 * Seed de démonstration du forum Le Revenu.
 *
 * Crée (de façon idempotente) :
 *   - 6 catégories (Bourse, Cryptomonnaies, Immobilier, Fiscalité, Retraite, Macro-économie)
 *   - 3 utilisateurs de démo (alice, bob, chloe) — mots de passe hashés par le
 *     service users-permissions
 *   - 10 discussions (questions + discussions) avec réponses associées
 *
 * Usage : npm run seed   (utilise backend/.env — PostgreSQL en cible)
 */
import { compileStrapi, createStrapi } from '@strapi/strapi';
import { randomSuffix, slugify } from '../src/utils/slug';

const DEMO_PASSWORD = 'LeRevenu2026!'; // démo locale uniquement

const USERS = [
  { username: 'alice', email: 'alice.martin@example.test', name: 'Alice Martin' },
  { username: 'bob', email: 'bernard.petit@example.test', name: 'Bernard Petit' },
  { username: 'chloe', email: 'chloe.dubois@example.test', name: 'Chloé Dubois' },
] as const;

const CATEGORIES = [
  { name: 'Bourse', slug: 'bourse', description: 'Actions, ETF, indices et stratégies en bourse.' },
  { name: 'Cryptomonnaies', slug: 'crypto', description: 'Bitcoin, Ethereum, DeFi et actifs numériques.' },
  { name: 'Immobilier', slug: 'immobilier', description: 'Achat, location, SCPI, LMNP et gestion locative.' },
  { name: 'Fiscalité', slug: 'fiscalite', description: 'Impôts, flat tax, PEA et optimisation fiscale.' },
  { name: 'Retraite', slug: 'retraite', description: 'PER, épargne retraite et préparation du départ.' },
  { name: 'Macro-économie', slug: 'macro-economie', description: 'Taux, inflation, conjoncture et politique monétaire.' },
] as const;

const DISCUSSIONS = [
  {
    title: 'PEA ou compte-titres : que choisir en 2026 ?',
    type: 'question',
    categorySlug: 'fiscalite',
    author: 'alice',
    content:
      "Je débute en bourse et je me heurte à la question classique : PEA ou compte-titres ?\n\nMon horizon est long terme (15 ans minimum), je verse environ 300 € par mois. Le plafond du PEA ne me pose pas de problème, mais je lis partout que le compte-titres offre plus de choix (ETF étrangers notamment). Quels sont vos retours d'expérience ?",
    replies: [
      {
        author: 'bob',
        content:
          "Avec un horizon de 15 ans et des versements réguliers, le PEA est difficile à battre : exonération d'impôt sur les gains après 5 ans, prélèvements sociaux seulement. Le compte-titres ne devient intéressant que pour des titres non éligibles PEA.",
      },
      {
        author: 'chloe',
        content:
          "Complément : attention aux frais de courtier. Compare les ordres programmés, certains courtiers les facturent très cher, ce qui rogne l'avantage fiscal du PEA sur de petits versements.",
      },
    ],
  },
  {
    title: 'Mon expérience du démembrement de propriété',
    type: 'discussion',
    categorySlug: 'immobilier',
    author: 'bob',
    content:
      "Après 4 ans en démembrement sur un bien neuf (nue-propriété), je fais le point.\n\nPoints positifs : décote à l'achat réelle (environ 25 %), gestion déléguée, fiscalité allégée. Points de vigilance : illiquidité réelle si besoin d'argent, et le marché de revente de la nue-propriété reste étroit.",
    replies: [
      {
        author: 'alice',
        content:
          "Merci pour ce retour. Quelle décote avais-tu obtenue exactement, et comment as-tu choisi le promoteur ? Je regarde ce dispositif pour diversifier hors SCPI.",
      },
      {
        author: 'bob',
        content:
          "25 % sur le baromètre de l'ADIL de l'époque. Pour le promoteur : antériorité sur au moins 3 démembrements livrés, et j'ai vérifié le devenir des usufruitiers précédents.",
      },
    ],
  },
  {
    title: 'Faut-il craindre une correction du CAC 40 ?',
    type: 'question',
    categorySlug: 'bourse',
    author: 'chloe',
    content:
      "Le CAC 40 bat des records et les valorisations me semblent tendues. Je dois investir un capital important (50 k€) et j'hésite entre un investissement immédiat ou en plusieurs fois.\n\nQue feriez-vous à ma place ? Le market timing a-t-il du sens selon vous ?",
    replies: [
      {
        author: 'alice',
        content:
          "Les études sont unanimes : sur le long terme, l'investissement immédiat gagne dans environ deux tiers des cas. Mais psychologiquement, un étalement sur 6 à 12 mois est plus facile à tenir. La meilleure stratégie est celle que vous tiendrez.",
      },
      {
        author: 'bob',
        content:
          "Plutôt que le timing, regarde l'allocation : 50 k€ sur une seule bourse, c'est concentré. Un ETF world avec une poche obligations t'aiderait à dormir quelle que soit la correction.",
      },
      {
        author: 'chloe',
        content:
          "Merci à tous les deux. Je pense partir sur du fractionné sur 8 mois avec un ETF world en pivot, ça répond aux deux conseils.",
      },
    ],
  },
  {
    title: 'SCPI de rendement : mes retours après 5 ans',
    type: 'discussion',
    categorySlug: 'immobilier',
    author: 'alice',
    content:
      "Bilan de 5 ans de détention de SCPI de rendement (bureaux et commerce).\n\nTaux de distribution moyen : 4,4 % net de frais de gestion. Points clés : la liquidité via le marché de revente a été bien meilleure que prévu, mais la fiscalité en sortie reste le point noir.",
    replies: [
      {
        author: 'chloe',
        content:
          "Question : as-tu utilisé le démembrement ou la nue-propriété pour l'achat ? Et comment gères-tu la concentration géographique de tes SCPI ?",
      },
    ],
  },
  {
    title: 'Flat tax ou barème progressif pour mes dividendes ?',
    type: 'question',
    categorySlug: 'fiscalite',
    author: 'bob',
    content:
      "Première année avec des dividendes significatifs (environ 8 000 €) en compte-titres. Je découvre l'option entre prélèvement forfaitaire unique (30 %) et le barème progressif de l'impôt sur le revenu.\n\nMa TMI est à 11 %. Le choix me semble évident (barème), mais y a-t-il des pièges que je rate ?",
    replies: [
      {
        author: 'alice',
        content:
          "Avec une TMI à 11 %, le barème progressif est clairement plus favorable : 8 000 € de dividendes s'ajoutent peu à ta base imposable et les prélèvements sociaux restent dus dans les deux cas. L'option est exerçable au moment de la déclaration, tu peux simuler les deux.",
      },
    ],
  },
  {
    title: 'Immobilier locatif : les villes qui résistent en 2026',
    type: 'discussion',
    categorySlug: 'immobilier',
    author: 'chloe',
    content:
      "Après deux années de baisse sur les grandes métropoles, je constate une vraie divergence des marchés.\n\nDans mon suivi (Lyon, Nantes, Toulouse, Bordeaux), les prix semblent s'être stabilisés en début d'année, avec des délais de vente toujours longs. Qu'observez-vous sur vos marchés locaux ?",
    replies: [
      {
        author: 'bob',
        content:
          "Sur Rennes : stabilisation confirmée, mais la liquidité reste mauvaise. Les biens correctement valorisés partent en 2-3 mois, les surestimés dorment. Les taux à 3 % ont redonné du pouvoir d'achat aux primo-accédants.",
      },
      {
        author: 'alice',
        content:
          "Attention aux loyers encadrés à Paris : la rentabilité brute reste faible même avec des prix en baisse. Les villes moyennes avec universités me semblent plus robustes en cash-flow.",
      },
    ],
  },
  {
    title: 'Bitcoin ETF : quelle exposition raisonnable dans un portefeuille ?',
    type: 'question',
    categorySlug: 'crypto',
    author: 'alice',
    content:
      "Les ETF spot sur Bitcoin ont simplifié l'exposition, mais la question de l'allocation reste ouverte.\n\nJe lis des recommandations allant de 1 à 5 % du portefeuille. Au-delà de la volatilité, comment gérez-vous le rebalancement ? Une fois par an, par bandes de tolérance ?",
    replies: [
      {
        author: 'chloe',
        content:
          "1,5 % chez moi, rebalancement par bandes (± 0,5 point). L'ETF en CTO uniquement, jamais en PEA via les trackers synthétiques dont le risque de contrepartie me gêne sur ce type d'actif.",
      },
      {
        author: 'bob',
        content:
          "Je reste à 0 : je n'arrive pas à valoriser un actif sans cash-flows. Mais si j'y allais, ce serait effectivement par bandes de tolérance plutôt que calendaire — la volatilité impose des règles mécaniques.",
      },
    ],
  },
  {
    title: 'Défiscalisation LMNP : le dispositif vaut-il encore le coup ?',
    type: 'question',
    categorySlug: 'fiscalite',
    author: 'chloe',
    content:
      "Avec la remise à plat des dispositifs neufs, le LMNP ancien reste un des derniers couloirs de défiscalisation immédiate via l'amortissement.\n\nQuelques simulations me donnent une réduction d'impôt intéressante, mais le cash-flow réel après fiscalité me semble serré. Des retours d'expérience ?",
    replies: [
      {
        author: 'alice',
        content:
          "Faites simuler l'après-amortissement (années 8-15) : c'est là que la factaille fiscale redevient pleine. Le LMNP neuf n'est rentable que si le bien se revend bien ou si la fiscalité était votre seul critère.",
      },
    ],
  },
  {
    title: "Ma stratégie d'allocation 60/40 revisitée pour 2026",
    type: 'discussion',
    categorySlug: 'bourse',
    author: 'bob',
    content:
      "Je partage l'évolution de mon allocation : 60 % actions world, 25 % obligations (dont 10 % indexées inflation), 10 % immobilier diversifié (SCPI), 5 % or.\n\nL'objectif : réduire le séquence risk à 7 ans de la retraite tout en gardant une croissance suffisante. Les critiques sont bienvenues.",
    replies: [
      {
        author: 'chloe',
        content:
          "La poche inflation me semble pertinente compte tenu des déficits publics. As-tu regardé les obligations indexées européennes ? Leur marché reste plus étroit que le TIPS américain.",
      },
    ],
  },
  {
    title: 'PER : quels arbitrages avant la retraite ?',
    type: 'question',
    categorySlug: 'retraite',
    author: 'alice',
    content:
      "À 8 ans de la retraite, mon PER (ouvert en 2020) affiche une performance correcte mais une allocation encore très dynamique (85 % actions).\n\nQuelle courbe de désensibilisation recommandez-vous ? Je pense passer à 60 % actions 5 ans avant, puis 40 % 2 ans avant. Trop brutal, pas assez ?",
    replies: [
      {
        author: 'bob',
        content:
          "Votre calendrier est cohérent avec la doctrine actuarielle classique. L'essentiel : ne pas rester à 85 % actions la dernière année, c'est là que le risque de séquence est maximal. Pensez aussi à la part en euros si votre PER en propose une.",
      },
    ],
  },
] as const;

async function main() {
  const { appDir, distDir } = await compileStrapi();
  const app = createStrapi({ appDir, distDir, serveAdminPanel: false });
  await app.start();

  try {
    // ----- Rôle "authenticated" -----
    const role = (await app.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'authenticated' } })) as { id: number } | null;
    if (!role) throw new Error('Rôle "authenticated" introuvable');

    // ----- Utilisateurs -----
    const userService = app.plugin('users-permissions').service('user');
    const users = new Map<string, { id: number; documentId: string }>();
    for (const { username, email, name } of USERS) {
      const existing = (await app.db
        .query('plugin::users-permissions.user')
        .findOne({ where: { username } })) as
        | { id: number; documentId?: string; document_id?: string }
        | null;
      if (existing) {
        users.set(username, { id: existing.id, documentId: existing.documentId ?? existing.document_id ?? '' });
        app.log.info(`Utilisateur existant : ${username}`);
        continue;
      }
      const created = await userService.add({
        username,
        email,
        password: DEMO_PASSWORD,
        provider: 'local',
        confirmed: true,
        blocked: false,
        role: role.id,
      });
      const docId =
        (created as { documentId?: string }).documentId ??
        (created as { document_id?: string }).document_id ??
        '';
      users.set(username, { id: (created as { id: number }).id, documentId: docId });
      app.log.info(`Utilisateur créé : ${name} (${username} / ${email})`);
    }

    // ----- Catégories -----
    const categoryIds = new Map<string, string>();
    for (const { name, slug, description } of CATEGORIES) {
      const existing = (await app.db
        .query('api::category.category')
        .findOne({ where: { slug } })) as
        | { documentId?: string; document_id?: string }
        | null;
      if (existing) {
        categoryIds.set(slug, existing.documentId ?? existing.document_id ?? '');
        continue;
      }
      const created = await app.documents('api::category.category').create({
        data: { name, slug, description },
      });
      categoryIds.set(slug, created.documentId);
      app.log.info(`Catégorie créée : ${name}`);
    }

    // ----- Discussions + réponses -----
    let createdDiscussions = 0;
    let createdReplies = 0;
    for (const discussion of DISCUSSIONS) {
      const existing = (await app.db
        .query('api::discussion.discussion')
        .findOne({ where: { title: discussion.title } })) as
        | { id: number; documentId?: string; document_id?: string }
        | null;

      let discussionId = '';
      if (existing) {
        discussionId = existing.documentId ?? existing.document_id ?? '';
        app.log.info(`Discussion existante : ${discussion.title}`);
      } else {
        const created = await app.documents('api::discussion.discussion').create({
          data: {
            title: discussion.title,
            content: discussion.content,
            type: discussion.type,
            category: categoryIds.get(discussion.categorySlug)!,
            author: users.get(discussion.author)!.documentId,
            slug: `${slugify(discussion.title)}-${randomSuffix()}`,
          },
        });
        discussionId = created.documentId;
        createdDiscussions += 1;
        app.log.info(`Discussion créée : ${discussion.title}`);
      }

      for (const reply of discussion.replies) {
        const replyExists = await app.db.query('api::reply.reply').findOne({
          where: { discussion: discussionId, content: reply.content },
        });
        if (replyExists) continue;
        await app.documents('api::reply.reply').create({
          data: {
            content: reply.content,
            discussion: discussionId,
            author: users.get(reply.author)!.documentId,
          },
        });
        createdReplies += 1;
      }
    }

    app.log.info(
      `Seed terminé : ${createdDiscussions} discussion(s) et ${createdReplies} réponse(s) créées.`
    );
    console.log(`\nComptes démo — mot de passe : ${DEMO_PASSWORD}`);
    console.log(USERS.map((u) => `  ${u.username} / ${u.email}`).join('\n'));
  } finally {
    await app.destroy();
  }
}

main().catch((error) => {
  console.error('Échec du seed :', error);
  process.exit(1);
});
