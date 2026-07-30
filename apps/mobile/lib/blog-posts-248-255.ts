import { postPair, pairsToArrays } from "./blog-posts-shared";

const pairs = [
  postPair({
    slug: "combien-coute-piece-montee-mariage",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Combien coûte une pièce montée de mariage ?",
    titleEn: "How much does a wedding croquembouche cost?",
    excerptFr:
      "Comptez 4,50 à 9 € par personne pour une pièce montée classique, soit environ 450 à 900 € pour 100 invités. Prix par choux, nombre de parts et ce qui fait varier la facture.",
    excerptEn:
      "Count on 4.50 to 9 € per person for a classic croquembouche, roughly 450 to 900 € for 100 guests. Price per puff, number of servings, and what makes the bill vary.",
    readingMinutes: 6,
    heroAltFr: "Pièce montée en choux servie lors d'un mariage",
    heroAltEn: "Croquembouche of cream puffs served at a wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Une pièce montée de mariage coûte en moyenne 4,50 à 9 € par personne, ce qui place le dessert autour de 450 à 900 € pour une centaine d'invités. La fourchette est large parce qu'elle dépend du type de pièce montée, du nombre de choux servis et du niveau de personnalisation.",
          "C'est un poste modeste au regard du budget global, mais très visible le jour J : c'est le dessert que l'on découpe devant tout le monde. Quelques repères permettent de commander la bonne taille sans payer pour du décor superflu.",
        ],
      },
      {
        type: "text",
        title: "Prix moyen par personne et par choux",
        paragraphs: [
          "La plupart des pâtissiers facturent la pièce montée au nombre de parts, souvent entre 3,50 et 10 € par personne selon le modèle. Pour la pièce montée traditionnelle en choux, on retient volontiers une fourchette de 4,50 à 9 € par convive, décor compris.",
          "Ce tarif intègre la quantité recommandée de 3 à 4 choux par personne, le repère habituel pour éviter la pénurie au moment du service. Pris à l'unité, un chou garni revient en moyenne à 1,50 à 3 €. Raisonner en parts plutôt qu'en pièces évite de sous-estimer la commande.",
        ],
      },
      {
        type: "text",
        title: "Pièce montée ou wedding cake : deux logiques de prix",
        paragraphs: [
          "La pièce montée en choux se calcule au nombre de parts, ce qui la rend facile à ajuster à votre nombre d'invités. Le wedding cake à étages, lui, se facture souvent à la pièce et au travail de décor : pâte à sucre, modelages, glaçage soigné font grimper le prix de la main-d'oeuvre plus vite que la quantité de gâteau.",
          "À nombre d'invités égal, un wedding cake très travaillé dépasse fréquemment le prix d'une pièce montée classique. Le choix se fait donc autant sur l'esthétique voulue que sur le budget : une belle pièce montée sobre reste souvent l'option la plus économique.",
        ],
      },
      {
        type: "list",
        title: "Un exemple de budget selon le nombre d'invités",
        items: [
          "Pour 20 invités, comptez de l'ordre de 90 à 180 € pour une pièce montée classique",
          "Pour 50 invités, l'ordre de grandeur tourne souvent autour de 350 €",
          "Pour 100 invités, prévoyez globalement 450 à 900 € selon le décor",
          "La livraison, le montage sur place et la location du présentoir ajoutent fréquemment 70 à 150 € au devis",
        ],
      },
      {
        type: "text",
        title: "Ce qui fait varier le prix",
        paragraphs: [
          "Le premier facteur est la personnalisation : modelages, thème sur mesure, décor en chocolat artisanal ou pâte à sucre font vite monter la facture au-delà des repères ci-dessus. Une pièce montée sobre coûte nettement moins qu'une création scénographiée.",
          "Viennent ensuite la renommée du pâtissier, la saison, et les frais annexes trop souvent oubliés au moment de comparer les devis : livraison, montage, présentoir. Deux devis affichés au même prix par part ne coûtent pas la même chose une fois ces lignes ajoutées.",
        ],
      },
      {
        type: "list",
        title: "Comment réduire la facture",
        items: [
          "Choisir un modèle sobre plutôt qu'une création très décorée : le décor coûte souvent plus que le gâteau lui-même",
          "Compléter une pièce montée plus petite par un dessert plus simple ou un bar sucré, pour baisser le nombre de parts premium",
          "Comparer un pâtissier de quartier et l'option traiteur : le premier est parfois plus riche et moins cher",
          "Vérifier ce que le devis inclut vraiment (livraison, montage, présentoir) avant de le comparer à un autre",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "La bonne question n'est pas le prix affiché par part, mais le total une fois la livraison, le montage et le présentoir ajoutés, pour votre nombre réel d'invités. Une pièce montée sobre bien dimensionnée coûte souvent moitié moins qu'une création scénographiée, sans que personne ne s'en plaigne.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour choisir entre les formats de dessert, voir notre guide [gâteau ou pièce montée](/blog/gateau-piece-montee-mariage) et, si vous cherchez plus léger, [les alternatives à la pièce montée](/blog/dessert-bar-alternatives-piece-montee). Intégrez ensuite ce poste dans la [répartition du budget par poste](/blog/repartition-budget-mariage-par-poste) pour qu'il ne déborde pas sur le reste.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A wedding croquembouche costs on average 4.50 to 9 € per person, which puts the dessert around 450 to 900 € for about a hundred guests. The range is wide because it depends on the type of piece, the number of puffs served, and the level of customization.",
          "It's a modest item against the overall budget, but a very visible one on the day: it's the dessert cut in front of everyone. A few benchmarks let you order the right size without paying for superfluous decor.",
        ],
      },
      {
        type: "text",
        title: "Average price per person and per puff",
        paragraphs: [
          "Most pastry chefs bill the piece by the number of servings, often between 3.50 and 10 € per person depending on the model. For the traditional cream-puff croquembouche, a range of 4.50 to 9 € per guest, decor included, is the usual reference.",
          "That rate covers the recommended quantity of 3 to 4 puffs per person, the standard benchmark to avoid running short at service. Taken individually, a filled puff averages 1.50 to 3 €. Thinking in servings rather than pieces avoids underestimating the order.",
        ],
      },
      {
        type: "text",
        title: "Croquembouche or wedding cake: two pricing logics",
        paragraphs: [
          "The cream-puff croquembouche is priced by the number of servings, which makes it easy to adjust to your guest count. The tiered wedding cake is often billed by the piece and by decor labor: fondant, modeling, careful icing push the labor price up faster than the amount of cake.",
          "For the same guest count, a heavily worked wedding cake frequently exceeds the price of a classic croquembouche. So the choice is as much about the look you want as about budget: a fine, understated croquembouche often remains the most economical option.",
        ],
      },
      {
        type: "list",
        title: "A sample budget by guest count",
        items: [
          "For 20 guests, count on roughly 90 to 180 € for a classic croquembouche",
          "For 50 guests, the order of magnitude often sits around 350 €",
          "For 100 guests, plan broadly on 450 to 900 € depending on the decor",
          "Delivery, on-site assembly, and stand rental frequently add 70 to 150 € to the quote",
        ],
      },
      {
        type: "text",
        title: "What makes the price vary",
        paragraphs: [
          "The first factor is customization: modeling, a bespoke theme, artisanal chocolate decor, or fondant quickly push the bill beyond the benchmarks above. A plain croquembouche costs clearly less than a staged creation.",
          "Then come the chef's reputation, the season, and the extra costs too often forgotten when comparing quotes: delivery, assembly, stand. Two quotes showing the same price per serving don't cost the same once those lines are added.",
        ],
      },
      {
        type: "list",
        title: "How to reduce the bill",
        items: [
          "Pick a plain model over a heavily decorated creation: the decor often costs more than the cake itself",
          "Pair a smaller croquembouche with a simpler dessert or a sweet bar, to lower the number of premium servings",
          "Compare a local pastry chef with the caterer option: the former is sometimes richer and cheaper",
          "Check what the quote really includes (delivery, assembly, stand) before comparing it with another",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "The right question isn't the price shown per serving, but the total once delivery, assembly, and the stand are added, for your real guest count. A well-sized, understated croquembouche often costs half as much as a staged creation, with no one complaining.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To choose between dessert formats, see our guide to [cake or croquembouche](/blog/gateau-piece-montee-mariage) and, if you want something lighter, [alternatives to the croquembouche](/blog/dessert-bar-alternatives-piece-montee). Then fold this item into your [budget breakdown by line item](/blog/repartition-budget-mariage-par-poste) so it doesn't spill onto the rest.",
        ],
      },
    ],
  }),

  postPair({
    slug: "combien-coute-faire-part-mariage",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Combien coûte un faire-part de mariage ?",
    titleEn: "How much does a wedding invitation cost?",
    excerptFr:
      "Comptez 1 à 3,50 € l'unité pour un faire-part papier classique, enveloppe comprise, avant affranchissement, soit 50 à 250 € pour 100 exemplaires. Papier ou numérique et ce qui fait le prix.",
    excerptEn:
      "Count on 1 to 3.50 € a unit for a classic paper invitation, envelope included, before postage, so 50 to 250 € for 100 pieces. Paper or digital, and what drives the price.",
    readingMinutes: 6,
    heroAltFr: "Faire-part de mariage papier avec enveloppe",
    heroAltEn: "Paper wedding invitation with envelope",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Un faire-part de mariage papier coûte en moyenne 1 à 3,50 € l'unité, enveloppe comprise et avant affranchissement, ce qui représente environ 50 à 250 € pour 100 exemplaires. Le prix dépend surtout du papier, du type d'impression et du degré de personnalisation.",
          "C'est un poste où l'écart entre le minimum et le haut de gamme est énorme pour un objet a priori simple. Bien cadré, il reste modeste ; laissé aux finitions premium sans réfléchir, il peut peser plus qu'attendu, surtout affranchissement compris.",
        ],
      },
      {
        type: "text",
        title: "Prix à l'unité selon le papier et l'impression",
        paragraphs: [
          "Une carte simple bien imprimée, avec enveloppe, tourne souvent entre 1,50 et 3,50 € l'unité avant affranchissement. Les modèles standard prêts à personnaliser démarrent autour de 1 € pièce, tandis que les faire-part premium (finitions nacrées, formats originaux, photo recto-verso) montent de 2,50 à 5 € l'unité.",
          "Les sites d'impression en ligne appliquent presque toujours des prix dégressifs : plus la quantité augmente, plus le prix unitaire baisse. Commander en un seul lot, plutôt qu'en plusieurs fois, fait donc mécaniquement baisser le coût par carte.",
        ],
      },
      {
        type: "text",
        title: "Papier ou numérique : l'écart de coût",
        paragraphs: [
          "Le faire-part numérique change l'ordre de grandeur : pas de papier, pas d'impression, pas d'affranchissement. Le coût se limite souvent à un abonnement de site ou à un modèle payant, parfois à rien du tout. Pour un grand nombre d'invités, l'économie est réelle.",
          "Beaucoup de couples choisissent une formule mixte : un beau faire-part papier pour les proches et les invitations formelles, et une version numérique pour le reste et pour les informations pratiques. On garde l'objet où il compte sans imprimer cent cartes pour tout le monde.",
        ],
      },
      {
        type: "list",
        title: "Ce qui fait varier le prix",
        items: [
          "Le papier : un grammage épais, texturé ou nacré coûte plus qu'un papier standard",
          "L'impression et les finitions : dorure, coins arrondis, découpe, photo premium alourdissent la facture",
          "La quantité : les prix dégressifs récompensent une commande unique et bien dimensionnée",
          "La personnalisation graphique : un modèle prêt à l'emploi coûte moins qu'une création sur mesure par un graphiste",
          "L'affranchissement, souvent oublié : un format ou un poids inhabituel augmente le tarif postal par carte",
        ],
      },
      {
        type: "text",
        title: "Comment réduire la facture",
        paragraphs: [
          "Le levier le plus simple est de commander en une seule fois, en profitant des paliers dégressifs, et de vérifier votre liste d'invités avant d'imprimer pour ne pas relancer un petit lot au prix fort. Restez sur un format et un poids standard pour maîtriser l'affranchissement.",
          "Ensuite, réservez le papier premium aux pièces vraiment vues de près, et basculez le reste (coupon-réponse, plan d'accès, informations) en numérique ou sur une page web dédiée. On concentre la dépense là où elle se remarque.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Ne comparez pas seulement le prix affiché par carte : ajoutez l'affranchissement et les finitions, et raisonnez sur la quantité réelle. Une commande unique en format standard, complétée par du numérique pour l'accessoire, fait souvent l'essentiel de l'économie.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour le style et la mise en page, voir notre guide [papeterie et design du faire-part](/blog/papeterie-mariage-faire-part-design). Le choix de fond se tranche dans [faire-part papier ou numérique](/blog/faire-part-papier-ou-numerique), et le calendrier d'envoi dans [quand envoyer les faire-part et comment les rédiger](/blog/faire-part-quand-envoyer-wording).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A paper wedding invitation costs on average 1 to 3.50 € a unit, envelope included and before postage, which comes to about 50 to 250 € for 100 pieces. The price depends mostly on the paper, the type of printing, and the degree of customization.",
          "It's an item where the gap between the minimum and the high end is enormous for a seemingly simple object. Well framed, it stays modest; left to premium finishes without thinking, it can weigh more than expected, especially with postage.",
        ],
      },
      {
        type: "text",
        title: "Unit price by paper and printing",
        paragraphs: [
          "A simple, well-printed card with an envelope often runs between 1.50 and 3.50 € a unit before postage. Standard ready-to-personalize models start around 1 € a piece, while premium invitations (pearlized finishes, original formats, double-sided photo) climb from 2.50 to 5 € a unit.",
          "Online printing sites almost always apply tiered pricing: the larger the quantity, the lower the unit price. Ordering in a single batch, rather than in several rounds, mechanically lowers the cost per card.",
        ],
      },
      {
        type: "text",
        title: "Paper or digital: the cost gap",
        paragraphs: [
          "The digital invitation changes the order of magnitude: no paper, no printing, no postage. The cost is often limited to a site subscription or a paid template, sometimes nothing at all. For a large guest count, the saving is real.",
          "Many couples choose a mixed formula: a fine paper invitation for close ones and formal invites, and a digital version for the rest and for practical information. You keep the object where it matters without printing a hundred cards for everyone.",
        ],
      },
      {
        type: "list",
        title: "What makes the price vary",
        items: [
          "The paper: a thick, textured, or pearlized stock costs more than standard paper",
          "Printing and finishes: gilding, rounded corners, die-cutting, premium photo weigh on the bill",
          "The quantity: tiered pricing rewards a single, well-sized order",
          "Graphic customization: a ready-made template costs less than bespoke design by a graphic artist",
          "Postage, often forgotten: an unusual format or weight raises the postal rate per card",
        ],
      },
      {
        type: "text",
        title: "How to reduce the bill",
        paragraphs: [
          "The simplest lever is to order in one go, taking advantage of the tiered levels, and to check your guest list before printing so you don't reorder a small batch at full price. Stay with a standard format and weight to control postage.",
          "Then reserve premium paper for the pieces truly seen up close, and shift the rest (reply card, directions, information) to digital or a dedicated web page. You concentrate the spend where it shows.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Don't just compare the price shown per card: add postage and finishes, and reason on the real quantity. A single order in standard format, rounded out with digital for the accessory pieces, often makes up most of the saving.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "For style and layout, see our guide to [invitation stationery and design](/blog/papeterie-mariage-faire-part-design). The underlying choice is settled in [paper or digital invitations](/blog/faire-part-papier-ou-numerique), and the sending schedule in [when to send invitations and how to word them](/blog/faire-part-quand-envoyer-wording).",
        ],
      },
    ],
  }),

  postPair({
    slug: "combien-coute-coiffure-maquillage-mariee",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Combien coûte la coiffure et le maquillage de la mariée ?",
    titleEn: "How much do the bride's hair and makeup cost?",
    excerptFr:
      "Comptez 300 à 600 € pour un forfait complet essai plus jour J. Prix de l'essai seul, du déplacement à domicile, des personnes en plus, et comment maîtriser ce poste.",
    excerptEn:
      "Count on 300 to 600 € for a full package: trial plus the day. Price of the trial alone, home travel, extra people, and how to keep this item in check.",
    readingMinutes: 6,
    heroAltFr: "Maquilleuse préparant une mariée le matin du jour J",
    heroAltEn: "Makeup artist preparing a bride on the morning of the day",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "La coiffure et le maquillage de la mariée coûtent en moyenne 300 à 600 € pour un forfait complet réunissant l'essai et la prestation du jour J. Les indépendants se situent souvent entre 250 et 400 €, les studios et agences spécialisées plutôt entre 400 et 600 €.",
          "C'est un poste où la fourchette dépend surtout du prestataire, de la longueur des cheveux et de ce que le forfait inclut vraiment. Le premier réflexe est donc de comparer non pas des prix isolés, mais des prestations comparables, essai compris ou non.",
        ],
      },
      {
        type: "text",
        title: "Prix moyen : forfait, coiffure et maquillage séparés",
        paragraphs: [
          "Le forfait complet coiffure plus maquillage, essai inclus, tourne le plus souvent entre 300 et 600 €. Pris séparément, la coiffure seule va de 150 à 500 € selon la technicité et la longueur, et le maquillage seul de 100 à 400 € pour une finition longue tenue et photogénique.",
          "Additionner deux prestations séparées revient parfois plus cher qu'un forfait pensé comme un tout. À l'inverse, si vous ne voulez qu'un maquillage ou qu'une mise en beauté légère, un tarif à la carte peut suffire. Demandez toujours le détail, pas seulement le prix global.",
        ],
      },
      {
        type: "text",
        title: "L'essai, l'à-domicile et les personnes en plus",
        paragraphs: [
          "L'essai, souvent réalisé quelques semaines avant, est parfois compris dans le forfait, parfois facturé à part, généralement entre 80 et 150 €. Vérifiez ce point avant de comparer deux devis : un forfait sans essai n'est pas moins cher, il est incomplet.",
          "Le déplacement à domicile le matin du jour J ajoute un coût de logistique : se rendre au salon plutôt que de faire venir la prestataire permet souvent d'économiser 50 à 150 €. Enfin, chaque personne supplémentaire (mère, témoin, demoiselle d'honneur) est facturée en plus, à un tarif généralement inférieur à celui de la mariée.",
        ],
      },
      {
        type: "list",
        title: "Ce qui fait varier le prix",
        items: [
          "L'inclusion ou non de l'essai dans le forfait, l'écart le plus fréquent entre deux devis",
          "Le statut du prestataire : indépendant, souvent moins cher, ou studio et agence spécialisés",
          "La longueur et la technicité de la coiffure, et la tenue attendue du maquillage sur une longue journée",
          "Le déplacement à domicile, qui ajoute des frais absents d'une prestation au salon",
          "Le nombre de personnes à préparer en plus de la mariée, chacune facturée séparément",
        ],
      },
      {
        type: "text",
        title: "Comment réduire la facture",
        paragraphs: [
          "Le levier le plus net est de se rendre au salon plutôt que de demander un déplacement, quand la logistique du matin le permet. Ensuite, ciblez ce qui compte pour vous : parfois une belle coiffure et un maquillage léger fait maison, ou l'inverse, plutôt que le forfait maximal.",
          "Groupez les prestations : préparer la mariée et deux ou trois proches chez le même prestataire, le même matin, revient souvent moins cher que des rendez-vous séparés. Et gardez l'essai, même s'il a un coût : refaire une mise en beauté ratée le jour J coûte bien plus, en argent comme en stress.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Comparez des forfaits comparables : essai inclus ou non, à domicile ou au salon, personnes en plus comptées ou pas. Un prix global bas cache parfois un essai facturé à part ou un déplacement ajouté. Gardez l'essai dans tous les cas : c'est l'assurance du jour J.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Avant de réserver, notre guide [pourquoi l'essai change tout](/blog/coiffure-maquillage-mariage-essai) explique ce que l'on valide vraiment ce jour-là. Pensez la mise en beauté avec [le voile, les bijoux et les accessoires de la mariée](/blog/accessoires-mariee-voile-bijoux), et placez ce poste dans la [répartition du budget par poste](/blog/repartition-budget-mariage-par-poste).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The bride's hair and makeup cost on average 300 to 600 € for a full package combining the trial and the day-of service. Independents often sit between 250 and 400 €, studios and specialized agencies rather between 400 and 600 €.",
          "It's an item where the range depends mostly on the provider, the hair length, and what the package really includes. So the first reflex is to compare not isolated prices, but comparable services, trial included or not.",
        ],
      },
      {
        type: "text",
        title: "Average price: package, hair and makeup separately",
        paragraphs: [
          "The full hair-plus-makeup package, trial included, most often runs between 300 and 600 €. Taken separately, hair alone ranges from 150 to 500 € depending on technicality and length, and makeup alone from 100 to 400 € for a long-wear, photogenic finish.",
          "Adding two separate services sometimes costs more than a package designed as a whole. Conversely, if you want only makeup or a light touch-up, an à-la-carte rate can be enough. Always ask for the detail, not just the overall price.",
        ],
      },
      {
        type: "text",
        title: "The trial, home service, and extra people",
        paragraphs: [
          "The trial, often done a few weeks before, is sometimes included in the package, sometimes billed separately, generally between 80 and 150 €. Check this point before comparing two quotes: a package without a trial isn't cheaper, it's incomplete.",
          "Traveling to your home on the morning adds a logistics cost: going to the salon rather than having the artist come to you often saves 50 to 150 €. Finally, each additional person (mother, witness, bridesmaid) is billed extra, usually at a rate below the bride's.",
        ],
      },
      {
        type: "list",
        title: "What makes the price vary",
        items: [
          "Whether the trial is included in the package, the most frequent gap between two quotes",
          "The provider's status: independent, often cheaper, or specialized studio and agency",
          "The length and technicality of the hairstyle, and the makeup wear expected over a long day",
          "Travel to your home, which adds fees absent from a salon service",
          "The number of people to prepare beyond the bride, each billed separately",
        ],
      },
      {
        type: "text",
        title: "How to reduce the bill",
        paragraphs: [
          "The clearest lever is to go to the salon rather than request travel, when the morning logistics allow. Then target what matters to you: sometimes a fine hairstyle with light homemade makeup, or the reverse, rather than the maximal package.",
          "Group the services: preparing the bride and two or three close ones at the same provider, the same morning, often costs less than separate appointments. And keep the trial, even at a cost: redoing a botched look on the day costs far more, in money and stress.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Compare comparable packages: trial included or not, at home or at the salon, extra people counted or not. A low overall price sometimes hides a separately billed trial or added travel. Keep the trial in every case: it's the day's insurance.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Before booking, our guide to [why the trial changes everything](/blog/coiffure-maquillage-mariage-essai) explains what you really confirm that day. Design the look alongside [the bride's veil, jewelry and accessories](/blog/accessoires-mariee-voile-bijoux), and place this item in your [budget breakdown by line item](/blog/repartition-budget-mariage-par-poste).",
        ],
      },
    ],
  }),

  postPair({
    slug: "combien-coute-bague-de-fiancailles",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Combien coûte une bague de fiançailles ?",
    titleEn: "How much does an engagement ring cost?",
    excerptFr:
      "En France, le prix moyen d'une bague de fiançailles se situe entre 1 000 et 3 000 €. La règle des mois de salaire est un mythe : ce qui fait le prix, c'est la pierre et le métal.",
    excerptEn:
      "In France, the average engagement ring costs between 1,000 and 3,000 €. The months-of-salary rule is a myth: what drives the price is the stone and the metal.",
    readingMinutes: 6,
    heroAltFr: "Bague de fiançailles avec pierre présentée dans son écrin",
    heroAltEn: "Engagement ring with a stone presented in its box",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "En France, une bague de fiançailles coûte en moyenne entre 1 000 et 3 000 €. La fourchette est large parce qu'elle recouvre des styles, des pierres et des métaux très différents : certaines études situent le budget médian plus bas, autour de 700 à 800 €, tandis que les bagues serties d'un diamant important dépassent facilement 5 000 €.",
          "L'important n'est pas de viser une moyenne, mais de comprendre ce qui fait le prix. Une fois les bons critères en tête, on peut composer une belle bague à presque tous les budgets, sans se laisser dicter une somme par une règle marketing.",
        ],
      },
      {
        type: "text",
        title: "Le mythe des X mois de salaire",
        paragraphs: [
          "L'idée qu'il faudrait dépenser un, deux ou trois mois de salaire pour une bague de fiançailles n'est pas une règle : c'est un slogan publicitaire, né au siècle dernier pour vendre plus de diamants. Aucune convention ne l'impose, et beaucoup de couples heureux n'y ont jamais prêté attention.",
          "Le bon repère n'est pas un multiple de votre revenu, mais ce que vous pouvez dépenser sereinement au moment des fiançailles, en gardant de la marge pour le mariage lui-même. Une bague choisie dans un budget confortable vaut mieux qu'une bague qui pèse sur le reste du projet.",
        ],
      },
      {
        type: "list",
        title: "Ce qui fait le prix : la pierre et le métal",
        items: [
          "La pierre centrale, premier facteur : un diamant naturel de belle taille et de bonne qualité représente souvent l'essentiel du prix",
          "Le type de pierre : diamant de laboratoire, saphir, autres pierres de couleur ou pierre plus modeste font varier fortement la facture à taille égale",
          "Le métal : l'or et surtout le platine coûtent plus que l'argent ou l'or gris d'entrée de gamme",
          "La qualité du diamant, résumée par la taille, la couleur, la pureté et le poids en carats",
          "La monture et la personnalisation : une création sur mesure coûte plus qu'un modèle de série",
        ],
      },
      {
        type: "text",
        title: "Les fourchettes réelles, du simple au diamant",
        paragraphs: [
          "En entrée de gamme, une bague fine avec une petite pierre ou une pierre de couleur reste accessible bien en dessous de 1 000 €. Le coeur du marché, entre 1 000 et 3 000 €, permet déjà un diamant visible sur une monture soignée.",
          "Au-delà, le prix suit surtout la taille et la qualité du diamant : une pierre plus importante, un métal précieux comme le platine, une monture travaillée peuvent porter le budget à 5 000 € et bien davantage. C'est la pierre, plus que le reste, qui explique ces écarts.",
        ],
      },
      {
        type: "text",
        title: "Comment maîtriser le budget",
        paragraphs: [
          "Plusieurs leviers permettent une belle bague sans exploser le budget. Un diamant de laboratoire offre le même éclat qu'un diamant naturel pour un prix nettement inférieur. Une pierre de couleur, un saphir par exemple, change le style tout en baissant la facture. Une taille de pierre légèrement en dessous d'un cap symbolique (le carat rond, par exemple) fait souvent chuter le prix pour une différence invisible à l'oeil.",
          "Enfin, le choix du métal et de la monture pèse : un or gris ou une monture plus sobre laissent le budget se concentrer sur la pierre. L'idée n'est pas de dépenser le moins possible, mais de mettre l'argent là où il se voit vraiment.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Aucune règle n'impose un montant : la bague de fiançailles se choisit dans un budget confortable, pas en multiples de salaire. Ce qui fait le prix, c'est d'abord la pierre, puis le métal. Jouer sur le type et la taille de pierre permet une belle bague à presque tous les budgets.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour aller plus loin sur les critères de choix, voir notre guide [choisir la bague de fiançailles](/blog/bague-fiancailles-choisir-guide). La question des alliances, distincte, est détaillée dans [choisir ses alliances de mariage](/blog/choisir-alliances-mariage). Et pour situer ce poste dans l'ensemble, notre repère [budget de mariage 2026, combien prévoir](/blog/budget-mariage-2026-combien-prevoir) donne le cadre global.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "In France, an engagement ring costs on average between 1,000 and 3,000 €. The range is wide because it covers very different styles, stones, and metals: some studies place the median budget lower, around 700 to 800 €, while rings set with a large diamond easily exceed 5,000 €.",
          "The point isn't to aim for an average, but to understand what drives the price. Once you have the right criteria in mind, you can build a fine ring at almost any budget, without letting a marketing rule dictate a figure.",
        ],
      },
      {
        type: "text",
        title: "The months-of-salary myth",
        paragraphs: [
          "The idea that you should spend one, two, or three months' salary on an engagement ring isn't a rule: it's an advertising slogan, born last century to sell more diamonds. No convention imposes it, and many happy couples never paid it any attention.",
          "The right benchmark isn't a multiple of your income, but what you can spend calmly at the engagement, keeping a margin for the wedding itself. A ring chosen within a comfortable budget beats a ring that weighs on the rest of the project.",
        ],
      },
      {
        type: "list",
        title: "What drives the price: the stone and the metal",
        items: [
          "The center stone, the first factor: a natural diamond of good size and quality often makes up most of the price",
          "The type of stone: a lab-grown diamond, sapphire, other colored stones, or a more modest stone strongly vary the bill at equal size",
          "The metal: gold and especially platinum cost more than silver or entry-level white gold",
          "The diamond's quality, summed up by cut, color, clarity, and carat weight",
          "The setting and customization: a bespoke creation costs more than an off-the-shelf model",
        ],
      },
      {
        type: "text",
        title: "The real ranges, from simple to diamond",
        paragraphs: [
          "At entry level, a thin ring with a small stone or a colored stone stays accessible well below 1,000 €. The heart of the market, between 1,000 and 3,000 €, already allows a visible diamond on a careful setting.",
          "Beyond that, the price mostly follows the diamond's size and quality: a larger stone, a precious metal like platinum, a worked setting can push the budget to 5,000 € and well above. It's the stone, more than the rest, that explains these gaps.",
        ],
      },
      {
        type: "text",
        title: "How to keep the budget in check",
        paragraphs: [
          "Several levers allow a fine ring without blowing the budget. A lab-grown diamond offers the same sparkle as a natural one for a clearly lower price. A colored stone, a sapphire for instance, changes the style while lowering the bill. A stone size just below a symbolic threshold (the round carat, for example) often drops the price for a difference invisible to the eye.",
          "Finally, the choice of metal and setting matters: white gold or a plainer setting let the budget concentrate on the stone. The idea isn't to spend as little as possible, but to put the money where it truly shows.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "No rule imposes an amount: the engagement ring is chosen within a comfortable budget, not in multiples of salary. What drives the price is first the stone, then the metal. Playing on the type and size of stone allows a fine ring at almost any budget.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To go further on the selection criteria, see our guide to [choosing the engagement ring](/blog/bague-fiancailles-choisir-guide). The separate question of wedding bands is covered in [choosing your wedding rings](/blog/choisir-alliances-mariage). And to place this item in the whole, our benchmark [2026 wedding budget, how much to plan](/blog/budget-mariage-2026-combien-prevoir) gives the overall frame.",
        ],
      },
    ],
  }),

  postPair({
    slug: "combien-coute-groupe-musique-mariage",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Combien coûte un groupe de musique pour un mariage ?",
    titleEn: "How much does a wedding band cost?",
    excerptFr:
      "Comptez 1 000 à 4 000 € pour un groupe live, contre 700 à 1 500 € pour un DJ. Le prix suit le nombre de musiciens et la durée. Repères par formation et formule hybride.",
    excerptEn:
      "Count on 1,000 to 4,000 € for a live band, against 700 to 1,500 € for a DJ. The price follows the number of musicians and the duration. Benchmarks by lineup and hybrid formula.",
    readingMinutes: 6,
    heroAltFr: "Groupe de musique live jouant lors d'une soirée de mariage",
    heroAltEn: "Live band playing at a wedding reception",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Un groupe de musique live pour un mariage coûte en moyenne 1 000 à 4 000 €, contre 700 à 1 500 € pour un DJ. Le live revient donc souvent deux à trois fois plus cher, parce que le prix suit d'abord le nombre de musiciens et la durée de la prestation.",
          "L'écart n'est pas seulement une question de budget : le groupe apporte une énergie et une présence que le DJ ne remplace pas, mais couvre un répertoire plus étroit. Comprendre comment se construit le prix aide à choisir la bonne formule sans se tromper de dépense.",
        ],
      },
      {
        type: "text",
        title: "Prix moyen selon le nombre de musiciens",
        paragraphs: [
          "Le tarif d'un groupe grimpe presque mécaniquement avec la taille de la formation. En ordre de grandeur, un duo se situe autour de 640 €, un trio autour de 900 €, un quartet autour de 1 150 €, un quintet autour de 1 320 €. Les formations plus étoffées ou haut de gamme dépassent 1 750 €, et un vrai groupe de 3 à 5 musiciens sur plusieurs sets peut aller de 1 500 à 5 000 €.",
          "À cela s'ajoutent la durée jouée (nombre de sets de 45 minutes), les frais de déplacement et parfois la sonorisation. Un groupe qui joue tout au long de la soirée coûte plus qu'une formation présente seulement au cocktail.",
        ],
      },
      {
        type: "text",
        title: "Groupe live ou DJ : l'écart de prix",
        paragraphs: [
          "Le DJ reste l'option la plus souple et la plus économique pour faire danser jusqu'au bout de la nuit : comptez 700 à 1 500 € pour une prestation complète, avec un prix moyen souvent cité autour de 1 200 € pour cinq à six heures. Il couvre tous les styles et enchaîne sans pause.",
          "Le groupe live, lui, offre une énergie unique mais un répertoire plus limité, et il a besoin de pauses. C'est pourquoi beaucoup de couples ne l'opposent plus au DJ : ils les combinent.",
        ],
      },
      {
        type: "list",
        title: "Ce qui fait varier le prix",
        items: [
          "Le nombre de musiciens, premier facteur : chaque musicien supplémentaire alourdit le cachet",
          "La durée de jeu : nombre et longueur des sets, présence au cocktail seul ou toute la soirée",
          "La notoriété et l'expérience du groupe, comme pour tout prestataire",
          "Les frais de déplacement et d'hébergement si la formation vient de loin",
          "La sonorisation et la technique : matériel fourni par le groupe ou à louer en plus",
        ],
      },
      {
        type: "text",
        title: "La formule hybride, souvent le meilleur compromis",
        paragraphs: [
          "La tendance forte consiste à combiner un moment live et un DJ pour la soirée dansante : groupe ou musicien au vin d'honneur, puis DJ pour enchaîner sans pause jusqu'à tard. Cette formule offre l'émotion du live quand elle compte le plus et la souplesse du DJ pour la piste.",
          "Le budget d'une formule hybride se situe souvent entre 1 300 et 3 000 € selon l'ampleur du live. C'est fréquemment le meilleur rapport entre l'effet produit et la dépense, plutôt que de tout miser sur un grand groupe présent toute la nuit.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Le prix d'un groupe suit le nombre de musiciens et la durée, pas seulement la qualité. Avant de trancher entre live et DJ, chiffrez la formule hybride : un temps live là où il compte, un DJ pour la piste, coûte souvent moins qu'un grand groupe toute la nuit pour un effet supérieur.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour trancher entre les deux, voir notre comparatif [groupe live ou DJ](/blog/groupe-live-ou-dj-mariage). Si vous partez sur un DJ, [bien choisir son DJ de mariage](/blog/choisir-dj-mariage) détaille les critères, et [construire sa playlist de mariage](/blog/playlist-mariage-construire) aide à cadrer le répertoire quel que soit le format.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A live wedding band costs on average 1,000 to 4,000 €, against 700 to 1,500 € for a DJ. The band therefore often costs two to three times more, because the price follows first the number of musicians and the length of the performance.",
          "The gap isn't only a budget matter: the band brings an energy and presence a DJ doesn't replace, but covers a narrower repertoire. Understanding how the price is built helps you choose the right formula without misspending.",
        ],
      },
      {
        type: "text",
        title: "Average price by number of musicians",
        paragraphs: [
          "A band's rate climbs almost mechanically with the size of the lineup. As an order of magnitude, a duo sits around 640 €, a trio around 900 €, a quartet around 1,150 €, a quintet around 1,320 €. Larger or high-end lineups exceed 1,750 €, and a real band of 3 to 5 musicians across several sets can run from 1,500 to 5,000 €.",
          "On top of that come the playing time (number of 45-minute sets), travel costs, and sometimes the sound system. A band that plays throughout the evening costs more than a lineup present only at the cocktail hour.",
        ],
      },
      {
        type: "text",
        title: "Live band or DJ: the price gap",
        paragraphs: [
          "The DJ remains the most flexible and economical option to keep people dancing to the end of the night: count on 700 to 1,500 € for a full service, with an average often cited around 1,200 € for five to six hours. They cover every style and run without a break.",
          "The live band offers a unique energy but a more limited repertoire, and it needs breaks. That's why many couples no longer set it against the DJ: they combine the two.",
        ],
      },
      {
        type: "list",
        title: "What makes the price vary",
        items: [
          "The number of musicians, the first factor: each extra musician raises the fee",
          "The playing time: number and length of sets, presence at the cocktail alone or all evening",
          "The band's fame and experience, as with any vendor",
          "Travel and lodging costs if the lineup comes from far away",
          "Sound and technical gear: provided by the band or to rent separately",
        ],
      },
      {
        type: "text",
        title: "The hybrid formula, often the best compromise",
        paragraphs: [
          "The strong trend is to combine a live moment and a DJ for the dance floor: a band or musician at the cocktail hour, then a DJ to run without a break until late. This formula offers the emotion of live where it matters most and the flexibility of the DJ for the floor.",
          "The budget of a hybrid formula often sits between 1,300 and 3,000 € depending on the scale of the live act. It's frequently the best ratio between the effect produced and the spend, rather than betting everything on a large band present all night.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "A band's price follows the number of musicians and the duration, not just quality. Before deciding between live and DJ, price the hybrid formula: a live moment where it counts, a DJ for the floor, often costs less than a large band all night for a greater effect.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To decide between the two, see our comparison [live band or DJ](/blog/groupe-live-ou-dj-mariage). If you go with a DJ, [choosing your wedding DJ well](/blog/choisir-dj-mariage) details the criteria, and [building your wedding playlist](/blog/playlist-mariage-construire) helps frame the repertoire whatever the format.",
        ],
      },
    ],
  }),

  postPair({
    slug: "combien-coute-un-mariage-civil-mairie",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Combien coûte un mariage civil à la mairie ?",
    titleEn: "How much does a civil wedding at the town hall cost?",
    excerptFr:
      "La cérémonie civile à la mairie est gratuite : c'est un acte de droit civil. Les seuls coûts sont annexes, alliances, tenue, éventuel vin d'honneur, et le dossier à fournir.",
    excerptEn:
      "The civil ceremony at the town hall is free: it's a civil act. The only costs are extras, rings, outfits, an optional cocktail, and the file to provide.",
    readingMinutes: 5,
    heroAltFr: "Couple se mariant civilement dans une salle de mairie",
    heroAltEn: "Couple marrying civilly in a town-hall room",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le mariage civil à la mairie est gratuit : c'est un acte de droit civil, et la cérémonie elle-même ne coûte rien. La célébration officielle (lecture des articles du Code civil, échange des consentements, signature du registre) ne fait l'objet d'aucune facture.",
          "Ce qui a un coût, ce sont uniquement les à-côtés que vous choisissez d'ajouter : alliances, tenue, éventuel vin d'honneur. Un mariage réduit à la mairie peut donc être quasiment gratuit, ou entraîner quelques dépenses selon vos envies. Voici comment s'y retrouver.",
        ],
      },
      {
        type: "text",
        title: "La cérémonie elle-même : gratuite",
        paragraphs: [
          "Aucun droit n'est demandé pour se marier civilement en France. La mairie ne facture ni la célébration, ni la publication des bans, ni l'établissement de l'acte de mariage. Le livret de famille est remis gratuitement aux époux.",
          "Autrement dit, deux personnes peuvent se marier à la mairie sans dépenser un euro pour l'acte lui-même. Tout le reste relève de choix personnels, pas d'une obligation légale.",
        ],
      },
      {
        type: "list",
        title: "Les pièces à fournir, sans frais d'acte",
        items: [
          "Une pièce d'identité en cours de validité pour chacun des futurs époux",
          "Un justificatif de domicile, souvent deux documents récents de moins de six mois",
          "Une copie intégrale de l'acte de naissance de moins de trois mois (six mois si l'acte vient de l'étranger)",
          "Les informations sur les témoins (un à deux par époux), avec leur pièce d'identité",
          "Le dossier se dépose en général au moins deux mois avant la date, le temps de la publication des bans",
        ],
      },
      {
        type: "text",
        title: "Les vrais coûts, tous annexes",
        paragraphs: [
          "Les seules dépenses d'un mariage civil sont celles que vous décidez d'ajouter. Les alliances ne sont pas obligatoires, mais si vous en voulez, une bague simple en argent se trouve à moins de 100 €, tandis que l'or fait monter le budget. La tenue, elle aussi, va du costume ou de la robe déjà dans votre garde-robe à une tenue neuve.",
          "Beaucoup de couples ajoutent un vin d'honneur ou un repas après la mairie : c'est là que le budget prend forme, selon le nombre d'invités et le format. Ces éléments ne font pas partie du mariage civil au sens strict : ce sont des choix de réception, à chiffrer séparément.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Ne cherchez pas le prix de la cérémonie civile : elle est gratuite. Le budget d'un mariage à la mairie se résume aux à-côtés que vous choisissez, alliances, tenue, éventuel vin d'honneur. On peut se marier pour presque rien, ou ajouter une vraie réception : ce sont deux décisions distinctes.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour savoir à quoi ressemble la célébration, voir notre guide [le déroulé du mariage civil à la mairie](/blog/ceremonie-civile-mairie-deroule). Le détail des pièces et des délais est dans [le dossier de mariage, bans et délais](/blog/dossier-mairie-bans-mariage-delais). Et si vous ajoutez une réception, notre guide [le vin d'honneur et le cocktail de mariage](/blog/vin-honneur-cocktail-mariage) aide à chiffrer ce moment.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A civil wedding at the town hall is free: it's a civil act, and the ceremony itself costs nothing. The official celebration (reading of the Civil Code articles, exchange of consent, signing of the register) is subject to no invoice.",
          "What has a cost is only the extras you choose to add: rings, outfits, an optional cocktail. A wedding reduced to the town hall can therefore be nearly free, or involve a few expenses depending on your wishes. Here's how to make sense of it.",
        ],
      },
      {
        type: "text",
        title: "The ceremony itself: free",
        paragraphs: [
          "No fee is charged to marry civilly in France. The town hall bills neither the celebration, nor the publication of the banns, nor the drafting of the marriage certificate. The family record book is given to the spouses free of charge.",
          "In other words, two people can marry at the town hall without spending a euro on the act itself. Everything else is a matter of personal choice, not a legal obligation.",
        ],
      },
      {
        type: "list",
        title: "The documents to provide, with no certificate fee",
        items: [
          "A valid ID for each of the future spouses",
          "Proof of address, often two recent documents less than six months old",
          "A full copy of the birth certificate less than three months old (six months if issued abroad)",
          "The witnesses' details (one to two per spouse), with their ID",
          "The file is generally filed at least two months before the date, to allow the banns' publication",
        ],
      },
      {
        type: "text",
        title: "The real costs, all extras",
        paragraphs: [
          "The only spending of a civil wedding is what you decide to add. Rings aren't mandatory, but if you want them, a simple silver ring can be found for under 100 €, while gold raises the budget. The outfit too ranges from a suit or dress already in your wardrobe to something new.",
          "Many couples add a cocktail or a meal after the town hall: that's where the budget takes shape, depending on the guest count and format. These elements aren't part of the civil wedding strictly speaking: they're reception choices, to price separately.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Don't look for the price of the civil ceremony: it's free. The budget of a town-hall wedding comes down to the extras you choose, rings, outfits, an optional cocktail. You can marry for almost nothing, or add a real reception: those are two distinct decisions.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To know what the celebration looks like, see our guide to [the run of a civil wedding at the town hall](/blog/ceremonie-civile-mairie-deroule). The detail of documents and deadlines is in [the marriage file, banns and deadlines](/blog/dossier-mairie-bans-mariage-delais). And if you add a reception, our guide to [the cocktail hour and wedding drinks reception](/blog/vin-honneur-cocktail-mariage) helps price that moment.",
        ],
      },
    ],
  }),

  postPair({
    slug: "combien-coute-mariage-100-personnes",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Combien coûte un mariage de 100 personnes ?",
    titleEn: "How much does a wedding for 100 people cost?",
    excerptFr:
      "Comptez 15 000 à 30 000 € pour un mariage de 100 invités, soit environ 150 à 300 € par personne. Le total suit le nombre de convives ; voici la répartition et les leviers.",
    excerptEn:
      "Count on 15,000 to 30,000 € for a wedding of 100 guests, roughly 150 to 300 € per person. The total follows the guest count; here's the breakdown and the levers.",
    readingMinutes: 6,
    heroAltFr: "Salle de réception dressée pour un mariage de cent invités",
    heroAltEn: "Reception room set for a wedding of a hundred guests",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Un mariage de 100 personnes coûte en moyenne 15 000 à 30 000 € en France, soit environ 150 à 300 € par invité. Certaines estimations descendent autour de 14 000 à 18 000 € pour des choix mesurés, mais la fourchette réaliste dépend surtout de la région, du lieu et du niveau de prestations.",
          "Le principe est simple : le coût total suit le nombre de convives, parce que les postes les plus lourds (traiteur, boissons, lieu) se calculent par personne. Comprendre cette mécanique aide à ajuster le budget en jouant sur le bon levier : le coût par invité, plus que le nombre lui-même.",
        ],
      },
      {
        type: "text",
        title: "Le calcul de base : invités multipliés par le coût par personne",
        paragraphs: [
          "La façon la plus juste de raisonner un budget de mariage n'est pas de partir d'un total, mais du coût par invité multiplié par le nombre de convives. À 150 € par personne, un mariage de 100 invités tourne autour de 15 000 € ; à 250 €, il approche 25 000 € ; au-delà, on entre dans le haut de gamme.",
          "Ce coût par invité intègre surtout le traiteur, les boissons et la part de lieu ramenée à chaque personne. Une fois ce chiffre estimé, multiplier par 100 donne une base solide, à compléter par les postes fixes.",
        ],
      },
      {
        type: "list",
        title: "Comment se répartit le budget",
        items: [
          "La réception (lieu et traiteur au couvert) représente souvent 50 à 60 % du total, le poste le plus lourd",
          "Le traiteur seul absorbe fréquemment 40 à 50 % du budget",
          "Les prestataires image et animation (photographe, DJ ou groupe) forment le deuxième grand bloc",
          "La tenue, la beauté, les fleurs et la décoration se partagent une part plus modeste",
          "Les faire-part, la papeterie et les frais annexes complètent, souvent sous-estimés au départ",
        ],
      },
      {
        type: "text",
        title: "Ce qui fait varier le prix",
        paragraphs: [
          "La région pèse fortement : en Île-de-France, le coût par personne grimpe volontiers vers 150 à 250 € voire davantage, contre des tarifs plus doux en province. Le lieu, la saison et le jour de la semaine jouent aussi : un samedi de juin en haute saison n'a pas le prix d'un vendredi hors saison.",
          "Le niveau de prestations fait le reste : menu, boissons, ampleur de la décoration, notoriété des prestataires. À 100 invités identiques, deux mariages peuvent aller du simple au double selon ces choix.",
        ],
      },
      {
        type: "list",
        title: "Comment réduire la facture sans réduire les invités",
        items: [
          "Agir sur le coût par personne plutôt que sur le nombre : menu, boissons et format de réception se négocient au couvert",
          "Choisir une date hors haute saison ou en semaine, souvent nettement moins chère sur le lieu et le traiteur",
          "Comparer plusieurs devis traiteur, poste le plus lourd, avant de signer",
          "Prioriser deux ou trois postes qui comptent vraiment pour vous et rester sobre sur le reste",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Ne raisonnez pas en total, mais en coût par invité multiplié par 100. C'est ce coût par personne, pas le nombre de convives, qui offre les vrais leviers : menu, boissons, date et format. Deux mariages de 100 personnes peuvent aller du simple au double selon ces choix.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Le bon point de départ reste [le coût par invité](/blog/budget-mariage-cout-par-invite), qui explique la mécanique en détail. Pour ventiler la dépense, voir [la répartition du budget par poste](/blog/repartition-budget-mariage-par-poste), et pour situer l'ensemble, [le budget de mariage 2026](/blog/budget-mariage-2026-combien-prevoir). Chiffrez votre propre scénario avec le [simulateur de budget](/tools/budget-calculator).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A wedding for 100 people costs on average 15,000 to 30,000 € in France, roughly 150 to 300 € per guest. Some estimates drop to around 14,000 to 18,000 € for measured choices, but the realistic range depends mostly on the region, the venue, and the level of service.",
          "The principle is simple: the total follows the guest count, because the heaviest items (catering, drinks, venue) are calculated per person. Understanding this mechanic helps adjust the budget by pulling the right lever: the cost per guest, more than the number itself.",
        ],
      },
      {
        type: "text",
        title: "The base calculation: guests times cost per person",
        paragraphs: [
          "The most accurate way to reason a wedding budget isn't to start from a total, but from the cost per guest multiplied by the number of guests. At 150 € per person, a wedding of 100 guests runs around 15,000 €; at 250 €, it nears 25,000 €; beyond that, you enter the high end.",
          "This cost per guest mainly covers the caterer, the drinks, and the venue share brought back to each person. Once you've estimated that figure, multiplying by 100 gives a solid base, to complete with the fixed items.",
        ],
      },
      {
        type: "list",
        title: "How the budget breaks down",
        items: [
          "The reception (venue and per-cover catering) often represents 50 to 60 % of the total, the heaviest item",
          "The caterer alone frequently absorbs 40 to 50 % of the budget",
          "Image and entertainment vendors (photographer, DJ or band) form the second big block",
          "Outfits, beauty, flowers, and decor share a more modest slice",
          "Invitations, stationery, and extra costs round it out, often underestimated at the start",
        ],
      },
      {
        type: "text",
        title: "What makes the price vary",
        paragraphs: [
          "The region weighs heavily: in the Paris area, the cost per person readily climbs toward 150 to 250 € or more, against gentler rates in the provinces. The venue, the season, and the day of the week also play in: a Saturday in June in peak season doesn't have the price of an off-season Friday.",
          "The level of service does the rest: menu, drinks, scale of decor, fame of the vendors. At 100 identical guests, two weddings can range from single to double depending on these choices.",
        ],
      },
      {
        type: "list",
        title: "How to reduce the bill without cutting guests",
        items: [
          "Act on the cost per person rather than the number: menu, drinks, and reception format are negotiated per cover",
          "Choose an off-peak or weekday date, often clearly cheaper on the venue and caterer",
          "Compare several caterer quotes, the heaviest item, before signing",
          "Prioritize two or three items that truly matter to you and stay plain on the rest",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Don't reason in totals, but in cost per guest multiplied by 100. It's that cost per person, not the guest count, that offers the real levers: menu, drinks, date, and format. Two weddings of 100 people can range from single to double depending on these choices.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "The right starting point remains [the cost per guest](/blog/budget-mariage-cout-par-invite), which explains the mechanic in detail. To split the spend, see [the budget breakdown by line item](/blog/repartition-budget-mariage-par-poste), and to place the whole, [the 2026 wedding budget](/blog/budget-mariage-2026-combien-prevoir). Price your own scenario with the [budget calculator](/tools/budget-calculator).",
        ],
      },
    ],
  }),

  postPair({
    slug: "combien-coute-mariage-50-personnes",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Combien coûte un mariage de 50 personnes ?",
    titleEn: "How much does a wedding for 50 people cost?",
    excerptFr:
      "Comptez 8 000 à 15 000 € pour un mariage de 50 invités, soit 160 à 300 € par personne. Plus petit ne veut pas dire proportionnel : les coûts fixes pèsent davantage.",
    excerptEn:
      "Count on 8,000 to 15,000 € for a wedding of 50 guests, so 160 to 300 € per person. Smaller doesn't mean proportional: fixed costs weigh more.",
    readingMinutes: 6,
    heroAltFr: "Petit mariage intime de cinquante invités dans un jardin",
    heroAltEn: "Small intimate wedding of fifty guests in a garden",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Un mariage de 50 personnes coûte en moyenne 8 000 à 15 000 € en France, soit environ 160 à 300 € par invité. Un budget minimal, avec des solutions alternatives, peut descendre autour de 5 000 à 7 000 €, tandis que des prestations soignées font grimper la note.",
          "L'erreur classique est de croire qu'un mariage de moitié moins d'invités coûte moitié moins cher. Ce n'est pas le cas : certains postes ne bougent pas avec le nombre de convives. Le coût par personne d'un petit mariage est souvent plus élevé que celui d'un grand.",
        ],
      },
      {
        type: "text",
        title: "Pourquoi ce n'est pas proportionnel : les coûts fixes",
        paragraphs: [
          "Une partie du budget ne dépend pas du nombre d'invités. Le photographe facture sa journée, pas ses convives. La robe, le costume, le DJ ou le groupe, la décoration de base, la voiture : ces postes coûtent à peu près la même chose pour 50 ou pour 150 personnes.",
          "Résultat : ces coûts fixes se répartissent sur moins de têtes, ce qui fait mécaniquement monter le coût par invité. Un petit mariage économise sur le variable (traiteur, boissons, couverts), mais garde l'essentiel du fixe. C'est pour cela qu'il ne suit pas la règle de trois.",
        ],
      },
      {
        type: "list",
        title: "Ce qui baisse, ce qui ne baisse pas",
        items: [
          "Baisse avec le nombre : le traiteur au couvert, les boissons, la papeterie, une partie de la location de mobilier",
          "Ne baisse presque pas : le photographe, le DJ ou le groupe, la tenue et la beauté, la voiture",
          "Baisse partiellement : le lieu, selon qu'il se loue au forfait ou module sa capacité",
          "La réception (lieu et traiteur) reste le premier poste, souvent 45 à 55 % du total",
        ],
      },
      {
        type: "text",
        title: "L'avantage d'un petit mariage : monter en gamme",
        paragraphs: [
          "Le petit format a une vraie contrepartie : à budget égal, on peut monter en gamme là où cela se remarque. Un menu plus travaillé, de meilleurs vins, un lieu plus intime mais plus soigné deviennent accessibles, parce que chaque euro se répartit sur moins d'invités.",
          "Beaucoup de couples choisissent 50 personnes précisément pour cela : moins de convives, mais une expérience plus dense et plus qualitative. Le budget total baisse, sans que la fête paraisse au rabais, à condition d'assumer un coût par personne plus élevé.",
        ],
      },
      {
        type: "list",
        title: "Comment réduire la facture",
        items: [
          "Choisir une date hors haute saison ou en semaine, souvent moins chère sur le lieu et le traiteur",
          "Privilégier une salle municipale ou un lieu simple, et un traiteur de proximité",
          "Alléger les coûts fixes qui comptent le moins pour vous (voiture, décoration élaborée) plutôt que le variable",
          "Faire une partie de la décoration ou de la papeterie soi-même, plus réaliste sur un petit format",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Un mariage de 50 personnes ne coûte pas moitié moins qu'un mariage de 100 : les coûts fixes (photographe, tenue, musique) ne baissent pas avec le nombre. Le coût par invité y est plus élevé, mais c'est aussi l'occasion de monter en gamme là où ça se voit.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour comprendre la mécanique fixe et variable, voir [le coût par invité](/blog/budget-mariage-cout-par-invite). Si vous visez sobre, nos [10 conseils pour un mariage à petit budget](/blog/mariage-petit-budget-10-conseils) s'appliquent bien à ce format, et [un budget de mariage à 15 000 €, la répartition](/blog/budget-mariage-15000-euros-repartition) donne un exemple concret proche de cette fourchette.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A wedding for 50 people costs on average 8,000 to 15,000 € in France, so about 160 to 300 € per guest. A minimal budget, with alternative solutions, can drop to around 5,000 to 7,000 €, while polished services push the bill up.",
          "The classic mistake is to believe a wedding with half the guests costs half as much. It doesn't: some items don't move with the guest count. The cost per person of a small wedding is often higher than that of a large one.",
        ],
      },
      {
        type: "text",
        title: "Why it isn't proportional: fixed costs",
        paragraphs: [
          "Part of the budget doesn't depend on the guest count. The photographer bills their day, not their guests. The dress, the suit, the DJ or band, the base decor, the car: these items cost roughly the same for 50 or for 150 people.",
          "The result: these fixed costs spread over fewer heads, which mechanically raises the cost per guest. A small wedding saves on the variable (catering, drinks, covers), but keeps most of the fixed. That's why it doesn't follow simple proportion.",
        ],
      },
      {
        type: "list",
        title: "What drops, what doesn't",
        items: [
          "Drops with the number: per-cover catering, drinks, stationery, part of the furniture rental",
          "Barely drops: the photographer, the DJ or band, outfits and beauty, the car",
          "Drops partly: the venue, depending on whether it rents as a flat fee or scales its capacity",
          "The reception (venue and caterer) remains the first item, often 45 to 55 % of the total",
        ],
      },
      {
        type: "text",
        title: "The upside of a small wedding: trading up",
        paragraphs: [
          "The small format has a real payoff: at equal budget, you can trade up where it shows. A more worked menu, better wines, a more intimate but more polished venue become accessible, because each euro spreads over fewer guests.",
          "Many couples choose 50 people precisely for this: fewer guests, but a denser, higher-quality experience. The total budget drops, without the party feeling cut-rate, provided you accept a higher cost per person.",
        ],
      },
      {
        type: "list",
        title: "How to reduce the bill",
        items: [
          "Choose an off-peak or weekday date, often cheaper on the venue and caterer",
          "Favor a municipal hall or a simple venue, and a local caterer",
          "Trim the fixed costs that matter least to you (car, elaborate decor) rather than the variable",
          "Do part of the decor or stationery yourself, more realistic on a small format",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "A wedding of 50 people doesn't cost half a wedding of 100: fixed costs (photographer, outfits, music) don't drop with the number. The cost per guest is higher, but it's also the chance to trade up where it shows.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To understand the fixed and variable mechanic, see [the cost per guest](/blog/budget-mariage-cout-par-invite). If you aim plain, our [10 tips for a small-budget wedding](/blog/mariage-petit-budget-10-conseils) apply well to this format, and [a 15,000 € wedding budget, the breakdown](/blog/budget-mariage-15000-euros-repartition) gives a concrete example near this range.",
        ],
      },
    ],
  }),
];

export const { fr: POSTS_248_255_FR, en: POSTS_248_255_EN } = pairsToArrays(pairs);
