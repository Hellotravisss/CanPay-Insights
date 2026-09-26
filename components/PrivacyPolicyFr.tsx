'use client';
import React from 'react';
import LegalChrome, { Section } from './LegalChrome';

/**
 * Politique de confidentialité — version française, sur un pied d'égalité
 * avec l'anglaise (Charte de la langue française, art. 52). Le contenu est le
 * même, section pour section ; en cas d'écart, la version la plus récente des
 * deux fait foi et l'écart est une erreur à corriger.
 */
const PrivacyPolicyFr: React.FC = () => {
  return (
    <LegalChrome
      lang="fr"
      backLabel="Retour à l’accueil"
      footnote="Les calculs sont des estimations fondées sur les tranches d’imposition 2026 et les normes du travail provinciales."
      title="Politique de confidentialité de CanPay Insights"
      effective="En vigueur le 25 septembre 2026 (remplace la version du 22 septembre 2026)"
      links={[
        { href: '/privacy', label: 'English version' },
        { href: '/terms', label: 'Conditions d’utilisation (anglais)' },
        { href: '/refunds', label: 'Politique de remboursement (anglais)' },
      ]}
      intro={
        <p>
          CanPay Insights (« nous ») est un calculateur gratuit de salaire net canadien, avec deux rapports payants facultatifs, publié à
          canpayinsights.ca et sous forme d’application CanPay Insights pour iPhone (ensemble, le
          « Service »). Il est exploité par Qi (Travis) Zhang, faisant affaire sous le nom Avowd, à
          Vancouver (Colombie-Britannique). Cette politique explique ce que nous recueillons, pourquoi, à
          qui cela est communiqué et comment refuser. Elle est rédigée pour être lue.
        </p>
      }
    >
      <Section n={1} id="local" title="Ce qui reste sur votre appareil, et ce qui n’y reste pas">
        <p>
          Chaque calcul de paie et d’impôt s’exécute <strong className="text-slate-800">entièrement dans votre navigateur ou sur
          votre téléphone</strong>. Les montants exacts que vous saisissez — taux horaire, salaire, pourboires,
          cotisations REER — ne nous sont jamais transmis, sauf dans un cas que vous choisissez : l’achat d’un rapport, construit à partir du salaire que vous saisissez pour lui (section 5). Si vous enregistrez un calcul dans un compte, ce seul
          calcul est conservé pour que vous puissiez le rouvrir sur un autre appareil, et vous pouvez le
          supprimer à tout moment.
        </p>
        <p>
          Ce qui <strong className="text-slate-800">est</strong> transmis, c’est un enregistrement anonyme de chaque calcul, décrit en entier à
          la section 2. Les montants n’y figurent que sous forme de tranches. Votre horaire de travail est la
          seule chose transmise en chiffres exacts : lorsque vous utilisez le calculateur par quart ou par
          feuille de temps, l’heure habituelle de début et de fin, le nombre de jours par semaine, la durée
          moyenne d’un quart et la pause non payée. Vous pouvez tout désactiver (section 2).
        </p>
        <p>
          <strong className="text-slate-800">Le calculateur que d’autres sites intègrent (notre « widget ») transmet moins :</strong> la
          province, le revenu sous forme de tranche, annuel ou horaire, la langue, le type d’appareil et la
          famille de navigateur, l’heure et le jour de la semaine, le nom du fuseau horaire, un identifiant de
          visite temporaire et le domaine où il est intégré. Il ne transmet aucun horaire de travail, ne
          conserve rien dans le navigateur et ne charge rien depuis un autre site. Un site qui l’intègre avec{' '}
          <code>&amp;notelemetry=1</code> désactive même cela : le widget ne transmet alors plus rien.
        </p>
      </Section>

      <Section n={2} id="statistics" title="Statistiques d’utilisation anonymes">
        <p>
          Pour comprendre l’usage du calculateur et publier des travaux tels que « quelles tranches de revenu
          les Canadiens calculent le plus, par province », nous enregistrons{' '}
          <strong className="text-slate-800">une fiche anonyme par calcul stabilisé</strong>. Elle contient :
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>le calculateur utilisé, la province choisie et votre revenu brut sous forme de <strong className="text-slate-800">tranche</strong> (par exemple « 50 k$–70 k$ ») — jamais le montant ;</li>
          <li>la langue de l’interface, votre type d’appareil (téléphone, tablette ou ordinateur), la famille de navigateur, la famille de système d’exploitation et, sur certains téléphones, le fabricant — jamais la signature complète du navigateur ni une empreinte d’appareil ;</li>
          <li>la fréquence de paie choisie, une catégorie de travail déduite de vos saisies (horaire à temps plein ou partiel, salarié, à pourboires, par quarts) — déduite, jamais demandée — et la position de votre paie par rapport à la médiane de Statistique Canada pour votre province, sous forme de fourchette, avec la médiane utilisée ;</li>
          <li>si vous avez ouvert le détail du calcul et, si vous touchez un rapport payant, lequel — jamais rien sur un achat ;</li>
          <li>la page de notre propre site où vous étiez avant de calculer (le chemin seulement — jamais un lien d’un autre site, jamais ce qui suit un « ? ») ;</li>
          <li>les réponses facultatives que vous choisissez de donner : le secteur auquel vous vous comparez (avec sa position dans la liste et si ce navigateur l’avait déjà choisi), la raison du calcul, si le résultat correspondait à vos attentes, votre mode de travail (sur place, à distance, hybride), votre groupe d’âge, votre ancienneté, votre appartenance syndicale, la taille de votre employeur et vos jours de vacances ;</li>
          <li>votre horaire type lorsque vous utilisez les calculateurs de quarts ou de feuilles de temps (heures habituelles de début et de fin, jours par semaine, durée moyenne d’un quart, pause non payée) — jamais les dates réellement travaillées ;</li>
          <li>des fourchettes larges pour vos saisies (cotisation REER en part de la paie, prime de quart, heures supplémentaires, pourboires en part de la paie) — toujours des fourchettes ;</li>
          <li>si vous étiez connecté (oui/non — jamais quel compte) et, si vous rouvrez un calcul enregistré et le modifiez, le sens et l’ordre de grandeur du changement ainsi que l’ancienneté de l’original — jamais les montants ;</li>
          <li>l’heure et le jour de la semaine selon votre propre horloge, et le nom du fuseau horaire que déclare votre navigateur (par exemple « America/Toronto »), qui sert à vérifier la carte, non à vous situer ;</li>
          <li>si cet appareil a déjà enregistré un calcul — un simple indicateur oui/non stocké sur l’appareil, pas un identifiant ;</li>
          <li>sur le calculateur que d’autres sites intègrent (notre « widget ») : le domaine du site qui l’intègre — jamais la page, jamais l’adresse du visiteur. Le widget ne stocke rien dans le navigateur ; il n’enregistre donc aucun indicateur « déjà venu » ;</li>
          <li>votre position approximative, décrite à la section 3.</li>
        </ul>
        <p>
          Les fiches d’une même visite sont regroupées par un identifiant temporaire aléatoire, supprimé à
          votre départ et jamais réutilisé. Ces fiches ne contiennent <strong className="text-slate-800">ni nom, ni identifiant
          de compte, ni adresse IP, ni empreinte d’appareil</strong>, et ne sont pas reliées à vous.
        </p>
        <p>
          <strong className="text-slate-800">Refuser.</strong> Ouvrez n’importe quelle page du site avec <code>?notelemetry=1</code>{' '}
          ajouté à l’adresse et ce navigateur n’enregistrera plus rien — ni fiche de calcul, ni comptage des pages vues
          (<code>?notelemetry=0</code> réactive). Le calculateur fonctionne exactement de la même façon. Ce choix est gardé dans
          ce navigateur pour ce site : il ne vous suit ni dans d’autres navigateurs ni dans notre calculateur intégré à un autre
          site ; un site qui l’intègre peut couper l’enregistrement pour tous ses visiteurs en ajoutant{' '}
          <code>&amp;notelemetry=1</code> à l’adresse du widget. L’application iPhone n’a pas encore d’interrupteur (section 6).
        </p>
      </Section>

      <Section n={3} id="location" title="Position et quartier">
        <p>Il y a trois niveaux, et seul le premier se produit sans action de votre part.</p>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong className="text-slate-800">À partir de votre connexion.</strong> Notre hébergeur indique à notre serveur le
            pays, la région et la ville d’où semble provenir votre connexion, ainsi que le point central de
            cette ville. Nous conservons ce point arrondi à environ 11 km. <strong className="text-slate-800">Votre adresse IP
            n’est pas conservée</strong> — ni dans ces fiches, ni dans des journaux que nous garderions. C’est
            au niveau de la ville, et c’est identique que vous répondiez ou non à ce qui suit.
          </li>
          <li>
            <strong className="text-slate-800">Le début de votre code postal, si vous le saisissez.</strong> Sous le résultat, vous
            pouvez entrer les trois premiers caractères de votre code postal (une « région de tri
            d’acheminement », soit quelques milliers de ménages). En retour, vous voyez où ce revenu se situe
            parmi les personnes qui produisent une déclaration dans cette zone, d’après les statistiques de
            l’Agence du revenu du Canada. Nous ne gardons que les trois caractères. Un code postal complet de
            six caractères, qui désigne une quinzaine de ménages, n’est jamais accepté. Le préfixe est
            mémorisé sur votre appareil pour ne pas vous le redemander ; appuyez sur « Modifier » pour le
            remplacer, ou effacez les données de site de votre navigateur pour le supprimer.
          </li>
          <li>
            <strong className="text-slate-800">La position de votre appareil, si vous appuyez sur « Utiliser ma position ».</strong>{' '}
            Cette fonction est désactivée tant que vous n’appuyez pas sur le bouton, et votre navigateur vous
            demande ensuite aussi votre accord. La position est{' '}
            <strong className="text-slate-800">arrondie sur votre appareil avant tout envoi</strong> : à deux décimales
            (environ 1 km) en zone urbaine, et à une décimale (environ 11 km) en zone rurale, où un carré
            d’un kilomètre peut correspondre à une seule habitation. Elle est aussi rattachée, sur votre
            appareil, au préfixe postal le plus proche. Ce qui nous parvient, c’est ce point arrondi et ce
            préfixe — jamais la lecture précise, et jamais plus d’une fois par calcul. Refuser ne change
            rien au calculateur, et la saisie du préfixe reste toujours possible.
          </li>
        </ol>
        <p>
          <strong className="text-slate-800">Pourquoi nous le demandons, dit clairement.</strong> Les réponses au niveau du quartier
          nous permettent de publier et de concéder sous licence des{' '}
          <strong className="text-slate-800">statistiques agrégées</strong> — par exemple, combien de personnes d’une zone postale
          donnée ont calculé une paie dans une tranche de revenu donnée ce trimestre — à des organisations qui
          en ont l’usage, y compris des chercheurs, des journalistes et des entreprises immobilières ou
          financières. Chaque chiffre publié ou concédé est un décompte pour une zone de milliers de ménages
          et n’est diffusé que si au moins vingt personnes le composent. Les licenciés reçoivent des
          statistiques, jamais des fiches ; leurs ententes interdisent toute tentative d’identification et
          toute revente. Nous ne vendons, ne louons ni ne partageons de renseignements personnels.
        </p>
        <p>
          <strong className="text-slate-800">Résidents du Québec.</strong> La fonction de localisation est désactivée par défaut et
          n’est activée que par votre geste, comme l’exige la Loi sur la protection des renseignements
          personnels dans le secteur privé ; le paragraphe ci-dessus constitue l’information que cette loi
          prévoit (art. 8.1). La responsable de la protection des renseignements personnels est nommée à
          la section 9.
        </p>
      </Section>

      <Section n={4} id="cookies" title="Témoins, stockage local et mesure d’audience">
        <p>
          <strong className="text-slate-800">Des témoins seulement si vous vous connectez.</strong> La connexion dépose un
          témoin nommé <code>cp_session</code> qui vous garde connecté pendant 30 jours. Pendant une connexion par
          Google ou Apple, un second témoin (<code>cp_oauth</code> ou <code>cp_apple</code>) porte la demande de
          connexion pendant dix minutes au plus, puis est supprimé. Ils sont essentiels à cette fonction, ne
          servent ni au pistage ni à la publicité, et ne sont pas déposés si vous ne vous connectez pas. Nous n’utilisons aucun témoin publicitaire ni de pistage tiers ; c’est pourquoi ce
          site n’a pas de bandeau de témoins.
        </p>
        <p>
          <strong className="text-slate-800">Le stockage local de votre appareil</strong> contient votre langue, vos réglages de
          calculateur hors connexion, les calculs et entrées de feuille de temps enregistrés hors connexion,
          le secteur auquel vous vous êtes comparé en dernier, l’indicateur de refus de télémétrie, le préfixe postal mémorisé et
          l’indicateur « a déjà calculé », ainsi que trois entrées pour le comptage des pages vues (ci-dessous) :
          un numéro de session pour l’onglet (<code>_av_sid</code>), un indicateur « déjà venu »
          (<code>_av_seen</code>) et un interrupteur (<code>_av_off</code>). Le stockage de session de l’onglet
          conserve aussi la page où votre visite a commencé; il est vidé à la fermeture de l’onglet. Rien de cela
          ne vous identifie, tout reste sur votre appareil, et effacer les données de site de votre navigateur
          supprime le tout. Le calculateur intégré à d’autres
          sites ne stocke rien.
        </p>
        <p>
          <strong className="text-slate-800">Comptage des pages vues.</strong> Deux compteurs sans témoin fonctionnent sur ce site.
          Le premier est le nôtre, servi depuis <code>avowd-analytics.qharbert.workers.dev</code> — un Worker
          Cloudflare de notre propre compte, partagé avec notre site apparenté Avowd. Pour chaque page, il
          enregistre l’adresse (y compris ce qui suit un « ? »), l’adresse de la page qui y menait, la taille et
          la langue de la fenêtre du navigateur, jusqu’où vous avez fait défiler et, si vous cliquez un lien vers
          un autre site, une adresse courriel ou un numéro de téléphone, sa destination et son texte ; il regroupe
          les pages d’un onglet par un numéro de session aléatoire et note si ce navigateur est déjà venu. Le
          second est Cloudflare Web Analytics, le compteur de pages de notre hébergeur. Aucun des deux ne dépose
          de témoin ni ne conserve d’adresse IP. Aucun des deux ne fonctionne si vous avez refusé, dans le
          calculateur intégré à d’autres sites, ni sur les pages de rapport — dont l’adresse contient la clé de
          votre rapport. Nous n’utilisons ni Google Analytics ni aucun réseau publicitaire.
        </p>
        <p>
          <strong className="text-slate-800">Hébergement.</strong> Le site fonctionne sur Cloudflare, qui traite chaque requête pour
          la servir et la protéger des abus ; Cloudflare peut conserver de courts journaux de connexion selon
          sa propre politique. Notre propre base de données ne reçoit jamais votre adresse IP.
        </p>
      </Section>

      <Section n={5} id="accounts" title="Comptes et achats">
        <p>
          Le compte est facultatif ; toutes les fonctions du calculateur marchent sans. Vous pouvez vous connecter
          avec Google, avec Apple ou par un lien à usage unique envoyé par courriel. Avec Google ou Apple, nous
          recevons le nom, l’adresse courriel et la photo de profil que ce fournisseur partage ; avec un lien
          par courriel, seulement votre adresse courriel. Nous conservons vos calculs enregistrés, vos feuilles de temps et vos
          réglages pour qu’ils vous suivent d’un appareil à l’autre.
        </p>
        <p>
          Si vous achetez un rapport, le paiement est encaissé par Stripe sur la page de Stripe ; nous ne
          voyons jamais votre numéro de carte. Nous gardons le dossier d’achat (produit, montant, date,
          courriel transmis par Stripe, province et tranche de revenu visées par le rapport) parce que la loi
          fiscale impose au vendeur de conserver ses registres de vente — actuellement six ans. Le rapport
          lui-même est construit à partir de ce que vous saisissez pour lui — votre salaire et les deux
          provinces, ou les deux offres d’emploi — qui nous est transmis pour créer le paiement et que Stripe
          conserve avec ce paiement, afin que le rapport puisse être reconstruit chaque fois que vous ouvrez
          son lien. Nos propres registres ne gardent que la tranche de revenu. Voir la{' '}
          <a href="/refunds">politique de remboursement</a>.
        </p>
        <p>
          <strong className="text-slate-800">Supprimer votre compte.</strong> Ouvrez le menu du compte sur ce site, ou le tiroir
          d’historique dans l’application, et choisissez « Supprimer le compte ». Votre compte, vos calculs
          enregistrés, vos feuilles de temps et vos réglages sont supprimés immédiatement et définitivement.
          Les dossiers d’achat sont conservés sans votre nom ni votre courriel. Les statistiques anonymes des
          sections 2 et 3 ne sont pas touchées — elles ne contiennent rien qui puisse remonter à vous.
        </p>
      </Section>

      <Section n={6} id="app" title="L’application iPhone">
        <p>
          L’application CanPay Insights ne demande aucune permission de localisation ni d’accès aux contacts,
          à la caméra ou au microphone. Elle demande l’accès à la photothèque uniquement lorsque vous
          enregistrez l’image d’un rapport. Elle enregistre les mêmes statistiques anonymes que le site
          (section 2), situées au niveau de la ville d’après la connexion (section 3, niveau 1) ; les options
          de code postal et de position de l’appareil de la section 3 n’existent que sur le site Web.
          L’application n’a pas encore d’interrupteur pour couper ces statistiques ; d’ici là, si vous ne
          voulez pas qu’elles soient enregistrées, utilisez le site Web avec le refus décrit à la section 2.
        </p>
      </Section>

      <Section n={7} id="sharing" title="Qui reçoit des données">
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong className="text-slate-800">Des fournisseurs de services</strong> qui traitent des données pour notre compte : Cloudflare (hébergement, base de données, envoi de courriels et les deux compteurs de pages vues), Stripe (paiements), Google et Apple (connexion). Chacun agit selon ses propres engagements de confidentialité et ne reçoit que ce que sa fonction exige.</li>
          <li><strong className="text-slate-800">Des licenciés de statistiques agrégées</strong>, comme décrit à la section 3 — des statistiques seulement, jamais des fiches, sous des ententes interdisant la réidentification et la revente.</li>
          <li><strong className="text-slate-800">Le public</strong>, par les jeux de données ouverts de notre <a href="/data">page de données</a>, qui contiennent les mêmes statistiques agrégées avec les petits groupes retenus.</li>
          <li><strong className="text-slate-800">Les autorités</strong>, lorsque la loi l’exige.</li>
        </ul>
        <p>Les données sont traitées au Canada et aux États-Unis, où nos fournisseurs exercent.</p>
      </Section>

      <Section n={8} id="retention" title="Durée de conservation">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Fiches de calcul anonymes : conservées indéfiniment, parce qu’elles constituent le jeu de données et ne contiennent rien qui vous identifie.</li>
          <li>Données de compte : jusqu’à la suppression du compte.</li>
          <li>Dossiers d’achat : six ans après l’année d’imposition de la vente, puis supprimés.</li>
          <li>Courriels que vous nous envoyez : le temps d’y répondre, puis archivés ou supprimés.</li>
        </ul>
      </Section>

      <Section n={9} id="rights" title="Vos droits et à qui écrire">
        <p>
          Vous pouvez demander quels renseignements personnels nous détenons à votre sujet, en demander la
          rectification, retirer votre consentement ou demander la suppression. Comme les fiches
          statistiques ne portent aucune identité, une demande à leur sujet ne peut être rattachée à une
          personne — mais le refus de la section 2 arrête tout enregistrement ultérieur depuis votre
          navigateur, et « Modifier » ou l’effacement des données de site retire un préfixe postal mémorisé.
        </p>
        <p>
          <strong className="text-slate-800">Responsable de la protection des renseignements personnels :</strong> Qi Zhang,{' '}
          <a href="mailto:info@canpayinsights.ca">info@canpayinsights.ca</a>. Nous répondons dans les 30 jours.
        </p>
        <p>
          Si vous n’êtes pas satisfait, vous pouvez porter plainte au Commissariat à la protection de la vie
          privée du Canada (priv.gc.ca) ou, au Québec, à la Commission d’accès à l’information (cai.gouv.qc.ca).
        </p>
        <p>Le Service ne s’adresse pas aux enfants de moins de 13 ans et nous ne recueillons pas sciemment leurs renseignements.</p>
      </Section>

      <Section n={10} id="changes" title="Modifications de cette politique">
        <p>
          Nous modifions cette page lorsque ce que nous recueillons change, et nous l’indiquons sur le{' '}
          <a href="/changelog">journal des modifications</a>. Cette version (25 septembre 2026) ne recueille
          rien de nouveau. Elle réécrit la section 1 pour qu’elle ne contredise plus la section 2 au sujet de
          l’horaire de travail, décrit ce que transmet le widget intégré et complète la liste de ce qui est
          conservé dans votre navigateur (section 4).
        </p>
      </Section>

      <Section n={11} id="contact" title="Nous joindre">
        <p>
          Questions et demandes :{' '}
          <a href="mailto:info@canpayinsights.ca" className="font-medium text-red-600 underline underline-offset-2 hover:text-red-700">
            info@canpayinsights.ca
          </a>
          . CanPay Insights est exploité par Qi Zhang (Avowd), Vancouver, Colombie-Britannique, Canada.
        </p>
      </Section>
    </LegalChrome>
  );
};

export default PrivacyPolicyFr;
