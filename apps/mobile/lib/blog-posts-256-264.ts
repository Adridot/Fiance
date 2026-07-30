import { postPair, pairsToArrays } from "./blog-posts-shared";

const pairs = [
  postPair({
    slug: "combien-de-temoins-mariage",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Combien de témoins faut-il pour un mariage ?",
    titleEn: "How many witnesses do you need for a wedding?",
    excerptFr:
      "Selon le Code civil, un mariage se célèbre avec deux témoins au minimum et quatre au maximum, soit un ou deux par époux. Conditions, répartition et rôle des témoins.",
    excerptEn:
      "Under the Civil Code, a wedding is held with two witnesses minimum and four maximum, meaning one or two per spouse. Conditions, split, and the witnesses' role.",
    readingMinutes: 5,
    heroAltFr: "Témoins signant le registre lors d'un mariage civil",
    heroAltEn: "Witnesses signing the register at a civil wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Selon l'article 75 du Code civil, un mariage se célèbre en présence de deux témoins au minimum et de quatre au maximum. Chaque futur époux en choisit un ou deux, sans jamais dépasser ce plafond. La configuration la plus courante reste un témoin par époux, soit deux en tout, mais rien n'oblige à en prendre autant de chaque côté.",
          "C'est une règle simple, mais qui soulève souvent des questions concrètes : qui peut être témoin, faut-il un lien de parenté, quel âge minimum. Cet article donne les repères généraux. Pour votre situation précise, la source à jour reste votre mairie, qui vous demandera l'identité des témoins lors du dépôt du dossier.",
        ],
      },
      {
        type: "list",
        title: "Ce que dit la règle : deux au minimum, quatre au maximum",
        items: [
          "Le mariage doit compter au moins deux témoins et au plus quatre",
          "Chaque époux choisit un témoin, ou deux s'il souhaite en avoir davantage",
          "La combinaison est libre : deux témoins pour l'un et un seul pour l'autre est possible, tant que le total reste entre deux et quatre",
          "Aucun témoin du tout exposerait le mariage à une cause de nullité : ce n'est donc pas une formalité facultative",
        ],
      },
      {
        type: "text",
        title: "Qui peut être témoin",
        paragraphs: [
          "La seule vraie condition est d'être majeur, c'est-à-dire avoir 18 ans révolus, ou être un mineur émancipé. Au-delà, la loi n'impose ni condition de nationalité, ni lien de parenté : un témoin peut être un parent, un ami, un collègue, de nationalité française ou étrangère.",
          "Le témoin devra présenter une pièce d'identité en cours de validité, et ses informations d'état civil sont demandées en amont par la mairie. Le jour J, il signe le registre des mariages aux côtés des époux : c'est ce qui fait de lui, au sens légal, un témoin de l'union.",
        ],
      },
      {
        type: "text",
        title: "Deux ou quatre : comment choisir le nombre",
        paragraphs: [
          "Le nombre relève surtout de l'équilibre et du symbolique. Beaucoup de couples prennent deux témoins chacun, ce qui permet d'honorer davantage de proches et de répartir les petites missions du jour J. D'autres préfèrent un seul témoin par époux, pour un rôle plus resserré et plus solennel.",
          "Il n'y a pas de meilleur choix dans l'absolu : gardez simplement en tête le plafond de quatre. Si vous avez plus de proches à impliquer que de places de témoin, d'autres rôles existent le jour J, sans statut légal mais tout aussi précieux.",
        ],
      },
      {
        type: "list",
        title: "Les informations à préparer pour la mairie",
        items: [
          "Les nom, prénoms, date et lieu de naissance de chaque témoin",
          "Leur profession et leur domicile",
          "Une copie de leur pièce d'identité en cours de validité",
          "Ces éléments sont à fournir avec le dossier de mariage, bien avant la cérémonie",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "À retenir : deux témoins minimum, quatre maximum, un ou deux par époux, majeurs, sans condition de parenté ni de nationalité. Le reste, c'est à vous de le décider selon les proches que vous voulez à vos côtés.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Une fois le nombre fixé, reste le choix des personnes et de leur mission : notre guide [choisir ses témoins et leur rôle](/blog/choisir-temoins-role-mariage) détaille ce point. Le nom des témoins fait partie des pièces à réunir pour le [dossier de mariage en mairie](/blog/dossier-mairie-bans-mariage-delais). Et pour comprendre le moment où ils signent le registre, voir [le déroulé de la cérémonie civile](/blog/ceremonie-civile-mairie-deroule).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Under article 75 of the French Civil Code, a wedding is held in the presence of two witnesses minimum and four maximum. Each future spouse chooses one or two, never exceeding that cap. The most common setup is one witness per spouse, so two in total, but nothing requires the same number on each side.",
          "It's a simple rule, but it often raises concrete questions: who can be a witness, is a family tie needed, what minimum age. This article gives general markers. For your exact situation, the up-to-date source remains your town hall, which will ask for the witnesses' identity when you file your dossier.",
        ],
      },
      {
        type: "list",
        title: "What the rule says: two minimum, four maximum",
        items: [
          "The wedding must have at least two witnesses and at most four",
          "Each spouse chooses one witness, or two if they want more",
          "The mix is free: two witnesses for one and just one for the other works, as long as the total stays between two and four",
          "No witness at all would expose the marriage to a cause of nullity: so it isn't an optional formality",
        ],
      },
      {
        type: "text",
        title: "Who can be a witness",
        paragraphs: [
          "The only real condition is to be of legal age, meaning 18 years old, or an emancipated minor. Beyond that, the law imposes no condition of nationality or family tie: a witness can be a relative, a friend, a colleague, French or foreign.",
          "The witness will have to show a valid ID, and their civil-status details are requested ahead by the town hall. On the day, they sign the marriage register alongside the spouses: that's what makes them, in legal terms, a witness to the union.",
        ],
      },
      {
        type: "text",
        title: "Two or four: how to choose the number",
        paragraphs: [
          "The number is mostly about balance and symbolism. Many couples take two witnesses each, which lets them honor more loved ones and spread the small day-of tasks. Others prefer a single witness per spouse, for a tighter, more solemn role.",
          "There's no best choice in the abstract: just keep the cap of four in mind. If you have more loved ones to involve than witness slots, other roles exist on the day, with no legal status but just as precious.",
        ],
      },
      {
        type: "list",
        title: "The details to prepare for the town hall",
        items: [
          "The surname, first names, date and place of birth of each witness",
          "Their occupation and address",
          "A copy of their valid ID",
          "These are provided with the marriage file, well before the ceremony",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Keep in mind: two witnesses minimum, four maximum, one or two per spouse, of legal age, with no condition of family tie or nationality. The rest is yours to decide based on the loved ones you want at your side.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Once the number is set, the choice of people and their mission remains: our guide to [choosing your witnesses and their role](/blog/choisir-temoins-role-mariage) covers that. The witnesses' names are part of the documents to gather for the [town-hall marriage file](/blog/dossier-mairie-bans-mariage-delais). And to understand the moment they sign the register, see [the run of the civil ceremony](/blog/ceremonie-civile-mairie-deroule).",
        ],
      },
    ],
  }),

  postPair({
    slug: "quel-age-legal-pour-se-marier-france",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Quel est l'âge légal pour se marier en France ?",
    titleEn: "What is the legal age to marry in France?",
    excerptFr:
      "En France, l'âge légal du mariage est fixé à 18 ans révolus. Une dérogation exceptionnelle du procureur reste possible pour un mineur, avec l'accord d'un parent.",
    excerptEn:
      "In France, the legal marriage age is set at 18. An exceptional dispensation from the public prosecutor remains possible for a minor, with a parent's consent.",
    readingMinutes: 5,
    heroAltFr: "Jeune couple préparant son mariage en mairie",
    heroAltEn: "Young couple preparing their wedding at the town hall",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "En France, l'âge légal pour se marier est fixé à 18 ans révolus, pour les femmes comme pour les hommes. C'est la règle de principe, sans exception ordinaire : au-dessous de cet âge, le mariage n'est en principe pas possible sans une autorisation spéciale de la justice.",
          "Cet article donne les repères généraux issus du droit en vigueur. Les situations touchant à un mineur sont rares et strictement encadrées : en cas de doute sur un cas concret, renseignez-vous auprès de votre mairie ou d'un professionnel du droit, seuls à même de dire ce qui s'applique.",
        ],
      },
      {
        type: "text",
        title: "La règle : 18 ans révolus",
        paragraphs: [
          "Depuis 2006, l'âge minimum du mariage est aligné à 18 ans pour les deux futurs époux. Il faut donc être majeur au jour de la célébration. C'est la condition la plus simple du dossier de mariage : elle est vérifiée par la mairie à partir des actes de naissance des futurs époux.",
          "Cette règle vaut quel que soit le type de mariage envisagé ensuite, puisqu'en France seul le mariage civil a valeur légale. Aucune cérémonie religieuse ne peut d'ailleurs se tenir avant le passage devant l'officier d'état civil.",
        ],
      },
      {
        type: "list",
        title: "La dérogation exceptionnelle pour un mineur",
        items: [
          "Le procureur de la République peut accorder une dispense d'âge pour des motifs graves",
          "Cette dispense est réservée à des situations exceptionnelles et appréciée au cas par cas",
          "L'accord d'au moins l'un des parents, ou du titulaire de l'autorité parentale, est requis",
          "Il s'agit d'une voie dérogatoire, non d'un droit : le magistrat examine si le mariage est réellement la solution adaptée",
        ],
      },
      {
        type: "text",
        title: "Pourquoi cet âge",
        paragraphs: [
          "L'âge de 18 ans correspond à la majorité légale : c'est le moment où l'on est réputé pouvoir s'engager pleinement, en connaissance de cause, dans un acte aux effets importants sur le patrimoine, la filiation et la vie quotidienne. Le mariage n'est pas qu'une fête : c'est un contrat aux conséquences juridiques durables.",
          "Le caractère exceptionnel de toute dérogation traduit cette logique de protection. Le passage devant le procureur n'est pas une formalité : c'est un filtre destiné à vérifier que le consentement est libre et que l'union sert réellement l'intérêt de la personne concernée.",
        ],
      },
      {
        type: "text",
        title: "Et les autres conditions de fond",
        paragraphs: [
          "L'âge n'est qu'une condition parmi d'autres. Le mariage suppose aussi un consentement libre et éclairé des deux époux, l'absence d'un mariage antérieur non dissous, et le respect des empêchements liés à la parenté. Ces conditions sont vérifiées par la mairie lors de l'instruction du dossier.",
          "Autrement dit, remplir la condition d'âge ne suffit pas à lui seul : c'est le socle, complété par les autres exigences du Code civil. La mairie reste l'interlocuteur qui valide l'ensemble avant de fixer la date de célébration.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "À retenir : 18 ans révolus, c'est la règle pour se marier en France. Le mariage d'un mineur relève d'une dérogation exceptionnelle du procureur, avec l'accord d'un parent, et non d'une simple autorisation de routine.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "La condition d'âge s'inscrit dans le [dossier de mariage en mairie](/blog/dossier-mairie-bans-mariage-delais), qui rassemble toutes les pièces et vérifie les conditions de fond. Si vous comparez encore les statuts du couple avant de vous décider, notre guide [PACS ou mariage](/blog/pacs-ou-mariage-choisir) éclaire ce qui change vraiment. Et pour partir du bon pied, voir [les premières étapes pour organiser un mariage](/blog/premieres-etapes-organiser-mariage).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "In France, the legal age to marry is set at 18, for women as for men. That's the rule of principle, with no ordinary exception: below that age, marriage is in principle impossible without a special authorization from the courts.",
          "This article gives general markers drawn from current law. Situations involving a minor are rare and strictly framed: if in doubt about a concrete case, check with your town hall or a legal professional, the only ones able to say what applies.",
        ],
      },
      {
        type: "text",
        title: "The rule: 18 years old",
        paragraphs: [
          "Since 2006, the minimum marriage age has been aligned to 18 for both future spouses. You must therefore be of legal age on the day of the ceremony. It's the simplest condition in the marriage file: the town hall checks it from the future spouses' birth certificates.",
          "This rule holds whatever type of marriage you plan afterward, since in France only civil marriage has legal value. No religious ceremony may in fact be held before passing before the registrar.",
        ],
      },
      {
        type: "list",
        title: "The exceptional dispensation for a minor",
        items: [
          "The public prosecutor can grant an age dispensation on serious grounds",
          "This dispensation is reserved for exceptional situations and assessed case by case",
          "The consent of at least one parent, or the holder of parental authority, is required",
          "It's a derogatory path, not a right: the magistrate examines whether marriage is truly the fitting solution",
        ],
      },
      {
        type: "text",
        title: "Why this age",
        paragraphs: [
          "The age of 18 matches legal adulthood: it's when one is deemed able to commit fully, knowingly, to an act with significant effects on assets, filiation, and daily life. Marriage isn't just a celebration: it's a contract with lasting legal consequences.",
          "The exceptional nature of any dispensation reflects this logic of protection. Passing before the prosecutor isn't a formality: it's a filter meant to verify that consent is free and that the union genuinely serves the interest of the person concerned.",
        ],
      },
      {
        type: "text",
        title: "And the other substantive conditions",
        paragraphs: [
          "Age is only one condition among others. Marriage also requires the free and informed consent of both spouses, the absence of a prior undissolved marriage, and respect for the impediments tied to kinship. These conditions are checked by the town hall when processing the file.",
          "In other words, meeting the age condition isn't enough on its own: it's the base, completed by the other requirements of the Civil Code. The town hall remains the contact that validates the whole before setting the ceremony date.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Keep in mind: 18 years old is the rule to marry in France. A minor's marriage falls under an exceptional dispensation from the prosecutor, with a parent's consent, not a routine authorization.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "The age condition sits within the [town-hall marriage file](/blog/dossier-mairie-bans-mariage-delais), which gathers all documents and checks the substantive conditions. If you're still comparing the couple's statuses before deciding, our guide to [PACS vs marriage](/blog/pacs-ou-mariage-choisir) clarifies what really changes. And to start off right, see [the first steps to organize a wedding](/blog/premieres-etapes-organiser-mariage).",
        ],
      },
    ],
  }),

  postPair({
    slug: "mariage-civil-obligatoire-avant-religieux",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Le mariage civil est-il obligatoire avant le religieux ?",
    titleEn: "Is civil marriage mandatory before the religious one?",
    excerptFr:
      "Oui : en France, seul le mariage civil a valeur légale et il doit précéder toute cérémonie religieuse. L'officiant demande l'acte de mariage civil avant de célébrer.",
    excerptEn:
      "Yes: in France, only civil marriage has legal value and it must precede any religious ceremony. The officiant asks for the civil marriage certificate before celebrating.",
    readingMinutes: 6,
    heroAltFr: "Couple sortant de la mairie avant sa cérémonie religieuse",
    heroAltEn: "Couple leaving the town hall before their religious ceremony",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "En France, oui : le mariage civil est obligatoire et doit précéder toute cérémonie religieuse. Seul le passage devant l'officier d'état civil confère au mariage une valeur légale ; la cérémonie religieuse, elle, est un engagement spirituel qui vient après, sans effet juridique propre.",
          "Cette règle découle de la séparation des Églises et de l'État. Elle explique une organisation en deux temps que connaissent bien les couples : d'abord la mairie, ensuite le lieu de culte, souvent le même jour ou à quelques jours d'intervalle. Cet article en pose les repères généraux.",
        ],
      },
      {
        type: "text",
        title: "Seul le civil a valeur légale",
        paragraphs: [
          "En droit français, c'est le mariage civil, célébré en mairie, qui crée les effets juridiques de l'union : régime matrimonial, droits en matière de succession, filiation, protection du conjoint. La cérémonie religieuse ne produit aucun de ces effets par elle-même : elle a une portée spirituelle et personnelle, pas administrative.",
          "C'est pourquoi l'ordre n'est pas une simple tradition, mais une règle : on ne peut pas être marié religieusement sans l'être d'abord civilement. Cette antériorité protège les époux en leur garantissant les droits attachés au mariage civil.",
        ],
      },
      {
        type: "list",
        title: "Ce que l'officiant religieux demande",
        items: [
          "L'acte de mariage civil, ou une pièce attestant que le mariage a bien été célébré en mairie",
          "Ce document conditionne l'organisation de la cérémonie religieuse, quelle que soit la confession",
          "Les célébrants demandent en général cette preuve avant de fixer la date religieuse",
          "S'y ajoutent les pièces propres à chaque religion, à voir directement avec le lieu de culte",
        ],
      },
      {
        type: "text",
        title: "Pourquoi cet ordre existe",
        paragraphs: [
          "La règle vise à protéger les époux. Sans mariage civil, un couple uni seulement religieusement resterait, aux yeux de la loi, non marié : sans droits en matière de patrimoine, de succession ou de protection mutuelle. Faire passer le civil en premier garantit que ces droits sont acquis avant l'engagement spirituel.",
          "Le Code pénal encadre d'ailleurs cette antériorité : un ministre du culte qui procéderait de façon habituelle à des mariages religieux sans preuve du mariage civil préalable s'expose à des sanctions. En pratique, les célébrants veillent donc à recevoir l'acte civil avant de célébrer.",
        ],
      },
      {
        type: "text",
        title: "Organiser les deux cérémonies",
        paragraphs: [
          "Concrètement, beaucoup de couples enchaînent la mairie le matin et le lieu de culte l'après-midi, ou espacent les deux de quelques jours. L'important est de réserver la date religieuse en cohérence avec la date civile, et de prévoir la logistique du déplacement entre les deux lieux le cas échéant.",
          "Rien n'oblige à faire une cérémonie religieuse : le mariage civil suffit à être marié. Certains couples y ajoutent une cérémonie laïque, symbolique et personnalisée, qui n'a pas non plus de valeur légale. Le civil, lui, reste dans tous les cas le socle indispensable.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "La règle est claire : en France, on se marie d'abord à la mairie, puis, si on le souhaite, à l'église, à la synagogue, à la mosquée ou au temple. Le civil n'est pas une option, c'est le seul mariage reconnu par la loi.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour préparer la cérémonie confessionnelle qui suit la mairie, voir notre guide [préparer une cérémonie religieuse catholique](/blog/ceremonie-religieuse-catholique-preparer). Pour saisir ce qui distingue chaque forme d'union, notre article [différence entre mariage civil, religieux et laïque](/blog/difference-mariage-civil-religieux-laique) fait le point. Et pour le socle légal, voir [le déroulé de la cérémonie civile en mairie](/blog/ceremonie-civile-mairie-deroule).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "In France, yes: civil marriage is mandatory and must precede any religious ceremony. Only passing before the registrar gives the marriage legal value; the religious ceremony is a spiritual commitment that comes afterward, with no legal effect of its own.",
          "This rule flows from the separation of Church and State. It explains a two-step organization couples know well: first the town hall, then the place of worship, often the same day or a few days apart. This article sets out the general markers.",
        ],
      },
      {
        type: "text",
        title: "Only the civil one has legal value",
        paragraphs: [
          "In French law, it's the civil marriage, held at the town hall, that creates the legal effects of the union: matrimonial regime, inheritance rights, filiation, protection of the spouse. The religious ceremony produces none of these effects by itself: its reach is spiritual and personal, not administrative.",
          "That's why the order isn't a mere tradition but a rule: you can't be religiously married without first being civilly married. This precedence protects the spouses by guaranteeing them the rights attached to civil marriage.",
        ],
      },
      {
        type: "list",
        title: "What the religious officiant asks for",
        items: [
          "The civil marriage certificate, or a document proving the marriage was indeed held at the town hall",
          "This document conditions the organization of the religious ceremony, whatever the faith",
          "Officiants generally ask for this proof before setting the religious date",
          "To it are added the documents specific to each religion, to see directly with the place of worship",
        ],
      },
      {
        type: "text",
        title: "Why this order exists",
        paragraphs: [
          "The rule aims to protect the spouses. Without civil marriage, a couple united only religiously would remain, in the eyes of the law, unmarried: with no rights over assets, inheritance, or mutual protection. Putting the civil one first ensures those rights are acquired before the spiritual commitment.",
          "The Penal Code in fact frames this precedence: a minister of religion who habitually performed religious marriages without proof of the prior civil marriage faces penalties. In practice, officiants therefore make sure to receive the civil certificate before celebrating.",
        ],
      },
      {
        type: "text",
        title: "Organizing both ceremonies",
        paragraphs: [
          "Concretely, many couples do the town hall in the morning and the place of worship in the afternoon, or space the two a few days apart. What matters is booking the religious date consistently with the civil one, and planning the logistics of moving between the two venues if needed.",
          "Nothing requires a religious ceremony: civil marriage is enough to be married. Some couples add a secular ceremony, symbolic and personalized, which also has no legal value. The civil one, in every case, remains the indispensable base.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "The rule is clear: in France, you marry first at the town hall, then, if you wish, at the church, synagogue, mosque, or temple. The civil marriage isn't an option, it's the only marriage recognized by law.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To prepare the faith ceremony that follows the town hall, see our guide to [preparing a Catholic religious ceremony](/blog/ceremonie-religieuse-catholique-preparer). To grasp what sets each form of union apart, our article on [the difference between civil, religious, and secular marriage](/blog/difference-mariage-civil-religieux-laique) takes stock. And for the legal base, see [the run of the civil ceremony at the town hall](/blog/ceremonie-civile-mairie-deroule).",
        ],
      },
    ],
  }),

  postPair({
    slug: "meilleure-saison-pour-se-marier",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Quelle est la meilleure saison pour se marier ?",
    titleEn: "What is the best season to get married?",
    excerptFr:
      "En France, juin et juillet sont en tête et l'été concentre près de 59 % des mariages. Mais la hors-saison, moins chère et plus disponible, séduit de plus en plus de couples.",
    excerptEn:
      "In France, June and July lead and summer concentrates nearly 59% of weddings. But the off-season, cheaper and more available, wins over more and more couples.",
    readingMinutes: 6,
    heroAltFr: "Mariage en extérieur par une belle journée d'été",
    heroAltEn: "Outdoor wedding on a fine summer day",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "En France, la saison reine du mariage est l'été : selon l'INSEE, juin et juillet arrivent en tête chaque année, et les quatre mois de juin à septembre concentrent près de 59 % des unions. Si vous cherchez la période la plus courante, c'est donc l'été, pour ses longues journées et son climat clément.",
          "Mais « la plus courante » n'est pas forcément « la meilleure » pour vous. La hors-saison, plus fraîche mais moins chère et bien plus disponible, gagne du terrain. Cet article compare les saisons sur des critères concrets, pour que le choix serve vos priorités plutôt que l'habitude.",
        ],
      },
      {
        type: "text",
        title: "Ce que disent les chiffres",
        paragraphs: [
          "La préférence pour l'été est en réalité récente : au 19e siècle, on se mariait plutôt en hiver. Aujourd'hui, la belle saison domine largement. Les données récentes de l'INSEE confirment cette concentration, avec une nette majorité de mariages sur la période allant du printemps à la fin de l'été.",
          "Cette popularité a un revers : c'est aussi la période où les lieux et les prestataires sont les plus demandés, les plus chers et les plus vite complets. Réserver un samedi de juin peut supposer de s'y prendre un an et demi à l'avance, quand une date d'automne se trouve plus facilement.",
        ],
      },
      {
        type: "list",
        title: "Les atouts et limites de chaque saison",
        items: [
          "Été : longues journées, extérieur possible, ambiance festive, mais forte demande, prix élevés et risque de canicule",
          "Automne : lumière douce, tarifs plus accessibles, bonne disponibilité, mais météo plus incertaine",
          "Hiver : lieux disponibles, prix négociables, atmosphère intimiste, mais journées courtes et déplacements parfois délicats",
          "Printemps : nature en fleurs, températures agréables, mais météo changeante et forte demande dès mai",
        ],
      },
      {
        type: "text",
        title: "Le critère budget et disponibilité",
        paragraphs: [
          "C'est souvent l'argument décisif de la hors-saison. Un même lieu, un même traiteur peuvent afficher des tarifs sensiblement plus bas hors des mois d'été, et se marier en semaine amplifie encore l'économie. La demande étant plus faible, vous avez aussi plus de choix de dates et de marge de négociation.",
          "À l'inverse, l'été impose de composer avec des prix hauts et des agendas remplis. Si le budget ou la disponibilité d'un lieu précis compte plus que la garantie du beau temps, décaler à l'automne ou au printemps est souvent le meilleur arbitrage.",
        ],
      },
      {
        type: "text",
        title: "Comment trancher pour votre couple",
        paragraphs: [
          "La meilleure saison est celle qui aligne vos priorités. Si le climat et l'extérieur priment, visez l'été en acceptant son coût et sa demande. Si le budget, la disponibilité ou une ambiance plus intimiste comptent davantage, la hors-saison offre un excellent rapport qualité-prix.",
          "Pensez aussi à la contrainte de vos invités : un mariage en pleine semaine ou en plein hiver demande plus d'organisation à ceux qui viennent de loin. La saison idéale est un compromis entre vos envies, votre budget et la réalité de vos proches.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Il n'y a pas de saison objectivement meilleure : l'été est le plus demandé, la hors-saison le plus économique. Choisissez selon ce qui compte le plus pour vous, pas selon ce que font la majorité des couples.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour transformer ce choix de saison en date précise, voir notre guide [choisir sa date de mariage selon la saison](/blog/choisir-date-mariage-saison). Si l'économie vous motive, [se marier en semaine pour économiser](/blog/se-marier-en-semaine-economiser) va plus loin. Et pour préparer une date hors-saison, nos articles [organiser un mariage d'automne](/blog/mariage-automne-organiser) et [organiser un mariage d'hiver](/blog/mariage-hiver-organiser) donnent les bons réflexes.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "In France, the prime wedding season is summer: according to INSEE, June and July lead every year, and the four months from June to September concentrate nearly 59% of unions. So if you're looking for the most common period, it's summer, for its long days and mild climate.",
          "But «the most common» isn't necessarily «the best» for you. The off-season, cooler but cheaper and far more available, is gaining ground. This article compares the seasons on concrete criteria, so the choice serves your priorities rather than habit.",
        ],
      },
      {
        type: "text",
        title: "What the numbers say",
        paragraphs: [
          "The preference for summer is actually recent: in the 19th century, people married rather in winter. Today, the warm season dominates by far. Recent INSEE data confirm this concentration, with a clear majority of weddings over the period from spring to late summer.",
          "This popularity has a downside: it's also when venues and vendors are the most in demand, the most expensive, and the quickest to book out. Reserving a Saturday in June can mean starting a year and a half ahead, whereas an autumn date is found more easily.",
        ],
      },
      {
        type: "list",
        title: "The strengths and limits of each season",
        items: [
          "Summer: long days, outdoors possible, festive mood, but high demand, high prices, and heatwave risk",
          "Autumn: soft light, more accessible rates, good availability, but more uncertain weather",
          "Winter: venues available, negotiable prices, intimate atmosphere, but short days and travel sometimes tricky",
          "Spring: nature in bloom, pleasant temperatures, but changeable weather and strong demand from May",
        ],
      },
      {
        type: "text",
        title: "The budget and availability factor",
        paragraphs: [
          "This is often the decisive argument for the off-season. The same venue, the same caterer can show noticeably lower rates outside the summer months, and marrying midweek amplifies the saving further. With demand lower, you also have more date choice and room to negotiate.",
          "Conversely, summer means dealing with high prices and full calendars. If your budget or a specific venue's availability matters more than the guarantee of fine weather, shifting to autumn or spring is often the best trade-off.",
        ],
      },
      {
        type: "text",
        title: "How to decide for your couple",
        paragraphs: [
          "The best season is the one that aligns with your priorities. If climate and the outdoors come first, aim for summer while accepting its cost and demand. If budget, availability, or a more intimate mood matter more, the off-season offers excellent value.",
          "Also think of the constraint on your guests: a midweek or midwinter wedding asks more organization of those coming from afar. The ideal season is a compromise between your wishes, your budget, and the reality of your loved ones.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "There's no objectively best season: summer is the most in demand, the off-season the most economical. Choose according to what matters most to you, not to what most couples do.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To turn this seasonal choice into a precise date, see our guide to [choosing your wedding date by season](/blog/choisir-date-mariage-saison). If saving motivates you, [marrying midweek to save money](/blog/se-marier-en-semaine-economiser) goes further. And to prepare an off-season date, our articles on [organizing an autumn wedding](/blog/mariage-automne-organiser) and [organizing a winter wedding](/blog/mariage-hiver-organiser) give the right reflexes.",
        ],
      },
    ],
  }),

  postPair({
    slug: "quelle-taille-de-salle-pour-mariage",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Quelle taille de salle pour un mariage ?",
    titleEn: "What size venue for a wedding?",
    excerptFr:
      "Comptez environ 2 à 2,5 m² par invité en repas assis avec piste de danse, moins pour un cocktail debout. Comment estimer la surface selon votre format et votre nombre d'invités.",
    excerptEn:
      "Count about 2 to 2.5 m² per guest for a seated dinner with a dance floor, less for a standing cocktail. How to estimate the surface by your format and guest count.",
    readingMinutes: 6,
    heroAltFr: "Salle de réception dressée pour un mariage",
    heroAltEn: "Reception hall set up for a wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Pour un mariage en repas assis avec piste de danse, comptez environ 2 à 2,5 m² par invité : soit à peu près 200 à 250 m² pour 100 personnes. En cocktail debout, un espace bien plus réduit suffit, autour de 1 à 1,5 m² par personne. La bonne taille de salle dépend donc surtout de votre format de réception.",
          "Ces repères sont des ordres de grandeur pour estimer avant de visiter. La surface annoncée par un lieu ne dit pas tout : agencement, présence d'une scène, d'un bar, d'un coin enfants ou d'un espace traiteur réduisent la surface réellement disponible. Vérifiez toujours sur place avec le nombre d'invités en tête.",
        ],
      },
      {
        type: "list",
        title: "Les surfaces selon le format",
        items: [
          "Repas assis avec piste de danse : environ 2 à 2,5 m² par invité, le format le plus exigeant en surface",
          "Repas assis seul, sans piste : autour de 1 à 1,5 m² par personne pour les tables et la circulation",
          "Cocktail ou réception debout : 1 à 1,5 m² par personne suffisent au confort",
          "Piste de danse : prévoyez en plus environ 0,5 à 0,75 m² par danseur",
        ],
      },
      {
        type: "text",
        title: "Pourquoi le format change tout",
        paragraphs: [
          "Une même salle n'accueille pas le même nombre de personnes selon l'usage. En cocktail debout, les invités circulent et occupent peu d'espace ; en repas assis, il faut des tables, des chaises et des allées de service, ce qui double presque la surface nécessaire par personne. Une salle donnée pour 200 en cocktail ne recevra souvent que 120 à 140 convives à table.",
          "D'où l'importance de raisonner à partir de votre déroulé réel : vin d'honneur debout, puis dîner assis, puis soirée dansante. C'est la configuration la plus gourmande en surface, ici le repas assis avec piste, qui doit dicter la taille minimale de la salle.",
        ],
      },
      {
        type: "text",
        title: "Comment estimer votre surface",
        paragraphs: [
          "Partez de votre nombre d'invités confirmés, ajoutez une marge pour les tables techniques (traiteur, cadeaux, gâteau) et pour la circulation. Multipliez ensuite par le ratio du format le plus exigeant de votre soirée. Pour 80 convives en repas assis avec piste, visez ainsi une salle d'au moins 160 à 200 m², hors espaces annexes.",
          "N'oubliez pas les zones qui ne servent pas au repas mais occupent de la place : entrée, vestiaire, bar, coin enfants, espace pour un groupe ou un DJ. Une salle trop juste rend la soirée inconfortable ; une salle trop grande peut sembler vide et froide avec peu d'invités.",
        ],
      },
      {
        type: "list",
        title: "Les points à vérifier lors de la visite",
        items: [
          "La surface utile réellement disponible, une fois retirés bar, scène et espaces de service",
          "La capacité annoncée par le lieu, en précisant s'il s'agit d'un format assis ou debout",
          "La présence et la taille d'une piste de danse, ou l'espace à lui réserver",
          "La possibilité d'un extérieur pour désengorger la salle au vin d'honneur",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "La règle simple : dimensionnez la salle sur votre moment le plus exigeant, le repas assis avec piste de danse, pas sur le cocktail. Une salle confortable à table le sera partout ailleurs dans la soirée.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "La taille n'est qu'un critère parmi d'autres : notre guide [choisir son lieu de réception et les types de lieux](/blog/choisir-lieu-reception-types) aide à comparer l'ensemble. Si aucune salle ne convient, [louer un chapiteau ou une tente](/blog/chapiteau-tente-location-mariage) permet d'ajuster la surface à vos invités. Et pour fixer ce nombre d'invités qui commande tout, voir [comment décider du nombre d'invités](/blog/combien-invites-mariage-decider).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "For a seated-dinner wedding with a dance floor, count about 2 to 2.5 m² per guest: roughly 200 to 250 m² for 100 people. For a standing cocktail, a much smaller space is enough, around 1 to 1.5 m² per person. The right venue size therefore depends mostly on your reception format.",
          "These markers are orders of magnitude to estimate before visiting. A venue's stated surface doesn't tell everything: layout, a stage, a bar, a kids' corner, or a catering area cut into the space actually available. Always check on site with your guest count in mind.",
        ],
      },
      {
        type: "list",
        title: "Surfaces by format",
        items: [
          "Seated dinner with dance floor: about 2 to 2.5 m² per guest, the most surface-hungry format",
          "Seated dinner only, no dance floor: around 1 to 1.5 m² per person for tables and circulation",
          "Cocktail or standing reception: 1 to 1.5 m² per person is enough for comfort",
          "Dance floor: plan an extra 0.5 to 0.75 m² per dancer",
        ],
      },
      {
        type: "text",
        title: "Why the format changes everything",
        paragraphs: [
          "The same room doesn't hold the same number of people depending on the use. In a standing cocktail, guests move around and take up little space; for a seated dinner, you need tables, chairs, and service aisles, which nearly doubles the surface needed per person. A room given for 200 at a cocktail will often seat only 120 to 140 at tables.",
          "Hence the importance of reasoning from your real run of the evening: standing drinks, then seated dinner, then dancing. The most surface-hungry setup, here the seated dinner with dance floor, should dictate the minimum room size.",
        ],
      },
      {
        type: "text",
        title: "How to estimate your surface",
        paragraphs: [
          "Start from your confirmed guest count, add a margin for utility tables (catering, gifts, cake) and for circulation. Then multiply by the ratio of your evening's most demanding format. For 80 guests at a seated dinner with a dance floor, aim for a room of at least 160 to 200 m², excluding side spaces.",
          "Don't forget the zones that don't serve the meal but take up room: entrance, cloakroom, bar, kids' corner, space for a band or DJ. A too-tight room makes the evening uncomfortable; a too-large room can feel empty and cold with few guests.",
        ],
      },
      {
        type: "list",
        title: "Points to check during the visit",
        items: [
          "The truly usable surface available, once bar, stage, and service areas are removed",
          "The capacity stated by the venue, specifying whether it's a seated or standing format",
          "The presence and size of a dance floor, or the space to set aside for it",
          "The option of an outdoor area to ease the room during the drinks reception",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "The simple rule: size the room on your most demanding moment, the seated dinner with a dance floor, not on the cocktail. A room comfortable at the table will be comfortable everywhere else in the evening.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Size is only one criterion among others: our guide to [choosing your reception venue and venue types](/blog/choisir-lieu-reception-types) helps compare the whole. If no room fits, [renting a marquee or tent](/blog/chapiteau-tente-location-mariage) lets you match the surface to your guests. And to set the guest count that drives everything, see [how to decide on the number of guests](/blog/combien-invites-mariage-decider).",
        ],
      },
    ],
  }),

  postPair({
    slug: "quel-vin-servir-a-un-mariage",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Quel vin servir à un mariage ?",
    titleEn: "What wine should you serve at a wedding?",
    excerptFr:
      "Accordez le vin au menu et comptez environ une demie à une bouteille par personne, réparties entre blanc, rouge et bulles. Ce qu'il faut prévoir et comment acheter soi-même.",
    excerptEn:
      "Match the wine to the menu and count about half to one bottle per person, split between white, red, and sparkling. What to plan and how to buy it yourself.",
    readingMinutes: 6,
    heroAltFr: "Verres de vin servis lors d'un dîner de mariage",
    heroAltEn: "Glasses of wine served at a wedding dinner",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Pour un mariage, le bon vin est d'abord celui qui s'accorde avec votre menu : un blanc vif sur l'entrée et le poisson, un rouge souple sur les viandes, des bulles pour le vin d'honneur et le dessert. Côté quantité, comptez en moyenne une demie à une bouteille de vin par adulte sur l'ensemble de la journée, réparties selon les moments.",
          "Ces repères permettent de commander sans se tromper largement, ni manquer, ni gaspiller. Le vin étant souvent servi avec modération et en accompagnement, le calcul doit tenir compte de la durée du repas, de la part de conducteurs et d'invités qui boivent peu. Cet article donne les grandes règles.",
        ],
      },
      {
        type: "text",
        title: "Accorder le vin au menu",
        paragraphs: [
          "L'accord se raisonne plat par plat. Un blanc sec et frais accompagne bien apéritif, entrées, poissons et fromages doux ; un rouge de caractère mais pas trop tannique convient aux plats de viande. Les bulles, champagne ou crémant, marquent les temps forts : le vin d'honneur et le moment du dessert ou de la pièce montée.",
          "Si votre traiteur propose une carte des vins, demandez-lui des suggestions d'accords avec le menu retenu. Beaucoup acceptent aussi que vous apportiez vos propres bouteilles, moyennant parfois un droit de bouchon : un point à clarifier tôt, car il change le calcul du budget.",
        ],
      },
      {
        type: "list",
        title: "Les quantités à prévoir",
        items: [
          "En repas assis, une règle simple : environ une bouteille de vin pour trois adultes sur l'ensemble du dîner",
          "Vin rouge : compter environ une bouteille pour deux convives sur les plats de viande",
          "Vin blanc : environ une bouteille pour trois à quatre convives",
          "Bulles : environ une bouteille pour quatre à cinq personnes au vin d'honneur, et une coupe par convive au dessert",
        ],
      },
      {
        type: "text",
        title: "Blanc, rouge, bulles : dans quel ordre",
        paragraphs: [
          "Le déroulé classique commence par les bulles au vin d'honneur, souvent le moment le plus arrosé de la journée. Le blanc accompagne ensuite l'entrée, le rouge le plat principal, et les bulles reviennent volontiers au dessert. Prévoir un peu de rosé peut plaire, surtout en été, mais reste optionnel.",
          "N'oubliez pas les alternatives sans alcool : eau plate et gazeuse à volonté, softs et, de plus en plus, un vin ou un pétillant sans alcool. Une partie des invités boit peu ou pas : surestimer les quantités d'alcool est une erreur de budget fréquente.",
        ],
      },
      {
        type: "text",
        title: "Acheter soi-même le vin",
        paragraphs: [
          "Fournir soi-même le vin peut réduire nettement la facture par rapport à la carte d'un traiteur, à condition que le lieu ou le prestataire l'autorise. Beaucoup acceptent, parfois contre un droit de bouchon, ce coût par bouteille débouchée qui rémunère le service. Faites le calcul complet : le prix d'achat plus le droit de bouchon doit rester inférieur à la carte pour que l'opération soit gagnante.",
          "Si vous achetez, prévoyez une petite marge au-dessus de votre estimation, préférez des vins simples et consensuels plutôt que des cuvées trop typées, et vérifiez les conditions de reprise des bouteilles non ouvertes. Un caviste peut vous conseiller des accords adaptés à votre menu et à votre budget.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Le bon vin de mariage n'est pas le plus cher, c'est celui qui s'accorde au menu et plaît au plus grand nombre. Calez les quantités sur des repères, prévoyez une petite réserve, et clarifiez tôt le droit de bouchon si vous fournissez vos bouteilles.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour l'ensemble des boissons, au-delà du seul vin, notre guide [quantités de boissons et champagne](/blog/boissons-mariage-champagne-quantites) détaille le calcul complet. Si vous envisagez d'apporter vos propres bouteilles, lisez [comprendre le droit de bouchon](/blog/droit-de-bouchon-vin-mariage). Les bulles servies à l'apéritif relèvent du [vin d'honneur et cocktail](/blog/vin-honneur-cocktail-mariage), et les accords se testent lors de la [dégustation chez le traiteur](/blog/degustation-traiteur-mariage).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "For a wedding, the right wine is first the one that matches your menu: a bright white with the starter and fish, a smooth red with the meats, sparkling for the drinks reception and dessert. On quantity, count on average half to one bottle of wine per adult across the whole day, split by moment.",
          "These markers let you order without going far wrong, neither running short nor wasting. Since wine is often served in moderation and as an accompaniment, the calculation must factor in the meal's length and the share of drivers and light drinkers. This article gives the main rules.",
        ],
      },
      {
        type: "text",
        title: "Matching wine to the menu",
        paragraphs: [
          "The pairing is reasoned course by course. A dry, fresh white goes well with aperitif, starters, fish, and mild cheeses; a red with character but not too tannic suits meat dishes. Sparkling, champagne or crémant, marks the highlights: the drinks reception and the dessert or wedding-cake moment.",
          "If your caterer offers a wine list, ask for pairing suggestions with your chosen menu. Many also allow you to bring your own bottles, sometimes for a corkage fee: a point to clear up early, since it changes the budget calculation.",
        ],
      },
      {
        type: "list",
        title: "Quantities to plan",
        items: [
          "For a seated dinner, a simple rule: about one bottle of wine for three adults across the whole meal",
          "Red wine: count about one bottle for two guests on the meat dishes",
          "White wine: about one bottle for three to four guests",
          "Sparkling: about one bottle for four to five people at the drinks reception, and one glass per guest at dessert",
        ],
      },
      {
        type: "text",
        title: "White, red, sparkling: in what order",
        paragraphs: [
          "The classic run starts with sparkling at the drinks reception, often the most-poured moment of the day. White then accompanies the starter, red the main course, and sparkling gladly returns at dessert. Planning a little rosé can please, especially in summer, but stays optional.",
          "Don't forget the alcohol-free options: still and sparkling water aplenty, soft drinks, and, increasingly, an alcohol-free wine or sparkling. Some guests drink little or none: overestimating alcohol quantities is a frequent budget mistake.",
        ],
      },
      {
        type: "text",
        title: "Buying the wine yourself",
        paragraphs: [
          "Supplying the wine yourself can noticeably cut the bill compared with a caterer's list, provided the venue or vendor allows it. Many accept, sometimes for a corkage fee, that per-bottle-opened charge that pays for service. Do the full sum: the purchase price plus corkage must stay below the list price for the move to pay off.",
          "If you buy, plan a small margin above your estimate, prefer simple, crowd-pleasing wines over overly distinctive cuvées, and check return terms for unopened bottles. A wine merchant can advise pairings suited to your menu and budget.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "The right wedding wine isn't the most expensive, it's the one that matches the menu and pleases the most people. Set quantities from markers, plan a small reserve, and clear up corkage early if you supply your own bottles.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "For all the drinks, beyond wine alone, our guide to [drink and champagne quantities](/blog/boissons-mariage-champagne-quantites) details the full calculation. If you plan to bring your own bottles, read [understanding the corkage fee](/blog/droit-de-bouchon-vin-mariage). Sparkling served at the aperitif belongs to the [drinks reception and cocktail](/blog/vin-honneur-cocktail-mariage), and pairings are tested at the [tasting with the caterer](/blog/degustation-traiteur-mariage).",
        ],
      },
    ],
  }),

  postPair({
    slug: "quel-cadeau-offrir-pour-un-mariage",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Quel cadeau offrir pour un mariage ?",
    titleEn: "What gift should you give for a wedding?",
    excerptFr:
      "Liste, cagnotte, argent ou cadeau personnel : le bon cadeau de mariage suit d'abord les souhaits des mariés. Repères de montant selon le lien et ce qui se fait aujourd'hui.",
    excerptEn:
      "Registry, group fund, cash, or a personal gift: the right wedding gift follows the couple's wishes first. Amount markers by relationship and what's done today.",
    readingMinutes: 5,
    heroAltFr: "Invité déposant un cadeau lors d'un mariage",
    heroAltEn: "Guest placing a gift at a wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le meilleur cadeau de mariage est celui que les mariés ont demandé. S'ils ont ouvert une liste ou une cagnotte, le plus simple et le plus apprécié est d'y participer : vous êtes certain de faire plaisir et d'éviter le doublon. À défaut d'indication, un don en argent ou un cadeau personnel réfléchi reste une valeur sûre.",
          "La vraie question n'est donc pas « quoi offrir » dans l'absolu, mais « qu'ont souhaité les mariés » et « quel montant correspond à mon lien avec eux ». Cet article donne des repères généraux : les usages varient selon les familles et les régions, et rien ne remplace un peu de bon sens et d'attention.",
        ],
      },
      {
        type: "list",
        title: "Les grandes options",
        items: [
          "Participer à la liste de mariage : vous offrez un bien choisi par les mariés, sans risque de doublon",
          "Contribuer à une cagnotte : idéal quand les mariés financent un projet, un voyage ou un gros achat",
          "Donner de l'argent, souvent via l'urne le jour J : simple, discret et toujours utile",
          "Offrir un cadeau personnel : touchant pour un proche, à réserver aux mariés dont vous connaissez bien les goûts",
        ],
      },
      {
        type: "text",
        title: "Suivre d'abord les souhaits des mariés",
        paragraphs: [
          "De plus en plus de couples indiquent clairement leur préférence : liste chez un commerçant, cagnotte en ligne, ou urne pour les dons. Respecter ce choix est la meilleure façon de bien faire. Un couple qui a ouvert une cagnotte voyage n'a probablement pas besoin d'un énième objet de décoration.",
          "Si aucune indication n'est donnée, l'argent reste le cadeau le plus souple : il laisse les mariés libres de l'affecter à ce qui leur manque. Un cadeau personnel n'a de sens que si vous connaissez vraiment leurs goûts ; dans le doute, mieux vaut contribuer à ce qu'ils ont demandé.",
        ],
      },
      {
        type: "text",
        title: "Combien donner selon le lien",
        paragraphs: [
          "Il n'existe pas de tarif officiel, mais un principe : le montant se module selon la proximité avec les mariés et vos moyens. Un ami proche ou un membre de la famille donne en général davantage qu'une connaissance ou un collègue. Le fait de venir en couple, ou de participer déjà à d'autres frais, entre aussi en compte.",
          "L'essentiel est de rester à l'aise avec votre budget : un cadeau se donne de bon cœur, pas sous pression. Mieux vaut un montant modeste et sincère qu'une dépense qui vous met en difficulté. Les mariés retiennent votre présence et votre attention, bien plus que la somme exacte.",
        ],
      },
      {
        type: "list",
        title: "Ce qui se fait, ce qui s'évite",
        items: [
          "Se fait : participer à la liste ou à la cagnotte, glisser un don dans l'urne, accompagner l'argent d'un mot personnel",
          "Se fait : se regrouper à plusieurs pour offrir un cadeau plus important",
          "S'évite : offrir un objet encombrant hors liste sans connaître les goûts et l'intérieur des mariés",
          "S'évite : arriver sans rien alors qu'une liste ou une cagnotte a été clairement proposée",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Un principe suffit : suivez ce que les mariés ont demandé, et ajustez le montant à votre lien et à vos moyens. Un mot sincère qui accompagne le cadeau compte souvent autant que le cadeau lui-même.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour affiner le montant, notre guide [combien donner pour un mariage quand on est invité](/blog/combien-donner-mariage-invite) donne des repères concrets. Côté mariés, le choix entre les formules est traité dans [cagnotte, liste ou urne : que choisir](/blog/cagnotte-liste-urne-mariage-choisir). Et pour composer une liste de mariage utile, voir notre [guide de la liste de cadeaux](/blog/liste-cadeaux-mariage-guide).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The best wedding gift is the one the couple asked for. If they've opened a registry or a group fund, the simplest and most appreciated move is to contribute: you're sure to please and to avoid duplicates. Absent any indication, a cash gift or a thoughtful personal present stays a safe bet.",
          "The real question isn't «what to give» in the abstract, but «what did the couple wish for» and «what amount matches my bond with them». This article gives general markers: customs vary by family and region, and nothing replaces a bit of common sense and attention.",
        ],
      },
      {
        type: "list",
        title: "The main options",
        items: [
          "Contribute to the wedding registry: you give an item chosen by the couple, with no risk of duplicates",
          "Contribute to a group fund: ideal when the couple is financing a project, a trip, or a big purchase",
          "Give cash, often via the box on the day: simple, discreet, and always useful",
          "Give a personal gift: touching for a close one, best kept for couples whose tastes you know well",
        ],
      },
      {
        type: "text",
        title: "Follow the couple's wishes first",
        paragraphs: [
          "More and more couples state their preference clearly: a registry at a store, an online fund, or a box for cash gifts. Respecting that choice is the best way to do well. A couple who opened a honeymoon fund probably doesn't need yet another decorative object.",
          "If no indication is given, cash stays the most flexible gift: it leaves the couple free to put it toward what they lack. A personal gift only makes sense if you truly know their tastes; when in doubt, better to contribute to what they asked for.",
        ],
      },
      {
        type: "text",
        title: "How much to give by relationship",
        paragraphs: [
          "There's no official rate, but a principle: the amount adjusts to your closeness with the couple and your means. A close friend or family member generally gives more than an acquaintance or colleague. Coming as a couple, or already sharing other costs, also plays in.",
          "The key is staying comfortable with your budget: a gift is given gladly, not under pressure. Better a modest, sincere amount than a spend that puts you in difficulty. The couple remembers your presence and attention far more than the exact sum.",
        ],
      },
      {
        type: "list",
        title: "What's done, what's avoided",
        items: [
          "Done: contribute to the registry or fund, slip a gift into the box, add a personal note to cash",
          "Done: team up with several people to give a bigger gift",
          "Avoided: giving a bulky off-registry object without knowing the couple's tastes and home",
          "Avoided: showing up empty-handed when a registry or fund was clearly offered",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "One principle is enough: follow what the couple asked for, and adjust the amount to your bond and your means. A sincere note with the gift often counts as much as the gift itself.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To fine-tune the amount, our guide to [how much to give for a wedding as a guest](/blog/combien-donner-mariage-invite) gives concrete markers. On the couple's side, the choice between formats is covered in [group fund, registry, or box: which to choose](/blog/cagnotte-liste-urne-mariage-choisir). And to build a useful wedding registry, see our [gift registry guide](/blog/liste-cadeaux-mariage-guide).",
        ],
      },
    ],
  }),

  postPair({
    slug: "combien-de-temps-dure-un-mariage",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Combien de temps dure un mariage (la journée) ?",
    titleEn: "How long does a wedding day last?",
    excerptFr:
      "Une journée de mariage dure en moyenne 12 à 15 heures, de la cérémonie civile du matin au bout de la nuit. Le déroulé type et la durée de chaque grand moment.",
    excerptEn:
      "A wedding day lasts on average 12 to 15 hours, from the morning civil ceremony to the end of the night. The typical run and the length of each big moment.",
    readingMinutes: 6,
    heroAltFr: "Couple de mariés au fil d'une longue journée de fête",
    heroAltEn: "Newlyweds through a long day of celebration",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Une journée de mariage complète dure en moyenne 12 à 15 heures, de la cérémonie civile du matin ou du début d'après-midi jusqu'au bout de la nuit. C'est une longue journée, rythmée par une succession de grands moments : cérémonie, vin d'honneur, dîner, soirée dansante, puis fin de fête.",
          "Cette durée n'a rien d'obligatoire : certains couples optent pour un format resserré, d'autres prolongent sur un week-end entier. Cet article décrit un déroulé type pour donner des ordres de grandeur, à ajuster selon vos envies et l'énergie que vous et vos invités souhaitez y mettre.",
        ],
      },
      {
        type: "list",
        title: "Le déroulé type d'une journée",
        items: [
          "Préparatifs des mariés le matin : environ 2 à 3 heures, souvent avec coiffure, maquillage et photos",
          "Cérémonie civile en mairie : autour de 20 à 30 minutes, parfois suivie d'une cérémonie religieuse ou laïque d'environ 45 minutes à 1 heure",
          "Vin d'honneur et cocktail : 1h30 à 2 heures pour accueillir tous les invités",
          "Dîner assis : 2 à 3 heures, entre plats, discours et animations",
          "Soirée dansante : de l'ouverture de bal jusqu'au petit matin, souvent 4 à 6 heures",
        ],
      },
      {
        type: "text",
        title: "Le matin : préparatifs et cérémonies",
        paragraphs: [
          "La journée commence tôt pour les mariés, avec les préparatifs, la coiffure, le maquillage et souvent une première série de photos. La cérémonie civile en mairie est brève, une vingtaine à une trentaine de minutes, l'essentiel tenant dans la lecture des textes, l'échange des consentements et la signature du registre.",
          "Quand une cérémonie religieuse ou laïque s'ajoute, comptez de trois quarts d'heure à une heure de plus, avec un temps de trajet entre les lieux. C'est souvent le moment le plus solennel et le plus émouvant de la journée, à ne pas trop comprimer.",
        ],
      },
      {
        type: "text",
        title: "L'après-midi et le soir : réception et fête",
        paragraphs: [
          "Après les cérémonies, le vin d'honneur ouvre la partie festive : une heure et demie à deux heures pour trinquer, féliciter les mariés et laisser le traiteur dresser la salle. Le dîner assis prend ensuite la relève, étiré par les discours, les animations et le temps entre les plats, souvent deux à trois heures.",
          "La soirée dansante enchaîne sur l'ouverture de bal et se prolonge tard, parfois jusqu'au petit matin. C'est la partie la plus élastique de la journée : sa durée dépend de l'énergie des mariés, de leurs invités et des contraintes horaires du lieu.",
        ],
      },
      {
        type: "text",
        title: "Comment ajuster la durée",
        paragraphs: [
          "Rien n'impose ce format complet. Un mariage plus court, centré sur la cérémonie et un déjeuner, peut tenir en une demi-journée. À l'inverse, certains couples étalent la fête sur deux jours, avec un brunch le lendemain. La durée idéale dépend de votre endurance, de celle de vos proches et du budget.",
          "Le plus utile est de construire un déroulé minuté réaliste et de prévoir des marges : les cérémonies débordent, le vin d'honneur s'étire, les discours durent plus que prévu. Un planning trop serré crée du stress ; quelques minutes de battement à chaque étape rendent la journée bien plus fluide.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Retenez l'ordre de grandeur : une journée de mariage complète tourne autour de 12 à 15 heures. Ce n'est pas une norme à atteindre mais un repère pour construire un déroulé réaliste, avec des marges à chaque étape.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour transformer ces ordres de grandeur en horaires précis, notre guide [le planning du jour J minute par minute](/blog/planning-jour-j-minute-par-minute) déroule chaque étape. Répartir les responsabilités évite les temps morts : voir [répartir les rôles le jour J](/blog/repartir-roles-jour-j-mariage). Et pour bien caler le moment le plus formel, [le déroulé de la cérémonie civile](/blog/ceremonie-civile-mairie-deroule) précise sa durée réelle.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A full wedding day lasts on average 12 to 15 hours, from the morning or early-afternoon civil ceremony to the end of the night. It's a long day, paced by a succession of big moments: ceremony, drinks reception, dinner, dancing, then the close of the party.",
          "This length is in no way compulsory: some couples opt for a tighter format, others extend over a whole weekend. This article describes a typical run to give orders of magnitude, to adjust to your wishes and the energy you and your guests want to put in.",
        ],
      },
      {
        type: "list",
        title: "The typical run of a day",
        items: [
          "Couple's preparations in the morning: about 2 to 3 hours, often with hair, makeup, and photos",
          "Civil ceremony at the town hall: around 20 to 30 minutes, sometimes followed by a religious or secular ceremony of about 45 minutes to 1 hour",
          "Drinks reception and cocktail: 1h30 to 2 hours to welcome all the guests",
          "Seated dinner: 2 to 3 hours, between courses, speeches, and entertainment",
          "Dancing: from the first dance to the small hours, often 4 to 6 hours",
        ],
      },
      {
        type: "text",
        title: "The morning: preparations and ceremonies",
        paragraphs: [
          "The day starts early for the couple, with preparations, hair, makeup, and often a first set of photos. The civil ceremony at the town hall is short, twenty to thirty minutes, the core being the reading of texts, the exchange of consents, and the signing of the register.",
          "When a religious or secular ceremony is added, count three quarters of an hour to an hour more, plus travel time between venues. It's often the most solemn and moving moment of the day, not to be over-compressed.",
        ],
      },
      {
        type: "text",
        title: "Afternoon and evening: reception and party",
        paragraphs: [
          "After the ceremonies, the drinks reception opens the festive part: an hour and a half to two hours to toast, congratulate the couple, and let the caterer set the room. The seated dinner then takes over, stretched by speeches, entertainment, and time between courses, often two to three hours.",
          "Dancing follows on from the first dance and runs late, sometimes until the small hours. It's the most elastic part of the day: its length depends on the energy of the couple, their guests, and the venue's time constraints.",
        ],
      },
      {
        type: "text",
        title: "How to adjust the length",
        paragraphs: [
          "Nothing requires this full format. A shorter wedding, centered on the ceremony and a lunch, can fit into half a day. Conversely, some couples spread the party over two days, with a brunch the next morning. The ideal length depends on your stamina, your loved ones', and the budget.",
          "The most useful thing is to build a realistic timed run and plan margins: ceremonies overrun, the drinks reception stretches, speeches last longer than expected. A too-tight schedule creates stress; a few minutes of slack at each step make the day far smoother.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Keep the order of magnitude: a full wedding day runs around 12 to 15 hours. It isn't a norm to hit but a marker to build a realistic run, with margins at each step.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To turn these orders of magnitude into precise times, our guide to [the wedding-day schedule minute by minute](/blog/planning-jour-j-minute-par-minute) walks through each step. Splitting responsibilities avoids dead time: see [sharing the roles on the day](/blog/repartir-roles-jour-j-mariage). And to properly time the most formal moment, [the run of the civil ceremony](/blog/ceremonie-civile-mairie-deroule) specifies its real length.",
        ],
      },
    ],
  }),

  postPair({
    slug: "difference-mariage-civil-religieux-laique",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Quelle différence entre mariage civil, religieux et laïque ?",
    titleEn: "What's the difference between civil, religious, and secular marriage?",
    excerptFr:
      "Seul le mariage civil a valeur légale. Le religieux est un engagement confessionnel après le civil ; le laïque, une cérémonie symbolique personnalisée sans valeur juridique.",
    excerptEn:
      "Only civil marriage has legal value. The religious one is a faith commitment after the civil; the secular one, a personalized symbolic ceremony with no legal value.",
    readingMinutes: 6,
    heroAltFr: "Trois formes de cérémonie de mariage",
    heroAltEn: "Three forms of wedding ceremony",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "La différence tient en une phrase : en France, seul le mariage civil, célébré en mairie, a une valeur légale. Le mariage religieux est un engagement spirituel qui vient après le civil, propre à une confession. La cérémonie laïque, elle, est une célébration symbolique et personnalisée, sans aucune portée juridique.",
          "Beaucoup de couples combinent ces formes : la mairie pour le socle légal, puis une cérémonie religieuse ou laïque pour l'émotion et le sens. Cet article clarifie ce que chacune apporte, et surtout ce qu'elle change ou non sur le plan du droit. Pour votre situation, la mairie et le célébrant restent vos interlocuteurs.",
        ],
      },
      {
        type: "text",
        title: "Le mariage civil : le seul qui a valeur légale",
        paragraphs: [
          "Le mariage civil est celui qui vous marie au sens de la loi. Célébré par un officier d'état civil en mairie, il crée les effets juridiques de l'union : régime matrimonial, droits de succession, filiation, protection du conjoint. C'est le seul reconnu par l'État, et il est obligatoire pour être marié.",
          "En pratique, c'est aussi le point de passage obligé : aucune cérémonie religieuse ne peut se tenir avant lui. Sa durée est courte, mais sa portée est la plus importante des trois, puisque c'est lui qui fait de vous des époux aux yeux du droit.",
        ],
      },
      {
        type: "text",
        title: "Le mariage religieux : un engagement confessionnel",
        paragraphs: [
          "Le mariage religieux est une célébration propre à une confession, catholique, juive, musulmane, protestante, orthodoxe ou autre. Il exprime un engagement spirituel devant sa communauté et selon les rites de sa foi. Il ne produit aucun effet juridique par lui-même et doit toujours suivre le mariage civil.",
          "Chaque religion a ses conditions, ses préparations et son déroulé propres, à voir directement avec le lieu de culte. Le célébrant demande en général la preuve du mariage civil préalable avant de fixer la date. C'est un choix personnel, jamais une obligation légale.",
        ],
      },
      {
        type: "text",
        title: "La cérémonie laïque : symbolique et personnalisée",
        paragraphs: [
          "La cérémonie laïque, parfois dite d'engagement, est une célébration libre et sur mesure, sans dimension religieuse ni valeur légale. Elle est menée par un officiant de cérémonie choisi par le couple, souvent un proche ou un professionnel, et peut se tenir n'importe où : dans un jardin, sur le lieu de réception, en extérieur.",
          "Son intérêt est la liberté totale de contenu : textes choisis, rituels symboliques, interventions des proches, vœux personnels. Elle séduit les couples qui veulent un moment fort et intime sans cadre religieux. Comme la cérémonie religieuse, elle ne remplace jamais le passage en mairie.",
        ],
      },
      {
        type: "list",
        title: "Les différences en un coup d'oeil",
        items: [
          "Valeur légale : civil oui, religieux non, laïque non",
          "Obligatoire pour être marié : civil oui, religieux non, laïque non",
          "Célébrant : officier d'état civil, ministre du culte, officiant de cérémonie",
          "Lieu : mairie, lieu de culte, lieu libre choisi par le couple",
          "Ordre : le civil d'abord, toujours ; le religieux ou le laïque ensuite si souhaité",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "La règle à garder en tête : le civil vous marie légalement, le religieux et le laïque ajoutent du sens et de l'émotion sans valeur juridique. On peut faire l'un, deux, ou les trois, mais le civil reste, dans tous les cas, incontournable.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour construire une célébration sur mesure, voir notre guide [choisir sa cérémonie laïque et son officiant](/blog/ceremonie-laique-choisir-officiant). Les rites confessionnels sont détaillés dans [cérémonies religieuses juive, musulmane, protestante et orthodoxe](/blog/ceremonies-religieuses-juive-musulmane-protestante-orthodoxe) et, côté catholique, dans [préparer une cérémonie religieuse catholique](/blog/ceremonie-religieuse-catholique-preparer). Enfin, pour comprendre l'antériorité obligatoire du civil, voir [le mariage civil est-il obligatoire avant le religieux](/blog/mariage-civil-obligatoire-avant-religieux).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The difference fits in one sentence: in France, only civil marriage, held at the town hall, has legal value. Religious marriage is a spiritual commitment that comes after the civil one, specific to a faith. The secular ceremony is a symbolic, personalized celebration with no legal reach at all.",
          "Many couples combine these forms: the town hall for the legal base, then a religious or secular ceremony for emotion and meaning. This article clarifies what each brings, and above all what it does or doesn't change legally. For your situation, the town hall and the officiant remain your contacts.",
        ],
      },
      {
        type: "text",
        title: "Civil marriage: the only one with legal value",
        paragraphs: [
          "Civil marriage is the one that marries you in the eyes of the law. Held by a registrar at the town hall, it creates the legal effects of the union: matrimonial regime, inheritance rights, filiation, protection of the spouse. It's the only one recognized by the State, and it's mandatory to be married.",
          "In practice, it's also the required passage: no religious ceremony may be held before it. Its length is short, but its reach is the greatest of the three, since it's what makes you spouses in the eyes of the law.",
        ],
      },
      {
        type: "text",
        title: "Religious marriage: a faith commitment",
        paragraphs: [
          "Religious marriage is a celebration specific to a faith, Catholic, Jewish, Muslim, Protestant, Orthodox, or other. It expresses a spiritual commitment before one's community and according to the rites of one's faith. It produces no legal effect by itself and must always follow the civil marriage.",
          "Each religion has its own conditions, preparations, and run, to see directly with the place of worship. The officiant generally asks for proof of the prior civil marriage before setting the date. It's a personal choice, never a legal obligation.",
        ],
      },
      {
        type: "text",
        title: "The secular ceremony: symbolic and personalized",
        paragraphs: [
          "The secular ceremony, sometimes called a commitment ceremony, is a free, tailor-made celebration, with no religious dimension or legal value. It's led by a ceremony officiant chosen by the couple, often a loved one or a professional, and can be held anywhere: in a garden, at the reception venue, outdoors.",
          "Its appeal is total freedom of content: chosen texts, symbolic rituals, contributions from loved ones, personal vows. It attracts couples who want a strong, intimate moment without a religious frame. Like the religious ceremony, it never replaces the passage at the town hall.",
        ],
      },
      {
        type: "list",
        title: "The differences at a glance",
        items: [
          "Legal value: civil yes, religious no, secular no",
          "Mandatory to be married: civil yes, religious no, secular no",
          "Officiant: registrar, minister of religion, ceremony officiant",
          "Venue: town hall, place of worship, free venue chosen by the couple",
          "Order: the civil one first, always; the religious or secular one after if wished",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "The rule to keep in mind: the civil ceremony marries you legally, the religious and secular ones add meaning and emotion with no legal value. You can do one, two, or all three, but the civil one remains, in every case, unavoidable.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To build a tailor-made celebration, see our guide to [choosing your secular ceremony and officiant](/blog/ceremonie-laique-choisir-officiant). Faith rites are detailed in [Jewish, Muslim, Protestant, and Orthodox religious ceremonies](/blog/ceremonies-religieuses-juive-musulmane-protestante-orthodoxe) and, on the Catholic side, in [preparing a Catholic religious ceremony](/blog/ceremonie-religieuse-catholique-preparer). Finally, to understand the required precedence of the civil one, see [is civil marriage mandatory before the religious one](/blog/mariage-civil-obligatoire-avant-religieux).",
        ],
      },
    ],
  }),
];

export const { fr: POSTS_256_264_FR, en: POSTS_256_264_EN } = pairsToArrays(pairs);
