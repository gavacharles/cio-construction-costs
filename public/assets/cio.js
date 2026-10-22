/* CiO Costs — translations (English source text lives in the page; Kiswahili and French here).
   Draft translations: have native speakers review before launch.
   Static text: elements with data-i18n="key" (data-i18n-ph for placeholders, data-cc for country names).
   Dynamic text: I18N.t("key", {vars}). Months and country names come from the browser (Intl). */
window.I18N = (function () {
  "use strict";
  const D = {
    sw: {
      "nav.prices": "Bei", "nav.plan": "Panga zabuni", "nav.reportshort": "Ripoti bei", "nav.playshort": "Cheza", "pick.country": "Nchi yako", "chip.yours": "Nchi yako", "chip.officialdata": "Takwimu rasmi", "chip.estimate": "Makadirio", "tip.official": "Imejengwa kutoka takwimu rasmi za bei za ujenzi za nchi, ikisasishwa kwa mabadiliko ya mafuta na sarafu ya wiki hii.", "tip.estimate": "Bado hakuna fahirisi rasmi ya bei za ujenzi inayotumika: haya ni makadirio ya shinikizo kwa vifaa vinavyoagizwa kutoka bei za mafuta na kiwango cha ubadilishaji. Vifaa vya ndani na kazi havijajumuishwa.", "trust.sources": "Takwimu rasmi kutoka UBOS, KNBS, Stats SA, GSS, ZimStat, ANSD na Statistics Mauritius", "trust.track": "Rekodi ya usahihi", "trust.ago": "imesasishwa saa {h} zilizopita", "trust.justnow": "imesasishwa sasa hivi", "wa.follow": "Fuata kwenye WhatsApp (bure)", "money.h": "Bei yako", "money.ph": "Bei yako ya mwisho", "money.need": "Andika bei uliyolipa mara ya mwisho kuona bei inayotarajiwa.", "money.out": "Tarajia takriban {p} kufikia {when} (kwa uwezekano mkubwa {lo} – {hi}).", "alert.email": "Barua pepe", "tab.official": "Takwimu rasmi", "tab.indicator": "Makadirio",
      "nav.countries": "Nchi", "nav.glance": "Gharama kwa muhtasari", "nav.calc": "Kikokotoo cha zabuni", "nav.report": "Ripoti bei",
      "nav.play": "The Cost Call", "nav.method": "Jinsi inavyofanya kazi", "cta.join": "Jiunge na majaribio",
      "footer.short": "CiO Lab · Utabiri ni makadirio yenye viwango, si ushauri. The Cost Call ni mchezo: alama hazina thamani ya pesa.",
      "when.label": "Utabiri hadi", "when.note": "Takwimu za kila wiki zinakadiriwa kutoka utabiri wa kila mwezi, unaosasishwa kila baada ya saa chache. Mabadiliko yanapimwa kutoka takwimu rasmi za karibuni za kila nchi (au kutoka leo kwa viashiria vya gharama za uagizaji).",
      "home.eyebrow": "Mtazamo wa gharama za ujenzi · nchi 18 za Afrika", "home.h1": "Je, gharama za ujenzi zitapanda unapofanya kazi?",
      "home.lede": "Chagua mwezi. Ona uwezekano wa bei za vifaa vya ujenzi kupanda, kwa kiasi gani, na kinachosababisha — kutoka takwimu rasmi, mafuta na viwango vya ubadilishaji, zinazosasishwa kila baada ya saa chache.",
      "tool.calc.t": "Kikokotoo cha ongezeko la bei kwenye zabuni", "tool.calc.d": "Bei zinaweza kubadilika kiasi gani katika kipindi cha mkataba wako? Pata ongezeko linalotarajiwa kwa sarafu yako, pamoja na kiwango.",
      "tool.report.t": "Ripoti bei", "tool.report.d": "Tuambie ulilipa kiasi gani kwa saruji, chuma, dizeli au mchanga wiki hii. Inachukua dakika moja na inaboresha takwimu za kila mtu.",
      "tool.play.t": "The Cost Call", "tool.play.d": "Makisio matano kila siku kuhusu bei halisi. Endeleza mfululizo wako.",
      "tab.all": "Zote", "tab.east": "Afrika Mashariki", "tab.south": "Kusini mwa Afrika", "tab.west": "Afrika Magharibi", "tab.north": "Afrika Kaskazini",
      "tab.rising": "Zinapanda", "tab.easing": "Zinashuka",
      "chip.official": "Fahirisi rasmi ya bei", "chip.indicator": "Kiashiria cha gharama za uagizaji", "chip.featured": "Iliyoangaziwa",
      "lbl.chance": "uwezekano wa kupanda", "lbl.expected": "mabadiliko yanayotarajiwa", "lbl.range": "kiwango kinachowezekana (8 kati ya 10)",
      "lbl.expected.cap": "Mabadiliko yanayotarajiwa", "lbl.range.cap": "Kiwango kinachowezekana (8 kati ya 10)",
      "btn.seecosts": "Ona gharama: {c}", "link.makecall": "Toa kisio lako", "btn.bymaterial": "Ona gharama kwa kila kifaa", "btn.play": "Cheza The Cost Call",
      "feat.bymaterial": "Kwa kila kifaa, hadi", "search.ph": "Tafuta nchi, kifaa au sarafu — mf. saruji", "empty": "Hakuna nchi inayolingana. Jaribu “saruji”, “Kenya” au “Magharibi”.",
      "glance.h": "Gharama kwa muhtasari", "glance.sort": "Bofya safu kupanga", "th.country": "Nchi", "th.latest": "Takwimu rasmi za karibuni",
      "th.offyear": "Mabadiliko rasmi, mwaka", "th.expby": "Yanayotarajiwa kufikia", "th.range": "Kiwango kinachowezekana", "th.chance": "Uwezekano wa kupanda",
      "th.fx": "Sarafu dhidi ya USD, wiki 13", "game.eyebrow": "Mpya · mchezo wa kila siku",
      "game.teaser": "Makisio matano ya haraka kila siku kuhusu bei halisi za ujenzi barani Afrika. Je, saruji ilipanda au ilishuka? Endeleza mfululizo wako, shiriki alama zako, na pima hisia zako dhidi ya modeli.",
      "game.cta": "Cheza makisio ya leo", "how1.t": "Uwezekano wa kupanda", "how1.d": "Jinsi ilivyo uwezekano kwamba bei zitakuwa juu kufikia mwezi uliouchagua. 80% inamaanisha takriban mara 8 kati ya 10.",
      "how2.t": "Mabadiliko yanayotarajiwa", "how2.d": "Mabadiliko yanayowezekana zaidi. Yatumie kwenye bei yako ya karibuni ya kifaa hicho hicho.",
      "how3.t": "Kiwango kinachowezekana", "how3.d": "Mahali mabadiliko yanapaswa kuangukia mara 8 kati ya 10. Viwango vipana vinamaanisha kutokuwa na uhakika zaidi.",
      "how4.t": "Inasasishwa kila baada ya saa chache", "how4.d": "Utabiri hubadilika kulingana na bei za mafuta, viwango vya ubadilishaji na takwimu mpya rasmi.",
      "join.d": "Wakandarasi, wakadiriaji majenzi, waendelezaji na wakopeshaji: ripoti bei unazolipa kila wiki, cheza The Cost Call upate alama kwenye ubao wa washindi, na upokee ripoti ya Jumatatu ya nchi yako. Bure. Omba msimbo wa mwaliko kutoka CiO Lab.",
      "join.cta": "Anza na mchezo wa leo", "crumbs.all": "Nchi zote", "sec.materials": "Gharama kwa kila kifaa", "th.material": "Kifaa",
      "th.prevmonth": "Mabadiliko tangu mwezi uliopita", "th.prevquarter": "Mabadiliko tangu robo iliyopita", "th.year": "Mabadiliko kwa mwaka",
      "th.why": "Kinachoisukuma", "sec.drivers": "Kinachosukuma gharama", "sec.crowd": "Bei zilizoripotiwa na wanaonunua",
      "alert.h": "Pata tahadhari ya bei", "alert.d": "Tutakutumia ujumbe mabadiliko yanayotarajiwa ya kifaa yatakapofikia kiwango chako.",
      "alert.at": "Nijulishe kwa", "alert.by": "Kupitia", "alert.contact": "Namba au barua pepe", "alert.btn": "Weka tahadhari",
      "embed.s": "Weka utabiri huu kwenye tovuti yako", "rep.h1": "Ulilipa kiasi gani wiki hii?",
      "rep.lede": "Tuambie bei uliyolipa au uliyonukuliwa kwa kifaa cha ujenzi, katika nchi yoyote kati ya 18. Ripoti hazitaji majina: tunachapisha wastani (median) kwa nchi, kifaa na wiki — kamwe majina, namba au ripoti moja moja.",
      "rep.item": "Kifaa", "rep.price": "Bei", "rep.unit": "Kipimo", "rep.town": "Mji au eneo", "rep.from": "Ulinunua kutoka",
      "rep.contact": "Simu au barua pepe yako", "rep.contact.note": "(si lazima, haichapishwi kamwe — ikiwa tu unataka tukufuatilie)",
      "rep.send": "Tuma bei", "rep.others": "Wengine wanaripoti nini", "rep.median": "Wastani wa ripoti za kila mtu, hivyo ripoti zinazojirudia au zisizo za kawaida haziwezi kubadilisha takwimu.",
      "calc.h1": "Bei za vifaa zinaweza kubadilika kiasi gani katika mkataba wako?",
      "calc.lede": "Weka mkataba wako na mchanganyiko wa vifaa. Utapata ongezeko linalotarajiwa kwa sarafu yako, pamoja na kiwango — mwanzo mzuri wa akiba na vifungu vya marekebisho ya bei.",
      "calc.value": "Thamani ya mkataba", "calc.share": "Sehemu ya vifaa katika mkataba (%)", "calc.start": "Kazi inaanza", "calc.end": "Kazi inaisha",
      "calc.type": "Aina ya kazi", "calc.building": "Jengo", "calc.road": "Barabara", "calc.water": "Maji na mifereji", "calc.custom": "Mchanganyiko maalum",
      "game.eyebrow2": "Mchezo wa kila siku", "game.lede": "Makisio matano kuhusu bei halisi za ujenzi. Je, kila moja ilipanda au ilishuka? Makisio mapya kila siku.",
      "calls.h": "Makisio ya wiki hii", "calls.d": "Kuhusu matoleo yajayo ya takwimu rasmi — yanapimwa takwimu zitakapochapishwa",
      "m.h1": "Kutoka takwimu rasmi hadi utabiri unaoweza kutumia", "m.read": "Kusoma namba", "m.limits": "Mipaka",
      "m.in": "Kinachoingia", "m.how": "Jinsi inavyotabiriwa", "m.check": "Jinsi inavyokaguliwa", "m.often": "Inasasishwa mara ngapi",
      /* dynamic */
      "q.official": "Je, bei za vifaa vya ujenzi nchini {c} zitapanda kufikia {when}?",
      "q.indicator": "Je, gharama za uagizaji zitapandisha bei za ujenzi nchini {c} kufikia {when}?",
      "adv.up": "Ongeza takriban {x} kwenye bei za kazi zinazopangwa hadi {when}, ukilinganisha na bei za {base}.",
      "adv.down": "Bei zinaweza kushuka takriban {x} kufikia {when} — fikiria kuchelewesha manunuzi makubwa.",
      "adv.flat": "Mabadiliko madogo yanatarajiwa hadi {when} — bei za {base} ni mwongozo mzuri.",
      "adv.ind": "Gharama za uagizaji zinaelekea {dir} takriban {x} kufikia {when} — hakiki bei za wasambazaji kabla ya kupanga bei.",
      "adv.indflat": "Gharama za uagizaji zinaonekana tulivu hadi {when}, lakini kiwango ni kipana — hakiki bei za wasambazaji kabla ya kupanga bei.",
      "dir.up": "kupanda", "dir.down": "kushuka", "furthest": "(utabiri wa mbali zaidi: {m})", "count": "Nchi {n} kati ya {m}",
      "notsep": "Haitabiriwi peke yake", "weekof": "wiki ya {d}", "weekof.cap": "Wiki ya {d}", "grp.weeks": "Wiki", "grp.months": "Miezi",
      "quarter": "Robo ya {q} {y}", "month.word": "mwezi", "quarter.word": "robo",
      "gm.q": "Katika {when}, je, bei za {m} nchini {c} zilipanda au zilishuka?", "gm.up": "↑ Zilipanda", "gm.down": "↓ Zilishuka",
      "gm.right": "✅ Sahihi.", "gm.wrong": "❌ Si safari hii.", "gm.official": "Takwimu rasmi: {v} ukilinganisha na {p} uliopita.",
      "gm.next": "Kisio kinachofuata →", "gm.seescore": "Ona alama zangu", "gm.score": "Umepata {n} kati ya 5", "gm.newcalls": "Makisio mapya kesho. Mfululizo: siku {s}.",
      "gm.share": "Shiriki matokeo", "gm.copied": "Imenakiliwa ✓", "gm.see": "Ona gharama: {c}", "gm.report": "Ripoti bei",
      "st.played": "Umecheza", "st.avg": "Wastani", "st.streak": "Mfululizo", "st.best": "Bora",
      "call.q": "Je, {s} itakuwa juu zaidi {when} kuliko {base}?", "call.higher": "↑ Juu zaidi", "call.lower": "↓ Chini zaidi",
      "call.sure": "Una uhakika kiasi gani?", "call.yours": "Kisio lako: {a} kwa uhakika wa {c}%.", "call.model": "Modeli: uwezekano wa {p} kuwa juu zaidi. Itapimwa takwimu rasmi zitakapochapishwa.",
      "call.next": "Toleo rasmi lijalo", "call.see": "Ona vinavyosukuma gharama: {c} →",
      "rep.none": "Bado hakuna ripoti kwa {c}. Kuwa wa kwanza.", "rep.needs": "Inahitaji watu 3 — {n} hadi sasa wiki hii",
      "rep.thanks": "Asante ✓ Bei yako imeingia kwenye wastani wa wiki hii.", "net.offline": "Kuhifadhi kunafunguka tovuti ikiwa mtandaoni. Taarifa zako hazijatumwa.",
      "net.notsent": "Haijatumwa: {e}", "net.unreach": "Hatukuweza kufikia seva. Tafadhali jaribu tena baadaye.", "alert.ok": "Tahadhari imewekwa ✓ Tutakutumia ujumbe itakapotimia.",
      "calc.escal": "ongezeko linalotarajiwa la bei za vifaa (8 kati ya 10: {lo} hadi {hi})", "calc.money": "{v} linatarajiwa · kiwango {lo} hadi {hi}",
      "calc.input": "Kifaa", "calc.shr": "Sehemu", "calc.avg": "Mabadiliko ya wastani yanayotarajiwa", "calc.print": "Chapisha au hifadhi kama PDF",
      "calc.order": "Chagua mwezi wa mwisho baada ya mwanzo.", "calc.mix": "Mchanganyiko wa vifaa (%)",
      "glance.more": "Onyesha nchi zote {n}", "glance.fewer": "Onyesha chache", "wa.share": "Shiriki kwenye WhatsApp", "wa.chat": "Ongea nasi kwenye WhatsApp",
      "alert.consent": "Ninakubali kupokea tahadhari hizi kutoka CiO Costs kupitia njia iliyochaguliwa hapo juu. Jibu STOP wakati wowote kuzisimamisha.",
      "btn.note": "Soma ripoti ya wiki", "lbl.officialdata": "Takwimu rasmi:", "lbl.offlatestmonth": "Takwimu rasmi, mwezi wa karibuni:",
      "lbl.offlatestquarter": "Takwimu rasmi, robo ya karibuni:",
    },
    fr: {
      "nav.prices": "Prix", "nav.plan": "Préparer une offre", "nav.reportshort": "Signaler un prix", "nav.playshort": "Jouer", "pick.country": "Votre pays", "chip.yours": "Votre pays", "chip.officialdata": "Données officielles", "chip.estimate": "Estimation", "tip.official": "Construit à partir des statistiques officielles des prix de la construction du pays, mis à jour avec les variations du pétrole et de la monnaie de la semaine.", "tip.estimate": "Pas encore d'indice officiel utilisable des prix de la construction : estimation de la pression sur les matériaux importés à partir du prix du pétrole et du taux de change. Matériaux locaux et main-d'œuvre non inclus.", "trust.sources": "Données officielles de l'UBOS, KNBS, Stats SA, GSS, ZimStat, ANSD et Statistics Mauritius", "trust.track": "Historique de précision", "trust.ago": "mis à jour il y a {h} h", "trust.justnow": "mis à jour à l'instant", "wa.follow": "Suivre sur WhatsApp (gratuit)", "money.h": "Votre prix", "money.ph": "Votre dernier prix", "money.need": "Saisissez le dernier prix payé pour voir le prix attendu.", "money.out": "Prévoyez environ {p} d'ici {when} (le plus probable : {lo} – {hi}).", "alert.email": "E-mail", "tab.official": "Données officielles", "tab.indicator": "Estimations",
      "nav.countries": "Pays", "nav.glance": "Coûts en un coup d'œil", "nav.calc": "Calculateur d'offre", "nav.report": "Signaler des prix",
      "nav.play": "The Cost Call", "nav.method": "Comment ça marche", "cta.join": "Rejoindre le pilote",
      "footer.short": "CiO Lab · Les prévisions sont des estimations avec des fourchettes, pas des conseils. The Cost Call est un jeu : les points n'ont aucune valeur monétaire.",
      "when.label": "Prévision jusqu'à", "when.note": "Les valeurs hebdomadaires sont interpolées à partir de la prévision mensuelle, mise à jour toutes les quelques heures. Les variations sont mesurées depuis la dernière donnée officielle de chaque pays (ou depuis aujourd'hui pour les indicateurs de coûts d'importation).",
      "home.eyebrow": "Perspectives des coûts de construction · 18 pays africains", "home.h1": "Les coûts de construction vont-ils augmenter là où vous travaillez ?",
      "home.lede": "Choisissez un mois. Voyez la probabilité que les prix des intrants de construction augmentent, de combien, et pourquoi — à partir des statistiques officielles, du pétrole et des taux de change, mis à jour toutes les quelques heures.",
      "tool.calc.t": "Calculateur d'actualisation des offres", "tool.calc.d": "De combien les prix pourraient-ils évoluer pendant votre contrat ? Obtenez l'actualisation attendue dans votre monnaie, avec une fourchette.",
      "tool.report.t": "Signaler un prix", "tool.report.d": "Dites-nous combien vous avez payé le ciment, l'acier, le gazole ou le sable cette semaine. Une minute suffit, et tout le monde y gagne.",
      "tool.play.t": "The Cost Call", "tool.play.d": "Cinq pronostics par jour sur des prix réels. Gardez votre série.",
      "tab.all": "Tous", "tab.east": "Afrique de l'Est", "tab.south": "Afrique australe", "tab.west": "Afrique de l'Ouest", "tab.north": "Afrique du Nord",
      "tab.rising": "En hausse", "tab.easing": "En baisse",
      "chip.official": "Indice officiel des prix", "chip.indicator": "Indicateur des coûts d'importation", "chip.featured": "À la une",
      "lbl.chance": "probabilité de hausse", "lbl.expected": "variation attendue", "lbl.range": "fourchette probable (8 sur 10)",
      "lbl.expected.cap": "Variation attendue", "lbl.range.cap": "Fourchette probable (8 sur 10)",
      "btn.seecosts": "Voir les coûts : {c}", "link.makecall": "Faire votre pronostic", "btn.bymaterial": "Voir les coûts par matériau", "btn.play": "Jouer à The Cost Call",
      "feat.bymaterial": "Par matériau, jusqu'à", "search.ph": "Rechercher un pays, un matériau ou une monnaie — ex. ciment", "empty": "Aucun pays ne correspond. Essayez « ciment », « Kenya » ou « Ouest ».",
      "glance.h": "Coûts en un coup d'œil", "glance.sort": "Cliquez sur une colonne pour trier", "th.country": "Pays", "th.latest": "Dernière donnée officielle",
      "th.offyear": "Variation officielle sur un an", "th.expby": "Attendu d'ici", "th.range": "Fourchette probable", "th.chance": "Probabilité de hausse",
      "th.fx": "Monnaie face à l'USD, 13 semaines", "game.eyebrow": "Nouveau · jeu quotidien",
      "game.teaser": "Cinq pronostics rapides par jour sur les prix réels de la construction en Afrique. Le ciment a-t-il augmenté ou baissé ? Gardez votre série, partagez votre score et mesurez votre flair face au modèle.",
      "game.cta": "Jouer les pronostics du jour", "how1.t": "Probabilité de hausse", "how1.d": "La probabilité que les prix soient plus élevés au mois choisi. 80 % signifie environ 8 fois sur 10.",
      "how2.t": "Variation attendue", "how2.d": "L'évolution la plus probable. Appliquez-la à votre dernier devis pour le même article.",
      "how3.t": "Fourchette probable", "how3.d": "Là où la variation devrait se situer 8 fois sur 10. Une fourchette plus large signifie plus d'incertitude.",
      "how4.t": "Mis à jour toutes les quelques heures", "how4.d": "Les prévisions évoluent avec les prix du pétrole, les taux de change et les nouvelles données officielles.",
      "join.d": "Entrepreneurs, métreurs, promoteurs et prêteurs : signalez les prix que vous payez chaque semaine, jouez à The Cost Call pour des points au classement et recevez la note du lundi pour votre pays. Gratuit. Demandez un code d'invitation à CiO Lab.",
      "join.cta": "Commencer par le jeu du jour", "crumbs.all": "Tous les pays", "sec.materials": "Coûts par matériau", "th.material": "Matériau",
      "th.prevmonth": "Variation sur le mois précédent", "th.prevquarter": "Variation sur le trimestre précédent", "th.year": "Variation sur un an",
      "th.why": "Ce qui le fait bouger", "sec.drivers": "Ce qui fait bouger les coûts", "sec.crowd": "Prix signalés par ceux qui achètent",
      "alert.h": "Recevoir une alerte de prix", "alert.d": "Nous vous préviendrons quand la variation attendue d'un matériau atteindra votre seuil.",
      "alert.at": "M'alerter à", "alert.by": "Par", "alert.contact": "Numéro ou e-mail", "alert.btn": "Créer l'alerte",
      "embed.s": "Afficher cette prévision sur votre site", "rep.h1": "Combien avez-vous payé cette semaine ?",
      "rep.lede": "Indiquez-nous le prix payé ou proposé pour un intrant de construction, dans l'un de nos 18 pays. Les signalements sont anonymes : nous publions des médianes par pays, article et semaine — jamais de noms, de numéros ni de signalements individuels.",
      "rep.item": "Article", "rep.price": "Prix", "rep.unit": "Unité", "rep.town": "Ville ou quartier", "rep.from": "Acheté auprès de",
      "rep.contact": "Votre téléphone ou e-mail", "rep.contact.note": "(facultatif, jamais publié — seulement si vous souhaitez être recontacté)",
      "rep.send": "Envoyer le prix", "rep.others": "Ce que signalent les autres", "rep.median": "Médianes des signalements de chaque personne : les doublons ou valeurs aberrantes ne peuvent pas fausser les chiffres.",
      "calc.h1": "De combien les prix des intrants pourraient-ils évoluer pendant votre contrat ?",
      "calc.lede": "Indiquez votre contrat et la répartition des intrants. Vous obtenez l'actualisation attendue dans votre monnaie, avec une fourchette — un point de départ pour les provisions et les clauses de révision des prix.",
      "calc.value": "Montant du contrat", "calc.share": "Part des intrants dans le contrat (%)", "calc.start": "Début des travaux", "calc.end": "Fin des travaux",
      "calc.type": "Type de travaux", "calc.building": "Bâtiment", "calc.road": "Route", "calc.water": "Eau et assainissement", "calc.custom": "Répartition personnalisée",
      "game.eyebrow2": "Jeu quotidien", "game.lede": "Cinq pronostics sur des prix réels de la construction. Chacun a-t-il augmenté ou baissé ? De nouveaux pronostics chaque jour.",
      "calls.h": "Les pronostics de la semaine", "calls.d": "Sur les prochaines publications officielles — notés à la publication des données",
      "m.h1": "Des statistiques officielles à une prévision utile", "m.read": "Lire les chiffres", "m.limits": "Limites",
      "m.in": "Les données", "m.how": "La prévision", "m.check": "Les contrôles", "m.often": "La fréquence de mise à jour",
      /* dynamic */
      "q.official": "{c} : les prix des intrants de construction vont-ils augmenter d'ici {when} ?",
      "q.indicator": "{c} : les coûts d'importation vont-ils faire monter les prix de la construction d'ici {when} ?",
      "adv.up": "Prévoyez environ {x} sur les devis des travaux chiffrés jusqu'à {when}, par rapport aux prix de {base}.",
      "adv.down": "Les prix pourraient baisser d'environ {x} d'ici {when} — envisagez de reporter les gros achats.",
      "adv.flat": "Peu de changement attendu jusqu'à {when} — les prix de {base} restent un bon repère.",
      "adv.ind": "Les coûts d'importation tendent à la {dir} d'environ {x} d'ici {when} — vérifiez les devis des fournisseurs avant de fixer vos prix.",
      "adv.indflat": "Les coûts d'importation semblent stables jusqu'à {when}, mais la fourchette est large — vérifiez les devis des fournisseurs avant de fixer vos prix.",
      "dir.up": "hausse", "dir.down": "baisse", "furthest": "(prévision la plus lointaine : {m})", "count": "{n} pays sur {m}",
      "notsep": "Pas de prévision séparée", "weekof": "la semaine du {d}", "weekof.cap": "Semaine du {d}", "grp.weeks": "Semaines", "grp.months": "Mois",
      "quarter": "T{q} {y}", "month.word": "mois", "quarter.word": "trimestre",
      "gm.q": "En {when}, le prix {m} a-t-il augmenté ou baissé — {c} ?", "gm.up": "↑ Hausse", "gm.down": "↓ Baisse",
      "gm.right": "✅ Bien joué.", "gm.wrong": "❌ Pas cette fois.", "gm.official": "Chiffre officiel : {v} par rapport au {p} précédent.",
      "gm.next": "Pronostic suivant →", "gm.seescore": "Voir mon score", "gm.score": "{n} sur 5", "gm.newcalls": "Nouveaux pronostics demain. Série : {s} jour(s).",
      "gm.share": "Partager le résultat", "gm.copied": "Copié ✓", "gm.see": "Voir les coûts : {c}", "gm.report": "Signaler un prix",
      "st.played": "Parties", "st.avg": "Score moyen", "st.streak": "Série", "st.best": "Record",
      "call.q": "{s} sera-t-il plus élevé en {when} qu'en {base} ?", "call.higher": "↑ Plus élevé", "call.lower": "↓ Plus bas",
      "call.sure": "Quelle est votre certitude ?", "call.yours": "Votre pronostic : {a} à {c} % de certitude.", "call.model": "Modèle : {p} de chances d'être plus élevé. Noté à la publication du chiffre officiel.",
      "call.next": "Prochaine publication officielle", "call.see": "Voir ce qui fait bouger les coûts : {c} →",
      "rep.none": "Aucun signalement pour {c} pour l'instant. Soyez le premier.", "rep.needs": "Il faut 3 personnes — {n} cette semaine",
      "rep.thanks": "Merci ✓ Votre prix compte dans les médianes de la semaine.", "net.offline": "L'envoi est possible une fois le site en ligne. Vos informations n'ont pas été envoyées.",
      "net.notsent": "Non envoyé : {e}", "net.unreach": "Serveur injoignable. Réessayez dans un instant.", "alert.ok": "Alerte créée ✓ Nous vous préviendrons dès qu'elle se déclenche.",
      "calc.escal": "actualisation attendue des intrants (8 sur 10 : {lo} à {hi})", "calc.money": "{v} attendus · fourchette {lo} à {hi}",
      "calc.input": "Intrant", "calc.shr": "Part", "calc.avg": "Variation moyenne attendue", "calc.print": "Imprimer ou enregistrer en PDF",
      "calc.order": "Choisissez une fin postérieure au début.", "calc.mix": "Répartition des intrants (%)",
      "glance.more": "Afficher les {n} pays", "glance.fewer": "Afficher moins", "wa.share": "Partager sur WhatsApp", "wa.chat": "Discuter avec nous sur WhatsApp",
      "alert.consent": "J'accepte de recevoir ces alertes de CiO Costs par le canal choisi ci-dessus. Répondez STOP à tout moment pour les arrêter.",
      "btn.note": "Lire la note hebdomadaire", "lbl.officialdata": "Données officielles :", "lbl.offlatestmonth": "Chiffres officiels, dernier mois :",
      "lbl.offlatestquarter": "Chiffres officiels, dernier trimestre :",
    },
    en: {
      "nav.prices": "Prices", "nav.plan": "Plan a bid", "nav.reportshort": "Report a price", "nav.playshort": "Play", "pick.country": "Your country", "chip.yours": "Your country", "chip.officialdata": "Official data", "chip.estimate": "Estimate", "tip.official": "Built from the country's official construction price statistics, updated with this week's oil and currency moves.", "tip.estimate": "No usable official construction price index yet: an estimate of the pressure on imported materials from oil prices and the exchange rate. Local materials and labour are not included.", "trust.sources": "Official data from UBOS, KNBS, Stats SA, GSS, ZimStat, ANSD and Statistics Mauritius", "trust.track": "Track record", "trust.ago": "updated {h} h ago", "trust.justnow": "updated just now", "wa.follow": "Follow on WhatsApp (free)", "money.h": "Your price", "money.ph": "Your latest price", "money.need": "Type what you paid last to see the expected price.", "money.out": "Expect about {p} by {when} (most likely {lo} – {hi}).", "alert.email": "Email", "tab.official": "Official data", "tab.indicator": "Estimates",
      "q.official": "Will {c}'s construction input prices rise by {when}?", "q.indicator": "Will import costs push {c}'s building prices up by {when}?",
      "adv.up": "Allow about {x} on quotes for work priced to {when}, compared with {base} prices.",
      "adv.down": "Prices may ease about {x} by {when} — consider delaying bulk buying.",
      "adv.flat": "Little change expected to {when} — {base} prices are a fair guide.",
      "adv.ind": "Import costs point {dir} about {x} by {when} — check supplier quotes before fixing prices.",
      "adv.indflat": "Import costs look roughly flat to {when}, but the range is wide — check supplier quotes before fixing prices.",
      "dir.up": "up", "dir.down": "down", "furthest": "(furthest forecast: {m})", "count": "{n} of {m} countries", "notsep": "Not forecast separately",
      "weekof": "the week of {d}", "weekof.cap": "Week of {d}", "grp.weeks": "Weeks", "grp.months": "Months", "quarter": "Q{q} {y}",
      "month.word": "month", "quarter.word": "quarter",
      "gm.q": "In {when}, did {m} prices in {c} go up or down?", "gm.up": "↑ Up", "gm.down": "↓ Down", "gm.right": "✅ Right.", "gm.wrong": "❌ Not this time.",
      "gm.official": "Official figure: {v} on the previous {p}.", "gm.next": "Next call →", "gm.seescore": "See my score", "gm.score": "You called {n} of 5",
      "gm.newcalls": "New calls tomorrow. Streak: {s} day(s).", "gm.share": "Share result", "gm.copied": "Copied ✓", "gm.see": "See {c}'s costs", "gm.report": "Report a price",
      "st.played": "Played", "st.avg": "Avg score", "st.streak": "Streak", "st.best": "Best",
      "call.q": "Will {s} be higher in {when} than in {base}?", "call.higher": "↑ Higher", "call.lower": "↓ Lower", "call.sure": "How sure are you?",
      "call.yours": "Your call: {a} at {c}% confidence.", "call.model": "Model: {p} chance it is higher. Scored when the official figure is published.",
      "call.next": "Next official release", "call.see": "See the inputs driving {c}'s costs →",
      "rep.none": "No reports yet for {c}. Be the first.", "rep.needs": "Needs 3 people — {n} so far this week",
      "rep.thanks": "Thank you ✓ Your price is in this week's medians.", "net.offline": "Saving opens when the site is online. Your details have not been sent.",
      "net.notsent": "Not sent: {e}", "net.unreach": "Could not reach the server. Please try again shortly.", "alert.ok": "Alert set ✓ We'll message you when it triggers.",
      "calc.escal": "expected escalation on inputs (8 in 10: {lo} to {hi})", "calc.money": "{v} expected · range {lo} to {hi}",
      "calc.input": "Input", "calc.shr": "Share", "calc.avg": "Average expected move", "calc.print": "Print or save as PDF",
      "calc.order": "Choose an end month after the start.", "calc.mix": "Mix of inputs (%)",
      "glance.more": "Show all {n} countries", "glance.fewer": "Show fewer",
    },
  };
  let lang = "en";
  try { lang = localStorage.getItem("cio-lang") || ""; } catch (e) { /* storage unavailable */ }
  if (!D[lang]) { lang = "en";
    for (const l of (navigator.languages || [navigator.language || "en"])) { const k = (l || "").slice(0, 2); if (D[k]) { lang = k; break; } } }
  const loc = { en: "en-GB", sw: "sw", fr: "fr" }[lang];
  function t(key, v = {}) { const s = (D[lang] && D[lang][key]) || D.en[key] || key;
    return s.replace(/\{(\w+)\}/g, (_, k) => (v[k] !== undefined ? v[k] : "")); }
  function month(m) { const d = new Date(Date.UTC(+m.slice(0, 4), +m.slice(5, 7) - 1, 15));
    try { return new Intl.DateTimeFormat(loc, { month: "short", year: "numeric", timeZone: "UTC" }).format(d); }
    catch (e) { return m; } }
  function dayMonth(iso) { const d = new Date(iso + "T12:00:00Z");
    try { return new Intl.DateTimeFormat(loc, { day: "numeric", month: "short", timeZone: "UTC" }).format(d); } catch (e) { return iso; } }
  let names = null; try { names = new Intl.DisplayNames([loc], { type: "region" }); } catch (e) { /* older browser */ }
  function country(cc, fallback) { if (lang === "en" || !cc || !names) return fallback; try { return names.of(cc) || fallback; } catch (e) { return fallback; } }
  /* English base labels from the data ("Apr 2026", "Q2 2026") */
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function base(b) { if (!b) return b; const q = b.match(/^Q(\d) (\d{4})$/); if (q) return t("quarter", { q: q[1], y: q[2] });
    const m = b.match(/^(\w{3}) (\d{4})$/); if (m && MON.indexOf(m[1]) >= 0) return month(`${m[2]}-${String(MON.indexOf(m[1]) + 1).padStart(2, "0")}`); return b; }
  function apply(root) {
    document.documentElement.lang = lang;
    if (lang === "en") return;
    (root || document).querySelectorAll("[data-i18n]").forEach(el => { const k = el.dataset.i18n; if (!D[lang][k]) return;
      const card = el.closest("[data-key]"), cc = card && card.querySelector("[data-cc]");
      el.textContent = t(k, { c: el.dataset.c ? country(cc && cc.dataset.cc, el.dataset.c) : "" }); });
    (root || document).querySelectorAll("[data-i18n-ph]").forEach(el => { const k = el.dataset.i18nPh; if (D[lang][k]) el.placeholder = t(k); });
    (root || document).querySelectorAll("[data-cc]").forEach(el => { el.textContent = country(el.dataset.cc, el.textContent); });
    (root || document).querySelectorAll("[data-matname]").forEach(el => { el.textContent = mat(el.dataset.matname); });
  }
  /* materials and series names (Kiswahili, French) */
  const MAT = {
    sw: { "Cement": "Saruji", "Diesel": "Dizeli", "Rebar": "Nondo", "Reinforcement steel": "Nondo (chuma cha kuimarisha)", "Reinforcing steel": "Nondo",
      "Sand": "Mchanga", "Labour": "Nguvu kazi", "Roofing sheets": "Mabati", "Aggregate": "Kokoto", "Aggregate stone": "Kokoto",
      "Concrete blocks": "Matofali ya saruji", "Timber": "Mbao", "Paint": "Rangi", "Plastic pipes": "Mabomba ya plastiki", "Tiles": "Vigae",
      "Bricks": "Matofali", "Asphalt": "Lami", "Ready-mix concrete": "Zege tayari", "Steel and reinforcement": "Chuma na nondo",
      "Fuel and lubricants": "Mafuta na vilainishi", "Ballast and crushed stone": "Kokoto na mawe yaliyosagwa", "Hardcore": "Mawe ya msingi",
      "Overall construction inputs": "Vifaa vyote vya ujenzi", "Overall construction input prices": "Bei za jumla za vifaa vya ujenzi",
      "Building cost index": "Fahirisi ya gharama za majengo", "Civil engineering cost index": "Fahirisi ya gharama za uhandisi wa kiraia",
      "Construction input prices (whole industry)": "Bei za vifaa vya ujenzi (sekta nzima)", "Construction stone and sand": "Mawe na mchanga wa ujenzi",
      "Civil engineering materials": "Vifaa vya uhandisi wa kiraia", "Imported-input cost pressure": "Shinikizo la gharama za vifaa vinavyoagizwa" },
    fr: { "Cement": "Ciment", "Diesel": "Gazole", "Rebar": "Fer à béton", "Reinforcement steel": "Acier d'armature", "Reinforcing steel": "Acier d'armature",
      "Sand": "Sable", "Labour": "Main-d'œuvre", "Roofing sheets": "Tôles de toiture", "Aggregate": "Granulats", "Aggregate stone": "Granulats",
      "Concrete blocks": "Parpaings", "Timber": "Bois", "Paint": "Peinture", "Plastic pipes": "Tuyaux en plastique", "Tiles": "Carreaux",
      "Bricks": "Briques", "Asphalt": "Enrobé", "Ready-mix concrete": "Béton prêt à l'emploi", "Steel and reinforcement": "Acier et armatures",
      "Fuel and lubricants": "Carburants et lubrifiants", "Ballast and crushed stone": "Ballast et pierre concassée", "Hardcore": "Hérisson (remblai)",
      "Overall construction inputs": "Ensemble des intrants", "Overall construction input prices": "Prix des intrants de construction",
      "Building cost index": "Indice du coût du bâtiment", "Civil engineering cost index": "Indice du coût du génie civil",
      "Construction input prices (whole industry)": "Prix des intrants (ensemble du secteur)", "Construction stone and sand": "Pierre et sable de construction",
      "Civil engineering materials": "Matériaux de génie civil", "Imported-input cost pressure": "Pression des coûts d'importation" },
  };
  const mat = n => (MAT[lang] && MAT[lang][n]) || n;
  return { lang, loc, t, mat, month, dayMonth, country, base, apply, set(v) { try { localStorage.setItem("cio-lang", v); } catch (e) { /* ignore */ } location.reload(); } };
})();

