import { postPair, pairsToArrays } from "./blog-posts-shared";

const pairs = [
  postPair({
    slug: "mariage-visio-streaming-invites-absents",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Diffuser son mariage en visio pour les invités absents",
    titleEn: "Livestreaming your wedding for guests who can't attend",
    excerptFr:
      "Maladie, distance, salle trop petite : diffuser la cérémonie en direct permet aux absents d'y assister. Quelles options, qui filme, et comment le faire sans exposer toute la fête.",
    excerptEn:
      "Illness, distance, a room too small: streaming the ceremony live lets absent guests take part. Which options, who films, and how to do it without exposing the whole celebration.",
    readingMinutes: 7,
    heroAltFr: "Cérémonie de mariage filmée en direct pour des invités à distance",
    heroAltEn: "Wedding ceremony filmed live for remote guests",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Un grand-parent qui ne peut plus voyager, un proche hospitalisé, une famille à l'autre bout du monde, une salle dont la capacité est atteinte : il y a mille raisons pour lesquelles une personne que vous auriez voulu voir ne pourra pas être là. Diffuser la cérémonie en direct permet à ces absents d'y assister quand même, en temps réel.",
          "L'idée n'est pas de remplacer la présence physique, mais d'ouvrir une petite fenêtre pour ceux qui, sinon, seraient totalement coupés du moment. Bien pensée, la visio se règle en amont et ne pèse rien le jour J.",
        ],
      },
      {
        type: "list",
        title: "Les options techniques, de la plus simple à la plus aboutie",
        items: [
          "Un simple appel vidéo (visioconférence classique) depuis un téléphone posé sur un trépied, gratuit et immédiat, mais dépendant du réseau et de la batterie",
          "Un lien de diffusion en direct via une plateforme vidéo, en mode non répertorié ou privé, que vous envoyez seulement aux personnes concernées",
          "Une captation confiée à votre vidéaste, qui gère alors le cadrage, le son et la stabilité comme pour une prestation classique",
          "Une solution mixte : diffusion en direct de la seule cérémonie, puis partage de la vidéo enregistrée à ceux qui l'ont manquée",
        ],
      },
      {
        type: "text",
        title: "Le point faible, c'est toujours le son et le réseau",
        paragraphs: [
          "L'image passe presque toujours ; c'est le son et la connexion qui trahissent. Une cérémonie filmée de loin avec le micro du téléphone donne un son lointain et couvert par le vent ou la foule. Si le moment compte vraiment pour l'absent, un micro d'appoint (micro-cravate sur l'officiant, petit enregistreur près des mariés) change tout.",
          "Vérifiez aussi la couverture réseau du lieu, souvent médiocre en pleine campagne ou dans une église en pierre. Un test depuis l'endroit exact, à l'avance, évite la mauvaise surprise. Prévoyez une batterie externe : une diffusion en direct vide un téléphone en une heure.",
        ],
      },
      {
        type: "text",
        title: "Qui s'en occupe le jour J",
        paragraphs: [
          "Ne confiez jamais la diffusion à un invité qui voudra aussi profiter de la cérémonie : il oubliera de lancer le direct ou lâchera le téléphone au premier moment d'émotion. Désignez une personne dédiée, dont c'est la seule mission pendant la cérémonie, ou intégrez la captation à la prestation de votre vidéaste.",
          "Cette personne prépare le lien à l'avance, le teste la veille, et sait qui prévenir côté absents pour qu'ils se connectent au bon moment. Un simple créneau horaire communiqué en amont suffit à éviter que quelqu'un rate le début.",
        ],
      },
      {
        type: "list",
        title: "Respecter la vie privée de tout le monde",
        items: [
          "Diffuser la cérémonie seulement, pas la soirée : le direct s'arrête après les échanges de consentement, quand la fête privée commence",
          "Utiliser un lien privé ou non répertorié, jamais une diffusion publique ouverte à tous",
          "Prévenir les invités présents qu'une caméra diffuse en direct, par un mot sur le programme ou une annonce de l'officiant",
          "Supprimer ou restreindre l'enregistrement après coup si certains proches ne souhaitent pas rester en ligne indéfiniment",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Une visio réussie tient à trois choses testées la veille : le son, le réseau et la batterie. Le reste (le cadrage parfait, le montage) est un bonus, pas une condition.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Le lien de diffusion se communique naturellement via votre [page web de mariage](/blog/creer-page-web-mariage), au même endroit que les infos pratiques. Pour les photos et vidéos partagées après coup, un [album partagé par QR code](/blog/partage-photos-mariage-qr-code) reste plus discret qu'une diffusion publique. Et si vous préférez que les invités présents rangent leur téléphone, notre guide [la cérémonie sans téléphone](/blog/ceremonie-sans-telephone-unplugged) montre comment concilier les deux.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A grandparent who can no longer travel, a loved one in hospital, family on the other side of the world, a room that has hit capacity: there are a thousand reasons why someone you wanted there won't be able to come. Streaming the ceremony live lets those absent take part anyway, in real time.",
          "The idea isn't to replace being there in person, but to open a small window for those who would otherwise be completely cut off from the moment. Done well, the stream is set up ahead of time and costs nothing on the day.",
        ],
      },
      {
        type: "list",
        title: "The technical options, from simplest to most polished",
        items: [
          "A plain video call from a phone on a tripod, free and instant, but dependent on the network and the battery",
          "A live-stream link via a video platform, set to unlisted or private, sent only to the people concerned",
          "A capture handled by your videographer, who then manages framing, sound, and stability as with any service",
          "A mixed setup: a live stream of the ceremony only, then the recorded video shared with those who missed it",
        ],
      },
      {
        type: "text",
        title: "The weak point is always sound and network",
        paragraphs: [
          "The picture almost always gets through; it's the sound and the connection that let you down. A ceremony filmed from afar on a phone mic gives distant audio drowned out by wind or the crowd. If the moment truly matters to the absent guest, an extra mic (a lapel mic on the officiant, a small recorder near the couple) changes everything.",
          "Also check the venue's network coverage, often poor deep in the countryside or inside a stone church. A test from the exact spot, in advance, avoids a nasty surprise. Bring a power bank: a live stream drains a phone in an hour.",
        ],
      },
      {
        type: "text",
        title: "Who handles it on the day",
        paragraphs: [
          "Never hand the stream to a guest who also wants to enjoy the ceremony: they'll forget to start the broadcast or drop the phone at the first emotional moment. Assign a dedicated person whose only task during the ceremony is this, or fold the capture into your videographer's service.",
          "That person prepares the link ahead, tests it the day before, and knows who to notify among the absent so they connect at the right time. A simple time slot shared in advance is enough to keep anyone from missing the start.",
        ],
      },
      {
        type: "list",
        title: "Respecting everyone's privacy",
        items: [
          "Stream the ceremony only, not the party: the live feed stops after the exchange of vows, when the private celebration begins",
          "Use a private or unlisted link, never an open public broadcast",
          "Tell the guests present that a camera is streaming live, with a note on the program or an announcement from the officiant",
          "Delete or restrict the recording afterward if some loved ones don't want to stay online indefinitely",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "A good stream comes down to three things tested the day before: sound, network, and battery. The rest (perfect framing, editing) is a bonus, not a requirement.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "The stream link is naturally shared through your [wedding web page](/blog/creer-page-web-mariage), in the same place as the practical info. For photos and videos shared afterward, a [QR-code shared album](/blog/partage-photos-mariage-qr-code) stays more discreet than a public broadcast. And if you'd rather the guests present put their phones away, our guide to [the unplugged ceremony](/blog/ceremonie-sans-telephone-unplugged) shows how to reconcile the two.",
        ],
      },
    ],
  }),

  postPair({
    slug: "hashtag-mariage-reseaux-sociaux",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Hashtag de mariage et réseaux sociaux : cadrer le partage",
    titleEn: "Wedding hashtag and social media: framing the sharing",
    excerptFr:
      "Un hashtag mémorable pour rassembler les photos des invités, ou un album privé par QR code : comment décider ce que vous voulez voir circuler, et ce que vous préférez garder pour vous.",
    excerptEn:
      "A memorable hashtag to gather guests' photos, or a private QR-code album: how to decide what you want circulating, and what you'd rather keep to yourselves.",
    readingMinutes: 6,
    heroAltFr: "Panneau affichant le hashtag de mariage d'un couple",
    heroAltEn: "Sign displaying a couple's wedding hashtag",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le hashtag de mariage a longtemps été le moyen le plus simple de rassembler, en un seul endroit, toutes les photos prises par les invités. Chacun publie avec le même mot-clé, et vous retrouvez la journée vue par cent regards différents. C'est ludique, gratuit, et cela fait participer tout le monde.",
          "Mais les usages changent. Beaucoup de couples veulent aujourd'hui rassembler les photos sans pour autant les voir s'afficher publiquement sur les réseaux. La vraie question n'est donc pas seulement « quel hashtag », mais « qu'est-ce que nous voulons rendre public, et qu'est-ce que nous gardons privé ».",
        ],
      },
      {
        type: "list",
        title: "Créer un hashtag qui fonctionne",
        items: [
          "Le garder court et facile à écrire : un hashtag qu'on doit épeler ne sera jamais utilisé",
          "Le rendre unique en le vérifiant au préalable, pour ne pas mélanger vos photos avec celles d'un autre couple",
          "Jouer sur vos prénoms, la date ou un clin d'œil qui vous ressemble, sans trop de jeux de mots obscurs",
          "L'afficher partout le jour J : sur le programme, un panneau à l'entrée, les marque-places ou un petit carton sur les tables",
        ],
      },
      {
        type: "text",
        title: "L'alternative privée : l'album par QR code",
        paragraphs: [
          "De plus en plus de couples préfèrent un album partagé accessible par un simple QR code. Les invités scannent, déposent leurs photos, et tout arrive au même endroit, sans passer par un réseau social public. Vous récupérez tout, y compris les clichés de ceux qui ne publient jamais rien en ligne.",
          "L'avantage est double : vous centralisez les photos comme avec un hashtag, mais rien n'est exposé publiquement. C'est souvent la meilleure réponse quand vous aimez l'idée du partage collectif sans vouloir que votre mariage circule sur les fils d'actualité.",
        ],
      },
      {
        type: "text",
        title: "Décider ce que vous voulez voir circuler",
        paragraphs: [
          "Prenez cinq minutes, à deux, pour trancher quelques questions simples. Acceptez-vous que les invités publient des photos de vous en temps réel ? Souhaitez-vous que le visage des enfants, ou de certains proches, n'apparaisse pas en ligne ? Préférez-vous découvrir les images vous-mêmes avant qu'elles ne soient partagées ?",
          "Il n'y a pas de bonne réponse universelle, seulement la vôtre. L'essentiel est de la formuler clairement, pour pouvoir la communiquer sans gêne à vos invités.",
        ],
      },
      {
        type: "list",
        title: "Communiquer votre choix sans crisper personne",
        items: [
          "Un mot positif plutôt qu'une interdiction : « partagez vos photos ici » fonctionne mieux que « ne publiez pas »",
          "Si vous souhaitez la discrétion, l'expliquer simplement (vie privée, enfants, envie de vivre le moment) sans vous justifier longuement",
          "Indiquer clairement le canal privilégié : le hashtag, le QR code de l'album, ou les deux",
          "Rappeler la consigne à l'oral au début de la soirée, en plus de l'affichage, pour toucher ceux qui n'ont rien lu",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Hashtag public et album privé ne s'excluent pas : beaucoup de couples proposent le QR code à tous et laissent le hashtag à ceux qui veulent publier. À vous de dire, clairement, ce que vous préférez.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour centraliser les photos sans les exposer, notre guide [partager les photos par QR code](/blog/partage-photos-mariage-qr-code) détaille la solution privée la plus utilisée aujourd'hui. Si vous tenez à ce que la cérémonie reste hors ligne, [la cérémonie sans téléphone](/blog/ceremonie-sans-telephone-unplugged) explique comment demander aux invités de ranger leur appareil. Et pour rassembler toutes ces consignes au même endroit, pensez à votre [page web de mariage](/blog/creer-page-web-mariage).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The wedding hashtag was long the simplest way to gather, in one place, all the photos taken by guests. Everyone posts with the same keyword, and you get the day seen through a hundred different eyes. It's playful, free, and it brings everyone in.",
          "But habits are shifting. Many couples now want to gather the photos without seeing them displayed publicly on social media. So the real question isn't just “which hashtag”, but “what do we want to make public, and what do we keep private”.",
        ],
      },
      {
        type: "list",
        title: "Creating a hashtag that works",
        items: [
          "Keep it short and easy to type: a hashtag people have to spell out will never get used",
          "Make it unique by checking it first, so your photos don't get mixed with another couple's",
          "Play on your first names, the date, or a nod that fits you, without too many obscure puns",
          "Display it everywhere on the day: on the program, a sign at the entrance, the place cards, or a small card on the tables",
        ],
      },
      {
        type: "text",
        title: "The private alternative: the QR-code album",
        paragraphs: [
          "More and more couples prefer a shared album reachable through a simple QR code. Guests scan, drop in their photos, and everything lands in one place, without going through a public social network. You get it all, including the shots from those who never post anything online.",
          "The benefit is twofold: you centralize the photos as with a hashtag, but nothing is publicly exposed. It's often the best answer when you like the idea of collective sharing without wanting your wedding on people's feeds.",
        ],
      },
      {
        type: "text",
        title: "Deciding what you want circulating",
        paragraphs: [
          "Take five minutes, as a couple, to settle a few simple questions. Are you fine with guests posting photos of you in real time? Do you want children's faces, or certain loved ones', kept offline? Would you rather see the images yourselves before they're shared?",
          "There's no universal right answer, only yours. What matters is stating it clearly, so you can pass it on to your guests without awkwardness.",
        ],
      },
      {
        type: "list",
        title: "Communicating your choice without putting anyone off",
        items: [
          "A positive note rather than a ban: “share your photos here” works better than “don't post”",
          "If you want discretion, explain it simply (privacy, children, wanting to live the moment) without a long justification",
          "State the preferred channel clearly: the hashtag, the album's QR code, or both",
          "Repeat the request out loud at the start of the evening, on top of the signage, to reach those who read nothing",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "A public hashtag and a private album aren't mutually exclusive: many couples offer the QR code to everyone and leave the hashtag to those who want to post. It's up to you to say, clearly, what you prefer.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To centralize photos without exposing them, our guide to [sharing photos by QR code](/blog/partage-photos-mariage-qr-code) covers the private solution most used today. If you want the ceremony to stay offline, [the unplugged ceremony](/blog/ceremonie-sans-telephone-unplugged) explains how to ask guests to put their devices away. And to gather all these instructions in one place, think of your [wedding web page](/blog/creer-page-web-mariage).",
        ],
      },
    ],
  }),

  postPair({
    slug: "ceremonie-sans-telephone-unplugged",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "La cérémonie sans téléphone : demander aux invités de le ranger",
    titleEn: "The unplugged ceremony: asking guests to put phones away",
    excerptFr:
      "Une forêt de téléphones tendus gâche les photos et l'instant. Pourquoi de plus en plus de couples choisissent la cérémonie unplugged, et comment le demander gentiment.",
    excerptEn:
      "A forest of raised phones spoils the photos and the moment. Why more and more couples choose an unplugged ceremony, and how to ask for it kindly.",
    readingMinutes: 6,
    heroAltFr: "Invités attentifs pendant une cérémonie sans téléphone",
    heroAltEn: "Attentive guests during an unplugged ceremony",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Vous connaissez l'image : au moment où les mariés remontent l'allée, une rangée de bras se lève, téléphones et tablettes tendus. Sur la photo du photographe, on ne voit plus les visages émus des invités, mais des écrans. C'est ce que la cérémonie « sans téléphone », ou unplugged, cherche à éviter.",
          "Le principe est simple : pendant la cérémonie seulement, on demande aux invités de ranger leur appareil et de vivre le moment. Les photos, elles, sont confiées au professionnel présent pour ça. Ce n'est pas une règle rigide, c'est une invitation à être vraiment là.",
        ],
      },
      {
        type: "list",
        title: "Pourquoi des couples le choisissent",
        items: [
          "Des invités présents et attentifs, plutôt qu'une salle de bras levés et d'écrans allumés",
          "Des photos professionnelles nettes, sans téléphone ni flash parasite au premier plan ni dans l'allée",
          "Un photographe qui travaille librement, sans invité amateur qui se place devant lui au mauvais moment",
          "Le sentiment, pour les mariés, de croiser des regards et des sourires plutôt que des objectifs",
        ],
      },
      {
        type: "text",
        title: "La cérémonie seulement, pas toute la journée",
        paragraphs: [
          "Le malentendu à éviter : la demande ne porte que sur la cérémonie, pas sur toute la fête. Le reste de la journée, les invités photographient et publient comme ils le souhaitent. Le préciser désamorce l'idée d'une interdiction générale, qui passerait mal.",
          "Beaucoup de couples combinent même la cérémonie sans téléphone avec un partage encouragé ensuite : rangez votre appareil pendant l'échange des consentements, puis mitraillez au vin d'honneur et déposez vos photos dans l'album commun. Les deux logiques se complètent très bien.",
        ],
      },
      {
        type: "text",
        title: "Le rôle de l'officiant",
        paragraphs: [
          "L'annonce la plus efficace est orale, faite par l'officiant juste avant que la cérémonie ne commence. Quelques phrases chaleureuses suffisent : les mariés seraient heureux que vous viviez ce moment avec eux, appareils rangés, et qu'un photographe s'occupe des images pour tout le monde.",
          "Dit avec le sourire, ce mot est presque toujours bien reçu. Il touche même ceux qui n'auraient lu aucun panneau, et il donne le ton juste avant l'entrée, au moment où les téléphones sortent d'habitude.",
        ],
      },
      {
        type: "list",
        title: "Communiquer la demande avec douceur",
        items: [
          "Un joli panneau à l'entrée de la cérémonie, avec une formule positive plutôt qu'un pictogramme barré agressif",
          "Un mot sur le programme ou le faire-part, pour que l'idée ne soit pas une surprise le jour même",
          "Une formulation qui explique le pourquoi (vivre l'instant, laisser travailler le photographe), pas seulement le quoi",
          "La promesse explicite de partager de belles photos ensuite, pour rassurer ceux qui craignent de ne rien garder",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Une cérémonie sans téléphone ne s'impose pas, elle s'explique. Dites pourquoi (des photos nettes, des invités présents, de belles images partagées après), et la quasi-totalité des invités jouent le jeu de bon cœur.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "L'unplugged n'a de sens que si un professionnel prend le relais : voir notre guide [choisir son photographe de mariage](/blog/choisir-photographe-mariage). Pour rassurer les invités sur le fait qu'ils auront des images, proposez un [album partagé par QR code](/blog/partage-photos-mariage-qr-code) après la cérémonie. Et si vous voulez encadrer plus largement le partage en ligne, notre article [hashtag et réseaux sociaux](/blog/hashtag-mariage-reseaux-sociaux) complète la réflexion.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "You know the image: just as the couple walk back down the aisle, a row of arms goes up, phones and tablets held out. In the photographer's shot, you no longer see the guests' moved faces, but screens. That's what the unplugged ceremony sets out to avoid.",
          "The principle is simple: during the ceremony only, guests are asked to put their device away and live the moment. The photos are entrusted to the professional there for exactly that. It isn't a rigid rule, it's an invitation to really be present.",
        ],
      },
      {
        type: "list",
        title: "Why couples choose it",
        items: [
          "Guests present and attentive, rather than a room of raised arms and lit screens",
          "Sharp professional photos, with no phone or stray flash in the foreground or the aisle",
          "A photographer free to work, without an amateur stepping in front of them at the wrong moment",
          "The feeling, for the couple, of meeting eyes and smiles rather than lenses",
        ],
      },
      {
        type: "text",
        title: "The ceremony only, not the whole day",
        paragraphs: [
          "The misunderstanding to avoid: the request covers the ceremony only, not the whole party. For the rest of the day, guests photograph and post as they wish. Making that clear defuses the idea of a blanket ban, which would land badly.",
          "Many couples even pair the unplugged ceremony with encouraged sharing afterward: put your device away during the vows, then snap away at the cocktail hour and drop your photos into the shared album. The two logics complement each other very well.",
        ],
      },
      {
        type: "text",
        title: "The officiant's role",
        paragraphs: [
          "The most effective announcement is spoken, made by the officiant just before the ceremony begins. A few warm sentences are enough: the couple would love you to live this moment with them, devices away, while a photographer handles the images for everyone.",
          "Said with a smile, that note is almost always well received. It even reaches those who wouldn't have read any sign, and it sets the tone right before the entrance, at the moment phones usually come out.",
        ],
      },
      {
        type: "list",
        title: "Communicating the request gently",
        items: [
          "A nice sign at the ceremony entrance, with a positive wording rather than an aggressive crossed-out icon",
          "A note on the program or the invitation, so the idea isn't a surprise on the day",
          "A wording that explains the why (living the moment, letting the photographer work), not just the what",
          "An explicit promise to share lovely photos afterward, to reassure those afraid of keeping nothing",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "An unplugged ceremony isn't imposed, it's explained. Say why (sharp photos, present guests, lovely images shared after), and nearly all guests happily play along.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Unplugged only makes sense if a professional takes over: see our guide to [choosing your wedding photographer](/blog/choisir-photographe-mariage). To reassure guests that they'll get images, offer a [QR-code shared album](/blog/partage-photos-mariage-qr-code) after the ceremony. And if you want to frame online sharing more broadly, our article on [the hashtag and social media](/blog/hashtag-mariage-reseaux-sociaux) rounds out the thinking.",
        ],
      },
    ],
  }),

  postPair({
    slug: "doute-prenuptial-cold-feet",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Les doutes d'avant mariage : trac normal ou vrai signal ?",
    titleEn: "Pre-wedding doubts: ordinary nerves or a real signal?",
    excerptFr:
      "Presque tout le monde ressent un pincement avant de se marier. Comment faire la part entre le trac ordinaire et un doute plus profond, et pourquoi la pression des préparatifs brouille parfois les pistes.",
    excerptEn:
      "Almost everyone feels a twinge before marrying. How to tell ordinary nerves from a deeper doubt, and why the pressure of planning sometimes clouds the picture.",
    readingMinutes: 7,
    heroAltFr: "Future mariée pensive à sa fenêtre avant le mariage",
    heroAltEn: "Pensive bride-to-be at her window before the wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Ressentir un pincement à l'approche du mariage n'a rien d'anormal. S'engager pour la vie devant sa famille est une décision immense, et l'esprit humain a tendance à faire tourner les grandes décisions en boucle. La plupart des futurs mariés connaissent, à un moment, une nuit d'insomnie ou une bouffée de « et si je me trompais ».",
          "Cet article n'a pas vocation à poser un diagnostic. Il propose seulement quelques repères pour faire la part des choses, avec douceur, entre le trac ordinaire et un doute qui mérite qu'on s'y attarde vraiment.",
        ],
      },
      {
        type: "text",
        title: "Le trac ordinaire, celui de presque tout le monde",
        paragraphs: [
          "Le trac classique porte sur l'événement plus que sur la relation : la peur de pleurer devant tout le monde, de trébucher sur ses mots, que la journée ne soit pas à la hauteur des attentes. Il monte souvent dans les dernières semaines et redescend une fois le jour J passé.",
          "Ce trac-là coexiste sans problème avec la certitude d'aimer la personne. On peut être terrifié à l'idée du discours et parfaitement sûr de vouloir dire oui. C'est le cas le plus fréquent, et il ne demande rien d'autre qu'un peu de repos et de recul.",
        ],
      },
      {
        type: "list",
        title: "Ce qui distingue un doute plus profond",
        items: [
          "Le doute porte sur la relation elle-même, pas seulement sur la fête ou sur le regard des autres",
          "Il persiste dans le temps et revient dans les moments calmes, pas seulement sous la pression des préparatifs",
          "Il s'accompagne de sujets de fond jamais vraiment abordés à deux (argent, enfants, projets de vie, respect)",
          "Il s'aggrave quand vous êtes ensemble et s'apaise quand vous êtes séparés, plutôt que l'inverse",
        ],
      },
      {
        type: "text",
        title: "Quand la pression des préparatifs brouille tout",
        paragraphs: [
          "Attention à un piège fréquent : confondre l'épuisement de l'organisation avec un doute sur le couple. Des mois de décisions, de budget tendu et de désaccords familiaux usent, et cette fatigue peut prendre le masque d'une remise en question de la relation. Ce n'est pas le couple qui vacille, c'est le projet qui pèse trop lourd.",
          "Un bon test consiste à s'imaginer, non pas sans le mariage, mais sans la personne. Si l'idée du mariage vous angoisse mais que celle de perdre votre partenaire vous serre le cœur, le problème est probablement du côté de la charge, pas du lien.",
        ],
      },
      {
        type: "text",
        title: "En parler, plutôt que de ruminer seul",
        paragraphs: [
          "Le pire réflexe est de garder un doute pour soi jusqu'au dernier moment, par peur de le rendre réel en le disant. Or, mis en mots, un doute perd souvent de sa puissance. En parler à votre partenaire, si le sujet le permet, ou à une personne de confiance qui ne prendra pas parti, aide déjà énormément.",
          "Si le doute persiste, revient sans cesse et touche vraiment le fond de la relation, il n'y a aucune honte à en parler à un professionnel (thérapeute de couple, conseiller conjugal). Consulter n'est pas un aveu d'échec : c'est se donner les moyens de partir sur des bases claires, quelle que soit la décision.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Douter n'est pas trahir. C'est souvent le signe qu'on prend la décision au sérieux. Ce qui compte, c'est de ne pas rester seul avec la question : parlez-en, à deux ou à une personne de confiance.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Quand le doute vient surtout de la fatigue d'organisation, notre guide [gérer le stress des préparatifs](/blog/gerer-stress-mariage-serenite) aide à alléger la charge avant qu'elle ne déborde. Si les tensions naissent de désaccords précis entre vous, [gérer les désaccords pendant les préparatifs](/blog/desaccords-couple-preparatifs) propose une méthode pour en parler. Et pour la fameuse nuit d'avant, souvent la plus chargée en émotions, voir [la veille et la nuit avant le mariage](/blog/nuit-avant-mariage-preparation).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Feeling a twinge as the wedding approaches is nothing abnormal. Committing for life in front of your family is a huge decision, and the human mind tends to run big choices on a loop. Most couples-to-be go through, at some point, a sleepless night or a wave of “what if I'm making a mistake”.",
          "This article isn't meant to make a diagnosis. It only offers a few markers to gently tell things apart, between ordinary nerves and a doubt that deserves real attention.",
        ],
      },
      {
        type: "text",
        title: "Ordinary nerves, the kind almost everyone has",
        paragraphs: [
          "Classic nerves are about the event more than the relationship: the fear of crying in front of everyone, stumbling over your words, the day not living up to expectations. They often rise in the final weeks and ease once the day has passed.",
          "That kind of nerves sits comfortably alongside the certainty of loving the person. You can be terrified of the speech and perfectly sure you want to say yes. It's the most common case, and it asks for nothing more than some rest and perspective.",
        ],
      },
      {
        type: "list",
        title: "What sets a deeper doubt apart",
        items: [
          "The doubt is about the relationship itself, not just the party or what others will think",
          "It persists over time and returns in quiet moments, not only under planning pressure",
          "It comes with core issues never truly discussed together (money, children, life plans, respect)",
          "It worsens when you're together and eases when you're apart, rather than the other way around",
        ],
      },
      {
        type: "text",
        title: "When planning pressure clouds everything",
        paragraphs: [
          "Watch out for a common trap: mistaking the exhaustion of organizing for a doubt about the couple. Months of decisions, a tight budget, and family disagreements wear you down, and that fatigue can wear the mask of questioning the relationship. It isn't the couple wavering, it's the project weighing too heavily.",
          "A good test is to imagine yourself not without the wedding, but without the person. If the idea of the wedding makes you anxious but the thought of losing your partner grips your heart, the problem is probably on the load's side, not the bond's.",
        ],
      },
      {
        type: "text",
        title: "Talking about it, rather than brooding alone",
        paragraphs: [
          "The worst reflex is keeping a doubt to yourself until the last moment, for fear of making it real by saying it. Yet, put into words, a doubt often loses its power. Talking to your partner, if the subject allows, or to a trusted person who won't take sides, already helps enormously.",
          "If the doubt persists, keeps coming back, and truly touches the heart of the relationship, there's no shame in speaking to a professional (a couples therapist, a marriage counselor). Seeking help isn't an admission of failure: it's giving yourselves the means to start on clear ground, whatever the decision.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Doubting isn't betraying. It's often the sign that you're taking the decision seriously. What matters is not staying alone with the question: talk about it, together or with a trusted person.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "When the doubt comes mainly from planning fatigue, our guide to [managing wedding planning stress](/blog/gerer-stress-mariage-serenite) helps lighten the load before it spills over. If the tension arises from specific disagreements between you, [handling disagreements during planning](/blog/desaccords-couple-preparatifs) offers a method for talking it through. And for the famous night before, often the most emotionally charged, see [the night before the wedding](/blog/nuit-avant-mariage-preparation).",
        ],
      },
    ],
  }),

  postPair({
    slug: "desaccords-couple-preparatifs",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Les désaccords de couple pendant les préparatifs : décider ensemble",
    titleEn: "Couple disagreements during planning: deciding together",
    excerptFr:
      "Budget, liste d'invités, pression des familles : les préparatifs révèlent des désaccords. Une méthode pour trancher à deux, distinguer une préférence d'un point non négociable, et protéger la relation du projet.",
    excerptEn:
      "Budget, guest list, family pressure: planning brings out disagreements. A method to decide together, tell a preference from a dealbreaker, and protect the relationship from the project.",
    readingMinutes: 7,
    heroAltFr: "Couple discutant des choix de mariage autour d'une table",
    heroAltEn: "Couple discussing wedding choices at a table",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Organiser un mariage, c'est prendre des dizaines de décisions en quelques mois, souvent avec de l'argent, des familles et des attentes en jeu. Il serait étonnant qu'un couple traverse cela sans le moindre désaccord. Les frictions ne sont pas un mauvais signe : elles font partie de tout projet mené à deux.",
          "Ce qui compte, ce n'est pas d'éviter les désaccords, mais la manière de les traiter. Une méthode simple, posée à l'avance, évite que chaque choix ne se transforme en bras de fer et que le projet finisse par abîmer la relation qu'il est censé célébrer.",
        ],
      },
      {
        type: "text",
        title: "Séparer une préférence d'un point non négociable",
        paragraphs: [
          "Le premier réflexe utile est de classer chaque sujet. Une préférence, c'est quelque chose que vous aimeriez mais que vous pouvez lâcher sans amertume (la couleur des fleurs, le choix du dessert). Un point non négociable, c'est un sujet qui touche à vos valeurs ou à votre confort profond (la présence de telle personne, un budget à ne pas dépasser).",
          "La plupart des tensions viennent d'un malentendu sur cette échelle : on défend une simple préférence comme si c'était un principe. Se dire clairement, chacun, ce qui est essentiel et ce qui est secondaire désamorce déjà une grande partie des conflits.",
        ],
      },
      {
        type: "list",
        title: "Une méthode pour trancher à deux",
        items: [
          "Nommer le désaccord précisément, sans généraliser (« ce poste de budget », pas « tu dépenses toujours trop »)",
          "Chacun explique le pourquoi derrière sa position, pas seulement le quoi : c'est souvent là que se trouve la vraie clé",
          "Chercher d'abord une troisième option qui satisfait les deux, plutôt que de choisir entre les deux départ",
          "Sur les points secondaires, s'accorder le droit de se répartir les décisions : chacun tranche seul sur son domaine",
        ],
      },
      {
        type: "text",
        title: "La pression des familles, un désaccord déguisé",
        paragraphs: [
          "Beaucoup de disputes de préparatifs ne sont pas vraiment entre vous deux : elles opposent, à travers vous, deux familles aux attentes différentes. Un conjoint relaie la demande de ses parents, l'autre celle des siens, et le couple se retrouve à porter un conflit qui n'est pas le sien.",
          "La parade est de faire front commun. Décidez d'abord à deux, en privé, ce que vous voulez vraiment ; ensuite seulement, communiquez cette décision aux familles, comme celle du couple et non de l'un contre l'autre. Ce qui se règle entre vous ne doit pas se rejouer devant les parents.",
        ],
      },
      {
        type: "text",
        title: "Protéger la relation du projet",
        paragraphs: [
          "Le mariage n'est qu'une journée ; la relation, elle, continue après. Il est donc absurde de laisser l'organisation abîmer ce qu'elle est censée fêter. Gardez des moments où le mariage n'est pas un sujet, et rappelez-vous, quand le ton monte, que vous êtes dans la même équipe face au projet, pas adversaires.",
          "Une phrase simple aide souvent à recadrer : « est-ce que ce détail vaut vraiment qu'on se dispute ? ». Bien des désaccords de préparatifs ne survivent pas à cette question posée calmement.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Vous n'êtes pas l'un contre l'autre, vous êtes tous les deux face au projet. La plupart des désaccords se dénouent dès qu'on distingue ce qui est essentiel pour chacun de ce qui n'est qu'une préférence.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Se répartir clairement les décisions évite beaucoup de frictions : notre guide [organiser son mariage à deux sans se marcher dessus](/blog/organiser-mariage-a-deux-sync) propose une méthode de partage. Quand la tension vient surtout des familles, voir [gérer la belle-famille pendant les préparatifs](/blog/gerer-belle-famille-preparatifs) et, sur l'argent, [qui paie le mariage](/blog/qui-paie-le-mariage-repartition). Si les désaccords tournent au doute sur la relation, notre article [les doutes d'avant mariage](/blog/doute-prenuptial-cold-feet) aide à faire la part des choses.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Planning a wedding means making dozens of decisions in a few months, often with money, families, and expectations at stake. It would be surprising for a couple to go through that without a single disagreement. Friction isn't a bad sign: it's part of any project run as a pair.",
          "What matters isn't avoiding disagreements, but how you handle them. A simple method, set up in advance, keeps every choice from turning into a standoff and stops the project from damaging the relationship it's meant to celebrate.",
        ],
      },
      {
        type: "text",
        title: "Telling a preference from a dealbreaker",
        paragraphs: [
          "The first useful reflex is to sort each subject. A preference is something you'd like but can let go of without bitterness (the color of the flowers, the choice of dessert). A dealbreaker is a subject that touches your values or your deep comfort (the presence of a certain person, a budget not to be exceeded).",
          "Most tension comes from a misunderstanding on that scale: defending a simple preference as if it were a principle. Each of you clearly stating what's essential and what's secondary already defuses much of the conflict.",
        ],
      },
      {
        type: "list",
        title: "A method to decide together",
        items: [
          "Name the disagreement precisely, without generalizing (“this budget line”, not “you always overspend”)",
          "Each explains the why behind their position, not just the what: that's often where the real key lies",
          "Look first for a third option that satisfies both, rather than choosing between the two starting stances",
          "On secondary points, allow yourselves to split the decisions: each decides alone on their own area",
        ],
      },
      {
        type: "text",
        title: "Family pressure, a disagreement in disguise",
        paragraphs: [
          "Many planning arguments aren't really between the two of you: through you, they pit two families with different expectations against each other. One partner relays their parents' request, the other their own, and the couple ends up carrying a conflict that isn't theirs.",
          "The counter is to present a united front. Decide first, as a couple in private, what you truly want; only then communicate that decision to the families, as the couple's and not one against the other. What's settled between you shouldn't be replayed in front of the parents.",
        ],
      },
      {
        type: "text",
        title: "Protecting the relationship from the project",
        paragraphs: [
          "The wedding is only a day; the relationship goes on afterward. So it's absurd to let the planning damage what it's meant to celebrate. Keep moments where the wedding isn't a topic, and remember, when the tone rises, that you're on the same team facing the project, not opponents.",
          "One simple line often helps reframe: “is this detail really worth an argument?”. Many planning disagreements don't survive that question, asked calmly.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "You're not against each other, you're both facing the project. Most disagreements come undone as soon as you separate what's essential to each of you from what's merely a preference.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Clearly splitting the decisions avoids a lot of friction: our guide to [planning your wedding as a couple without stepping on each other](/blog/organiser-mariage-a-deux-sync) offers a sharing method. When the tension comes mainly from families, see [handling the in-laws during planning](/blog/gerer-belle-famille-preparatifs) and, on money, [who pays for the wedding](/blog/qui-paie-le-mariage-repartition). If the disagreements turn into doubt about the relationship, our article on [pre-wedding doubts](/blog/doute-prenuptial-cold-feet) helps sort things out.",
        ],
      },
    ],
  }),

  postPair({
    slug: "blues-post-mariage",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Le blues post-mariage : le contrecoup après le grand jour",
    titleEn: "Post-wedding blues: the dip after the big day",
    excerptFr:
      "Après des mois d'attente, le jour J passe en quelques heures et laisse parfois un vide. Pourquoi ce contrecoup est fréquent, et quelques gestes simples pour adoucir l'atterrissage.",
    excerptEn:
      "After months of anticipation, the big day passes in a few hours and can leave a void. Why this dip is common, and a few simple ways to soften the landing.",
    readingMinutes: 6,
    heroAltFr: "Jeunes mariés pensifs le lendemain de leur mariage",
    heroAltEn: "Newlyweds pensive the day after their wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "On parle beaucoup du stress d'avant et de la joie du jour J, rarement de ce qui vient après. Pourtant, dans les jours ou les semaines qui suivent le mariage, beaucoup de couples ressentent un petit vide, une mélancolie diffuse, parfois teintée de tristesse. C'est ce qu'on appelle le blues post-mariage.",
          "Ce contrecoup est fréquent et n'a rien d'inquiétant en soi. Le reconnaître, en parler et l'anticiper un peu suffit le plus souvent à le traverser sereinement. Cet article n'a pas vocation à remplacer un avis professionnel, mais à normaliser un ressenti dont on parle trop peu.",
        ],
      },
      {
        type: "text",
        title: "Pourquoi ce vide arrive",
        paragraphs: [
          "Pendant des mois, le mariage a occupé une place immense : décisions, listes, rendez-vous, attente. Il a donné un cap, un projet commun, une excitation constante. Une fois passé, tout cela s'arrête d'un coup. Le cerveau, habitué à ce grand objectif, se retrouve sans horizon, et ce contraste crée naturellement un creux.",
          "S'ajoute parfois la redescente d'une journée intense sur le plan émotionnel, le retour au quotidien après avoir été au centre de l'attention, et la fin de la parenthèse. Rien de pathologique là-dedans : c'est le prix normal d'un événement aussi attendu.",
        ],
      },
      {
        type: "list",
        title: "Adoucir l'atterrissage",
        items: [
          "Se prévoir quelque chose à attendre après le mariage : un voyage de noces, un week-end, ou simplement un projet à deux",
          "Prendre le temps de revisiter les photos et la vidéo quand elles arrivent, pour faire durer et revivre la journée",
          "Reprendre doucement les rituels de couple mis en pause pendant les préparatifs (une sortie, un dîner, une habitude)",
          "Écrire les remerciements sans se presser : c'est une façon douce de prolonger le mariage en le repartageant avec les invités",
        ],
      },
      {
        type: "text",
        title: "Un nouveau cap, plutôt qu'un vide",
        paragraphs: [
          "La meilleure parade au blues est de remplacer le grand objectif qui vient de s'achever par un autre, plus modeste. Ce n'est pas forcément un projet aussi spectaculaire qu'un mariage : un chantier dans le logement, une envie de voyage, un cap professionnel ou familial suffisent à redonner un horizon.",
          "L'idée n'est pas de tout enchaîner sans respirer, au contraire. C'est de savoir, avant même le jour J, que la vie continue après, avec ses propres projets, pour que le lendemain ne ressemble pas à une falaise.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Se sentir un peu vide après le mariage n'est pas un défaut de gratitude : c'est le contrecoup normal d'un projet immense qui s'achève. Anticiper un nouveau cap, même petit, suffit souvent à adoucir la descente.",
        ],
      },
      {
        type: "text",
        title: "Quand en parler à quelqu'un",
        paragraphs: [
          "Le blues post-mariage s'estompe en général de lui-même en quelques semaines. Mais si la tristesse s'installe, s'accompagne d'un désintérêt durable pour ce qui vous plaisait, ou pèse sur votre quotidien au-delà de cette période, ce n'est plus vraiment le simple contrecoup de la fête.",
          "Dans ce cas, en parler à un proche de confiance, à votre médecin ou à un professionnel n'a rien d'excessif. Demander de l'aide pour un mal-être qui dure est toujours une bonne décision, quelle qu'en soit la cause.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Le meilleur remède au vide est souvent d'avoir prévu la suite : notre guide [organiser son voyage de noces](/blog/voyage-de-noces-organiser-budget) donne un cap juste après le jour J. Prolongez aussi le mariage en douceur avec [les remerciements après le mariage](/blog/remerciements-apres-mariage) et en revisitant vos images via un [album partagé par QR code](/blog/partage-photos-mariage-qr-code).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "There's plenty of talk about the stress before and the joy of the day, rarely about what comes after. Yet in the days or weeks following the wedding, many couples feel a small void, a diffuse melancholy, sometimes tinged with sadness. This is what's called post-wedding blues.",
          "That dip is common and nothing to worry about in itself. Recognizing it, talking about it, and anticipating it a little is usually enough to move through it calmly. This article isn't meant to replace professional advice, but to normalize a feeling too rarely discussed.",
        ],
      },
      {
        type: "text",
        title: "Why the void happens",
        paragraphs: [
          "For months, the wedding held an enormous place: decisions, lists, appointments, anticipation. It gave a direction, a shared project, a constant excitement. Once it's over, all of that stops at once. The brain, used to that big goal, finds itself with no horizon, and that contrast naturally creates a dip.",
          "Sometimes there's also the comedown from an emotionally intense day, the return to routine after being the center of attention, and the closing of the parenthesis. Nothing pathological in that: it's the normal price of such an anticipated event.",
        ],
      },
      {
        type: "list",
        title: "Softening the landing",
        items: [
          "Plan something to look forward to after the wedding: a honeymoon, a weekend, or simply a project as a couple",
          "Take the time to revisit the photos and video when they arrive, to make the day last and relive it",
          "Gently resume the couple rituals paused during planning (an outing, a dinner, a habit)",
          "Write the thank-you notes without rushing: it's a gentle way to extend the wedding by resharing it with your guests",
        ],
      },
      {
        type: "text",
        title: "A new direction, rather than a void",
        paragraphs: [
          "The best counter to the blues is replacing the big goal that just ended with another, more modest one. It doesn't have to be as spectacular as a wedding: a home project, an urge to travel, a professional or family milestone are enough to give back a horizon.",
          "The idea isn't to line everything up without a breath, quite the opposite. It's knowing, even before the day, that life goes on afterward, with its own projects, so the day after doesn't feel like a cliff.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Feeling a bit empty after the wedding isn't a lack of gratitude: it's the normal comedown from an enormous project ending. Anticipating a new direction, even a small one, is often enough to soften the descent.",
        ],
      },
      {
        type: "text",
        title: "When to talk to someone",
        paragraphs: [
          "Post-wedding blues usually fades on its own within a few weeks. But if the sadness settles in, comes with a lasting loss of interest in what you used to enjoy, or weighs on your daily life beyond that period, it's no longer simply the comedown from the party.",
          "In that case, talking to a trusted loved one, your doctor, or a professional is in no way excessive. Asking for help with a lasting low is always a good decision, whatever the cause.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "The best remedy for the void is often having planned what comes next: our guide to [organizing your honeymoon](/blog/voyage-de-noces-organiser-budget) gives a direction right after the day. Also extend the wedding gently with [thank-you notes after the wedding](/blog/remerciements-apres-mariage) and by revisiting your images through a [QR-code shared album](/blog/partage-photos-mariage-qr-code).",
        ],
      },
    ],
  }),

  postPair({
    slug: "boissons-sans-alcool-mariage",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Boissons sans alcool et mocktails : ne pas les oublier",
    titleEn: "Non-alcoholic drinks and mocktails: don't forget them",
    excerptFr:
      "Conducteurs, femmes enceintes, enfants, non-buveurs : près d'un tiers de vos invités. Comment prévoir de vrais mocktails et les bonnes quantités, sans que le sans-alcool soit une simple bouteille d'eau reléguée au bout du bar.",
    excerptEn:
      "Drivers, pregnant guests, children, non-drinkers: nearly a third of your guests. How to plan real mocktails and the right quantities, so the alcohol-free option isn't just a water bottle at the end of the bar.",
    readingMinutes: 6,
    heroAltFr: "Mocktails colorés servis lors d'un vin d'honneur de mariage",
    heroAltEn: "Colorful mocktails served at a wedding cocktail hour",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Sur bien des mariages, le sans-alcool se résume à une carafe d'eau et une bouteille de soda oubliée au bout du bar. C'est dommage, car ce n'est pas une part marginale des invités : les conducteurs désignés, les femmes enceintes, les enfants et les non-buveurs représentent souvent près d'un tiers des convives.",
          "Bien pensé, le sans-alcool ne coûte pas cher et fait une vraie différence. Un ou deux mocktails soignés, en quantité suffisante, montrent que vous avez pensé à tout le monde, et pas seulement à ceux qui trinquent au champagne.",
        ],
      },
      {
        type: "text",
        title: "Qui boit sans alcool, et pourquoi ça compte",
        paragraphs: [
          "Le sans-alcool concerne environ un tiers de vos invités, pour des raisons très diverses : quelqu'un doit reprendre le volant, une invitée est enceinte, les enfants sont de la fête, et de plus en plus d'adultes choisissent simplement de ne pas boire. Aucun ne devrait se contenter d'un verre d'eau tiède pendant que les autres célèbrent.",
          "Traiter le sans-alcool comme une option de second rang se remarque. À l'inverse, proposer une vraie alternative festive est un geste d'attention qui coûte peu et se voit beaucoup, notamment au vin d'honneur, le moment où l'on trinque.",
        ],
      },
      {
        type: "list",
        title: "Prévoir les bonnes quantités",
        items: [
          "Compter environ deux verres de boisson sans alcool par personne concernée sur le temps du vin d'honneur",
          "Prévoir globalement une bouteille de sans-alcool (soft, jus, eau pétillante) pour trois à quatre invités, soit environ un tiers de la commande de vin",
          "Renforcer nettement les quantités d'eau et de boissons fraîches pour un mariage estival ou en extérieur",
          "Toujours garder une marge : il vaut mieux un léger surplus, souvent repris par le caviste, qu'une rupture en pleine soirée",
        ],
      },
      {
        type: "text",
        title: "Des mocktails qui donnent envie",
        paragraphs: [
          "Un mocktail réussi, c'est un cocktail sans alcool traité avec le même soin que les autres : joliment présenté, servi au verre, avec une garniture. Un ou deux mocktails signature suffisent, idéalement en écho au cocktail alcoolisé, pour que ceux qui ne boivent pas aient, eux aussi, leur verre de fête.",
          "Pensez aussi aux classiques rafraîchissants : citronnades maison, thés glacés, jus de fruits pétillants, eaux aromatisées. Simples à préparer en grande quantité, ils tiennent bien la chaleur et plaisent autant aux adultes qu'aux enfants.",
        ],
      },
      {
        type: "text",
        title: "Bien briefer le traiteur ou le bar",
        paragraphs: [
          "Le sans-alcool doit figurer explicitement dans le brief : précisez les mocktails souhaités, les quantités, et demandez qu'ils soient servis aussi visiblement que les autres boissons, pas cachés derrière le bar. Vérifiez aussi que le personnel les proposera spontanément, plutôt que d'attendre qu'on les réclame.",
          "Côté contrat, regardez ce qui est inclus : certains traiteurs facturent les softs à part, d'autres les intègrent au forfait boissons. C'est le moment de clarifier, pour éviter une ligne surprise sur la facture finale.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Le sans-alcool n'est pas un détail réservé aux enfants : c'est la boisson d'un invité sur trois. Un mocktail soigné et des quantités suffisantes valent bien mieux qu'une bouteille d'eau reléguée au bout du bar.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Le sans-alcool se calcule en même temps que le reste : voir [quantités de boissons par invité](/blog/boissons-mariage-champagne-quantites) pour poser vos totaux. Pour un vrai bar à mocktails, notre guide [bar à cocktails de mariage](/blog/bar-a-cocktails-mariage) donne les pistes, et [le vin d'honneur](/blog/vin-honneur-cocktail-mariage) rappelle le moment clé où tout le monde trinque. N'oubliez pas non plus le [menu enfants](/blog/menu-enfants-mariage), souvent lié aux mêmes boissons.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "At many weddings, the alcohol-free option comes down to a jug of water and a soda bottle forgotten at the end of the bar. That's a shame, because it isn't a marginal share of guests: designated drivers, pregnant guests, children, and non-drinkers often make up nearly a third of the party.",
          "Well thought out, alcohol-free drinks aren't expensive and make a real difference. One or two well-made mocktails, in sufficient quantity, show you've thought of everyone, not just those toasting with champagne.",
        ],
      },
      {
        type: "text",
        title: "Who drinks alcohol-free, and why it matters",
        paragraphs: [
          "Alcohol-free concerns about a third of your guests, for very different reasons: someone has to drive home, a guest is pregnant, children are at the party, and more and more adults simply choose not to drink. None of them should have to make do with a glass of lukewarm water while the others celebrate.",
          "Treating alcohol-free as a second-rate option shows. Conversely, offering a genuine festive alternative is a thoughtful gesture that costs little and stands out a lot, especially at the cocktail hour, the moment of toasting.",
        ],
      },
      {
        type: "list",
        title: "Planning the right quantities",
        items: [
          "Count about two alcohol-free drinks per relevant person over the cocktail hour",
          "Plan overall about one alcohol-free bottle (soft drink, juice, sparkling water) per three to four guests, roughly a third of the wine order",
          "Clearly boost the quantities of water and cold drinks for a summer or outdoor wedding",
          "Always keep a margin: a slight surplus, often taken back by the merchant, beats running out mid-evening",
        ],
      },
      {
        type: "text",
        title: "Mocktails worth wanting",
        paragraphs: [
          "A good mocktail is a cocktail without alcohol treated with the same care as the others: nicely presented, served in a glass, with a garnish. One or two signature mocktails are enough, ideally echoing the alcoholic cocktail, so those who don't drink also get their celebratory glass.",
          "Also think of the refreshing classics: homemade lemonades, iced teas, sparkling fruit juices, flavored waters. Easy to make in large quantities, they hold up well in the heat and please adults and children alike.",
        ],
      },
      {
        type: "text",
        title: "Briefing the caterer or bar properly",
        paragraphs: [
          "Alcohol-free should appear explicitly in the brief: state the mocktails you want, the quantities, and ask that they be served as visibly as the other drinks, not hidden behind the bar. Also check that staff will offer them spontaneously, rather than waiting to be asked.",
          "On the contract side, look at what's included: some caterers bill soft drinks separately, others fold them into the drinks package. This is the moment to clarify, to avoid a surprise line on the final bill.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Alcohol-free isn't a detail reserved for children: it's the drink of one guest in three. A well-made mocktail and sufficient quantities are far better than a water bottle relegated to the end of the bar.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Alcohol-free is calculated alongside the rest: see [drink quantities per guest](/blog/boissons-mariage-champagne-quantites) to set your totals. For a real mocktail bar, our guide to [the wedding cocktail bar](/blog/bar-a-cocktails-mariage) gives ideas, and [the cocktail hour](/blog/vin-honneur-cocktail-mariage) recalls the key moment when everyone toasts. Don't forget the [children's menu](/blog/menu-enfants-mariage) either, often tied to the same drinks.",
        ],
      },
    ],
  }),

  postPair({
    slug: "repas-prestataires-mariage",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "Le repas des prestataires : nourrir photographe, DJ et équipe",
    titleEn: "Feeding your vendors: photographer, DJ, and staff meals",
    excerptFr:
      "Photographe, DJ, vidéaste, équipe traiteur : ceux qui travaillent votre journée entière doivent manger. Ce que disent les contrats, repas chaud ou plateau, où et quand, et comment budgéter ces couverts en plus.",
    excerptEn:
      "Photographer, DJ, videographer, catering staff: those who work your whole day need to eat. What contracts say, hot meal or vendor plate, where and when, and how to budget the extra covers.",
    readingMinutes: 7,
    heroAltFr: "Prestataires de mariage prenant leur repas pendant la réception",
    heroAltEn: "Wedding vendors taking their meal during the reception",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le repas des prestataires est un poste que beaucoup de couples découvrent en lisant les petites lignes d'un contrat. Photographe, vidéaste, DJ, équipe traiteur, coordinateur : ces personnes travaillent souvent dix à quinze heures d'affilée, de la préparation au démontage. Elles ont besoin de manger, tout simplement.",
          "Ce n'est ni un caprice ni un extra facultatif. Un prestataire nourri et reposé un moment travaille mieux, et c'est aussi une question de considération humaine. Le sujet se règle facilement dès lors qu'on l'anticipe au lieu de le découvrir le jour même.",
        ],
      },
      {
        type: "text",
        title: "Ce que disent les contrats",
        paragraphs: [
          "La plupart des contrats de photographe, vidéaste ou DJ mentionnent explicitement le repas au-delà d'une certaine durée de présence, généralement quand elle couvre l'heure du dîner. Certains l'exigent, d'autres le formulent comme une attente d'usage. Dans tous les cas, c'est une ligne à lire attentivement avant de signer.",
          "Le contrat précise parfois la nature du repas attendu : un repas chaud équivalent à celui des invités, ou au minimum un vrai plat. Vérifiez aussi si une clause prévoit une pause : un prestataire qui mange doit pouvoir le faire tranquillement, pas debout entre deux services.",
        ],
      },
      {
        type: "list",
        title: "Repas invité ou plateau prestataire",
        items: [
          "Le repas identique à celui des invités : le plus simple à commander, le plus apprécié, mais facturé au même prix que le couvert invité",
          "Le plateau prestataire proposé par de nombreux traiteurs : un plat chaud plus simple, à un tarif nettement réduit",
          "Vérifier que ce plateau reste un vrai repas chaud, et pas un simple sandwich, surtout pour une présence de dix heures ou plus",
          "Compter aussi les éventuels régimes particuliers (végétarien, allergies) parmi les prestataires, comme pour les invités",
        ],
      },
      {
        type: "text",
        title: "Où et quand ils mangent",
        paragraphs: [
          "Le bon moment, c'est en général quand les mariés et les invités sont eux-mêmes servis : ainsi, le photographe ne rate aucun temps fort et le DJ n'interrompt pas la piste, puisqu'il n'y a de toute façon pas de musique de danse pendant le dîner. Prévoir leur repas en même temps que le service principal évite les trous dans la couverture de la journée.",
          "Côté lieu, une petite table à part, à proximité de la salle mais un peu à l'écart, convient très bien : les prestataires restent joignables sans être installés parmi les convives. Signalez cette organisation au traiteur en amont pour qu'il prévoie le couvert et l'endroit.",
        ],
      },
      {
        type: "text",
        title: "Budgéter les couverts en plus",
        paragraphs: [
          "Faites la liste des prestataires présents à l'heure du repas et comptez le nombre exact de couverts supplémentaires. Selon la formule, un repas invité peut représenter plusieurs dizaines d'euros par personne, là où un plateau prestataire revient sensiblement moins cher. Sur quatre ou cinq intervenants, l'écart n'est pas anodin.",
          "Le réflexe utile est de poser la question au traiteur dès le devis : propose-t-il un tarif prestataire, et à quel prix ? Intégrez ensuite ces couverts dans votre nombre total dès le départ, plutôt que de les ajouter en catastrophe la dernière semaine.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Nourrir ses prestataires n'est pas une option : c'est souvent une clause du contrat et toujours une marque de respect. Anticipez-le dès le devis traiteur, en couverts et en budget, plutôt que de le découvrir la veille.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Le repas prestataire se repère justement dans les devis : notre guide [comparer les devis traiteur](/blog/comparer-devis-traiteur-mariage) montre où figure cette ligne, et [les clauses du contrat prestataire à vérifier](/blog/contrat-prestataire-clauses-verifier) rappelle de la lire avant de signer. Profitez de la [dégustation traiteur](/blog/degustation-traiteur-mariage) pour poser la question du plateau prestataire, et intégrez ces couverts dans la [répartition du budget par poste](/blog/repartition-budget-mariage-par-poste).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The vendor meal is an item many couples discover reading the fine print of a contract. Photographer, videographer, DJ, catering staff, coordinator: these people often work ten to fifteen hours straight, from getting ready to teardown. They need to eat, quite simply.",
          "It's neither a whim nor an optional extra. A vendor who is fed and rested for a moment works better, and it's also a matter of human consideration. The subject is easily settled once you anticipate it rather than discover it on the day.",
        ],
      },
      {
        type: "text",
        title: "What the contracts say",
        paragraphs: [
          "Most photographer, videographer, or DJ contracts explicitly mention a meal beyond a certain length of presence, generally when it covers dinnertime. Some require it, others frame it as a customary expectation. Either way, it's a line to read carefully before signing.",
          "The contract sometimes specifies the kind of meal expected: a hot meal equivalent to the guests', or at least a real dish. Also check whether a clause provides for a break: a vendor eating should be able to do so calmly, not standing between two services.",
        ],
      },
      {
        type: "list",
        title: "Guest meal or vendor plate",
        items: [
          "The same meal as the guests: the simplest to order, the most appreciated, but billed at the same price as a guest cover",
          "The vendor plate offered by many caterers: a simpler hot dish, at a clearly reduced rate",
          "Check that this plate is a real hot meal, not just a sandwich, especially for a presence of ten hours or more",
          "Also account for any special diets (vegetarian, allergies) among the vendors, as for the guests",
        ],
      },
      {
        type: "text",
        title: "Where and when they eat",
        paragraphs: [
          "The right time is generally when the couple and guests are served themselves: that way the photographer misses no key moment and the DJ doesn't interrupt the dancefloor, since there's no dance music during dinner anyway. Planning their meal at the same time as the main service avoids gaps in the day's coverage.",
          "On location, a small separate table, near the room but slightly apart, works very well: vendors stay reachable without being seated among the guests. Flag this arrangement to the caterer ahead of time so they plan the cover and the spot.",
        ],
      },
      {
        type: "text",
        title: "Budgeting the extra covers",
        paragraphs: [
          "List the vendors present at mealtime and count the exact number of extra covers. Depending on the formula, a guest meal can run several tens of euros per person, whereas a vendor plate costs noticeably less. Across four or five vendors, the gap isn't trivial.",
          "The useful reflex is to ask the caterer as early as the quote: do they offer a vendor rate, and at what price? Then fold these covers into your total count from the start, rather than adding them in a panic the final week.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Feeding your vendors isn't optional: it's often a contract clause and always a mark of respect. Anticipate it as early as the caterer's quote, in covers and in budget, rather than discovering it the day before.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "The vendor meal shows up precisely in the quotes: our guide to [comparing caterer quotes](/blog/comparer-devis-traiteur-mariage) shows where this line appears, and [the vendor-contract clauses to check](/blog/contrat-prestataire-clauses-verifier) reminds you to read it before signing. Use the [caterer tasting](/blog/degustation-traiteur-mariage) to ask about the vendor plate, and fold these covers into your [budget breakdown by line item](/blog/repartition-budget-mariage-par-poste).",
        ],
      },
    ],
  }),
];

export const { fr: POSTS_217_224_FR, en: POSTS_217_224_EN } = pairsToArrays(pairs);
