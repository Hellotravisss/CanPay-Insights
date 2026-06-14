import type { Article } from './types';

// French-language articles targeting the Québec market (≈8.5M French speakers).
// Data verified for 2026: federal lowest bracket cut to 14%, TFSA $7,000,
// RRSP ceiling $33,810, CPP2 YMPE $74,600/YAMPE $85,000. Québec net-pay
// figures computed with the CanPay Insights tax engine.

export const frenchArticles: Article[] = [
  {
    id: 'fr-1',
    slug: 'baisse-taux-federal-14-pourcent-2026-quebec',
    title: 'Baisse du taux fédéral à 14 % en 2026 : ce que ça change pour votre paie au Québec',
    subtitle: 'Le premier palier d\'impôt fédéral passe de 15 % à 14 %. Voici l\'effet réel sur votre salaire net.',
    excerpt: 'En 2026, le taux du premier palier fédéral passe de 15 % à 14 %. Combinée à l\'abattement québécois de 16,5 %, cette baisse réduit légèrement l\'impôt de presque tous les travailleurs du Québec. Voici les chiffres.',
    metaTitle: 'Taux fédéral 14 % en 2026 : impact sur la paie au Québec',
    metaDescription: 'Le taux d\'impôt fédéral du premier palier passe à 14 % en 2026. Découvrez combien vous économisez sur votre salaire net au Québec, avec exemples chiffrés.',
    keywords: ['taux fédéral 14 % 2026', 'baisse impôt 2026 Québec', 'paliers d\'impôt 2026', 'salaire net Québec 2026', 'impôt fédéral Québec'],
    category: 'tax',
    tags: ['Québec', '2026', 'Impôt fédéral', 'Paie'],
    province: 'Quebec',
    lang: 'fr',
    publishedAt: '2026-06-13',
    readTime: 6,
    directAnswer: 'En 2026, le premier palier d\'impôt fédéral baisse de 15 % à 14 %. Pour un travailleur québécois, l\'économie touche la portion de revenu sous environ 58 500 $ et représente jusqu\'à quelques centaines de dollars par an, selon le revenu. L\'abattement du Québec (16,5 %) s\'applique ensuite sur l\'impôt fédéral.',
    faq: [
      { question: 'Le taux fédéral passe-t-il vraiment à 14 % en 2026 ?', answer: 'Oui. Le taux du premier palier fédéral passe de 15 % à 14 % pour 2026 et les années suivantes. Il s\'applique au revenu imposable jusqu\'à environ 58 523 $.' },
      { question: 'Combien vais-je économiser au Québec ?', answer: 'L\'économie dépend de votre revenu, mais elle touche toute la portion sous le premier seuil. Après l\'abattement québécois de 16,5 %, l\'effet net est modeste mais réel — généralement de quelques dizaines à quelques centaines de dollars par an.' },
      { question: 'Qu\'est-ce que l\'abattement du Québec de 16,5 % ?', answer: 'Les résidents du Québec reçoivent une réduction de 16,5 % de leur impôt fédéral de base, parce que le Québec administre certains programmes lui-même. C\'est pourquoi l\'impôt fédéral payé au Québec est plus bas qu\'ailleurs au Canada.' },
    ],
    content: `
## Une baisse d'impôt pour presque tout le monde en 2026

À compter de 2026, le **taux du premier palier d'impôt fédéral passe de 15 % à 14 %**. C'est la première baisse de ce taux depuis des années, et elle s'applique à **tous les contribuables** : tout le monde paie ce taux sur la première tranche de son revenu imposable.

Au Québec, l'effet est un peu particulier à cause de l'**abattement de 16,5 %** : les Québécois reçoivent une réduction de leur impôt fédéral, donc la baisse se combine avec cet abattement.

## Les paliers d'impôt fédéral 2026

| Revenu imposable | Taux 2026 |
| --- | --- |
| Jusqu'à 58 523 $ | **14 %** (était 15 %) |
| 58 524 $ – 117 045 $ | 20,5 % |
| 117 046 $ – 181 440 $ | 26 % |
| 181 441 $ – 258 482 $ | 29 % |
| Plus de 258 482 $ | 33 % |

Seul le **premier palier** baisse. Les autres taux restent les mêmes (avec un ajustement d'environ 2 % des seuils pour l'inflation).

## Et l'impôt du Québec ?

L'impôt provincial du Québec ne change pas avec cette mesure fédérale. Les paliers québécois 2026 commencent à **14 %** jusqu'à 54 345 $, puis 19 %, 24 % et 25,75 %. Votre paie subit donc l'impôt fédéral (réduit par l'abattement de 16,5 %) **plus** l'impôt du Québec.

## L'essentiel

- Le taux fédéral du premier palier baisse à **14 %** en 2026.
- La baisse touche tout le monde, mais l'économie reste modeste après l'abattement québécois.
- Pour voir votre chiffre exact, utilisez le [calculateur de salaire net Québec](/fr/calculateur-salaire-net-quebec) ou le [calculateur de paie gratuit](/).

*Estimations basées sur les taux publiés pour 2025/2026. Confirmez toujours les montants courants auprès de Revenu Québec et de l'ARC.*
`,
  },
  {
    id: 'fr-2',
    slug: 'guide-paie-quebec-2026',
    title: 'Guide complet de la paie au Québec 2026 : RRQ, RQAP, AE et impôts',
    subtitle: 'Tout ce qui est retenu sur votre chèque de paie au Québec, expliqué simplement.',
    excerpt: 'Au Québec, votre paie subit l\'impôt fédéral, l\'impôt du Québec, la RRQ, le RQAP et l\'assurance-emploi. Ce guide 2026 explique chaque retenue, avec les taux à jour.',
    metaTitle: 'Guide de la paie au Québec 2026 : RRQ, RQAP, AE, impôts',
    metaDescription: 'Comprenez chaque retenue sur votre paie au Québec en 2026 : impôt fédéral et provincial, RRQ, RQAP et assurance-emploi (taux réduit). Guide clair et à jour.',
    keywords: ['paie Québec 2026', 'retenues salaire Québec', 'RRQ 2026', 'RQAP 2026', 'assurance-emploi Québec', 'déductions paie Québec'],
    category: 'tax',
    tags: ['Québec', '2026', 'Paie', 'RRQ', 'RQAP'],
    province: 'Quebec',
    lang: 'fr',
    publishedAt: '2026-06-13',
    readTime: 8,
    directAnswer: 'Au Québec en 2026, votre paie subit cinq retenues principales : l\'impôt fédéral (premier palier à 14 %, réduit par l\'abattement de 16,5 %), l\'impôt du Québec (à partir de 14 %), la RRQ (Régime de rentes du Québec), le RQAP (assurance parentale) et l\'assurance-emploi à taux réduit. Le Québec a un taux d\'AE plus bas parce que le RQAP couvre les prestations parentales séparément.',
    faq: [
      { question: 'Pourquoi mon assurance-emploi est-elle plus basse au Québec ?', answer: 'Parce que le Québec administre son propre régime d\'assurance parentale (RQAP). Comme les prestations parentales sont couvertes par le RQAP, le taux d\'AE fédéral est réduit pour les travailleurs québécois.' },
      { question: 'Quelle est la différence entre RRQ et RPC ?', answer: 'La RRQ (Régime de rentes du Québec) est l\'équivalent québécois du RPC (Régime de pensions du Canada). Le Québec administre son propre régime, avec un taux légèrement plus élevé que le RPC.' },
      { question: 'Qu\'est-ce que le RQAP ?', answer: 'Le Régime québécois d\'assurance parentale verse des prestations de maternité, paternité, parentales et d\'adoption. Il est financé par une cotisation distincte sur votre paie.' },
    ],
    content: `
## Ce qui est retenu sur votre paie au Québec

Au Québec, votre **salaire brut** n'est pas ce que vous recevez. Cinq retenues principales s'appliquent avant que l'argent arrive dans votre compte :

### 1. Impôt fédéral
Le premier palier passe à **14 % en 2026**. Les résidents du Québec bénéficient ensuite de l'**abattement de 16,5 %**, qui réduit l'impôt fédéral payé.

### 2. Impôt du Québec
Les paliers provinciaux 2026 : **14 %** jusqu'à 54 345 $, puis **19 %** jusqu'à 108 680 $, **24 %** jusqu'à 132 245 $, et **25,75 %** au-delà.

### 3. RRQ — Régime de rentes du Québec
L'équivalent québécois du RPC. Le taux est un peu plus élevé que le RPC du reste du Canada. Comme le RPC, il comporte maintenant un deuxième volet (RRQ2) pour les revenus plus élevés.

### 4. RQAP — Régime québécois d'assurance parentale
Une cotisation distincte qui finance les prestations de maternité, paternité et parentales. C'est ce qui explique le taux d'AE réduit au Québec.

### 5. Assurance-emploi (AE)
Au Québec, le **taux d'AE est réduit** parce que le RQAP couvre déjà le volet parental. Vous payez donc moins d'AE qu'ailleurs au Canada, mais vous cotisez au RQAP en parallèle.

## Exemple : 60 000 $ au Québec

Sur un salaire de 60 000 $ au Québec, il reste environ **44 700 $ net par an** (≈ 3 730 $ par mois) une fois toutes les retenues appliquées. La répartition exacte dépend de vos crédits et de votre situation.

## Calculez votre paie

Pour votre chiffre précis, essayez le [calculateur de salaire net Québec](/fr/calculateur-salaire-net-quebec). Vous pouvez aussi comparer plusieurs revenus dans l'article [Salaire net au Québec 2026](/blog/salaire-net-quebec-2026-par-revenu).

*Taux 2025/2026. Confirmez les montants courants auprès de Revenu Québec.*
`,
  },
  {
    id: 'fr-3',
    slug: 'salaire-minimum-quebec-2026-apres-impot',
    title: 'Salaire minimum au Québec 2026 : combien vous reste-t-il après impôt ?',
    subtitle: 'À 16,60 $ l\'heure, voici ce qu\'un travailleur à temps plein garde vraiment.',
    excerpt: 'Le salaire minimum au Québec est de 16,60 $ l\'heure. À temps plein, cela donne environ 34 528 $ brut — mais après impôt, RRQ, RQAP et AE, il reste environ 28 000 $ par an. Voici le détail.',
    metaTitle: 'Salaire minimum Québec 2026 après impôt : le net réel',
    metaDescription: 'Salaire minimum 2026 au Québec (16,60 $/h) : environ 34 528 $ brut à temps plein et ≈ 28 000 $ net après impôt, RRQ, RQAP et AE. Détail complet.',
    keywords: ['salaire minimum Québec 2026', 'salaire minimum après impôt', '16,60 $ de l\'heure net', 'temps plein salaire minimum Québec', 'net salaire minimum'],
    category: 'salary',
    tags: ['Québec', '2026', 'Salaire minimum', 'Net'],
    province: 'Quebec',
    lang: 'fr',
    publishedAt: '2026-06-13',
    readTime: 5,
    directAnswer: 'Au salaire minimum du Québec (16,60 $/h), un travailleur à temps plein (40 h/sem) gagne environ 34 528 $ brut par an et garde environ 28 000 $ net après l\'impôt fédéral et provincial, la RRQ, le RQAP et l\'assurance-emploi — soit à peu près 2 340 $ par mois.',
    faq: [
      { question: 'Quel est le salaire minimum au Québec en 2026 ?', answer: 'Le salaire minimum général est de 16,60 $ l\'heure au Québec. À temps plein (40 h/semaine), cela représente environ 34 528 $ par an avant déductions.' },
      { question: 'Combien reste-t-il après impôt au salaire minimum ?', answer: 'Environ 28 000 $ net par an, soit près de 2 340 $ par mois, une fois l\'impôt, la RRQ, le RQAP et l\'AE déduits. Le montant exact varie selon vos crédits personnels.' },
      { question: 'Le salaire minimum est-il imposable ?', answer: 'Oui, mais à ce niveau de revenu l\'impôt reste faible grâce au montant personnel de base. Les cotisations RRQ, RQAP et AE représentent une part importante des retenues.' },
    ],
    content: `
## 16,60 $ l'heure : combien ça donne vraiment ?

Le **salaire minimum au Québec est de 16,60 $ l'heure**. À temps plein (40 heures par semaine, 2 080 heures par an), cela représente environ **34 528 $ brut** par année.

Mais le brut n'est pas ce que vous recevez. Après les retenues, il reste environ **28 000 $ net** — soit près de **2 340 $ par mois**.

## Où va l'argent ?

| Élément | Montant annuel (estimé) |
| --- | --- |
| Salaire brut (temps plein) | 34 528 $ |
| Impôt fédéral | ≈ 2 000 $ |
| Impôt du Québec | ≈ 1 900 $ |
| RRQ + RQAP | ≈ 2 160 $ |
| Assurance-emploi | ≈ 440 $ |
| **Salaire net** | **≈ 28 000 $** |

Environ **19 %** du salaire brut part en retenues à ce niveau de revenu.

## Bon à savoir

- À temps partiel, le net est proportionnellement plus élevé (moins d'impôt).
- Les crédits personnels (montant de base fédéral et québécois) réduisent l'impôt réel.
- Le salaire minimum est révisé chaque année, généralement le 1er mai.

## Calculez votre situation

Vous travaillez un nombre d'heures variable ? Utilisez le [calculateur de paie](/) pour entrer votre taux horaire et votre province, ou consultez l'[étude sur le salaire minimum par province](/blog/minimum-wage-take-home-pay-canada-2026).

*Estimations basées sur les taux 2025/2026. Confirmez auprès de Revenu Québec.*
`,
  },
  {
    id: 'fr-4',
    slug: 'reer-vs-celi-2026-quebec',
    title: 'REER ou CELI en 2026 : lequel choisir au Québec ?',
    subtitle: 'Plafonds 2026, économies d\'impôt et la bonne stratégie selon votre revenu.',
    excerpt: 'En 2026, le plafond REER monte à 33 810 $ et le CELI reste à 7 000 $. Au Québec, le REER réduit votre impôt aujourd\'hui, le CELI fait croître votre argent à l\'abri de l\'impôt. Voici comment choisir.',
    metaTitle: 'REER ou CELI 2026 au Québec : comment choisir ?',
    metaDescription: 'Plafond REER 2026 : 33 810 $. Plafond CELI : 7 000 $. Au Québec, lequel choisir selon votre revenu ? Avantages fiscaux, économies d\'impôt et stratégie.',
    keywords: ['REER ou CELI 2026', 'plafond REER 2026', 'plafond CELI 2026', 'REER CELI Québec', 'épargne impôt Québec'],
    category: 'tips',
    tags: ['Québec', '2026', 'REER', 'CELI', 'Épargne'],
    province: 'Quebec',
    lang: 'fr',
    publishedAt: '2026-06-13',
    readTime: 7,
    directAnswer: 'En 2026, le plafond de cotisation REER atteint 33 810 $ (18 % du revenu gagné) et le plafond CELI est de 7 000 $. Au Québec, le REER est généralement avantageux si votre revenu est élevé (il réduit l\'impôt à votre taux marginal), tandis que le CELI convient mieux aux revenus modestes ou à l\'épargne à court terme, car les retraits sont libres d\'impôt.',
    faq: [
      { question: 'Quel est le plafond REER en 2026 ?', answer: 'Le plafond REER 2026 est de 33 810 $, soit 18 % de votre revenu gagné de l\'année précédente, plus les droits inutilisés reportés.' },
      { question: 'Quel est le plafond CELI en 2026 ?', answer: 'Le plafond annuel du CELI reste à 7 000 $ pour 2026. Les droits inutilisés s\'accumulent d\'année en année.' },
      { question: 'REER ou CELI : lequel d\'abord au Québec ?', answer: 'Règle générale : si votre taux marginal est élevé, le REER procure une plus grande économie d\'impôt immédiate. Si votre revenu est modeste ou que vous épargnez pour un projet à court terme, le CELI est souvent préférable car les retraits ne sont pas imposés.' },
    ],
    content: `
## REER et CELI : deux outils, deux usages

Les deux font croître votre argent à l'abri de l'impôt, mais différemment :

- **REER** : vous déduisez vos cotisations de votre revenu imposable **aujourd'hui** (économie d'impôt immédiate), mais les retraits sont imposés plus tard.
- **CELI** : aucune déduction à la cotisation, mais la croissance et les **retraits sont totalement libres d'impôt**.

## Les plafonds 2026

| Compte | Plafond 2026 |
| --- | --- |
| **REER** | 33 810 $ (18 % du revenu gagné) |
| **CELI** | 7 000 $ par an |

## Comment choisir au Québec ?

**Le REER brille quand votre taux marginal est élevé.** Au Québec, les taux combinés (fédéral + provincial) montent vite : déduire un dollar de REER peut vous faire économiser 37 à 53 cents d'impôt selon votre palier. Plus votre revenu est haut, plus le REER est avantageux.

**Le CELI brille pour les revenus modestes ou l'épargne flexible.** Si vous gagnez moins, la déduction REER vaut moins, et la flexibilité du CELI (retraits sans impôt, droits récupérés l'année suivante) devient plus intéressante — idéal pour un fonds d'urgence ou un projet à moyen terme.

### Une stratégie courante
1. Cotiser au REER jusqu'à faire baisser votre revenu imposable d'un palier.
2. Mettre le reste dans le CELI pour la flexibilité.
3. Réinvestir le **remboursement d'impôt** du REER dans le CELI.

## Voyez votre taux marginal

Votre décision dépend de votre taux marginal. Calculez-le avec le [calculateur de paie](/) en entrant votre salaire et le Québec, ou lisez le [guide de la paie au Québec 2026](/blog/guide-paie-quebec-2026).

*Plafonds 2026 selon l'ARC. Les situations individuelles varient — consultez un conseiller au besoin.*
`,
  },
  {
    id: 'fr-5',
    slug: 'salaire-net-quebec-2026-par-revenu',
    title: 'Salaire net au Québec 2026 : combien gagnez-vous vraiment ?',
    subtitle: 'Du salaire brut au net : le tableau complet par tranche de revenu pour 2026.',
    excerpt: 'Un salaire de 50 000 $ au Québec laisse environ 38 500 $ net; 75 000 $ laisse environ 53 500 $. Voici le tableau complet du salaire net au Québec en 2026, de 40 000 $ à 100 000 $.',
    metaTitle: 'Salaire net au Québec 2026 par revenu : tableau complet',
    metaDescription: 'Salaire net au Québec 2026 par tranche de revenu : 50 000 $ ≈ 38 500 $ net, 75 000 $ ≈ 53 500 $, 100 000 $ ≈ 68 500 $. Tableau brut-net détaillé.',
    keywords: ['salaire net Québec 2026', 'calcul salaire net Québec', 'salaire après impôt Québec', '50000 net Québec', '75000 net Québec'],
    category: 'salary',
    tags: ['Québec', '2026', 'Salaire net', 'Revenu'],
    province: 'Quebec',
    lang: 'fr',
    publishedAt: '2026-06-13',
    readTime: 6,
    directAnswer: 'Au Québec en 2026, un salaire de 40 000 $ laisse environ 31 700 $ net; 50 000 $ ≈ 38 500 $; 60 000 $ ≈ 44 700 $; 75 000 $ ≈ 53 500 $; et 100 000 $ ≈ 68 500 $ net par an. Le net dépend de l\'impôt fédéral et québécois, de la RRQ, du RQAP et de l\'AE.',
    faq: [
      { question: 'Combien fait 50 000 $ net au Québec ?', answer: 'Environ 38 500 $ net par an, soit près de 3 200 $ par mois, après l\'impôt fédéral et provincial, la RRQ, le RQAP et l\'AE.' },
      { question: 'Combien fait 75 000 $ net au Québec ?', answer: 'Environ 53 500 $ net par an (≈ 4 460 $ par mois) une fois toutes les retenues appliquées en 2026.' },
      { question: 'Pourquoi le net est-il plus bas au Québec ?', answer: 'Le Québec a ses propres paliers d\'impôt provincial et des cotisations distinctes (RRQ, RQAP). Même avec l\'abattement fédéral de 16,5 %, le total des retenues est souvent un peu plus élevé qu\'ailleurs au Canada.' },
    ],
    content: `
## Du brut au net au Québec en 2026

Votre salaire annoncé (le **brut**) n'est pas ce qui arrive dans votre compte. Voici ce qu'il reste réellement après l'impôt fédéral, l'impôt du Québec, la RRQ, le RQAP et l'assurance-emploi.

| Salaire brut | Net annuel (estimé) | Net mensuel | Retenues |
| --- | --- | --- | --- |
| 40 000 $ | **31 700 $** | ≈ 2 640 $ | ≈ 21 % |
| 50 000 $ | **38 500 $** | ≈ 3 200 $ | ≈ 23 % |
| 60 000 $ | **44 700 $** | ≈ 3 730 $ | ≈ 25 % |
| 75 000 $ | **53 500 $** | ≈ 4 460 $ | ≈ 29 % |
| 100 000 $ | **68 500 $** | ≈ 5 710 $ | ≈ 31 % |

## Pourquoi le taux de retenue augmente

Le Québec applique un impôt **progressif** : plus vous gagnez, plus la portion supérieure de votre revenu est imposée à un taux élevé. C'est pourquoi un salaire de 100 000 $ ne laisse pas le double d'un salaire de 50 000 $ en net.

## Réduire l'impôt

La meilleure façon de garder plus : cotiser au **REER** pour réduire votre revenu imposable. Lisez [REER ou CELI en 2026](/blog/reer-vs-celi-2026-quebec) pour choisir la bonne stratégie.

## Votre chiffre exact

Ces montants sont des estimations avec les crédits de base seulement. Pour votre situation précise, utilisez le [calculateur de salaire net Québec](/fr/calculateur-salaire-net-quebec).

*Estimations calculées avec le moteur fiscal de CanPay Insights, taux 2025/2026. Confirmez auprès de Revenu Québec.*
`,
  },
];
