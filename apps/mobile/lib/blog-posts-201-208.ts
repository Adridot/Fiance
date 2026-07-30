import { postPair, pairsToArrays } from "./blog-posts-shared";

const pairs = [
  postPair({
    slug: "se-marier-a-l-etranger-transcription",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Se marier à l'étranger : certificat de capacité et transcription",
    titleEn: "Getting married abroad: capacity certificate and transcription",
    excerptFr:
      "Un mariage célébré à l'étranger n'est reconnu en France qu'après sa transcription dans les registres consulaires. Certificat de capacité à mariage, publication des bans, transcription : les étapes à ne pas sauter.",
    excerptEn:
      "A marriage held abroad is only recognized in France once it's transcribed into the consular registers. Capacity certificate, banns, transcription: the steps you can't skip.",
    readingMinutes: 7,
    heroAltFr: "Couple français se mariant à l'étranger",
    heroAltEn: "French couple marrying abroad",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Se marier à l'étranger fait rêver, mais c'est d'abord un parcours administratif à deux niveaux : d'un côté les règles du pays où vous vous mariez, de l'autre celles de la France, qui ne reconnaît votre union qu'à certaines conditions. Le mariage est en général célébré selon la loi locale, puis rapatrié dans l'état civil français par une étape spécifique : la transcription.",
          "Cet article donne les repères généraux. Les pièces, les délais et l'ordre exact varient selon le pays et le consulat : la source à jour pour votre situation reste l'ambassade ou le consulat de France compétent, à contacter dès que la destination est envisagée.",
        ],
      },
      {
        type: "text",
        title: "Choisir le cadre : la loi du pays de célébration",
        paragraphs: [
          "Un mariage à l'étranger se célèbre selon les formes prévues par la loi locale : c'est elle qui fixe le lieu, l'officiant et le déroulé de la cérémonie. Certains pays imposent une durée de résidence sur place avant de pouvoir se marier, d'autres non. Ce point conditionne parfois tout le calendrier du voyage.",
          "Côté français, les conditions de fond du mariage (âge, absence d'un mariage antérieur, consentement libre) restent vérifiées par les autorités consulaires. C'est ce double regard, local et français, qui explique la lourdeur apparente du dossier.",
        ],
      },
      {
        type: "list",
        title: "Le certificat de capacité à mariage",
        items: [
          "Avant la célébration, vous constituez un dossier auprès de l'ambassade ou du consulat de France du lieu du mariage",
          "Le consulat procède à la publication des bans, souvent affichés aussi dans votre commune de rattachement en France",
          "À l'issue de cette publication et si les conditions de la loi française sont réunies, le consulat vous remet un certificat de capacité à mariage",
          "Ce certificat est fréquemment exigé par les autorités locales avant de célébrer l'union : il vaut mieux le prévoir en amont",
        ],
      },
      {
        type: "text",
        title: "La transcription, l'étape qui rend le mariage opposable en France",
        paragraphs: [
          "Une fois mariés à l'étranger, vous demandez la transcription de l'acte de mariage étranger sur les registres de l'état civil de l'ambassade ou du consulat de France du lieu de célébration. C'est cette transcription qui fait exister votre mariage aux yeux de l'administration française : sans elle, l'union est valable localement mais reste, en pratique, invisible en France.",
          "Concrètement, tant que le mariage n'est pas transcrit, il est difficile de le faire produire ses effets ici : livret de famille, changement de situation, démarches liées à votre état civil. La transcription n'est en principe soumise à aucun délai strict, mais rien n'empêche de la lancer sans attendre.",
        ],
      },
      {
        type: "list",
        title: "Les pièces généralement demandées pour la transcription",
        items: [
          "Le formulaire de demande de transcription dûment rempli",
          "L'original de l'acte de mariage étranger, avec sa traduction par un traducteur assermenté si la langue l'exige",
          "La copie intégrale de l'acte de naissance du conjoint français",
          "Les pièces d'identité des deux époux et, selon les cas, un justificatif du certificat de capacité délivré avant le mariage",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Le réflexe à retenir : un mariage à l'étranger n'est pas terminé le jour de la cérémonie. Tant qu'il n'est pas transcrit dans l'état civil français, il n'est pas reconnu en France. Lancez la transcription comme une étape à part entière, pas comme une formalité facultative.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Si vous en êtes encore au choix de la destination, notre guide [organiser un mariage à l'étranger](/blog/mariage-destination-etranger-organiser) détaille la logistique du voyage lui-même. Pour comprendre le socle administratif d'un mariage franco-étranger, voir [se marier avec un ressortissant étranger en France](/blog/se-marier-avec-un-etranger-france). Dans Fiancé, ajoutez le certificat de capacité et la transcription comme des tâches datées dans votre [timeline](/tools/timeline) pour ne pas les oublier une fois rentrés.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Getting married abroad is a lovely idea, but it's first an administrative path on two levels: on one side the rules of the country where you marry, on the other those of France, which only recognizes your union under certain conditions. The marriage is generally held under local law, then brought back into French civil records through a specific step: transcription.",
          "This article gives general markers. The documents, deadlines, and exact order vary by country and consulate: the up-to-date source for your situation remains the relevant French embassy or consulate, to contact as soon as the destination is on the table.",
        ],
      },
      {
        type: "text",
        title: "Choosing the frame: the law of the country of celebration",
        paragraphs: [
          "A marriage abroad is held under the forms set by local law: it sets the place, the officiant, and the run of the ceremony. Some countries require a period of residence on site before you can marry, others don't. That point sometimes shapes the whole travel calendar.",
          "On the French side, the substantive conditions of marriage (age, no prior marriage, free consent) are still checked by the consular authorities. It's this double lens, local and French, that explains the file's apparent heaviness.",
        ],
      },
      {
        type: "list",
        title: "The capacity-to-marry certificate",
        items: [
          "Before the celebration, you put together a file with the French embassy or consulate of the place of marriage",
          "The consulate publishes the banns, often posted as well in your home commune in France",
          "After that publication, and if the conditions of French law are met, the consulate issues you a capacity-to-marry certificate",
          "Local authorities frequently require this certificate before celebrating the union: it's best to plan for it ahead",
        ],
      },
      {
        type: "text",
        title: "Transcription, the step that makes the marriage recognized in France",
        paragraphs: [
          "Once married abroad, you request the transcription of the foreign marriage certificate into the civil registers of the French embassy or consulate of the place of celebration. It's this transcription that makes your marriage exist in the eyes of French administration: without it, the union is valid locally but stays, in practice, invisible in France.",
          "Concretely, until the marriage is transcribed, it's hard to have it produce effects here: family record book, change of situation, steps tied to your civil status. Transcription is in principle subject to no strict deadline, but nothing stops you from starting it without delay.",
        ],
      },
      {
        type: "list",
        title: "Documents generally required for transcription",
        items: [
          "The transcription request form, duly completed",
          "The original foreign marriage certificate, with a sworn translation if the language requires it",
          "A full copy of the French spouse's birth certificate",
          "The ID of both spouses and, depending on the case, proof of the capacity certificate issued before the marriage",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "The reflex to keep: a wedding abroad isn't over on the ceremony day. Until it's transcribed into French civil records, it isn't recognized in France. Treat transcription as a step in its own right, not an optional formality.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "If you're still choosing the destination, our guide to [organizing a wedding abroad](/blog/mariage-destination-etranger-organiser) covers the logistics of the trip itself. To understand the administrative base of a French-foreign wedding, see [marrying a foreign national in France](/blog/se-marier-avec-un-etranger-france). In Fiancé, add the capacity certificate and the transcription as dated tasks in your [timeline](/tools/timeline) so you don't forget them once you're home.",
        ],
      },
    ],
  }),

  postPair({
    slug: "changement-regime-matrimonial-apres-mariage",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Changer de régime matrimonial après le mariage : c'est possible",
    titleEn: "Changing your matrimonial regime after the wedding: it's possible",
    excerptFr:
      "Passer en séparation de biens ou en communauté universelle plusieurs années après l'union se fait chez le notaire. Pourquoi les couples le font, comment se déroule la procédure, et quand un juge peut entrer en jeu.",
    excerptEn:
      "Switching to separation of property or universal community years after the wedding is done at the notary. Why couples do it, how the procedure works, and when a judge can step in.",
    readingMinutes: 7,
    heroAltFr: "Couple révisant son régime matrimonial chez le notaire",
    heroAltEn: "Couple revising their matrimonial regime at the notary",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le régime matrimonial choisi au moment du mariage, ou celui appliqué par défaut faute de contrat, n'est pas figé à vie. La vie du couple évolue : création d'une entreprise, écart de patrimoine, famille recomposée, volonté de mieux protéger l'autre. La loi permet d'en changer une fois marié, par un acte notarié.",
          "Cet article explique le principe et les grandes étapes, avec des ordres de grandeur. Il ne remplace pas l'analyse d'un notaire, qui reste le seul à pouvoir dire si le changement est adapté à votre situation et selon quelles modalités.",
        ],
      },
      {
        type: "text",
        title: "Pourquoi changer de régime",
        paragraphs: [
          "Les motivations les plus fréquentes tournent autour de la protection et de la gestion du patrimoine. Un conjoint qui se lance dans une activité indépendante peut vouloir passer en séparation de biens pour mettre le patrimoine familial à l'abri des dettes professionnelles. À l'inverse, un couple âgé sans enfant, ou soucieux de se protéger mutuellement, peut envisager une communauté universelle avec clause d'attribution au survivant.",
          "Il n'existe pas de bon régime dans l'absolu : tout dépend de votre situation, de vos revenus, de la présence d'enfants et de vos objectifs. C'est précisément le rôle du notaire d'éclairer ce choix au regard de votre patrimoine réel.",
        ],
      },
      {
        type: "list",
        title: "Comment se déroule la procédure",
        items: [
          "Le changement est établi par acte notarié : le notaire rédige la convention modifiant ou remplaçant le régime existant",
          "Les enfants majeurs de chaque époux sont informés personnellement du changement envisagé et disposent d'un délai pour former opposition",
          "Les créanciers sont avertis par la publication d'un avis dans un journal d'annonces légales, avec eux aussi une possibilité d'opposition",
          "En l'absence d'opposition, le changement produit ses effets entre les époux, puis à l'égard des tiers après un délai",
        ],
      },
      {
        type: "text",
        title: "Coût et délai : les ordres de grandeur",
        paragraphs: [
          "Pour un changement simple, sans apport de biens immobiliers, le coût se compte souvent en quelques centaines d'euros d'honoraires et de frais, auxquels s'ajoutent les frais de publication. Le budget grimpe dès qu'un bien immobilier entre dans la communauté, car des droits proportionnels peuvent s'appliquer.",
          "Côté délai, comptez généralement plusieurs mois entre le premier rendez-vous et l'effet complet, du fait des délais d'information des enfants et des créanciers. Ces chiffres restent indicatifs : demandez un devis clair au notaire avant de vous engager.",
        ],
      },
      {
        type: "text",
        title: "Quand le juge intervient",
        paragraphs: [
          "Depuis la réforme de 2019, l'homologation par un juge n'est plus systématique : dans la plupart des cas, le notaire suffit. Le passage devant le juge redevient nécessaire dans certaines situations, notamment lorsque des enfants mineurs sont concernés ou lorsqu'une opposition d'un enfant majeur ou d'un créancier a été formée.",
          "Le notaire apprécie s'il doit saisir le juge pour protéger les intérêts en présence. Ce filtre n'est pas un obstacle : c'est une garantie que le changement ne se fait pas au détriment de tiers protégés.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Changer de régime n'est ni rare ni définitif : c'est un outil de gestion qui accompagne la vie du couple. La vraie question n'est pas « peut-on changer », mais « quel régime correspond à notre situation d'aujourd'hui ».",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour comprendre les différents régimes avant même de se marier, voir notre guide [contrat de mariage et régimes matrimoniaux](/blog/contrat-mariage-regimes-matrimoniaux). Le changement de régime se combine souvent avec une [donation entre époux pour protéger son conjoint](/blog/donation-entre-epoux-proteger-conjoint). Dans Fiancé, ajoutez le rendez-vous notaire comme une tâche dans votre [timeline](/tools/timeline) pour ne pas repousser une décision qui prend plusieurs mois à produire ses effets.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The matrimonial regime chosen at the wedding, or the one applied by default without a contract, isn't fixed for life. A couple's life evolves: starting a business, a growing gap in assets, a blended family, a wish to better protect the other. The law allows a change once married, through a notarial deed.",
          "This article explains the principle and the main steps, with orders of magnitude. It doesn't replace a notary's analysis, who alone can say whether the change suits your situation and on what terms.",
        ],
      },
      {
        type: "text",
        title: "Why change your regime",
        paragraphs: [
          "The most common reasons revolve around protecting and managing assets. A spouse starting self-employment may want to switch to separation of property to shield family assets from business debts. Conversely, an older couple with no children, or keen to protect each other, may consider a universal community with a clause attributing everything to the survivor.",
          "There's no good regime in the abstract: it all depends on your situation, your income, whether there are children, and your goals. It's precisely the notary's role to inform that choice against your real assets.",
        ],
      },
      {
        type: "list",
        title: "How the procedure works",
        items: [
          "The change is drawn up as a notarial deed: the notary writes the agreement modifying or replacing the existing regime",
          "The adult children of each spouse are personally informed of the planned change and have a window to object",
          "Creditors are notified through a notice published in a legal-announcements journal, with a possibility to object as well",
          "Absent any objection, the change takes effect between the spouses, then toward third parties after a delay",
        ],
      },
      {
        type: "text",
        title: "Cost and timing: orders of magnitude",
        paragraphs: [
          "For a simple change, with no contribution of real estate, the cost often runs to a few hundred euros in fees and charges, plus publication costs. The budget climbs as soon as a property enters the community, since proportional duties can apply.",
          "On timing, generally count several months between the first appointment and full effect, due to the notice periods for children and creditors. These figures stay indicative: ask the notary for a clear quote before committing.",
        ],
      },
      {
        type: "text",
        title: "When a judge steps in",
        paragraphs: [
          "Since the 2019 reform, approval by a judge is no longer automatic: in most cases, the notary is enough. A hearing before a judge becomes necessary again in certain situations, notably when minor children are involved or when an adult child or a creditor has filed an objection.",
          "The notary assesses whether to refer the matter to a judge to protect the interests at stake. This filter isn't an obstacle: it's a guarantee that the change isn't made at the expense of protected third parties.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Changing your regime is neither rare nor final: it's a management tool that follows the couple's life. The real question isn't «can we change», but «which regime fits our situation today».",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To understand the different regimes even before marrying, see our guide to [the marriage contract and matrimonial regimes](/blog/contrat-mariage-regimes-matrimoniaux). Changing regime often pairs with a [gift between spouses to protect your partner](/blog/donation-entre-epoux-proteger-conjoint). In Fiancé, add the notary appointment as a task in your [timeline](/tools/timeline) so you don't keep pushing back a decision that takes several months to take effect.",
        ],
      },
    ],
  }),

  postPair({
    slug: "livret-de-famille-mariage",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Le livret de famille : remis au mariage, à garder à jour",
    titleEn: "The family record book: issued at the wedding, kept up to date",
    excerptFr:
      "Remis le jour du mariage civil, le livret de famille suit la vie de votre foyer. Ce qu'il contient, comment le mettre à jour au fil des événements, et comment demander un duplicata en cas de perte.",
    excerptEn:
      "Issued on the day of the civil wedding, the family record book follows your household's life. What it contains, how to keep it updated over time, and how to request a duplicate if lost.",
    readingMinutes: 6,
    heroAltFr: "Livret de famille remis lors du mariage civil",
    heroAltEn: "Family record book issued at the civil wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le livret de famille est un document officiel qui récapitule les principaux actes d'état civil d'un foyer. Il est remis aux époux le jour du mariage civil, à la sortie de la salle des mariages, et vous accompagnera ensuite pendant des années à chaque grande démarche familiale.",
          "Cet article est pratique et procédural. Les modalités précises pouvant varier d'une commune à l'autre, la mairie de votre domicile reste l'interlocuteur à privilégier pour toute mise à jour ou demande de duplicata.",
        ],
      },
      {
        type: "text",
        title: "Ce que contient le livret",
        paragraphs: [
          "À la remise, le livret comporte l'extrait de l'acte de mariage des époux. Il est conçu pour s'enrichir ensuite : des pages sont prévues pour y inscrire les naissances des enfants, mais aussi certains événements comme un décès ou un divorce, sous forme d'extraits d'actes.",
          "Le livret n'est pas une pièce d'identité, mais il fait foi de la composition de la famille. Il est régulièrement demandé pour inscrire un enfant à l'école, constituer un dossier administratif ou justifier d'un lien de filiation.",
        ],
      },
      {
        type: "list",
        title: "Les événements à faire inscrire",
        items: [
          "La naissance de chaque enfant, à reporter sur le livret après la déclaration en mairie",
          "Un changement d'état civil comme un divorce, une séparation de corps ou le décès d'un membre de la famille",
          "Une adoption ou un changement de nom, selon les cas",
          "Chaque mise à jour se demande à la mairie et se fait à partir des actes d'état civil correspondants",
        ],
      },
      {
        type: "text",
        title: "Comment mettre le livret à jour",
        paragraphs: [
          "La mise à jour n'est pas automatique : c'est à vous d'adresser votre livret à la mairie compétente pour y faire porter le nouvel événement. En pratique, on transmet le livret accompagné des justificatifs demandés, et l'officier d'état civil y inscrit l'extrait correspondant.",
          "Garder son livret à jour évite bien des complications : un livret incomplet peut ralentir une démarche au moment où l'on en a le plus besoin. Le réflexe utile est de le faire compléter à chaque événement, sans attendre d'en avoir besoin en urgence.",
        ],
      },
      {
        type: "list",
        title: "Perte ou vol : demander un duplicata",
        items: [
          "La demande de duplicata s'adresse à la mairie de votre domicile, et non à celle du mariage si elle est différente",
          "Prévoyez une pièce d'identité, un justificatif de domicile récent et les informations d'état civil des personnes inscrites",
          "En cas de vol, un récépissé de déclaration au commissariat ou à la gendarmerie est souvent demandé",
          "La démarche est en général gratuite, mais le délai de délivrance peut prendre plusieurs semaines",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Rangez le livret de famille avec vos documents importants, pas dans un tiroir oublié. C'est une pièce difficile à reconstituer dans l'urgence, et le duplicata prend du temps : mieux vaut le retrouver tout de suite quand une démarche le réclame.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Le livret est remis à l'issue de la cérémonie : pour comprendre ce moment, voir [le déroulé de la cérémonie civile en mairie](/blog/ceremonie-civile-mairie-deroule). Le mettre à jour rejoint la liste des [démarches administratives après le mariage](/blog/demarches-administratives-apres-mariage). Et si l'un des époux prend le nom de l'autre, le sujet est traité dans notre guide [changement de nom après le mariage](/blog/changement-nom-apres-mariage).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The family record book is an official document summarizing a household's main civil-status records. It's handed to the spouses on the day of the civil wedding, as you leave the marriage hall, and will then follow you for years at every major family step.",
          "This article is practical and procedural. Since the exact terms can vary from one commune to another, your local town hall remains the contact of choice for any update or duplicate request.",
        ],
      },
      {
        type: "text",
        title: "What the book contains",
        paragraphs: [
          "When issued, the book carries an extract of the spouses' marriage certificate. It's designed to grow afterward: pages are set aside for children's births, but also for certain events such as a death or a divorce, in the form of record extracts.",
          "The book isn't an ID, but it establishes the family's composition. It's regularly asked for to enroll a child in school, put together an administrative file, or prove a filiation link.",
        ],
      },
      {
        type: "list",
        title: "Events to have recorded",
        items: [
          "The birth of each child, to be entered in the book after the town-hall declaration",
          "A change of civil status such as a divorce, legal separation, or the death of a family member",
          "An adoption or a name change, depending on the case",
          "Each update is requested from the town hall and made from the corresponding civil-status records",
        ],
      },
      {
        type: "text",
        title: "How to keep the book updated",
        paragraphs: [
          "Updating isn't automatic: it's up to you to send your book to the relevant town hall to have the new event recorded. In practice, you submit the book with the requested supporting documents, and the registrar enters the corresponding extract.",
          "Keeping your book up to date avoids plenty of complications: an incomplete book can slow down a step just when you need it most. The useful reflex is to have it completed at each event, without waiting until you urgently need it.",
        ],
      },
      {
        type: "list",
        title: "Loss or theft: requesting a duplicate",
        items: [
          "The duplicate request goes to your local town hall, not to the one of the wedding if it's different",
          "Plan for an ID, recent proof of address, and the civil-status details of the people recorded",
          "In case of theft, a report receipt from the police or gendarmerie is often required",
          "The process is generally free, but issuance can take several weeks",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Store the family record book with your important documents, not in a forgotten drawer. It's hard to reconstitute in a hurry, and the duplicate takes time: better to find it right away when a step calls for it.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "The book is handed over at the end of the ceremony: to understand that moment, see [the run of the civil ceremony at the town hall](/blog/ceremonie-civile-mairie-deroule). Keeping it updated joins the list of [administrative steps after the wedding](/blog/demarches-administratives-apres-mariage). And if one spouse takes the other's name, the subject is covered in our guide to [the name change after the wedding](/blog/changement-nom-apres-mariage).",
        ],
      },
    ],
  }),

  postPair({
    slug: "demarches-administratives-apres-mariage",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Démarches administratives après le mariage : la checklist",
    titleEn: "Administrative steps after the wedding: the checklist",
    excerptFr:
      "Employeur, sécurité sociale, mutuelle, banque, assurance habitation : une fois le mariage passé, quelques organismes doivent être prévenus. La liste claire pour ne rien oublier dans les semaines qui suivent.",
    excerptEn:
      "Employer, social security, health plan, bank, home insurance: once the wedding is over, a few organizations need to be told. The clear list so you forget nothing in the weeks that follow.",
    readingMinutes: 6,
    heroAltFr: "Couple gérant ses démarches administratives après le mariage",
    heroAltEn: "Couple handling their paperwork after the wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Une fois le mariage célébré et la fête passée, il reste une petite série de démarches à mener pour que votre nouvelle situation soit prise en compte partout. Rien d'urgent au point de gâcher la lune de miel, mais rien à laisser traîner non plus : certains droits ou avantages ne s'appliquent qu'une fois l'information transmise.",
          "Cette liste couvre les organismes courants, hors deux sujets qui ont leur propre article : les impôts et le changement de nom. Selon votre situation, tout ne vous concernera pas ; prenez ce qui s'applique et laissez le reste.",
        ],
      },
      {
        type: "list",
        title: "Travail et protection sociale",
        items: [
          "Prévenir votre employeur (service RH) pour mettre à jour votre état civil, votre adresse et, le cas échéant, bénéficier de congés ou avantages liés au mariage",
          "Signaler le changement de situation à l'Assurance Maladie, notamment pour rattacher le conjoint comme ayant droit si besoin",
          "Vérifier auprès de votre mutuelle si l'un peut bénéficier du contrat de l'autre, parfois sans surcoût",
          "Informer la CAF si vous percevez des aides indexées sur la situation ou les revenus du foyer",
        ],
      },
      {
        type: "list",
        title: "Argent, logement et assurances",
        items: [
          "Mettre à jour vos comptes bancaires et, si vous le souhaitez, ouvrir un compte joint",
          "Actualiser votre assurance habitation pour y inclure le conjoint et refléter la nouvelle composition du foyer",
          "Revoir les contrats d'assurance auto, santé ou prévoyance en fonction de votre situation",
          "Prévenir le propriétaire ou le bailleur si le bail doit mentionner les deux conjoints",
        ],
      },
      {
        type: "text",
        title: "Faut-il tout faire tout de suite ?",
        paragraphs: [
          "Non, mais mieux vaut ne pas trop attendre. Les démarches liées à la protection sociale (Assurance Maladie, mutuelle) et à l'employeur méritent d'être lancées dans les premières semaines, car elles conditionnent parfois des droits. Les mises à jour de contrats (banque, assurances) peuvent suivre à un rythme plus tranquille.",
          "Un bon repère : regroupez les démarches par pièce justificative. Beaucoup d'organismes demandent la même chose (un extrait ou une copie de l'acte de mariage) ; en demander plusieurs exemplaires à la mairie dès le départ évite les allers-retours.",
        ],
      },
      {
        type: "text",
        title: "Garder une trace de ce qui est fait",
        paragraphs: [
          "Le piège classique, c'est de croire avoir prévenu un organisme sans l'avoir réellement fait, ou de s'y prendre à deux. Notez, au fur et à mesure, qui a été informé et quand. Cette liste devient vite utile quand un courrier arrive encore à l'ancien nom ou à l'ancienne situation.",
          "Répartir les démarches entre les deux conjoints allège aussi la charge : chacun prend les organismes qui le concernent en propre, et vous partagez ceux du foyer.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Demandez plusieurs copies de l'acte de mariage à la mairie dès le début : c'est la pièce que presque tous les organismes réclament. En avoir une petite réserve d'avance transforme une corvée en simple formalité.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Deux démarches ont leur propre guide, plus détaillé : le [changement de nom après le mariage](/blog/changement-nom-apres-mariage) et la [déclaration d'impôts de l'année du mariage](/blog/mariage-impots-declaration-commune). Pensez aussi à garder votre [livret de famille](/blog/livret-de-famille-mariage) à jour au fil des événements. Une fois ces démarches lancées, il reste le plus agréable : les [remerciements après le mariage](/blog/remerciements-apres-mariage).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Once the wedding is celebrated and the party is over, a small series of steps remain so your new situation is taken into account everywhere. Nothing urgent enough to ruin the honeymoon, but nothing to let drift either: some rights or benefits only apply once the information is passed on.",
          "This list covers the common organizations, except two subjects that have their own article: taxes and the name change. Depending on your situation, not everything will apply; take what fits and leave the rest.",
        ],
      },
      {
        type: "list",
        title: "Work and social protection",
        items: [
          "Tell your employer (HR) to update your civil status, address, and, where relevant, benefit from marriage-related leave or perks",
          "Report the change of situation to the health-insurance body, notably to attach your spouse as a dependent if needed",
          "Check with your supplementary health plan whether one can benefit from the other's contract, sometimes at no extra cost",
          "Inform the family-benefits office if you receive support indexed on the household's situation or income",
        ],
      },
      {
        type: "list",
        title: "Money, housing, and insurance",
        items: [
          "Update your bank accounts and, if you wish, open a joint account",
          "Update your home insurance to include your spouse and reflect the new household composition",
          "Review car, health, or provident insurance contracts based on your situation",
          "Notify the landlord if the lease should mention both spouses",
        ],
      },
      {
        type: "text",
        title: "Do you have to do it all right away?",
        paragraphs: [
          "No, but it's best not to wait too long. Steps tied to social protection (health insurance, supplementary plan) and to your employer deserve to be started in the first weeks, since they sometimes condition rights. Contract updates (bank, insurance) can follow at a calmer pace.",
          "A good marker: group the steps by supporting document. Many organizations ask for the same thing (an extract or copy of the marriage certificate); requesting several copies from the town hall from the start avoids back-and-forth.",
        ],
      },
      {
        type: "text",
        title: "Keeping track of what's done",
        paragraphs: [
          "The classic trap is thinking you've notified an organization without actually having done it, or doing it twice. Note, as you go, who was informed and when. That list quickly becomes useful when a letter still arrives under the old name or old situation.",
          "Splitting the steps between the two spouses also lightens the load: each takes the organizations that concern them personally, and you share the household ones.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Ask the town hall for several copies of the marriage certificate from the start: it's the document almost every organization requests. Keeping a small reserve on hand turns a chore into a simple formality.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Two steps have their own, more detailed guide: the [name change after the wedding](/blog/changement-nom-apres-mariage) and the [tax return for the year you marry](/blog/mariage-impots-declaration-commune). Also remember to keep your [family record book](/blog/livret-de-famille-mariage) updated as events occur. Once these steps are underway, the nicest one remains: the [thank-yous after the wedding](/blog/remerciements-apres-mariage).",
        ],
      },
    ],
  }),

  postPair({
    slug: "assurance-responsabilite-mariage-jour-j",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Responsabilité civile le jour J : qui paie si un invité se blesse",
    titleEn: "Day-of liability: who pays if a guest gets hurt",
    excerptFr:
      "Distincte de l'assurance annulation, la responsabilité civile couvre les dommages causés à un tiers ou au lieu pendant la réception. Ce que votre contrat habitation prend déjà en charge, et quand une assurance dédiée se justifie.",
    excerptEn:
      "Distinct from cancellation insurance, liability cover handles damage caused to a third party or the venue during the reception. What your home policy already covers, and when a dedicated policy makes sense.",
    readingMinutes: 6,
    heroAltFr: "Réception de mariage dans une salle louée",
    heroAltEn: "Wedding reception in a rented venue",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Quand on parle d'assurance mariage, on pense d'abord à l'annulation : que se passe-t-il si l'événement ne peut pas avoir lieu. Mais il existe un autre volet, souvent négligé : la responsabilité civile le jour J. Elle ne couvre pas le report, mais les dommages causés pendant la réception, à un invité, à un tiers ou au lieu loué.",
          "Cet article aide à y voir clair sur ce qui est déjà couvert et ce qui ne l'est pas. Les garanties dépendant fortement des contrats, la seule façon de savoir où vous en êtes est de relire votre police et d'interroger votre assureur avant le jour J.",
        ],
      },
      {
        type: "text",
        title: "Ce que couvre la responsabilité civile",
        paragraphs: [
          "La responsabilité civile joue quand vous, en tant qu'organisateur, êtes tenu responsable d'un dommage subi par autrui : un invité qui chute et se blesse, un dégât causé au mobilier ou au bâtiment de la salle, un objet endommagé. Ce sont les situations les plus fréquentes d'un grand rassemblement où l'on danse, boit et circule beaucoup.",
          "C'est un tout autre risque que l'annulation. L'annulation protège votre budget si le mariage n'a pas lieu ; la responsabilité civile protège votre patrimoine si quelque chose tourne mal pendant qu'il a bien lieu.",
        ],
      },
      {
        type: "text",
        title: "Votre assurance habitation en couvre déjà une partie",
        paragraphs: [
          "Beaucoup de contrats multirisque habitation incluent une responsabilité civile qui peut, selon les cas, s'étendre à un événement privé comme un mariage, parfois via une garantie de type villégiature. Autrement dit, vous êtes peut-être déjà partiellement couvert sans le savoir.",
          "Mais « peut-être » et « en partie » ne suffisent pas pour un événement à fort enjeu. Les plafonds, les exclusions et les conditions varient d'un contrat à l'autre. Le bon réflexe est d'appeler votre assureur, de décrire précisément l'événement (lieu loué, nombre d'invités, prestataires) et de demander par écrit ce qui est couvert.",
        ],
      },
      {
        type: "list",
        title: "Quand une assurance dédiée se justifie",
        items: [
          "Quand le loueur de la salle exige une attestation de responsabilité civile pour l'événement, ce qui est fréquent",
          "Quand votre contrat habitation exclut ou plafonne trop bas les dommages liés à un événement de cette ampleur",
          "Quand le lieu loué a une valeur élevée (château, domaine, matériel technique) et qu'un dégât coûterait cher",
          "Quand le nombre d'invités est important et que le risque de dommage augmente mécaniquement",
        ],
      },
      {
        type: "text",
        title: "Comment décider sans se sur-assurer",
        paragraphs: [
          "La démarche tient en trois questions. Que demande le contrat de location de la salle ? Que couvre déjà mon assurance habitation ? Quel est l'écart entre les deux ? Si votre habitation couvre le nécessaire et que le lieu ne réclame rien de plus, une assurance dédiée fait souvent doublon.",
          "À l'inverse, si le lieu exige une attestation que vous ne pouvez pas fournir, ou si votre couverture est insuffisante, une police événementielle d'une journée comble le trou pour un coût modeste au regard du budget global. Ne souscrivez pas par réflexe : souscrivez pour combler un manque identifié.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Ne confondez pas les deux assurances : l'annulation protège votre budget, la responsabilité civile protège votre patrimoine. On peut avoir besoin de l'une, de l'autre, des deux, ou d'aucune selon ce que couvrent déjà vos contrats existants.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour l'autre grande assurance, celle qui protège votre budget, voir notre guide [assurance annulation du mariage](/blog/assurance-annulation-mariage). Les exigences d'assurance sont souvent écrites dans le contrat du lieu : notre article [clauses à vérifier dans un contrat prestataire](/blog/contrat-prestataire-clauses-verifier) explique comment les repérer, tout comme le choix du [type de lieu de réception](/blog/choisir-lieu-reception-types). Et pour les incidents mineurs, [les imprévus du jour J](/blog/imprevus-jour-j-mariage) complète la préparation.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "When people talk about wedding insurance, they think first of cancellation: what happens if the event can't take place. But there's another side, often overlooked: day-of liability. It doesn't cover postponement, but the damage caused during the reception, to a guest, a third party, or the rented venue.",
          "This article helps clarify what's already covered and what isn't. Since cover depends heavily on the contracts, the only way to know where you stand is to reread your policy and question your insurer before the big day.",
        ],
      },
      {
        type: "text",
        title: "What liability cover handles",
        paragraphs: [
          "Liability cover kicks in when you, as the organizer, are held responsible for damage suffered by someone else: a guest who falls and gets hurt, damage to the venue's furniture or building, a broken object. These are the most frequent situations at a large gathering where people dance, drink, and move around a lot.",
          "It's a completely different risk from cancellation. Cancellation protects your budget if the wedding doesn't happen; liability protects your assets if something goes wrong while it does.",
        ],
      },
      {
        type: "text",
        title: "Your home insurance already covers part of it",
        paragraphs: [
          "Many home-insurance contracts include liability cover that can, in some cases, extend to a private event like a wedding, sometimes through a holiday-type guarantee. In other words, you may already be partly covered without knowing it.",
          "But «maybe» and «partly» aren't enough for a high-stakes event. Limits, exclusions, and conditions vary from one contract to another. The right reflex is to call your insurer, describe the event precisely (rented venue, guest count, vendors), and ask in writing what's covered.",
        ],
      },
      {
        type: "list",
        title: "When a dedicated policy makes sense",
        items: [
          "When the venue rental requires a liability certificate for the event, which is common",
          "When your home contract excludes or caps too low the damage tied to an event this size",
          "When the rented venue is high-value (château, estate, technical gear) and damage would be costly",
          "When the guest count is large and the risk of damage mechanically rises",
        ],
      },
      {
        type: "text",
        title: "How to decide without over-insuring",
        paragraphs: [
          "The process comes down to three questions. What does the venue rental contract require? What does my home insurance already cover? What's the gap between the two? If your home policy covers what's needed and the venue asks for nothing more, a dedicated policy often just duplicates it.",
          "Conversely, if the venue requires a certificate you can't provide, or if your cover is insufficient, a one-day event policy fills the gap for a modest cost against the overall budget. Don't subscribe by reflex: subscribe to fill an identified gap.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Don't confuse the two policies: cancellation protects your budget, liability protects your assets. You may need one, the other, both, or neither depending on what your existing contracts already cover.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "For the other major insurance, the one protecting your budget, see our guide to [wedding cancellation insurance](/blog/assurance-annulation-mariage). Insurance requirements are often written into the venue contract: our article on [clauses to check in a vendor contract](/blog/contrat-prestataire-clauses-verifier) explains how to spot them, as does choosing the [type of reception venue](/blog/choisir-lieu-reception-types). And for minor incidents, [wedding-day surprises](/blog/imprevus-jour-j-mariage) rounds out your preparation.",
        ],
      },
    ],
  }),

  postPair({
    slug: "annuler-mariage-contrats-acomptes",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Annuler un mariage : contrats prestataires et acomptes versés",
    titleEn: "Cancelling a wedding: vendor contracts and deposits paid",
    excerptFr:
      "Acompte ou arrhes, la distinction change tout en cas d'annulation. Comment lire les clauses de vos contrats, ce que vous pouvez espérer récupérer, et dans quel ordre gérer une décision difficile.",
    excerptEn:
      "Deposit or earnest money, the distinction changes everything if you cancel. How to read your contract clauses, what you can hope to recover, and in what order to handle a hard decision.",
    readingMinutes: 7,
    heroAltFr: "Couple relisant ses contrats prestataires",
    heroAltEn: "Couple rereading their vendor contracts",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Annuler un mariage est une décision lourde, rarement prise de gaieté de cœur. Une fois la décision posée, restent les conséquences concrètes : des contrats signés, des acomptes versés, des prestataires à prévenir. Bien géré, ce volet reste maîtrisable ; mal anticipé, il ajoute du stress à un moment déjà difficile.",
          "Cet article donne des repères généraux sur le sort des sommes versées et des contrats. Le droit applicable et les clauses variant selon chaque contrat, en cas de litige ou de montant important, faites relire vos contrats par un professionnel du droit ou une association de consommateurs.",
        ],
      },
      {
        type: "text",
        title: "Acompte et arrhes : une distinction qui change tout",
        paragraphs: [
          "Deux termes se cachent derrière l'argent versé à la réservation, et ils n'ont pas les mêmes effets. Les arrhes ouvrent une faculté de dédit : si vous annulez, vous les perdez, mais si le prestataire annule, il vous doit en principe le double. L'acompte, lui, engage fermement les deux parties : en cas d'annulation de votre fait, vous pouvez rester redevable au-delà de la somme déjà versée.",
          "Le mot employé dans le contrat compte donc énormément. En pratique, beaucoup de documents utilisent les deux termes de façon floue, ce qui alimente les litiges. Ne présumez pas : cherchez le terme exact dans votre contrat, et à défaut de clarté, faites-vous confirmer sa nature.",
        ],
      },
      {
        type: "quote",
        quote:
          "Avant de discuter avec un prestataire, relisez la clause d'annulation de son contrat : c'est elle, et non le simple bon sens, qui fixe ce que vous devez et ce que vous pouvez récupérer.",
      },
      {
        type: "list",
        title: "Lire la clause d'annulation",
        items: [
          "Repérer le terme employé pour les sommes versées : acompte, arrhes, ou une formulation propre au contrat",
          "Identifier le barème d'annulation, souvent progressif selon le nombre de mois restant avant la date",
          "Vérifier ce qui est prévu si c'est le prestataire qui annule ou ne peut pas assurer la prestation",
          "Noter les modalités : forme de la notification (souvent une lettre recommandée) et délais à respecter",
        ],
      },
      {
        type: "text",
        title: "Ce que vous pouvez espérer récupérer",
        paragraphs: [
          "Il n'y a pas de règle unique : tout dépend de la nature de la somme, de la clause du contrat et du moment de l'annulation. Plus vous annulez tôt, plus la marge de discussion est généralement large, notamment si le prestataire peut revendre la date. À l'approche de l'événement, les barèmes deviennent le plus souvent défavorables.",
          "Un échange à l'amiable règle beaucoup de situations : certains prestataires acceptent de reporter la prestation, de transférer l'acompte sur une autre date, ou de trouver un compromis plutôt que d'aller au conflit. Formalisez toujours l'accord obtenu par écrit.",
        ],
      },
      {
        type: "list",
        title: "L'ordre des opérations, à froid",
        items: [
          "Poser la décision à deux et l'assumer clairement avant de contacter qui que ce soit",
          "Lister tous les contrats signés et les sommes déjà versées, prestataire par prestataire",
          "Relire chaque clause d'annulation avant d'appeler, pour négocier en connaissant vos droits",
          "Prévenir les prestataires, puis les invités, et conserver une trace écrite de chaque échange",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Ne négociez jamais une annulation sous le coup de l'émotion et sans avoir relu vos contrats. Quelques heures pour lister les sommes et les clauses vous placent en bien meilleure position que dix coups de fil dans la précipitation.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Tout se joue dans les contrats : notre guide [clauses à vérifier dans un contrat prestataire](/blog/contrat-prestataire-clauses-verifier) montre où se cache la clause d'annulation. Si l'événement peut être décalé plutôt qu'abandonné, voir [reporter le mariage et changer de date](/blog/reporter-mariage-changer-date). Une [assurance annulation](/blog/assurance-annulation-mariage) souscrite en amont peut aussi limiter les pertes. Et pour traverser cette période, [gérer le stress](/blog/gerer-stress-mariage-serenite) reste précieux.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Cancelling a wedding is a heavy decision, rarely taken lightly. Once the decision is made, the concrete consequences remain: signed contracts, deposits paid, vendors to notify. Handled well, this side stays manageable; poorly anticipated, it adds stress to an already hard moment.",
          "This article gives general markers on the fate of the sums paid and the contracts. Since the applicable law and clauses vary by contract, in case of dispute or a large amount, have your contracts reviewed by a legal professional or a consumer association.",
        ],
      },
      {
        type: "text",
        title: "Deposit and earnest money: a distinction that changes everything",
        paragraphs: [
          "Two terms hide behind the money paid at booking, and they don't have the same effects. Earnest money (arrhes) opens a right to withdraw: if you cancel, you lose it, but if the vendor cancels, they in principle owe you double. A deposit (acompte) firmly binds both parties: if you cancel, you may remain liable beyond the sum already paid.",
          "The word used in the contract therefore matters enormously. In practice, many documents use both terms vaguely, which fuels disputes. Don't assume: look for the exact term in your contract, and where it's unclear, have its nature confirmed.",
        ],
      },
      {
        type: "quote",
        quote:
          "Before talking to a vendor, reread the cancellation clause of their contract: it, not plain common sense, sets what you owe and what you can recover.",
      },
      {
        type: "list",
        title: "Reading the cancellation clause",
        items: [
          "Spot the term used for the sums paid: deposit, earnest money, or a wording specific to the contract",
          "Identify the cancellation scale, often progressive by the number of months left before the date",
          "Check what's planned if it's the vendor who cancels or can't deliver the service",
          "Note the procedure: form of notification (often a registered letter) and deadlines to respect",
        ],
      },
      {
        type: "text",
        title: "What you can hope to recover",
        paragraphs: [
          "There's no single rule: it all depends on the nature of the sum, the contract clause, and the timing of the cancellation. The earlier you cancel, the wider the room for discussion is generally, especially if the vendor can resell the date. As the event approaches, the scales most often turn unfavorable.",
          "An amicable exchange settles many situations: some vendors agree to postpone the service, transfer the deposit to another date, or find a compromise rather than a conflict. Always put any agreement reached in writing.",
        ],
      },
      {
        type: "list",
        title: "The order of operations, kept cool",
        items: [
          "Make the decision together and own it clearly before contacting anyone",
          "List all signed contracts and sums already paid, vendor by vendor",
          "Reread each cancellation clause before calling, to negotiate knowing your rights",
          "Notify the vendors, then the guests, and keep a written record of every exchange",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Never negotiate a cancellation in the heat of emotion and without rereading your contracts. A few hours listing the sums and clauses put you in a far better position than ten phone calls made in a rush.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "It all plays out in the contracts: our guide to [clauses to check in a vendor contract](/blog/contrat-prestataire-clauses-verifier) shows where the cancellation clause hides. If the event can be moved rather than dropped, see [postponing the wedding and changing the date](/blog/reporter-mariage-changer-date). A [cancellation insurance](/blog/assurance-annulation-mariage) taken out ahead can also limit losses. And to get through this period, [managing stress](/blog/gerer-stress-mariage-serenite) stays valuable.",
        ],
      },
    ],
  }),

  postPair({
    slug: "reporter-mariage-changer-date",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Reporter le mariage : changer de date sans tout perdre",
    titleEn: "Postponing the wedding: changing the date without losing everything",
    excerptFr:
      "Reporter n'est pas annuler. Renégocier les disponibilités des prestataires, transférer les acomptes plutôt que les perdre, prévenir les invités et réordonner la timeline : la marche à suivre, dans le bon ordre.",
    excerptEn:
      "Postponing isn't cancelling. Renegotiating vendor availability, transferring deposits rather than losing them, informing guests, and re-sequencing the timeline: the steps to follow, in the right order.",
    readingMinutes: 6,
    heroAltFr: "Couple choisissant une nouvelle date de mariage",
    heroAltEn: "Couple choosing a new wedding date",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Reporter un mariage arrive plus souvent qu'on ne le croit : imprévu de santé, grossesse, contrainte professionnelle, ou simplement l'envie de se laisser plus de temps. La bonne nouvelle, c'est que reporter n'a rien à voir avec annuler : dans la plupart des cas, on ne repart pas de zéro, on décale.",
          "L'enjeu est surtout logistique : faire coïncider une nouvelle date avec la disponibilité de tous les prestataires, sans perdre les sommes déjà versées. Tout se joue dans l'ordre des démarches, et cet article le déroule pas à pas.",
        ],
      },
      {
        type: "text",
        title: "Commencer par les prestataires, pas par les invités",
        paragraphs: [
          "Le réflexe est de prévenir d'abord la famille et les amis, mais c'est une erreur. Tant que la nouvelle date n'est pas confirmée avec vos prestataires clés, elle n'existe pas vraiment : rien ne sert d'annoncer un jour qui pourrait ne pas convenir au lieu ou au traiteur.",
          "Contactez donc en priorité les prestataires les plus difficiles à remplacer, souvent le lieu et le traiteur, pour croiser leurs disponibilités. La nouvelle date se choisit à l'intersection de ces agendas, pas avant.",
        ],
      },
      {
        type: "list",
        title: "Renégocier les contrats",
        items: [
          "Vérifier, contrat par contrat, ce que prévoit une modification de date : certains la permettent sans frais, d'autres non",
          "Demander un avenant écrit mentionnant la nouvelle date, plutôt qu'un simple accord oral",
          "Contrôler si le tarif reste identique : un changement de saison peut modifier le prix",
          "Confirmer que les acomptes déjà versés sont transférés sur la nouvelle date, et non perdus",
        ],
      },
      {
        type: "text",
        title: "Transfert d'acompte plutôt que perte",
        paragraphs: [
          "C'est la différence majeure avec une annulation. Dans un report, beaucoup de prestataires acceptent de reporter la prestation et de transférer l'acompte, puisqu'ils conservent le contrat, simplement à une autre date. Vous perdez rarement les sommes versées si vous restez client.",
          "Attention toutefois aux dates de haute saison : si vous passez d'un jour creux à un samedi de juin, un ajustement de prix est possible. Faites préciser par écrit ce qui est transféré, ce qui reste dû, et à quelles conditions, pour éviter les malentendus le moment venu.",
        ],
      },
      {
        type: "list",
        title: "Prévenir les invités et réordonner la timeline",
        items: [
          "Une fois la date verrouillée avec les prestataires, informer les invités le plus tôt possible pour qu'ils réorganisent transport et hébergement",
          "Renvoyer un « change the date » clair, par le canal le plus rapide, avant les faire-part définitifs",
          "Recaler toutes les échéances des préparatifs sur la nouvelle date, du dossier de mairie aux essayages",
          "Vérifier la validité des documents administratifs, dont certains ont une durée limitée",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "L'ordre fait tout : prestataires d'abord, invités ensuite. Annoncer une date avant de l'avoir confirmée avec le lieu et le traiteur, c'est risquer de devoir se dédire, ce qui coûte plus cher en crédibilité qu'un simple report bien géré.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Reporter suppose de relire ses contrats : notre guide [clauses à vérifier dans un contrat prestataire](/blog/contrat-prestataire-clauses-verifier) indique où regarder pour les frais de modification. Si le report se transforme en abandon, voir [annuler un mariage : contrats et acomptes](/blog/annuler-mariage-contrats-acomptes). Pour annoncer la nouvelle date, notre article [save the date et faire-part](/blog/save-the-date-faire-part-calendrier) aide à choisir le bon message. Enfin, recalez toutes les étapes dans la [timeline](/tools/timeline).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Postponing a wedding happens more often than people think: a health issue, a pregnancy, a work constraint, or simply the wish to give yourselves more time. The good news is that postponing has nothing to do with cancelling: in most cases, you don't start from scratch, you shift.",
          "The challenge is mainly logistical: matching a new date with every vendor's availability, without losing the sums already paid. It all comes down to the order of the steps, and this article walks through it one by one.",
        ],
      },
      {
        type: "text",
        title: "Start with the vendors, not the guests",
        paragraphs: [
          "The instinct is to tell family and friends first, but that's a mistake. Until the new date is confirmed with your key vendors, it doesn't really exist: there's no point announcing a day that might not suit the venue or caterer.",
          "So contact first the vendors that are hardest to replace, often the venue and the caterer, to cross-check their availability. The new date is chosen at the intersection of those calendars, not before.",
        ],
      },
      {
        type: "list",
        title: "Renegotiating the contracts",
        items: [
          "Check, contract by contract, what a date change allows: some permit it at no charge, others don't",
          "Ask for a written amendment stating the new date, rather than a mere verbal agreement",
          "Verify whether the price stays the same: a change of season can shift the rate",
          "Confirm that deposits already paid are transferred to the new date, not lost",
        ],
      },
      {
        type: "text",
        title: "Transferring the deposit rather than losing it",
        paragraphs: [
          "This is the major difference from a cancellation. In a postponement, many vendors agree to move the service and transfer the deposit, since they keep the contract, simply on another date. You rarely lose the sums paid if you stay a client.",
          "Beware peak-season dates, though: if you move from a quiet day to a Saturday in June, a price adjustment is possible. Have it stated in writing what's transferred, what remains owed, and on what conditions, to avoid misunderstandings when the time comes.",
        ],
      },
      {
        type: "list",
        title: "Informing guests and re-sequencing the timeline",
        items: [
          "Once the date is locked with vendors, tell guests as early as possible so they can rearrange travel and lodging",
          "Send a clear «change the date» through the fastest channel, before the final invitations",
          "Reset all planning deadlines to the new date, from the town-hall file to the fittings",
          "Check the validity of administrative documents, some of which have a limited lifespan",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Order is everything: vendors first, guests second. Announcing a date before confirming it with the venue and caterer risks having to walk it back, which costs more in credibility than a well-handled postponement.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Postponing means rereading your contracts: our guide to [clauses to check in a vendor contract](/blog/contrat-prestataire-clauses-verifier) points to where the change fees hide. If the postponement turns into a cancellation, see [cancelling a wedding: contracts and deposits](/blog/annuler-mariage-contrats-acomptes). To announce the new date, our article on [save-the-dates and invitations](/blog/save-the-date-faire-part-calendrier) helps choose the right message. Finally, reset every step in the [timeline](/tools/timeline).",
        ],
      },
    ],
  }),

  postPair({
    slug: "mariage-nom-des-enfants",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Mariage et nom des enfants : ce que l'union change (ou non)",
    titleEn: "Marriage and children's surnames: what the union changes (or not)",
    excerptFr:
      "Se marier ne change pas automatiquement le nom d'un enfant. Le choix de nom, le rôle de la reconnaissance et le principe du même nom pour toute la fratrie : les repères généraux, à confirmer selon votre situation.",
    excerptEn:
      "Marrying doesn't automatically change a child's name. The choice of name, the role of recognition, and the same-name-for-all-siblings principle: general markers, to confirm for your situation.",
    readingMinutes: 6,
    heroAltFr: "Parents mariés avec leur enfant",
    heroAltEn: "Married parents with their child",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Beaucoup de couples pensent que se marier va, mécaniquement, changer le nom de famille de leurs enfants déjà nés. Ce n'est pas le cas : le mariage des parents n'emporte pas, à lui seul, de changement automatique du nom d'un enfant. Le nom d'un enfant obéit à ses propres règles, distinctes de celles du couple.",
          "Cet article donne des repères généraux sur un sujet qui touche à l'état civil et à la filiation. Les situations familiales étant très variées, renseignez-vous auprès de votre mairie ou d'un notaire pour votre cas précis. Le changement de nom d'un époux, lui, est traité dans un autre article.",
        ],
      },
      {
        type: "text",
        title: "Le choix de nom à la naissance",
        paragraphs: [
          "Lorsqu'un enfant a ses deux filiations établies, les parents peuvent, par déclaration conjointe, lui donner le nom de l'un, le nom de l'autre, ou les deux noms accolés dans l'ordre qu'ils choisissent. Ce choix se fait au moment de la déclaration à l'état civil et reflète la volonté des parents, pas leur statut marital.",
          "À défaut de choix exprimé, des règles par défaut s'appliquent pour attribuer le nom. L'essentiel à retenir : le nom découle de la filiation et de la déclaration des parents, et non du fait qu'ils soient mariés ou non.",
        ],
      },
      {
        type: "list",
        title: "Le principe du même nom pour la fratrie",
        items: [
          "Le nom retenu pour le premier enfant commun s'impose ensuite aux autres enfants communs du couple",
          "On ne peut donc pas donner un nom différent à chaque enfant d'un même couple",
          "Ce principe vaut que les parents soient mariés ou non : c'est la filiation qui compte",
          "Il vise à préserver l'unité de nom au sein d'une même fratrie",
        ],
      },
      {
        type: "text",
        title: "Le rôle de la reconnaissance",
        paragraphs: [
          "Pour les couples non mariés, la reconnaissance de l'enfant établit le lien de filiation, notamment du côté du parent qui ne bénéficie pas d'une présomption. Le moment et l'ordre des reconnaissances peuvent influencer le nom attribué par défaut, en l'absence de déclaration conjointe de choix de nom.",
          "Se marier ensuite ne réécrit pas ce qui a été fixé à la naissance. Si les parents souhaitent faire évoluer le nom de l'enfant après coup, cela relève de démarches spécifiques, encadrées, et non d'un effet automatique du mariage.",
        ],
      },
      {
        type: "text",
        title: "Faire évoluer le nom après coup",
        paragraphs: [
          "Il existe des procédures permettant, dans certaines conditions, d'ajouter ou de modifier le nom d'un enfant, par exemple pour y accoler le nom du parent qui ne l'a pas transmis. Ces démarches supposent en général l'accord des titulaires de l'autorité parentale, et l'avis de l'enfant est recueilli à partir d'un certain âge.",
          "Ce sont des sujets sensibles, où chaque situation est particulière. Avant d'engager quoi que ce soit, un point avec la mairie ou un notaire permet de vérifier la voie adaptée et les pièces nécessaires.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "À retenir : le mariage des parents ne change pas, à lui seul, le nom d'un enfant déjà né. Le nom relève du choix de nom et de la filiation. Pour toute évolution, passez par les démarches dédiées, pas par une supposée conséquence automatique du mariage.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Le nom des époux, lui, suit une logique différente : voir notre guide dédié [changement de nom après le mariage](/blog/changement-nom-apres-mariage). Les évolutions de nom se reportent aussi sur le [livret de famille](/blog/livret-de-famille-mariage), qu'il faut tenir à jour. Et si vous comparez encore les statuts du couple avant de vous décider, [PACS ou mariage](/blog/pacs-ou-mariage-choisir) éclaire ce qui change vraiment pour la famille.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Many couples think that marrying will, mechanically, change the surname of their already-born children. It doesn't: the parents' marriage doesn't, on its own, bring an automatic change to a child's name. A child's name follows its own rules, distinct from the couple's.",
          "This article gives general markers on a subject tied to civil status and filiation. Since family situations vary widely, check with your town hall or a notary for your specific case. The name change of a spouse is covered in another article.",
        ],
      },
      {
        type: "text",
        title: "The choice of name at birth",
        paragraphs: [
          "When a child has both filiations established, the parents can, by joint declaration, give the child one parent's name, the other's, or both names combined in the order they choose. This choice is made at the civil-status declaration and reflects the parents' will, not their marital status.",
          "Absent an expressed choice, default rules apply to assign the name. The key point: the name flows from filiation and the parents' declaration, not from whether they're married.",
        ],
      },
      {
        type: "list",
        title: "The same-name-for-siblings principle",
        items: [
          "The name chosen for the first shared child then applies to the couple's other shared children",
          "So you can't give a different name to each child of the same couple",
          "This principle holds whether the parents are married or not: it's filiation that counts",
          "It aims to preserve name unity within a single sibling group",
        ],
      },
      {
        type: "text",
        title: "The role of recognition",
        paragraphs: [
          "For unmarried couples, recognition of the child establishes the filiation link, notably on the side of the parent who doesn't benefit from a presumption. The timing and order of recognitions can influence the name assigned by default, absent a joint declaration of name choice.",
          "Marrying afterward doesn't rewrite what was fixed at birth. If the parents wish to change the child's name later, that falls under specific, regulated steps, not an automatic effect of marriage.",
        ],
      },
      {
        type: "text",
        title: "Changing the name later",
        paragraphs: [
          "There are procedures allowing, under certain conditions, to add or modify a child's name, for example to attach the name of the parent who didn't transmit it. These steps generally require the agreement of those holding parental authority, and the child's view is gathered from a certain age.",
          "These are sensitive matters, where each situation is particular. Before starting anything, a check with the town hall or a notary confirms the right path and the documents needed.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Keep in mind: the parents' marriage doesn't, on its own, change the name of an already-born child. The name comes from the choice of name and from filiation. For any change, go through the dedicated steps, not a supposed automatic consequence of marriage.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "The spouses' name follows a different logic: see our dedicated guide to [the name change after the wedding](/blog/changement-nom-apres-mariage). Name changes also carry over to the [family record book](/blog/livret-de-famille-mariage), which must be kept updated. And if you're still comparing the couple's statuses before deciding, [PACS vs marriage](/blog/pacs-ou-mariage-choisir) sheds light on what really changes for the family.",
        ],
      },
    ],
  }),
];

export const { fr: POSTS_201_208_FR, en: POSTS_201_208_EN } = pairsToArrays(pairs);