/* CiO Costs — public site behaviour: theme, forecast-to picker (weeks then months), filters, search, sorting,
   country pages, report form, bid calculator, alerts, embed widget, The Cost Call. */
(function () {
  "use strict";
  const DATA = JSON.parse(document.getElementById("cio-data").textContent);
  const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
  };
  const T = window.I18N, tr = T.t;
  const label = m => T.month(m);
  const cname = c => T.country(c.cc, c.country);
  T.apply();
  const langSel = $("#lang"); if (langSel) { langSel.value = T.lang; langSel.onchange = () => T.set(langSel.value); }
  $$("#when option").forEach(o => { const v = o.value; o.textContent = v[0] === "W" ? tr("weekof.cap", { d: T.dayMonth(v.slice(2)) }) : label(v.slice(2)); });
  $$("#when optgroup").forEach(g => g.label = tr(g.label === "Weeks" ? "grp.weeks" : "grp.months"));
  const pct = (v, d = 1) => { const r = +(+v).toFixed(d); return (r > 0 ? "+" : "") + (r === 0 ? (0).toFixed(d) : r.toFixed(d)) + "%"; };
  const qlabel = (m, step) => step === "quarter" ? tr("quarter", { q: Math.floor((+m.slice(5, 7) - 1) / 3) + 1, y: m.slice(0, 4) }) : label(m);
  const online = location.protocol !== "file:";
  const rel = document.body.dataset.rel || "";

  /* ---------- theme ---------- */
  const root = document.documentElement, tb = $("#theme"), order = ["auto", "light", "dark"], icon = { auto: "◐", light: "☀", dark: "☾" };
  let theme = store.get("cio-theme", "auto");
  function setTheme(v) { theme = v; v === "auto" ? root.removeAttribute("data-theme") : root.setAttribute("data-theme", v);
    if (tb) { tb.textContent = icon[v]; tb.setAttribute("aria-label", "Theme: " + v); } store.set("cio-theme", v); }
  setTheme(theme); if (tb) tb.onclick = () => setTheme(order[(order.indexOf(theme) + 1) % 3]);

  /* ---------- forecast maths: targets are "W:YYYY-MM-DD" (week) or "M:YYYY-MM" (month) ---------- */
  function erf(x) { const s = Math.sign(x); x = Math.abs(x); const t = 1 / (1 + 0.3275911 * x);
    return s * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)); }
  const mid = m => Date.UTC(+m.slice(0, 4), +m.slice(5, 7) - 1, 15);
  function tTime(tg) { return tg[0] === "W" ? Date.parse(tg.slice(2) + "T00:00:00Z") + 3 * 864e5 : mid(tg.slice(2)); }
  function tLabel(tg) { return tg[0] === "W" ? tr("weekof", { d: T.dayMonth(tg.slice(2)) }) : label(tg.slice(2)); }
  const tMonth = tg => tg.slice(2, 9);
  /* linear interpolation along the forecast path; 0 change at the base month (one month before the first point) */
  function at(path, tg) {
    if (!path || !path.length) return null; const T = tTime(tg);
    const pts = path.map(q => ({ t: mid(q.month), q }));
    const b = pts[0].t - 30.4 * 864e5; pts.unshift({ t: b, q: { month: "", median: 0, lo: 0, hi: 0 } });
    if (T >= pts[pts.length - 1].t) return { q: pts[pts.length - 1].q, beyond: T > pts[pts.length - 1].t + 20 * 864e5 };
    if (T <= pts[1].t && T <= b) return { q: pts[1].q };
    for (let i = 1; i < pts.length; i++) if (T <= pts[i].t) { const a = pts[i - 1], z = pts[i], w = (T - a.t) / (z.t - a.t);
      const mix = k => a.q[k] + w * (z.q[k] - a.q[k]); return { q: { month: z.q.month, median: mix("median"), lo: mix("lo"), hi: mix("hi") } }; }
    return { q: pts[pts.length - 1].q };
  }
  function chance(q) { const sd = (q.hi - q.lo) / (2 * 1.2816); if (!(sd > 1e-6)) return q.median > 0 ? 0.99 : 0.01;
    return Math.min(0.99, Math.max(0.01, 0.5 * (1 + erf(q.median / (sd * Math.SQRT2))))); }
  function question(c, tg) { return tr(c.official ? "q.official" : "q.indicator", { c: cname(c), when: tLabel(tg) }); }
  function advice(c, q, tg) { const v = { when: tLabel(tg), base: T.base(c.base), x: Math.abs(q.median).toFixed(1) + "%" };
    if (!c.official) return Math.abs(q.median) < 0.25 ? tr("adv.indflat", v) : tr("adv.ind", Object.assign(v, { dir: tr(q.median > 0 ? "dir.up" : "dir.down") }));
    if (q.median >= 0.25) return tr("adv.up", Object.assign(v, { x: pct(q.median) }));
    if (q.median <= -0.25) return tr("adv.down", v);
    return tr("adv.flat", v); }
  function spark(c) { const v = (c.spark || {}).values || []; if (v.length < 2) return "";
    const lo = Math.min(...v), hi = Math.max(...v), sp = hi - lo || 1;
    const pts = v.map((x, i) => `${(i * 116 / (v.length - 1) + 2).toFixed(1)},${(35 - (x - lo) * 30 / sp).toFixed(1)}`).join(" ");
    return `<svg class=spark viewBox="0 0 120 38" preserveAspectRatio=none aria-hidden=true><polygon points="2,38 ${pts} 118,38"/><polyline points="${pts}"/></svg>`; }

  /* ---------- "your price": a price today -> the expected price at the target date ---------- */
  const nowTg = () => { const d = new Date(); return `M:${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; };
  const money0 = n => Math.round(n).toLocaleString(T.loc || undefined);
  function money(el, c, tg) {
    const box = $(".money", el); if (!box) return;
    const sel = $("[data-money-mat]", box), inp = $("[data-money-price]", box), out = $("[data-money-out]", box);
    if (sel.dataset.key !== c.key) {                       /* (re)build the material list when the country changes */
      sel.dataset.key = c.key; sel.innerHTML = Object.keys(c.paths).map(n => `<option value="${n}">${T.mat(n)}</option>`).join("");
      $("[data-money-ccy]", box).textContent = c.currency;
      inp.placeholder = tr("money.ph");
      const load = () => { const v = store.get(`cio-price-${c.key}-${sel.value}`, null) ?? (c.crowd || {})[sel.value]; inp.value = v == null ? "" : v; };
      sel.onchange = () => { load(); money(el, c, target); };
      inp.oninput = () => { store.set(`cio-price-${c.key}-${sel.value}`, inp.value === "" ? null : +inp.value); money(el, c, target); };
      load(); }
    const a = at(c.paths[sel.value], nowTg()), b = at(c.paths[sel.value], tg), v = +inp.value;
    if (!a || !b || !(v > 0)) { out.textContent = tr("money.need"); return; }
    const f = x => v * (1 + x / 100) / (1 + a.q.median / 100);
    out.innerHTML = tr("money.out", { p: `<strong>${money0(f(b.q.median))} ${c.currency}</strong>`, when: tLabel(tg),
      lo: money0(f(b.q.lo)), hi: money0(f(b.q.hi)) });
  }

  /* ---------- fill a block (card / featured / country page) for target tg ---------- */
  function fill(el, c, tg) {
    const r = at(c.paths[c.head], tg); if (!r) return; const q = r.q, p = chance(q);
    const set = (sel, h) => { const x = $(sel, el); if (x) x.innerHTML = h; };
    set("[data-q]", question(c, tg) + (r.beyond ? ` <small class=muted>${tr("furthest", { m: label(q.month) })}</small>` : ""));
    set("[data-pct]", Math.round(p * 100) + "%"); set("[data-exp]", pct(q.median)); set("[data-rng]", `${pct(q.lo)} – ${pct(q.hi)}`);
    set("[data-advice]", advice(c, q, tg));
    const bar = $("[data-bar]", el); if (bar) bar.style.width = Math.round(p * 100) + "%";
    const sl = $("[data-spark]", el); if (sl && !sl.innerHTML) sl.innerHTML = spark(c);
    const br = $("[data-breakdown]", el);
    if (br) br.innerHTML = Object.entries(c.paths).map(([n, pth]) => { const x = at(pth, tg); return x ? `<li><span>${T.mat(n)}</span><b>${pct(x.q.median)}</b></li>` : ""; }).join("");
    money(el, c, tg);
    el.dataset.trend = q.median > 0.05 ? "rising" : (q.median < -0.05 ? "easing" : "flat");
    const fan = $(".fan", el); if (fan) { const xs = JSON.parse(fan.dataset.xs || "{}"), mk = $(".marker", fan), m = tMonth(tg);
      const x = xs[m] || xs[Object.keys(xs).filter(k => k <= m).pop()]; if (mk && x) { mk.setAttribute("x1", x); mk.setAttribute("x2", x); } }
    $$("tr[data-mat]").forEach(row => { const pth = c.paths[row.dataset.mat] || (row.dataset.mat === "Reinforcement steel" ? c.paths["Rebar"] : null);
      const cell = $("[data-mexp]", row); if (cell) { const x = at(pth, tg); cell.textContent = x ? `${pct(x.q.median)}  (${pct(x.q.lo)} – ${pct(x.q.hi)})` : tr("notsep"); } });
  }

  /* ---------- country-first home ---------- */
  const my = $("#mycountry"), feat = $(".featured:not(.solo)");
  Object.entries(DATA.countries || {}).forEach(([k, c]) => { c.key = k; });
  if (my && feat) {
    $$("option", my).forEach(o => { const c = DATA.countries[o.value]; if (c) o.textContent = `${c.flag} ${cname(c)}`; });
    const show = k => { const c = DATA.countries[k]; if (!c) return; feat.dataset.key = k;
      $(".flag", feat).textContent = c.flag; const nm = $("[data-feat-name]", feat); nm.textContent = cname(c); nm.dataset.cc = c.cc;
      $$("[data-feat-name], [data-feat-link]", feat).forEach(a => a.href = `countries/${k}/index.html`);
      $("[data-chart]", feat).innerHTML = ""; };
    const k0 = store.get("cio-country", null); my.value = DATA.countries[k0] ? k0 : feat.dataset.key; show(my.value);
    my.onchange = () => { store.set("cio-country", my.value); show(my.value); render(); };
  }
  const ago = $("#updated-ago");
  if (ago) { const h = Math.max(0, Math.round((Date.now() - Date.parse(ago.dataset.built)) / 36e5));
    ago.textContent = isNaN(h) ? "" : (h < 1 ? tr("trust.justnow") : tr("trust.ago", { h })); }

  /* ---------- forecast-to picker ---------- */
  let target = store.get("cio-target", DATA.default); if (!DATA.months || DATA.months.indexOf(target) < 0) target = DATA.default;
  function render() {
    $$("[data-when-label]").forEach(x => x.textContent = target ? tLabel(target) : "");
    $$(".card[data-key], .featured[data-key]").forEach(el => { const c = DATA.countries[el.dataset.key]; if (c) fill(el, c, target); });
    $$("#glance-table tbody tr").forEach(row => { const c = DATA.countries[row.dataset.key]; if (!c) return;
      const q = at(c.paths[c.head], target).q, p = chance(q), d = c.drivers || {}, cell = k => $(`[data-g=${k}]`, row);
      cell("exp").textContent = pct(q.median); cell("exp").dataset.v = q.median; cell("rng").textContent = `${pct(q.lo)} – ${pct(q.hi)}`;
      cell("pct").textContent = Math.round(p * 100) + "%"; cell("pct").dataset.v = p;
      const fx = d.fx_13w_pct; cell("fx").innerHTML = fx == null ? "–" : `<span class=${fx > 0 ? "up" : "down"}>${fx > 0 ? "weaker" : "stronger"} ${Math.abs(fx).toFixed(1)}%</span>`;
      cell("fx").dataset.v = fx == null ? 0 : fx;
      const of = cell("official"); if (of && !of.dataset.done) { const h = (c.spark || {}).values || [], yr = c.step === "quarter" ? 4 : 12;
        if (c.official && h.length > yr) { const v = (h[h.length - 1] / h[h.length - 1 - yr] - 1) * 100; of.textContent = pct(v); of.dataset.v = v; }
        else { of.textContent = "–"; of.dataset.v = -999; } of.dataset.done = 1; } });
    applyFilters();
  }
  $$("#when").forEach(w => { w.value = target; w.onchange = () => { target = w.value; store.set("cio-target", target); $$("#when").forEach(s => s.value = target); render(); }; });

  /* ---------- filters + search ---------- */
  const tabs = $$(".tabs button"), qbox = $("#q"), count = $("#count"), empty = $("#empty"); let tab = "all";
  function applyFilters() {
    const cards = $$("#grid .card"); if (!cards.length) return; const s = (qbox && qbox.value || "").trim().toLowerCase(); let n = 0;
    cards.forEach(c => { const d = c.dataset;
      const okTab = tab === "all" || (tab === "official" || tab === "indicator" ? d.type === tab : (tab === "rising" || tab === "easing") ? d.trend === tab : d.region === tab);
      const ok = okTab && (!s || d.search.indexOf(s) >= 0); c.hidden = !ok; if (ok) n++; });
    if (count) count.textContent = tr("count", { n, m: cards.length }); if (empty) empty.style.display = n ? "none" : "block";
  }
  tabs.forEach(b => b.onclick = () => { tab = b.dataset.tab; tabs.forEach(x => x.setAttribute("aria-pressed", String(x === b))); applyFilters(); });
  if (qbox) qbox.addEventListener("input", applyFilters);
  $$("#glance-table thead th[data-sort]").forEach((th, i) => { let asc = false; th.onclick = () => { asc = !asc;
    const tbody = $("#glance-table tbody"), rows = $$("tr", tbody), num = th.dataset.sort === "num";
    rows.sort((a, b) => { const A = a.children[i], B = b.children[i];
      const va = num ? parseFloat(A.dataset.v ?? A.textContent) : A.textContent.trim(), vb = num ? parseFloat(B.dataset.v ?? B.textContent) : B.textContent.trim();
      return (va > vb ? 1 : va < vb ? -1 : 0) * (asc ? 1 : -1); }).forEach(r => tbody.appendChild(r)); }; });
  render();
  const more = $("#glance-more");
  if (more) more.onclick = () => { const hid = $$("#glance-table tr.more").some(r => r.hidden);
    $$("#glance-table tr.more").forEach(r => r.hidden = !hid); more.textContent = hid ? tr("glance.fewer") : tr("glance.more", { n: $$("#glance-table tbody tr").length }); };

  /* ---------- share on WhatsApp ---------- */
  $$("[data-wa-share]").forEach(b => b.onclick = () => { const c = DATA.countries[b.dataset.waShare]; if (!c) return;
    const q = at(c.paths[c.head], target).q, url = new URL((b.closest("main") ? "" : "") + (location.protocol === "file:" ? "" : `${location.origin}/countries/${b.dataset.waShare}/`), location.href);
    const text = `${question(c, target)} ${Math.round(chance(q) * 100)}% · ${pct(q.median)} (${pct(q.lo)} – ${pct(q.hi)}) — CiO Costs ${online ? url.href : ""}`;
    window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank", "noopener"); });

  /* ---------- posting to the server (public API) ---------- */
  async function post(url, body, msg) {
    if (!online) { msg.textContent = tr("net.offline"); return false; }
    try { const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json(); if (!j.ok) { msg.textContent = tr("net.notsent", { e: j.error || "" }); return false; } return true; }
    catch (e) { msg.textContent = tr("net.unreach"); return false; }
  }

  /* ---------- alerts (country pages) ---------- */
  $$(".alertbox").forEach(box => { const f = $("form", box), msg = $(".formmsg", box);
    f.onsubmit = async ev => { ev.preventDefault(); const d = Object.fromEntries(new FormData(f));
      d.country = box.dataset.country; d.threshold = +d.threshold; d.consent = !!d.consent;
      if (await post(rel + "api/public/alert", d, msg)) { msg.textContent = tr("alert.ok"); f.reset(); } }; });

  /* ---------- report prices ---------- */
  const rf = $("#reportform");
  if (rf && DATA.report) {
    const fld = n => rf.querySelector(`[name=${n}]`);       // (form.elements.item is a built-in method, not the field)
    const cs = fld("country"), it = fld("item"), unit = fld("unit"), msg = $(".formmsg", rf), cv = $("#crowdview");
    const want = (location.hash || "").slice(1); if (DATA.report[want]) cs.value = want;
    function refresh() { const R = DATA.report[cs.value];
      it.innerHTML = R.items.map(i => `<option value="${i.code}">${i.name}</option>`).join(""); $$("[data-ccy]").forEach(x => x.textContent = R.currency);
      unit.value = "per " + (R.items[0] || {}).unit; it.onchange = () => { const i = R.items.find(x => x.code === it.value); unit.value = "per " + (i ? i.unit : ""); };
      cv.innerHTML = R.crowd.length ? `<table class=glance><thead><tr><th>Item</th><th>Median</th><th>Reporters</th></tr></thead><tbody>${R.crowd.map(r =>
        `<tr><td>${r.name}</td><td>${r.published ? Math.round(r.median).toLocaleString() + " " + R.currency + " / " + r.unit
          : `<span class=muted>${tr("rep.needs", { n: r.pending })}</span>`}</td><td>${r.published ? r.reporters : "–"}</td></tr>`).join("")}</tbody></table>`
        : `<p>${tr("rep.none", { c: R.flag + " " + T.country(R.cc, R.country) })}</p>`; }
    cs.onchange = refresh; refresh();
    rf.onsubmit = async ev => { ev.preventDefault(); const d = Object.fromEntries(new FormData(rf)); d.price = +d.price;
      if (await post(rel + "api/public/price", d, msg)) { msg.textContent = tr("rep.thanks"); fld("price").value = ""; } };
  }

  /* ---------- bid escalation calculator ---------- */
  const cf = $("#calcform");
  if (cf) {
    const out = $("#calcout"), months = DATA.months.filter(v => v[0] === "M").map(v => v.slice(2));
    const now = new Date().toISOString().slice(0, 7), all = [now, ...months];
    const PRESET = { building: { Cement: 30, Rebar: 25, "Reinforcement steel": 25, Sand: 10, Labour: 20, Diesel: 10,
                                 "Building cost index": 100, "Ready-mix concrete": 20, "Reinforcing steel": 25, "Construction stone and sand": 10 },
                     road: { Diesel: 35, Sand: 10, Cement: 15, Labour: 20, Rebar: 10, "Reinforcement steel": 10,
                             "Civil engineering cost index": 100, "Civil engineering materials": 70, "Construction stone and sand": 30 },
                     water: { Cement: 25, Rebar: 15, "Reinforcement steel": 15, Labour: 30, Diesel: 15, Sand: 10,
                              "Civil engineering cost index": 100, "Civil engineering materials": 60, "Ready-mix concrete": 20, Cement2: 0 } };
    cf.elements.country.innerHTML = Object.entries(DATA.countries).map(([k, c]) => `<option value=${k}>${c.flag} ${cname(c)}</option>`).join("");
    const want = (location.hash || "").slice(1); cf.elements.country.value = DATA.countries[want] ? want : (DATA.countries.uganda ? "uganda" : cf.elements.country.value);
    cf.elements.start.innerHTML = all.slice(0, -1).map(m => `<option value=${m}>${label(m)}</option>`).join("");
    cf.elements.end.innerHTML = all.slice(1).map(m => `<option value=${m}>${label(m)}</option>`).join("");
    cf.elements.end.value = all[Math.min(9, all.length - 1)];
    function mixInputs() { const c = DATA.countries[cf.elements.country.value], pr = PRESET[cf.elements.preset.value] || {};
      const series = Object.keys(c.paths); let w = series.map(s => pr[s] || 0); if (!w.some(Boolean)) w = series.map((_, i) => i === 0 ? 100 : 0);
      $("#mix").innerHTML = `<legend>${tr("calc.mix")}</legend>` + series.map((s, i) => `<label class=mixrow><span>${T.mat(s)}</span><input type=number min=0 max=100 name="mix:${s}" value=${w[i]}></label>`).join("");
      $$("[data-ccy]").forEach(x => x.textContent = c.currency); calc(); }
    function calc() {
      const c = DATA.countries[cf.elements.country.value], f = cf.elements, s = f.start.value, en = f.end.value;
      const span = all.filter(m => m >= s && m <= en); if (!span.length) { out.innerHTML = `<p>${tr("calc.order")}</p>`; return; }
      const mix = $$("#mix input").map(x => [x.name.slice(4), +x.value || 0]).filter(([, v]) => v > 0), tot = mix.reduce((a, [, v]) => a + v, 0) || 1;
      let E = 0, L = 0, H = 0; const rows = mix.map(([n, w]) => { const pth = c.paths[n], base = at(pth, "M:" + now).q;
        let e = 0, l = 0, h = 0; span.forEach(m => { const q = at(pth, "M:" + m).q; e += q.median - base.median; l += q.lo - base.median; h += q.hi - base.median; });
        e /= span.length; l /= span.length; h /= span.length; E += e * w / tot; L += l * w / tot; H += h * w / tot; return [n, w / tot, e]; });
      const V = (+cf.querySelector("[name=value]").value || 0) * (+cf.querySelector("[name=share]").value || 0) / 100, money = x => Math.round(V * x / 100).toLocaleString();
      out.innerHTML = `<p class=eyebrow>${c.flag} ${cname(c)} · ${label(s)} – ${label(en)}</p>
        <p class=pct>${pct(E)}</p><p class=pct-l>${tr("calc.escal", { lo: pct(L), hi: pct(H) })}</p>
        <p class=calcmoney>${tr("calc.money", { v: `<b>${money(E)} ${c.currency}</b>`, lo: money(L), hi: money(H) + " " + c.currency })}</p>
        <table class=glance><thead><tr><th>${tr("calc.input")}</th><th>${tr("calc.shr")}</th><th>${tr("calc.avg")}</th></tr></thead><tbody>${rows.map(([n, w, e]) =>
        `<tr><td>${T.mat(n)}</td><td>${Math.round(w * 100)}%</td><td>${pct(e)}</td></tr>`).join("")}</tbody></table>
        <div class=actions><button class="btn primary" type=button onclick="window.print()">${tr("calc.print")}</button>
        <a class=btn href="countries/${cf.elements.country.value}/index.html">${tr("gm.see", { c: cname(c) })}</a></div>`; }
    cf.elements.country.onchange = mixInputs; cf.elements.preset.onchange = mixInputs; cf.oninput = ev => { if (!["country", "preset"].includes(ev.target.name)) calc(); };
    mixInputs();
  }

  /* ---------- embed widget ---------- */
  const em = $("#embed");
  if (em) { const k = new URLSearchParams(location.search).get("c") || "uganda", c = DATA.countries[k] || Object.values(DATA.countries)[0];
    const q = at(c.paths[c.head], DATA.default).q, p = chance(q);
    em.innerHTML = `<div class=card-top><span class=flag>${c.flag}</span><b>${cname(c)}</b><span class=chip>CiO Costs</span></div>
      <p class=q>${question(c, DATA.default)}</p><span class=pct>${Math.round(p * 100)}%</span><span class=pct-l>${tr("lbl.chance") === "lbl.chance" ? "chance of a rise" : tr("lbl.chance")} · ${pct(q.median)}</span>
      <div class=pbar><span style="width:${Math.round(p * 100)}%"></span></div><a class=link target=_blank rel=noopener href="countries/${k}/index.html">Full outlook →</a>`; }

  /* ---------- The Cost Call ---------- */
  const game = $("#game"); if (!game || !DATA.quiz) return;
  const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const today = ymd(new Date());               /* the player's local date: new calls at local midnight */
  function seeded(seed) { let h = 2166136261; for (const ch of seed) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 1e6) / 1e6; }; }
  const focus = (location.hash || "").slice(1);
  /* A fixed shuffle of the pool, walked 5 at a time, one step per day: no repeats until the pool is used up. */
  function todaysQuestions() { const rnd = seeded("cio-pool"), pool = DATA.quiz.slice();
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    const day = Math.floor(Date.UTC(+today.slice(0, 4), +today.slice(5, 7) - 1, +today.slice(8)) / 864e5), start = (day * 5) % pool.length;
    return Array.from({ length: Math.min(5, pool.length) }, (_, k) => pool[(start + k) % pool.length]); }
  const Q = todaysQuestions();
  let st = store.get("cio-call", {}); if (st.date !== today) st = { date: today, answers: [] };
  const stats = store.get("cio-call-stats", { played: 0, wins: 0, streak: 0, best: 0, last: null });
  const per = q => tr(q.step === "quarter" ? "quarter.word" : "month.word");
  function statsRow() { const box = $("#stats"); if (!box) return;
    box.innerHTML = [[tr("st.played"), stats.played], [tr("st.avg"), stats.played ? (stats.wins / stats.played).toFixed(1) + "/5" : "–"], [tr("st.streak"), stats.streak], [tr("st.best"), stats.best]]
      .map(([k, v]) => `<div class=stat><b>${v}</b><span>${k}</span></div>`).join(""); }
  function progress() { return `<div class=progress>${Q.map((_, i) => `<i class="${i < st.answers.length ? (st.answers[i] ? "ok" : "no") : (i === st.answers.length ? "on" : "")}"></i>`).join("")}</div>`; }
  function ask() { const i = st.answers.length; if (i >= Q.length) return finish(); const q = Q[i];
    const when = q.step === "quarter" ? qlabel(q.period, "quarter") : label(q.period);
    game.innerHTML = `<div class=qcard>${progress()}<div class=flag>${q.flag}</div>
      <h2>${tr("gm.q", { when, m: `<u>${T.mat(q.material).toLowerCase()}</u>`, c: T.country(q.cc, q.country) })}</h2>
      <div class=choices><button class=choice data-a=up>${tr("gm.up")}</button><button class=choice data-a=down>${tr("gm.down")}</button></div><div class=reveal></div></div>`;
    $$(".choice", game).forEach(b => b.onclick = () => {
      const up = q.change > 0, right = (b.dataset.a === "up") === up; st.answers.push(right); store.set("cio-call", st);
      $$(".choice", game).forEach(x => { x.disabled = true; if ((x.dataset.a === "up") === up) x.classList.add("right"); else if (x === b) x.classList.add("wrong"); });
      $(".reveal", game).innerHTML = `${tr(right ? "gm.right" : "gm.wrong")} ${tr("gm.official", { v: `<b>${pct(q.change)}</b>`, p: per(q) })}
        <div class=actions style="justify-content:center"><a class=btn href="countries/${q.key}/index.html">${tr("gm.see", { c: T.country(q.cc, q.country) })}</a>
        <button class="btn primary" id=next>${tr(st.answers.length < Q.length ? "gm.next" : "gm.seescore")}</button></div>`;
      $("#next").onclick = ask; }); }
  function finish() { const score = st.answers.filter(Boolean).length, grid = st.answers.map(a => a ? "🟩" : "🟥").join("");
    if (stats.last !== today) { const y = ymd(new Date(Date.now() - 864e5));
      stats.played++; stats.wins += score; stats.streak = (stats.last === y ? stats.streak : 0) + 1; stats.best = Math.max(stats.best, stats.streak); stats.last = today; store.set("cio-call-stats", stats); }
    statsRow(); const text = `CiO Cost Call ${today}\n${grid} ${score}/5\nWill building costs rise? Play: CiO Costs`;
    game.innerHTML = `<div class=qcard>${progress()}<h2>${tr("gm.score", { n: score })}</h2><div class=result-grid>${grid}</div>
      <p class=muted>${tr("gm.newcalls", { s: stats.streak })}</p>
      <div class=actions style="justify-content:center"><button class="btn primary" id=share>${tr("gm.share")}</button><a class=btn href="report.html">${tr("gm.report")}</a></div></div>`;
    $("#share").onclick = async () => { try { if (navigator.share) await navigator.share({ text }); else { await navigator.clipboard.writeText(text); $("#share").textContent = tr("gm.copied"); } }
      catch (e) { $("#share").textContent = "Copy: " + grid; } }; }
  statsRow(); ask();
  const calls = $("#calls"), mine = store.get("cio-weekly-calls", {});
  if (calls) { const cs = Object.entries(DATA.countries).filter(([, c]) => c.official).sort(([a], [b]) => (a === focus ? -1 : b === focus ? 1 : 0));
    calls.innerHTML = cs.map(([k, c]) => { const q = c.paths[c.head][0], p = chance(q), id = k + ":" + q.month, my = mine[id];
      return `<article class="card callcard" data-id="${id}"><div class=card-top><span class=flag>${c.flag}</span><a class=country href="countries/${k}/index.html">${cname(c)}</a><span class=chip>${tr("call.next")}</span></div>
        <h3 class=q>${tr("call.q", { s: T.mat(c.head), when: qlabel(q.month, c.step), base: T.base(c.base) })}</h3>
        ${my ? `<p>${tr("call.yours", { a: `<b>${tr(my.a === "up" ? "call.higher" : "call.lower").slice(2)}</b>`, c: my.c })}<br>${tr("call.model", { p: `<b>${Math.round(p * 100)}%</b>` })}</p>`
             : `<label class=muted>${tr("call.sure")} <b class=cv>70</b>%<input class=conf type=range min=50 max=95 step=5 value=70></label>
                <div class=row><button class=choice data-a=up>${tr("call.higher")}</button><button class=choice data-a=down>${tr("call.lower")}</button></div>`}
        <div class=card-foot><a class=link href="countries/${k}/index.html">${tr("call.see", { c: cname(c) })}</a></div></article>`; }).join("");
    $$(".callcard", calls).forEach(card => { const r = $(".conf", card); if (r) r.oninput = () => $(".cv", card).textContent = r.value;
      $$(".choice", card).forEach(b => b.onclick = () => { mine[card.dataset.id] = { a: b.dataset.a, c: +r.value, at: today }; store.set("cio-weekly-calls", mine); location.reload(); }); }); }
})();
