import { postPair, pairsToArrays } from "./blog-posts-shared";

const pairs = [
  postPair({
    slug: "se-marier-avec-un-etranger-france",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Se marier avec un ressortissant étranger en France : les démarches",
    titleEn: "Marrying a foreign national in France: the paperwork",
    excerptFr:
      "Certificat de coutume, acte de naissance traduit, délais consulaires : le mariage franco-étranger demande des pièces supplémentaires qu'il faut lancer plusieurs mois avant la date.",
    excerptEn:
      "Certificate of custom, translated birth certificate, consular lead times: a French–foreign wedding needs extra documents you have to start several months before the date.",
    readingMinutes: 7,
    heroAltFr: "Couple franco-étranger préparant son dossier de mariage",
    heroAltEn: "French–foreign couple preparing their marriage file",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Un mariage entre un Français et une personne de nationalité étrangère se célèbre en mairie comme n'importe quel autre mariage civil. La différence n'est pas dans la cérémonie, mais dans le dossier : la mairie demande des pièces supplémentaires pour vérifier que le conjoint étranger remplit bien les conditions pour se marier selon sa loi nationale.",
          "Ces documents viennent souvent d'un consulat ou d'une ambassade, avec des délais que vous ne maîtrisez pas. C'est le poste à anticiper en premier, bien avant la déco ou le plan de table.",
        ],
      },
      {
        type: "list",
        title: "Les pièces supplémentaires à réunir",
        items: [
          "Une copie intégrale de l'acte de naissance du conjoint étranger, traduite en français par un traducteur assermenté et datée de moins de six mois",
          "Un certificat de coutume, délivré par le consulat ou l'ambassade du pays d'origine",
          "Un certificat de célibat ou de capacité à mariage, quand la loi du pays d'origine l'exige",
          "Un justificatif de domicile et une pièce d'identité en cours de validité pour chacun des deux futurs époux",
        ],
      },
      {
        type: "text",
        title: "Le certificat de coutume, la pièce à lancer tôt",
        paragraphs: [
          "Le certificat de coutume atteste que le futur conjoint étranger est bien libre de se marier selon la loi de son pays : majeur au sens de cette loi, célibataire, juridiquement capable de s'engager. Il est délivré par le consulat ou l'ambassade du pays d'origine, parfois par un notaire ou un avocat spécialisé.",
          "Les délais varient d'un consulat à l'autre, souvent quatre à huit semaines. Comme rien ne se signe côté mairie tant que le dossier n'est pas complet, ce délai peut à lui seul décaler votre date civile. Renseignez-vous auprès du consulat concerné dès que la date est envisagée.",
        ],
      },
      {
        type: "text",
        title: "Traductions et légalisations",
        paragraphs: [
          "Les documents rédigés en langue étrangère doivent en général être traduits par un traducteur assermenté auprès d'une cour d'appel française. Certains pays exigent aussi une légalisation ou une apostille sur les actes d'état civil. Ces étapes s'ajoutent au délai du consulat, pas à la place.",
          "Un cas particulier à connaître : pour les réfugiés, bénéficiaires de la protection subsidiaire et apatrides, le certificat de coutume n'est plus exigé pour se marier en France. Les autres ressortissants restent concernés.",
        ],
      },
      {
        type: "list",
        title: "Le calendrier à respecter côté mairie",
        items: [
          "Prendre contact avec la mairie du lieu de mariage au moins deux mois avant la date souhaitée pour retirer la liste exacte des pièces (elle peut varier selon la nationalité)",
          "Lancer en parallèle la demande de certificat de coutume au consulat, car c'est le délai le plus long et le moins prévisible",
          "Déposer le dossier complet à la mairie, qui procède ensuite à la publication des bans, affichés au minimum dix jours avant la cérémonie civile",
          "Prévoir une marge de sécurité : un document manquant ou une traduction à refaire peut coûter plusieurs semaines",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "La règle d'or : demandez la liste précise des pièces à votre mairie avant de figer quoi que ce soit. Deux mairies, ou deux nationalités, ne demandent pas toujours exactement les mêmes documents.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Ces démarches s'ajoutent au dossier de mariage classique : retrouvez le socle commun (pièces, bans, délais) dans notre guide [dossier mairie, bans et délais](/blog/dossier-mairie-bans-mariage-delais). Si vous hésitez encore sur le statut juridique du couple, notre comparatif [PACS ou mariage](/blog/pacs-ou-mariage-choisir) peut éclairer le choix. Dans Fiancé, ajoutez chaque pièce administrative comme une tâche datée dans la [timeline](/tools/timeline) pour ne pas rater le délai consulaire.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A wedding between a French citizen and a foreign national is held at the town hall like any other civil wedding. The difference isn't in the ceremony, it's in the file: the town hall asks for extra documents to confirm that the foreign spouse is genuinely free to marry under their own national law.",
          "Those documents often come from a consulate or embassy, on timelines you don't control. It's the first thing to plan for, well ahead of decor or the seating chart.",
        ],
      },
      {
        type: "list",
        title: "The extra documents to gather",
        items: [
          "A full copy of the foreign spouse's birth certificate, translated into French by a sworn translator and less than six months old",
          "A certificate of custom (certificat de coutume), issued by the consulate or embassy of the country of origin",
          "A certificate of single status or capacity to marry, when the law of the country of origin requires it",
          "Proof of address and a valid ID for each of the two future spouses",
        ],
      },
      {
        type: "text",
        title: "The certificate of custom, the piece to start early",
        paragraphs: [
          "The certificate of custom confirms that the foreign spouse is free to marry under their country's law: of legal age under that law, unmarried, legally able to commit. It's issued by the consulate or embassy of the country of origin, sometimes by a specialized notary or lawyer.",
          "Lead times vary from one consulate to another, often four to eight weeks. Since nothing gets signed at the town hall until the file is complete, that single wait can push back your civil date. Check with the relevant consulate as soon as a date is on the table.",
        ],
      },
      {
        type: "text",
        title: "Translations and legalization",
        paragraphs: [
          "Documents in a foreign language generally have to be translated by a translator sworn before a French court of appeal. Some countries also require legalization or an apostille on civil-status records. These steps add to the consulate's lead time, they don't replace it.",
          "One exception worth knowing: refugees, beneficiaries of subsidiary protection, and stateless persons no longer need a certificate of custom to marry in France. Other nationals still do.",
        ],
      },
      {
        type: "list",
        title: "The town-hall timeline to respect",
        items: [
          "Contact the town hall where you'll marry at least two months before the desired date to get the exact list of documents (it can vary by nationality)",
          "In parallel, request the certificate of custom from the consulate, since that's the longest and least predictable wait",
          "File the complete dossier with the town hall, which then publishes the banns, posted at least ten days before the civil ceremony",
          "Build in a safety margin: a missing document or a translation to redo can cost several weeks",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "The golden rule: ask your town hall for the precise document list before you lock anything in. Two town halls, or two nationalities, don't always require exactly the same papers.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "These steps sit on top of the standard marriage file: find the common base (documents, banns, deadlines) in our guide to [the town-hall file, banns and deadlines](/blog/dossier-mairie-bans-mariage-delais). If you're still weighing the legal status of the couple, our [PACS vs marriage](/blog/pacs-ou-mariage-choisir) comparison can help. In Fiancé, add each administrative document as a dated task in your [timeline](/tools/timeline) so you don't miss the consular deadline.",
        ],
      },
    ],
  }),

  postPair({
    slug: "mariage-impots-declaration-commune",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Mariage et impôts : la déclaration de l'année du mariage",
    titleEn: "Marriage and taxes: filing for the year you marry",
    excerptFr:
      "Imposition commune, quotient familial, choix de la première année : ce que le mariage change pour vos impôts, et pourquoi la déclaration séparée reste parfois avantageuse.",
    excerptEn:
      "Joint taxation, family quotient, the first-year choice: what marriage changes for your taxes, and why filing separately can still pay off.",
    readingMinutes: 6,
    heroAltFr: "Couple marié remplissant sa déclaration d'impôts commune",
    heroAltEn: "Married couple filling in their joint tax return",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le mariage a un effet fiscal direct : à partir de l'union, vous formez un seul foyer fiscal et déclarez vos revenus ensemble. Pour beaucoup de couples, c'est un allègement ; pour d'autres, l'effet est neutre. La bonne surprise, c'est que l'année du mariage, l'administration vous laisse le choix.",
          "Cet article explique le principe et les options. Il ne remplace pas une simulation sur votre situation réelle, que le site des impôts permet de faire gratuitement.",
        ],
      },
      {
        type: "text",
        title: "Le principe de l'imposition commune",
        paragraphs: [
          "En vous mariant, vous passez d'un calcul individuel à un calcul commun. Les revenus des deux conjoints sont additionnés, puis le foyer bénéficie de deux parts au titre du quotient familial. Ce mécanisme limite l'effet de la progressivité de l'impôt.",
          "L'avantage est d'autant plus marqué que les revenus des deux conjoints sont déséquilibrés : le revenu le plus élevé est en partie « lissé » par la part du conjoint moins imposé. Quand les deux revenus sont proches, le gain est souvent faible, voire nul.",
        ],
      },
      {
        type: "list",
        title: "L'année du mariage : deux options",
        items: [
          "Option par défaut : une déclaration commune couvrant toute l'année civile, même si vous vous êtes mariés en décembre",
          "Option possible : deux déclarations séparées pour cette seule première année, chacun déclarant ses propres revenus",
          "Le choix se fait au moment de la déclaration, en ligne, pour l'année du mariage uniquement",
          "Les années suivantes, la déclaration commune devient la règle",
        ],
      },
      {
        type: "text",
        title: "Comment choisir pour la première année",
        paragraphs: [
          "Il n'y a pas de réponse unique. Quand un conjoint gagne nettement plus que l'autre, la déclaration commune est souvent la plus intéressante. Quand les deux revenus sont comparables, ou quand l'un a bénéficié d'un crédit d'impôt lié à sa situation individuelle, la déclaration séparée peut être plus favorable pour cette année-là.",
          "Le réflexe utile : faire les deux calculs. Le simulateur officiel de l'administration permet de comparer les deux scénarios avant de valider votre déclaration.",
        ],
      },
      {
        type: "text",
        title: "Ce qui change aussi concrètement",
        paragraphs: [
          "Au-delà du calcul, pensez à signaler votre changement de situation à l'administration fiscale dans les jours qui suivent le mariage : cela permet d'ajuster votre taux de prélèvement à la source. Vous pouvez opter pour un taux commun au foyer ou conserver un taux individualisé selon vos revenus respectifs.",
          "Le mariage peut aussi avoir un effet sur d'autres postes indexés sur les revenus du foyer (certaines aides, cotisations ou plafonds). Ces effets dépendent trop de chaque situation pour être généralisés : c'est le moment de faire le point, idéalement avec un conseiller.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Un réflexe simple vaut mieux qu'une règle mémorisée : l'année du mariage, simulez les deux options avant de valider. Les années suivantes, la question ne se pose plus.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Le volet fiscal fait partie des démarches d'après-mariage, au même titre que le [changement de nom](/blog/changement-nom-apres-mariage). Si vous en êtes encore à comparer les statuts, notre guide [PACS ou mariage](/blog/pacs-ou-mariage-choisir) détaille aussi les différences fiscales. Côté budget des préparatifs, le [simulateur budget](/tools/budget-calculator) reste centré sur le coût du mariage lui-même, pas sur l'impôt.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Marriage has a direct tax effect: from the wedding on, you form a single tax household and declare your income together. For many couples that means a lower bill; for others the effect is neutral. The good news is that in the year you marry, the tax office lets you choose.",
          "This article explains the principle and the options. It doesn't replace a simulation on your actual situation, which the tax website lets you run for free.",
        ],
      },
      {
        type: "text",
        title: "The principle of joint taxation",
        paragraphs: [
          "By marrying, you move from an individual calculation to a joint one. Both spouses' incomes are added together, then the household gets two shares under the family-quotient system. That mechanism softens the impact of the tax brackets.",
          "The benefit is greater the more unequal the two incomes are: the higher income is partly smoothed by the lower-taxed spouse's share. When both incomes are close, the gain is often small, sometimes nil.",
        ],
      },
      {
        type: "list",
        title: "The year you marry: two options",
        items: [
          "Default option: a single joint return covering the whole calendar year, even if you married in December",
          "Available option: two separate returns for this first year only, each declaring their own income",
          "The choice is made when you file, online, for the year of the marriage only",
          "From the following years on, the joint return becomes the rule",
        ],
      },
      {
        type: "text",
        title: "How to choose for the first year",
        paragraphs: [
          "There's no single answer. When one spouse earns clearly more than the other, the joint return is often the better deal. When both incomes are comparable, or when one benefited from a tax credit tied to their individual situation, separate returns can be more favorable for that year.",
          "The useful reflex: run both calculations. The tax office's official simulator lets you compare the two scenarios before you confirm your return.",
        ],
      },
      {
        type: "text",
        title: "What else changes in practice",
        paragraphs: [
          "Beyond the calculation, report your change of situation to the tax office within the days after the wedding: this lets you adjust your withholding rate. You can opt for a single household rate or keep an individualized rate based on your respective incomes.",
          "Marriage can also affect other items indexed on household income (some benefits, contributions, or thresholds). These effects depend too much on each situation to generalize: it's a good moment to review, ideally with an adviser.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "A simple reflex beats a memorized rule: in the year you marry, simulate both options before confirming. From then on, the question no longer comes up.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "The tax side belongs to the after-wedding steps, alongside the [name change](/blog/changement-nom-apres-mariage). If you're still comparing statuses, our [PACS vs marriage](/blog/pacs-ou-mariage-choisir) guide also covers the tax differences. On the planning-budget side, the [budget calculator](/tools/budget-calculator) stays focused on the cost of the wedding itself, not on tax.",
        ],
      },
    ],
  }),

  postPair({
    slug: "donation-entre-epoux-proteger-conjoint",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Donation entre époux : protéger son conjoint pour l'avenir",
    titleEn: "Gift between spouses: protecting your partner for the future",
    excerptFr:
      "La donation au dernier vivant renforce les droits du conjoint survivant, quel que soit le régime matrimonial. Ce qu'elle apporte, pourquoi elle passe par un notaire, et en quoi elle diffère du contrat de mariage.",
    excerptEn:
      "A gift to the last living spouse strengthens the survivor's rights, whatever the matrimonial regime. What it adds, why it goes through a notary, and how it differs from the marriage contract.",
    readingMinutes: 6,
    heroAltFr: "Couple signant une donation entre époux chez le notaire",
    heroAltEn: "Couple signing a gift between spouses at the notary",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Se marier change déjà la place du conjoint dans la succession : le conjoint survivant est un héritier protégé, ce qui n'est pas le cas d'un simple partenaire de PACS ou d'un concubin. Mais ses droits restent parfois limités, surtout en présence d'enfants. La donation entre époux, ou « donation au dernier vivant », sert précisément à les renforcer.",
          "C'est un outil de prévoyance, pas une formalité de mariage. Beaucoup de couples ne s'y intéressent qu'à l'achat d'un logement ou à l'arrivée d'un enfant. Le principe mérite pourtant d'être connu dès le mariage.",
        ],
      },
      {
        type: "text",
        title: "Ce que le mariage donne déjà, et ce qui manque",
        paragraphs: [
          "En l'absence de disposition particulière, le conjoint survivant hérite, mais sa part dépend des autres héritiers. Avec des enfants communs, il reçoit en général le choix entre l'usufruit de la totalité ou le quart en pleine propriété. En présence d'enfants d'une autre union, l'usufruit total n'est plus une option automatique.",
          "La donation au dernier vivant vient élargir cet éventail. Elle permet d'améliorer, parfois nettement, la situation du survivant, sans déshériter les enfants pour autant.",
        ],
      },
      {
        type: "list",
        title: "Ce qu'apporte la donation au dernier vivant",
        items: [
          "Elle augmente la part que le conjoint survivant peut recevoir, au-delà de ce que la loi prévoit par défaut",
          "Elle offre un choix au moment du décès, souvent entre l'usufruit de tous les biens, un quart en pleine propriété avec le reste en usufruit, ou la quotité disponible en pleine propriété",
          "Elle ne prend effet qu'au premier décès et porte sur les biens présents à ce moment-là, pas sur le patrimoine actuel",
          "Elle reste utile même sans enfant, en présence d'autres héritiers comme les parents du défunt",
        ],
      },
      {
        type: "text",
        title: "Chez le notaire, et révocable",
        paragraphs: [
          "La donation entre époux doit être établie par acte notarié : c'est une condition de validité, pas une simple recommandation. Elle peut être signée à tout moment pendant le mariage, avant ou après un achat immobilier.",
          "Point rassurant : elle est révocable. Chaque époux peut l'annuler seul, sans avoir à se justifier ni même à prévenir l'autre, y compris quand la donation était réciproque. Elle n'enferme donc pas le couple dans un engagement définitif.",
        ],
      },
      {
        type: "text",
        title: "Donation et contrat de mariage : deux outils distincts",
        paragraphs: [
          "Le contrat de mariage organise la propriété des biens pendant l'union (qui possède quoi, comment sont gérés les biens communs). La donation au dernier vivant, elle, organise la transmission au décès. Les deux se combinent : on peut être marié sous séparation de biens et prévoir une donation entre époux.",
          "Autrement dit, choisir son régime matrimonial ne suffit pas à couvrir la question de la protection du survivant. Ce sont deux décisions à examiner séparément, idéalement avec un notaire.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Ce n'est pas un sujet réservé aux gros patrimoines. Dès qu'il y a un logement, des enfants, ou une famille recomposée, la question de la protection du conjoint mérite d'être posée.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Cette décision se prépare en même temps que le régime matrimonial : voir notre guide [contrat de mariage et régimes matrimoniaux](/blog/contrat-mariage-regimes-matrimoniaux). Si vous comparez encore les statuts du couple, [PACS ou mariage](/blog/pacs-ou-mariage-choisir) détaille les différences de protection. Ajoutez le rendez-vous notaire comme une tâche dans votre [timeline](/tools/timeline) pour ne pas le repousser indéfiniment.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Marriage already changes the spouse's place in inheritance: the surviving spouse is a protected heir, which a mere civil-partnership partner or cohabitant is not. But those rights can still be limited, especially when there are children. A gift between spouses, or \"gift to the last living\", exists precisely to strengthen them.",
          "It's a planning tool, not a wedding formality. Many couples only look into it when buying a home or having a child. Yet the principle is worth knowing from the wedding on.",
        ],
      },
      {
        type: "text",
        title: "What marriage already gives, and what's missing",
        paragraphs: [
          "With no specific arrangement, the surviving spouse inherits, but their share depends on the other heirs. With shared children, they generally get a choice between the usufruct of everything or a quarter in full ownership. When there are children from another union, full usufruct is no longer an automatic option.",
          "The gift to the last living broadens that range. It can improve, sometimes markedly, the survivor's position, without disinheriting the children.",
        ],
      },
      {
        type: "list",
        title: "What the gift to the last living adds",
        items: [
          "It increases the share the surviving spouse can receive, beyond what the law provides by default",
          "It offers a choice at the time of death, often between the usufruct of all assets, a quarter in full ownership with the rest in usufruct, or the disposable portion in full ownership",
          "It only takes effect at the first death and covers the assets present at that moment, not today's estate",
          "It stays useful even without children, when other heirs such as the deceased's parents are involved",
        ],
      },
      {
        type: "text",
        title: "At the notary, and revocable",
        paragraphs: [
          "A gift between spouses must be drawn up as a notarial deed: that's a condition of validity, not just a recommendation. It can be signed at any point during the marriage, before or after buying property.",
          "A reassuring point: it's revocable. Each spouse can cancel it alone, without having to justify it or even tell the other, even when the gift was reciprocal. So it doesn't lock the couple into a permanent commitment.",
        ],
      },
      {
        type: "text",
        title: "Gift and marriage contract: two distinct tools",
        paragraphs: [
          "The marriage contract organizes ownership during the union (who owns what, how shared assets are managed). The gift to the last living organizes transmission at death. The two combine: you can be married under separation of property and still set up a gift between spouses.",
          "In other words, choosing your matrimonial regime doesn't cover the question of protecting the survivor. These are two decisions to examine separately, ideally with a notary.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "This isn't a topic reserved for large estates. As soon as there's a home, children, or a blended family, the question of protecting the spouse is worth raising.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "This decision is prepared alongside the matrimonial regime: see our guide to [the marriage contract and matrimonial regimes](/blog/contrat-mariage-regimes-matrimoniaux). If you're still comparing the couple's statuses, [PACS vs marriage](/blog/pacs-ou-mariage-choisir) details the differences in protection. Add the notary appointment as a task in your [timeline](/tools/timeline) so you don't keep pushing it back.",
        ],
      },
    ],
  }),

  postPair({
    slug: "ceremonies-religieuses-juive-musulmane-protestante-orthodoxe",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Cérémonies religieuses : juive, musulmane, protestante, orthodoxe",
    titleEn: "Religious ceremonies: Jewish, Muslim, Protestant, Orthodox",
    excerptFr:
      "Au-delà du mariage catholique : conditions, durée et préparation de quatre traditions religieuses, et comment chacune s'articule avec le mariage civil obligatoire.",
    excerptEn:
      "Beyond the Catholic wedding: conditions, length, and preparation for four religious traditions, and how each fits with the mandatory civil marriage.",
    readingMinutes: 8,
    heroAltFr: "Différentes cérémonies de mariage religieux",
    heroAltEn: "Different religious wedding ceremonies",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "En France, seul le mariage civil a une valeur légale. Toute cérémonie religieuse est symbolique aux yeux de la loi et se célèbre après le passage en mairie ; les officiants demandent d'ailleurs souvent l'acte de mariage civil avant de célébrer. Ce cadre commun posé, chaque tradition a ses propres conditions, sa durée et sa préparation.",
          "Ce guide donne des repères pour quatre cérémonies fréquemment recherchées en dehors du mariage catholique. Il ne remplace pas l'échange avec le responsable religieux concerné, qui reste la source à jour pour votre situation.",
        ],
      },
      {
        type: "list",
        title: "Mariage juif : la houppa",
        items: [
          "La cérémonie se tient sous la houppa, un dais qui symbolise le futur foyer du couple",
          "La kettouba, contrat de mariage religieux, est lue et signée devant témoins",
          "La veille, la mariée se rend souvent au bain rituel (mikvé) et reçoit une attestation utile à la célébration",
          "La cérémonie dure généralement de trente à quarante-cinq minutes et se conclut par le bris du verre",
        ],
      },
      {
        type: "list",
        title: "Mariage musulman : le nikah",
        items: [
          "Le nikah est le contrat de mariage religieux, célébré par un imam ou un responsable de la mosquée",
          "Le consentement des deux époux et la présence de témoins en sont des éléments centraux",
          "La cérémonie religieuse elle-même est souvent brève, parfois une vingtaine de minutes",
          "Les célébrations familiales, en revanche, peuvent s'étendre sur plusieurs jours selon les traditions culturelles",
        ],
      },
      {
        type: "list",
        title: "Mariage protestant : la bénédiction nuptiale",
        items: [
          "La cérémonie prend la forme d'une bénédiction nuptiale, centrée sur la lecture biblique, l'engagement et la prière",
          "Elle se déroule au temple, avec un pasteur, et laisse souvent une place aux textes choisis par le couple",
          "Selon les dénominations, le baptême de l'un des conjoints peut être demandé, ou non",
          "Une préparation avec le pasteur est prévue en amont, sur plusieurs rencontres",
        ],
      },
      {
        type: "list",
        title: "Mariage orthodoxe : le couronnement",
        items: [
          "Le rite central est le couronnement des époux, qui donne son nom à la cérémonie",
          "Le mariage orthodoxe requiert en principe le baptême orthodoxe d'au moins un des conjoints",
          "La cérémonie dure environ une heure et suit un déroulé très codifié",
          "La préparation se fait avec le prêtre de la paroisse, qui précise les documents attendus",
        ],
      },
      {
        type: "text",
        title: "Les mariages interreligieux",
        paragraphs: [
          "Quand les deux conjoints n'ont pas la même religion, une cérémonie est parfois possible, mais les conditions varient fortement selon les traditions et les communautés. Certaines demandes touchent à des sujets sensibles, comme l'éducation religieuse des futurs enfants.",
          "Dans ce cas, le mieux est d'aborder la question tôt, directement avec les responsables religieux des deux côtés. Une cérémonie laïque, après le civil, reste aussi une option qui permet de composer un rituel sur mesure, sans cadre confessionnel imposé.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Quel que soit le rite, prévoyez le mariage civil d'abord et la préparation religieuse en parallèle : les rencontres avec l'officiant s'étalent souvent sur plusieurs mois.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour le mariage catholique, voir notre guide dédié [préparer une cérémonie religieuse catholique](/blog/ceremonie-religieuse-catholique-preparer). Si vous penchez pour une cérémonie symbolique sans cadre confessionnel, [choisir et préparer un officiant de cérémonie laïque](/blog/ceremonie-laique-choisir-officiant) détaille la démarche. Dans Fiancé, calez les rencontres de préparation et l'ordre des cérémonies dans le [planning du jour J](/blog/planning-jour-j-minute-par-minute).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "In France, only the civil marriage has legal standing. Any religious ceremony is symbolic in the eyes of the law and is held after the town hall; officiants often ask to see the civil marriage certificate before celebrating. With that common frame set, each tradition has its own conditions, length, and preparation.",
          "This guide gives markers for four ceremonies frequently searched beyond the Catholic wedding. It doesn't replace a conversation with the relevant religious leader, who remains the up-to-date source for your situation.",
        ],
      },
      {
        type: "list",
        title: "Jewish wedding: the chuppah",
        items: [
          "The ceremony takes place under the chuppah, a canopy symbolizing the couple's future home",
          "The ketubah, the religious marriage contract, is read and signed before witnesses",
          "The day before, the bride often goes to the ritual bath (mikveh) and receives a certificate useful for the celebration",
          "The ceremony generally lasts thirty to forty-five minutes and ends with the breaking of the glass",
        ],
      },
      {
        type: "list",
        title: "Muslim wedding: the nikah",
        items: [
          "The nikah is the religious marriage contract, celebrated by an imam or a mosque official",
          "The consent of both spouses and the presence of witnesses are central elements",
          "The religious ceremony itself is often short, sometimes around twenty minutes",
          "The family celebrations, by contrast, can span several days depending on cultural traditions",
        ],
      },
      {
        type: "list",
        title: "Protestant wedding: the nuptial blessing",
        items: [
          "The ceremony takes the form of a nuptial blessing, centered on scripture reading, commitment, and prayer",
          "It's held in the temple, with a pastor, and often leaves room for texts chosen by the couple",
          "Depending on the denomination, the baptism of one spouse may or may not be required",
          "Preparation with the pastor is arranged beforehand, over several meetings",
        ],
      },
      {
        type: "list",
        title: "Orthodox wedding: the crowning",
        items: [
          "The central rite is the crowning of the spouses, which gives the ceremony its name",
          "An Orthodox wedding in principle requires the Orthodox baptism of at least one spouse",
          "The ceremony lasts about an hour and follows a highly codified order",
          "Preparation is done with the parish priest, who specifies the documents expected",
        ],
      },
      {
        type: "text",
        title: "Interfaith weddings",
        paragraphs: [
          "When the two spouses don't share the same religion, a ceremony is sometimes possible, but the conditions vary widely by tradition and community. Some questions touch on sensitive subjects, such as the religious upbringing of future children.",
          "In that case, it's best to raise the topic early, directly with religious leaders on both sides. A secular ceremony, after the civil one, also remains an option that lets you build a custom ritual with no imposed denominational frame.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Whatever the rite, plan the civil marriage first and the religious preparation in parallel: meetings with the officiant often stretch over several months.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "For the Catholic wedding, see our dedicated guide to [preparing a Catholic religious ceremony](/blog/ceremonie-religieuse-catholique-preparer). If you lean toward a symbolic ceremony with no denominational frame, [choosing and preparing a secular-ceremony officiant](/blog/ceremonie-laique-choisir-officiant) walks through the process. In Fiancé, slot the preparation meetings and the order of ceremonies into your [wedding-day timeline](/blog/planning-jour-j-minute-par-minute).",
        ],
      },
    ],
  }),

  postPair({
    slug: "diner-de-repetition-mariage",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Le dîner de répétition : faut-il l'organiser ?",
    titleEn: "The rehearsal dinner: is it worth organizing?",
    excerptFr:
      "Répétition de la cérémonie puis dîner la veille : une tradition venue d'Amérique du Nord qui s'installe en France. Qui inviter, qui paye, et quand la placer sans sacrifier le repos.",
    excerptEn:
      "A ceremony rehearsal then dinner the night before: a North American tradition taking hold in France. Who to invite, who pays, and when to slot it without sacrificing rest.",
    readingMinutes: 6,
    heroAltFr: "Dîner de répétition en petit comité la veille du mariage",
    heroAltEn: "Small rehearsal dinner the night before the wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le dîner de répétition est un repas plus intime que le mariage lui-même, organisé le plus souvent la veille, après une répétition de la cérémonie. La coutume est très ancrée en Amérique du Nord ; en France, elle reste optionnelle mais gagne du terrain, surtout pour les cérémonies laïques où le déroulé est écrit sur mesure.",
          "L'idée n'est pas d'ajouter un deuxième mariage. C'est un moment simple pour réunir les proches, caler les derniers rôles et relâcher la pression avant le jour J.",
        ],
      },
      {
        type: "text",
        title: "La répétition de la cérémonie",
        paragraphs: [
          "La répétition sert surtout quand la cérémonie sort du cadre standard : cortège d'entrée, rituels symboliques, discours enchaînés, placement précis des intervenants. Faire un passage à blanc évite les hésitations et les blancs le jour même.",
          "Pour un mariage civil seul, où le déroulé est court et guidé par l'officier d'état civil, la répétition est rarement nécessaire. C'est surtout la cérémonie laïque ou religieuse, plus longue et personnalisée, qui en profite.",
        ],
      },
      {
        type: "list",
        title: "À quoi sert le dîner de répétition",
        items: [
          "Réunir les proches qui ont aidé pendant les préparatifs et les remercier, éventuellement avec un petit cadeau",
          "Attribuer ou confirmer les rôles du jour J (accueil, coordination, discours) dans un cadre détendu",
          "Permettre aux familles et aux témoins des deux côtés de faire connaissance avant le grand jour",
          "Faire retomber la tension d'un cran, plutôt que d'arriver au jour J sans avoir vu ses proches",
        ],
      },
      {
        type: "text",
        title: "Qui inviter, qui organise",
        paragraphs: [
          "Le dîner de répétition se limite en général au cercle proche : parents, grands-parents, fratrie, témoins, demoiselles et garçons d'honneur, parfois les invités venus de loin. Inviter trop large le transforme en pré-mariage coûteux, ce qui n'est pas le but.",
          "Traditionnellement, il est organisé par les parents des mariés, ou par les témoins. Mais beaucoup de couples s'en chargent eux-mêmes, dans un format volontairement simple : restaurant, traiteur léger, ou repas à la maison.",
        ],
      },
      {
        type: "text",
        title: "Quand le placer",
        paragraphs: [
          "Le classique, c'est la veille au soir, après la répétition. L'avantage : tout le monde est déjà sur place. Le risque : finir tard et entamer sa nuit de sommeil avant le jour le plus long.",
          "Si vos proches sont disponibles plus tôt, un dîner le week-end précédent peut être plus reposant. Dans tous les cas, gardez la veille au soir courte et protégez votre sommeil : c'est le meilleur cadeau à se faire avant le jour J.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Un dîner de répétition réussi finit tôt. Son but est de détendre, pas de lancer la fête un jour trop tôt au prix d'une nuit blanche.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Le dîner de répétition prépare directement les rôles du lendemain : voir [répartir les rôles le jour J](/blog/repartir-roles-jour-j-mariage). Pour la soirée d'avant elle-même, notre guide [la veille et la nuit avant le mariage](/blog/nuit-avant-mariage-preparation) rappelle ce qui compte vraiment pour arriver reposé. Si votre cérémonie est laïque, la répétition se cale bien avec [choisir et préparer un officiant](/blog/ceremonie-laique-choisir-officiant).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The rehearsal dinner is a more intimate meal than the wedding itself, usually held the night before, after a ceremony rehearsal. The custom is deeply rooted in North America; in France it stays optional but is gaining ground, especially for secular ceremonies where the run of show is written from scratch.",
          "The idea isn't to add a second wedding. It's a simple moment to gather close ones, settle the last roles, and let the pressure off before the big day.",
        ],
      },
      {
        type: "text",
        title: "The ceremony rehearsal",
        paragraphs: [
          "The rehearsal mainly helps when the ceremony leaves the standard frame: entrance procession, symbolic rituals, back-to-back speeches, precise placement of participants. A dry run avoids hesitation and awkward silences on the day.",
          "For a civil marriage alone, where the run of show is short and led by the registrar, a rehearsal is rarely needed. It's the secular or religious ceremony, longer and personalized, that benefits most.",
        ],
      },
      {
        type: "list",
        title: "What the rehearsal dinner is for",
        items: [
          "Gathering the close ones who helped during planning and thanking them, possibly with a small gift",
          "Assigning or confirming the wedding-day roles (welcome, coordination, speeches) in a relaxed setting",
          "Letting families and witnesses from both sides get to know each other before the big day",
          "Bringing the tension down a notch, rather than arriving on the day without having seen your loved ones",
        ],
      },
      {
        type: "text",
        title: "Who to invite, who organizes",
        paragraphs: [
          "The rehearsal dinner generally stays within the inner circle: parents, grandparents, siblings, witnesses, bridesmaids and groomsmen, sometimes guests coming from far away. Inviting too broadly turns it into a costly pre-wedding, which isn't the point.",
          "Traditionally, it's organized by the couple's parents, or by the witnesses. But many couples take it on themselves, in a deliberately simple format: a restaurant, light catering, or a meal at home.",
        ],
      },
      {
        type: "text",
        title: "When to schedule it",
        paragraphs: [
          "The classic slot is the evening before, after the rehearsal. The upside: everyone is already on site. The risk: finishing late and eating into your sleep before the longest day.",
          "If your close ones are free earlier, a dinner the previous weekend can be more restful. Either way, keep the evening before short and protect your sleep: it's the best gift to give yourself before the big day.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "A good rehearsal dinner ends early. Its purpose is to relax, not to start the party a day too soon at the cost of a sleepless night.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "The rehearsal dinner directly sets up the next day's roles: see [dividing up wedding-day roles](/blog/repartir-roles-jour-j-mariage). For the evening before itself, our guide to [the night before the wedding](/blog/nuit-avant-mariage-preparation) recalls what really matters for arriving rested. If your ceremony is secular, the rehearsal pairs well with [choosing and preparing an officiant](/blog/ceremonie-laique-choisir-officiant).",
        ],
      },
    ],
  }),

  postPair({
    slug: "voiture-des-maries-cortege-transport",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "La voiture des mariés et le cortège : options et logistique",
    titleEn: "The wedding car and procession: options and logistics",
    excerptFr:
      "Voiture de location, véhicule insolite ou la sienne : comment choisir, réserver et décorer, et surtout comment caler les trajets pour ne pas prendre de retard entre la mairie et le lieu de réception.",
    excerptEn:
      "Rental car, unusual vehicle, or your own: how to choose, book, and decorate it, and above all how to time the drives so you don't fall behind between the town hall and the venue.",
    readingMinutes: 6,
    heroAltFr: "Voiture des mariés décorée devant le lieu de réception",
    heroAltEn: "Decorated wedding car in front of the venue",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "La voiture des mariés est un détail qui pèse plus qu'il n'y paraît : c'est le fil qui relie la mairie, la cérémonie et le lieu de réception. Un beau véhicule qui arrive en retard désorganise tout le début de journée. Avant l'esthétique, c'est donc une question de logistique.",
          "Bonne nouvelle : c'est un poste simple à régler, à condition de le décider quelques mois avant et de le penser en même temps que le déroulé horaire du jour J.",
        ],
      },
      {
        type: "list",
        title: "Les options de véhicule",
        items: [
          "Voiture de collection ou vintage, pour un style intemporel sur les photos",
          "Berline ou limousine de luxe avec chauffeur, pour le confort et l'espace",
          "Véhicule insolite (2 CV, side-car, petit train, calèche) pour une touche personnelle",
          "Sa propre voiture ou celle d'un proche, simplement décorée : l'option la plus économique",
        ],
      },
      {
        type: "text",
        title: "Réserver et budgéter",
        paragraphs: [
          "Pour un véhicule de location, comptez une réservation quatre à six mois à l'avance, davantage en haute saison. Vérifiez ce qu'inclut le tarif : chauffeur, kilométrage, temps d'attente entre les étapes, décoration éventuelle.",
          "Le poste reste modeste au regard du reste du budget, sauf si vous multipliez les véhicules pour tout le cortège. Dans ce cas, une seule voiture pour les mariés et des trajets groupés pour les invités coûtent souvent moins qu'une flotte complète.",
        ],
      },
      {
        type: "list",
        title: "Organiser le cortège",
        items: [
          "Traditionnellement, les mariés voyagent séparément jusqu'au lieu de la cérémonie et se retrouvent sur place",
          "La décoration du cortège se veut cohérente : souvent un même ruban ou tulle distribué aux voitures des proches",
          "Désignez qui conduit quel véhicule et communiquez l'itinéraire à l'avance, surtout si le trajet est long",
          "Prévoyez une voiture « tampon » pour les personnes clés (témoins, enfants d'honneur) afin qu'elles ne dépendent pas d'un covoiturage incertain",
        ],
      },
      {
        type: "text",
        title: "La logistique horaire, le vrai enjeu",
        paragraphs: [
          "Le piège classique, c'est de sous-estimer les trajets. Entre la préparation, la mairie, la cérémonie et le lieu de réception, chaque changement de lieu ajoute des minutes de route, de stationnement et d'attente. Additionnez-les honnêtement dans votre déroulé.",
          "Ajoutez une marge pour les imprévus : circulation, invités perdus, photo de groupe qui déborde. Un cortège qui part avec dix minutes d'avance rattrape ce qu'un départ à l'heure pile ne pardonne pas.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "La plus belle voiture ne sert à rien si elle arrive en retard. Réservez pour le style, mais planifiez pour l'horaire : ce sont deux décisions différentes.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Les trajets des mariés se calent dans le même déroulé que le reste : voir [planning jour J minute par minute](/blog/planning-jour-j-minute-par-minute). Pour le transport des invités entre les lieux, notre guide [hébergement et navettes invités](/blog/transport-navette-invites-mariage) complète l'organisation. Et si un imprévu survient malgré tout, [les 10 imprévus classiques le jour J](/blog/imprevus-jour-j-mariage) donne les réponses simples à préparer.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The wedding car is a detail that weighs more than it looks: it's the thread linking the town hall, the ceremony, and the venue. A gorgeous vehicle that arrives late throws off the whole start of the day. Before aesthetics, it's a matter of logistics.",
          "Good news: it's a simple item to settle, as long as you decide a few months ahead and think about it alongside the day's timeline.",
        ],
      },
      {
        type: "list",
        title: "Vehicle options",
        items: [
          "A classic or vintage car, for a timeless look in the photos",
          "A luxury sedan or limousine with a driver, for comfort and space",
          "An unusual vehicle (vintage car, sidecar, mini-train, horse-drawn carriage) for a personal touch",
          "Your own car or a friend's, simply decorated: the most economical option",
        ],
      },
      {
        type: "text",
        title: "Booking and budgeting",
        paragraphs: [
          "For a rental vehicle, count on booking four to six months ahead, more in peak season. Check what the price includes: driver, mileage, waiting time between stops, any decoration.",
          "The item stays modest against the rest of the budget, unless you multiply vehicles for the whole procession. In that case, a single car for the couple and grouped rides for guests often cost less than a full fleet.",
        ],
      },
      {
        type: "list",
        title: "Organizing the procession",
        items: [
          "Traditionally, the couple travel separately to the ceremony and meet on site",
          "The procession's decoration should be consistent: often a single ribbon or tulle handed to the close ones' cars",
          "Assign who drives which vehicle and share the route in advance, especially if the drive is long",
          "Plan a \"buffer\" car for key people (witnesses, flower children) so they don't depend on an uncertain carpool",
        ],
      },
      {
        type: "text",
        title: "The timing logistics, the real challenge",
        paragraphs: [
          "The classic trap is underestimating the drives. Between getting ready, the town hall, the ceremony, and the venue, each change of location adds minutes of driving, parking, and waiting. Add them up honestly in your run of show.",
          "Build in a margin for surprises: traffic, lost guests, a group photo that overruns. A procession that leaves ten minutes early makes up for what a departure right on time won't forgive.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "The finest car is useless if it arrives late. Book for style, but plan for the schedule: those are two different decisions.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "The couple's drives fit into the same run of show as everything else: see [the minute-by-minute wedding-day timeline](/blog/planning-jour-j-minute-par-minute). For moving guests between locations, our guide to [guest accommodation and shuttles](/blog/transport-navette-invites-mariage) rounds out the organization. And if something unexpected happens anyway, [the 10 classic wedding-day surprises](/blog/imprevus-jour-j-mariage) gives the simple answers to prepare.",
        ],
      },
    ],
  }),

  postPair({
    slug: "se-marier-enceinte-mariage-grossesse",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Se marier enceinte : organiser un mariage pendant la grossesse",
    titleEn: "Getting married pregnant: planning a wedding during pregnancy",
    excerptFr:
      "Choisir le bon trimestre, une robe qui suit la silhouette, du confort le jour J et un menu adapté : comment ajuster l'organisation sans renoncer au mariage que vous voulez.",
    excerptEn:
      "Choosing the right trimester, a dress that follows your shape, comfort on the day, and an adapted menu: how to adjust the planning without giving up the wedding you want.",
    readingMinutes: 6,
    heroAltFr: "Future mariée enceinte pendant les préparatifs",
    heroAltEn: "Pregnant bride-to-be during wedding planning",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Se marier enceinte ne change pas la nature des préparatifs, mais il déplace quelques priorités : le confort, le timing et l'énergie deviennent des critères aussi importants que l'esthétique. Bien anticipé, un mariage pendant la grossesse reste tout à fait serein.",
          "Avant tout arbitrage sur les dates ou le rythme, le premier réflexe est d'en parler à votre médecin ou sage-femme : eux seuls peuvent valider ce qui convient à votre grossesse.",
        ],
      },
      {
        type: "text",
        title: "Choisir le moment",
        paragraphs: [
          "Beaucoup de futures mariées se sentent le mieux au deuxième trimestre : les nausées du début sont souvent passées, et la fatigue de la fin de grossesse n'a pas encore commencé. C'est fréquemment la fenêtre la plus confortable pour un événement de plusieurs heures.",
          "Si la date est déjà fixée, on adapte plutôt le déroulé que le calendrier : cérémonie plus courte, moments de pause prévus, et acceptation qu'une partie de la soirée puisse se vivre assise.",
        ],
      },
      {
        type: "list",
        title: "La robe et les chaussures",
        items: [
          "Commencer la recherche de robe vers le milieu de la grossesse, mais prévoir des retouches tardives selon l'évolution de la silhouette",
          "Envisager des modèles évolutifs (taille empire, tissus souples) ou des robes conçues pour les femmes enceintes",
          "Éviter les chaussures neuves et les talons hauts : privilégier des chaussures déjà portées, stables et confortables",
          "Prévoir une deuxième paire plate pour la soirée, comme beaucoup de mariées, mais ici dès le vin d'honneur si besoin",
        ],
      },
      {
        type: "list",
        title: "Confort et repos le jour J",
        items: [
          "Planifier de vrais moments assis dans le déroulé, pas seulement pendant le repas",
          "Anticiper la chaleur en cas de mariage estival : ombre, eau à disposition, éviter les longues stations debout au soleil",
          "S'accorder une courte pause à l'écart si la fatigue monte, sans culpabiliser",
          "Déléguer plus largement les rôles du jour J pour ne rien avoir à coordonner soi-même",
        ],
      },
      {
        type: "text",
        title: "Prévenir les prestataires",
        paragraphs: [
          "Informez le traiteur tôt : il pourra adapter le menu aux aliments déconseillés pendant la grossesse et proposer des alternatives sans que cela se remarque. Prévoyez aussi de quoi grignoter dans la matinée, souvent longue avec la préparation.",
          "Côté organisation générale, une future mariée enceinte gagne à confier davantage. Un témoin ou un proche qui prend en charge la coordination du jour J allège une charge qui pèse plus quand on est enceinte.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Aucune décision d'organisation ne prime sur votre confort et votre santé. Avant de trancher un point sensible (chaleur, station debout, déplacement), demandez l'avis de votre sage-femme ou de votre médecin.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Le choix de la robe se prépare comme pour tout mariage, avec une vigilance sur les retouches : voir [robe de mariée, silhouette et essayages](/blog/robe-de-mariee-guide-choisir) et [chaussures de mariée et confort](/blog/chaussures-mariee-confort). Pour alléger la charge mentale des préparatifs, notre guide [gérer le stress des préparatifs](/blog/gerer-stress-mariage-serenite) s'applique particulièrement ici. Enfin, prévoyez les pauses directement dans le [planning du jour J](/blog/planning-jour-j-minute-par-minute).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Getting married while pregnant doesn't change the nature of the planning, but it shifts a few priorities: comfort, timing, and energy become criteria as important as looks. Well anticipated, a wedding during pregnancy stays entirely calm.",
          "Before any call on dates or pace, the first reflex is to talk to your doctor or midwife: they alone can confirm what suits your pregnancy.",
        ],
      },
      {
        type: "text",
        title: "Choosing the timing",
        paragraphs: [
          "Many brides-to-be feel best in the second trimester: the early nausea has often passed, and late-pregnancy fatigue hasn't set in yet. It's frequently the most comfortable window for an event that runs several hours.",
          "If the date is already set, adjust the run of show rather than the calendar: a shorter ceremony, planned rest moments, and accepting that part of the evening can be spent seated.",
        ],
      },
      {
        type: "list",
        title: "The dress and shoes",
        items: [
          "Start the dress search around mid-pregnancy, but plan for late alterations as the silhouette evolves",
          "Consider adaptable styles (empire waist, soft fabrics) or dresses designed for pregnant women",
          "Avoid new shoes and high heels: favor already-worn, stable, comfortable ones",
          "Plan a second flat pair for the evening, like many brides, but here from the cocktail hour on if needed",
        ],
      },
      {
        type: "list",
        title: "Comfort and rest on the day",
        items: [
          "Plan genuine seated moments in the run of show, not just during the meal",
          "Anticipate heat for a summer wedding: shade, water on hand, avoid long spells standing in the sun",
          "Allow yourself a short break away if fatigue builds, without guilt",
          "Delegate the wedding-day roles more broadly so you have nothing to coordinate yourself",
        ],
      },
      {
        type: "text",
        title: "Briefing your vendors",
        paragraphs: [
          "Tell the caterer early: they can adapt the menu to foods to avoid during pregnancy and offer alternatives without it showing. Also plan something to snack on in the morning, which is often long with getting ready.",
          "On general organization, a pregnant bride-to-be gains from handing off more. A witness or loved one who takes on wedding-day coordination lifts a load that weighs more during pregnancy.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "No planning decision outranks your comfort and health. Before settling a sensitive point (heat, standing, travel), ask your midwife or doctor.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Choosing the dress is prepared as for any wedding, with extra care on alterations: see [the wedding dress, silhouette and fittings](/blog/robe-de-mariee-guide-choisir) and [bridal shoes and comfort](/blog/chaussures-mariee-confort). To lighten the mental load of planning, our guide to [managing wedding planning stress](/blog/gerer-stress-mariage-serenite) applies especially here. Finally, build the breaks straight into your [wedding-day timeline](/blog/planning-jour-j-minute-par-minute).",
        ],
      },
    ],
  }),

  postPair({
    slug: "droit-de-bouchon-vin-mariage",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Le droit de bouchon : apporter son propre vin au mariage",
    titleEn: "Corkage: bringing your own wine to the wedding",
    excerptFr:
      "Entre 4 et 7 € la bouteille en moyenne : comment savoir si acheter son vin fait vraiment économiser une fois le droit de bouchon payé, et comment le vérifier dans le contrat traiteur.",
    excerptEn:
      "Between 4 and 7 € a bottle on average: how to tell whether buying your own wine really saves money once corkage is paid, and how to check it in the caterer's contract.",
    readingMinutes: 6,
    heroAltFr: "Bouteilles de vin apportées pour un mariage",
    heroAltEn: "Wine bottles brought for a wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Les boissons sont l'un des postes où les écarts de prix sont les plus grands d'un mariage. Beaucoup de traiteurs appliquent une marge élevée sur le vin et le champagne qu'ils fournissent. D'où l'intérêt d'une pratique bien connue en France : apporter ses propres bouteilles, moyennant un droit de bouchon.",
          "Mais ce droit n'est pas gratuit, et il ne fait pas toujours gagner. Le bon réflexe n'est pas de l'accepter ou de le refuser par principe, mais de faire le calcul.",
        ],
      },
      {
        type: "text",
        title: "Qu'est-ce que le droit de bouchon",
        paragraphs: [
          "Le droit de bouchon est la somme demandée par le traiteur ou le lieu pour vous autoriser à apporter vos propres boissons. Il correspond au coût du service : ouvrir les bouteilles, servir à table, mettre à disposition et nettoyer les verres.",
          "Il se facture soit par bouteille ouverte, soit par invité. Cette base de calcul change tout : à consommation égale, un forfait par invité peut être plus ou moins avantageux qu'un tarif à la bouteille selon le nombre de convives.",
        ],
      },
      {
        type: "list",
        title: "Combien ça coûte",
        items: [
          "En moyenne, le droit de bouchon se situe entre 4 et 7 € par bouteille",
          "Selon le lieu et la renommée du prestataire, la fourchette réelle peut aller d'environ 3 à 13 € la bouteille",
          "Certains prestataires facturent un forfait par invité plutôt qu'à la bouteille",
          "Quelques lieux appliquent un droit réduit, voire nul, quand on négocie en amont",
        ],
      },
      {
        type: "text",
        title: "Faire le calcul",
        paragraphs: [
          "Comparez deux totaux. D'un côté, le vin fourni par le traiteur, avec sa marge. De l'autre, votre vin acheté vous-même plus le droit de bouchon, plus la logistique (transport, stockage, éventuellement reprise des invendus par le caviste).",
          "L'opération est intéressante surtout si vous avez accès à des bouteilles de qualité à bon prix, et si le droit de bouchon reste raisonnable. À l'inverse, un droit élevé au verre ou par invité peut annuler l'économie. Faites le total pour votre nombre réel de convives, pas sur une bouteille isolée.",
        ],
      },
      {
        type: "list",
        title: "Négocier et vérifier le contrat",
        items: [
          "Poser la question du droit de bouchon avant de signer : certains prestataires sont flexibles, d'autres l'interdisent totalement",
          "Vérifier si le tarif est par bouteille ou par invité, et ce qu'il inclut exactement (verres, service, glace)",
          "Confirmer si le champagne et les alcools forts suivent la même règle que le vin, ou un tarif différent",
          "Demander si le caviste reprend les bouteilles non ouvertes, ce qui limite le risque de surcommander",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Le droit de bouchon n'est pas une bonne affaire par nature : c'est un calcul. Il fait gagner quand votre vin est nettement moins cher que celui du traiteur, et que le droit reste modéré.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Le droit de bouchon se lit dans le devis, ligne à ligne : notre guide [comparer les devis traiteur](/blog/comparer-devis-traiteur-mariage) explique comment repérer ce qui est inclus ou non. Pour le format des boissons, voir [open bar ou consommation](/blog/open-bar-ou-consommation-mariage) et les [quantités de boissons par invité](/blog/boissons-mariage-champagne-quantites). Enfin, intégrez le coût réel des boissons dans la [répartition du budget par poste](/blog/repartition-budget-mariage-par-poste).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Drinks are one of the wedding items with the widest price swings. Many caterers apply a high markup on the wine and champagne they supply. Hence the appeal of a practice well known in France: bringing your own bottles, for a corkage fee.",
          "But that fee isn't free, and it doesn't always save money. The right reflex isn't to accept or refuse it on principle, but to run the numbers.",
        ],
      },
      {
        type: "text",
        title: "What corkage is",
        paragraphs: [
          "Corkage is the amount the caterer or venue charges to let you bring your own drinks. It covers the cost of service: opening the bottles, pouring at the table, providing and cleaning the glasses.",
          "It's billed either per bottle opened or per guest. That basis changes everything: for the same consumption, a per-guest flat fee can be more or less favorable than a per-bottle rate depending on the number of guests.",
        ],
      },
      {
        type: "list",
        title: "How much it costs",
        items: [
          "On average, corkage runs between 4 and 7 € per bottle",
          "Depending on the venue and the vendor's reputation, the real range can run from about 3 to 13 € a bottle",
          "Some vendors charge a per-guest flat fee rather than per bottle",
          "A few venues apply a reduced, or even zero, fee when you negotiate ahead",
        ],
      },
      {
        type: "text",
        title: "Running the numbers",
        paragraphs: [
          "Compare two totals. On one side, the wine supplied by the caterer, with its markup. On the other, your own wine plus corkage, plus the logistics (transport, storage, possibly the wine merchant taking back unsold bottles).",
          "The move is worthwhile mainly if you have access to quality bottles at a good price, and if corkage stays reasonable. Conversely, a high per-glass or per-guest fee can wipe out the saving. Total it for your real guest count, not for a single bottle.",
        ],
      },
      {
        type: "list",
        title: "Negotiating and checking the contract",
        items: [
          "Ask about corkage before signing: some vendors are flexible, others forbid it entirely",
          "Check whether the rate is per bottle or per guest, and exactly what it includes (glasses, service, ice)",
          "Confirm whether champagne and spirits follow the same rule as wine, or a different rate",
          "Ask whether the wine merchant takes back unopened bottles, which limits the risk of over-ordering",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Corkage isn't a bargain by nature: it's a calculation. It saves money when your wine is clearly cheaper than the caterer's, and the fee stays moderate.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Corkage shows up in the quote, line by line: our guide to [comparing caterer quotes](/blog/comparer-devis-traiteur-mariage) explains how to spot what's included or not. On drink format, see [open bar vs consumption](/blog/open-bar-ou-consommation-mariage) and [drink quantities per guest](/blog/boissons-mariage-champagne-quantites). Finally, fold the real drinks cost into your [budget breakdown by line item](/blog/repartition-budget-mariage-par-poste).",
        ],
      },
    ],
  }),
];

export const { fr: POSTS_193_200_FR, en: POSTS_193_200_EN } = pairsToArrays(pairs);
