import { postPair, pairsToArrays } from "./blog-posts-shared";

const pairs = [
  postPair({
    slug: "mariage-week-end-deux-jours",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Le mariage sur un week-end entier : deux ou trois jours de fête",
    titleEn: "The weekend-long wedding: two or three days of celebration",
    excerptFr:
      "Pot d'accueil le vendredi, mariage le samedi, brunch le dimanche : de plus en plus de couples étalent la fête sur un week-end. Pourquoi, comment séquencer les journées, et garder les invités (et le budget) en forme.",
    excerptEn:
      "Welcome drinks on Friday, the wedding on Saturday, brunch on Sunday: more and more couples spread the celebration across a whole weekend. Why, how to sequence the days, and how to keep guests (and the budget) fresh.",
    readingMinutes: 7,
    heroAltFr: "Invités réunis pour un pot d'accueil la veille du mariage",
    heroAltEn: "Guests gathered for welcome drinks the evening before the wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Longtemps, le mariage tenait en une seule journée : cérémonie, repas, soirée, et chacun rentrait chez soi. Aujourd'hui, beaucoup de couples préfèrent étaler la fête sur tout un week-end, souvent quand les invités viennent de loin et dorment sur place de toute façon. Un pot d'accueil le vendredi soir, le mariage le samedi, un brunch le dimanche matin.",
          "L'idée n'est pas d'en faire trois fois plus, mais de respirer. Au lieu de tout concentrer sur une journée qui file en quelques heures, on prend le temps de retrouver les gens, de discuter vraiment, de prolonger le plaisir. Encore faut-il séquencer les journées pour ne pas épuiser tout le monde, ni faire exploser le budget.",
        ],
      },
      {
        type: "text",
        title: "Pourquoi des couples choisissent le format long",
        paragraphs: [
          "La première raison est logistique : quand la moitié des invités a fait plusieurs heures de route et réservé une nuit d'hôtel, autant leur donner une vraie raison de rester. Un week-end complet rentabilise le déplacement et évite le sentiment de venir de loin pour repartir aussitôt.",
          "La seconde est plus intime. Le jour J passe si vite que les mariés voient à peine les gens qu'ils aiment. Étaler la fête, c'est se donner le temps d'un vrai moment avec chacun, dans une ambiance plus détendue que le tourbillon du samedi. Le pot d'accueil et le brunch sont souvent les souvenirs que les invités gardent le plus précieusement.",
        ],
      },
      {
        type: "list",
        title: "Séquencer les trois journées",
        items: [
          "Le vendredi soir, un pot d'accueil simple et convivial : apéritif dînatoire, planches à partager, rien de guindé, pour faire connaissance et poser les bagages",
          "Le samedi, le coeur du mariage : cérémonie, repas et soirée, la journée la plus intense, qui n'a pas besoin d'être alourdie par le reste",
          "Le dimanche, un brunch tardif et décontracté, sans horaire strict, où l'on repart à son rythme au fil de la matinée",
          "Prévoir des temps morts assumés entre chaque : personne ne tient trois jours d'animations non-stop, et les pauses font partie du plaisir",
        ],
      },
      {
        type: "text",
        title: "Garder les invités en forme, pas au bord de l'épuisement",
        paragraphs: [
          "Le piège du format long, c'est de vouloir remplir chaque minute. Trois jours d'activités enchaînées fatiguent plus qu'ils ne réjouissent, et le samedi soir, le vrai temps fort, risque de trouver des invités déjà usés. Mieux vaut un vendredi léger et un dimanche tranquille qui encadrent une journée pleine, que trois journées également chargées.",
          "Pensez aussi aux rythmes différents : les familles avec enfants, les grands-parents et les jeunes noctambules n'ont pas la même endurance. Un programme où chaque moment est facultatif, sauf le samedi, permet à chacun de doser sa présence sans culpabiliser.",
        ],
      },
      {
        type: "list",
        title: "Maîtriser le budget d'un week-end entier",
        items: [
          "Garder les repas annexes simples : le pot d'accueil et le brunch n'ont pas à rivaliser avec le dîner du samedi, un format buffet ou traiteur léger suffit",
          "Mutualiser un même lieu si possible, pour éviter les coûts de transport et de logistique entre plusieurs adresses",
          "Distinguer les invités du week-end complet (souvent les proches) de ceux du seul samedi, pour ne pas multiplier les couverts partout",
          "Anticiper l'hébergement tôt : réserver un bloc de chambres ou un gîte collectif coûte moins cher et rassure les invités venus de loin",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Un mariage sur un week-end réussit quand une seule journée est vraiment intense et que les deux autres respirent. Ce n'est pas trois mariages à la suite, c'est un mariage qu'on prend le temps de savourer avant et après.",
        ],
      },
      {
        type: "text",
        title: "La logistique de l'hébergement, le vrai nerf du format long",
        paragraphs: [
          "Étaler la fête n'a de sens que si les invités dorment sur place, et c'est souvent le point qui décide de la faisabilité. Repérez tôt les capacités autour du lieu : gîtes, chambres d'hôtes, hôtels, voire un grand domaine qui loge une partie des convives. Regrouper les nuitées près du lieu évite les trajets de nuit et les questions de retour.",
          "Communiquez ces options bien à l'avance, avec des fourchettes de prix et des adresses concrètes, pour que chacun réserve à son budget. Un week-end de mariage se prépare comme un petit séjour de groupe : c'est plus de coordination en amont, mais beaucoup moins de stress le jour même.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Le brunch du dimanche mérite sa propre préparation : notre guide [le brunch du lendemain](/blog/brunch-lendemain-mariage) détaille format, quantités et timing. Pour loger tout le monde autour du lieu, voir [l'hébergement des invités](/blog/hebergement-invites-mariage), et pour organiser les allers-retours entre les adresses, [les navettes et le transport des invités](/blog/transport-navette-invites-mariage). Le pot d'accueil du vendredi ressemble d'ailleurs beaucoup au [dîner de répétition](/blog/diner-de-repetition-mariage).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "For a long time, a wedding fit into a single day: ceremony, meal, party, and everyone went home. Today many couples prefer to spread the celebration across a whole weekend, often when guests travel from far and stay over anyway. Welcome drinks on Friday evening, the wedding on Saturday, brunch on Sunday morning.",
          "The idea isn't to do three times as much, but to breathe. Instead of cramming everything into a day that flies by in a few hours, you take the time to reconnect with people, talk properly, extend the pleasure. It still takes careful sequencing so you don't exhaust everyone, or blow the budget.",
        ],
      },
      {
        type: "text",
        title: "Why couples choose the long format",
        paragraphs: [
          "The first reason is logistical: when half your guests have driven several hours and booked a hotel night, you may as well give them a real reason to stay. A full weekend makes the trip worthwhile and avoids the feeling of coming a long way only to turn straight back.",
          "The second is more personal. The big day passes so fast that the couple barely sees the people they love. Spreading the celebration gives you time for a genuine moment with each guest, in a more relaxed atmosphere than the Saturday whirlwind. The welcome drinks and the brunch are often the memories guests treasure most.",
        ],
      },
      {
        type: "list",
        title: "Sequencing the three days",
        items: [
          "Friday evening, simple, easygoing welcome drinks: a light buffet, sharing boards, nothing formal, to get acquainted and drop the bags",
          "Saturday, the heart of the wedding: ceremony, meal, and party, the most intense day, which doesn't need to be weighed down by the rest",
          "Sunday, a late, relaxed brunch with no strict schedule, where people leave at their own pace through the morning",
          "Plan deliberate downtime between each: no one lasts three days of non-stop activities, and the pauses are part of the pleasure",
        ],
      },
      {
        type: "text",
        title: "Keeping guests fresh, not on the edge of exhaustion",
        paragraphs: [
          "The trap of the long format is wanting to fill every minute. Three days of back-to-back activities tire more than they delight, and Saturday evening, the real highlight, risks finding guests already worn out. Better a light Friday and a quiet Sunday framing one full day than three equally packed ones.",
          "Think too about different rhythms: families with children, grandparents, and young night owls don't share the same stamina. A program where every moment is optional except Saturday lets each guest measure their presence without guilt.",
        ],
      },
      {
        type: "list",
        title: "Keeping a whole weekend on budget",
        items: [
          "Keep the side meals simple: the welcome drinks and the brunch needn't rival the Saturday dinner, a buffet or a light caterer is plenty",
          "Pool a single location where possible, to avoid transport and logistics costs between several addresses",
          "Tell full-weekend guests (often the close circle) apart from Saturday-only guests, so you aren't laying extra covers everywhere",
          "Sort accommodation early: booking a block of rooms or a shared house costs less and reassures guests coming from afar",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "A weekend wedding works when only one day is truly intense and the other two breathe. It isn't three weddings in a row, it's one wedding you take the time to savor before and after.",
        ],
      },
      {
        type: "text",
        title: "Accommodation logistics, the real crux of the long format",
        paragraphs: [
          "Spreading the celebration only makes sense if guests sleep nearby, and that's often what decides feasibility. Scout capacity around the venue early: cottages, guesthouses, hotels, even a large estate that lodges some of the party. Grouping nights near the venue avoids late drives and the question of getting home.",
          "Share these options well ahead, with price ranges and concrete addresses, so each guest books to their own budget. A wedding weekend is planned like a small group trip: more coordination up front, but far less stress on the day itself.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "The Sunday brunch deserves its own planning: our guide to [the day-after brunch](/blog/brunch-lendemain-mariage) covers format, quantities, and timing. To lodge everyone near the venue, see [guest accommodation](/blog/hebergement-invites-mariage), and to organize the trips between addresses, [guest shuttles and transport](/blog/transport-navette-invites-mariage). The Friday welcome drinks, in fact, look a lot like [the rehearsal dinner](/blog/diner-de-repetition-mariage).",
        ],
      },
    ],
  }),

  postPair({
    slug: "organiser-mariage-a-distance",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Organiser son mariage à distance : depuis une autre ville ou un autre pays",
    titleEn: "Planning your wedding from afar: another city or another country",
    excerptFr:
      "Vous vous mariez là où vous ne vivez pas : impossible de voir chaque prestataire en personne. Visites en visio, contact local de confiance, déplacements groupés et outils partagés pour tout piloter à distance.",
    excerptEn:
      "You're marrying where you don't live: seeing every vendor in person is impossible. Video visits, a trusted local contact, grouped trips, and shared tools to run it all from a distance.",
    readingMinutes: 7,
    heroAltFr: "Couple préparant son mariage à distance en visioconférence",
    heroAltEn: "Couple planning their wedding remotely over a video call",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Se marier là où l'on n'habite pas est plus courant qu'on ne le croit : la région d'enfance d'un des deux, un lieu qui compte, ou simplement une campagne plus abordable que la grande ville où vous vivez. Le problème est le même dans tous les cas : vous ne pouvez pas passer voir chaque prestataire un mercredi soir, ni multiplier les rendez-vous sur place.",
          "La bonne nouvelle, c'est que l'organisation à distance est tout à fait faisable, à condition de s'appuyer sur trois piliers : la visio pour voir sans se déplacer, un contact local de confiance pour les yeux sur place, et des déplacements groupés pour concentrer l'essentiel en quelques passages.",
        ],
      },
      {
        type: "text",
        title: "Choisir des prestataires qu'on ne peut pas rencontrer facilement",
        paragraphs: [
          "Quand on ne peut pas se déplacer pour chaque devis, la réputation et les traces écrites comptent double. Privilégiez les prestataires qui documentent leur travail (photos de mariages réels, avis détaillés, portfolios complets) et qui répondent clairement par écrit. Un professionnel à l'aise avec l'échange à distance est souvent un bon signe pour la suite.",
          "Demandez systématiquement des devis détaillés et des contrats précis, car vous n'aurez pas l'occasion de tout recaler de vive voix. Un traiteur ou un photographe habitué aux couples qui vivent loin saura vous rassurer avec des références vérifiables plutôt qu'avec de belles paroles.",
        ],
      },
      {
        type: "list",
        title: "Les visites en visio, presque aussi utiles qu'en vrai",
        items: [
          "Demander une visite du lieu en direct par appel vidéo, en faisant filmer chaque espace (salle, extérieur, coins techniques) plutôt que de se contenter des photos du site",
          "Enregistrer ou noter chaque échange, car à distance on oublie vite qui a dit quoi entre deux prestataires",
          "Faire les dégustations et essayages lors d'un passage groupé, ce sont les rares étapes qui exigent vraiment d'être sur place",
          "Vérifier en visio les détails qui ne se voient pas sur une photo léchée : bruit, accès, luminosité réelle, état des sanitaires",
        ],
      },
      {
        type: "text",
        title: "Le contact local de confiance, vos yeux sur place",
        paragraphs: [
          "Rien ne remplace quelqu'un sur le terrain. Un parent, un ami de la région ou un témoin qui habite près du lieu peut faire une visite à votre place, récupérer un devis, vérifier un détail ou assister à un rendez-vous où vous êtes en visio. Ce relais informel vaut de l'or et désamorce la plupart des angoisses du à distance.",
          "Si votre budget le permet, un wedding planner local joue ce rôle de façon professionnelle : il connaît les prestataires du coin, se déplace pour vous et coordonne le jour J. Ce n'est pas indispensable, mais pour un mariage vraiment lointain, c'est souvent le poste qui achète le plus de sérénité.",
        ],
      },
      {
        type: "list",
        title: "Grouper les déplacements pour ne pas s'épuiser",
        items: [
          "Concentrer plusieurs rendez-vous sur un même week-end de repérage plutôt que de multiplier les allers-retours coûteux",
          "Caler ce week-end assez tôt pour voir le lieu, le traiteur et les prestataires clés d'un coup, quand les choix ne sont pas encore figés",
          "Prévoir un second passage rapproché de la date pour les dégustations finales, l'essayage et le calage du jour J",
          "Réserver ces déplacements comme des rendez-vous professionnels : ordre du jour clair, prestataires prévenus, marge pour les imprévus",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "L'organisation à distance ne demande pas d'être partout, mais d'être clair : des échanges écrits, des visites filmées et un contact local de confiance remplacent la plupart des déplacements. Réservez le présentiel aux étapes qui l'exigent vraiment.",
        ],
      },
      {
        type: "text",
        title: "S'appuyer sur des outils partagés",
        paragraphs: [
          "À distance, la mémoire écrite devient votre meilleure alliée. Centralisez devis, contrats, contacts et échéances au même endroit, accessible aux deux à tout moment, pour ne pas dépendre d'un carnet resté chez l'un ou d'un mail perdu. C'est ce qui permet de décider vite quand un prestataire relance et que vous êtes chacun de votre côté.",
          "Un rétroplanning partagé évite aussi que les délais se télescopent : à distance, un devis qui traîne ou un contact injoignable se remarque plus tard, quand il est déjà trop tard. Voir la préparation d'un mariage lointain comme un projet piloté à deux, avec des étapes datées, change tout.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Choisir un lieu qu'on ne visite qu'une fois demande méthode : voir [choisir son lieu de réception](/blog/choisir-lieu-reception-types) et [comparer les devis de traiteur](/blog/comparer-devis-traiteur-mariage) pour trancher à distance sur des bases solides. Pour caler les rendez-vous dans le bon ordre lors de vos passages, [l'ordre de réservation des prestataires](/blog/ordre-reservation-prestataires-mariage) aide à prioriser. Et comme tout se pilote à deux, souvent depuis deux endroits, notre guide [organiser son mariage à deux](/blog/organiser-mariage-a-deux-sync) et la [timeline](/tools/timeline) gardent les échéances au même endroit.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Marrying where you don't live is more common than you'd think: one partner's childhood region, a place that matters, or simply countryside more affordable than the city you live in. The problem is the same in every case: you can't drop by each vendor on a Wednesday evening, or line up appointment after appointment on site.",
          "The good news is that planning from a distance is entirely doable, as long as you lean on three pillars: video calls to see without traveling, a trusted local contact for eyes on the ground, and grouped trips to concentrate the essentials into a few visits.",
        ],
      },
      {
        type: "text",
        title: "Choosing vendors you can't easily meet",
        paragraphs: [
          "When you can't travel for every quote, reputation and a written trail count double. Favor vendors who document their work (photos of real weddings, detailed reviews, full portfolios) and who answer clearly in writing. A professional at ease with remote exchange is often a good sign for what follows.",
          "Always ask for detailed quotes and precise contracts, since you won't get to settle everything face to face. A caterer or photographer used to couples who live far away will reassure you with verifiable references rather than fine words.",
        ],
      },
      {
        type: "list",
        title: "Video visits, almost as useful as being there",
        items: [
          "Ask for a live venue tour by video call, having each space filmed (hall, grounds, service areas) rather than relying on the website's photos",
          "Record or note every exchange, because from a distance you quickly forget who said what between two vendors",
          "Do tastings and fittings during a grouped trip, the rare steps that genuinely require being on site",
          "Check on video the details a polished photo hides: noise, access, real light levels, the state of the restrooms",
        ],
      },
      {
        type: "text",
        title: "The trusted local contact, your eyes on the ground",
        paragraphs: [
          "Nothing replaces someone on the ground. A parent, a friend from the region, or a witness who lives near the venue can visit in your place, pick up a quote, check a detail, or sit in on a meeting you attend by video. That informal relay is worth its weight in gold and defuses most of the anxiety of planning from afar.",
          "If your budget allows, a local wedding planner plays that role professionally: they know the area's vendors, travel for you, and coordinate the day. It isn't essential, but for a truly distant wedding it's often the line item that buys the most peace of mind.",
        ],
      },
      {
        type: "list",
        title: "Grouping trips so you don't burn out",
        items: [
          "Concentrate several meetings into a single scouting weekend rather than piling up costly back-and-forth trips",
          "Schedule that weekend early enough to see the venue, the caterer, and the key vendors at once, while the choices aren't yet locked",
          "Plan a second trip close to the date for final tastings, the fitting, and setting up the day",
          "Book these trips like business appointments: a clear agenda, vendors notified, margin for the unexpected",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Planning from afar doesn't require being everywhere, but being clear: written exchanges, filmed visits, and a trusted local contact replace most travel. Save in-person visits for the steps that truly demand them.",
        ],
      },
      {
        type: "text",
        title: "Leaning on shared tools",
        paragraphs: [
          "At a distance, the written record becomes your best ally. Centralize quotes, contracts, contacts, and deadlines in one place, accessible to both of you at any time, so you don't depend on a notebook left at one home or a lost email. That's what lets you decide fast when a vendor follows up and you're each on your own side.",
          "A shared timeline also keeps deadlines from colliding: from afar, a quote left hanging or an unreachable contact only shows up later, when it's already too late. Seeing a distant wedding as a project run by two, with dated steps, changes everything.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Choosing a venue you'll visit only once takes method: see [choosing your reception venue](/blog/choisir-lieu-reception-types) and [comparing caterer quotes](/blog/comparer-devis-traiteur-mariage) to decide from a distance on solid ground. To line up meetings in the right order during your trips, [the order for booking vendors](/blog/ordre-reservation-prestataires-mariage) helps you prioritize. And since it's all run by two, often from two places, our guide to [planning your wedding as a couple](/blog/organiser-mariage-a-deux-sync) and the [timeline](/tools/timeline) keep the deadlines in one place.",
        ],
      },
    ],
  }),

  postPair({
    slug: "baby-sitter-garde-enfants-mariage",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "La garde d'enfants le jour J : baby-sitter et coin enfants encadré",
    titleEn: "Childcare on the day: a babysitter and a supervised kids' corner",
    excerptFr:
      "Différent de l'animation : une vraie garde d'enfants avec du personnel dédié, une salle au calme et des ratios adaptés à l'âge. Comment la prévoir, quand elle intervient, et comment briefer les intervenants.",
    excerptEn:
      "Different from entertainment: real childcare with dedicated staff, a quiet room, and age-appropriate ratios. How to plan it, when it steps in, and how to brief the carers.",
    readingMinutes: 7,
    heroAltFr: "Baby-sitter s'occupant d'enfants dans un coin calme pendant un mariage",
    heroAltEn: "Babysitter caring for children in a quiet corner during a wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "On confond souvent deux choses très différentes : animer les enfants pendant la journée, et les garder vraiment. Un magicien, un atelier ou une chasse au trésor occupent les grands une heure ou deux, mais ne remplacent pas une personne responsable des tout-petits pendant que les parents dînent ou dansent. C'est cette garde encadrée qui manque le plus souvent.",
          "Recruter une baby-sitter ou une équipe pour le jour J, avec une salle au calme et des ratios adaptés, change la soirée de tout le monde : les parents profitent vraiment, les enfants sont en sécurité, et les mariés n'ont pas à improviser à 22 heures quand un enfant s'endort sous une table.",
        ],
      },
      {
        type: "text",
        title: "Garder n'est pas animer",
        paragraphs: [
          "L'animation cherche à amuser un groupe d'enfants réveillés pendant un créneau. La garde, elle, veille sur eux en continu : elle gère les siestes, les repas, les petits bobos, les moments de fatigue et les couchers. Les deux sont complémentaires, mais seule la seconde permet aux parents de lâcher prise sans garder un oeil sur la salle.",
          "Concrètement, une garde digne de ce nom suppose du personnel dont c'est la seule mission, un espace dédié et un cadre clair. Un cousin adolescent qui surveille vaguement ne suffit pas dès qu'il y a des tout-petits : il faut des adultes responsables, joignables et présents du début à la fin de la soirée.",
        ],
      },
      {
        type: "list",
        title: "Les ratios selon l'âge",
        items: [
          "Pour les tout-petits (moins de trois ans), viser un intervenant pour trois à quatre enfants au maximum, car ils demandent une attention quasi constante",
          "Pour les plus grands (à partir de quatre ou cinq ans), un adulte peut encadrer un groupe un peu plus nombreux, mais rarement plus d'une poignée en soirée",
          "Prévoir toujours au moins deux intervenants dès qu'il y a plusieurs enfants, pour qu'aucun ne reste seul si l'un doit s'absenter",
          "Ces repères restent indicatifs et se resserrent avec le bruit, la fatigue et l'excitation d'une soirée de mariage : mieux vaut une personne de trop qu'une de moins",
        ],
      },
      {
        type: "text",
        title: "Une salle au calme, à part de la fête",
        paragraphs: [
          "Le point le plus sous-estimé est l'espace. Une pièce séparée, au calme, à l'écart de la musique et des allées et venues, transforme la garde : les petits peuvent y jouer, s'y reposer et s'y endormir sans être happés par le bruit. Prévoyez de quoi les faire dormir (matelas, coussins, lumière tamisée) et de quoi les occuper (jeux, coloriages, un écran si vous l'acceptez).",
          "Vérifiez ce point avec le lieu dès la visite : toutes les salles n'offrent pas une pièce annexe utilisable. Une chambre à l'étage, un salon attenant ou une tente chauffée peuvent faire l'affaire, à condition de rester surveillés et proches des parents en cas de besoin.",
        ],
      },
      {
        type: "list",
        title: "Le bon timing dans la soirée",
        items: [
          "La garde devient vraiment utile au moment du dîner et des discours, quand les parents veulent être à table et que les enfants décrochent",
          "Prévoir le pic de fatigue en début de soirée : c'est souvent là que les tout-petits s'endorment et que la salle au calme prend tout son sens",
          "Caler l'arrivée des intervenants un peu avant le repas, pour qu'ils fassent connaissance avec les enfants tant qu'ils sont encore disponibles",
          "Fixer une heure de fin claire, quitte à ce que les parents récupèrent des enfants endormis, plutôt que de laisser la garde s'étirer sans limite",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Une bonne garde d'enfants tient à trois choses : du personnel dédié en nombre suffisant, une salle au calme à part de la fête, et un briefing précis. Réunies, elles rendent la soirée aux parents sans jamais laisser un enfant livré à lui-même.",
        ],
      },
      {
        type: "text",
        title: "Briefer les intervenants et cadrer le budget",
        paragraphs: [
          "Un briefing écrit évite bien des flottements : liste des enfants avec leur âge, allergies et habitudes, contacts directs des parents, consignes de coucher, et le nom d'une personne relais côté mariés en cas de souci. Prévenez aussi les parents en amont, pour qu'ils fournissent doudous, changes et biberons, et sachent où sera la salle.",
          "Côté budget, une garde professionnelle se facture souvent à l'heure et par intervenant, avec un forfait qui dépend du nombre d'enfants et de la durée. Comptez plus pour une soirée qui s'étire tard et pour des tout-petits. Ce n'est pas un poste énorme au regard du confort qu'il apporte, mais il se chiffre : mieux vaut le budgéter dès le départ que le découvrir au dernier moment.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "La garde se combine idéalement avec des activités en journée : voir [les enfants au mariage et leur animation](/blog/enfants-au-mariage-animation). Pour que les petits mangent à leur rythme dans la salle au calme, pensez au [menu enfants](/blog/menu-enfants-mariage), et pour les placer intelligemment à table, [le plan de table avec des enfants](/blog/plan-de-table-enfants-mariage). Ajoutez la garde comme un poste dédié dans le [calculateur de budget](/tools/budget-calculator) pour ne pas l'oublier.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Two very different things often get confused: entertaining the children during the day, and actually looking after them. A magician, a workshop, or a treasure hunt keep the older ones busy for an hour or two, but they don't replace someone responsible for the little ones while the parents dine or dance. It's that supervised childcare that's most often missing.",
          "Hiring a babysitter or a team for the day, with a quiet room and age-appropriate ratios, changes the evening for everyone: parents genuinely enjoy themselves, children are safe, and the couple doesn't have to improvise at 10pm when a child falls asleep under a table.",
        ],
      },
      {
        type: "text",
        title: "Minding isn't entertaining",
        paragraphs: [
          "Entertainment sets out to amuse a group of wide-awake children for a slot. Childcare watches over them continuously: it manages naps, meals, small scrapes, tired moments, and bedtimes. The two are complementary, but only the second lets parents let go without keeping an eye on the room.",
          "In practice, real childcare means staff whose only task this is, a dedicated space, and a clear framework. A vaguely watchful teenage cousin isn't enough once there are toddlers: you need responsible adults, reachable and present from the start of the evening to the end.",
        ],
      },
      {
        type: "list",
        title: "Ratios by age",
        items: [
          "For the youngest (under three), aim for one carer per three to four children at most, since they need near-constant attention",
          "For older ones (from four or five), an adult can supervise a slightly larger group, but rarely more than a handful in the evening",
          "Always plan at least two carers as soon as there are several children, so none is left alone if one has to step away",
          "These are guides only, and they tighten with the noise, tiredness, and excitement of a wedding evening: better one carer too many than one too few",
        ],
      },
      {
        type: "text",
        title: "A quiet room, apart from the party",
        paragraphs: [
          "The most underrated point is the space. A separate, quiet room, away from the music and the comings and goings, transforms the childcare: the little ones can play, rest, and fall asleep there without being swept up in the noise. Provide what they need to sleep (a mattress, cushions, dim light) and to stay busy (games, coloring, a screen if you allow it).",
          "Check this with the venue right at the visit: not every space offers a usable side room. A bedroom upstairs, an adjoining lounge, or a heated marquee can do the job, as long as it stays supervised and close to the parents if needed.",
        ],
      },
      {
        type: "list",
        title: "The right timing in the evening",
        items: [
          "Childcare becomes truly useful during dinner and the speeches, when parents want to be at the table and the children switch off",
          "Anticipate the fatigue peak in the early evening: that's often when toddlers fall asleep and the quiet room earns its keep",
          "Have the carers arrive a little before the meal, so they get to know the children while they're still available",
          "Set a clear end time, even if parents collect sleeping children, rather than letting the childcare stretch on without a limit",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Good childcare comes down to three things: dedicated staff in sufficient number, a quiet room apart from the party, and a precise briefing. Together, they hand the evening back to parents without ever leaving a child to fend for themselves.",
        ],
      },
      {
        type: "text",
        title: "Briefing the carers and framing the budget",
        paragraphs: [
          "A written briefing avoids a lot of drift: a list of the children with their ages, allergies, and habits, the parents' direct contacts, bedtime instructions, and the name of a relay person on the couple's side in case of trouble. Warn parents ahead too, so they bring comforters, changes, and bottles, and know where the room will be.",
          "On budget, professional childcare is often charged by the hour and per carer, with a rate depending on the number of children and the duration. Count on more for an evening that runs late and for toddlers. It isn't a huge line item given the comfort it brings, but it does have a price: better to budget it from the start than discover it at the last minute.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Childcare pairs ideally with daytime activities: see [children at the wedding and keeping them entertained](/blog/enfants-au-mariage-animation). So the little ones can eat at their own pace in the quiet room, think about the [children's menu](/blog/menu-enfants-mariage), and to place them wisely at the table, [the seating plan with children](/blog/plan-de-table-enfants-mariage). Add childcare as its own line in the [budget calculator](/tools/budget-calculator) so you don't forget it.",
        ],
      },
    ],
  }),

  postPair({
    slug: "se-marier-jour-ferie-pont",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Se marier un jour férié ou un week-end prolongé : bonne ou fausse idée ?",
    titleEn: "Marrying on a public holiday or long weekend: smart move or trap?",
    excerptFr:
      "Un pont ou un jour férié donne plus de temps aux invités venus de loin, mais gonfle les tarifs et ferme les mairies. Les vrais avantages, les pièges à connaître, et comment trancher.",
    excerptEn:
      "A long weekend or public holiday gives far-flung guests more time, but pushes up prices and closes town halls. The real upsides, the traps to know, and how to decide.",
    readingMinutes: 7,
    heroAltFr: "Calendrier marqué d'un week-end prolongé pour un mariage",
    heroAltEn: "Calendar marking a long weekend for a wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Choisir de se marier autour d'un jour férié ou d'un pont part souvent d'une bonne intention : offrir aux invités une journée de plus pour venir, repartir et récupérer. C'est différent de se marier un simple jour de semaine, où l'on cherche surtout à économiser : ici, l'idée est d'utiliser le calendrier à l'avantage de tout le monde.",
          "Mais un pont a deux visages. Il facilite les déplacements et allonge la fête, mais il attire aussi la demande, gonfle les tarifs et bute parfois sur des services publics fermés. Comme souvent, la bonne décision dépend de votre situation, pas d'une règle unique.",
        ],
      },
      {
        type: "list",
        title: "Les vrais avantages d'un week-end prolongé",
        items: [
          "Les invités venus de loin posent un jour de congé au lieu de deux, ce qui augmente le taux de présence, surtout pour un mariage loin des grandes villes",
          "Le lendemain férié laisse le temps d'un brunch tranquille et d'un retour sans course, plutôt qu'un dimanche soir déjà happé par la reprise du travail",
          "L'ambiance de pont, plus détendue, joue en votre faveur : les gens sont déjà en mode vacances et restent plus volontiers",
          "Pour un mariage sur tout un week-end, un jour férié accolé rend l'étalement de la fête beaucoup plus naturel",
        ],
      },
      {
        type: "text",
        title: "Le revers : tarifs, disponibilités et invités déjà pris",
        paragraphs: [
          "Le premier piège est financier. Les week-ends prolongés sont très demandés : lieux, traiteurs et hébergements se réservent tôt et se paient parfois plus cher, avec des majorations sur les nuitées et les prestations. L'avantage que vous offrez aux invités peut se retourner en surcoût pour vous.",
          "Le second piège est humain. Un pont est aussi un moment où beaucoup de gens ont déjà des projets : voyages en famille, autres mariages, traditions du week-end férié. Vous facilitez le déplacement de certains, mais vous entrez en concurrence avec l'agenda chargé des autres. Sonder vos proches avant de figer la date évite les mauvaises surprises côté réponses.",
        ],
      },
      {
        type: "text",
        title: "Les mairies et services publics fermés",
        paragraphs: [
          "Point souvent oublié : un jour férié, la mairie ne célèbre pas de mariage civil. Si vous rêvez de dire oui pile le jour du pont, ce sera en pratique la veille ou un autre jour ouvré, avec la cérémonie civile décalée par rapport à la fête. Renseignez-vous tôt auprès de votre mairie sur les jours et créneaux réellement disponibles.",
          "La fermeture touche aussi d'autres services utiles en amont (dépôt de dossier, retrait de pièces) et parfois certains commerces ou prestataires. Rien de rédhibitoire, mais cela ajoute des contraintes de calendrier qu'il vaut mieux anticiper que découvrir un mois avant.",
        ],
      },
      {
        type: "list",
        title: "Comment trancher",
        items: [
          "Regarder d'abord d'où viennent vos invités : un pont a surtout du sens si beaucoup font plusieurs heures de route ou de train",
          "Comparer les devis sur une date de pont et sur un week-end ordinaire proche, pour mesurer le surcoût réel avant de choisir",
          "Vérifier auprès de la mairie les jours de célébration possibles autour de la date visée, avant toute réservation",
          "Sonder discrètement quelques proches clés sur leurs projets de pont, car leur présence pèse plus qu'une date parfaite sur le papier",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Un jour férié n'est ni bon ni mauvais en soi : il facilite la vie des invités lointains mais renchérit les prestations et complique le civil. Pesez le gain de présence face au surcoût, et vérifiez toujours les jours de mairie avant de réserver.",
        ],
      },
      {
        type: "text",
        title: "Un compromis souvent gagnant",
        paragraphs: [
          "Entre le jour férié pile et le week-end lambda, il existe une voie médiane : se marier le samedi qui précède ou qui suit un pont, sans tomber sur le jour férié lui-même. Vous gardez l'avantage du temps offert aux invités, tout en évitant la mairie fermée et une partie de la surchauffe des tarifs du jour le plus demandé.",
          "L'essentiel est de décider en connaissance de cause. Un pont bien choisi peut faire venir des proches qui auraient décliné une date ordinaire ; mal choisi, il coûte plus cher pour un carnet de réponses en demi-teinte. La bonne date est celle qui sert vos invités sans vous mettre sous pression.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Si votre priorité est plutôt d'alléger la facture, comparez avec notre guide [se marier en semaine pour économiser](/blog/se-marier-en-semaine-economiser). Pour intégrer la saison et la demande dans votre choix, voir [choisir la date et la saison](/blog/choisir-date-mariage-saison). Et comme un pont implique souvent des invités qui dorment sur place, pensez tôt à [l'hébergement des invités](/blog/hebergement-invites-mariage).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Choosing to marry around a public holiday or a long weekend often comes from a good intention: giving guests an extra day to travel, return, and recover. It's different from marrying on a plain weekday, where the main aim is to save money: here, the idea is to use the calendar to everyone's advantage.",
          "But a long weekend has two faces. It eases travel and stretches the celebration, but it also draws demand, pushes prices up, and sometimes runs into closed public services. As so often, the right call depends on your situation, not on a single rule.",
        ],
      },
      {
        type: "list",
        title: "The real upsides of a long weekend",
        items: [
          "Guests from afar take one day off instead of two, which lifts attendance, especially for a wedding far from the big cities",
          "The holiday the day after leaves time for a relaxed brunch and an unhurried return, rather than a Sunday evening already swallowed by the return to work",
          "The looser long-weekend mood works in your favor: people are already in holiday mode and stay more willingly",
          "For a wedding spread over a whole weekend, an adjacent public holiday makes stretching the celebration far more natural",
        ],
      },
      {
        type: "text",
        title: "The flip side: prices, availability, and guests already booked",
        paragraphs: [
          "The first trap is financial. Long weekends are in high demand: venues, caterers, and accommodation book up early and sometimes cost more, with surcharges on nights and services. The advantage you offer guests can turn into an extra cost for you.",
          "The second trap is human. A long weekend is also a time when many people already have plans: family trips, other weddings, holiday traditions. You make travel easier for some, but you compete with everyone else's busy calendar. Sounding out your close circle before locking the date avoids nasty surprises on the replies.",
        ],
      },
      {
        type: "text",
        title: "Town halls and public services closed",
        paragraphs: [
          "An often-forgotten point: on a public holiday, the town hall doesn't perform civil weddings. If you dream of saying yes exactly on the holiday, in practice it will be the day before or another working day, with the civil ceremony offset from the party. Check early with your town hall on the days and slots actually available.",
          "The closure also affects other useful upstream services (filing the dossier, collecting documents) and sometimes certain shops or vendors. Nothing disqualifying, but it adds calendar constraints better anticipated than discovered a month out.",
        ],
      },
      {
        type: "list",
        title: "How to decide",
        items: [
          "Look first at where your guests come from: a long weekend mainly makes sense if many face several hours of driving or train travel",
          "Compare quotes for a holiday date and for a nearby ordinary weekend, to measure the real premium before choosing",
          "Check with the town hall which ceremony days are possible around the target date, before any booking",
          "Quietly sound out a few key relatives about their long-weekend plans, since their presence matters more than a date that's perfect on paper",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "A public holiday is neither good nor bad in itself: it eases life for far-flung guests but raises service costs and complicates the civil side. Weigh the gain in attendance against the premium, and always check the town hall's days before booking.",
        ],
      },
      {
        type: "text",
        title: "A compromise that often wins",
        paragraphs: [
          "Between the holiday itself and an ordinary weekend, there's a middle path: marrying on the Saturday just before or after a long weekend, without landing on the holiday itself. You keep the advantage of the extra time offered to guests, while avoiding the closed town hall and part of the price surge on the most sought-after day.",
          "The key is deciding with your eyes open. A well-chosen long weekend can bring in relatives who'd have declined an ordinary date; badly chosen, it costs more for a lukewarm set of replies. The right date is the one that serves your guests without putting you under pressure.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "If your priority is really trimming the bill, compare with our guide to [marrying midweek to save](/blog/se-marier-en-semaine-economiser). To factor season and demand into your choice, see [choosing the date and season](/blog/choisir-date-mariage-saison). And since a long weekend often means guests staying over, think early about [guest accommodation](/blog/hebergement-invites-mariage).",
        ],
      },
    ],
  }),

  postPair({
    slug: "sortie-ceremonie-petales-confettis-bulles",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "La sortie de cérémonie : pétales, bulles, confettis ou rubans",
    titleEn: "The ceremony exit: petals, bubbles, confetti, or ribbons",
    excerptFr:
      "La haie d'honneur qui suit le oui donne l'une des plus belles photos de la journée. Pétales séchés, bulles, confettis biodégradables : ce que les lieux autorisent, les options éco, et comment caler l'instant avec le photographe.",
    excerptEn:
      "The send-off right after the vows makes one of the day's finest photos. Dried petals, bubbles, biodegradable confetti: what venues allow, the eco options, and how to time the moment with the photographer.",
    readingMinutes: 6,
    heroAltFr: "Mariés sous une pluie de pétales à la sortie de la cérémonie",
    heroAltEn: "Couple showered with petals as they leave the ceremony",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le moment où les mariés ressortent, tout juste unis, sous une pluie de pétales et une haie d'invités qui applaudissent, est l'une des images les plus attendues de la journée. C'est joyeux, spontané, et cela donne souvent la photo que le couple accroche au mur.",
          "Derrière cette scène apparemment simple se cachent trois questions concrètes : que le lieu autorise-t-il à lancer, quelles options sont vraiment propres et écologiques, et comment coordonner l'instant pour que le photographe le capte. Un peu d'anticipation transforme une bousculade confuse en une belle séquence maîtrisée.",
        ],
      },
      {
        type: "list",
        title: "Les options, du plus classique au plus original",
        items: [
          "Les pétales de fleurs séchées, l'option la plus photogénique et la plus douce, qui retombe lentement et se voit magnifiquement à contre-jour",
          "Les bulles de savon, ludiques et sans aucun déchet à ramasser, parfaites en fin de journée quand la lumière est basse",
          "Les confettis biodégradables (papier de riz, pétales), à condition qu'ils soient bien compostables et non plastiques",
          "Les rubans ou baguettes à agiter, sans rien à jeter, souvent la seule option acceptée en intérieur",
          "Le riz et le blé, traditionnels mais de plus en plus refusés par les lieux, car glissants et longs à nettoyer",
        ],
      },
      {
        type: "text",
        title: "Ce que les lieux autorisent (à vérifier avant tout)",
        paragraphs: [
          "C'est la première chose à trancher, car elle conditionne tout le reste. De nombreux lieux, mairies et parvis d'église interdisent aujourd'hui le riz et les confettis en plastique ou en papier, pour des raisons de nettoyage et de sécurité (le riz rend le sol glissant). Certains n'acceptent plus que les pétales naturels, d'autres imposent les bulles ou les rubans en intérieur.",
          "Posez la question noir sur blanc au lieu et à l'officiant avant d'acheter quoi que ce soit. La réponse varie énormément d'un endroit à l'autre, et découvrir une interdiction le jour même, sacs de confettis à la main, gâche l'effet. Un lieu qui autorise les pétales dans le jardin peut très bien les refuser sous un préau en pierre.",
        ],
      },
      {
        type: "text",
        title: "Les options écologiques et propres",
        paragraphs: [
          "La tendance va nettement vers les matières naturelles. Les pétales de fleurs séchées sont la référence : 100 pour cent biodégradables, ils ne posent aucun problème si quelques-uns échappent au ramassage. La lavande et les herbes séchées offrent en prime un parfum agréable et une jolie couleur, idéales en extérieur.",
          "Les bulles de savon sont l'option zéro déchet par excellence, sans rien à nettoyer. Méfiez-vous en revanche des confettis vendus comme biodégradables sans l'être vraiment : vérifiez qu'ils sont compostables et sans paillettes plastiques. Le bon réflexe est simple : si ça ne se décompose pas tout seul dans l'herbe, le lieu le refusera probablement, et à raison.",
        ],
      },
      {
        type: "text",
        title: "Coordonner l'instant avec le photographe",
        paragraphs: [
          "Une belle photo de sortie ne s'improvise pas tout à fait. Le photographe a besoin de se placer face aux mariés, souvent en bout de haie, pour les cadrer avançant vers lui pendant que les pétales volent. Prévenez-le du moment prévu et laissez-lui quelques secondes pour se positionner avant de donner le signal aux invités.",
          "Distribuez de quoi lancer juste avant la sortie, expliquez d'un mot le timing (on attend le signal, on lance quand les mariés avancent), et demandez aux invités de viser vers le haut plutôt qu'au visage. Un lancer un peu retardé, au moment où le couple est en pleine lumière et regarde l'objectif, donne toujours une meilleure image qu'une salve tirée trop tôt.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Trois questions suffisent à réussir la sortie : le lieu autorise-t-il ce que vous voulez lancer, est-ce vraiment biodégradable, et le photographe est-il en place au bon moment. Le reste, la joie et le mouvement, vient tout seul.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "La haie de sortie est l'un des rares moments vraiment chorégraphiés de la cérémonie : notre guide [choisir son photographe](/blog/choisir-photographe-mariage) aide à trouver quelqu'un qui saura le capter. Si vous composez une cérémonie laïque, cette sortie s'intègre naturellement à votre déroulé, comme le montrent nos [idées de rituels de cérémonie laïque](/blog/rituels-ceremonie-laique-idees). Et pour une sortie en extérieur, gardez en tête le [plan B météo](/blog/mariage-plein-air-plan-b-meteo), car pétales et bulles n'aiment ni la pluie ni le grand vent.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The moment the couple walk back out, just married, through a shower of petals and a line of clapping guests, is one of the most anticipated images of the day. It's joyful, spontaneous, and it's often the photo the couple hangs on the wall.",
          "Behind this seemingly simple scene hide three concrete questions: what the venue allows you to throw, which options are genuinely clean and eco-friendly, and how to coordinate the moment so the photographer catches it. A little planning turns a confused scramble into a well-managed sequence.",
        ],
      },
      {
        type: "list",
        title: "The options, from most classic to most original",
        items: [
          "Dried flower petals, the most photogenic and gentle option, which falls slowly and looks wonderful backlit",
          "Soap bubbles, playful and with no waste to pick up, perfect late in the day when the light is low",
          "Biodegradable confetti (rice paper, petals), provided it's genuinely compostable and not plastic",
          "Ribbon wands to wave, with nothing to throw away, often the only option allowed indoors",
          "Rice and wheat, traditional but increasingly refused by venues, since they're slippery and slow to clean",
        ],
      },
      {
        type: "text",
        title: "What venues allow (check before anything else)",
        paragraphs: [
          "This is the first thing to settle, because it drives everything else. Many venues, town halls, and church forecourts now ban rice and plastic or paper confetti, for cleaning and safety reasons (rice makes the ground slippery). Some accept only natural petals, others require bubbles or ribbons indoors.",
          "Ask the venue and the officiant in writing before buying anything. The answer varies enormously from one place to another, and discovering a ban on the day, confetti bags in hand, spoils the effect. A venue that allows petals in the garden may well refuse them under a stone porch.",
        ],
      },
      {
        type: "text",
        title: "The eco-friendly, clean options",
        paragraphs: [
          "The trend clearly favors natural materials. Dried flower petals are the benchmark: 100 percent biodegradable, they pose no problem if a few escape the cleanup. Lavender and dried herbs add a pleasant scent and a lovely color, ideal outdoors.",
          "Soap bubbles are the zero-waste option par excellence, with nothing to clean. Be wary, though, of confetti sold as biodegradable without truly being so: check that it's compostable and free of plastic glitter. The simple rule of thumb: if it won't break down on its own in the grass, the venue will probably refuse it, and rightly so.",
        ],
      },
      {
        type: "text",
        title: "Coordinating the moment with the photographer",
        paragraphs: [
          "A great exit photo isn't entirely improvised. The photographer needs to stand facing the couple, often at the end of the line, to frame them walking toward the lens as the petals fly. Warn them of the planned moment and give them a few seconds to get into position before you signal the guests.",
          "Hand out the throwing material just before the exit, explain the timing in a word (wait for the signal, throw as the couple move forward), and ask guests to aim upward rather than at faces. A slightly delayed throw, when the couple are in full light and looking at the lens, always makes a better image than a volley fired too soon.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Three questions are enough to nail the exit: does the venue allow what you want to throw, is it genuinely biodegradable, and is the photographer in place at the right moment. The rest, the joy and the movement, comes on its own.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "The send-off line is one of the ceremony's few truly choreographed moments: our guide to [choosing your photographer](/blog/choisir-photographe-mariage) helps you find someone who'll catch it. If you're building a secular ceremony, this exit fits naturally into your running order, as our [secular ceremony ritual ideas](/blog/rituels-ceremonie-laique-idees) show. And for an outdoor send-off, keep the [weather plan B](/blog/mariage-plein-air-plan-b-meteo) in mind, since petals and bubbles like neither rain nor strong wind.",
        ],
      },
    ],
  }),

  postPair({
    slug: "accueil-invites-etrangers-mariage",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Accueillir les invités venus de loin et de l'étranger",
    titleEn: "Welcoming out-of-town and foreign guests",
    excerptFr:
      "Un mot d'accueil avec les infos pratiques, un coup de main pour la langue, un welcome bag et des arrivées bien regroupées : comment recevoir les invités venus de loin pour qu'ils se sentent attendus, pas perdus.",
    excerptEn:
      "A welcome note with the practical info, a hand with the language, a welcome bag, and well-grouped arrivals: how to receive far-flung guests so they feel expected, not lost.",
    readingMinutes: 7,
    heroAltFr: "Welcome bag et mot d'accueil préparés pour des invités venus de loin",
    heroAltEn: "Welcome bag and note prepared for guests traveling from afar",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Quand une partie de vos invités traverse le pays, ou vient de l'étranger, leur expérience du mariage ne commence pas à la cérémonie : elle commence à l'aéroport, à la gare ou au bout de plusieurs heures de route, dans un endroit qu'ils ne connaissent pas. Un peu d'attention à ce moment-là change tout leur séjour.",
          "Bien accueillir ces invités, ce n'est pas leur trouver un lit, c'est autre chose : c'est leur donner les repères pour se déplacer, comprendre le programme et se sentir attendus. Quelques gestes simples, préparés à l'avance, évitent qu'ils passent leur week-end à courir après une information ou à ne comprendre personne.",
        ],
      },
      {
        type: "list",
        title: "Le mot d'accueil et ses infos pratiques",
        items: [
          "Les horaires clés du week-end, du pot d'accueil au brunch, pour que personne ne devine le programme au dernier moment",
          "Les moyens de transport : comment rejoindre le lieu depuis la gare ou l'aéroport, les navettes prévues, les taxis locaux, le stationnement",
          "Le code vestimentaire, expliqué clairement, car une tenue qui va de soi pour vous ne l'est pas pour quelqu'un d'une autre culture",
          "Un ou deux contacts sur place à appeler en cas de pépin, plutôt que de déranger les mariés le jour J",
        ],
      },
      {
        type: "text",
        title: "Aider sur la langue, sans en faire trop",
        paragraphs: [
          "Pour des invités étrangers, la barrière de la langue est le premier facteur d'isolement. Traduire les documents essentiels (programme, mot d'accueil, menu) dans leur langue, même de façon simple, leur épargne beaucoup de devinettes. Le jour J, un déroulé bilingue ou quelques mots de l'officiant dans leur langue les incluent vraiment dans le moment.",
          "Pensez aussi au placement à table : mettre à côté d'un invité étranger quelqu'un qui parle sa langue, ou au moins l'anglais, transforme un dîner potentiellement solitaire en une belle rencontre. Pas besoin d'en faire trop, juste d'éviter qu'une personne reste coupée des conversations toute la soirée.",
        ],
      },
      {
        type: "text",
        title: "Le welcome bag, un geste qui compte",
        paragraphs: [
          "Un petit sac d'accueil déposé à l'hôtel ou remis à l'arrivée fait toujours son effet, surtout pour ceux qui ont fait un long voyage. Il n'a pas besoin d'être coûteux : une bouteille d'eau, un en-cas, quelques spécialités locales, un plan du coin et le programme du week-end suffisent à dire bienvenue et à donner tout de suite les repères utiles.",
          "L'intérêt du welcome bag n'est pas le cadeau en soi, c'est le message : nous savons que vous venez de loin et nous y avons pensé. Pour des invités étrangers, y glisser quelques mots d'explication sur les usages locaux, ou une petite carte des lieux, ajoute une vraie valeur pratique au-delà de l'attention.",
        ],
      },
      {
        type: "list",
        title: "Regrouper les arrivées et les hébergements",
        items: [
          "Loger les invités venus de loin dans un ou deux hébergements proches, plutôt que dispersés, pour qu'ils fassent groupe et s'entraident",
          "Regrouper les arrivées par créneau afin de mutualiser les navettes ou les trajets depuis la gare et l'aéroport",
          "Constituer un petit groupe de discussion pour les invités éloignés, où ils peuvent s'organiser à plusieurs et poser leurs questions",
          "Désigner un référent local par groupe, souvent un proche du coin, capable de guider et de rassurer à l'arrivée",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Un invité venu de loin ne demande pas un traitement de faveur, juste de ne pas se sentir perdu. Des infos claires, un coup de main sur la langue et des arrivées regroupées suffisent à transformer un déplacement compliqué en un beau souvenir.",
        ],
      },
      {
        type: "text",
        title: "Anticiper leurs questions avant qu'ils ne les posent",
        paragraphs: [
          "Les invités lointains ont tous les mêmes interrogations : où dormir, comment venir, quoi porter, à quelle heure, qui appeler. Y répondre une fois pour toutes, au même endroit, vous épargne de répéter cinquante fois la même chose et leur épargne l'angoisse de déranger. Une page centrale, tenue à jour, vaut mieux que des dizaines de messages éparpillés.",
          "Le fil rouge est simple : plus vous anticipez, moins ils improvisent. Un invité qui sait exactement comment se passe son week-end arrive détendu et pleinement disponible pour la fête, ce qui est précisément ce que vous voulez pour les gens qui ont fait le plus d'efforts pour être là.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Le logement des invités lointains se prépare tôt : voir [l'hébergement des invités](/blog/hebergement-invites-mariage). Le welcome bag mérite son propre soin, détaillé dans [welcome bag et cadeaux d'invités](/blog/welcome-bag-cadeaux-invites). Pour rassembler horaires, transport et code vestimentaire au même endroit, rien ne vaut une [page web de mariage](/blog/creer-page-web-mariage), et pour couper court aux questions récurrentes, notre [FAQ en 15 questions pour les invités](/blog/faq-mariage-invites-15-questions).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "When some of your guests cross the country, or come from abroad, their experience of the wedding doesn't start at the ceremony: it starts at the airport, the station, or after several hours on the road, in a place they don't know. A little care at that moment shapes their whole trip.",
          "Welcoming these guests isn't about finding them a bed, it's something else: it's giving them the bearings to get around, understand the program, and feel expected. A few simple gestures, prepared ahead, keep them from spending their weekend chasing a piece of information or understanding no one.",
        ],
      },
      {
        type: "list",
        title: "The welcome note and its practical info",
        items: [
          "The weekend's key times, from the welcome drinks to the brunch, so no one has to guess the program at the last minute",
          "How to travel: reaching the venue from the station or airport, the planned shuttles, local taxis, parking",
          "The dress code, clearly explained, because an outfit that's obvious to you isn't to someone from another culture",
          "One or two on-site contacts to call if something goes wrong, rather than bothering the couple on the day",
        ],
      },
      {
        type: "text",
        title: "Helping with the language, without overdoing it",
        paragraphs: [
          "For foreign guests, the language barrier is the first source of isolation. Translating the essential documents (program, welcome note, menu) into their language, even simply, spares them a lot of guesswork. On the day, a bilingual running order or a few words from the officiant in their language truly includes them in the moment.",
          "Think about the seating too: placing next to a foreign guest someone who speaks their language, or at least English, turns a potentially lonely dinner into a lovely encounter. No need to overdo it, just to keep one person from being cut off from the conversations all evening.",
        ],
      },
      {
        type: "text",
        title: "The welcome bag, a gesture that counts",
        paragraphs: [
          "A small welcome bag left at the hotel or handed over on arrival always lands well, especially for those who've traveled far. It needn't be expensive: a bottle of water, a snack, a few local specialties, a map of the area, and the weekend program are enough to say welcome and hand over the useful bearings right away.",
          "The point of the welcome bag isn't the gift itself, it's the message: we know you've come a long way and we've thought of you. For foreign guests, slipping in a few words about local customs, or a small map, adds real practical value beyond the gesture.",
        ],
      },
      {
        type: "list",
        title: "Grouping arrivals and accommodation",
        items: [
          "Lodge far-flung guests in one or two nearby places, rather than scattered, so they form a group and help one another",
          "Group arrivals by time slot to pool shuttles or trips from the station and airport",
          "Set up a small group chat for distant guests, where they can organize together and ask their questions",
          "Appoint a local point of contact per group, often a relative from the area, able to guide and reassure on arrival",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "A guest from afar doesn't ask for special treatment, just not to feel lost. Clear information, a hand with the language, and grouped arrivals are enough to turn a complicated trip into a fine memory.",
        ],
      },
      {
        type: "text",
        title: "Anticipating their questions before they ask",
        paragraphs: [
          "Distant guests all have the same questions: where to sleep, how to get there, what to wear, at what time, who to call. Answering them once and for all, in one place, spares you repeating the same thing fifty times and spares them the worry of intruding. A central page, kept up to date, beats dozens of scattered messages.",
          "The thread is simple: the more you anticipate, the less they improvise. A guest who knows exactly how their weekend unfolds arrives relaxed and fully available for the party, which is precisely what you want for the people who made the most effort to be there.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Lodging distant guests is planned early: see [guest accommodation](/blog/hebergement-invites-mariage). The welcome bag deserves its own care, covered in [welcome bags and guest gifts](/blog/welcome-bag-cadeaux-invites). To gather times, transport, and dress code in one place, nothing beats a [wedding web page](/blog/creer-page-web-mariage), and to head off recurring questions, our [15-question guest FAQ](/blog/faq-mariage-invites-15-questions).",
        ],
      },
    ],
  }),

  postPair({
    slug: "discours-parents-mariage",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Le discours des parents : court, chaleureux et bien placé",
    titleEn: "The parents' speech: short, warm, and well placed",
    excerptFr:
      "Distinct de celui des mariés et des témoins, le mot des parents a sa place dans la soirée. Qui parle et quand, comment le garder bref et sincère, ce qu'il vaut mieux éviter, et comment ordonner les prises de parole.",
    excerptEn:
      "Distinct from the couple's and the witnesses', the parents' toast has its place in the evening. Who speaks and when, how to keep it short and sincere, what to avoid, and how to order the toasts.",
    readingMinutes: 6,
    heroAltFr: "Parent prononçant un discours ému lors d'un dîner de mariage",
    heroAltEn: "Parent giving a heartfelt speech at a wedding dinner",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le discours des mariés et celui des témoins sont attendus, souvent préparés, parfois redoutés. Celui des parents, lui, passe plus discrètement, alors qu'il touche souvent le plus fort. Voir un père ou une mère prendre la parole pour son enfant qui se marie a une charge d'émotion particulière, précisément parce qu'elle vient de loin.",
          "Ce mot des parents mérite qu'on y pense en amont, pas pour le figer, mais pour lui donner sa place. Qui parle, à quel moment, combien de temps : quelques repères simples évitent le discours qui s'éternise, celui qui gêne, ou le trou dans le programme parce que personne ne savait qui devait prendre le micro.",
        ],
      },
      {
        type: "text",
        title: "Qui prend la parole, traditionnellement",
        paragraphs: [
          "Il n'y a pas de règle stricte, mais un usage souple. Traditionnellement, un parent de chaque côté dit quelques mots, souvent le père, mais de plus en plus les mères, les deux parents ensemble, ou un parent au nom du couple qu'il forme. L'idée est d'avoir une voix par famille, pour équilibrer, sans multiplier les prises de parole au point de lasser.",
          "Rien n'oblige à respecter la coutume à la lettre. Dans les familles recomposées ou éloignées, mieux vaut décider à l'avance, avec les mariés, qui souhaite parler et se sent à l'aise pour le faire. Un parent qui préfère ne pas prendre le micro n'a pas à s'y forcer : la sincérité d'un mot vaut mieux qu'un discours arraché par obligation.",
        ],
      },
      {
        type: "list",
        title: "Garder le discours court et chaleureux",
        items: [
          "Viser deux à trois minutes : au-delà, l'attention retombe et l'émotion se dilue, même avec de belles choses à dire",
          "Choisir une ou deux anecdotes précises plutôt qu'un survol de toute une vie, car un détail concret touche plus qu'un résumé",
          "Parler au couple et pas seulement de son propre enfant, pour accueillir le nouveau membre de la famille",
          "Finir sur un mot simple et positif, un souhait ou un toast, plutôt que sur une longue conclusion qui cherche ses mots",
        ],
      },
      {
        type: "text",
        title: "Ce qu'il vaut mieux éviter",
        paragraphs: [
          "Quelques écueils reviennent souvent. Les anecdotes gênantes sur l'enfance ou les ex, les allusions à l'argent ou aux tensions familiales, les private jokes que personne ne comprend, et le discours-fleuve qui ressort les souvenirs un par un. Ce qui fait sourire en petit comité peut mettre mal à l'aise devant cent personnes.",
          "L'autre piège est l'improvisation totale sous le coup de l'émotion. Un parent ému qui n'a rien préparé part parfois dans tous les sens, ou se retrouve incapable de finir. Quelques notes sur une carte, même sommaires, suffisent à garder le fil et à s'arrêter au bon moment. Préparer un peu n'enlève rien à la sincérité, au contraire.",
        ],
      },
      {
        type: "text",
        title: "Ordonner les prises de parole dans la soirée",
        paragraphs: [
          "Le vrai risque n'est pas un mauvais discours, c'est l'accumulation. Enchaîner les mots des parents, des témoins, des mariés et de quelques invités sans ordre ni limite finit par lasser et casser le rythme du dîner. Décidez à l'avance de la liste, de l'ordre et du moment, et confiez à quelqu'un le soin d'orchestrer les passages.",
          "Un placement courant fait parler les parents en ouverture du dîner ou entre deux plats, avant les discours plus longs des témoins et des mariés. L'essentiel est que chacun sache quand vient son tour, qu'un maître de cérémonie enchaîne les prises de parole avec fluidité, et qu'on garde une durée totale raisonnable pour ne pas empiéter sur la fête.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Le meilleur discours de parent est court, sincère et bien placé dans la soirée. Deux minutes qui parlent au couple valent mieux que dix qui déroulent toute une vie. Et le vrai confort vient d'un ordre des prises de parole décidé à l'avance.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Le mot des parents s'inscrit dans l'ensemble des prises de parole : notre guide [réussir les discours des mariés et des témoins](/blog/discours-maries-temoins-reussir) aide à les coordonner. Pour caler discours et toasts au bon moment sans casser le rythme, voir [le planning du jour J minute par minute](/blog/planning-jour-j-minute-par-minute). Et si vous cherchez à équilibrer les temps d'émotion et les temps de fête, nos [idées d'animations pour la soirée](/blog/animations-soiree-mariage-idees) complètent le tableau.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The couple's speech and the witnesses' are expected, often prepared, sometimes dreaded. The parents' speech passes more quietly, yet it's often the one that lands hardest. Watching a father or mother speak for their child getting married carries a particular emotional weight, precisely because it comes from so far back.",
          "This parents' toast deserves some forethought, not to lock it down, but to give it its place. Who speaks, when, for how long: a few simple markers avoid the speech that drags on, the one that makes people wince, or the gap in the program because no one knew who should take the mic.",
        ],
      },
      {
        type: "text",
        title: "Who traditionally speaks",
        paragraphs: [
          "There's no strict rule, but a flexible custom. Traditionally, one parent from each side says a few words, often the father, but increasingly mothers, both parents together, or one parent on behalf of the pair they form. The idea is to have one voice per family, for balance, without multiplying the toasts to the point of tiring people out.",
          "Nothing requires following custom to the letter. In blended or distant families, it's better to decide ahead, with the couple, who wants to speak and feels comfortable doing so. A parent who'd rather not take the mic needn't force it: the sincerity of a few words beats a speech dragged out of duty.",
        ],
      },
      {
        type: "list",
        title: "Keeping the speech short and warm",
        items: [
          "Aim for two to three minutes: beyond that, attention drops and the emotion dilutes, even with fine things to say",
          "Pick one or two specific anecdotes rather than a sweep through a whole life, because a concrete detail moves people more than a summary",
          "Speak to the couple and not only about your own child, to welcome the new member of the family",
          "End on a simple, positive note, a wish or a toast, rather than a long conclusion fumbling for words",
        ],
      },
      {
        type: "text",
        title: "What's better avoided",
        paragraphs: [
          "A few pitfalls come up often. Awkward childhood or ex-partner anecdotes, allusions to money or family tensions, private jokes no one gets, and the marathon speech that dredges up memories one by one. What raises a smile among close friends can make a hundred people uncomfortable.",
          "The other trap is total improvisation in the grip of emotion. A moved parent who's prepared nothing sometimes wanders in all directions, or finds themselves unable to finish. A few notes on a card, however rough, are enough to keep the thread and stop at the right moment. Preparing a little takes nothing away from sincerity, quite the opposite.",
        ],
      },
      {
        type: "text",
        title: "Ordering the toasts in the evening",
        paragraphs: [
          "The real risk isn't a bad speech, it's the pile-up. Stringing together the parents', witnesses', couple's, and a few guests' words with no order or limit ends up tiring everyone and breaking the dinner's rhythm. Decide the list, the order, and the moment in advance, and put someone in charge of running the slots.",
          "A common arrangement has the parents speak at the start of dinner or between two courses, before the longer speeches from the witnesses and the couple. The key is that everyone knows when their turn comes, that a master of ceremonies flows from one to the next, and that the total stays reasonable so it doesn't eat into the party.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "The best parent's speech is short, sincere, and well placed in the evening. Two minutes that speak to the couple beat ten that unwind a whole life. And the real comfort comes from an order of toasts decided in advance.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "The parents' words are part of the whole set of toasts: our guide to [nailing the couple's and witnesses' speeches](/blog/discours-maries-temoins-reussir) helps coordinate them. To time speeches and toasts at the right moment without breaking the rhythm, see [the minute-by-minute wedding-day schedule](/blog/planning-jour-j-minute-par-minute). And if you're balancing the emotional moments with the party ones, our [evening entertainment ideas](/blog/animations-soiree-mariage-idees) round out the picture.",
        ],
      },
    ],
  }),
];

export const { fr: POSTS_233_239_FR, en: POSTS_233_239_EN } = pairsToArrays(pairs);
