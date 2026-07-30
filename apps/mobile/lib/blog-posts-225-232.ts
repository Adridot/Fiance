import { postPair, pairsToArrays } from "./blog-posts-shared";

const pairs = [
  postPair({
    slug: "agencement-salle-plan-espace",
    categoryKey: "seating",
    categoryFr: "Plan de table",
    categoryEn: "Seating",
    titleFr: "Agencer la salle de réception : le plan de l'espace, pas des places",
    titleEn: "Laying out the reception: the plan of the space, not the seats",
    excerptFr:
      "Où placer la piste de danse, le buffet, le bar, le gâteau et la table des mariés pour que les invités circulent et que la fête ait un centre de gravité. Comment dessiner un plan de la salle avec le lieu.",
    excerptEn:
      "Where to place the dancefloor, the buffet, the bar, the cake, and the couple's table so guests flow and the party has a center of gravity. How to sketch a floor plan with the venue.",
    readingMinutes: 7,
    heroAltFr: "Plan d'agencement d'une salle de réception de mariage dessiné sur papier",
    heroAltEn: "Floor plan of a wedding reception room sketched on paper",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Quand on parle de plan de table, on pense d'abord à qui s'assoit où. Mais avant cette question vient une autre, plus large et souvent négligée : comment la salle elle-même est organisée. Où sont la piste de danse, le buffet, le bar, le gâteau, la table des mariés, et comment les invités passent de l'un à l'autre.",
          "Cet agencement de l'espace décide, en grande partie, de l'ambiance de la soirée. Une salle bien pensée fait circuler naturellement les gens et concentre l'énergie au bon endroit ; une salle mal agencée crée des bouchons, des zones mortes et une piste qui reste vide. Cela se dessine à l'avance, sur un simple plan.",
        ],
      },
      {
        type: "text",
        title: "La piste de danse, centre de gravité de la soirée",
        paragraphs: [
          "La piste de danse est le coeur de la fête : c'est autour d'elle que tout s'organise. La règle la plus utile est de la placer au centre ou au bout de la salle, entourée par les tables plutôt que reléguée dans un coin. Une piste isolée à l'écart reste désespérément vide ; une piste que les invités frôlent en allant au bar se remplit d'elle-même.",
          "Gardez le DJ ou le groupe à un bout de cette piste, avec les enceintes orientées vers le vide et non vers les tables des convives les plus âgés. Prévoyez aussi que, une fois le repas fini, les tables les plus proches de la piste peuvent être desservies pour agrandir l'espace de danse : beaucoup de lieux le font naturellement.",
        ],
      },
      {
        type: "list",
        title: "Les pôles à positionner sur le plan",
        items: [
          "La piste de danse, au centre de gravité, entourée par les tables et proche du DJ",
          "Le bar, un peu à l'écart de la piste mais sur un chemin de passage, pour animer sans couvrir la musique",
          "Le buffet ou l'espace traiteur, accessible par plusieurs côtés pour éviter une file unique qui bloque",
          "La table des mariés (d'honneur ou en tête), bien visible de tous et proche de la piste",
          "La table du gâteau ou de la pièce montée, dégagée pour le moment de la découpe et les photos",
          "L'accueil, le vestiaire et le livre d'or, près de l'entrée pour capter les invités à l'arrivée",
        ],
      },
      {
        type: "text",
        title: "La circulation, ce qui fait vivre ou fige une salle",
        paragraphs: [
          "Un bon agencement se juge aux déplacements qu'il provoque. Un invité doit pouvoir rejoindre le bar, les toilettes ou la piste sans slalomer entre les chaises ni couper la table des mariés. Laissez des allées franches d'au moins un mètre entre les tables, et vérifiez que le service du traiteur dispose de ses propres passages pour circuler sans gêner les convives.",
          "Attention aux points de blocage classiques : un bar collé à une porte, un buffet accessible d'un seul côté, une piste que l'on ne peut atteindre qu'en traversant une autre table. Ces détails, invisibles sur le papier si l'on ne regarde pas les flux, transforment une belle salle en labyrinthe le jour J.",
        ],
      },
      {
        type: "text",
        title: "Dessiner le plan avec le lieu",
        paragraphs: [
          "La plupart des lieux de réception disposent d'un plan à l'échelle et connaissent les agencements qui fonctionnent dans leurs murs : combien de tables rondes tiennent, où passent les branchements, où le traiteur installe son office. Demandez ce plan dès la visite et faites-vous raconter comment les mariages précédents s'y sont organisés.",
          "Dessinez ensuite votre version, même à la main : posez les grands pôles (piste, bar, buffet, table des mariés), puis répartissez les tables autour. Un plan validé à deux, avec le lieu et le traiteur, évite les mauvaises surprises de dernière minute et sert de base au placement nominatif, qui vient seulement après.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Agencez l'espace avant de placer les gens. Une piste au centre, un bar sur le passage, un buffet accessible des deux côtés et des allées dégagées : ces quatre choix font plus pour l'ambiance que le plus beau des plans de table.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "L'agencement de l'espace prépare le placement nominatif : une fois les pôles posés, notre guide [planifier la décoration de la salle](/blog/decoration-salle-reception-planifier) aide à habiller l'ensemble. Pensez la piste avec [la sonorisation et l'éclairage de la soirée](/blog/sonorisation-eclairage-soiree-mariage), et choisissez le format de la table principale via [les formats de table d'honneur](/blog/table-honneur-formats-mariage). Profitez de la [visite du lieu](/blog/questions-visite-lieu-reception-mariage) pour récupérer le plan à l'échelle.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "When people talk about the seating chart, they think first of who sits where. But before that question comes another, broader and often overlooked: how the room itself is organized. Where the dancefloor, the buffet, the bar, the cake, and the couple's table go, and how guests move from one to the next.",
          "This layout of the space largely decides the mood of the evening. A well-planned room makes people flow naturally and concentrates the energy in the right place; a poorly arranged one creates bottlenecks, dead zones, and a dancefloor that stays empty. It's all sketched out ahead, on a simple plan.",
        ],
      },
      {
        type: "text",
        title: "The dancefloor, the evening's center of gravity",
        paragraphs: [
          "The dancefloor is the heart of the party: everything organizes itself around it. The most useful rule is to place it at the center or the end of the room, surrounded by the tables rather than relegated to a corner. An isolated dancefloor off to the side stays hopelessly empty; one that guests brush past on their way to the bar fills up on its own.",
          "Keep the DJ or band at one end of that floor, with the speakers aimed at the open space and not at the tables of your older guests. Also plan for the tables nearest the dancefloor to be cleared once the meal is over, to enlarge the dance area: many venues do this naturally.",
        ],
      },
      {
        type: "list",
        title: "The zones to position on the plan",
        items: [
          "The dancefloor, at the center of gravity, surrounded by tables and close to the DJ",
          "The bar, slightly away from the dancefloor but on a route people cross, to liven things up without drowning the music",
          "The buffet or catering area, reachable from several sides to avoid a single line that blocks",
          "The couple's table (head or sweetheart), clearly visible to all and near the dancefloor",
          "The cake table, kept clear for the cutting moment and the photos",
          "The welcome desk, cloakroom, and guest book, near the entrance to catch guests on arrival",
        ],
      },
      {
        type: "text",
        title: "Circulation, what makes a room live or freeze",
        paragraphs: [
          "A good layout is judged by the movements it produces. A guest should be able to reach the bar, the toilets, or the dancefloor without weaving between chairs or cutting across the couple's table. Leave clear aisles of at least a meter between tables, and check that the catering staff have their own passages to move without disturbing the guests.",
          "Watch out for the classic blocking points: a bar jammed against a door, a buffet reachable from one side only, a dancefloor you can only get to by crossing another table. These details, invisible on paper if you don't look at the flows, turn a lovely room into a maze on the day.",
        ],
      },
      {
        type: "text",
        title: "Sketching the plan with the venue",
        paragraphs: [
          "Most reception venues have a scale plan and know the layouts that work within their walls: how many round tables fit, where the power runs, where the caterer sets up. Ask for that plan as early as the visit and get them to tell you how previous weddings were arranged there.",
          "Then draw your own version, even by hand: place the big zones (dancefloor, bar, buffet, couple's table), then arrange the tables around them. A plan agreed as a couple, with the venue and the caterer, avoids last-minute surprises and serves as the basis for the named seating, which comes only afterward.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Lay out the space before you seat the people. A dancefloor at the center, a bar on the path, a buffet reachable from both sides, and clear aisles: these four choices do more for the mood than the finest seating chart.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Laying out the space sets up the named seating: once the zones are placed, our guide to [planning the reception decor](/blog/decoration-salle-reception-planifier) helps dress the whole. Design the dancefloor alongside [sound and lighting for the evening](/blog/sonorisation-eclairage-soiree-mariage), and choose the format of the main table via [head-table formats](/blog/table-honneur-formats-mariage). Use the [venue visit](/blog/questions-visite-lieu-reception-mariage) to pick up the scale plan.",
        ],
      },
    ],
  }),

  postPair({
    slug: "parking-invites-mariage",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Le parking des invités : arrivée, stationnement et signalisation",
    titleEn: "Guest parking: arrival, stationing, and signage",
    excerptFr:
      "Capacité du lieu, parking de débordement dans un champ, places pour personnes à mobilité réduite, fléchage jusqu'au parking : la logistique d'arrivée se règle en amont pour éviter l'embouteillage à l'entrée.",
    excerptEn:
      "Venue capacity, overflow parking in a field, spaces for guests with reduced mobility, signage to the lot: arrival logistics are settled in advance to avoid a jam at the gate.",
    readingMinutes: 6,
    heroAltFr: "Voitures d'invités garées dans un champ lors d'un mariage à la campagne",
    heroAltEn: "Guests' cars parked in a field at a countryside wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le stationnement est l'un des premiers contacts de vos invités avec la fête, et l'un des plus faciles à rater. Un parking saturé, un fléchage absent ou une entrée engorgée transforment une arrivée joyeuse en énervement, avant même le premier verre. C'est pourtant un sujet qui se règle entièrement en amont.",
          "Le stationnement n'est pas la même chose que les navettes : il concerne les invités qui viennent par la route en voiture, souvent la majorité, surtout à la campagne. L'objectif est simple : que chacun se gare sans stress, sache où aller, et rejoigne la cérémonie à pied en une minute.",
        ],
      },
      {
        type: "text",
        title: "Évaluer la capacité réelle du lieu",
        paragraphs: [
          "La première question à poser lors de la visite : combien de voitures le lieu peut-il réellement accueillir ? Un parking annoncé pour cinquante véhicules ne suffit pas pour cent cinquante invités, même en comptant le covoiturage. Estimez grossièrement une voiture pour deux à trois invités adultes, puis comparez à la capacité annoncée.",
          "Si l'écart est important, il faut prévoir une solution de débordement dès maintenant, pas le jour même. Un champ voisin, une cour de ferme, un parking public à proximité : demandez au lieu ce qu'il fait habituellement quand la jauge est pleine, il a presque toujours une réponse rodée.",
        ],
      },
      {
        type: "list",
        title: "Les points à régler avant le jour J",
        items: [
          "La capacité du parking principal et l'existence d'un parking de débordement (champ, cour, terrain voisin)",
          "L'état du sol du parking de secours : un champ détrempé après la pluie devient impraticable, prévoyez un plan B",
          "Quelques places réservées près de l'entrée pour les personnes âgées et à mobilité réduite",
          "Le fléchage depuis la route principale jusqu'au parking, puis du parking jusqu'à la cérémonie",
          "Une personne pour orienter les voitures aux heures de pointe (arrivée groupée avant la cérémonie)",
        ],
      },
      {
        type: "text",
        title: "Fléchage et signalisation, du bord de route à la place",
        paragraphs: [
          "Beaucoup de lieux de mariage sont perdus dans la campagne, au bout d'un chemin sans nom. Un fléchage clair depuis le dernier village évite les demi-tours et les appels affolés « on est où ? ». Prévoyez quelques panneaux à vos prénoms ou à un pictogramme simple, placés aux intersections clés, et retirés après.",
          "Le fléchage ne s'arrête pas à l'entrée : il continue jusqu'à la place de parking, puis du parking jusqu'au lieu de la cérémonie. Un invité qui s'est garé dans un champ doit savoir, sans hésiter, par où rejoindre les autres. C'est aussi là que la signalétique générale du mariage prend le relais.",
        ],
      },
      {
        type: "text",
        title: "Coordonner avec les navettes et un éventuel voiturier",
        paragraphs: [
          "Si vous proposez des navettes depuis les hébergements, le parking et les navettes doivent se compléter, pas se concurrencer : indiquez clairement qui vient en voiture et qui prend la navette, pour dimensionner les deux. Une partie des invités laissera d'ailleurs sa voiture au parking le soir s'il a bu, d'où l'intérêt d'un retour organisé.",
          "Le voiturier reste rare et coûteux sur un mariage classique, mais peut se justifier sur un lieu au stationnement compliqué ou en ville. Si vous y songez, cadrez précisément la prestation dans un contrat : nombre de voituriers, horaires, responsabilité en cas de dommage.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Un bon parking se voit à peine : les invités se garent, suivent les flèches et arrivent détendus. Ce qui se remarque, c'est son absence. Réglez capacité, débordement et fléchage en amont, pas dans l'embouteillage de l'entrée.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Le parking se pense avec le reste de l'arrivée : notre guide [les navettes pour les invités](/blog/transport-navette-invites-mariage) complète la logique voiture, et [la signalétique de mariage](/blog/signaletique-mariage) détaille les panneaux du bord de route jusqu'à la place. Pour les invités qui dorment sur place, voir [l'hébergement des invités](/blog/hebergement-invites-mariage). Ajoutez chaque tâche de logistique comme un rappel daté dans la [timeline](/tools/timeline).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Parking is one of your guests' first contacts with the celebration, and one of the easiest to get wrong. A full lot, missing signage, or a jammed gate turn a joyful arrival into irritation, before the first drink. Yet it's a subject that's fully settled in advance.",
          "Parking isn't the same as shuttles: it concerns the guests coming by road in their own car, often the majority, especially in the countryside. The goal is simple: everyone parks without stress, knows where to go, and reaches the ceremony on foot in a minute.",
        ],
      },
      {
        type: "text",
        title: "Assessing the venue's real capacity",
        paragraphs: [
          "The first question to ask at the visit: how many cars can the venue actually take? A lot advertised for fifty vehicles isn't enough for a hundred and fifty guests, even counting carpooling. Roughly estimate one car for every two or three adult guests, then compare with the stated capacity.",
          "If the gap is large, you need to plan an overflow solution now, not on the day. A neighboring field, a farmyard, a nearby public lot: ask the venue what it usually does when the main lot is full, it almost always has a well-rehearsed answer.",
        ],
      },
      {
        type: "list",
        title: "The points to settle before the day",
        items: [
          "The main lot's capacity and whether there's an overflow area (field, yard, neighboring land)",
          "The ground of the backup lot: a field soaked by rain becomes unusable, plan a fallback",
          "A few reserved spaces near the entrance for elderly guests and those with reduced mobility",
          "Signage from the main road to the lot, then from the lot to the ceremony",
          "Someone to direct cars at peak times (the grouped arrival before the ceremony)",
        ],
      },
      {
        type: "text",
        title: "Signage, from the roadside to the space",
        paragraphs: [
          "Many wedding venues are tucked away in the countryside, at the end of an unnamed lane. Clear signage from the last village avoids U-turns and panicked calls of “where are we?”. Plan a few signs with your first names or a simple icon, placed at the key junctions, and taken down afterward.",
          "Signage doesn't stop at the gate: it continues to the parking space, then from the lot to the ceremony. A guest who parked in a field should know, without hesitation, which way to reach the others. This is also where the wedding's general signage takes over.",
        ],
      },
      {
        type: "text",
        title: "Coordinating with shuttles and a possible valet",
        paragraphs: [
          "If you offer shuttles from the accommodation, parking and shuttles should complement each other, not compete: state clearly who comes by car and who takes the shuttle, to size both. Some guests will leave their car in the lot for the night if they've been drinking, which is why an organized return matters.",
          "A valet remains rare and costly for a typical wedding, but can make sense at a venue with tricky parking or in town. If you're considering it, frame the service precisely in a contract: number of valets, hours, liability in case of damage.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Good parking is barely noticed: guests park, follow the arrows, and arrive relaxed. What gets noticed is its absence. Settle capacity, overflow, and signage in advance, not in the jam at the gate.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Parking is planned alongside the rest of the arrival: our guide to [shuttles for guests](/blog/transport-navette-invites-mariage) rounds out the car logic, and [wedding signage](/blog/signaletique-mariage) covers the signs from the roadside to the space. For guests staying over, see [guest accommodation](/blog/hebergement-invites-mariage). Add each logistics task as a dated reminder in the [timeline](/tools/timeline).",
        ],
      },
    ],
  }),

  postPair({
    slug: "signaletique-mariage",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "La signalétique de mariage : panneaux, plan de table et petits repères",
    titleEn: "Wedding signage: signs, seating board, and small markers",
    excerptFr:
      "Panneau de bienvenue, flèches sur la route, tableau du plan de table, noms de tables, petits panneaux fonctionnels : ce qui vaut la peine d'être fait, ce qui peut sauter, et comment garder le tout dans votre thème.",
    excerptEn:
      "Welcome sign, roadside arrows, seating-plan board, table names, small functional signs: what's worth making, what can be skipped, and how to keep it all on theme.",
    readingMinutes: 6,
    heroAltFr: "Panneau de bienvenue et signalétique décorative à l'entrée d'un mariage",
    heroAltEn: "Welcome sign and decorative signage at a wedding entrance",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "La signalétique, c'est l'ensemble des panneaux qui guident et informent vos invités : de la flèche plantée au bord de la route jusqu'au petit carton indiquant le vestiaire. On la remarque à peine quand elle est bien faite, et beaucoup quand elle manque, parce qu'un invité perdu ou qui cherche les toilettes n'est jamais tout à fait dans la fête.",
          "Le piège est de vouloir tout faire, et de finir avec quinze panneaux calligraphiés dont la moitié ne sert à rien. L'idée juste consiste à distinguer la signalétique utile, qui guide vraiment, de la signalétique décorative, agréable mais optionnelle, et de garder l'ensemble dans votre thème.",
        ],
      },
      {
        type: "list",
        title: "La signalétique vraiment utile",
        items: [
          "Le fléchage routier depuis le dernier village jusqu'au parking, pour les lieux perdus à la campagne",
          "Le panneau de bienvenue à l'entrée, qui pose le ton et confirme aux invités qu'ils sont au bon endroit",
          "Le tableau ou plan de table, à l'entrée de la salle, pour que chacun trouve sa table sans embouteillage",
          "Les noms ou numéros de tables, visibles de loin, pour repérer sa place une fois entré",
          "Quelques petits panneaux fonctionnels : bar, vestiaire, toilettes, livre d'or, photobooth",
        ],
      },
      {
        type: "text",
        title: "Le tableau du plan de table, la pièce maîtresse",
        paragraphs: [
          "S'il ne fallait garder qu'un panneau intérieur, ce serait celui-ci. À l'entrée de la salle, il indique à chaque invité à quelle table il est placé, et évite le moment gênant où tout le monde tourne en rond en cherchant son nom. Classez les invités par ordre alphabétique renvoyant vers un numéro ou un nom de table, c'est le format le plus lisible.",
          "Ce tableau se marie naturellement avec les noms de tables : si vos tables portent des noms (villes, fleurs, films) plutôt que des numéros, le tableau doit reprendre exactement les mêmes intitulés. Un plan de table joliment présenté est aussi une des rares pièces de signalétique qui devient un vrai élément de décoration.",
        ],
      },
      {
        type: "text",
        title: "Ce que l'on peut faire soi-même, ce que l'on délègue",
        paragraphs: [
          "Une grande partie de la signalétique se prête bien au fait-maison : un joli panneau de bienvenue à la calligraphie, des flèches en bois peint, des petits cartons imprimés à la maison. C'est un poste où le DIY fait sens, parce que l'imperfection y passe très bien et que le budget peut vite grimper si l'on fait tout imprimer.",
          "Quelques pièces gagnent en revanche à être confiées à un professionnel ou soignées davantage : le grand tableau du plan de table, très regardé et photographié, et l'éventuel miroir ou panneau calligraphié qui devient une pièce de déco à part entière. Le reste peut rester simple sans que personne ne s'en plaigne.",
        ],
      },
      {
        type: "text",
        title: "Garder le tout dans le thème",
        paragraphs: [
          "La cohérence fait toute la différence : une signalétique qui reprend la même police, la même palette et les mêmes matières que vos faire-part et votre décoration donne une impression d'ensemble soigné, même avec des panneaux tout simples. À l'inverse, cinq panneaux dans cinq styles différents font désordre, aussi jolis soient-ils pris un par un.",
          "Choisissez donc deux ou trois éléments graphiques (une police, une couleur, un motif) et déclinez-les sur toute la signalétique. C'est le fil conducteur qui relie le fléchage du bord de route au petit panneau des toilettes, et qui fait qu'on reconnaît votre mariage d'un coup d'oeil.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Faites d'abord la signalétique qui guide (route, plan de table, toilettes), puis celle qui décore si le temps et le budget le permettent. Une police et une palette communes suffisent à donner l'air soigné, même à des panneaux faits maison.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Le tableau du plan de table découle directement de votre placement : voir notre [guide complet du plan de table](/blog/plan-de-table-mariage-guide-complet) et, pour l'intitulé des tables, [noms et numéros de tables](/blog/noms-numeros-tables-mariage). Le fléchage routier prolonge la logistique d'arrivée détaillée dans [le parking des invités](/blog/parking-invites-mariage). Et pour garder une signalétique cohérente, appuyez-vous sur [définir le thème de votre mariage](/blog/definir-theme-mariage-5-etapes).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Signage is all the signs that guide and inform your guests: from the arrow staked at the roadside to the little card marking the cloakroom. It's barely noticed when done well, and very much so when missing, because a guest who is lost or hunting for the toilets is never quite in the party.",
          "The trap is wanting to do everything and ending up with fifteen calligraphed signs, half of them useless. The right idea is to separate useful signage, which truly guides, from decorative signage, pleasant but optional, and to keep the whole on theme.",
        ],
      },
      {
        type: "list",
        title: "The signage that's truly useful",
        items: [
          "Roadside arrows from the last village to the lot, for venues lost in the countryside",
          "The welcome sign at the entrance, which sets the tone and confirms guests are in the right place",
          "The seating board, at the room's entrance, so everyone finds their table without a jam",
          "Table names or numbers, visible from afar, to spot your seat once inside",
          "A few small functional signs: bar, cloakroom, toilets, guest book, photobooth",
        ],
      },
      {
        type: "text",
        title: "The seating board, the centerpiece",
        paragraphs: [
          "If you kept only one indoor sign, it would be this. At the room's entrance, it tells each guest which table they're at, avoiding the awkward moment where everyone circles around hunting for their name. List guests alphabetically pointing to a table number or name, the most legible format.",
          "This board pairs naturally with the table names: if your tables carry names (cities, flowers, films) rather than numbers, the board must use exactly the same labels. A nicely presented seating board is also one of the rare pieces of signage that becomes a genuine decorative element.",
        ],
      },
      {
        type: "text",
        title: "What to make yourself, what to delegate",
        paragraphs: [
          "A large part of signage lends itself well to DIY: a lovely calligraphed welcome sign, painted wooden arrows, small cards printed at home. It's an area where DIY makes sense, because imperfection reads fine here and the budget can climb fast if you have everything printed.",
          "A few pieces, though, gain from being entrusted to a professional or given extra care: the large seating board, much looked at and photographed, and any mirror or calligraphed panel that becomes a decor piece in its own right. The rest can stay simple with no one complaining.",
        ],
      },
      {
        type: "text",
        title: "Keeping it all on theme",
        paragraphs: [
          "Consistency makes all the difference: signage that reuses the same font, palette, and materials as your invitations and decor gives an impression of a polished whole, even with very plain signs. Conversely, five signs in five different styles look messy, however pretty taken one by one.",
          "So pick two or three graphic elements (a font, a color, a motif) and carry them across all the signage. That's the thread linking the roadside arrow to the little toilet sign, and what makes your wedding recognizable at a glance.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Make the signage that guides first (road, seating board, toilets), then the signage that decorates if time and budget allow. A shared font and palette are enough to look polished, even on homemade signs.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "The seating board follows directly from your seating: see our [full seating-chart guide](/blog/plan-de-table-mariage-guide-complet) and, for table labels, [table names and numbers](/blog/noms-numeros-tables-mariage). Roadside arrows extend the arrival logistics covered in [guest parking](/blog/parking-invites-mariage). And to keep signage consistent, lean on [defining your wedding theme](/blog/definir-theme-mariage-5-etapes).",
        ],
      },
    ],
  }),

  postPair({
    slug: "toilettes-sanitaires-mariage-exterieur",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "Toilettes et sanitaires pour un mariage en extérieur sans installations",
    titleEn: "Toilets and sanitation for an outdoor wedding with no facilities",
    excerptFr:
      "Combien de cabines pour votre nombre d'invités, roulottes de luxe ou cabines basiques, eau et lave-mains, où les placer avec discrétion, et comment budgéter ce poste souvent oublié d'un mariage au chapiteau.",
    excerptEn:
      "How many units for your guest count, luxury trailers or basic cabins, water and handwashing, where to place them discreetly, and how to budget this often-forgotten item of a marquee wedding.",
    readingMinutes: 7,
    heroAltFr: "Roulotte sanitaire de location installée près d'un chapiteau de mariage",
    heroAltEn: "Restroom trailer set up beside a wedding marquee",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Un mariage dans un champ, sous un chapiteau ou dans un jardin sans installations pose une question très concrète qu'on préfère souvent repousser : où vont les invités quand ils ont besoin des toilettes. Sur un lieu sans sanitaires, c'est un poste à louer, à dimensionner et à budgéter comme un autre, pas un détail à régler la dernière semaine.",
          "La bonne nouvelle, c'est que l'offre de location est large, du simple cabinet autonome à la roulotte avec lavabos, miroirs et lumière. La mauvaise, c'est qu'un sanitaire sous-dimensionné ou mal placé se remarque immédiatement. Quelques repères permettent de commander juste.",
        ],
      },
      {
        type: "text",
        title: "Combien de cabines pour votre nombre d'invités",
        paragraphs: [
          "L'ordre de grandeur communément retenu est d'une cabine pour vingt-cinq à cinquante personnes, à moduler selon la durée. Un mariage étant un événement long, avec apéritif, dîner et boissons jusque tard, on se cale plutôt sur le bas de la fourchette et on majore. En pratique, comptez de l'ordre de quatre cabines pour cent invités, cinq à six pour cent cinquante à deux cents, plus une cabine accessible aux personnes à mobilité réduite.",
          "Ces chiffres restent indicatifs : ils varient selon le loueur, la durée réelle et la consommation de boissons. Demandez toujours l'avis du prestataire, qui connaît ses modèles et saura ajuster. Mieux vaut une cabine de trop qu'une file d'attente qui gâche la soirée.",
        ],
      },
      {
        type: "list",
        title: "Cabine basique ou roulotte de luxe",
        items: [
          "La cabine autonome simple (type chantier amélioré) : la moins chère, sans eau courante, à réserver aux petits budgets ou en complément",
          "La cabine de standing avec chasse d'eau et lave-mains intégré : le bon compromis confort et prix pour la plupart des mariages",
          "La roulotte sanitaire de luxe : plusieurs cabinets, lavabos, miroirs, éclairage et chauffage, tirée par un véhicule et raccordée",
          "Dans tous les cas, une cabine accessible aux personnes à mobilité réduite, plus large et de plain-pied",
        ],
      },
      {
        type: "text",
        title: "Eau, lave-mains et propreté",
        paragraphs: [
          "Le point qui fait la différence entre un sanitaire correct et un sanitaire désagréable, c'est l'eau. Vérifiez que chaque solution comprend de quoi se laver les mains : lavabo intégré, cuve d'eau autonome ou point d'eau à proximité. Prévoyez savon, essuie-mains et un éclairage suffisant, surtout pour la fin de soirée.",
          "Sur un événement long, demandez au loueur comment se gère l'entretien : certaines prestations incluent un passage en cours de soirée, d'autres non. Pour un grand mariage, un entretien en milieu de soirée change nettement le confort ressenti. C'est une question à poser explicitement avant de signer.",
        ],
      },
      {
        type: "text",
        title: "Où les placer, avec discrétion",
        paragraphs: [
          "L'emplacement compte autant que le nombre. Les sanitaires doivent être proches et faciles à trouver, mais un peu à l'écart de la piste et des tables : ni collés au buffet, ni au bout d'un champ non éclairé. Un chemin balisé et éclairé jusqu'aux cabines évite les recherches à tâtons une fois la nuit tombée.",
          "Pensez aussi à l'accès du camion de livraison et, pour une roulotte, au raccordement en eau et parfois en électricité. Si vos invités sont répartis sur plusieurs espaces, il vaut souvent mieux deux points sanitaires distincts qu'un seul bloc lointain. Le lieu ou le loueur vous conseillera sur le meilleur emplacement.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Les sanitaires de location ne sont pas un détail honteux à cacher : c'est un poste à part entière d'un mariage en extérieur. Dimensionnez large (une cabine pour vingt-cinq à cinquante invités), assurez l'eau et l'éclairage, et budgétez-le dès le devis du chapiteau.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Les sanitaires font partie de la même logistique brute que le reste d'un mariage sans installations : voir [louer un chapiteau ou une tente](/blog/chapiteau-tente-location-mariage) et [l'électricité pour un mariage en extérieur](/blog/electricite-mariage-exterieur), souvent commandés au même moment. Pour un mariage chez soi, [le mariage à la maison ou au jardin](/blog/mariage-a-la-maison-jardin) rappelle ce que l'on doit apporter. Intégrez ce poste dans la [répartition du budget par poste](/blog/repartition-budget-mariage-par-poste).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A wedding in a field, under a marquee, or in a garden with no facilities raises a very concrete question people prefer to put off: where do guests go when they need the toilet. At a venue with no sanitation, it's an item to rent, size, and budget like any other, not a detail to settle the final week.",
          "The good news is that the rental offer is wide, from a simple standalone cabin to a trailer with sinks, mirrors, and lighting. The bad news is that an undersized or badly placed unit shows immediately. A few benchmarks let you order right.",
        ],
      },
      {
        type: "text",
        title: "How many units for your guest count",
        paragraphs: [
          "The commonly used order of magnitude is one unit per twenty-five to fifty people, adjusted for duration. Since a wedding is a long event, with drinks, dinner, and a bar running late, you settle toward the lower end and add a margin. In practice, count on the order of four units for a hundred guests, five to six for a hundred and fifty to two hundred, plus one unit accessible to guests with reduced mobility.",
          "These figures stay indicative: they vary with the supplier, the real duration, and how much people drink. Always ask the provider's advice, they know their models and will adjust. Better one unit too many than a queue that spoils the evening.",
        ],
      },
      {
        type: "list",
        title: "Basic cabin or luxury trailer",
        items: [
          "The plain standalone cabin (upgraded worksite type): the cheapest, no running water, for tight budgets or as a supplement",
          "The upgraded cabin with a flush and built-in handwash: the good comfort-to-price compromise for most weddings",
          "The luxury restroom trailer: several stalls, sinks, mirrors, lighting, and heating, towed by a vehicle and hooked up",
          "In every case, a unit accessible to guests with reduced mobility, wider and step-free",
        ],
      },
      {
        type: "text",
        title: "Water, handwashing, and cleanliness",
        paragraphs: [
          "The thing that separates a decent unit from an unpleasant one is water. Check that each option includes a way to wash hands: a built-in sink, a standalone water tank, or a nearby water point. Provide soap, hand towels, and enough lighting, especially for the late evening.",
          "For a long event, ask the supplier how servicing is handled: some services include a mid-evening cleaning, others don't. For a large wedding, a mid-evening service clearly improves the felt comfort. It's a question to ask explicitly before signing.",
        ],
      },
      {
        type: "text",
        title: "Where to place them, discreetly",
        paragraphs: [
          "Location matters as much as number. The units should be close and easy to find, but a little away from the dancefloor and tables: neither jammed against the buffet, nor at the end of an unlit field. A marked, lit path to the units avoids fumbling around once night falls.",
          "Also think of the delivery truck's access and, for a trailer, the water and sometimes power hookup. If your guests are spread across several areas, two separate sanitation points often beat one distant block. The venue or supplier will advise on the best spot.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Rental toilets aren't a shameful detail to hide: they're a full item of an outdoor wedding. Size generously (one unit per twenty-five to fifty guests), ensure water and lighting, and budget it as early as the marquee quote.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Sanitation is part of the same raw logistics as the rest of a no-facilities wedding: see [renting a marquee or tent](/blog/chapiteau-tente-location-mariage) and [power for an outdoor wedding](/blog/electricite-mariage-exterieur), often ordered at the same time. For a wedding at home, [the at-home or garden wedding](/blog/mariage-a-la-maison-jardin) recalls what you must bring in. Fold this item into your [budget breakdown by line item](/blog/repartition-budget-mariage-par-poste).",
        ],
      },
    ],
  }),

  postPair({
    slug: "electricite-mariage-exterieur",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "L'électricité pour un mariage en extérieur : groupe électrogène et sécurité",
    titleEn: "Power for an outdoor wedding: generator and safety",
    excerptFr:
      "Traiteur, éclairage, sonorisation, réfrigération : sur un lieu brut, tout tire du courant. Comment dimensionner un groupe électrogène, choisir un modèle silencieux, sécuriser les câbles et répartir les charges avec les prestataires.",
    excerptEn:
      "Catering, lighting, sound, refrigeration: at a raw venue, everything draws power. How to size a generator, choose a silent unit, secure the cabling, and split the load with your vendors.",
    readingMinutes: 7,
    heroAltFr: "Groupe électrogène silencieux alimentant un chapiteau de mariage la nuit",
    heroAltEn: "Silent generator powering a wedding marquee at night",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Un lieu de mariage brut (champ, grange sans installation, jardin isolé) est magnifique jusqu'au moment où l'on branche le premier appareil et où rien ne se passe. Le traiteur, l'éclairage, la sonorisation, les frigos : tout consomme du courant, et un simple branchement domestique ne suffit presque jamais à alimenter une soirée entière.",
          "L'électricité est donc un poste technique à part entière, souvent résolu par un groupe électrogène. Bien dimensionné, il fait tourner la fête sans qu'on l'entende ni qu'on y pense ; sous-dimensionné, il disjoncte au pire moment, en plein service ou en pleine piste. Quelques repères évitent la panne.",
        ],
      },
      {
        type: "list",
        title: "Ce qui tire du courant sur un mariage",
        items: [
          "Le traiteur, souvent le plus gros consommateur : fours, plaques, chauffe-plats (sauf s'il cuisine au gaz)",
          "La réfrigération : frigos, chambres froides, tireuses à bière, qui tournent en continu",
          "La sonorisation et l'éclairage du DJ ou du groupe, à alimenter en courant stable et propre",
          "L'éclairage d'ambiance : guirlandes, spots, lumières du chapiteau et des extérieurs",
          "Le chauffage ou la climatisation d'appoint selon la saison, gros postes s'ils sont électriques",
        ],
      },
      {
        type: "text",
        title: "Dimensionner le groupe électrogène",
        paragraphs: [
          "La méthode consiste à additionner la puissance de tous les appareils, puis à choisir un groupe dont la capacité dépasse légèrement ce total, pour absorber les pics de démarrage sans surcharge. À titre d'ordre de grandeur souvent cité, un groupe autour de 10 kVA peut couvrir un mariage de cent à cent cinquante personnes avec son, lumière et traiteur, tandis que les grosses réceptions montent vers 20 à 60 kVA, un modèle de 50 kVA alimentant sans peine un office traiteur et un parc son-lumière conséquents.",
          "Ces chiffres ne remplacent pas un calcul réel : le traiteur qui cuisine au gaz change tout, comme un chauffage électrique en hiver. Faites la liste des puissances avec chaque prestataire, puis confiez le dimensionnement au loueur du groupe, qui saura recommander le bon modèle avec une marge de sécurité.",
        ],
      },
      {
        type: "text",
        title: "Silencieux plutôt que standard",
        paragraphs: [
          "Un groupe électrogène de chantier classique fait un bruit qui gâche une soirée. Pour un mariage, on choisit un modèle dit silencieux ou insonorisé, et on le place suffisamment loin des tables et de la piste, idéalement derrière un obstacle qui coupe le son. Les groupes de type inverter fournissent en plus un courant plus stable, qui protège le matériel de sonorisation sensible.",
          "Pensez aussi à l'autonomie et au carburant : un groupe consomme, et une panne sèche en pleine nuit est aussi fâcheuse qu'une surcharge. Vérifiez avec le loueur l'autonomie du réservoir sur la durée réelle de votre fête, et prévoyez le plein ou le réapprovisionnement nécessaire.",
        ],
      },
      {
        type: "text",
        title: "Sécuriser les câbles et répartir les charges",
        paragraphs: [
          "Un mariage en extérieur, c'est des dizaines de mètres de câbles qui traversent des zones de passage. La sécurité impose de les protéger : passe-câbles au sol aux endroits piétonniers, câbles surélevés ou plaqués le long des structures ailleurs, rien qui traîne dans une flaque. Un différentiel adapté et du matériel prévu pour l'extérieur ne sont pas négociables.",
          "Côté organisation, répartissez les charges entre plusieurs circuits plutôt que de tout brancher sur une seule ligne : le traiteur sur l'un, le DJ sur un autre, l'éclairage sur un troisième. Cela évite qu'un four qui démarre ne fasse sauter la sono. Coordonnez ce plan de charges en amont avec le traiteur, le DJ et le loueur du groupe.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "L'électricité d'un mariage brut ne s'improvise pas. Listez les puissances avec chaque prestataire, confiez le dimensionnement au loueur, choisissez un groupe silencieux avec de la marge, et sécurisez chaque câble : une disjonction en plein service coûte plus cher qu'un modèle un cran au-dessus.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "L'électricité se commande avec le reste de la logistique brute : voir [louer un chapiteau ou une tente](/blog/chapiteau-tente-location-mariage) et [les toilettes pour un mariage en extérieur](/blog/toilettes-sanitaires-mariage-exterieur), souvent du même loueur. La partie son et lumière est détaillée dans [la sonorisation et l'éclairage de la soirée](/blog/sonorisation-eclairage-soiree-mariage). Pensez à cadrer chaque prestation par écrit grâce à [les clauses du contrat prestataire à vérifier](/blog/contrat-prestataire-clauses-verifier).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A raw wedding venue (a field, a barn with no fittings, an isolated garden) is magnificent until the moment you plug in the first appliance and nothing happens. The caterer, the lighting, the sound, the fridges: everything draws power, and a plain domestic outlet almost never suffices to run a whole evening.",
          "Power is therefore a full technical item, often solved with a generator. Well sized, it runs the party without your hearing it or thinking about it; undersized, it trips at the worst moment, mid-service or mid-dancefloor. A few benchmarks avoid the blackout.",
        ],
      },
      {
        type: "list",
        title: "What draws power at a wedding",
        items: [
          "The caterer, often the biggest consumer: ovens, hobs, plate warmers (unless they cook with gas)",
          "Refrigeration: fridges, cold rooms, beer taps, running continuously",
          "The DJ's or band's sound and lighting, needing stable, clean power",
          "Ambient lighting: string lights, spots, marquee and outdoor lights",
          "Backup heating or cooling depending on the season, big items if they're electric",
        ],
      },
      {
        type: "text",
        title: "Sizing the generator",
        paragraphs: [
          "The method is to add up the power of all the appliances, then choose a generator whose capacity slightly exceeds that total, to absorb start-up spikes without overload. As an often-cited order of magnitude, a generator around 10 kVA can cover a wedding of a hundred to a hundred and fifty people with sound, light, and catering, while large receptions climb toward 20 to 60 kVA, a 50 kVA unit easily powering a substantial catering kitchen and sound-light rig.",
          "These figures don't replace a real calculation: a caterer cooking with gas changes everything, as does electric heating in winter. List the power needs with each vendor, then hand the sizing to the generator's rental company, who will recommend the right model with a safety margin.",
        ],
      },
      {
        type: "text",
        title: "Silent rather than standard",
        paragraphs: [
          "A classic worksite generator makes a noise that ruins an evening. For a wedding, you choose a so-called silent or soundproofed model, and place it far enough from the tables and dancefloor, ideally behind an obstacle that cuts the sound. Inverter-type generators also supply steadier power, which protects sensitive sound gear.",
          "Also think of runtime and fuel: a generator consumes, and running dry in the middle of the night is as unwelcome as an overload. Check the tank's runtime against your party's real duration with the supplier, and plan the necessary refueling.",
        ],
      },
      {
        type: "text",
        title: "Securing the cabling and splitting the load",
        paragraphs: [
          "An outdoor wedding means dozens of meters of cable crossing walkways. Safety demands protecting them: cable ramps on the ground at pedestrian points, raised or wall-run cables elsewhere, nothing trailing in a puddle. A suitable residual-current device and outdoor-rated gear aren't negotiable.",
          "On the organizing side, split the load across several circuits rather than plugging everything into one line: the caterer on one, the DJ on another, the lighting on a third. That stops an oven starting up from tripping the sound. Coordinate this load plan in advance with the caterer, DJ, and generator supplier.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Power at a raw venue isn't improvised. List the power needs with each vendor, hand the sizing to the supplier, choose a silent generator with a margin, and secure every cable: a trip mid-service costs more than a model one notch up.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Power is ordered with the rest of the raw logistics: see [renting a marquee or tent](/blog/chapiteau-tente-location-mariage) and [toilets for an outdoor wedding](/blog/toilettes-sanitaires-mariage-exterieur), often from the same supplier. The sound and light side is covered in [sound and lighting for the evening](/blog/sonorisation-eclairage-soiree-mariage). Remember to frame each service in writing with [the vendor-contract clauses to check](/blog/contrat-prestataire-clauses-verifier).",
        ],
      },
    ],
  }),

  postPair({
    slug: "buffet-fromages-mariage",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Le buffet de fromages : quantités, sélection et moment de service",
    titleEn: "The cheese bar: quantities, selection, and when to serve",
    excerptFr:
      "Quantités par invité, une sélection équilibrée, les accompagnements, le servir avec le repas ou tard le soir : comment réussir le buffet de fromages, ce grand classique très français, et bien briefer le traiteur ou le fromager.",
    excerptEn:
      "Quantities per guest, a balanced selection, the accompaniments, serving it with the meal or late in the evening: how to nail the cheese bar, that very French classic, and brief the caterer or cheesemonger.",
    readingMinutes: 6,
    heroAltFr: "Grand buffet de fromages présenté lors d'un mariage",
    heroAltEn: "Large cheese buffet displayed at a wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le buffet de fromages est l'un des grands plaisirs très français d'un mariage. Un bel étal de meules, coulants et pâtes persillées, servi en libre-service, fait toujours son effet et rassemble les invités autour d'un même moment gourmand. C'est aussi une alternative ou un complément au traditionnel plateau servi à table.",
          "Réussir un buffet de fromages tient à peu de choses : les bonnes quantités, une sélection équilibrée plutôt qu'une longue liste, quelques accompagnements bien choisis, et le bon moment de service. Le reste, présentation et étiquettes, n'est qu'un plaisir supplémentaire.",
        ],
      },
      {
        type: "text",
        title: "Quelles quantités par invité",
        paragraphs: [
          "L'ordre de grandeur dépend beaucoup du rôle du fromage. En complément d'un repas déjà copieux, on compte souvent autour de quarante à quatre-vingts grammes de fromage par personne. Si le fromage tient une place plus centrale, façon plateau généreux ou repas à lui seul, la quantité monte nettement, vers cent cinquante à deux cents grammes par convive.",
          "Ces repères restent indicatifs et varient selon l'heure et l'appétit : un buffet de fromages tard dans la soirée, après le dîner et avant la reprise de la piste, se consomme différemment d'un plateau servi juste avant le dessert. Dans le doute, prévoyez un peu large : le fromage se conserve et les restes ne se perdent jamais.",
        ],
      },
      {
        type: "list",
        title: "Composer une sélection équilibrée",
        items: [
          "Viser trois à sept fromages différents : assez pour la variété, sans transformer le buffet en catalogue illisible",
          "Équilibrer les familles : une pâte pressée, une pâte molle à croûte fleurie, une pâte persillée, un fromage de chèvre",
          "Jouer sur les intensités, du plus doux au plus corsé, pour que chacun trouve son goût",
          "Penser aux fromages régionaux, jolie manière d'ancrer le buffet dans votre terroir ou votre histoire",
          "Étiqueter chaque fromage, pratique pour les invités et utile en cas d'allergie ou de régime",
        ],
      },
      {
        type: "text",
        title: "Les accompagnements qui font la différence",
        paragraphs: [
          "Un buffet de fromages sans pain n'est pas un buffet : prévoyez du pain en quantité, idéalement plusieurs sortes (baguette, pain aux noix, pain de campagne). Ajoutez de quoi varier les textures et les saveurs : fruits frais et secs, raisin, figues, confitures ou chutneys, quelques noix. Ces accompagnements subliment le fromage et allègent la note globale.",
          "Un détail souvent oublié : sortir les fromages à l'avance pour qu'ils soient à température, environ une demi-heure avant le service, change tout au goût. Prévoyez aussi assez de couteaux, un par famille de fromage pour ne pas mélanger les saveurs, et de petites assiettes si le buffet remplace un service à table.",
        ],
      },
      {
        type: "text",
        title: "Quand le servir, et bien briefer",
        paragraphs: [
          "Deux logiques cohabitent. Le fromage servi avec le repas, juste avant le dessert, s'inscrit dans le déroulé classique du dîner à la française. Le buffet de fromages en fin de soirée, lui, joue un autre rôle : il tient les invités après le repas, cale les danseurs qui reviennent de la piste, et accompagne la seconde partie de la nuit. Beaucoup de couples optent pour cette version tardive.",
          "Dans tous les cas, briefez précisément votre traiteur ou votre fromager : nombre d'invités, quantité visée, sélection, moment de service et accompagnements. Un fromager de quartier peut composer un buffet sur mesure, parfois plus riche et moins cher que l'option traiteur ; c'est une piste à comparer au moment des devis.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Un beau buffet de fromages, c'est trois à sept fromages bien choisis plutôt qu'une longue liste, sortis à température, avec du pain en quantité et quelques fruits. Décidez tôt s'il vient avec le repas ou tard le soir : ce n'est pas le même rôle ni la même quantité.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Le buffet de fromages se cale dans la même réflexion que le reste du repas : voir [gâteau et pièce montée](/blog/gateau-piece-montee-mariage) et [alternatives à la pièce montée](/blog/dessert-bar-alternatives-piece-montee) pour construire la fin de dîner. Profitez de la [dégustation traiteur](/blog/degustation-traiteur-mariage) pour goûter la sélection, et pensez l'accord avec [les boissons et quantités par invité](/blog/boissons-mariage-champagne-quantites).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The cheese bar is one of the great, very French pleasures of a wedding. A fine spread of wheels, oozing rounds, and blue-veined pastes, served self-service, always makes an impression and gathers guests around a shared gourmet moment. It's also an alternative or complement to the traditional plate served at the table.",
          "Nailing a cheese bar comes down to little: the right quantities, a balanced selection rather than a long list, a few well-chosen accompaniments, and the right serving time. The rest, presentation and labels, is just extra pleasure.",
        ],
      },
      {
        type: "text",
        title: "How much per guest",
        paragraphs: [
          "The order of magnitude depends heavily on the cheese's role. As a complement to an already hearty meal, you often count around forty to eighty grams of cheese per person. If cheese takes a more central place, generous-platter style or a course in itself, the quantity climbs clearly, toward a hundred and fifty to two hundred grams per guest.",
          "These benchmarks stay indicative and vary with the hour and the appetite: a cheese bar late in the evening, after dinner and before the dancefloor resumes, is eaten differently from a plate served just before dessert. When in doubt, plan a little generously: cheese keeps and leftovers are never wasted.",
        ],
      },
      {
        type: "list",
        title: "Composing a balanced selection",
        items: [
          "Aim for three to seven different cheeses: enough for variety, without turning the bar into an unreadable catalogue",
          "Balance the families: a pressed cheese, a soft bloomy-rind cheese, a blue, a goat's cheese",
          "Play on intensities, from mildest to strongest, so everyone finds their taste",
          "Think of regional cheeses, a lovely way to root the bar in your terroir or your story",
          "Label each cheese, handy for guests and useful in case of allergy or a special diet",
        ],
      },
      {
        type: "text",
        title: "The accompaniments that make the difference",
        paragraphs: [
          "A cheese bar without bread isn't a cheese bar: plan plenty of bread, ideally several kinds (baguette, walnut bread, country loaf). Add ways to vary textures and flavors: fresh and dried fruit, grapes, figs, jams or chutneys, a few nuts. These accompaniments lift the cheese and lighten the overall bill.",
          "An often-forgotten detail: taking the cheeses out ahead so they're at room temperature, about half an hour before serving, transforms the taste. Also plan enough knives, one per cheese family so flavors don't mix, and small plates if the bar replaces a seated course.",
        ],
      },
      {
        type: "text",
        title: "When to serve it, and briefing well",
        paragraphs: [
          "Two logics coexist. Cheese served with the meal, just before dessert, fits the classic French dinner flow. The late-evening cheese bar plays another role: it holds the guests after the meal, refuels dancers coming back from the floor, and accompanies the second half of the night. Many couples opt for this later version.",
          "Either way, brief your caterer or cheesemonger precisely: guest count, target quantity, selection, serving time, and accompaniments. A neighborhood cheesemonger can put together a bespoke bar, sometimes richer and cheaper than the caterer's option; it's a lead to compare at quote time.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "A fine cheese bar is three to seven well-chosen cheeses rather than a long list, brought to room temperature, with plenty of bread and some fruit. Decide early whether it comes with the meal or late in the evening: that's not the same role or the same quantity.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "The cheese bar sits in the same thinking as the rest of the meal: see [cake and croquembouche](/blog/gateau-piece-montee-mariage) and [alternatives to the croquembouche](/blog/dessert-bar-alternatives-piece-montee) to build the end of dinner. Use the [caterer tasting](/blog/degustation-traiteur-mariage) to sample the selection, and plan the pairing with [drinks and quantities per guest](/blog/boissons-mariage-champagne-quantites).",
        ],
      },
    ],
  }),

  postPair({
    slug: "bar-a-bonbons-candy-bar-mariage",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Le bar à bonbons : le candy bar sans excès de sucre ni de budget",
    titleEn: "The candy bar: the sweets table without excess sugar or budget",
    excerptFr:
      "Quantités, présentation, le libre-service pour les enfants et les gourmands, les sachets à emporter en cadeau, et comment garder le coût et le sucre raisonnables : le guide du bar à bonbons de mariage.",
    excerptEn:
      "Quantities, presentation, self-service for kids and sweet tooths, take-home favor bags, and how to keep the cost and the sugar sensible: the guide to the wedding candy bar.",
    readingMinutes: 6,
    heroAltFr: "Bar à bonbons coloré en libre-service lors d'un mariage",
    heroAltEn: "Colorful self-service candy bar at a wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le bar à bonbons, ou candy bar, est devenu un classique des mariages : une jolie table de bocaux colorés, en libre-service, où petits et grands piochent au fil de la soirée. C'est ludique, très photogénique, et cela occupe joyeusement les enfants comme les gourmands entre deux danses.",
          "Bien pensé, c'est aussi un poste malin qui peut faire d'une pierre deux coups : servir de coin sucré pendant la fête et de cadeau d'invités, grâce à des sachets à remplir et à emporter. Reste à doser les quantités, à soigner la présentation, et à ne laisser filer ni le budget ni le sucre.",
        ],
      },
      {
        type: "list",
        title: "Prévoir les bonnes quantités",
        items: [
          "Compter grossièrement de l'ordre de cent à cent cinquante grammes de bonbons par invité si tout le monde pioche, un peu moins si un dessert est déjà prévu",
          "Ajuster nettement à la hausse la part enfants, principaux consommateurs du candy bar",
          "Mixer les textures et les goûts : guimauves, dragées, réglisses, fruités acidulés, chocolats, quelques options sans sucre ou moins sucrées",
          "Remplir les bocaux à ras au départ : un bar bien garni fait plus d'effet et se vide moins vite qu'on ne le craint",
        ],
      },
      {
        type: "text",
        title: "Une présentation qui fait l'effet",
        paragraphs: [
          "Le charme du candy bar tient à sa mise en scène. Des bocaux et bonbonnières en verre de tailles variées, posés sur une jolie nappe, avec quelques éléments de hauteur (présentoirs, cloches, chandeliers détournés), suffisent à créer un coin gourmand qui attire l'oeil. Une petite pancarte et un fond décoré complètent le tableau.",
          "Jouez la cohérence avec votre palette de couleurs : un bar à bonbons assorti au thème du mariage rend beaucoup mieux qu'un mélange de tout ce qui traîne. Beaucoup d'accessoires (bocaux, pinces, pelles) se louent ou se réutilisent, ce qui évite d'acheter du matériel pour une seule soirée.",
        ],
      },
      {
        type: "text",
        title: "Le libre-service et les sachets à emporter",
        paragraphs: [
          "L'intérêt du candy bar, c'est le libre-service : chacun se sert quand il veut, sans attendre un service. Prévoyez des pinces ou des petites pelles par bocal, plus hygiéniques que les doigts, et des contenants pour se servir. Un mot amusant invite les invités à composer leur mélange.",
          "L'astuce qui transforme le bar en cadeau : proposer des sachets à remplir et à emporter en fin de soirée. Le candy bar devient alors votre cadeau d'invités, mutualisé avec l'animation. Pensez à des sachets refermables, éventuellement personnalisés à vos prénoms, disposés à côté des bocaux avec une petite consigne.",
        ],
      },
      {
        type: "text",
        title: "Garder le coût et le sucre raisonnables",
        paragraphs: [
          "Le candy bar peut vite chiffrer si l'on multiplie les variétés rares et les contenants achetés neufs. Deux leviers simples : acheter les bonbons en gros plutôt qu'en petits sachets, et louer ou emprunter la verrerie. Une sélection resserrée de six à huit sortes bien choisies rend mieux qu'un déballage tous azimuts, et coûte moins cher.",
          "Côté sucre, un peu de mesure fait du bien, surtout avec des enfants et un dessert déjà copieux. Glissez quelques options moins sucrées (fruits secs, guimauves nature, chocolats) et ne visez pas la montagne : un bar généreux mais raisonnable est plus élégant, et il en reste rarement autant qu'on l'imagine.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Un bon candy bar tient dans une sélection resserrée, une jolie verrerie louée, et des sachets à emporter qui en font aussi votre cadeau d'invités. Inutile de viser la montagne de sucre : généreux mais raisonnable rend mieux et coûte moins cher.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Le bar à bonbons dialogue avec le reste du sucré et des animations : voir [les alternatives à la pièce montée](/blog/dessert-bar-alternatives-piece-montee) pour éviter le doublon de desserts, et [les enfants au mariage](/blog/enfants-au-mariage-animation), pour qui le candy bar est souvent le clou de la soirée. Pensez la présentation avec [planifier la décoration de la salle](/blog/decoration-salle-reception-planifier) et [la location de décoration](/blog/location-decoration-mariage).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The candy bar has become a wedding classic: a pretty table of colorful jars, self-service, where young and old dip in through the evening. It's playful, very photogenic, and it happily keeps children and sweet tooths busy between dances.",
          "Well thought out, it's also a clever item that can do two things at once: serve as a sweet corner during the party and as a guest favor, thanks to bags to fill and take home. What's left is dosing the quantities, caring for the presentation, and letting neither the budget nor the sugar run away.",
        ],
      },
      {
        type: "list",
        title: "Planning the right quantities",
        items: [
          "Roughly count on the order of a hundred to a hundred and fifty grams of sweets per guest if everyone dips in, a little less if a dessert is already planned",
          "Clearly raise the children's share, the candy bar's main consumers",
          "Mix textures and tastes: marshmallows, sugared almonds, licorice, tangy fruits, chocolates, a few sugar-free or less-sweet options",
          "Fill the jars to the brim at the start: a well-stocked bar makes more of an impression and empties slower than you fear",
        ],
      },
      {
        type: "text",
        title: "A presentation that lands",
        paragraphs: [
          "The candy bar's charm is in its staging. Glass jars and candy dishes in varied sizes, set on a pretty cloth, with a few elements of height (stands, cloches, repurposed candlesticks), are enough to create a sweet corner that catches the eye. A little sign and a decorated backdrop complete the picture.",
          "Play the consistency with your color palette: a candy bar matched to the wedding theme reads far better than a jumble of whatever's lying around. Many accessories (jars, tongs, scoops) can be rented or reused, avoiding buying gear for a single night.",
        ],
      },
      {
        type: "text",
        title: "Self-service and take-home bags",
        paragraphs: [
          "The point of the candy bar is self-service: everyone helps themselves whenever they like, with no wait. Provide tongs or small scoops per jar, more hygienic than fingers, and containers to serve into. A playful note invites guests to build their own mix.",
          "The trick that turns the bar into a favor: offering bags to fill and take home at the end of the evening. The candy bar then becomes your guest favor, merged with the entertainment. Think of resealable bags, possibly personalized with your first names, set beside the jars with a small instruction.",
        ],
      },
      {
        type: "text",
        title: "Keeping the cost and the sugar sensible",
        paragraphs: [
          "The candy bar can add up fast if you multiply rare varieties and containers bought new. Two simple levers: buy the sweets in bulk rather than small bags, and rent or borrow the glassware. A tight selection of six to eight well-chosen kinds reads better than an all-out spread, and costs less.",
          "On the sugar side, a bit of restraint does good, especially with children and an already hearty dessert. Slip in a few less-sweet options (dried fruit, plain marshmallows, chocolates) and don't aim for a mountain: a generous but sensible bar is more elegant, and there's rarely as much left as you imagine.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "A good candy bar comes down to a tight selection, pretty rented glassware, and take-home bags that also make it your guest favor. No need to aim for a mountain of sugar: generous but sensible reads better and costs less.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "The candy bar talks to the rest of the sweets and entertainment: see [alternatives to the croquembouche](/blog/dessert-bar-alternatives-piece-montee) to avoid a dessert overlap, and [children at the wedding](/blog/enfants-au-mariage-animation), for whom the candy bar is often the highlight. Plan the presentation with [planning the reception decor](/blog/decoration-salle-reception-planifier) and [renting decor](/blog/location-decoration-mariage).",
        ],
      },
    ],
  }),

  postPair({
    slug: "soins-homme-marie-avant-mariage",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Les soins du marié avant le jour J : une préparation simple et sans excès",
    titleEn: "The groom's grooming before the day: a simple routine, no overdoing it",
    excerptFr:
      "Peau, barbe et coupe de cheveux au bon moment (pas la veille), mains soignées, une routine légère les semaines d'avant : le guide de préparation du marié, en miroir des guides beauté de la mariée, sans en faire trop.",
    excerptEn:
      "Skin, beard, and haircut at the right time (not the day before), tidy hands, a light routine in the weeks before: the groom's prep guide, mirroring the bride's beauty guides, without overdoing it.",
    readingMinutes: 6,
    heroAltFr: "Futur marié se préparant devant un miroir le matin du mariage",
    heroAltEn: "Groom-to-be getting ready in front of a mirror on the wedding morning",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "On parle beaucoup de la préparation beauté de la mariée, rarement de celle du marié. Pourtant, lui aussi sera regardé, photographié de près, et content d'être à son avantage sur les images qui resteront. La bonne nouvelle : sa préparation est simple, peu coûteuse, et ne demande ni bouleversement ni produits compliqués.",
          "L'esprit de ce guide est celui des articles beauté de la mariée : quelques gestes de bon sens, calés au bon moment, plutôt qu'une transformation de dernière minute. L'objectif n'est pas de se métamorphoser, mais d'arriver reposé, net et à l'aise, sans en faire trop.",
        ],
      },
      {
        type: "text",
        title: "La peau, quelques semaines avant",
        paragraphs: [
          "Une belle peau ne se fabrique pas la veille, elle se prépare tranquillement les semaines d'avant. Rien de compliqué : nettoyer son visage matin et soir, hydrater avec une crème simple, et boire assez d'eau suffisent à donner un teint plus net. Si vous vous rasez, une lame propre et une crème apaisante limitent les irritations.",
          "Le piège classique est de tester un produit nouveau ou un soin agressif juste avant le mariage : un gommage trop fort ou un masque inhabituel peut réagir au mauvais moment. Règle d'or, la même que pour la mariée : rien de nouveau dans les jours qui précèdent, on s'en tient à ce que la peau connaît.",
        ],
      },
      {
        type: "list",
        title: "Barbe et cheveux, une question de timing",
        items: [
          "Faire sa coupe de cheveux environ une à deux semaines avant, jamais la veille : une coupe a besoin de quelques jours pour retomber naturellement",
          "Prévoir éventuellement une seconde coupe légère quelques jours avant si les cheveux poussent vite",
          "Pour une barbe, la faire tailler et mettre en forme par un barbier deux à trois jours avant, pas le matin même",
          "Pour un visage rasé de près, se raser le matin du jour J avec une lame neuve, après une douche chaude qui assouplit le poil",
          "Ne pas tenter un changement radical de style (barbe rasée, coupe très différente) juste avant : le jour J n'est pas le moment de l'essai",
        ],
      },
      {
        type: "text",
        title: "Les mains, souvent oubliées",
        paragraphs: [
          "Les mains du marié sont très présentes sur les photos : échange des alliances, mains jointes, gros plans. Elles méritent un minimum d'attention. Des ongles courts et propres, des cuticules nettes, une crème hydratante les jours d'avant si la peau est sèche : c'est peu de choses et cela se voit sur les clichés rapprochés.",
          "Pas besoin d'institut si l'idée vous rebute : un soin maison la veille suffit largement, ou une manucure simple pour homme si vous préférez déléguer. L'important est d'y penser, car c'est exactement le genre de détail que l'on remarque une fois qu'il est négligé, jamais quand il est soigné.",
        ],
      },
      {
        type: "text",
        title: "Une routine légère, sans en faire trop",
        paragraphs: [
          "Le meilleur allié du marié n'est pas un produit, c'est le repos. Un sommeil correct les nuits d'avant, un peu d'exercice et une alimentation raisonnable feront plus pour la mine que n'importe quel soin. Modérez l'alcool et le sel la veille, qui marquent le visage au réveil, et hydratez-vous bien.",
          "Surtout, ne transformez pas votre préparation en corvée anxiogène. Deux ou trois gestes réguliers valent mieux qu'une routine ambitieuse abandonnée au bout de trois jours. L'idée est d'arriver détendu et à son avantage, pas d'ajouter une source de stress à une période déjà chargée.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "La préparation du marié tient en trois idées : anticiper la coupe et la barbe (jamais la veille), soigner peau et mains sans rien tester de nouveau, et surtout bien dormir. Le repos fait plus pour la mine que n'importe quel produit.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "La préparation du marié va de pair avec le reste de sa tenue et du couple : voir notre [guide du costume du marié](/blog/costume-marie-guide) pour l'allure d'ensemble. Côté soins, les principes rejoignent ceux des guides mariée, [les mains et les ongles avant le mariage](/blog/beaute-mains-ongles-avant-mariage) et [préparer sa peau et sa forme](/blog/forme-peau-avant-mariage-preparer). Et pour arriver reposé le jour J, [gérer le stress des préparatifs](/blog/gerer-stress-mariage-serenite).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "There's plenty of talk about the bride's beauty prep, rarely about the groom's. Yet he too will be looked at, photographed up close, and glad to look his best in the images that will last. The good news: his prep is simple, inexpensive, and needs neither upheaval nor complicated products.",
          "The spirit of this guide is that of the bride's beauty articles: a few common-sense steps, timed right, rather than a last-minute transformation. The goal isn't to reinvent yourself, but to arrive rested, tidy, and at ease, without overdoing it.",
        ],
      },
      {
        type: "text",
        title: "Skin, a few weeks before",
        paragraphs: [
          "Good skin isn't made the day before, it's prepared quietly over the weeks ahead. Nothing complicated: cleansing your face morning and night, moisturizing with a simple cream, and drinking enough water are enough for a clearer complexion. If you shave, a clean blade and a soothing cream limit irritation.",
          "The classic trap is trying a new product or an aggressive treatment just before the wedding: too harsh a scrub or an unfamiliar mask can react at the wrong moment. Golden rule, the same as for the bride: nothing new in the days before, stick to what the skin knows.",
        ],
      },
      {
        type: "list",
        title: "Beard and hair, a matter of timing",
        items: [
          "Get your haircut about one to two weeks before, never the day before: a cut needs a few days to settle naturally",
          "Possibly plan a light second trim a few days before if your hair grows fast",
          "For a beard, have it trimmed and shaped by a barber two to three days before, not the same morning",
          "For a clean-shaven face, shave on the morning of the day with a fresh blade, after a hot shower that softens the hair",
          "Don't attempt a radical style change (shaving off the beard, a very different cut) right before: the day isn't the moment for the trial",
        ],
      },
      {
        type: "text",
        title: "Hands, often forgotten",
        paragraphs: [
          "The groom's hands feature heavily in the photos: exchanging rings, hands clasped, close-ups. They deserve a minimum of attention. Short, clean nails, tidy cuticles, a moisturizer in the days before if the skin is dry: it's very little and it shows in the close shots.",
          "No need for a salon if the idea puts you off: a home treatment the day before is plenty, or a simple men's manicure if you'd rather delegate. The important thing is to think of it, because it's exactly the kind of detail people notice once it's neglected, never when it's cared for.",
        ],
      },
      {
        type: "text",
        title: "A light routine, without overdoing it",
        paragraphs: [
          "The groom's best ally isn't a product, it's rest. Decent sleep the nights before, a bit of exercise, and reasonable eating will do more for your look than any treatment. Go easy on alcohol and salt the day before, which mark the face on waking, and stay well hydrated.",
          "Above all, don't turn your prep into an anxious chore. Two or three regular steps beat an ambitious routine dropped after three days. The idea is to arrive relaxed and looking your best, not to add a source of stress to an already busy time.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "The groom's prep comes down to three ideas: time the cut and beard ahead (never the day before), care for skin and hands without trying anything new, and above all sleep well. Rest does more for your look than any product.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "The groom's prep goes hand in hand with the rest of his outfit and the couple: see our [groom's suit guide](/blog/costume-marie-guide) for the overall look. On grooming, the principles echo the bride's guides, [hands and nails before the wedding](/blog/beaute-mains-ongles-avant-mariage) and [preparing your skin and shape](/blog/forme-peau-avant-mariage-preparer). And to arrive rested on the day, [managing planning stress](/blog/gerer-stress-mariage-serenite).",
        ],
      },
    ],
  }),
];

export const { fr: POSTS_225_232_FR, en: POSTS_225_232_EN } = pairsToArrays(pairs);
