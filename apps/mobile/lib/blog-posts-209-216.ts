import { postPair, pairsToArrays } from "./blog-posts-shared";

const pairs = [
  postPair({
    slug: "lectures-textes-ceremonie-mariage",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Lectures et textes de cérémonie : bien les choisir",
    titleEn: "Ceremony readings and texts: choosing them well",
    excerptFr:
      "Où trouver un texte, combien en prévoir, qui lit et comment mêler un classique à un mot personnel : la façon de construire des lectures qui sonnent juste, laïques ou religieuses.",
    excerptEn:
      "Where to find a text, how many to plan, who reads, and how to blend a classic with a personal note: how to build readings that ring true, secular or religious.",
    readingMinutes: 7,
    heroAltFr: "Proche lisant un texte pendant une cérémonie de mariage",
    heroAltEn: "Loved one reading a text during a wedding ceremony",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Les lectures donnent à une cérémonie sa couleur : un même déroulé peut être solennel ou léger selon les textes choisis et la façon dont ils sont dits. Elles servent aussi à impliquer les proches, en confiant à chacun un moment bien à lui.",
          "Le mariage civil laisse peu de place aux textes libres, mais une cérémonie laïque ou religieuse s'écrit en grande partie autour d'eux. Le travail n'est pas de trouver le plus beau texte du monde : c'est de choisir des mots qui vous ressemblent et que vos proches sauront porter.",
        ],
      },
      {
        type: "list",
        title: "Où trouver vos textes",
        items: [
          "Les grands classiques de la littérature et de la poésie, souvent libres de droits, faciles à trouver et reconnaissables par les invités",
          "Les textes religieux, quand la cérémonie est confessionnelle : l'officiant propose en général une liste de lectures adaptées",
          "Les extraits de chansons, de films ou de romans qui comptent pour vous, à condition qu'ils se tiennent une fois lus à voix haute",
          "Un texte écrit sur mesure par un proche ou par vous-mêmes, souvent le passage le plus émouvant de la cérémonie",
        ],
      },
      {
        type: "text",
        title: "Combien de lectures prévoir",
        paragraphs: [
          "Trois à cinq textes suffisent pour la plupart des cérémonies laïques. En dessous, le déroulé peut sembler trop court ; au-dessus, l'attention des invités décroche et la cérémonie s'étire. Comptez environ deux à trois minutes par lecture pour estimer la durée réelle.",
          "Alternez les registres pour garder du rythme : un texte grave suivi d'un passage plus léger, une lecture longue équilibrée par une plus courte. Une cérémonie qui ne joue que sur l'émotion finit par la diluer.",
        ],
      },
      {
        type: "text",
        title: "Qui lit, et comment le lui demander",
        paragraphs: [
          "Confier une lecture est une façon d'honorer un proche sans lui donner de rôle logistique. Choisissez des personnes à l'aise à l'oral, ou au moins prêtes à répéter, et laissez-leur le choix d'accepter : lire devant une assemblée n'est pas confortable pour tout le monde.",
          "Donnez le texte plusieurs semaines à l'avance, imprimé en gros caractères, et précisez le moment exact où la personne interviendra. Un lecteur qui découvre son texte le matin même bafouille souvent, même avec les meilleures intentions.",
        ],
      },
      {
        type: "text",
        title: "Mêler un classique et un texte personnel",
        paragraphs: [
          "La combinaison qui fonctionne le mieux associe souvent un texte reconnu, qui pose un cadre, et un mot personnel, qui apporte l'émotion. Le classique rassure et donne une assise ; le texte sur mesure raconte votre histoire à vous.",
          "Si vous écrivez ce texte personnel, gardez-le court et concret. Une anecdote précise touche davantage qu'une accumulation de belles formules. Lisez-le à voix haute avant de le valider : à l'écrit et à l'oral, un texte ne rend jamais tout à fait pareil.",
        ],
      },
      {
        type: "list",
        title: "Répéter la lecture pour qu'elle porte",
        items: [
          "Lire le texte à voix haute au moins deux ou trois fois, pour repérer les phrases qui accrochent et les respirations à marquer",
          "Vérifier le micro et le placement avec le lieu ou l'officiant : un beau texte inaudible ne sert à rien",
          "Prévoir une copie de secours confiée à l'officiant, au cas où le lecteur oublie la sienne ou se trouble",
          "Ralentir volontairement le débit le jour J : l'émotion et le trac accélèrent presque toujours la lecture",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Un texte simple, lu lentement et clairement, touche plus qu'un texte magnifique récité trop vite. Choisissez pour la voix qui va le porter, pas seulement pour la beauté sur le papier.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Les lectures se calent d'abord dans le déroulé de la cérémonie : pour une cérémonie symbolique, voir [choisir et préparer un officiant de cérémonie laïque](/blog/ceremonie-laique-choisir-officiant), et pour une cérémonie religieuse, [préparer une cérémonie religieuse catholique](/blog/ceremonie-religieuse-catholique-preparer). La [musique de cérémonie](/blog/musique-ceremonie-mariage) s'accorde ensuite avec les textes pour rythmer les moments clés. Dans Fiancé, notez qui lit quoi et à quel moment dans le [planning du jour J](/blog/planning-jour-j-minute-par-minute).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Readings give a ceremony its color: the same run of show can feel solemn or light depending on the texts chosen and how they're delivered. They're also a way to involve loved ones, giving each one a moment of their own.",
          "A civil marriage leaves little room for free texts, but a secular or religious ceremony is largely written around them. The work isn't to find the most beautiful text in the world: it's to choose words that sound like you and that your loved ones can carry.",
        ],
      },
      {
        type: "list",
        title: "Where to find your texts",
        items: [
          "The great classics of literature and poetry, often copyright-free, easy to find and recognizable to guests",
          "Religious texts, when the ceremony is faith-based: the officiant usually suggests a list of suitable readings",
          "Excerpts from songs, films, or novels that matter to you, provided they hold up read aloud",
          "A text written from scratch by a loved one or by you, often the most moving passage of the ceremony",
        ],
      },
      {
        type: "text",
        title: "How many readings to plan",
        paragraphs: [
          "Three to five texts are enough for most secular ceremonies. Fewer, and the run of show can feel too short; more, and guests' attention drifts and the ceremony drags. Count about two to three minutes per reading to estimate the real length.",
          "Alternate registers to keep the rhythm: a serious text followed by a lighter passage, a long reading balanced by a shorter one. A ceremony that plays only on emotion eventually dilutes it.",
        ],
      },
      {
        type: "text",
        title: "Who reads, and how to ask",
        paragraphs: [
          "Entrusting a reading is a way to honor a loved one without giving them a logistical role. Choose people comfortable speaking aloud, or at least willing to rehearse, and let them decline: reading before a crowd isn't comfortable for everyone.",
          "Give the text several weeks ahead, printed in large type, and specify the exact moment the person will step in. A reader who discovers their text the morning of often stumbles, even with the best intentions.",
        ],
      },
      {
        type: "text",
        title: "Blending a classic and a personal text",
        paragraphs: [
          "The combination that works best often pairs a recognized text, which sets a frame, with a personal note, which brings the emotion. The classic reassures and gives a footing; the custom text tells your own story.",
          "If you write that personal text, keep it short and concrete. One precise anecdote moves people more than a pile of fine phrases. Read it aloud before locking it in: on paper and out loud, a text never quite lands the same way.",
        ],
      },
      {
        type: "list",
        title: "Rehearsing the reading so it carries",
        items: [
          "Read the text aloud at least two or three times, to spot the phrases that snag and the pauses to mark",
          "Check the microphone and placement with the venue or officiant: a fine text no one can hear is useless",
          "Have a backup copy handed to the officiant, in case the reader forgets theirs or freezes",
          "Deliberately slow the pace on the day: emotion and nerves almost always speed a reading up",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "A simple text, read slowly and clearly, moves people more than a magnificent one rattled off too fast. Choose for the voice that will carry it, not just for beauty on paper.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Readings first fit into the ceremony's run of show: for a symbolic ceremony, see [choosing and preparing a secular-ceremony officiant](/blog/ceremonie-laique-choisir-officiant), and for a religious one, [preparing a Catholic religious ceremony](/blog/ceremonie-religieuse-catholique-preparer). The [ceremony music](/blog/musique-ceremonie-mariage) then pairs with the texts to pace the key moments. In Fiancé, note who reads what and when in your [wedding-day timeline](/blog/planning-jour-j-minute-par-minute).",
        ],
      },
    ],
  }),

  postPair({
    slug: "musique-ceremonie-mariage",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "La musique de cérémonie : entrée, signature, sortie",
    titleEn: "Ceremony music: entrance, signing, exit",
    excerptFr:
      "Distincte de la playlist de soirée, la musique de cérémonie ponctue l'entrée, la signature des registres et la sortie. Live ou enregistrée, combien de morceaux, et comment gérer le son en extérieur.",
    excerptEn:
      "Distinct from the reception playlist, ceremony music marks the entrance, the signing of the register, and the exit. Live or recorded, how many pieces, and how to handle sound outdoors.",
    readingMinutes: 7,
    heroAltFr: "Musiciens jouant pendant une cérémonie de mariage",
    heroAltEn: "Musicians playing during a wedding ceremony",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "La musique de cérémonie n'a rien à voir avec la playlist de soirée. Elle ne sert pas à faire danser, mais à souligner des moments précis : l'entrée des mariés, la signature des registres, la sortie. Bien choisie, elle porte l'émotion sans qu'on ait à en rajouter.",
          "C'est un poste qu'on prépare tôt et à part du DJ, car il touche au déroulé de la cérémonie elle-même, pas à l'ambiance dansante. Quelques morceaux bien placés valent mieux qu'une longue liste qui noie les temps forts.",
        ],
      },
      {
        type: "list",
        title: "Les moments à sonoriser",
        items: [
          "L'entrée : le morceau le plus attendu, qui accompagne l'arrivée des mariés ou du cortège",
          "Les intermèdes entre les prises de parole et les lectures, pour laisser respirer la cérémonie",
          "La signature des registres, un temps plus long où la musique comble un moment sans parole",
          "La sortie : un morceau plus enlevé qui lance la transition vers le vin d'honneur",
        ],
      },
      {
        type: "text",
        title: "Live ou enregistrée",
        paragraphs: [
          "La musique enregistrée est simple, fiable et fidèle à la version que vous connaissez. Elle demande juste une bonne sonorisation et une personne dédiée pour lancer chaque morceau au bon moment, sans blanc ni chevauchement.",
          "La musique live (guitare, quatuor à cordes, chanteur, harpe) apporte une présence et une émotion difficiles à égaler. Elle coûte plus cher et suppose de vérifier l'espace, l'alimentation électrique et le répertoire à l'avance. Beaucoup de couples combinent les deux : du live pour l'entrée, de l'enregistré pour les intermèdes.",
        ],
      },
      {
        type: "text",
        title: "Combien de morceaux prévoir",
        paragraphs: [
          "Pour une cérémonie laïque d'une trentaine de minutes, comptez en général quatre à six morceaux : l'entrée, un ou deux intermèdes, la signature, la sortie. Prévoyez chaque fois un morceau un peu plus long que nécessaire : il vaut mieux couper une musique en douceur que se retrouver dans le silence.",
          "Pour un mariage civil, très court, une ou deux musiques suffisent, et la mairie encadre parfois ce qui est possible. Renseignez-vous : toutes les salles des mariages ne disposent pas d'une sonorisation, ni ne l'autorisent.",
        ],
      },
      {
        type: "list",
        title: "Coordonner avec le lieu et l'officiant",
        items: [
          "Vérifier avec le lieu la présence d'une sonorisation, d'une prise électrique et d'un point où placer les musiciens ou l'enceinte",
          "Transmettre à l'officiant l'ordre précis des morceaux et les tops de lancement, pour que la musique tombe pile au bon moment",
          "Désigner une personne responsable de la bande-son (un proche ou le DJ venu en avance), pas le marié occupé ailleurs",
          "Tester le matériel avant la cérémonie, idéalement la veille ou le matin même, jamais au moment de l'entrée",
        ],
      },
      {
        type: "text",
        title: "Le son en extérieur, le vrai piège",
        paragraphs: [
          "En plein air, le son se disperse : sans sonorisation, une musique se perd à quelques mètres et les invités du fond n'entendent rien. Prévoyez une enceinte alimentée sur secteur ou sur batterie, et testez la portée à l'emplacement réel des invités, pas près de l'enceinte.",
          "Le vent, la pelouse et l'absence de murs changent tout par rapport à une salle. Anticipez une alimentation électrique fiable (rallonge, batterie de secours) et un plan B en cas de pluie, qui déplace souvent la cérémonie sous une tente ou à l'intérieur, avec une acoustique différente.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "La musique de cérémonie se prépare comme un mini-déroulé à part : quatre à six morceaux, une personne responsable des lancements, et un test de son avant que le premier invité s'assoie.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "La musique de cérémonie s'accorde avec les [lectures et textes de cérémonie](/blog/lectures-textes-ceremonie-mariage) pour rythmer chaque temps fort. Ne la confondez pas avec la [playlist de soirée](/blog/playlist-mariage-construire), qui se construit à part, ni avec le rôle du [DJ de mariage](/blog/choisir-dj-mariage). Pour le matériel de diffusion, notre guide [sonorisation et éclairage de la soirée](/blog/sonorisation-eclairage-soiree-mariage) complète le sujet côté technique.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Ceremony music has nothing to do with the reception playlist. It isn't there to get people dancing, but to underline precise moments: the couple's entrance, the signing of the register, the exit. Well chosen, it carries the emotion without you having to add any.",
          "It's an item you prepare early and separately from the DJ, because it belongs to the ceremony's own run of show, not to the dancefloor mood. A few well-placed pieces beat a long list that drowns the highlights.",
        ],
      },
      {
        type: "list",
        title: "The moments to score",
        items: [
          "The entrance: the most anticipated piece, accompanying the arrival of the couple or the procession",
          "The interludes between speeches and readings, to let the ceremony breathe",
          "The signing of the register, a longer stretch where music fills a moment without words",
          "The exit: a livelier piece that launches the transition to the cocktail hour",
        ],
      },
      {
        type: "text",
        title: "Live or recorded",
        paragraphs: [
          "Recorded music is simple, reliable, and faithful to the version you know. It just needs good sound and a dedicated person to cue each piece at the right moment, with no gap or overlap.",
          "Live music (guitar, string quartet, singer, harp) brings a presence and emotion hard to match. It costs more and means checking the space, the power supply, and the repertoire ahead of time. Many couples combine the two: live for the entrance, recorded for the interludes.",
        ],
      },
      {
        type: "text",
        title: "How many pieces to plan",
        paragraphs: [
          "For a secular ceremony of about thirty minutes, count on four to six pieces: the entrance, one or two interludes, the signing, the exit. Each time, plan a piece slightly longer than needed: it's better to fade a track out gently than to end up in silence.",
          "For a civil marriage, very short, one or two pieces are enough, and the town hall sometimes limits what's possible. Ask: not every marriage hall has a sound system, or allows one.",
        ],
      },
      {
        type: "list",
        title: "Coordinating with the venue and officiant",
        items: [
          "Check with the venue for a sound system, a power outlet, and a spot to place the musicians or the speaker",
          "Give the officiant the exact order of pieces and the cues, so the music lands right on time",
          "Assign one person responsible for the soundtrack (a loved one or the DJ arriving early), not the groom busy elsewhere",
          "Test the gear before the ceremony, ideally the day before or the morning of, never at the moment of the entrance",
        ],
      },
      {
        type: "text",
        title: "Sound outdoors, the real trap",
        paragraphs: [
          "In the open air, sound scatters: with no amplification, music is lost within a few meters and the guests at the back hear nothing. Plan a speaker powered from the mains or a battery, and test the reach at the guests' actual spot, not next to the speaker.",
          "Wind, grass, and the absence of walls change everything compared with a hall. Anticipate a reliable power supply (extension lead, backup battery) and a plan B for rain, which often moves the ceremony under a tent or indoors, with different acoustics.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Ceremony music is prepared like a mini run of show of its own: four to six pieces, one person in charge of the cues, and a sound test before the first guest sits down.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Ceremony music pairs with the [ceremony readings and texts](/blog/lectures-textes-ceremonie-mariage) to pace each highlight. Don't confuse it with the [reception playlist](/blog/playlist-mariage-construire), which is built separately, or with the [wedding DJ](/blog/choisir-dj-mariage) role. On the playback gear, our guide to [reception sound and lighting](/blog/sonorisation-eclairage-soiree-mariage) rounds out the technical side.",
        ],
      },
    ],
  }),

  postPair({
    slug: "mariage-oriental-traditions-henne",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Mariage oriental : traditions et soirée du henné",
    titleEn: "Oriental wedding: traditions and the henna night",
    excerptFr:
      "Soirée du henné, changements de tenue, rituels de famille : ce que chaque moment représente, comment il s'articule avec le mariage civil, et comment organiser une célébration sur plusieurs jours.",
    excerptEn:
      "The henna night, outfit changes, family rituals: what each moment means, how it fits with the civil wedding, and how to organize a multi-day celebration.",
    readingMinutes: 7,
    heroAltFr: "Mains décorées au henné lors d'un mariage oriental",
    heroAltEn: "Hands decorated with henna at an oriental wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Les mariages d'inspiration orientale ou nord-africaine s'étalent souvent sur plusieurs jours et plusieurs moments forts, la soirée du henné en tête. Chaque famille, chaque région et chaque pays a ses propres usages : cet article donne des repères généraux, pas une règle unique.",
          "Le fil conducteur reste le même : ces traditions se vivent en plus du mariage civil français, qui seul a une valeur légale. Les célébrations culturelles et familiales viennent l'entourer, avant ou après le passage en mairie.",
        ],
      },
      {
        type: "text",
        title: "La soirée du henné",
        paragraphs: [
          "La soirée du henné se tient généralement la veille ou quelques jours avant la fête principale. On y applique du henné sur les mains de la mariée, geste porteur de sens (chance, protection, passage vers la vie de femme mariée selon les familles), souvent au son de chants et de youyous.",
          "C'est un moment plus intime que la grande réception, à dominante féminine dans de nombreuses traditions, même si les usages évoluent et que certaines familles la partagent largement. Tenues brodées, plateaux décorés et musique traditionnelle en font une soirée à part entière, à préparer comme telle.",
        ],
      },
      {
        type: "list",
        title: "Les moments qui rythment la célébration",
        items: [
          "La soirée du henné, avec l'application du henné et les chants, en préambule de la fête",
          "L'arrivée cérémonielle des mariés, parfois portée par la famille ou accompagnée de musiciens",
          "Les changements de tenue de la mariée au fil de la soirée, chaque tenue marquant une étape",
          "Les rituels familiaux (offrandes, présentation des cadeaux, bénédictions des aînés) qui varient selon les régions",
        ],
      },
      {
        type: "text",
        title: "Les changements de tenue",
        paragraphs: [
          "Dans de nombreuses traditions, la mariée change plusieurs fois de tenue au cours de la fête, passant d'une robe traditionnelle brodée à une autre, parfois d'une région ou d'une couleur à l'autre. Chaque apparition est un temps fort, souvent salué par la musique et les invités.",
          "Ces changements demandent de l'organisation : prévoir un espace pour se changer, une personne qui aide (la negafa dans la tradition marocaine, par exemple), et un timing réaliste dans le déroulé, car chaque changement prend du temps et ralentit le fil de la soirée.",
        ],
      },
      {
        type: "text",
        title: "S'articuler avec le mariage civil",
        paragraphs: [
          "En France, seul le mariage à la mairie est reconnu par la loi. Les célébrations orientales se greffent autour : certaines familles font le civil discrètement quelques jours avant, puis concentrent la fête sur les rituels traditionnels ; d'autres enchaînent tout sur un même week-end.",
          "L'important est de fixer tôt l'ordre des événements, car il conditionne les congés des proches venus de loin, la réservation des lieux et le budget. Un mariage sur deux ou trois jours se planifie comme plusieurs événements distincts, pas comme une seule soirée allongée.",
        ],
      },
      {
        type: "list",
        title: "Organiser une célébration sur plusieurs jours",
        items: [
          "Lister chaque événement séparément (henné, réception, éventuel repas du lendemain) avec son lieu, son horaire et son nombre d'invités propres",
          "Prévoir des budgets distincts : une soirée du henné n'a ni le même format ni le même coût que la grande réception",
          "Anticiper la logistique des tenues et des prestataires (traiteur, musique, décoration) pour chaque moment, qui peuvent différer d'un jour à l'autre",
          "Communiquer clairement aux invités quels événements les concernent, tous n'étant pas conviés à chaque moment",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Les traditions varient énormément d'une famille et d'une région à l'autre. Le meilleur guide reste vos aînés et vos familles : demandez-leur ce qui compte vraiment pour eux avant de figer le déroulé.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Quand deux origines se rencontrent, notre guide [mêler deux cultures dans un même mariage](/blog/mariage-interculturel-deux-cultures) aide à composer sans tension. Pour la dimension religieuse, voir [cérémonies religieuses juive, musulmane, protestante, orthodoxe](/blog/ceremonies-religieuses-juive-musulmane-protestante-orthodoxe) et le rappel du cadre légal dans [le déroulé de la cérémonie civile](/blog/ceremonie-civile-mairie-deroule). Dans Fiancé, traitez chaque journée comme un événement à part pour ne rien mélanger dans l'organisation.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Oriental or North African weddings often spread over several days and several key moments, with the henna night at the front. Each family, region, and country has its own customs: this article gives general markers, not a single rule.",
          "The common thread stays the same: these traditions are lived on top of the French civil marriage, which alone has legal standing. The cultural and family celebrations surround it, before or after the town hall.",
        ],
      },
      {
        type: "text",
        title: "The henna night",
        paragraphs: [
          "The henna night is usually held the evening before or a few days ahead of the main celebration. Henna is applied to the bride's hands, a gesture rich in meaning (luck, protection, the passage into married life depending on the family), often to the sound of songs and ululations.",
          "It's a more intimate moment than the big reception, largely a women's gathering in many traditions, though customs evolve and some families share it more broadly. Embroidered outfits, decorated trays, and traditional music make it an event in its own right, to be prepared as such.",
        ],
      },
      {
        type: "list",
        title: "The moments that pace the celebration",
        items: [
          "The henna night, with the henna application and the songs, as a prelude to the celebration",
          "The couple's ceremonial arrival, sometimes carried by family or accompanied by musicians",
          "The bride's outfit changes through the evening, each outfit marking a stage",
          "The family rituals (offerings, presenting gifts, elders' blessings) that vary by region",
        ],
      },
      {
        type: "text",
        title: "The outfit changes",
        paragraphs: [
          "In many traditions, the bride changes outfit several times during the celebration, moving from one embroidered traditional dress to another, sometimes from one region or color to the next. Each appearance is a highlight, often greeted with music and by the guests.",
          "These changes take organizing: plan a space to change, a person who helps (the negafa in Moroccan tradition, for example), and realistic timing in the run of show, since each change takes time and slows the evening's flow.",
        ],
      },
      {
        type: "text",
        title: "Fitting with the civil marriage",
        paragraphs: [
          "In France, only the town-hall marriage is recognized by law. The oriental celebrations attach around it: some families do the civil quietly a few days before, then focus the celebration on the traditional rituals; others run it all across a single weekend.",
          "The key is to set the order of events early, because it drives the time off for loved ones traveling far, the venue bookings, and the budget. A wedding over two or three days is planned as several distinct events, not as one long stretched-out evening.",
        ],
      },
      {
        type: "list",
        title: "Organizing a multi-day celebration",
        items: [
          "List each event separately (henna, reception, possible next-day meal) with its own venue, timing, and guest count",
          "Plan distinct budgets: a henna night doesn't have the same format or cost as the main reception",
          "Anticipate the logistics of outfits and vendors (caterer, music, decor) for each moment, which can differ from one day to the next",
          "Tell guests clearly which events concern them, since not everyone is invited to every moment",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Traditions vary enormously from one family and region to another. The best guide remains your elders and your families: ask them what truly matters to them before locking the run of show.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "When two backgrounds meet, our guide to [blending two cultures in one wedding](/blog/mariage-interculturel-deux-cultures) helps you compose without friction. On the religious dimension, see [Jewish, Muslim, Protestant, Orthodox religious ceremonies](/blog/ceremonies-religieuses-juive-musulmane-protestante-orthodoxe) and the reminder of the legal frame in [the civil ceremony run of show](/blog/ceremonie-civile-mairie-deroule). In Fiancé, treat each day as its own event so nothing gets tangled in the planning.",
        ],
      },
    ],
  }),

  postPair({
    slug: "mariage-interculturel-deux-cultures",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Mariage interculturel : mêler deux cultures avec justesse",
    titleEn: "Intercultural wedding: blending two cultures with care",
    excerptFr:
      "Choisir les rituels à garder, honorer les deux familles, prévoir une cérémonie et un menu bilingues, et expliquer vos choix aux invités : composer un mariage à deux cultures sans frictions.",
    excerptEn:
      "Choosing which rituals to keep, honoring both families, planning a bilingual ceremony and menu, and explaining your choices to guests: composing a two-culture wedding without friction.",
    readingMinutes: 7,
    heroAltFr: "Couple interculturel mêlant deux traditions de mariage",
    heroAltEn: "Intercultural couple blending two wedding traditions",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Réunir deux cultures dans un même mariage est une richesse, mais aussi un exercice d'équilibre. Chaque famille arrive avec ses attentes, ses rituels et parfois sa langue, et le couple se retrouve à arbitrer entre des traditions qui ne se ressemblent pas toujours.",
          "La bonne nouvelle : il n'existe pas de modèle imposé. Un mariage interculturel réussi n'est pas celui qui coche toutes les traditions des deux côtés, c'est celui qui en garde quelques-unes, choisies ensemble, et les assume clairement.",
        ],
      },
      {
        type: "text",
        title: "Choisir les rituels à garder",
        paragraphs: [
          "Vouloir tout intégrer mène vite à une cérémonie interminable et à une soirée surchargée. Le tri est indispensable. Listez chacun de votre côté les rituels qui comptent vraiment, puis distinguez ceux qui sont non négociables de ceux qui vous plaisent sans être essentiels.",
          "Gardez en priorité les moments porteurs de sens pour vous, quitte à laisser de côté des traditions qui n'ont d'importance que pour la forme. Un rituel expliqué et bien intégré marque davantage que trois rituels enchaînés sans respiration.",
        ],
      },
      {
        type: "list",
        title: "Honorer les deux familles",
        items: [
          "Confier à chaque famille un moment ou un rituel qui lui tient à cœur, pour que chacune se sente représentée",
          "Équilibrer visiblement les deux cultures dans la décoration, la musique et le menu, plutôt que d'en laisser une dominer",
          "Impliquer les aînés en amont pour recueillir ce qui compte pour eux, ce qui désamorce beaucoup de tensions",
          "Assumer que tout arbitrage est un choix de couple : les familles conseillent, mais la décision vous revient",
        ],
      },
      {
        type: "text",
        title: "Une cérémonie et un menu bilingues",
        paragraphs: [
          "Quand les invités ne parlent pas tous la même langue, une cérémonie bilingue évite qu'une partie de l'assemblée décroche. Alternez les langues sur les prises de parole, prévoyez une traduction imprimée des textes clés, ou confiez certaines lectures dans chaque langue. L'objectif est que personne ne reste spectateur d'un moment qu'il ne comprend pas.",
          "Le menu est un autre terrain d'expression : un plat de chaque culture, un buffet mixte, ou un menu classique complété d'une touche traditionnelle. Là encore, mieux vaut deux ou trois clins d'oeil réussis qu'une carte qui tente tout et perd en cohérence.",
        ],
      },
      {
        type: "list",
        title: "Expliquer vos choix aux invités",
        items: [
          "Introduire chaque rituel inhabituel par un mot de l'officiant ou du maître de cérémonie, pour que tout le monde en comprenne le sens",
          "Prévoir un livret de cérémonie ou une page mariage bilingue qui présente le déroulé et les traditions",
          "Prévenir les invités des éventuelles particularités (tenue, durée, plusieurs jours) pour qu'ils arrivent préparés",
          "Rester simple dans les explications : un rituel compris est un rituel apprécié, un rituel subi crée de la distance",
        ],
      },
      {
        type: "text",
        title: "Gérer les désaccords en amont",
        paragraphs: [
          "Les frictions naissent presque toujours de sujets non tranchés à l'avance : la place de la religion, la langue dominante, le nombre d'invités par famille. Abordez-les tôt, à deux d'abord, avant d'en parler aux familles avec une position déjà commune.",
          "Quand un point bloque, cherchez le compromis qui préserve l'essentiel pour chacun plutôt qu'un partage strictement égal. Un mariage interculturel n'est pas une négociation à parts égales, c'est une composition qui doit rester à votre image.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Deux ou trois traditions bien choisies et bien expliquées font un mariage plus fort que dix rituels enchaînés pour ne froisser personne. Choisir, c'est aussi honorer.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour une célébration d'inspiration orientale, notre guide [mariage oriental et soirée du henné](/blog/mariage-oriental-traditions-henne) détaille les moments clés. La dimension religieuse est couverte par [cérémonies religieuses juive, musulmane, protestante, orthodoxe](/blog/ceremonies-religieuses-juive-musulmane-protestante-orthodoxe), et une [cérémonie laïque sur mesure](/blog/ceremonie-laique-choisir-officiant) permet de composer un rituel bilingue sans cadre imposé. Pour situer vos choix par rapport aux usages français, voir aussi [les traditions du mariage français](/blog/traditions-mariage-francais).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Bringing two cultures together in one wedding is a richness, but also a balancing act. Each family arrives with its expectations, its rituals, and sometimes its language, and the couple ends up arbitrating between traditions that don't always match.",
          "The good news: there's no imposed template. A successful intercultural wedding isn't the one that ticks every tradition on both sides, it's the one that keeps a few, chosen together, and owns them clearly.",
        ],
      },
      {
        type: "text",
        title: "Choosing which rituals to keep",
        paragraphs: [
          "Trying to fit everything in quickly leads to an endless ceremony and an overloaded evening. Sorting is essential. Each of you list the rituals that truly matter, then separate the non-negotiable from the ones you like without them being essential.",
          "Keep first the moments that carry meaning for you, even if it means setting aside traditions that only matter for form's sake. One ritual explained and well integrated leaves more of a mark than three run back-to-back without a breath.",
        ],
      },
      {
        type: "list",
        title: "Honoring both families",
        items: [
          "Give each family a moment or ritual close to their heart, so each feels represented",
          "Visibly balance the two cultures in decor, music, and menu, rather than letting one dominate",
          "Involve the elders early to gather what matters to them, which defuses a lot of tension",
          "Own that every call is a couple's choice: families advise, but the decision is yours",
        ],
      },
      {
        type: "text",
        title: "A bilingual ceremony and menu",
        paragraphs: [
          "When guests don't all speak the same language, a bilingual ceremony keeps part of the room from tuning out. Alternate languages across the speeches, provide a printed translation of the key texts, or assign some readings in each language. The goal is that no one sits as a spectator of a moment they don't understand.",
          "The menu is another canvas: a dish from each culture, a mixed buffet, or a classic menu with a traditional touch. Here too, two or three well-judged nods beat a menu that tries everything and loses its coherence.",
        ],
      },
      {
        type: "list",
        title: "Explaining your choices to guests",
        items: [
          "Introduce each unusual ritual with a word from the officiant or master of ceremonies, so everyone grasps its meaning",
          "Provide a ceremony booklet or a bilingual wedding page that presents the run of show and the traditions",
          "Warn guests of any particularities (dress, length, several days) so they arrive prepared",
          "Keep explanations simple: a ritual understood is a ritual enjoyed, a ritual endured creates distance",
        ],
      },
      {
        type: "text",
        title: "Handling disagreements ahead of time",
        paragraphs: [
          "Friction almost always comes from topics not settled in advance: the place of religion, the dominant language, the number of guests per family. Raise them early, as a couple first, before talking to the families with an already shared position.",
          "When a point stalls, look for the compromise that preserves what's essential to each rather than a strictly equal split. An intercultural wedding isn't an equal-parts negotiation, it's a composition that has to stay in your image.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Two or three well-chosen, well-explained traditions make a stronger wedding than ten rituals strung together to avoid offending anyone. To choose is also to honor.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "For an oriental-inspired celebration, our guide to [the oriental wedding and henna night](/blog/mariage-oriental-traditions-henne) details the key moments. The religious dimension is covered in [Jewish, Muslim, Protestant, Orthodox religious ceremonies](/blog/ceremonies-religieuses-juive-musulmane-protestante-orthodoxe), and a [custom secular ceremony](/blog/ceremonie-laique-choisir-officiant) lets you build a bilingual ritual with no imposed frame. To place your choices against French customs, see also [French wedding traditions](/blog/traditions-mariage-francais).",
        ],
      },
    ],
  }),

  postPair({
    slug: "sonorisation-eclairage-soiree-mariage",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "Sonorisation et éclairage : la technique de la soirée",
    titleEn: "Sound and lighting: the technical side of the evening",
    excerptFr:
      "Distincts du DJ, un bon système de son et un éclairage pensé changent la soirée. Guirlandes, uplighting, lumière de piste : qui fournit quoi, et les contraintes d'alimentation et de pluie en extérieur.",
    excerptEn:
      "Distinct from the DJ, a good PA and a designed lighting scheme change the evening. String lights, uplighting, dancefloor lighting: who provides what, and the power and rain constraints outdoors.",
    readingMinutes: 7,
    heroAltFr: "Éclairage et sonorisation d'une soirée de mariage",
    heroAltEn: "Lighting and sound at a wedding reception",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "On confond souvent le DJ et la technique. Le DJ choisit la musique et anime ; la sonorisation et l'éclairage sont le matériel et la mise en lumière qui portent cette musique et transforment un lieu. Un très bon DJ sur une sono inadaptée, ou une belle salle mal éclairée, et la soirée perd la moitié de son effet.",
          "C'est un poste technique qu'on gagne à clarifier tôt, car la question du « qui fournit quoi » varie beaucoup d'un lieu et d'un prestataire à l'autre, et se règle dans les contrats, pas le jour même.",
        ],
      },
      {
        type: "text",
        title: "Pourquoi la sonorisation compte",
        paragraphs: [
          "Une sono bien dimensionnée diffuse un son clair et homogène partout, sans saturer près des enceintes ni s'éteindre au fond de la salle. Sous-dimensionnée, elle force le volume et fatigue les oreilles ; surdimensionnée dans une petite salle, elle sature. La bonne puissance dépend du nombre d'invités et du volume du lieu.",
          "Pensez aussi aux prises de parole : discours, cérémonie laïque, animations. Un ou deux micros fiables, testés à l'avance, évitent les larsens et les mots inaudibles qui gâchent les moments d'émotion.",
        ],
      },
      {
        type: "list",
        title: "Les grands types d'éclairage",
        items: [
          "Les guirlandes lumineuses (guinguette) : une lumière chaude et enveloppante, idéale pour l'ambiance du dîner et les extérieurs",
          "L'uplighting : des projecteurs posés au sol qui colorent les murs et structurent l'espace, très efficaces pour habiller une salle nue",
          "L'éclairage de piste : jeux de lumière dynamiques réservés au moment dansant, souvent fournis par le DJ",
          "Les bougies et lumières douces sur les tables : l'appoint le moins cher, qui réchauffe instantanément l'atmosphère du repas",
        ],
      },
      {
        type: "text",
        title: "Qui fournit quoi",
        paragraphs: [
          "La répartition n'est jamais automatique. Le DJ apporte en général sa propre sono et un éclairage de piste basique, calibrés pour la partie dansante, mais pas forcément pour sonoriser une grande salle ni pour éclairer tout le lieu. Le lieu de réception fournit parfois un système de son fixe et un éclairage d'ambiance, parfois rien.",
          "Pour un éclairage travaillé (uplighting, guirlandes, mise en lumière d'une façade), un prestataire technique dédié entre souvent en jeu. Avant de signer, faites la liste précise de ce que couvre chacun : c'est le seul moyen d'éviter le trou où personne n'apporte les enceintes de la cérémonie ou l'éclairage du cocktail.",
        ],
      },
      {
        type: "list",
        title: "Vérifier avant de signer",
        items: [
          "Ce que le DJ inclut exactement : puissance de la sono, nombre de micros, éclairage de piste seul ou décor lumineux",
          "Ce que le lieu met à disposition : sono fixe, éclairage d'ambiance, points de branchement, limiteur de bruit imposé",
          "Qui installe et démonte, et à quelle heure, pour ne pas découvrir un montage impossible dans le créneau disponible",
          "Le besoin éventuel d'un prestataire éclairage séparé, si vous visez une vraie mise en lumière et pas seulement une piste",
        ],
      },
      {
        type: "text",
        title: "Extérieur : alimentation et pluie",
        paragraphs: [
          "En extérieur, tout dépend de l'électricité. Un jardin ou un champ n'a pas toujours de quoi alimenter une sono, des projecteurs et l'éclairage : prévoyez l'accès au réseau, des rallonges adaptées, et parfois un groupe électrogène silencieux si la puissance manque. Sous-estimer ce point, c'est risquer une coupure en pleine soirée.",
          "La pluie et l'humidité imposent du matériel protégé et un plan B : abri pour les enceintes et les projecteurs, tente ou repli intérieur. Beaucoup de lieux imposent aussi un limiteur de bruit et une baisse du volume en soirée pour respecter la tranquillité des riverains : vérifiez la règle du lieu avant de tout caler.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "La règle simple : listez noir sur blanc qui apporte chaque enceinte, chaque micro et chaque projecteur. Le pire scénario n'est pas un mauvais matériel, c'est un matériel que personne n'avait prévu d'apporter.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "La technique se cale avec le [choix du DJ](/blog/choisir-dj-mariage), en clarifiant ce qu'il fournit et ce qui reste à couvrir. La sonorisation sert aussi la [musique de cérémonie](/blog/musique-ceremonie-mariage), souvent en amont de la soirée. En extérieur, croisez ce poste avec [le mariage en plein air et le plan B météo](/blog/mariage-plein-air-plan-b-meteo), et pensez à interroger le lieu sur l'électricité et le limiteur de bruit dès [la visite du lieu de réception](/blog/questions-visite-lieu-reception-mariage).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "People often mix up the DJ and the tech. The DJ picks the music and hosts; sound and lighting are the equipment and the lighting design that carry that music and transform a space. A great DJ on an unsuitable PA, or a beautiful hall poorly lit, and the evening loses half its effect.",
          "It's a technical item worth clarifying early, because the question of who supplies what varies a lot from one venue and vendor to another, and gets settled in the contracts, not on the day.",
        ],
      },
      {
        type: "text",
        title: "Why the PA matters",
        paragraphs: [
          "A properly sized PA delivers clear, even sound everywhere, without blasting near the speakers or dying out at the back of the room. Undersized, it forces the volume and tires the ears; oversized in a small room, it distorts. The right power depends on the guest count and the size of the space.",
          "Think about the speaking moments too: speeches, secular ceremony, entertainment. One or two reliable microphones, tested ahead, prevent the feedback and the inaudible words that spoil emotional moments.",
        ],
      },
      {
        type: "list",
        title: "The main types of lighting",
        items: [
          "String lights (festoon): warm, enveloping light, ideal for dinner ambiance and outdoors",
          "Uplighting: floor-standing fixtures that color the walls and structure the space, very effective for dressing a bare room",
          "Dancefloor lighting: dynamic effects for the dancing part, often supplied by the DJ",
          "Candles and soft table lights: the cheapest addition, which instantly warms the meal's atmosphere",
        ],
      },
      {
        type: "text",
        title: "Who supplies what",
        paragraphs: [
          "The split is never automatic. The DJ usually brings their own PA and basic dancefloor lighting, calibrated for the dancing part, but not necessarily to fill a large hall or to light the whole venue. The venue sometimes provides a fixed sound system and ambient lighting, sometimes nothing.",
          "For designed lighting (uplighting, string lights, lighting a facade), a dedicated technical vendor often steps in. Before signing, draw up the precise list of what each one covers: it's the only way to avoid the gap where no one brings the ceremony speakers or the cocktail-hour lighting.",
        ],
      },
      {
        type: "list",
        title: "Check before signing",
        items: [
          "Exactly what the DJ includes: PA power, number of microphones, dancefloor lighting alone or a lighting scheme",
          "What the venue provides: fixed PA, ambient lighting, power points, a mandatory sound limiter",
          "Who sets up and tears down, and at what time, so you don't discover an impossible install in the available slot",
          "The possible need for a separate lighting vendor, if you want real lighting design and not just a dancefloor",
        ],
      },
      {
        type: "text",
        title: "Outdoors: power and rain",
        paragraphs: [
          "Outdoors, everything hinges on electricity. A garden or a field doesn't always have what it takes to power a PA, fixtures, and lighting: plan mains access, suitable extension leads, and sometimes a quiet generator if power is short. Underestimate this and you risk an outage mid-evening.",
          "Rain and damp call for protected gear and a plan B: shelter for speakers and fixtures, a tent or an indoor fallback. Many venues also impose a sound limiter and a volume drop later in the evening to respect neighbors' peace: check the venue's rule before locking everything in.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "The simple rule: list in black and white who brings each speaker, each mic, and each fixture. The worst case isn't bad gear, it's gear no one planned to bring.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "The tech is set alongside [choosing the DJ](/blog/choisir-dj-mariage), clarifying what they supply and what's left to cover. The PA also serves the [ceremony music](/blog/musique-ceremonie-mariage), often ahead of the evening. Outdoors, cross this item with [the outdoor wedding and rain plan B](/blog/mariage-plein-air-plan-b-meteo), and remember to ask the venue about power and the sound limiter right from [the venue visit](/blog/questions-visite-lieu-reception-mariage).",
        ],
      },
    ],
  }),

  postPair({
    slug: "feu-artifice-etincelles-mariage",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Feu d'artifice et étincelles froides : effets et sécurité",
    titleEn: "Fireworks and cold sparklers: effects and safety",
    excerptFr:
      "Feu d'artifice, étincelles froides, gerbes lumineuses : les options et leur effet, les contraintes d'autorisation en France, le bon moment dans la soirée et l'ordre de grandeur du budget.",
    excerptEn:
      "Fireworks, cold sparklers, light fountains: the options and their wow factor, the authorization constraints in France, the right moment in the evening, and the budget order of magnitude.",
    readingMinutes: 7,
    heroAltFr: "Étincelles froides lors de l'entrée des mariés",
    heroAltEn: "Cold sparklers during the couple's entrance",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Un effet lumineux bien placé crée l'un des moments les plus spectaculaires de la soirée : l'entrée des mariés sous les gerbes, ou un final en feu d'artifice qui referme la fête. Mais entre l'étincelle froide en salle et le vrai feu d'artifice en extérieur, les contraintes n'ont rien à voir.",
          "Le sujet touche à la sécurité et à la réglementation, où les règles varient selon la catégorie de l'artifice, le lieu et parfois la commune. Voici les grandes options et ce qu'elles impliquent, à confirmer toujours avec un professionnel et avec votre lieu.",
        ],
      },
      {
        type: "list",
        title: "Les grandes options",
        items: [
          "Les étincelles froides (fontaines, geysers scéniques) : des gerbes lumineuses sans flamme nue, souvent utilisables en intérieur, très prisées pour l'entrée des mariés ou l'ouverture de bal",
          "Les cierges magiques distribués aux invités : l'option la plus simple et la moins chère, pour une haie d'honneur lumineuse en fin de soirée",
          "Le feu d'artifice en extérieur : l'effet le plus spectaculaire, mais aussi le plus encadré, à réserver à un final",
          "Les effets pyrotechniques scéniques plus poussés (jets, flammes) : réservés aux professionnels qualifiés",
        ],
      },
      {
        type: "text",
        title: "Les étincelles froides, l'option souple",
        paragraphs: [
          "Les machines à étincelles froides projettent des gerbes à basse température (souvent autour de 60 à 80 °C selon les fabricants) sans flamme nue ni fumée, ce qui les rend généralement utilisables en intérieur. Elles ne déclenchent pas les détecteurs d'incendie, d'où leur succès pour l'entrée des mariés ou la première danse.",
          "Sûres ne veut pas dire sans règles : il faut respecter une distance de sécurité autour de chaque fontaine (souvent de l'ordre de trois mètres), vérifier la hauteur sous plafond, garder les issues dégagées et prévoir des extincteurs. Surtout, beaucoup de lieux imposent leurs propres restrictions, voire les interdisent : demandez l'autorisation de la salle avant tout.",
        ],
      },
      {
        type: "text",
        title: "Le feu d'artifice et l'autorisation",
        paragraphs: [
          "Un feu d'artifice grand public se tire en extérieur et dépend de sa catégorie. Les artifices des catégories les plus courantes s'achètent et se tirent sans déclaration particulière, dans le respect des règles de sécurité. Mais les spectacles les plus puissants, à partir d'une certaine quantité de matière active ou de la catégorie professionnelle (dite K4 ou F4), imposent un artificier qualifié (certificat délivré par le ministère de l'Intérieur) et une déclaration préalable en préfecture, souvent au moins un mois avant.",
          "À cela s'ajoutent les conditions du jour : distances de sécurité (par rapport aux bâtiments, aux dépôts de gaz), et annulation en cas de vent fort ou de risque incendie élevé, fréquent en été. Autrement dit, un feu d'artifice se planifie avec un professionnel et une marge, pas en achat de dernière minute.",
        ],
      },
      {
        type: "list",
        title: "Le bon moment dans la soirée",
        items: [
          "Les étincelles froides sur un temps fort : entrée des mariés, ouverture de bal, gâteau",
          "Le feu d'artifice en clôture, une fois la nuit tombée, souvent avant ou juste après le pic de la piste de danse",
          "Les cierges magiques pour une haie d'honneur lumineuse au moment du départ ou d'une sortie de salle",
          "Un effet unique et marquant plutôt que plusieurs séquences qui finissent par se banaliser",
        ],
      },
      {
        type: "text",
        title: "L'ordre de grandeur du budget",
        paragraphs: [
          "Les cierges magiques distribués aux invités coûtent quelques dizaines d'euros au total. Une prestation d'étincelles froides par un prestataire se situe plutôt dans une gamme de quelques centaines d'euros selon le nombre de machines et la durée. Un feu d'artifice professionnel tiré par un artificier représente un budget nettement plus élevé, très variable selon l'ampleur du spectacle.",
          "Ces montants ne sont que des repères : demandez des devis précis, car le prix dépend du lieu, de la logistique et des contraintes de sécurité. Intégrez aussi le coût de la déclaration et de l'artificier, pas seulement celui des artifices.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Avant de rêver d'un final en feu d'artifice, posez deux questions : mon lieu l'autorise-t-il, et faut-il un artificier et une déclaration ? La réponse conditionne tout le reste, y compris le budget.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Un effet lumineux se pense comme une animation à part entière : voir nos [idées d'animation de soirée](/blog/animations-soiree-mariage-idees). En extérieur, il dépend directement de [la météo et du plan B](/blog/mariage-plein-air-plan-b-meteo), et de ce que le lieu autorise, à vérifier dès [la visite du lieu de réception](/blog/questions-visite-lieu-reception-mariage). Enfin, chiffrez ce poste à sa juste place dans la [répartition du budget par poste](/blog/repartition-budget-mariage-par-poste).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A well-placed light effect creates one of the most spectacular moments of the evening: the couple's entrance under the sparks, or a fireworks finale that closes the party. But between the indoor cold sparkler and a real outdoor firework, the constraints are worlds apart.",
          "The topic touches on safety and regulation, where the rules vary by the firework's category, the venue, and sometimes the town. Here are the main options and what they involve, always to be confirmed with a professional and with your venue.",
        ],
      },
      {
        type: "list",
        title: "The main options",
        items: [
          "Cold sparklers (fountains, stage geysers): light jets with no open flame, often usable indoors, very popular for the couple's entrance or the first dance",
          "Handheld sparklers given to guests: the simplest and cheapest option, for a glowing send-off line at the end of the evening",
          "Outdoor fireworks: the most spectacular effect, but also the most regulated, best kept for a finale",
          "More advanced stage pyrotechnics (jets, flames): reserved for qualified professionals",
        ],
      },
      {
        type: "text",
        title: "Cold sparklers, the flexible option",
        paragraphs: [
          "Cold-sparkler machines throw jets at low temperature (often around 60 to 80 °C depending on the maker) with no open flame or smoke, which generally makes them usable indoors. They don't trigger fire detectors, hence their success for the couple's entrance or the first dance.",
          "Safe doesn't mean rule-free: you have to keep a safety distance around each fountain (often on the order of three meters), check the ceiling height, keep exits clear, and have extinguishers on hand. Above all, many venues impose their own restrictions, or ban them: ask the venue's permission first.",
        ],
      },
      {
        type: "text",
        title: "Fireworks and authorization",
        paragraphs: [
          "A consumer firework is set off outdoors and depends on its category. The most common categories can be bought and fired without special declaration, following the safety rules. But the most powerful displays, above a certain amount of active material or in the professional category (known as K4 or F4), require a qualified pyrotechnician (a certificate issued by the Interior Ministry) and a prior declaration to the prefecture, often at least a month ahead.",
          "On top of that come the day's conditions: safety distances (from buildings, from gas depots), and cancellation in strong wind or high fire risk, common in summer. In other words, fireworks are planned with a professional and a margin, not bought at the last minute.",
        ],
      },
      {
        type: "list",
        title: "The right moment in the evening",
        items: [
          "Cold sparklers on a highlight: the couple's entrance, the first dance, the cake",
          "Fireworks as a closer, once night has fallen, often just before or after the dancefloor peak",
          "Handheld sparklers for a glowing send-off line at departure or a room exit",
          "One single, memorable effect rather than several sequences that end up feeling ordinary",
        ],
      },
      {
        type: "text",
        title: "The budget order of magnitude",
        paragraphs: [
          "Handheld sparklers given to guests cost a few dozen euros in total. A cold-sparkler service by a vendor sits more in a range of a few hundred euros depending on the number of machines and the duration. A professional fireworks display fired by a pyrotechnician is a markedly higher budget, highly variable with the scale of the show.",
          "These figures are only markers: ask for precise quotes, since the price depends on the venue, the logistics, and the safety constraints. Fold in the cost of the declaration and the pyrotechnician too, not just the fireworks themselves.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Before dreaming of a fireworks finale, ask two questions: does my venue allow it, and does it need a pyrotechnician and a declaration? The answer drives everything else, including the budget.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "A light effect is thought of as an entertainment in its own right: see our [evening entertainment ideas](/blog/animations-soiree-mariage-idees). Outdoors, it depends directly on [the weather and the plan B](/blog/mariage-plein-air-plan-b-meteo), and on what the venue allows, to check right from [the venue visit](/blog/questions-visite-lieu-reception-mariage). Finally, budget this item in its proper place in the [budget breakdown by line item](/blog/repartition-budget-mariage-par-poste).",
        ],
      },
    ],
  }),

  postPair({
    slug: "maitre-ceremonie-animateur-mariage",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "Le maître de cérémonie : qui anime vraiment la soirée",
    titleEn: "The master of ceremonies: who really runs the evening",
    excerptFr:
      "Distinct du DJ, le maître de cérémonie tient le fil du déroulé, fait les annonces et maintient l'énergie. Un proche ou un pro, et comment le briefer pour que la soirée s'enchaîne sans temps mort.",
    excerptEn:
      "Distinct from the DJ, the master of ceremonies keeps the run of show on track, makes the announcements, and holds the energy. A friend or a pro, and how to brief them so the evening flows without dead time.",
    readingMinutes: 6,
    heroAltFr: "Maître de cérémonie annonçant un moment de la soirée",
    heroAltEn: "Master of ceremonies announcing a moment of the evening",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Beaucoup de couples pensent que le DJ suffit à faire tourner la soirée. En réalité, deux rôles coexistent : le DJ gère la musique, le maître de cérémonie (ou animateur) gère le déroulé humain, les annonces et l'énergie de la salle. Parfois c'est la même personne, souvent non.",
          "C'est un rôle discret mais décisif. Sans lui, les moments s'enchaînent mal : personne ne sait quand passer à table, le discours démarre dans le brouhaha, l'ouverture de bal tombe à plat. Un bon maître de cérémonie rend tout cela fluide sans qu'on remarque son travail.",
        ],
      },
      {
        type: "list",
        title: "Ce que couvre le rôle",
        items: [
          "Tenir le fil du déroulé : savoir à tout moment ce qui vient ensuite et lancer chaque séquence au bon moment",
          "Faire les annonces : entrée des mariés, passage à table, discours, ouverture de bal, pièce montée",
          "Faire le lien entre les prestataires (traiteur, DJ, photographe) pour synchroniser les temps forts",
          "Maintenir l'énergie : relancer une salle qui retombe, gérer les blancs, temporiser un discours qui s'éternise",
        ],
      },
      {
        type: "text",
        title: "Un proche ou un professionnel",
        paragraphs: [
          "Confier ce rôle à un proche à l'aise à l'oral coûte moins cher et apporte une touche personnelle : il connaît les mariés, les anecdotes, les invités. En revanche, il ne pourra pas profiter pleinement de la fête, et il faut qu'il accepte une vraie responsabilité, pas juste un micro le temps d'une annonce.",
          "Un maître de cérémonie professionnel, ou un DJ qui assure aussi l'animation, apporte l'expérience : il sait gérer un imprévu, relancer une salle, tenir les horaires. C'est un budget en plus, mais qui décharge le couple et les proches d'une mission stressante. Le choix dépend surtout de la personne disponible et de l'ampleur de la soirée.",
        ],
      },
      {
        type: "list",
        title: "Bien le briefer",
        items: [
          "Lui transmettre le déroulé horaire complet, avec les moments clés et leur ordre précis",
          "Lui donner la liste des personnes qui prennent la parole, dans quel ordre et pour combien de temps",
          "Préciser la prononciation des prénoms, les liens de famille et les sujets à éviter dans les annonces",
          "Convenir de signaux simples avec le DJ et le traiteur pour lancer chaque séquence sans flottement",
        ],
      },
      {
        type: "text",
        title: "Le coordonner avec le DJ",
        paragraphs: [
          "Quand le maître de cérémonie et le DJ sont deux personnes distinctes, leur coordination fait toute la différence. Le maître de cérémonie annonce, le DJ lance la musique au bon instant : une entrée des mariés réussie repose sur ce duo synchronisé, pas sur l'un ou l'autre seul.",
          "Réunissez-les, au moins par téléphone, avant le jour J pour caler les tops de lancement. Un déroulé partagé et quelques signaux convenus évitent le grand classique de l'annonce faite sans musique, ou de la musique lancée avant que la salle soit prête.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Un bon maître de cérémonie ne se remarque pas : on ne voit que des enchaînements fluides. C'est justement quand ce rôle manque qu'on comprend à quel point il comptait.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Le maître de cérémonie s'articule d'abord avec le [choix du DJ](/blog/choisir-dj-mariage) : clarifiez qui fait quoi entre les deux. Son travail repose entièrement sur un [planning du jour J minute par minute](/blog/planning-jour-j-minute-par-minute) partagé et précis. Pensez aussi à ce rôle quand vous préparez vos [animations de soirée](/blog/animations-soiree-mariage-idees), et intégrez-le à la [répartition des rôles le jour J](/blog/repartir-roles-jour-j-mariage) si c'est un proche.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Many couples think the DJ is enough to run the evening. In reality, two roles coexist: the DJ handles the music, the master of ceremonies (or host) handles the human run of show, the announcements, and the room's energy. Sometimes it's the same person, often not.",
          "It's a discreet but decisive role. Without it, the moments link badly: no one knows when to sit for dinner, the speech starts amid the chatter, the first dance falls flat. A good master of ceremonies makes all this flow without anyone noticing the work.",
        ],
      },
      {
        type: "list",
        title: "What the role covers",
        items: [
          "Keeping the run of show on track: knowing at any moment what comes next and cueing each sequence on time",
          "Making the announcements: the couple's entrance, sitting for dinner, speeches, the first dance, the cake",
          "Linking the vendors (caterer, DJ, photographer) to synchronize the highlights",
          "Holding the energy: reviving a room that dips, managing dead time, easing a speech that overruns",
        ],
      },
      {
        type: "text",
        title: "A friend or a professional",
        paragraphs: [
          "Giving the role to a loved one comfortable speaking aloud costs less and adds a personal touch: they know the couple, the anecdotes, the guests. On the other hand, they won't fully enjoy the party, and they need to accept a real responsibility, not just a mic for one announcement.",
          "A professional master of ceremonies, or a DJ who also hosts, brings experience: they know how to handle a hiccup, revive a room, keep to schedule. It's an added budget, but it relieves the couple and loved ones of a stressful job. The choice depends mostly on who's available and the scale of the evening.",
        ],
      },
      {
        type: "list",
        title: "Briefing them well",
        items: [
          "Give them the full timeline, with the key moments and their precise order",
          "Give them the list of people speaking, in what order and for how long",
          "Specify the pronunciation of first names, family ties, and subjects to avoid in announcements",
          "Agree on simple signals with the DJ and caterer to cue each sequence without hesitation",
        ],
      },
      {
        type: "text",
        title: "Coordinating with the DJ",
        paragraphs: [
          "When the master of ceremonies and the DJ are two different people, their coordination makes all the difference. The MC announces, the DJ drops the music at the right instant: a successful couple's entrance rests on this synchronized duo, not on either one alone.",
          "Get them together, at least by phone, before the day to agree on the cues. A shared run of show and a few agreed signals prevent the classic of the announcement made with no music, or the music dropped before the room is ready.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "A good master of ceremonies goes unnoticed: all you see is smooth transitions. It's exactly when the role is missing that you realize how much it mattered.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "The master of ceremonies first ties in with [choosing the DJ](/blog/choisir-dj-mariage): clarify who does what between the two. Their work rests entirely on a shared, precise [minute-by-minute wedding-day timeline](/blog/planning-jour-j-minute-par-minute). Keep this role in mind when preparing your [evening entertainment](/blog/animations-soiree-mariage-idees), and fold it into [dividing up wedding-day roles](/blog/repartir-roles-jour-j-mariage) if it's a loved one.",
        ],
      },
    ],
  }),

  postPair({
    slug: "questions-visite-lieu-reception-mariage",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "Visite du lieu de réception : les questions à poser",
    titleEn: "The venue visit: the questions to ask",
    excerptFr:
      "Capacité, heure de fin, droit de bouchon, exclusivité, cuisine et traiteur, hébergement, plan B pluie, frais cachés : la checklist des questions à poser lors d'une visite de lieu.",
    excerptEn:
      "Capacity, curfew, corkage, exclusivity, kitchen and caterer, accommodation, rain plan B, hidden fees: the checklist of questions to ask during a venue visit.",
    readingMinutes: 7,
    heroAltFr: "Couple visitant un lieu de réception de mariage",
    heroAltEn: "Couple visiting a wedding reception venue",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Choisir le type de lieu est une chose ; visiter un lieu précis en est une autre. Une salle peut être magnifique en photo et cacher un détail qui change tout : une heure de fin imposée à minuit, un traiteur unique et cher, une exclusivité qui n'est pas garantie. La visite sert à débusquer ces points avant de signer.",
          "Le meilleur outil n'est pas votre coup de coeur, c'est votre liste de questions. Arrivez avec, posez-les toutes, et notez les réponses par écrit : c'est ce qui vous permettra de comparer deux lieux sur autre chose qu'une impression.",
        ],
      },
      {
        type: "list",
        title: "Capacité et espaces",
        items: [
          "La capacité réelle assise pour un dîner, pas la capacité debout maximale, souvent bien plus élevée",
          "La présence d'un espace séparé pour la cérémonie, le cocktail et le dîner, ou un seul espace à réagencer",
          "Un plan B intérieur si une partie est prévue en extérieur, et sa capacité une fois tout le monde à l'abri",
          "L'accessibilité pour les personnes à mobilité réduite et les invités âgés",
        ],
      },
      {
        type: "list",
        title: "Horaires et bruit",
        items: [
          "L'heure de fin imposée : jusqu'à quelle heure la musique et la fête sont-elles autorisées",
          "La présence d'un limiteur de bruit et le niveau sonore maximal admis, surtout à proximité de riverains",
          "Les contraintes de voisinage et les éventuelles restrictions sur la musique en extérieur en soirée",
          "L'heure de libération des lieux le lendemain et les conditions de récupération du matériel",
        ],
      },
      {
        type: "list",
        title: "Traiteur, boissons et cuisine",
        items: [
          "Le traiteur est-il imposé, à choisir dans une liste, ou totalement libre",
          "La présence d'une cuisine équipée pour un traiteur extérieur, ou seulement d'un espace de réchauffe",
          "Le [droit de bouchon](/blog/droit-de-bouchon-vin-mariage) si vous apportez votre propre vin, et son montant exact",
          "Ce qui est fourni (tables, chaises, vaisselle, nappage) et ce qui est à louer en plus",
        ],
      },
      {
        type: "list",
        title: "Exclusivité, hébergement et logistique",
        items: [
          "L'exclusivité du lieu : y a-t-il un seul mariage à la fois, ou plusieurs événements en parallèle",
          "L'hébergement sur place ou à proximité, le nombre de couchages et leur tarif",
          "Le parking, l'accès des prestataires, et les horaires de livraison et d'installation autorisés",
          "Les règles sur la décoration, les bougies, les effets lumineux et le feu d'artifice",
        ],
      },
      {
        type: "text",
        title: "Traquer les frais cachés",
        paragraphs: [
          "Le prix affiché de la location n'est presque jamais le prix final. Demandez ce qui s'y ajoute : ménage, heures supplémentaires au-delà de l'horaire de base, caution, frais de personnel, mise à disposition de la veille, électricité pour un mariage en extérieur. Faites détailler chaque ligne, car c'est là que se creuse l'écart entre deux devis en apparence proches.",
          "Demandez aussi les conditions d'annulation et de report, et ce que couvre exactement l'acompte. Un lieu transparent sur ces points est souvent un lieu sérieux ; une réponse floue est un signal à prendre au sérieux avant de signer.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Ne repartez jamais d'une visite avec des réponses seulement en tête. Notez tout par écrit, lieu par lieu : c'est le seul moyen de comparer objectivement une fois rentré, loin du charme de la visite.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Avant même la visite, notre guide [choisir le type de lieu de réception](/blog/choisir-lieu-reception-types) aide à cibler les bons lieux. Une fois le devis en main, [les clauses du contrat prestataire à vérifier](/blog/contrat-prestataire-clauses-verifier) évitent les mauvaises surprises. Pensez à poser la question du [plan B en cas de pluie](/blog/mariage-plein-air-plan-b-meteo) et celle du [droit de bouchon](/blog/droit-de-bouchon-vin-mariage) dès la visite, pas au moment de signer.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Choosing the type of venue is one thing; visiting a specific venue is another. A hall can be gorgeous in photos and hide a detail that changes everything: a curfew forced at midnight, a single expensive caterer, an exclusivity that isn't guaranteed. The visit is there to flush out these points before you sign.",
          "The best tool isn't your crush on the place, it's your list of questions. Arrive with it, ask them all, and write down the answers: that's what lets you compare two venues on something other than a feeling.",
        ],
      },
      {
        type: "list",
        title: "Capacity and spaces",
        items: [
          "The real seated capacity for a dinner, not the maximum standing capacity, often much higher",
          "A separate space for the ceremony, the cocktail hour, and the dinner, or a single space to rearrange",
          "An indoor plan B if part is planned outdoors, and its capacity once everyone is under cover",
          "Accessibility for people with reduced mobility and older guests",
        ],
      },
      {
        type: "list",
        title: "Hours and noise",
        items: [
          "The imposed end time: until what hour are music and partying allowed",
          "The presence of a sound limiter and the maximum level allowed, especially near neighbors",
          "Neighborhood constraints and any restrictions on outdoor music later in the evening",
          "The time to vacate the next day and the conditions for collecting equipment",
        ],
      },
      {
        type: "list",
        title: "Caterer, drinks, and kitchen",
        items: [
          "Is the caterer imposed, to be chosen from a list, or entirely free",
          "A kitchen equipped for an outside caterer, or only a reheating space",
          "The [corkage fee](/blog/droit-de-bouchon-vin-mariage) if you bring your own wine, and its exact amount",
          "What's provided (tables, chairs, tableware, linens) and what has to be rented on top",
        ],
      },
      {
        type: "list",
        title: "Exclusivity, accommodation, and logistics",
        items: [
          "The venue's exclusivity: is there one wedding at a time, or several events in parallel",
          "Accommodation on site or nearby, the number of beds and their price",
          "Parking, vendor access, and the allowed delivery and setup times",
          "The rules on decor, candles, light effects, and fireworks",
        ],
      },
      {
        type: "text",
        title: "Hunting for hidden fees",
        paragraphs: [
          "The advertised rental price is almost never the final one. Ask what gets added: cleaning, overtime beyond the base hours, a deposit, staff fees, availability the day before, electricity for an outdoor wedding. Have each line itemized, because that's where the gap widens between two seemingly close quotes.",
          "Ask too about cancellation and postponement terms, and exactly what the deposit covers. A venue transparent on these points is often a serious one; a vague answer is a signal to take seriously before signing.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Never leave a visit with answers only in your head. Write everything down, venue by venue: it's the only way to compare objectively once home, away from the charm of the visit.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Even before the visit, our guide to [choosing the type of reception venue](/blog/choisir-lieu-reception-types) helps you target the right places. Once you have the quote, [the vendor contract clauses to check](/blog/contrat-prestataire-clauses-verifier) prevent nasty surprises. Remember to ask about the [rain plan B](/blog/mariage-plein-air-plan-b-meteo) and the [corkage fee](/blog/droit-de-bouchon-vin-mariage) right at the visit, not when signing.",
        ],
      },
    ],
  }),
];

export const { fr: POSTS_209_216_FR, en: POSTS_209_216_EN } = pairsToArrays(pairs);
