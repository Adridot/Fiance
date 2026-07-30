import { postPair, pairsToArrays } from "./blog-posts-shared";

const pairs = [
  postPair({
    slug: "combien-coute-photographe-mariage",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Combien coûte un photographe de mariage en 2026 ?",
    titleEn: "How much does a wedding photographer cost in 2026?",
    excerptFr:
      "Comptez 1 200 à 2 500 € pour un photographe de mariage, avec une médiane autour de 1 800 €. Ce qui fait varier le prix et comment payer le juste tarif.",
    excerptEn:
      "Expect 1 200 to 2 500 € for a wedding photographer, with a median around 1 800 €. What drives the price and how to pay a fair rate.",
    readingMinutes: 6,
    heroAltFr: "Photographe de mariage en action pendant la cérémonie",
    heroAltEn: "Wedding photographer at work during the ceremony",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "En 2026, comptez en général entre 1 200 et 2 500 € pour un photographe de mariage sur une journée complète de huit à douze heures, avec une médiane autour de 1 800 €. La fourchette réelle s'étire de 1 500 à 3 500 € selon l'expérience du photographe, la durée de présence et la région : à Paris, en Île-de-France ou sur la Côte d'Azur, la médiane grimpe plutôt vers 2 200 €.",
          "Ce prix surprend souvent, car on ne voit que la journée. Cet article détaille ce qui se cache derrière le tarif, ce qui le fait varier, et comment reconnaître un devis juste plutôt qu'une simple ligne « photographe » dans le budget.",
        ],
      },
      {
        type: "text",
        title: "Prix moyen d'un photographe de mariage",
        paragraphs: [
          "La journée complète, la formule la plus demandée, couvre en général des préparatifs jusqu'à l'ouverture du bal. C'est elle qui définit la fourchette de 1 200 à 2 500 €. Une demi-journée (cérémonie et vin d'honneur seulement) coûte logiquement moins, souvent de 700 à 1 200 €, mais laisse de côté une partie des moments forts.",
          "Le tarif ne paie pas que les heures présentes le jour J. Sur une prestation complète, un photographe investit en moyenne quarante à cinquante heures de travail, l'équivalent d'une semaine, entre la préparation, la journée elle-même et surtout le tri et la retouche des images. C'est ce travail invisible qui explique l'écart avec un simple tarif horaire.",
        ],
      },
      {
        type: "list",
        title: "Ce qui fait varier le prix",
        items: [
          "L'expérience et la notoriété du photographe : un profil très demandé se réserve un an à l'avance et facture en conséquence",
          "La région : Paris, l'Île-de-France et la Côte d'Azur tirent les prix vers le haut, la province les ramène en dessous de la moyenne",
          "La durée de présence : de la seule cérémonie à la journée complète avec préparatifs, l'écart d'heures se paie",
          "Les livrables inclus : nombre de photos retouchées, galerie en ligne, tirages, album, séance d'engagement avant le mariage",
          "La haute saison : de mai à septembre, les week-ends se remplissent vite et laissent moins de marge de négociation",
        ],
      },
      {
        type: "list",
        title: "Ce que comprend (ou non) le tarif",
        items: [
          "Le plus souvent inclus : la présence le jour J, le tri, la retouche des images et une galerie numérique à télécharger",
          "Parfois en supplément : l'album imprimé, les tirages papier, la séance d'engagement, un second photographe",
          "À vérifier : le nombre de photos livrées retouchées, et non seulement le nombre de photos prises",
          "À clarifier : les frais de déplacement et d'hébergement si le lieu est éloigné, qui peuvent s'ajouter au forfait",
        ],
      },
      {
        type: "text",
        title: "Comment payer le juste prix",
        paragraphs: [
          "Le bon réflexe n'est pas de chercher le devis le moins cher, mais de comparer des prestations comparables : à durée et livrables équivalents. Un tarif très bas cache souvent une galerie réduite, aucune retouche, ou un débutant qui se cherche. Un tarif élevé se justifie s'il inclut un album, un second photographe ou une reconnaissance réelle.",
          "Demandez à voir un mariage complet, pas seulement une sélection de portfolios. La régularité sur une journée entière, y compris dans les moments difficiles à photographier, en dit plus que trois images parfaites. C'est un poste où l'on paie surtout la fiabilité : les photos sont l'un des rares souvenirs qui restent une fois la fête finie.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Réservez tôt et comparez à livrables égaux. Sur ce poste, économiser en réduisant la journée ou la retouche se voit plus tard sur les images ; mieux vaut ajuster ailleurs et garder un photographe fiable.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Le prix n'est qu'une partie de la décision : notre guide [choisir son photographe](/blog/choisir-photographe-mariage) détaille comment évaluer un profil, et [choisir son style de photographie](/blog/styles-photographie-mariage-choisir) aide à savoir ce que vous cherchez avant de comparer les tarifs. Si vous hésitez à ajouter la vidéo, voyez [combien coûte un vidéaste](/blog/combien-coute-videaste-mariage). Placez ensuite ce budget dans la [répartition par poste](/blog/repartition-budget-mariage-par-poste) et suivez-le dans le [simulateur budget](/tools/budget-calculator).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "In 2026, expect generally between 1 200 and 2 500 € for a wedding photographer over a full day of eight to twelve hours, with a median around 1 800 €. The real range stretches from 1 500 to 3 500 € depending on the photographer's experience, hours of coverage, and region: in Paris, Île-de-France, or the French Riviera, the median climbs closer to 2 200 €.",
          "This price often surprises, because you only see the day itself. This article breaks down what sits behind the rate, what makes it vary, and how to recognize a fair quote rather than a bare line item labeled photographer in the budget.",
        ],
      },
      {
        type: "text",
        title: "Average cost of a wedding photographer",
        paragraphs: [
          "The full day, the most requested package, generally covers from getting ready through the first dance. That is what sets the 1 200 to 2 500 € range. A half day (ceremony and cocktail only) costs less, often 700 to 1 200 €, but leaves out part of the key moments.",
          "The rate doesn't only pay for the hours present on the day. On a complete assignment, a photographer invests on average forty to fifty hours of work, the equivalent of a week, between preparation, the day itself, and above all the sorting and editing of the images. That invisible work is what explains the gap with a simple hourly rate.",
        ],
      },
      {
        type: "list",
        title: "What makes the price vary",
        items: [
          "The photographer's experience and reputation: a sought-after name books a year ahead and charges accordingly",
          "The region: Paris, Île-de-France, and the Riviera pull prices up, while the provinces bring them below average",
          "The hours of coverage: from the ceremony alone to a full day with getting ready, the extra hours cost more",
          "The deliverables included: number of edited photos, online gallery, prints, album, an engagement session before the wedding",
          "Peak season: from May to September, weekends fill fast and leave less room to negotiate",
        ],
      },
      {
        type: "list",
        title: "What the rate does (and doesn't) include",
        items: [
          "Usually included: presence on the day, sorting, editing of the images, and a digital gallery to download",
          "Sometimes extra: the printed album, paper prints, the engagement session, a second photographer",
          "Worth checking: the number of edited photos delivered, not just the number of photos taken",
          "Worth clarifying: travel and accommodation fees if the venue is far, which can add to the package",
        ],
      },
      {
        type: "text",
        title: "How to pay a fair price",
        paragraphs: [
          "The right reflex isn't to chase the cheapest quote, but to compare like-for-like prestations: at equal hours and deliverables. A very low rate often hides a small gallery, no editing, or a beginner still finding their feet. A high rate is justified if it includes an album, a second photographer, or genuine standing.",
          "Ask to see a full wedding, not just a portfolio selection. Consistency across a whole day, including the moments that are hard to shoot, tells you more than three perfect images. This is an item where you mostly pay for reliability: the photos are one of the few keepsakes left once the party is over.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Book early and compare at equal deliverables. On this item, saving by cutting the day short or dropping the editing shows up later in the images; better to adjust elsewhere and keep a reliable photographer.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Price is only part of the decision: our guide to [choosing your photographer](/blog/choisir-photographe-mariage) details how to assess a profile, and [choosing your photography style](/blog/styles-photographie-mariage-choisir) helps you know what you're after before comparing rates. If you're weighing video too, see [how much a videographer costs](/blog/combien-coute-videaste-mariage). Then place this budget in the [breakdown by line item](/blog/repartition-budget-mariage-par-poste) and track it in the [budget calculator](/tools/budget-calculator).",
        ],
      },
    ],
  }),

  postPair({
    slug: "combien-coute-traiteur-mariage-personne",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Combien coûte un traiteur de mariage par personne en 2026 ?",
    titleEn: "How much does a wedding caterer cost per person in 2026?",
    excerptFr:
      "Comptez 60 à 165 € par personne pour une formule complète, plus 5 à 20 € de boissons et 15 à 20 € de personnel. Ce qui fait varier le prix et comment comparer.",
    excerptEn:
      "Expect 60 to 165 € per person for a full package, plus 5 to 20 € for drinks and 15 to 20 € for staff. What drives the price and how to compare.",
    readingMinutes: 7,
    heroAltFr: "Assiette dressée par un traiteur lors d'un repas de mariage",
    heroAltEn: "Plated dish by a caterer at a wedding meal",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "En 2026, un traiteur de mariage facture en général entre 60 et 165 € par personne pour une formule complète (cocktail, repas et souvent la pièce montée). Le prix dépend surtout du type de service : un cocktail dînatoire coûte moins qu'un buffet, qui coûte lui-même moins qu'un repas assis servi à l'assiette. À cela s'ajoutent les boissons, de 5 à 20 € par personne, et le personnel de service, souvent 15 à 20 € par personne.",
          "C'est le premier poste du budget d'un mariage, et celui où le prix par tête se multiplie vite par le nombre d'invités. Bien comprendre ce qui se cache derrière le tarif par personne évite les mauvaises surprises au moment du devis.",
        ],
      },
      {
        type: "list",
        title: "Le prix par personne selon la formule",
        items: [
          "Cocktail dînatoire (pièces salées et sucrées, debout) : environ 20 à 50 € par personne",
          "Buffet froid ou chaud à volonté : environ 25 à 55 € par personne, hors boissons",
          "Repas assis servi à l'assiette : environ 40 à 130 € par personne selon le nombre de plats et le standing",
          "Formule mariage complète (cocktail, repas, café, parfois pièce montée) : environ 60 à 165 € par personne",
        ],
      },
      {
        type: "list",
        title: "Les suppléments qui s'ajoutent au tarif",
        items: [
          "Les boissons : de 5 à 20 € par personne selon qu'il s'agit d'un simple accord ou d'un open bar plus généreux",
          "Le personnel de service : souvent 15 à 20 € par personne pour un service à table complet",
          "La location de vaisselle, verrerie, nappage et mobilier, parfois comptée à part",
          "Le droit de bouchon si vous apportez vos propres vins, et le repas des prestataires (photographe, DJ) à ne pas oublier",
        ],
      },
      {
        type: "text",
        title: "Ce qui fait varier le prix",
        paragraphs: [
          "À formule égale, l'écart vient d'abord du niveau de service et des produits : un repas assis mobilise plus de personnel et une logistique plus lourde qu'un buffet, d'où son prix plus élevé. La région joue aussi, comme pour tous les prestataires, ainsi que la saison et le jour de la semaine.",
          "Le nombre d'invités compte à double titre. Il multiplie le coût par tête, mais certains traiteurs baissent le prix unitaire au-delà d'un certain seuil, l'organisation étant plus rentable sur un grand nombre. À l'inverse, un très petit mariage peut se voir appliquer un minimum de facturation.",
        ],
      },
      {
        type: "text",
        title: "Comment comparer et payer le juste prix",
        paragraphs: [
          "Comparez toujours des devis « tout compris » : un tarif par personne qui semble bas peut exclure les boissons, le personnel ou la location, que le voisin a intégrés. Reconstituez le prix réel par tête, boissons et service compris, avant de trancher.",
          "La dégustation, souvent proposée, est le moment de vérifier le rapport qualité-prix et d'ajuster la formule. Passer d'un repas assis à un buffet, ou raccourcir le nombre de plats, sont les leviers les plus efficaces pour faire baisser la note sans toucher au nombre d'invités.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Raisonnez en coût réel par tête, boissons et service inclus, et multipliez par votre nombre d'invités réel. C'est ce total, pas le prix affiché par personne, qui décide vraiment de la place du traiteur dans le budget.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour lire un devis ligne à ligne et repérer ce qui est inclus, voir [comparer les devis traiteur](/blog/comparer-devis-traiteur-mariage) et [la dégustation traiteur](/blog/degustation-traiteur-mariage). Comme ce poste dépend du nombre d'invités, notre guide [le coût par invité](/blog/budget-mariage-cout-par-invite) et l'exemple chiffré [combien coûte un mariage de 100 personnes](/blog/combien-coute-mariage-100-personnes) donnent des repères. Suivez le total dans le [simulateur budget](/tools/budget-calculator).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "In 2026, a wedding caterer generally charges between 60 and 165 € per person for a full package (cocktail, meal, and often the cake). The price depends above all on the type of service: a standing cocktail dinner costs less than a buffet, which itself costs less than a plated seated meal. On top come the drinks, 5 to 20 € per person, and the serving staff, often 15 to 20 € per person.",
          "This is the biggest line in a wedding budget, and the one where the per-head price multiplies fast by the number of guests. Understanding what sits behind the per-person rate avoids nasty surprises when the quote arrives.",
        ],
      },
      {
        type: "list",
        title: "The per-person price by format",
        items: [
          "Standing cocktail dinner (savory and sweet bites, no seating): about 20 to 50 € per person",
          "Cold or hot help-yourself buffet: about 25 to 55 € per person, drinks not included",
          "Plated seated meal: about 40 to 130 € per person depending on the number of courses and the standing",
          "Full wedding package (cocktail, meal, coffee, sometimes the cake): about 60 to 165 € per person",
        ],
      },
      {
        type: "list",
        title: "The extras that add to the rate",
        items: [
          "Drinks: 5 to 20 € per person depending on whether it's a simple pairing or a more generous open bar",
          "Serving staff: often 15 to 20 € per person for full table service",
          "Rental of tableware, glassware, linens, and furniture, sometimes billed separately",
          "Corkage if you bring your own wine, and the vendors' meals (photographer, DJ) not to forget",
        ],
      },
      {
        type: "text",
        title: "What makes the price vary",
        paragraphs: [
          "At equal format, the gap comes first from the level of service and the produce: a seated meal needs more staff and heavier logistics than a buffet, hence its higher price. Region matters too, as for all vendors, along with the season and the day of the week.",
          "The guest count counts twice over. It multiplies the per-head cost, but some caterers lower the unit price beyond a certain threshold, since the operation is more efficient at scale. Conversely, a very small wedding may be subject to a minimum charge.",
        ],
      },
      {
        type: "text",
        title: "How to compare and pay a fair price",
        paragraphs: [
          "Always compare all-inclusive quotes: a per-person rate that looks low may leave out the drinks, the staff, or the rental that the next quote folded in. Rebuild the real per-head price, drinks and service included, before deciding.",
          "The tasting, often offered, is the moment to check value for money and adjust the format. Switching from a seated meal to a buffet, or shortening the number of courses, are the most effective levers to bring the bill down without touching the guest count.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Think in real per-head cost, drinks and service included, and multiply by your real guest count. That total, not the advertised per-person price, is what truly sets the caterer's place in the budget.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To read a quote line by line and spot what's included, see [comparing caterer quotes](/blog/comparer-devis-traiteur-mariage) and [the caterer tasting](/blog/degustation-traiteur-mariage). Since this item hinges on the guest count, our guide to [the cost per guest](/blog/budget-mariage-cout-par-invite) and the worked example [how much a wedding for 100 costs](/blog/combien-coute-mariage-100-personnes) give benchmarks. Track the total in the [budget calculator](/tools/budget-calculator).",
        ],
      },
    ],
  }),

  postPair({
    slug: "combien-coute-dj-mariage",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Combien coûte un DJ de mariage en 2026 ?",
    titleEn: "How much does a wedding DJ cost in 2026?",
    excerptFr:
      "Comptez 800 à 1 500 € pour un DJ de mariage sur une soirée de 6 à 8 heures, sono et lumières comprises, avec une moyenne autour de 1 200 €.",
    excerptEn:
      "Expect 800 to 1 500 € for a wedding DJ over a 6 to 8 hour evening, sound and lights included, with an average around 1 200 €.",
    readingMinutes: 6,
    heroAltFr: "DJ de mariage aux platines pendant la soirée dansante",
    heroAltEn: "Wedding DJ at the decks during the dancing",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "En 2026, un DJ de mariage professionnel coûte en général entre 800 et 1 500 € pour une soirée dansante de six à huit heures, sonorisation et éclairage de piste compris, avec une moyenne autour de 1 200 €. La fourchette complète va de 400 € pour un profil débutant en zone rurale à 3 500 € pour un DJ très demandé en Île-de-France.",
          "L'écart s'explique par la région, le nombre d'heures et surtout par ce que le matériel couvre réellement. Cet article aide à lire un devis de DJ et à savoir ce que vous payez au juste.",
        ],
      },
      {
        type: "text",
        title: "Prix moyen d'un DJ de mariage",
        paragraphs: [
          "La prestation type, une soirée de six à huit heures avec sono et lumières, se situe le plus souvent entre 800 et 1 500 €. Les moyennes régionales confirment ce cadre : de 700 à 1 200 € dans le Grand Est et les Hauts-de-France, de 1 200 à 2 000 € en Île-de-France, avec des zones rurales parfois sous les 1 000 €.",
          "Ce tarif ne paie pas que la soirée. Il couvre le temps de préparation (échanges sur la playlist, repérage de la salle), l'installation et le démontage du matériel, et souvent l'animation des temps forts (entrée des mariés, première danse, discours). Un DJ arrive plusieurs heures avant les invités et repart bien après.",
        ],
      },
      {
        type: "list",
        title: "Ce qui fait varier le prix",
        items: [
          "La région : l'Île-de-France et les grandes villes tirent les tarifs vers le haut",
          "Le nombre d'heures et l'ampleur de la soirée : une piste jusqu'à l'aube coûte plus qu'une fin à minuit",
          "La notoriété et l'expérience du DJ, qui se réserve parfois un an à l'avance",
          "Le matériel : la puissance de la sono doit être adaptée à la taille de la salle et au nombre d'invités",
          "Les options : machine à fumée pour la première danse (150 à 300 €), éclairage architectural, laser, étincelles froides",
        ],
      },
      {
        type: "list",
        title: "Ce que comprend (ou non) le tarif",
        items: [
          "En général inclus : une sonorisation adaptée à la salle, un éclairage de piste, un ou deux micros sans fil et tout le câblage",
          "En général inclus aussi : le déplacement, l'installation, le démontage et la préparation de la soirée",
          "Souvent en supplément : l'éclairage décoratif de la salle, la machine à fumée lourde, le laser ou les étincelles froides",
          "À vérifier : la puissance réelle du matériel et la présence d'un système de secours en cas de panne",
        ],
      },
      {
        type: "text",
        title: "Comment payer le juste prix",
        paragraphs: [
          "Méfiez-vous des tarifs très bas : un DJ à 400 € couvre rarement une grande salle avec du matériel fiable, et le risque d'une panne sans secours pèse lourd un soir de mariage. À l'inverse, empiler les options lumineuses fait grimper la note sans forcément remplir la piste : c'est le mix et la lecture de la salle qui font danser, pas le laser.",
          "Le bon repère, c'est un devis clair sur les heures, le matériel et les temps forts animés, et un échange qui montre que le DJ comprend l'ambiance que vous voulez. Rencontrez-le, ou au moins parlez-lui, avant de signer : sur ce poste, le courant qui passe compte autant que le prix.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Sur la musique, l'économie se fait sur les options, pas sur la fiabilité. Un matériel adapté à la salle et un système de secours valent mieux qu'un laser de plus : une piste qui coupe en pleine soirée ne se rattrape pas.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Le prix vient après le choix du profil : notre guide [choisir son DJ](/blog/choisir-dj-mariage) détaille les questions à poser, et [groupe live ou DJ](/blog/groupe-live-ou-dj-mariage) compare les deux formats et leurs coûts. Pour négocier au bon moment, voir [négocier un devis de mariage](/blog/negocier-devis-mariage). Placez ce budget dans la [répartition par poste](/blog/repartition-budget-mariage-par-poste) et suivez-le dans le [simulateur budget](/tools/budget-calculator).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "In 2026, a professional wedding DJ generally costs between 800 and 1 500 € for a six-to-eight-hour dance evening, sound system and dancefloor lighting included, with an average around 1 200 €. The full range runs from 400 € for a beginner in a rural area to 3 500 € for a much-sought DJ in Île-de-France.",
          "The gap comes down to region, number of hours, and above all what the equipment actually covers. This article helps you read a DJ quote and know exactly what you're paying for.",
        ],
      },
      {
        type: "text",
        title: "Average cost of a wedding DJ",
        paragraphs: [
          "The typical booking, a six-to-eight-hour evening with sound and lights, most often sits between 800 and 1 500 €. Regional averages confirm the frame: 700 to 1 200 € in the Grand Est and Hauts-de-France, 1 200 to 2 000 € in Île-de-France, with rural areas sometimes under 1 000 €.",
          "This rate doesn't only pay for the evening. It covers preparation time (talks about the playlist, scouting the room), setting up and taking down the gear, and often hosting the key moments (the couple's entrance, first dance, speeches). A DJ arrives several hours before the guests and leaves well after.",
        ],
      },
      {
        type: "list",
        title: "What makes the price vary",
        items: [
          "The region: Île-de-France and large cities pull rates upward",
          "The number of hours and the scale of the evening: dancing until dawn costs more than an end at midnight",
          "The DJ's reputation and experience, sometimes booked a year in advance",
          "The equipment: the sound power must match the size of the room and the guest count",
          "The options: a smoke machine for the first dance (150 to 300 €), architectural lighting, laser, cold sparks",
        ],
      },
      {
        type: "list",
        title: "What the rate does (and doesn't) include",
        items: [
          "Usually included: a sound system suited to the room, dancefloor lighting, one or two wireless mics, and all the cabling",
          "Usually included too: travel, setup, takedown, and preparing the evening",
          "Often extra: decorative room lighting, a heavy smoke machine, laser, or cold sparks",
          "Worth checking: the real power of the gear and whether there's a backup system in case of failure",
        ],
      },
      {
        type: "text",
        title: "How to pay a fair price",
        paragraphs: [
          "Be wary of very low rates: a DJ at 400 € rarely covers a large room with reliable gear, and the risk of a failure with no backup weighs heavily on a wedding night. Conversely, stacking up lighting options runs the bill up without necessarily filling the floor: it's the mix and reading the room that get people dancing, not the laser.",
          "The good marker is a quote clear on hours, equipment, and the key moments hosted, plus a conversation showing the DJ understands the mood you want. Meet them, or at least talk to them, before signing: on this item, the rapport matters as much as the price.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "On music, save on the options, not on reliability. Gear suited to the room and a backup system beat one more laser: a dancefloor that cuts out mid-evening can't be recovered.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Price comes after choosing the profile: our guide to [choosing your DJ](/blog/choisir-dj-mariage) details the questions to ask, and [live band vs DJ](/blog/groupe-live-ou-dj-mariage) compares the two formats and their costs. To negotiate at the right moment, see [negotiating a wedding quote](/blog/negocier-devis-mariage). Place this budget in the [breakdown by line item](/blog/repartition-budget-mariage-par-poste) and track it in the [budget calculator](/tools/budget-calculator).",
        ],
      },
    ],
  }),

  postPair({
    slug: "combien-coute-location-salle-mariage",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Combien coûte la location d'une salle de mariage en 2026 ?",
    titleEn: "How much does renting a wedding venue cost in 2026?",
    excerptFr:
      "De 500 à 2 000 € pour une salle nue, 2 500 à 12 000 € et plus pour un domaine ou un château. Ce qui fait varier le prix et comment le maîtriser.",
    excerptEn:
      "From 500 to 2 000 € for a bare hall, 2 500 to 12 000 € and up for an estate or château. What drives the price and how to keep it in check.",
    readingMinutes: 6,
    heroAltFr: "Domaine de réception fleuri prêt pour un mariage",
    heroAltEn: "Flower-decked reception estate ready for a wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "En 2026, la location d'une salle de mariage va d'environ 500 à 2 000 € pour une salle nue, à 2 500 à 6 000 € pour un domaine, et de 5 000 à 12 000 € et plus pour un château de standing. La moyenne nationale pour un week-end tourne autour de 3 100 €, mais la fourchette réelle est immense : de 400 € pour une salle communale à 25 000 € pour un château en Île-de-France.",
          "C'est le poste qui structure tout le reste, car il conditionne la date, la capacité et souvent le choix du traiteur. Comprendre ce qui fait varier son prix aide à cadrer le budget avant même de visiter.",
        ],
      },
      {
        type: "list",
        title: "Le prix selon le type de lieu",
        items: [
          "Salle communale ou des fêtes : environ 400 à 1 500 €, souvent réservée aux résidents de la commune",
          "Salle de réception nue privée : environ 800 à 2 000 €, sans mobilier ni prestation incluse",
          "Domaine avec cadre et parfois hébergement : environ 2 500 à 6 000 € pour un week-end",
          "Château de standing : environ 5 000 à 12 000 €, et bien au-delà pour les adresses les plus prisées",
        ],
      },
      {
        type: "text",
        title: "Week-end, journée ou deux jours",
        paragraphs: [
          "Les tarifs affichés s'entendent le plus souvent pour un week-end complet, du vendredi soir au dimanche matin. Une location à la journée revient souvent 30 à 50 % moins cher, mais oblige à tout installer et ranger dans un temps court, ce qui reporte parfois la contrainte sur le traiteur ou les proches.",
          "Se marier en semaine ou en basse saison fait chuter le prix de 30 à 40 % dans beaucoup de lieux. C'est le levier le plus efficace sur ce poste : la même salle, le même cadre, pour un tarif nettement plus doux un jeudi de novembre qu'un samedi de juin.",
        ],
      },
      {
        type: "list",
        title: "Ce qui fait varier le prix",
        items: [
          "La région : l'Île-de-France et le Sud tirent les prix vers le haut, les Hauts-de-France et le Grand Est vers le bas",
          "La saison et le jour : haute saison et samedi coûtent le plus cher, basse saison et semaine le moins",
          "La capacité et l'exclusivité du lieu, ainsi que la durée (journée, week-end, deux nuits)",
          "Ce qui est inclus : mobilier, hébergement sur place, cuisine équipée, exclusivité du traiteur ou traiteur libre",
        ],
      },
      {
        type: "text",
        title: "Ce que comprend (ou non) le tarif",
        paragraphs: [
          "Une salle nue ne comprend souvent que les murs : ni tables, ni chaises, ni vaisselle, ni parfois même la cuisine. Le prix bas se rattrape alors en locations annexes. Un domaine ou un château affiche un tarif plus élevé, mais inclut fréquemment le mobilier, un cadre déjà décoratif, et parfois des chambres pour la nuit.",
          "Le point à vérifier en priorité : le traiteur est-il imposé ou libre ? Un lieu qui impose son traiteur peut sembler bon marché à la location, tout en pesant plus lourd au total. Reconstituez toujours le coût complet, salle plus traiteur, avant de comparer deux adresses.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Le plus grand levier d'économie sur la salle n'est pas la négociation, mais la date : semaine ou basse saison font baisser le prix de 30 à 40 %. Comparez ensuite salle et traiteur ensemble, jamais la seule ligne de location.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Avant le prix vient le type de lieu : notre guide [choisir le lieu de réception](/blog/choisir-lieu-reception-types) passe en revue les formats, et [le mariage en grange ou à la ferme](/blog/mariage-grange-ferme-champetre) comme [le chapiteau et la tente](/blog/chapiteau-tente-location-mariage) détaillent des options souvent plus souples. Pour jouer sur la date, voir [se marier en semaine pour économiser](/blog/se-marier-en-semaine-economiser). Les écarts régionaux sont dans [le budget par région](/blog/budget-mariage-par-region-france) ; suivez le vôtre dans le [simulateur budget](/tools/budget-calculator).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "In 2026, renting a wedding venue runs from about 500 to 2 000 € for a bare hall, 2 500 to 6 000 € for an estate, and 5 000 to 12 000 € and up for an upscale château. The national average for a weekend is around 3 100 €, but the real range is vast: from 400 € for a village hall to 25 000 € for a château in Île-de-France.",
          "This is the item that structures everything else, because it sets the date, the capacity, and often the choice of caterer. Understanding what makes its price vary helps frame the budget before you even visit.",
        ],
      },
      {
        type: "list",
        title: "The price by type of venue",
        items: [
          "Village or community hall: about 400 to 1 500 €, often reserved for residents of the town",
          "Private bare reception hall: about 800 to 2 000 €, with no furniture or service included",
          "Estate with grounds and sometimes lodging: about 2 500 to 6 000 € for a weekend",
          "Upscale château: about 5 000 to 12 000 €, and well beyond for the most sought-after addresses",
        ],
      },
      {
        type: "text",
        title: "Weekend, single day, or two days",
        paragraphs: [
          "Advertised rates most often mean a full weekend, from Friday evening to Sunday morning. A single-day rental often comes 30 to 50 % cheaper, but forces you to set up and clear out in a short window, which sometimes passes the strain to the caterer or your loved ones.",
          "Marrying midweek or in low season drops the price by 30 to 40 % at many venues. It's the most effective lever on this item: the same room, the same setting, for a noticeably softer rate on a Thursday in November than a Saturday in June.",
        ],
      },
      {
        type: "list",
        title: "What makes the price vary",
        items: [
          "The region: Île-de-France and the South pull prices up, Hauts-de-France and the Grand Est pull them down",
          "The season and the day: peak season and Saturday cost the most, low season and midweek the least",
          "The capacity and exclusivity of the venue, and the duration (day, weekend, two nights)",
          "What's included: furniture, on-site lodging, a fitted kitchen, an imposed caterer or a free one",
        ],
      },
      {
        type: "text",
        title: "What the rate does (and doesn't) include",
        paragraphs: [
          "A bare hall often includes only the walls: no tables, no chairs, no tableware, sometimes not even the kitchen. The low price is then eaten up by side rentals. An estate or château shows a higher rate, but frequently includes furniture, an already decorative setting, and sometimes rooms for the night.",
          "The point to check first: is the caterer imposed or free? A venue that imposes its caterer can look cheap to rent while weighing more in total. Always rebuild the full cost, venue plus caterer, before comparing two addresses.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "The biggest saving lever on the venue isn't negotiation, but the date: midweek or low season cut the price by 30 to 40 %. Then compare venue and caterer together, never the rental line alone.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Before price comes the type of venue: our guide to [choosing the reception venue](/blog/choisir-lieu-reception-types) reviews the formats, and [a barn or farm wedding](/blog/mariage-grange-ferme-champetre) as well as [the marquee and tent](/blog/chapiteau-tente-location-mariage) detail often more flexible options. To play on the date, see [marrying midweek to save](/blog/se-marier-en-semaine-economiser). Regional gaps are in [the budget by region](/blog/budget-mariage-par-region-france); track yours in the [budget calculator](/tools/budget-calculator).",
        ],
      },
    ],
  }),

  postPair({
    slug: "combien-coute-wedding-planner-mariage",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Combien coûte un wedding planner en 2026 ?",
    titleEn: "How much does a wedding planner cost in 2026?",
    excerptFr:
      "De 3 500 à 7 000 € pour une organisation complète, 1 200 à 2 500 € pour la coordination du jour J. Forfait fixe ou pourcentage du budget, ce qui fait varier le prix.",
    excerptEn:
      "From 3 500 to 7 000 € for full planning, 1 200 to 2 500 € for day-of coordination. Fixed fee or percentage of the budget, what drives the price.",
    readingMinutes: 6,
    heroAltFr: "Wedding planner organisant les préparatifs d'un mariage",
    heroAltEn: "Wedding planner organizing the preparations",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "En 2026, un wedding planner coûte en général entre 3 500 et 7 000 € pour une organisation complète, et entre 1 200 et 2 500 € pour une simple coordination du jour J. Entre les deux, des formules à la carte ou de coaching permettent de n'acheter qu'une partie de l'accompagnement. La moyenne toutes formules confondues se situe autour de 2 500 à 7 500 €.",
          "Le prix dépend surtout du périmètre : tout déléguer coûte évidemment plus que faire coordonner la seule journée. Comprendre les formules évite de comparer des devis qui n'ont rien à voir.",
        ],
      },
      {
        type: "list",
        title: "Les formules et leurs prix",
        items: [
          "Organisation complète (recherche des prestataires, suivi, coordination) : environ 3 500 à 7 000 €",
          "Coordination du jour J seule (le planner reprend un mariage déjà organisé) : environ 1 200 à 2 500 €",
          "À la carte ou coaching (quelques heures de conseil, un poste précis) : de quelques centaines d'euros à 1 500 €",
          "Pourcentage du budget global : environ 8 à 15 %, surtout pour les mariages d'envergure au-dessus de 50 000 €",
        ],
      },
      {
        type: "text",
        title: "Forfait fixe ou pourcentage du budget",
        paragraphs: [
          "En France, environ trois planners sur quatre facturent un forfait fixe : vos honoraires sont connus d'avance, quel que soit le budget final. C'est la formule la plus lisible, et celle qui domine en 2026.",
          "Le pourcentage du budget global, souvent 10 à 15 %, reste pratiqué sur les mariages haut de gamme, où le montant à gérer est important. L'inconvénient est connu : plus votre budget grimpe, plus les honoraires suivent, ce qui peut brouiller l'intérêt du planner à vous faire économiser.",
        ],
      },
      {
        type: "list",
        title: "Ce qui fait varier le prix",
        items: [
          "Le périmètre : organisation complète, partielle, ou coordination du seul jour J",
          "Le nombre d'invités et la complexité (plusieurs lieux, prestataires nombreux, mariage sur deux jours)",
          "La région et la notoriété du planner, comme pour tout prestataire",
          "Le niveau de personnalisation et le nombre de rendez-vous inclus dans le forfait",
        ],
      },
      {
        type: "text",
        title: "Comment payer le juste prix",
        paragraphs: [
          "Un devis à 3 000 € qui ne couvre que la coordination du jour J et un devis à 8 000 € pour une organisation complète ne jouent pas dans la même catégorie : comparez toujours à périmètre égal. Demandez le détail précis des prestations incluses, du nombre de rendez-vous et de ce qui reste à votre charge.",
          "Un bon planner peut se rentabiliser en partie : sa connaissance des prestataires et sa capacité à négocier compensent parfois une part de ses honoraires. Mais ce n'est pas garanti, et l'intérêt principal reste le temps et la charge mentale économisés. Si le budget est serré, la coordination du seul jour J est souvent le meilleur compromis.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Avant de comparer les prix, fixez le périmètre : voulez-vous tout déléguer, ou seulement être déchargés le jour J ? La coordination jour J, autour de 1 200 à 2 500 €, est le point d'entrée le plus abordable pour souffler sans tout confier.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "La vraie question précède le prix : notre guide [faut-il un wedding planner](/blog/wedding-planner-faut-il-engager) aide à trancher, et [l'utilité d'un coordinateur du jour J](/blog/coordinateur-jour-j-utilite) détaille la formule la plus abordable. Pour situer ce poste dans l'ensemble, voir [la répartition du budget par poste](/blog/repartition-budget-mariage-par-poste) et [l'ordre de réservation des prestataires](/blog/ordre-reservation-prestataires-mariage). Suivez le tout dans le [simulateur budget](/tools/budget-calculator).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "In 2026, a wedding planner generally costs between 3 500 and 7 000 € for full planning, and between 1 200 and 2 500 € for day-of coordination alone. In between, à la carte or coaching formats let you buy only part of the support. The average across all formats sits around 2 500 to 7 500 €.",
          "The price depends above all on scope: delegating everything obviously costs more than having the single day coordinated. Understanding the formats avoids comparing quotes that have nothing to do with each other.",
        ],
      },
      {
        type: "list",
        title: "The formats and their prices",
        items: [
          "Full planning (vendor search, follow-up, coordination): about 3 500 to 7 000 €",
          "Day-of coordination alone (the planner takes over an already organized wedding): about 1 200 to 2 500 €",
          "À la carte or coaching (a few hours of advice, one specific item): from a few hundred euros to 1 500 €",
          "Percentage of the overall budget: about 8 to 15 %, mostly for large weddings above 50 000 €",
        ],
      },
      {
        type: "text",
        title: "Fixed fee or percentage of the budget",
        paragraphs: [
          "In France, about three planners in four charge a fixed fee: your fee is known in advance, whatever the final budget. It's the clearest format, and the one that dominates in 2026.",
          "The percentage of the overall budget, often 10 to 15 %, is still used on upscale weddings, where the amount to manage is large. The drawback is well known: the more your budget climbs, the more the fee follows, which can blur the planner's interest in saving you money.",
        ],
      },
      {
        type: "list",
        title: "What makes the price vary",
        items: [
          "The scope: full planning, partial, or coordination of the single day",
          "The guest count and complexity (several venues, many vendors, a two-day wedding)",
          "The region and the planner's reputation, as for any vendor",
          "The level of personalization and the number of meetings included in the package",
        ],
      },
      {
        type: "text",
        title: "How to pay a fair price",
        paragraphs: [
          "A 3 000 € quote covering only day-of coordination and an 8 000 € quote for full planning are not in the same category: always compare at equal scope. Ask for the precise detail of the services included, the number of meetings, and what remains on your plate.",
          "A good planner can partly pay for themselves: their knowledge of vendors and ability to negotiate sometimes offset part of the fee. But it's not guaranteed, and the main value stays the time and mental load saved. If the budget is tight, day-of coordination alone is often the best compromise.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Before comparing prices, set the scope: do you want to delegate everything, or just be relieved on the day? Day-of coordination, around 1 200 to 2 500 €, is the most affordable entry point to breathe without handing over the whole thing.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "The real question comes before price: our guide to [whether you need a wedding planner](/blog/wedding-planner-faut-il-engager) helps decide, and [the value of a day-of coordinator](/blog/coordinateur-jour-j-utilite) details the most affordable format. To place this item in the whole, see [the budget breakdown by line item](/blog/repartition-budget-mariage-par-poste) and [the order of booking vendors](/blog/ordre-reservation-prestataires-mariage). Track it all in the [budget calculator](/tools/budget-calculator).",
        ],
      },
    ],
  }),

  postPair({
    slug: "combien-coute-fleuriste-mariage",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Combien coûte un fleuriste de mariage en 2026 ?",
    titleEn: "How much does a wedding florist cost in 2026?",
    excerptFr:
      "Comptez 1 800 à 4 500 € pour fleurir un mariage, soit 10 à 15 % du budget. Le détail poste par poste, l'effet de la saison et comment payer le juste prix.",
    excerptEn:
      "Expect 1 800 to 4 500 € to flower a wedding, about 10 to 15 % of the budget. The item-by-item breakdown, the effect of season, and how to pay a fair price.",
    readingMinutes: 6,
    heroAltFr: "Compositions florales préparées par un fleuriste de mariage",
    heroAltEn: "Floral arrangements prepared by a wedding florist",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "En 2026, fleurir un mariage en formule complète coûte en général entre 1 800 et 4 500 €, soit 10 à 15 % du budget total d'un mariage. Ce montant regroupe le bouquet de la mariée, les boutonnières, les centres de table, souvent une arche ou un décor de cérémonie, et parfois la décoration de la salle.",
          "Le total dépend surtout du nombre de compositions et du style recherché : quelques fleurs de saison suffisent à un budget modeste, une profusion de pivoines hors saison le fait vite grimper. Voici comment ce prix se décompose.",
        ],
      },
      {
        type: "list",
        title: "Le prix poste par poste",
        items: [
          "Bouquet de la mariée : environ 80 à 400 €, un bouquet rond classique de roses tournant plutôt autour de 120 à 160 €",
          "Boutonnières et petits bouquets de demoiselles d'honneur : quelques euros à une vingtaine d'euros pièce",
          "Centres de table : environ 30 à 70 € par table, à multiplier par le nombre de tables",
          "Arche ou décor de cérémonie : de 250 à 500 € pour un décor partiel, 800 à 1 500 € et plus pour une arche totalement fleurie",
        ],
      },
      {
        type: "text",
        title: "La saison, ce qui pèse le plus",
        paragraphs: [
          "Le prix d'une composition dépend d'abord des fleurs choisies. Une fleur de saison, cultivée localement, coûte une fraction d'une fleur importée ou hors saison. Un bouquet rond de roses reste abordable ; le même volume en pivoines ou en pampas grimpe nettement.",
          "Se marier au coeur de la belle saison, ou choisir des variétés disponibles au moment du mariage, est le levier le plus efficace. Les mois d'hiver ou les fleurs de plein champ permettent souvent un rendu généreux sans exploser le budget. Faites confiance au fleuriste pour proposer des équivalents de saison à un style donné.",
        ],
      },
      {
        type: "list",
        title: "Ce qui fait varier le prix",
        items: [
          "Le nombre de compositions : bouquet seul, ou décor complet cérémonie plus salle",
          "La saison et le choix des variétés (fleurs de saison locales contre fleurs importées ou hors saison)",
          "Le style : structuré et abondant coûte plus qu'un rendu champêtre et aéré",
          "La logistique : installation sur place, démontage, distance jusqu'au lieu, location de supports et vases",
        ],
      },
      {
        type: "text",
        title: "Comment payer le juste prix",
        paragraphs: [
          "Donnez au fleuriste une enveloppe et un style, plutôt qu'une liste précise de fleurs : il saura proposer un rendu proche avec des variétés de saison, souvent moins chères. Concentrez le budget sur les points les plus vus (le bouquet, l'arche, la table des mariés) et allégez le reste.",
          "Quelques pistes réduisent la note sans sacrifier l'effet : réutiliser les fleurs de la cérémonie sur la table du repas, mélanger fleurs et feuillage, ou limiter le nombre de compositions différentes. Un devis clair, poste par poste, permet de voir où couper sans tout défaire.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Sur les fleurs, la saison fait plus pour le budget que la négociation. Fixez une enveloppe, laissez le fleuriste choisir des variétés de saison, et concentrez la dépense sur ce qui se voit le plus.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Le prix vient après le choix du prestataire : notre guide [choisir son fleuriste](/blog/choisir-fleuriste-mariage) détaille comment briefer et comparer, et [choisir la forme et les fleurs du bouquet](/blog/bouquet-mariee-choisir-forme-fleurs) aide à cibler ce qui compte. Comme la saison pèse lourd, voir aussi [choisir la date selon la saison](/blog/choisir-date-mariage-saison). Placez ce budget dans [la répartition par poste](/blog/repartition-budget-mariage-par-poste) et suivez-le dans le [simulateur budget](/tools/budget-calculator).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "In 2026, flowering a wedding as a full package generally costs between 1 800 and 4 500 €, about 10 to 15 % of a wedding's total budget. This amount covers the bride's bouquet, the buttonholes, the centerpieces, often an arch or ceremony decor, and sometimes the room decoration.",
          "The total depends above all on the number of arrangements and the style: a few seasonal flowers suit a modest budget, while a profusion of out-of-season peonies drives it up fast. Here's how that price breaks down.",
        ],
      },
      {
        type: "list",
        title: "The price item by item",
        items: [
          "The bride's bouquet: about 80 to 400 €, a classic round bouquet of roses sitting closer to 120 to 160 €",
          "Buttonholes and small bridesmaid posies: a few euros to about twenty euros each",
          "Centerpieces: about 30 to 70 € per table, to be multiplied by the number of tables",
          "Arch or ceremony decor: 250 to 500 € for a partial setup, 800 to 1 500 € and up for a fully flowered arch",
        ],
      },
      {
        type: "text",
        title: "Season, what weighs the most",
        paragraphs: [
          "The price of an arrangement depends first on the flowers chosen. A seasonal flower, grown locally, costs a fraction of an imported or out-of-season one. A round bouquet of roses stays affordable; the same volume in peonies or pampas climbs noticeably.",
          "Marrying in the heart of the season, or choosing varieties available at the time of the wedding, is the most effective lever. Winter months or field-grown flowers often allow a generous look without blowing the budget. Trust the florist to offer seasonal equivalents for a given style.",
        ],
      },
      {
        type: "list",
        title: "What makes the price vary",
        items: [
          "The number of arrangements: bouquet alone, or full ceremony plus room decor",
          "The season and the choice of varieties (local seasonal flowers versus imported or out-of-season ones)",
          "The style: structured and abundant costs more than an airy, wildflower look",
          "The logistics: on-site setup, takedown, distance to the venue, rental of stands and vases",
        ],
      },
      {
        type: "text",
        title: "How to pay a fair price",
        paragraphs: [
          "Give the florist a budget and a style, rather than a precise list of flowers: they'll offer a close look with seasonal varieties, often cheaper. Focus the budget on the most-seen points (the bouquet, the arch, the couple's table) and lighten the rest.",
          "A few moves cut the bill without sacrificing the effect: reusing the ceremony flowers on the dinner table, mixing flowers and foliage, or limiting the number of different arrangements. A clear quote, item by item, shows where to cut without unpicking everything.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "On flowers, season does more for the budget than negotiation. Set a budget, let the florist pick seasonal varieties, and concentrate the spend on what shows the most.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Price comes after choosing the vendor: our guide to [choosing your florist](/blog/choisir-fleuriste-mariage) details how to brief and compare, and [choosing the bouquet's shape and flowers](/blog/bouquet-mariee-choisir-forme-fleurs) helps target what matters. Since season weighs heavily, also see [choosing the date by season](/blog/choisir-date-mariage-saison). Place this budget in [the breakdown by line item](/blog/repartition-budget-mariage-par-poste) and track it in the [budget calculator](/tools/budget-calculator).",
        ],
      },
    ],
  }),

  postPair({
    slug: "combien-coute-robe-de-mariee",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Combien coûte une robe de mariée en 2026 ?",
    titleEn: "How much does a wedding dress cost in 2026?",
    excerptFr:
      "Budget moyen autour de 1 600 €, de 200 € en prêt-à-porter à 8 000 € en sur-mesure. Neuve, créateur, seconde main ou location, plus les retouches à ne pas oublier.",
    excerptEn:
      "Average budget around 1 600 €, from 200 € off-the-rack to 8 000 € made-to-measure. New, designer, secondhand, or rental, plus the alterations not to forget.",
    readingMinutes: 6,
    heroAltFr: "Robes de mariée présentées en boutique",
    heroAltEn: "Wedding dresses displayed in a boutique",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "En 2026, le budget moyen pour une robe de mariée en France tourne autour de 1 600 €, mais les prix s'étirent de 200 € pour du prêt-à-porter à plus de 8 000 € pour une création sur-mesure de luxe. Entre les deux, la majorité des ventes se concentre dans le segment des maisons et créateurs, entre 1 500 et 3 000 €.",
          "Le prix affiché n'est pourtant pas le prix final : retouches, accessoires et frais annexes s'ajoutent presque toujours. Voici les grandes filières et leur coût réel.",
        ],
      },
      {
        type: "list",
        title: "Le prix selon la filière",
        items: [
          "Prêt-à-porter accessible (en ligne ou grande enseigne) : environ 200 à 600 €, retouches souvent nécessaires",
          "Maison de robes et créateurs en boutique : environ 1 500 à 3 000 €, où se fait la majorité des ventes",
          "Haute couture et sur-mesure : de 4 000 à 8 000 € et plus",
          "Seconde main : souvent la moitié voire le tiers du prix neuf, pour un modèle en bon état",
          "Location : à partir de 250 € pour une robe simple, jusqu'à 1 500 € ou plus pour une création de créateur",
        ],
      },
      {
        type: "text",
        title: "Les retouches et frais annexes, souvent oubliés",
        paragraphs: [
          "Les retouches ne sont presque jamais incluses dans le prix affiché. Un ajustement de buste ou un ourlet se paie à part, et sur une robe d'entrée de gamme le surcoût est loin d'être négligeable. Prévoyez-les dès le départ, quel que soit le budget de la robe.",
          "Au-delà des retouches, les frais annexes (accessoires, lingerie, chaussures, voile, pressing, transport) représentent souvent 20 à 30 % du prix de la robe elle-même. C'est cette enveloppe complète, et non le seul ticket de la robe, qu'il faut inscrire au budget.",
        ],
      },
      {
        type: "list",
        title: "Comment dépenser moins sans renoncer",
        items: [
          "La seconde main : une robe d'occasion en bon état divise souvent la facture par deux, retouches à prévoir",
          "La location : intéressante pour porter une robe de prestige sans en devenir propriétaire, nettoyage souvent inclus",
          "Le déstockage et les fins de collection en boutique, pour un modèle neuf à prix réduit",
          "Anticiper les retouches et choisir une coupe proche de sa morphologie pour limiter le travail de reprise",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Budgétez la tenue complète, pas la seule robe : ajoutez 20 à 30 % pour les retouches et accessoires. Une robe à 300 € qui en coûte 450 une fois ajustée reste une bonne affaire, à condition de l'avoir prévu.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Le prix vient après le choix du style : notre guide [choisir sa robe de mariée](/blog/robe-de-mariee-guide-choisir) détaille coupes, essayages et calendrier. Pour dépenser moins, [la robe de mariée en seconde main ou en location](/blog/robe-mariee-seconde-main-louer) compare les deux options. Placez la tenue complète dans [la répartition du budget par poste](/blog/repartition-budget-mariage-par-poste), et pour un mariage serré, voyez [10 conseils pour un mariage à petit budget](/blog/mariage-petit-budget-10-conseils).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "In 2026, the average budget for a wedding dress in France is around 1 600 €, but prices stretch from 200 € for off-the-rack to more than 8 000 € for a luxury made-to-measure creation. In between, most sales concentrate in the segment of houses and designers, between 1 500 and 3 000 €.",
          "The advertised price, though, isn't the final price: alterations, accessories, and side costs almost always add up. Here are the main routes and their real cost.",
        ],
      },
      {
        type: "list",
        title: "The price by route",
        items: [
          "Accessible off-the-rack (online or high-street): about 200 to 600 €, alterations often needed",
          "Bridal houses and designers in boutiques: about 1 500 to 3 000 €, where most sales happen",
          "Haute couture and made-to-measure: from 4 000 to 8 000 € and up",
          "Secondhand: often half or even a third of the new price, for a dress in good condition",
          "Rental: from 250 € for a simple dress, up to 1 500 € or more for a designer creation",
        ],
      },
      {
        type: "text",
        title: "Alterations and side costs, often forgotten",
        paragraphs: [
          "Alterations are almost never included in the advertised price. A bust adjustment or a hem is paid separately, and on an entry-level dress the extra is far from negligible. Plan for them from the start, whatever the dress budget.",
          "Beyond alterations, the side costs (accessories, lingerie, shoes, veil, cleaning, transport) often make up 20 to 30 % of the dress price itself. It's this full envelope, not the dress ticket alone, that belongs in the budget.",
        ],
      },
      {
        type: "list",
        title: "How to spend less without giving up",
        items: [
          "Secondhand: a used dress in good condition often halves the bill, alterations to plan for",
          "Rental: worth it to wear a prestige dress without owning it, cleaning often included",
          "Clearance and end-of-collection in boutiques, for a new dress at a reduced price",
          "Anticipating alterations and choosing a cut close to your shape to limit the reworking",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Budget the full outfit, not the dress alone: add 20 to 30 % for alterations and accessories. A 300 € dress that costs 450 once fitted is still a good deal, as long as you planned for it.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Price comes after choosing the style: our guide to [choosing your wedding dress](/blog/robe-de-mariee-guide-choisir) details cuts, fittings, and timing. To spend less, [the secondhand or rental wedding dress](/blog/robe-mariee-seconde-main-louer) compares the two options. Place the full outfit in [the budget breakdown by line item](/blog/repartition-budget-mariage-par-poste), and for a tight wedding, see [10 tips for a small-budget wedding](/blog/mariage-petit-budget-10-conseils).",
        ],
      },
    ],
  }),

  postPair({
    slug: "combien-coute-videaste-mariage",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Combien coûte un vidéaste de mariage en 2026 ?",
    titleEn: "How much does a wedding videographer cost in 2026?",
    excerptFr:
      "Comptez 1 500 à 5 000 € pour un vidéaste de mariage, avec un tarif fréquent autour de 2 800 € sur une journée complète. Film court ou long, drone, ce qui fait varier le prix.",
    excerptEn:
      "Expect 1 500 to 5 000 € for a wedding videographer, with a common rate around 2 800 € for a full day. Short or long film, drone, what drives the price.",
    readingMinutes: 6,
    heroAltFr: "Vidéaste filmant les mariés pendant la cérémonie",
    heroAltEn: "Videographer filming the couple during the ceremony",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "En 2026, un vidéaste de mariage coûte en général entre 1 500 et 5 000 €, avec un tarif fréquent autour de 2 800 € pour une journée complète. La fourchette dépend du niveau de prestation, de la région et de l'expérience : à Paris, comptez souvent 40 % de plus, tandis que la province se situe plutôt en dessous de la moyenne.",
          "Comme pour la photo, le tarif ne paie pas que la présence le jour J : le montage représente une part importante du travail. Voici comment ce prix se décompose et ce qui le fait bouger.",
        ],
      },
      {
        type: "list",
        title: "Les gammes de prix",
        items: [
          "Entrée de gamme (un vidéaste seul, film court) : environ 1 500 à 2 500 €",
          "Milieu de gamme (journée complète, film plus abouti) : environ 2 500 à 4 000 €",
          "Haut de gamme (équipe, plusieurs caméras, drone, film long) : 4 000 € et plus",
          "Option drone seule, quand elle n'est pas incluse : environ 250 à 900 € selon la formule",
        ],
      },
      {
        type: "text",
        title: "Film court ou film long",
        paragraphs: [
          "La durée du film livré pèse sur le prix. Un film court, ou teaser, dure en général de trois à huit minutes : c'est un condensé émotionnel et rythmé de la journée, plus rapide à monter. Un film long peut atteindre trente à quatre-vingt-dix minutes et retrace l'intégralité des moments clés.",
          "Beaucoup de vidéastes proposent les deux, souvent dans le même forfait : un film court à partager facilement, et une version longue pour revivre la journée en entier. Le montage d'un film long demande plus de temps, ce qui se reflète dans les formules haut de gamme.",
        ],
      },
      {
        type: "list",
        title: "Ce qui fait varier le prix",
        items: [
          "La durée du film livré et le nombre de versions (teaser, film long)",
          "L'équipe : un vidéaste seul contre plusieurs caméras et opérateurs",
          "Le drone, désormais inclus dans une majorité de forfaits à partir de 2 500 €, en option en dessous",
          "La région (Paris et grandes villes plus chères) et l'expérience du vidéaste",
        ],
      },
      {
        type: "text",
        title: "Comment payer le juste prix",
        paragraphs: [
          "Regardez des films complets, pas seulement des bandes-annonces léchées : la qualité du son, la stabilité de l'image et le rythme du montage se jugent sur la durée. Vérifiez ce que couvre le forfait (heures de présence, nombre de caméras, drone, délai de livraison) pour comparer des devis équivalents.",
          "Si le budget est serré, la photo prime souvent sur la vidéo : c'est le souvenir le plus consulté. Un forfait vidéo d'entrée de gamme, centré sur un beau film court, offre un bon compromis pour garder le mouvement et le son du jour J sans doubler la dépense image.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Jugez un vidéaste sur un film complet, pas sur un teaser. Et si l'on doit arbitrer, la photo passe souvent avant la vidéo : un film court soigné suffit à garder l'essentiel sans faire exploser le poste image.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Avant le prix, la vraie question est de savoir si la vidéo vous tient à coeur : notre guide [le vidéaste vaut-il le coût](/blog/videaste-mariage-vaut-le-cout) aide à trancher. Comme photo et vidéo se décident ensemble, voyez [combien coûte un photographe](/blog/combien-coute-photographe-mariage). Placez ce budget dans [la répartition par poste](/blog/repartition-budget-mariage-par-poste) et, s'il faut prioriser les réservations, [les 5 prestataires à booker en priorité](/blog/cinq-prestataires-a-booker-priorite).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "In 2026, a wedding videographer generally costs between 1 500 and 5 000 €, with a common rate around 2 800 € for a full day. The range depends on the level of service, the region, and experience: in Paris, expect often 40 % more, while the provinces sit closer to below average.",
          "As with photography, the rate doesn't only pay for presence on the day: editing is a big share of the work. Here's how that price breaks down and what moves it.",
        ],
      },
      {
        type: "list",
        title: "The price tiers",
        items: [
          "Entry level (a single videographer, short film): about 1 500 to 2 500 €",
          "Mid range (full day, a more polished film): about 2 500 to 4 000 €",
          "High end (a team, several cameras, drone, long film): 4 000 € and up",
          "Drone as a standalone option, when not included: about 250 to 900 € depending on the format",
        ],
      },
      {
        type: "text",
        title: "Short film or long film",
        paragraphs: [
          "The length of the delivered film weighs on the price. A short film, or teaser, generally runs three to eight minutes: an emotional, snappy condensation of the day, quicker to edit. A long film can reach thirty to ninety minutes and covers all the key moments in full.",
          "Many videographers offer both, often in the same package: a short film to share easily, and a long version to relive the whole day. Editing a long film takes more time, which is reflected in the high-end formats.",
        ],
      },
      {
        type: "list",
        title: "What makes the price vary",
        items: [
          "The length of the delivered film and the number of versions (teaser, long film)",
          "The team: a single videographer versus several cameras and operators",
          "The drone, now included in a majority of packages from 2 500 €, an option below that",
          "The region (Paris and large cities pricier) and the videographer's experience",
        ],
      },
      {
        type: "text",
        title: "How to pay a fair price",
        paragraphs: [
          "Watch full films, not just slick trailers: sound quality, image stability, and editing rhythm are judged over length. Check what the package covers (hours of coverage, number of cameras, drone, delivery time) to compare like-for-like quotes.",
          "If the budget is tight, photography often takes priority over video: it's the keepsake looked at most. An entry-level video package, built around a nice short film, offers a good compromise to keep the movement and sound of the day without doubling the imaging spend.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Judge a videographer on a full film, not on a teaser. And if you must choose, photography often comes before video: a well-made short film is enough to keep the essentials without blowing up the imaging line.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Before price, the real question is whether video matters to you: our guide to [whether the videographer is worth the cost](/blog/videaste-mariage-vaut-le-cout) helps decide. Since photo and video are chosen together, see [how much a photographer costs](/blog/combien-coute-photographe-mariage). Place this budget in [the breakdown by line item](/blog/repartition-budget-mariage-par-poste) and, if you must prioritize bookings, [the 5 vendors to book first](/blog/cinq-prestataires-a-booker-priorite).",
        ],
      },
    ],
  }),
];

export const { fr: POSTS_240_247_FR, en: POSTS_240_247_EN } = pairsToArrays(pairs);
