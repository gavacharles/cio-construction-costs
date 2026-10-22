/* CiO Costs — translations (English source text lives in the page; Kiswahili and French here).
   Draft translations: have native speakers review before launch.
   Static text: elements with data-i18n="key" (data-i18n-ph for placeholders, data-cc for country names).
   Dynamic text: I18N.t("key", {vars}). Months and country names come from the browser (Intl). */
window.I18N = (function () {
  "use strict";
  const D = {
    sw: {
      "bc.h1": "Zabuni na mikataba", "bc.lede": "Kabla ya kazi: panga bei ya zabuni kwa mabadiliko yanayotarajiwa ya gharama za vifaa. Wakati wa kazi: rekebisha malipo kwa fahirisi ya kila mwezi ambayo pande zote zinaweza kuikagua.", "bc.bid": "Panga zabuni", "bc.adjust": "Rekebisha malipo", "bc.quick": "Huna jedwali la kiasi? Makadirio ya haraka", "bc.pricebid": "Panga zabuni", "bc.useindex": "Tumia kama fahirisi ya mkataba", "bc.add": "+ Ongeza kwenye jedwali", "trend.test": "Imejaribiwa kwa vipindi {n} vilivyopita: mabadiliko halisi yalikuwa ndani ya kiwango mara {p}%.",
      "tip.fc": "utabiri", "tip.exp": "Inatarajiwa {x} kutoka {base}", "tip.rng": "Kiwango {lo} hadi {hi}", "tip.lvl": "Fahirisi", "tip.off": "iliyochapishwa", "tip.mom": "dhidi ya kipindi kilichopita",
      "boq.eyebrow": "Bure wakati wa majaribio · hadi mistari 10", "boq.h": "Ongezeko la gharama kwa jedwali la kiasi (BoQ)", "boq.d": "Weka mistari yako kwa bei za leo. Kila mstari unaunganishwa na utabiri wa kifaa hicho, na unapata gharama inayotarajiwa katika kipindi cha kazi, pamoja na kiwango. Bandika moja kwa moja kutoka Excel: maelezo, kiasi, kipimo, bei.", "boq.desc": "Maelezo", "boq.qty": "Kiasi", "boq.rate": "Bei ya leo", "boq.series": "Bei inafuata", "boq.today": "Kiasi leo", "boq.exp": "Inayotarajiwa", "boq.total": "Jumla", "boq.add": "Ongeza mstari", "boq.paste": "Bandika kutoka Excel", "boq.csv": "Pakua CSV", "boq.del": "Ondoa mstari", "boq.limit": "Hadi mistari 10 bure wakati wa majaribio. Majedwali makubwa, miradi iliyohifadhiwa na PDF zenye nembo zimepangwa kwa CiO Costs Pro.", "boq.fixed": "Bei isiyobadilika", "boq.descph": "mf. Saruji, mfuko wa kilo 50", "boq.sum": "Inayotarajiwa {from} – {to}: {v} ({d} juu ya bei za leo). Kiwango {lo} hadi {hi}.", "boq.empty": "Ongeza kiasi na bei za leo kuona gharama inayotarajiwa.", "boq.ex1": "Saruji, mfuko wa kilo 50", "boq.ex1u": "mfuko", "boq.ex2": "Nondo, Y12", "boq.ex3": "Mchanga, kwa safari", "boq.ex3u": "safari", "ci.link": "Fahirisi ya marekebisho ya bei kwa mikataba →", "ci.short": "Fahirisi ya mikataba", "ci.eyebrow": "Bure wakati wa majaribio", "ci.h1": "Fahirisi ya marekebisho ya bei kwa mikataba", "ci.lede": "Mikataba mingi ya ujenzi hurekebisha malipo bei za vifaa zinapobadilika (vifungu vya marekebisho ya bei). Vinahitaji fahirisi ambayo pande zote mbili zinaweza kuiona. Hii hapa moja kwa kila nchi ya majaribio, mwezi kwa mwezi, pamoja na kikokotoo.", "ci.month": "Mwezi", "ci.index": "Fahirisi", "ci.chg": "Mabadiliko", "ci.status": "Hali", "ci.calc": "Rekebisha malipo", "ci.amount": "Kiasi cha kurekebisha", "ci.base": "Mwezi wa msingi (zabuni)", "ci.val": "Mwezi wa tathmini", "ci.fixed": "Sehemu isiyorekebishwa (%)", "ci.formula": "Kanuni: kiasi kilichorekebishwa = kiasi × (a + b × I₁ / I₀), ambapo a ni sehemu isiyobadilika, b = 1 − a, I₀ fahirisi ya mwezi wa msingi na I₁ ya mwezi wa tathmini.", "ci.how": "Jinsi ya kuitumia — na mipaka yake", "ci.l1": "Miezi rasmi inatoka moja kwa moja kwa ofisi ya takwimu (UBOS, KNBS, Stats SA). Miezi ya muda ni utabiri wetu, hadi takwimu rasmi itakapotoka; kubalini katika mkataba kwamba itabadilishwa.", "ci.l2": "Nchi zisizo na fahirisi rasmi ya ujenzi (Nigeria, Rwanda, Tanzania, Zambia) zinaonyesha fahirisi yetu ya gharama za uagizaji kutoka mafuta na sarafu. Haijumuishi vifaa vya ndani wala kazi; itumieni kwa uangalifu.", "ci.l3": "Ni bure wakati wa majaribio. Fahirisi kwa kifaa na mji, historia ndefu, vyeti vya kila mwezi na mtiririko wa data zimepangwa kwa CiO Costs Pro.", "ci.what.off": "Fahirisi rasmi ya bei za vifaa vya ujenzi kutoka {o}, ikiongezwa miezi ya muda hadi toleo rasmi lijalo.", "ci.what.est": "Bado hakuna fahirisi rasmi ya ujenzi: fahirisi ya CiO ya gharama za uagizaji (mafuta na sarafu). Vifaa vya ndani na kazi havijajumuishwa.", "ci.st.official": "Rasmi", "ci.st.provisional": "Ya muda (CiO)", "ci.st.estimate": "Makadirio ya CiO", "ci.res": "mabadiliko ya sehemu inayorekebishwa: fahirisi {i0} → {i1}", "ci.adj": "Kiasi kilichorekebishwa: {v} (tofauti {d})", "ci.prov": "* Inatumia mwezi wa muda: hesabu tena takwimu rasmi zikitoka.",
      "trend": "mwenendo", "trend.tip": "Utabiri kutoka historia ya bei ya kifaa hiki pekee (bila modeli ya mafuta, sarafu au hali ya hewa): mwongozo wa jumla zaidi.",
      "dv.h": "Kinachosukuma gharama", "dv.oil": "Mafuta ya dunia (Brent)", "dv.off": "Takwimu rasmi za karibuni", "dv.upd": "Utabiri ulisasishwa", "dv.every": "Husasishwa kila saa 3 mafuta na sarafu zinapobadilika", "dv.up3": "katika miezi 3 — mafuta, usafiri, lami na plastiki zinagharimu zaidi", "dv.down3": "katika miezi 3 — mafuta na usafiri vinagharimu kidogo", "dv.fx": "{ccy} kwa dola moja ya Marekani", "dv.weaker": "imedhoofika katika miezi 3 — nondo, malighafi ya saruji na vifaa vya kuagiza vinagharimu zaidi", "dv.stronger": "imeimarika katika miezi 3 — bidhaa za kuagiza zinagharimu kidogo", "dv.usd": "Bei hapa ni kwa dola za Marekani: hakuna athari ya sarafu", "dv.none": "Bado hakuna fahirisi rasmi", "dv.est": "Makadirio kutoka mabadiliko ya mafuta na sarafu", "dv.now": "Sasa hivi", "dv.hago": "saa {h} zilizopita",
      "bm.q": "CiO Costs inatabiri vipi bei za ujenzi mahali takwimu rasmi ni nzuri?", "bm.latest": "ya karibuni", "bm.in1": "ndani ya kiwango, mwezi 1 mbele", "bm.in3": "ndani ya kiwango, miezi 3 mbele", "bm.miss": "wastani wa kukosea (pointi), yetu / “hakuna mabadiliko”", "bm.beat": "Bora kuliko “hakuna mabadiliko”", "bm.nobeat": "Bado si bora kuliko “hakuna mabadiliko”", "bm.months": "miezi iliyojaribiwa, kila mmoja kwa takwimu zilizojulikana wakati huo", "bm.aim": "Lengo ni 80%: mabadiliko halisi yawe ndani ya kiwango mara 8 kati ya 10. Juu sana maana kiwango ni cha tahadhari mno; chini sana, cha ujasiri mno.", "bm.vs": "Utabiri dhidi ya kilichotokea", "bm.t1": "mwezi 1 mbele", "bm.t3": "miezi 3 mbele", "bm.lg.rng": "kiwango chetu", "bm.lg.mid": "utabiri wetu wa kati", "bm.lg.hit": "matokeo rasmi, ndani", "bm.lg.miss": "matokeo rasmi, nje", "bm.next": "Tunachotarajia baadaye", "bm.idx": "Fahirisi rasmi", "bm.how": "Jaribio hili linavyofanya kazi", "bm.how1": "Kila mwezi katika miaka minne iliyopita, tulitabiri kwa kutumia takwimu zilizochapishwa hadi wakati huo tu.", "bm.how2": "Tulilinganisha na takwimu rasmi iliyotoka baadaye: je, ilikuwa ndani ya kiwango chetu?", "bm.how3": "Pia tunalinganisha na kanuni rahisi kabisa — “bei zinabaki zilipo” — kuona kama utabiri unaongeza kitu.", "bm.source": "Chanzo rasmi", "bm.back": "Nchi saba za majaribio",
      "search.btn": "Tafuta", "bench.h2": "Ulinganisho: chombo kilekile mahali takwimu rasmi ni nzuri", "bench.d2": "Pia tunaendesha CiO Costs kwa bei rasmi za ujenzi Amerika Kaskazini, Ulaya, Asia na Amerika Kusini. Zinachapishwa kila mwezi kwa wakati, ili mtu yeyote aone jinsi utabiri unavyofanya. Lengo: mabadiliko halisi yawe ndani ya kiwango mara 8 kati ya 10.", "bench.c1": "Ndani ya kiwango, mwezi 1", "bench.c3": "miezi 3", "bench.cb": "Bora kuliko “hakuna mabadiliko”",
      "cta.report": "Ripoti bei", "join.h": "Shiriki", "join.d2": "Mtu yeyote anaweza kutumia CiO Costs na kuongeza bei — bila akaunti. Tuambie ulicholipa kwa saruji, nondo, mchanga au dizeli unaponunua, hata miezi baadaye, na ufuate taarifa ya kila wiki bure.", "rep.lede2": "Tuambie bei uliyolipa au uliyonukuliwa kwa kifaa cha ujenzi — leo au hadi miezi 6 iliyopita, wakati wowote unapopata nafasi. Ripoti ni siri: tunachapisha bei za kawaida kutoka kwa watu wasiopungua 3 — kamwe si majina, namba au ripoti moja moja.", "qr.h2": "Ulilipa kiasi gani hivi karibuni?", "qr.d2": "Tuambie bei moja — ya leo au ya miezi michache iliyopita. Ni siri na inachukua sekunde 20; watu 3 wakiripoti bidhaa, kila mtu anaona bei ya kawaida.", "rep.when": "Ulilipa lini?", "when.0": "Mwezi huu", "when.1": "Mwezi uliopita", "when.2": "Miezi 2 iliyopita", "when.3": "Miezi 3 iliyopita", "when.4": "Miezi 4 iliyopita", "when.5": "Miezi 5 iliyopita", "when.6": "Miezi 6 iliyopita", "th.vsprev": "dhidi ya miezi 2 iliyotangulia", "crowd.areas2": "Bei za kawaida zinatumia miezi 2 iliyopita, ili watu waripoti wanaponunua. Bei za maeneo zinaonekana watu 3 wakiripoti kutoka eneo hilo.", "track.crowdsoon2": "watu 3 wakiripoti bidhaa katika vipindi viwili vya miezi 2, tutaonyesha mabadiliko ya wanacholipa kando ya makadirio yetu hapa.", "grp.bench": "Kipimo cha ulinganisho", "tab.bench": "Ulinganisho", "bench.eyebrow": "Utabiri ni mzuri kiasi gani?", "bench.h": "Ulinganisho: chombo kilekile mahali takwimu ni nzuri", "bench.d": "Pia tunaendesha CiO Costs kwa bei rasmi za vifaa vya ujenzi za Marekani, zinazochapishwa kila mwezi kwa wakati, ili mtu yeyote aone jinsi kinavyotabiri vizuri.", "bench.in1": "ndani ya kiwango, mwezi 1 mbele", "bench.in3": "miezi 3 mbele (lengo: 80%)", "bench.see": "Ona ulinganisho",
      "grp.pilot": "Nchi za majaribio", "grp.more": "Nchi zaidi",
      "qr.h": "Ulilipa kiasi gani wiki hii?", "qr.d": "Tuambie bei moja. Ni siri na inachukua sekunde 20 — watu 3 wakiripoti bidhaa, kila mtu anaona bei ya kawaida.", "qr.need": "Watu <b>{n} kati ya 3</b> wameripoti {i} nchini {c} katika miezi 2 iliyopita. Ongeza yako ili bei ya kawaida ionekane.", "qr.live": "<b>✓ Inaonekana:</b> bei ya kawaida ya {i} nchini {c} imechapishwa — ripoti yako inaiweka sasa.", "qr.town": "Tafadhali andika mji au eneo.",
      "whatis": "CiO Costs ni chombo cha utabiri. Kinakadiria jinsi bei za vifaa vya ujenzi zinavyoweza kubadilika, pamoja na kiwango. Si takwimu rasmi, orodha ya bei wala ushauri wa kifedha.", "fc.note": "Utabiri, si uhakika: mara 8 kati ya 10 mabadiliko halisi huwa ndani ya kiwango.", "crowd.note": "Bei za kawaida zilizoripotiwa na wanunuzi — si bei rasmi wala za wasambazaji.", "emb.notadvice": "Utabiri · si ushauri",
      "rep.area": "Ni wapi?", "rep.incap": "Ndani ya", "rep.elsewhere": "Kwingineko nchini", "rep.check": "{p} {ccy} ni mbali na bei ya kawaida {u} {ccy}. Ni sahihi?", "rep.yes": "Ndiyo, ni sahihi — tuma", "rep.fix": "Niirekebishe", "th.item": "Bidhaa", "th.typical": "Bei ya kawaida", "th.elsewhere": "Kwingineko", "th.reporters": "Waliripoti", "th.vs4": "dhidi ya wiki 4", "crowd.areas": "Bei za maeneo zinatumia wiki 4 zilizopita na zinaonekana watu 3 wakiripoti kutoka eneo hilo.", "track.crowdsoon": "watu 3 wakiripoti bidhaa kwa wiki 4, tutaonyesha wanacholipa kando ya makadirio yetu hapa.", "track.addyours": "Ripoti bei", "track.vscrowd": "makadirio yetu dhidi ya wanacholipa watu", "track.est": "Makadirio yetu ya gharama za uagizaji, mwezi uliopita",
      "emb.lang": "Lugha", "emb.visitor": "Lugha ya mgeni", "emb.theme": "Rangi", "emb.match": "Kulingana na mgeni", "emb.light": "Mwanga", "emb.dark": "Giza", "emb.help": "Nakili msimbo huu kwenye ukurasa wowote wa tovuti. Kwenye WordPress, ongeza kizuizi cha “Custom HTML” na ubandike hapo. Unajisasisha wenyewe.", "emb.copy": "Nakili msimbo", "emb.copied": "Imenakiliwa ✓", "emb.preview": "Hakikisho", "emb.full": "Mtazamo kamili kwenye CiO Costs →", "emb.offline": "Anwani ya tovuti itajazwa yenyewe CiO Costs ikiwa mtandaoni.",
      "needle.down": "Bei chini", "needle.up": "Bei juu", "draw.h": "Chora", "draw.d": "Kisia jinsi fahirisi rasmi ya bei ilivyobadilika. Chora mstari, kisha ona halisi.", "draw.q": "{s} nchini {c} ilibadilikaje kutoka {a} hadi {b}? Chora mstari.", "draw.hint": "Chora hapa →", "draw.reveal": "Onyesha", "draw.score": "Umepata {n}/100.", "draw.off": "Mstari wako ulikosea kwa wastani wa pointi {x}.", "draw.fc": "Mstari wa vitone ni utabiri wetu wa kinachofuata.", "draw.done": "Chati mpya kesho.", "res.h": "Ona matokeo", "res.dist": "Alama zako hadi sasa", "res.next": "Makisio mapya baada ya", "res.close": "Funga",
      "h.1": "Mwezi ujao", "h.3": "Miezi 3", "h.6": "Miezi 6", "h.pick": "Chagua tarehe", "v.sure.up": "Hakika zitapanda", "v.likely.up": "Huenda zikapanda", "v.lean.up": "Zinaelekea kupanda", "v.sure.down": "Hakika zitashuka", "v.likely.down": "Huenda zikashuka", "v.lean.down": "Zinaelekea kushuka", "v.same": "Takriban hazibadiliki", "v.sub": "takriban {x} kufikia {when}", "lbl.chance.cap": "Uwezekano wa kupanda", "buy.q": "Unanunua nini?", "buy.cement": "Saruji", "buy.steel": "Nondo", "buy.sand": "Mchanga", "buy.diesel": "Dizeli", "buy.roofing": "Mabati", "grid.open": "Onyesha nchi zote", "glance.link": "Linganisha nchi zote kwenye jedwali moja →", "game.line": "Makisio matano ya haraka kila siku kwa bei halisi.", "track.h": "Rekodi ya usahihi", "track.none": "bado hakuna fahirisi rasmi ya kulinganisha; tunalinganisha na bei zinazoripotiwa zinapoingia.", "track.soon": "tunahifadhi kila utabiri na tutauonyesha hapa kando ya takwimu rasmi zitakapochapishwa.", "join.signin": "Ingia (majaribio)", "rep.needs": "Watu {n} kati ya 3 katika miezi 2 iliyopita — ongeza yako",
      "match.by": "inayotarajiwa kufikia {when}", "match.last": "rasmi, ya karibuni ({p})", "match.ind": "gharama za uagizaji {x} kufikia {when}",
      "share": "Shiriki", "wa.weekly": "Taarifa ya kila wiki bure kwenye WhatsApp",
      "nav.prices": "Bei", "nav.plan": "Zabuni na mikataba", "nav.reportshort": "Ripoti bei", "nav.playshort": "Cheza", "pick.country": "Nchi yako", "chip.yours": "Nchi yako", "chip.officialdata": "Takwimu rasmi", "chip.estimate": "Makadirio", "tip.official": "Imejengwa kutoka takwimu rasmi za bei za ujenzi za nchi, ikisasishwa kwa mabadiliko ya mafuta na sarafu ya wiki hii.", "tip.estimate": "Bado hakuna fahirisi rasmi ya bei za ujenzi inayotumika: haya ni makadirio ya shinikizo kwa vifaa vinavyoagizwa kutoka bei za mafuta na kiwango cha ubadilishaji. Vifaa vya ndani na kazi havijajumuishwa.", "trust.sources": "Takwimu rasmi kutoka UBOS, KNBS na Stats SA", "trust.track": "Rekodi ya usahihi", "trust.ago": "imesasishwa saa {h} zilizopita", "trust.justnow": "imesasishwa sasa hivi", "wa.follow": "Fuata kwenye WhatsApp (bure)", "money.h": "Bei yako", "money.ph": "Bei yako ya mwisho", "money.need": "Andika bei uliyolipa mara ya mwisho kuona bei inayotarajiwa.", "money.out": "Tarajia takriban {p} kufikia {when} (kwa uwezekano mkubwa {lo} – {hi}).", "alert.email": "Barua pepe", "tab.official": "Takwimu rasmi", "tab.indicator": "Makadirio",
      "nav.countries": "Nchi", "nav.glance": "Gharama kwa muhtasari", "nav.calc": "Kikokotoo cha zabuni", "nav.report": "Ripoti bei",
      "nav.play": "The Cost Call", "nav.method": "Jinsi inavyofanya kazi", "cta.join": "Jiunge na majaribio",
      "footer.short": "CiO Lab · Utabiri ni makadirio yenye viwango, si ushauri. The Cost Call ni mchezo: alama hazina thamani ya pesa.",
      "when.label": "Utabiri hadi", "when.note": "Takwimu za kila wiki zinakadiriwa kutoka utabiri wa kila mwezi, unaosasishwa kila baada ya saa chache. Mabadiliko yanapimwa kutoka takwimu rasmi za karibuni za kila nchi (au kutoka leo kwa viashiria vya gharama za uagizaji).",
      "home.eyebrow": "Mtazamo wa gharama za ujenzi · nchi 7 za Afrika", "home.h1": "Je, gharama za ujenzi zitapanda unapofanya kazi?",
      "home.lede": "Chagua nchi yako na tarehe. Ona kama bei za vifaa vya ujenzi huenda zikapanda, kwa kiasi gani, na maana yake kwa bei unayolipa — inasasishwa kila baada ya saa chache.",
      "tool.calc.t": "Kikokotoo cha ongezeko la bei kwenye zabuni", "tool.calc.d": "Bei zinaweza kubadilika kiasi gani katika kipindi cha mkataba wako? Pata ongezeko linalotarajiwa kwa sarafu yako, pamoja na kiwango.",
      "tool.report.t": "Ripoti bei", "tool.report.d": "Tuambie ulilipa kiasi gani kwa saruji, chuma, dizeli au mchanga wiki hii. Inachukua dakika moja na inaboresha takwimu za kila mtu.",
      "tool.play.t": "The Cost Call", "tool.play.d": "Makisio matano kila siku kuhusu bei halisi. Endeleza mfululizo wako.",
      "tab.all": "Zote", "tab.east": "Afrika Mashariki", "tab.south": "Kusini mwa Afrika", "tab.west": "Afrika Magharibi", "tab.north": "Afrika Kaskazini",
      "tab.rising": "Zinapanda", "tab.easing": "Zinashuka",
      "chip.official": "Fahirisi rasmi ya bei", "chip.indicator": "Kiashiria cha gharama za uagizaji", "chip.featured": "Iliyoangaziwa",
      "lbl.chance": "uwezekano wa kupanda", "lbl.expected": "mabadiliko yanayotarajiwa", "lbl.range": "kiwango kinachowezekana (8 kati ya 10)",
      "lbl.expected.cap": "Mabadiliko yanayotarajiwa", "lbl.range.cap": "Kiwango kinachowezekana (8 kati ya 10)",
      "btn.seecosts": "Ona gharama: {c}", "link.makecall": "Cheza mchezo wa leo", "btn.bymaterial": "Ona gharama kwa kila kifaa", "btn.play": "Cheza The Cost Call",
      "feat.bymaterial": "Kwa kila kifaa, hadi", "search.ph": "Tafuta nchi na vifaa — mf. Kenya Uganda saruji", "empty": "Hakuna nchi inayolingana. Jaribu “saruji”, “Kenya”, “Mashariki” au “Ulinganisho”.",
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
      "embed.s": "Weka utabiri huu kwenye tovuti yako", "rep.h1": "Ulilipa kiasi gani?",
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
      "rep.none": "Bado hakuna ripoti kwa {c}. Kuwa wa kwanza.", 
      "rep.thanks": "Asante ✓ Bei yako sasa inahesabiwa katika bei ya kawaida.", "net.offline": "Kuhifadhi kunafunguka tovuti ikiwa mtandaoni. Taarifa zako hazijatumwa.",
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
      "bc.h1": "Offres et contrats", "bc.lede": "Avant le chantier : chiffrez votre offre avec l'évolution attendue du coût des matériaux. Pendant le chantier : révisez les paiements avec un indice mensuel vérifiable par les deux parties.", "bc.bid": "Chiffrer une offre", "bc.adjust": "Réviser un paiement", "bc.quick": "Pas de devis quantitatif ? Estimation rapide", "bc.pricebid": "Chiffrer une offre", "bc.useindex": "Utiliser comme indice de contrat", "bc.add": "+ Ajouter à mon devis", "trend.test": "Testé sur {n} périodes passées : la variation réelle est tombée dans la fourchette {p} % du temps.",
      "tip.fc": "prévision", "tip.exp": "Attendu {x} depuis {base}", "tip.rng": "Fourchette {lo} à {hi}", "tip.lvl": "Indice", "tip.off": "publié", "tip.mom": "sur la période précédente",
      "boq.eyebrow": "Gratuit pendant le pilote · jusqu'à 10 lignes", "boq.h": "Révision d'un devis quantitatif (BoQ)", "boq.d": "Saisissez vos lignes aux prix d'aujourd'hui. Chaque ligne est reliée à la prévision du matériau, et vous obtenez le coût attendu sur la période des travaux, avec une fourchette. Collez directement depuis Excel : description, quantité, unité, prix.", "boq.desc": "Description", "boq.qty": "Quantité", "boq.rate": "Prix aujourd'hui", "boq.series": "Le prix suit", "boq.today": "Montant aujourd'hui", "boq.exp": "Attendu", "boq.total": "Total", "boq.add": "Ajouter une ligne", "boq.paste": "Coller depuis Excel", "boq.csv": "Télécharger CSV", "boq.del": "Supprimer la ligne", "boq.limit": "Jusqu'à 10 lignes gratuites pendant le pilote. Grands devis, projets enregistrés et PDF à votre marque sont prévus pour CiO Costs Pro.", "boq.fixed": "Prix fixe (sans changement)", "boq.descph": "ex. Ciment, sac de 50 kg", "boq.sum": "Attendu sur {from} – {to} : {v} ({d} par rapport aux prix d'aujourd'hui). Fourchette {lo} à {hi}.", "boq.empty": "Ajoutez quantités et prix d'aujourd'hui pour voir le coût attendu.", "boq.ex1": "Ciment, sac de 50 kg", "boq.ex1u": "sac", "boq.ex2": "Acier d'armature, HA12", "boq.ex3": "Sable, par voyage", "boq.ex3u": "voyage", "ci.link": "Indice de révision des prix pour les contrats →", "ci.short": "Indice des contrats", "ci.eyebrow": "Gratuit pendant le pilote", "ci.h1": "Un indice de révision des prix pour les contrats", "ci.lede": "Beaucoup de contrats de construction révisent les paiements quand les prix des intrants bougent (clauses de révision des prix). Il faut un indice que les deux parties peuvent consulter. En voici un par pays pilote, mois par mois, avec un calculateur.", "ci.month": "Mois", "ci.index": "Indice", "ci.chg": "Variation", "ci.status": "Statut", "ci.calc": "Réviser un paiement", "ci.amount": "Montant à réviser", "ci.base": "Mois de base (offre)", "ci.val": "Mois de valorisation", "ci.fixed": "Partie fixe, non révisée (%)", "ci.formula": "Formule : montant révisé = montant × (a + b × I₁ / I₀), où a est la partie fixe, b = 1 − a, I₀ l'indice du mois de base et I₁ celui du mois de valorisation.", "ci.how": "Mode d'emploi — et limites", "ci.l1": "Les mois officiels viennent directement de l'office statistique (UBOS, KNBS, Stats SA). Les mois provisoires sont notre prévision, jusqu'à la publication officielle ; prévoyez au contrat leur remplacement.", "ci.l2": "Les pays sans indice officiel de la construction (Nigeria, Rwanda, Tanzanie, Zambie) affichent notre indice des coûts d'importation (pétrole et change). Il ne couvre ni matériaux locaux ni main-d'œuvre : à utiliser avec prudence.", "ci.l3": "Gratuit pendant le pilote. Indices par matériau et par ville, long historique, certificats mensuels et flux de données sont prévus pour CiO Costs Pro.", "ci.what.off": "Indice officiel des prix des intrants de construction de {o}, prolongé par des mois provisoires jusqu'à la prochaine publication.", "ci.what.est": "Pas encore d'indice officiel : indice CiO des coûts d'importation (pétrole et change). Matériaux locaux et main-d'œuvre non inclus.", "ci.st.official": "Officiel", "ci.st.provisional": "Provisoire (CiO)", "ci.st.estimate": "Estimation CiO", "ci.res": "variation de la partie révisable : indice {i0} → {i1}", "ci.adj": "Montant révisé : {v} (écart {d})", "ci.prov": "* Utilise un mois provisoire : recalculez à la publication officielle.",
      "trend": "tendance", "trend.tip": "Prévision tirée du seul historique de prix de ce matériau (sans modèle pétrole, devise ou météo) : un repère plus approximatif.",
      "dv.h": "Ce qui fait bouger les coûts", "dv.oil": "Pétrole mondial (Brent)", "dv.off": "Derniers chiffres officiels", "dv.upd": "Prévision mise à jour", "dv.every": "Actualisée toutes les 3 heures selon le pétrole et les devises", "dv.up3": "en 3 mois — carburant, transport, bitume et plastiques plus chers", "dv.down3": "en 3 mois — carburant et transport moins chers", "dv.fx": "{ccy} par dollar US", "dv.weaker": "plus faible en 3 mois — acier, intrants du ciment et équipements importés plus chers", "dv.stronger": "plus fort en 3 mois — importations un peu moins chères", "dv.usd": "Prix en dollars US : pas d'effet de change", "dv.none": "Pas encore d'indice officiel", "dv.est": "Estimation à partir du pétrole et des devises", "dv.now": "À l'instant", "dv.hago": "il y a {h} h",
      "bm.q": "CiO Costs prévoit-il bien les prix de la construction là où les données officielles sont bonnes ?", "bm.latest": "dernier", "bm.in1": "dans la fourchette, à 1 mois", "bm.in3": "dans la fourchette, à 3 mois", "bm.miss": "erreur moyenne (points), la nôtre / « pas de changement »", "bm.beat": "Bat « pas de changement »", "bm.nobeat": "Ne bat pas encore « pas de changement »", "bm.months": "mois testés, chacun avec les seules données connues à l'époque", "bm.aim": "L'objectif est 80 % : la variation réelle doit tomber dans la fourchette 8 fois sur 10. Bien plus : fourchette trop prudente ; bien moins : trop audacieuse.", "bm.vs": "Prévision vs réalité", "bm.t1": "à 1 mois", "bm.t3": "à 3 mois", "bm.lg.rng": "notre fourchette", "bm.lg.mid": "notre prévision centrale", "bm.lg.hit": "résultat officiel, dedans", "bm.lg.miss": "résultat officiel, dehors", "bm.next": "Ce que nous attendons", "bm.idx": "L'indice officiel", "bm.how": "Comment fonctionne ce test", "bm.how1": "Chaque mois des quatre dernières années, nous avons prévu en n'utilisant que les chiffres publiés à ce moment-là.", "bm.how2": "Nous l'avons comparée au chiffre officiel publié ensuite : tombait-il dans notre fourchette ?", "bm.how3": "Nous comparons aussi à la règle la plus simple — « les prix restent où ils sont » — pour voir si la prévision apporte quelque chose.", "bm.source": "Source officielle", "bm.back": "Les sept pays pilotes",
      "search.btn": "Rechercher", "bench.h2": "Références : le même outil là où les données officielles sont bonnes", "bench.d2": "Nous appliquons aussi CiO Costs aux prix officiels de la construction en Amérique du Nord, en Europe, en Asie et en Amérique latine. Ils sont publiés chaque mois à l'heure : chacun peut vérifier la qualité des prévisions. Objectif : la variation réelle tombe dans la fourchette 8 fois sur 10.", "bench.c1": "Dans la fourchette, 1 mois", "bench.c3": "3 mois", "bench.cb": "Bat « pas de changement »",
      "cta.report": "Signaler un prix", "join.h": "Participer", "join.d2": "Tout le monde peut utiliser CiO Costs et ajouter des prix — sans compte. Indiquez ce que vous avez payé le ciment, l'acier, le sable ou le gazole quand vous achetez, même des mois plus tard, et suivez le point hebdomadaire gratuit.", "rep.lede2": "Indiquez un prix payé ou proposé pour un matériau de construction — aujourd'hui ou jusqu'à 6 mois en arrière, quand vous avez un moment. Les signalements sont anonymes : nous publions des prix habituels d'au moins 3 personnes — jamais de noms, de numéros ni de signalements isolés.", "qr.h2": "Combien avez-vous payé récemment ?", "qr.d2": "Indiquez un prix — d'aujourd'hui ou des derniers mois. C'est anonyme et prend 20 secondes ; dès que 3 personnes signalent un article, tout le monde voit le prix habituel.", "rep.when": "Quand avez-vous payé ?", "when.0": "Ce mois-ci", "when.1": "Le mois dernier", "when.2": "Il y a 2 mois", "when.3": "Il y a 3 mois", "when.4": "Il y a 4 mois", "when.5": "Il y a 5 mois", "when.6": "Il y a 6 mois", "th.vsprev": "vs 2 mois précédents", "crowd.areas2": "Les prix habituels regroupent les 2 derniers mois, pour que chacun puisse signaler quand il achète. Les prix par zone s'affichent dès que 3 personnes de la zone ont signalé.", "track.crowdsoon2": "dès que 3 personnes ont signalé un article sur deux périodes de 2 mois, nous affichons ici l'évolution de ce qu'elles paient à côté de notre estimation.", "grp.bench": "Référence", "tab.bench": "Référence", "bench.eyebrow": "Les prévisions sont-elles fiables ?", "bench.h": "Référence : le même outil là où les données sont bonnes", "bench.d": "Nous appliquons aussi CiO Costs aux prix officiels des intrants de construction des États-Unis, publiés chaque mois à l'heure, pour que chacun puisse vérifier la qualité des prévisions.", "bench.in1": "dans la fourchette, à 1 mois", "bench.in3": "à 3 mois (objectif : 80 %)", "bench.see": "Voir la référence",
      "grp.pilot": "Pays pilotes", "grp.more": "Autres pays",
      "qr.h": "Combien avez-vous payé cette semaine ?", "qr.d": "Indiquez un prix. C'est anonyme et prend 20 secondes — dès que 3 personnes signalent un article, tout le monde voit le prix habituel.", "qr.need": "<b>{n} sur 3</b> personnes ont signalé {i} au {c} ces 2 derniers mois. Ajoutez le vôtre pour débloquer le prix habituel.", "qr.live": "<b>✓ En ligne :</b> le prix habituel de {i} au {c} est publié — votre signalement le tient à jour.", "qr.town": "Veuillez indiquer la ville ou la zone.",
      "whatis": "CiO Costs est un outil de prévision. Il estime l'évolution probable des prix des matériaux de construction, avec une fourchette. Ce n'est ni une statistique officielle, ni une liste de prix, ni un conseil financier.", "fc.note": "Prévision, pas une garantie : 8 fois sur 10, la variation réelle tombe dans la fourchette.", "crowd.note": "Prix habituels signalés par des acheteurs — ni prix officiels, ni prix fournisseurs.", "emb.notadvice": "Prévision · pas un conseil",
      "rep.area": "Où ?", "rep.incap": "À", "rep.elsewhere": "Ailleurs dans le pays", "rep.check": "{p} {ccy} est loin du prix habituel de {u} {ccy}. Est-ce exact ?", "rep.yes": "Oui, c'est exact — envoyer", "rep.fix": "Je corrige", "th.item": "Article", "th.typical": "Prix habituel", "th.elsewhere": "Ailleurs", "th.reporters": "Signalements", "th.vs4": "sur 4 semaines", "crowd.areas": "Les prix par zone portent sur les 4 dernières semaines et s'affichent dès que 3 personnes de la zone ont signalé.", "track.crowdsoon": "dès que 3 personnes signalent un article pendant 4 semaines, nous affichons ici ce qu'elles paient à côté de notre estimation.", "track.addyours": "Signaler un prix", "track.vscrowd": "notre estimation vs ce que les gens paient", "track.est": "Notre estimation des coûts d'importation, mois dernier",
      "emb.lang": "Langue", "emb.visitor": "Langue du visiteur", "emb.theme": "Couleurs", "emb.match": "Comme le visiteur", "emb.light": "Clair", "emb.dark": "Sombre", "emb.help": "Copiez ce code dans n'importe quelle page web. Sur WordPress, ajoutez un bloc « HTML personnalisé » et collez-le. Il se met à jour tout seul.", "emb.copy": "Copier le code", "emb.copied": "Copié ✓", "emb.preview": "Aperçu", "emb.full": "Prévision complète sur CiO Costs →", "emb.offline": "L'adresse du site sera remplie automatiquement une fois CiO Costs en ligne.",
      "needle.down": "Prix en baisse", "needle.up": "Prix en hausse", "draw.h": "Dessinez", "draw.d": "Devinez l'évolution d'un indice officiel des prix. Tracez la ligne, puis découvrez la vraie.", "draw.q": "Comment {s} a-t-il évolué au {c} de {a} à {b} ? Tracez la ligne.", "draw.hint": "Dessinez ici →", "draw.reveal": "Révéler", "draw.score": "Votre score : {n}/100.", "draw.off": "Votre ligne s'écartait en moyenne de {x} points.", "draw.fc": "La ligne pointillée montre où notre prévision la mène ensuite.", "draw.done": "Un nouveau graphique demain.", "res.h": "Voir les résultats", "res.dist": "Vos scores jusqu'ici", "res.next": "Prochains pronostics dans", "res.close": "Fermer",
      "h.1": "Mois prochain", "h.3": "3 mois", "h.6": "6 mois", "h.pick": "Choisir une date", "v.sure.up": "Hausse quasi certaine", "v.likely.up": "Hausse probable", "v.lean.up": "Plutôt en hausse", "v.sure.down": "Baisse quasi certaine", "v.likely.down": "Baisse probable", "v.lean.down": "Plutôt en baisse", "v.same": "À peu près stable", "v.sub": "environ {x} d'ici {when}", "lbl.chance.cap": "Probabilité de hausse", "buy.q": "Qu'achetez-vous ?", "buy.cement": "Ciment", "buy.steel": "Acier", "buy.sand": "Sable", "buy.diesel": "Gazole", "buy.roofing": "Tôles", "grid.open": "Afficher tous les pays", "glance.link": "Comparer tous les pays dans un tableau →", "game.line": "Cinq pronostics rapides par jour sur des prix réels.", "track.h": "Historique de précision", "track.none": "pas encore d'indice officiel pour comparer ; nous comparons avec les prix signalés à mesure qu'ils arrivent.", "track.soon": "nous enregistrons chaque prévision et l'afficherons ici à côté du chiffre officiel dès sa publication.", "join.signin": "Connexion pilote", "rep.needs": "{n} personnes sur 3 ces 2 derniers mois — ajoutez le vôtre",
      "match.by": "attendu d'ici {when}", "match.last": "officiel, dernier ({p})", "match.ind": "coûts d'importation {x} d'ici {when}",
      "share": "Partager", "wa.weekly": "Point hebdomadaire gratuit sur WhatsApp",
      "nav.prices": "Prix", "nav.plan": "Offres et contrats", "nav.reportshort": "Signaler un prix", "nav.playshort": "Jouer", "pick.country": "Votre pays", "chip.yours": "Votre pays", "chip.officialdata": "Données officielles", "chip.estimate": "Estimation", "tip.official": "Construit à partir des statistiques officielles des prix de la construction du pays, mis à jour avec les variations du pétrole et de la monnaie de la semaine.", "tip.estimate": "Pas encore d'indice officiel utilisable des prix de la construction : estimation de la pression sur les matériaux importés à partir du prix du pétrole et du taux de change. Matériaux locaux et main-d'œuvre non inclus.", "trust.sources": "Données officielles de l'UBOS, du KNBS et de Stats SA", "trust.track": "Historique de précision", "trust.ago": "mis à jour il y a {h} h", "trust.justnow": "mis à jour à l'instant", "wa.follow": "Suivre sur WhatsApp (gratuit)", "money.h": "Votre prix", "money.ph": "Votre dernier prix", "money.need": "Saisissez le dernier prix payé pour voir le prix attendu.", "money.out": "Prévoyez environ {p} d'ici {when} (le plus probable : {lo} – {hi}).", "alert.email": "E-mail", "tab.official": "Données officielles", "tab.indicator": "Estimations",
      "nav.countries": "Pays", "nav.glance": "Coûts en un coup d'œil", "nav.calc": "Calculateur d'offre", "nav.report": "Signaler des prix",
      "nav.play": "The Cost Call", "nav.method": "Comment ça marche", "cta.join": "Rejoindre le pilote",
      "footer.short": "CiO Lab · Les prévisions sont des estimations avec des fourchettes, pas des conseils. The Cost Call est un jeu : les points n'ont aucune valeur monétaire.",
      "when.label": "Prévision jusqu'à", "when.note": "Les valeurs hebdomadaires sont interpolées à partir de la prévision mensuelle, mise à jour toutes les quelques heures. Les variations sont mesurées depuis la dernière donnée officielle de chaque pays (ou depuis aujourd'hui pour les indicateurs de coûts d'importation).",
      "home.eyebrow": "Perspectives des coûts de construction · 7 pays africains", "home.h1": "Les coûts de construction vont-ils augmenter là où vous travaillez ?",
      "home.lede": "Choisissez votre pays et une date. Voyez si les prix des matériaux de construction vont probablement augmenter, de combien, et ce que cela signifie pour le prix que vous payez — mis à jour toutes les quelques heures.",
      "tool.calc.t": "Calculateur d'actualisation des offres", "tool.calc.d": "De combien les prix pourraient-ils évoluer pendant votre contrat ? Obtenez l'actualisation attendue dans votre monnaie, avec une fourchette.",
      "tool.report.t": "Signaler un prix", "tool.report.d": "Dites-nous combien vous avez payé le ciment, l'acier, le gazole ou le sable cette semaine. Une minute suffit, et tout le monde y gagne.",
      "tool.play.t": "The Cost Call", "tool.play.d": "Cinq pronostics par jour sur des prix réels. Gardez votre série.",
      "tab.all": "Tous", "tab.east": "Afrique de l'Est", "tab.south": "Afrique australe", "tab.west": "Afrique de l'Ouest", "tab.north": "Afrique du Nord",
      "tab.rising": "En hausse", "tab.easing": "En baisse",
      "chip.official": "Indice officiel des prix", "chip.indicator": "Indicateur des coûts d'importation", "chip.featured": "À la une",
      "lbl.chance": "probabilité de hausse", "lbl.expected": "variation attendue", "lbl.range": "fourchette probable (8 sur 10)",
      "lbl.expected.cap": "Variation attendue", "lbl.range.cap": "Fourchette probable (8 sur 10)",
      "btn.seecosts": "Voir les coûts : {c}", "link.makecall": "Jouer au jeu du jour", "btn.bymaterial": "Voir les coûts par matériau", "btn.play": "Jouer à The Cost Call",
      "feat.bymaterial": "Par matériau, jusqu'à", "search.ph": "Rechercher pays et matériaux — ex. Kenya Ouganda ciment", "empty": "Aucun pays ne correspond. Essayez « ciment », « Kenya », « Est » ou « Référence ».",
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
      "embed.s": "Afficher cette prévision sur votre site", "rep.h1": "Combien avez-vous payé ?",
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
      "rep.none": "Aucun signalement pour {c} pour l'instant. Soyez le premier.", 
      "rep.thanks": "Merci ✓ Votre prix compte désormais dans le prix habituel.", "net.offline": "L'envoi est possible une fois le site en ligne. Vos informations n'ont pas été envoyées.",
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
      "bc.h1": "Bids & contracts", "bc.lede": "Before the job: price your bid with the expected change in material costs. During the job: adjust payments with a monthly index both sides can check.", "bc.bid": "Price a bid", "bc.adjust": "Adjust a payment", "bc.quick": "No bill of quantities? Quick estimate", "bc.pricebid": "Price a bid", "bc.useindex": "Use as contract index", "bc.add": "+ Add to my bill", "trend.test": "Tested on {n} past periods: the real change fell inside the range {p}% of the time.",
      "tip.fc": "forecast", "tip.exp": "Expected {x} from {base}", "tip.rng": "Likely range {lo} to {hi}", "tip.lvl": "Index", "tip.off": "published", "tip.mom": "on the previous period",
      "boq.eyebrow": "Free during the pilot · up to 10 lines", "boq.h": "Bill of quantities escalation", "boq.d": "Enter your lines at today's rates. Each line is matched to the forecast for that material, and you get the expected cost over the work period, with a likely range. Paste straight from Excel: description, quantity, unit, rate.", "boq.desc": "Description", "boq.qty": "Quantity", "boq.rate": "Rate today", "boq.series": "Price follows", "boq.today": "Amount today", "boq.exp": "Expected", "boq.total": "Total", "boq.add": "Add a line", "boq.paste": "Paste from Excel", "boq.csv": "Download CSV", "boq.del": "Remove line", "boq.limit": "Up to 10 lines free during the pilot. Larger bills, saved projects and branded PDFs are planned for CiO Costs Pro.", "boq.fixed": "Fixed price (no change)", "boq.descph": "e.g. Cement, 50 kg bag", "boq.sum": "Expected over {from} – {to}: {v} ({d} on today's rates). Likely range {lo} to {hi}.", "boq.empty": "Add quantities and today's rates to see the expected cost.", "boq.ex1": "Cement, 50 kg bag", "boq.ex1u": "bag", "boq.ex2": "Reinforcement steel, Y12", "boq.ex3": "Sand, per trip", "boq.ex3u": "trip", "ci.link": "Price adjustment index for contracts →", "ci.short": "Contract index", "ci.eyebrow": "Free during the pilot", "ci.h1": "A price adjustment index for contracts", "ci.lede": "Many construction contracts adjust payments when input prices move (price adjustment or fluctuation clauses). They need an index both sides can look up. Here is one for each pilot country, month by month, with a calculator.", "ci.month": "Month", "ci.index": "Index", "ci.chg": "Change", "ci.status": "Status", "ci.calc": "Adjust a payment", "ci.amount": "Amount to adjust", "ci.base": "Base month (tender)", "ci.val": "Valuation month", "ci.fixed": "Fixed part, not adjusted (%)", "ci.formula": "Formula: adjusted amount = amount × (a + b × I₁ / I₀), where a is the fixed part, b = 1 − a, I₀ the index in the base month and I₁ in the valuation month — the one-index form of standard price adjustment clauses.", "ci.how": "How to use it — and its limits", "ci.l1": "Official months come straight from the statistics office (UBOS, KNBS, Stats SA). Provisional months are our forecast, used only until the official figure is published; agree in the contract that provisional values are replaced.", "ci.l2": "Countries without an official construction index (Nigeria, Rwanda, Tanzania, Zambia) show our import-cost index from oil and the exchange rate. It does not cover local materials or labour, so use it with care and say so in the contract.", "ci.l3": "This is free during the pilot. Indices by material and city, long history, monthly certificates and a data feed are planned for CiO Costs Pro.", "ci.what.off": "Official construction input price index from {o}, extended with provisional months until the next official release.", "ci.what.est": "No official construction index yet: CiO import-cost index (oil and exchange rate). Local materials and labour are not included.", "ci.st.official": "Official", "ci.st.provisional": "Provisional (CiO)", "ci.st.estimate": "CiO estimate", "ci.res": "change in the adjustable part's value: index {i0} → {i1}", "ci.adj": "Adjusted amount: {v} (difference {d})", "ci.prov": "* Uses a provisional month: recalculate when the official figure is published.",
      "trend": "trend", "trend.tip": "Forecast from this material's own price history only (no oil, currency or weather model): a rougher guide.",
      "dv.h": "What is moving costs", "dv.oil": "World oil (Brent)", "dv.off": "Latest official figures", "dv.upd": "Forecast updated", "dv.every": "Refreshed every 3 hours as oil and currencies move", "dv.up3": "in 3 months — fuel, transport, asphalt and plastics cost more", "dv.down3": "in 3 months — fuel and transport cost less", "dv.fx": "{ccy} per US dollar", "dv.weaker": "weaker in 3 months — imported steel, cement inputs and fittings cost more", "dv.stronger": "stronger in 3 months — imports cost a little less", "dv.usd": "Prices here are in US dollars: no currency effect", "dv.none": "No official index yet", "dv.est": "Estimate from oil and currency moves", "dv.now": "Just now", "dv.hago": "{h} h ago",
      "bm.q": "How well does CiO Costs forecast construction prices where the official data is good?", "bm.latest": "latest", "bm.in1": "inside the likely range, 1 month ahead", "bm.in3": "inside the likely range, 3 months ahead", "bm.miss": "average miss (points), ours / “no change”", "bm.beat": "Beats “no change”", "bm.nobeat": "Does not beat “no change” yet", "bm.months": "months tested, each with only the data known at the time", "bm.aim": "The aim is 80%: the real change should land inside our likely range 8 times in 10. Much higher means the range is too cautious; much lower, too bold.", "bm.vs": "Forecast vs what happened", "bm.t1": "1 month ahead", "bm.t3": "3 months ahead", "bm.lg.rng": "our likely range", "bm.lg.mid": "our central forecast", "bm.lg.hit": "official result, inside", "bm.lg.miss": "official result, outside", "bm.next": "What we expect next", "bm.idx": "The official index", "bm.how": "How this test works", "bm.how1": "Every month in the past four years, we made a forecast using only the figures that were published by then.", "bm.how2": "We compared it with the official figure that came out later: did it land inside our likely range?", "bm.how3": "We also compare with the simplest rule — “prices stay where they are” — to see whether the forecast adds anything.", "bm.source": "Official source", "bm.back": "The seven pilot countries",
      "search.btn": "Search", "bench.h2": "Benchmarks: the same tool where official data is good", "bench.d2": "We also run CiO Costs on official construction prices in North America, Europe, Asia and Latin America. They are published every month and on time, so anyone can check how well the forecasts do. The aim: the real change lands inside the likely range 8 times in 10.", "bench.c1": "Inside range, 1 month", "bench.c3": "3 months", "bench.cb": "Beats “no change”", "empty": "No country matches. Try “cement”, “Kenya”, “East” or “Benchmark”.",
      "link.makecall": "Play today's game",
      "cta.report": "Report a price", "home.eyebrow": "Construction cost outlook · 7 African countries", "join.h": "Take part", "join.d2": "Anyone can use CiO Costs and add prices — no account. Tell us what you paid for cement, steel, sand or diesel whenever you buy, even months later, and follow the free weekly update.", "rep.h1": "What did you pay?", "rep.lede2": "Tell us a price you paid or were quoted for a building material — today or up to 6 months ago, whenever you have a moment. Reports are anonymous: we publish typical prices from at least 3 people — never names, numbers or single reports.", "qr.h2": "What did you pay recently?", "qr.d2": "Tell us one price — today or from the last few months. It is anonymous and takes 20 seconds; once 3 people report an item, everyone sees the typical price.", "rep.when": "When did you pay?", "when.0": "This month", "when.1": "Last month", "when.2": "2 months ago", "when.3": "3 months ago", "when.4": "4 months ago", "when.5": "5 months ago", "when.6": "6 months ago", "th.vsprev": "vs previous 2 months", "crowd.areas2": "Typical prices pool the last 2 months, so people can report whenever they buy. Area prices appear once 3 people report from that area.", "track.crowdsoon2": "once 3 people have reported an item over two periods of 2 months, we show the change in what they pay next to our estimate here.", "grp.bench": "Benchmark", "tab.bench": "Benchmark", "bench.eyebrow": "How good are the forecasts?", "bench.h": "Benchmark: the same tool where data is good", "bench.d": "We also run CiO Costs on the United States' official construction input prices, published every month on time, so anyone can check how well it forecasts.", "bench.in1": "inside the likely range, 1 month ahead", "bench.in3": "3 months ahead (aim: 80%)", "bench.see": "See the benchmark",
      "grp.pilot": "Pilot countries", "grp.more": "More countries",
      "qr.h": "What did you pay this week?", "qr.d": "Tell us one price. It is anonymous and takes 20 seconds — and once 3 people report an item, everyone sees the typical price.", "qr.need": "<b>{n} of 3</b> people have reported {i} in {c} in the last 2 months. Add yours to unlock the typical price.", "qr.live": "<b>✓ Live:</b> the typical price for {i} in {c} is published — your report keeps it current.", "qr.town": "Please type the town or area.",
      "whatis": "CiO Costs is a forecasting tool. It estimates how building material prices are likely to move, with a range. It is not an official statistic, a price list or financial advice.", "fc.note": "Forecast, not a guarantee: 8 times in 10 the real change falls inside the range.", "crowd.note": "Typical prices reported by buyers — not official or supplier prices.", "emb.notadvice": "Forecast · not advice",
      "rep.area": "Where is that?", "rep.incap": "In", "rep.elsewhere": "Elsewhere in the country", "rep.check": "{p} {ccy} is far from the usual {u} {ccy}. Is that right?", "rep.yes": "Yes, it's right — send", "rep.fix": "Let me fix it", "th.item": "Item", "th.typical": "Typical price", "th.elsewhere": "Elsewhere", "th.reporters": "Reporters", "th.vs4": "vs 4 weeks", "crowd.areas": "Area prices use the last 4 weeks and appear once 3 people report from that area.", "track.crowdsoon": "once 3 people report an item for 4 weeks, we show what they pay next to our estimate here.", "track.addyours": "Report a price", "track.vscrowd": "our estimate vs what people pay", "track.est": "Our import-cost estimate, last month",
      "lbl.chance": "chance of a rise",
      "emb.lang": "Language", "emb.visitor": "Visitor's language", "emb.theme": "Colours", "emb.match": "Match the visitor", "emb.light": "Light", "emb.dark": "Dark", "emb.help": "Copy this code into any web page. On WordPress, add a “Custom HTML” block and paste it there. It updates by itself.", "emb.copy": "Copy code", "emb.copied": "Copied ✓", "emb.preview": "Preview", "emb.full": "Full outlook on CiO Costs →", "emb.offline": "The site address is filled in automatically once CiO Costs is online.",
      "needle.down": "Prices down", "needle.up": "Prices up", "draw.h": "Draw it", "draw.d": "Guess how an official price index moved. Draw the line, then reveal the real one.", "draw.q": "How did {s} in {c} move from {a} to {b}? Draw the line.", "draw.hint": "Draw here →", "draw.reveal": "Reveal", "draw.score": "You scored {n}/100.", "draw.off": "Your line was off by {x} points on average.", "draw.fc": "The dashed line is where our forecast says it goes next.", "draw.done": "A new chart tomorrow.", "res.h": "See results", "res.dist": "Your scores so far", "res.next": "Next calls in", "res.close": "Close",
      "home.lede": "Choose your country and a date. See whether building material prices are likely to go up, by how much, and what that means for the price you pay — updated every few hours.",
      "h.1": "Next month", "h.3": "3 months", "h.6": "6 months", "h.pick": "Pick a date", "v.sure.up": "Almost certainly up", "v.likely.up": "Likely up", "v.lean.up": "Leaning up", "v.sure.down": "Almost certainly down", "v.likely.down": "Likely down", "v.lean.down": "Leaning down", "v.same": "About the same", "v.sub": "about {x} by {when}", "lbl.chance.cap": "Chance of a rise", "buy.q": "What are you buying?", "buy.cement": "Cement", "buy.steel": "Steel", "buy.sand": "Sand", "buy.diesel": "Diesel", "buy.roofing": "Roofing", "grid.open": "Show all countries", "glance.link": "Compare all countries in one table →", "game.line": "Five quick calls a day on real prices.", "track.h": "Track record", "track.none": "no official index to check against yet; we compare with reported prices as they come in.", "track.soon": "we log every forecast and will show it here next to the official figure once it is published.", "join.signin": "Pilot sign-in", "rep.needs": "{n} of 3 people in the last 2 months — add yours",
      "match.by": "expected by {when}", "match.last": "official, latest ({p})", "match.ind": "import costs {x} by {when}",
      "share": "Share", "wa.weekly": "Free weekly update on WhatsApp",
      "nav.prices": "Prices", "nav.plan": "Bids & contracts", "nav.reportshort": "Report a price", "nav.playshort": "Play", "pick.country": "Your country", "chip.yours": "Your country", "chip.officialdata": "Official data", "chip.estimate": "Estimate", "tip.official": "Built from the country's official construction price statistics, updated with this week's oil and currency moves.", "tip.estimate": "No usable official construction price index yet: an estimate of the pressure on imported materials from oil prices and the exchange rate. Local materials and labour are not included.", "trust.sources": "Official data from UBOS, KNBS and Stats SA", "trust.track": "Track record", "trust.ago": "updated {h} h ago", "trust.justnow": "updated just now", "wa.follow": "Follow on WhatsApp (free)", "money.h": "Your price", "money.ph": "Your latest price", "money.need": "Type what you paid last to see the expected price.", "money.out": "Expect about {p} by {when} (most likely {lo} – {hi}).", "alert.email": "Email", "tab.official": "Official data", "tab.indicator": "Estimates",
      "q.official": "Will construction input prices in {c} rise by {when}?", "q.indicator": "Will import costs push {c}'s building prices up by {when}?",
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
      "rep.none": "No reports yet for {c}. Be the first.", 
      "rep.thanks": "Thank you ✓ Your price now counts towards the typical price.", "net.offline": "Saving opens when the site is online. Your details have not been sent.",
      "net.notsent": "Not sent: {e}", "net.unreach": "Could not reach the server. Please try again shortly.", "alert.ok": "Alert set ✓ We'll message you when it triggers.",
      "calc.escal": "expected escalation on inputs (8 in 10: {lo} to {hi})", "calc.money": "{v} expected · range {lo} to {hi}",
      "calc.input": "Input", "calc.shr": "Share", "calc.avg": "Average expected move", "calc.print": "Print or save as PDF",
      "calc.order": "Choose an end month after the start.", "calc.mix": "Mix of inputs (%)",
      "glance.more": "Show all {n} countries", "glance.fewer": "Show fewer",
    },
  };
  let lang = "en";
  try { lang = new URLSearchParams(location.search).get("lang") || localStorage.getItem("cio-lang") || ""; } catch (e) { /* storage unavailable */ }
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
  $$("optgroup[data-grp]").forEach(g => g.label = tr("grp." + g.dataset.grp));
  const langSel = $("#lang"); if (langSel) { langSel.value = T.lang; langSel.onchange = () => T.set(langSel.value); }
  $$("#when option").forEach(o => { const v = o.value; o.textContent = v[0] === "W" ? tr("weekof.cap", { d: T.dayMonth(v.slice(2)) }) : label(v.slice(2)); });
  $$("#when optgroup").forEach(g => g.label = tr(g.label === "Weeks" ? "grp.weeks" : "grp.months"));
  const norm = x => String(x || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const words = x => norm(x).split(/[^a-z0-9]+/).filter(Boolean);
  const STOP = new Set(["and", "in", "of", "the", "for", "price", "prices", "cost", "costs", "africa", "na", "ya", "za", "bei", "gharama",
    "et", "de", "du", "la", "le", "les", "en", "prix", "cout", "couts", "afrique"]);
  const STEEL = ["steel", "rebar", "reinforc"];
  const SYN = { steel: STEEL, rebar: STEEL, iron: STEEL, nondo: STEEL, chuma: STEEL, fer: STEEL, acier: STEEL, petrol: ["fuel"], gasoil: ["fuel", "diesel"],
    gazole: ["diesel"], dizeli: ["diesel"], ballast: ["stone", "aggregate"], gravel: ["stone", "aggregate"], aggregate: ["stone", "ballast"],
    concrete: ["ready"], saruji: ["cement"], ciment: ["cement"], mchanga: ["sand"], sable: ["sand"], labor: ["labour"], kazi: ["labour"],
    mabati: ["roofing"], toles: ["roofing"], tole: ["roofing"], toiture: ["roofing"], iron_sheet: ["roofing"] };
  const hit = (ws, t) => ws.some(w => w.startsWith(t) || (SYN[t] || []).some(y => w.startsWith(y)));
  const arrow = v => v >= 0.25 ? "⬆" : (v <= -0.25 ? "⬇" : "➡");
  const apct = v => `${arrow(v)} ${pct(v)}`;
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
  function verdict(q, p) { if (Math.abs(q.median) < 0.25) return "➡ " + tr("v.same");
    const up = q.median > 0, s = up ? p : 1 - p;
    return (up ? "⬆ " : "⬇ ") + tr((s >= 0.9 ? "v.sure" : s >= 0.7 ? "v.likely" : "v.lean") + (up ? ".up" : ".down")); }
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
  const first = n => words(n)[0] || "";
  /* the forecast series for a material or report item: same name, else same first word, else the country's headline series */
  const pathFor = (c, n) => c.paths[n] || c.paths[Object.keys(c.paths).find(k => hit(words(k), first(n)))] || c.paths[c.head];
  const crowdFor = (c, n) => { const cr = c.crowd || {}; if (cr[n] != null) return cr[n];
    const k = Object.keys(cr).find(x => first(x) && hit(words(n), first(x))); return k ? cr[k] : null; };
  function money(el, c, tg) {
    const box = $(".money", el); if (!box) return;
    const sel = $("[data-money-mat]", box), inp = $("[data-money-price]", box), out = $("[data-money-out]", box);
    if (sel.dataset.key !== c.key) {                       /* (re)build the material list when the country changes */
      sel.dataset.key = c.key; const names = c.official ? Object.keys(c.paths) : (c.items && c.items.length ? c.items : Object.keys(c.paths));
      sel.innerHTML = names.map(n => `<option value="${n}">${T.mat(n)}</option>`).join("");
      $("[data-money-ccy]", box).textContent = c.currency;
      inp.placeholder = tr("money.ph");
      const load = () => { const v = store.get(`cio-price-${c.key}-${sel.value}`, null) ?? crowdFor(c, sel.value); inp.value = v == null ? "" : v; };
      sel.onchange = () => { load(); money(el, c, target); };
      inp.oninput = () => { store.set(`cio-price-${c.key}-${sel.value}`, inp.value === "" ? null : +inp.value); money(el, c, target); };
      load(); }
    const pth = pathFor(c, sel.value), a = at(pth, nowTg()), b = at(pth, tg), v = +inp.value;
    if (!a || !b || !(v > 0)) { out.textContent = tr("money.need"); return; }
    const f = x => v * (1 + x / 100) / (1 + a.q.median / 100);
    out.innerHTML = tr("money.out", { p: `<strong>${money0(f(b.q.median))} ${c.currency}</strong>`, when: tLabel(tg),
      lo: money0(f(b.q.lo)), hi: money0(f(b.q.hi)) });
  }


  /* ---------- the needle: chance of a rise as a dial, Prices down ← → Prices up ---------- */
  const P = t => [100 - 80 * Math.cos(Math.PI * t), 100 - 80 * Math.sin(Math.PI * t)].map(v => v.toFixed(1)).join(" ");
  const arc = (a, b, cls) => `<path class="${cls}" d="M ${P(a)} A 80 80 0 0 1 ${P(b)}"/>`;
  const NEEDLE = `<svg viewBox="0 0 200 116" class=dial>${arc(0, 0.3, "seg down")}${arc(0.3, 0.45, "seg down2")}${arc(0.45, 0.55, "seg even")}${arc(0.55, 0.7, "seg up2")}${arc(0.7, 1, "seg up")}
    <g class=hand><line x1=100 y1=100 x2=100 y2=30 /><circle cx=100 cy=100 r=7 /></g>
    <text x=14 y=114 class=dl data-i18n=needle.down>${tr("needle.down")}</text><text x=186 y=114 text-anchor=end class=dl>${tr("needle.up")}</text></svg>`;
  function needle(el, p) { const nd = $("[data-needle]", el); if (!nd) return; if (!nd.innerHTML) nd.innerHTML = NEEDLE;
    $(".hand", nd).style.transform = `rotate(${(-90 + 180 * p).toFixed(1)}deg)`; }

  /* ---------- fill a block (card / featured / country page) for target tg ---------- */
  function fill(el, c, tg) {
    const r = at(c.paths[c.head], tg); if (!r) return; const q = r.q, p = chance(q);
    const set = (sel, h) => { const x = $(sel, el); if (x) x.innerHTML = h; };
    set("[data-q]", question(c, tg) + (r.beyond ? ` <small class=muted>${tr("furthest", { m: label(q.month) })}</small>` : ""));
    set("[data-verdict]", verdict(q, p)); set("[data-sub]", tr("v.sub", { x: pct(q.median), when: tLabel(tg) }));
    set("[data-pct]", Math.round(p * 100) + "%"); set("[data-exp]", apct(q.median)); set("[data-rng]", `${pct(q.lo)} – ${pct(q.hi)}`);
    set("[data-advice]", advice(c, q, tg));
    const bar = $("[data-bar]", el); if (bar) bar.style.width = Math.round(p * 100) + "%";
    const sl = $("[data-spark]", el); if (sl && !sl.innerHTML) sl.innerHTML = spark(c);
    const br = $("[data-breakdown]", el);
    if (br) br.innerHTML = Object.entries(c.paths).filter(([n]) => !(c.trend || []).includes(n)).map(([n, pth]) => { const x = at(pth, tg); return x ? `<li><span>${T.mat(n)}</span><b>${apct(x.q.median)}</b></li>` : ""; }).join("");
    money(el, c, tg); needle(el, p);
    el.dataset.trend = q.median > 0.05 ? "rising" : (q.median < -0.05 ? "easing" : "flat");
    const fan = $(".fan", el); if (fan) { const xs = JSON.parse(fan.dataset.xs || "{}"), mk = $(".marker", fan), m = tMonth(tg);
      const x = xs[m] || xs[Object.keys(xs).filter(k => k <= m).pop()]; if (mk && x) { mk.setAttribute("x1", x); mk.setAttribute("x2", x); } }
    $$("tr[data-mat]").forEach(row => { const pth = c.paths[row.dataset.mat] || (row.dataset.mat === "Reinforcement steel" ? c.paths["Rebar"] : null);
      const cell = $("[data-mexp]", row); if (cell) { const x = at(pth, tg); cell.innerHTML = x ? `${apct(x.q.median)}  (${pct(x.q.lo)} – ${pct(x.q.hi)})${(c.trend || []).includes(row.dataset.mat) ? ` <span class=trendtag title="${esc(tr("trend.tip") + ((c.trend_stats || {})[row.dataset.mat] ? " " + tr("trend.test", { p: Math.round(c.trend_stats[row.dataset.mat].inside * 100), n: c.trend_stats[row.dataset.mat].n }) : ""))}">${tr("trend")}</span>` : ""}` : tr("notsep"); } });
  }

  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register(rel + "sw.js").catch(() => {});

  /* ---------- forecast charts: hover (or touch) to read the figure for any month ---------- */
  $$("svg.fan[data-pts]").forEach(svg => { const pts = JSON.parse(svg.dataset.pts || "[]"), wrap = svg.parentElement, tip = $(".fantip", wrap);
    const ln = $(".hoverline", svg), dot = $(".hoverdot", svg); if (!pts.length || !tip) return;
    const show = ev => { const r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal, x = (ev.clientX - r.left) * vb.width / r.width;
      const p = pts.reduce((a, b) => Math.abs(b.x - x) < Math.abs(a.x - x) ? b : a);
      ln.setAttribute("x1", p.x); ln.setAttribute("x2", p.x); dot.setAttribute("cx", p.x); dot.setAttribute("cy", p.y); dot.classList.toggle("f", !!p.f);
      tip.innerHTML = p.f ? `<b>${label(p.m)}</b> · ${tr("tip.fc")}<br>${tr("tip.exp", { x: apct(p.e), base: T.base(svg.dataset.base) })}<br><span class=muted>${tr("tip.rng", { lo: pct(p.lo), hi: pct(p.hi) })}</span><br><span class=muted>${tr("tip.lvl")} ${p.v.toFixed(1)}</span>`
        : `<b>${label(p.m)}</b> · ${tr("tip.off")}<br>${tr("tip.lvl")} <b>${p.v.toFixed(1)}</b>${p.c == null ? "" : `<br>${apct(p.c)} ${tr("tip.mom")}`}`;
      tip.hidden = false; const left = p.x / vb.width * r.width; tip.style.left = Math.min(Math.max(left, 70), r.width - 70) + "px"; };
    svg.addEventListener("pointermove", show); svg.addEventListener("pointerdown", show);
    svg.addEventListener("pointerleave", () => { tip.hidden = true; ln.setAttribute("x1", -10); ln.setAttribute("x2", -10); dot.setAttribute("cx", -10); }); });

  /* ---------- Bids & contracts tabs (#bid / #adjust) ---------- */
  const bcPanes = $$("[data-bc-pane]");
  if (bcPanes.length) { const go = t => { $$("[data-bc]").forEach(b => b.setAttribute("aria-selected", String(b.dataset.bc === t)));
      bcPanes.forEach(p => p.hidden = p.dataset.bcPane !== t); };
    $$("[data-bc]").forEach(b => b.onclick = () => { go(b.dataset.bc); history.replaceState(null, "", location.pathname + location.search + "#" + b.dataset.bc); });
    go(location.hash === "#adjust" ? "adjust" : "bid"); window.addEventListener("hashchange", () => go(location.hash === "#adjust" ? "adjust" : "bid")); }

  /* "+ Add to my bill": a material from a country page goes straight into the bill of quantities */
  $$("[data-addbill]").forEach(b => b.onclick = () => { const k = Object.keys(DATA.countries)[0], c = DATA.countries[k], name = b.dataset.addbill;
    const series = c.paths[name] ? name : (name === "Reinforcement steel" && c.paths.Rebar ? "Rebar" : undefined);
    const saved = store.get("cio-boq", null), rows = saved && saved.country === k ? saved.rows : [];
    if (rows.length < 10) rows.push({ desc: T.mat(name), qty: "", unit: "", rate: "", series, manual: !!series });
    store.set("cio-boq", { country: k, rows }); track("chip", k); location.href = `${rel}calculator.html?c=${k}#bid`; });

  /* benchmark pages: switch the forecast-vs-outcome chart between 1 and 3 months ahead */
  $$("[data-bt-show]").forEach(b => b.onclick = () => { $$("[data-bt-show]").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    $$("svg[data-bt]").forEach(s => s.hidden = s.dataset.bt !== b.dataset.btShow); });

  /* ---------- "what is moving costs": oil, the currency, official data, last update ---------- */
  function drivers(k) { const box = $(".drivers"), c = DATA.countries[k]; if (!box || !c) return;
    const d = c.drivers || {}, set = (n, h) => { const x = $(`[data-dv=${n}]`, box); if (x) x.innerHTML = h; };
    const chg = (v, up, down) => v == null ? "" : `<span class=${v > 0 ? "up" : "down"}>${arrow(v)} ${Math.abs(v).toFixed(1)}%</span> ${tr(v > 0 ? up : down)}`;
    set("for", `${c.flag} ${cname(c)}`);
    set("oil", d.brent_usd ? `US$ ${d.brent_usd.toFixed(0)}` : "–"); set("oilch", chg(d.brent_13w_pct, "dv.up3", "dv.down3"));
    set("fxk", tr("dv.fx", { ccy: c.currency }));
    if (d.fx) { set("fx", `${Math.round(d.fx).toLocaleString(T.loc || undefined)} ${c.currency}`); set("fxch", chg(d.fx_13w_pct, "dv.weaker", "dv.stronger")); }
    else { set("fx", "–"); set("fxch", tr("dv.usd")); }
    set("off", c.official ? T.base(c.base) : tr("dv.none")); set("offsrc", c.official ? (c.office || "") : tr("dv.est"));
    const b = Date.parse((($("#updated-ago") || {}).dataset || {}).built || ""), h = Math.max(0, Math.round((Date.now() - b) / 36e5));
    set("upd", isNaN(h) ? "–" : (h < 1 ? tr("dv.now") : tr("dv.hago", { h }))); }

  /* ---------- country-first home ---------- */
  const my = $("#mycountry"), feat = $(".featured:not(.solo)");
  Object.entries(DATA.countries || {}).forEach(([k, c]) => { c.key = k; });
  if (my && feat) {
    $$("option", my).forEach(o => { const c = DATA.countries[o.value]; if (c) o.textContent = `${c.flag} ${cname(c)}`; });
    const show = k => { const c = DATA.countries[k]; if (!c) return; feat.dataset.key = k; drivers(k);
      $(".flag", feat).textContent = c.flag; const nm = $("[data-feat-name]", feat); nm.textContent = cname(c); nm.dataset.cc = c.cc;
      $$("[data-feat-name], [data-feat-link]", feat).forEach(a => a.href = `countries/${k}/index.html`);
      const fb = $("[data-feat-bid]", feat); if (fb) { fb.href = `calculator.html?c=${k}#bid`; fb.hidden = !!c.bench; }
      $("[data-chart]", feat).innerHTML = ""; };
    const k0 = store.get("cio-country", null); my.value = DATA.countries[k0] ? k0 : feat.dataset.key; show(my.value);
    my.onchange = () => { track("country", my.value); store.set("cio-country", my.value); show(my.value); render(); };
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
      cell("exp").textContent = apct(q.median); cell("exp").dataset.v = q.median; cell("rng").textContent = `${pct(q.lo)} – ${pct(q.hi)}`;
      cell("pct").textContent = Math.round(p * 100) + "%"; cell("pct").dataset.v = p;
      const fx = d.fx_13w_pct; cell("fx").innerHTML = fx == null ? "–" : `<span class=${fx > 0 ? "up" : "down"}>${fx > 0 ? "weaker" : "stronger"} ${Math.abs(fx).toFixed(1)}%</span>`;
      cell("fx").dataset.v = fx == null ? 0 : fx;
      const of = cell("official"); if (of && !of.dataset.done) { const h = (c.spark || {}).values || [], yr = c.step === "quarter" ? 4 : 12;
        if (c.official && h.length > yr) { const v = (h[h.length - 1] / h[h.length - 1 - yr] - 1) * 100; of.textContent = pct(v); of.dataset.v = v; }
        else { of.textContent = "–"; of.dataset.v = -999; } of.dataset.done = 1; } });
    applyFilters(); syncH();
  }
  /* "in h months": that month's option, or the week closest to the middle of it while weeks are offered */
  function horizon(h) { const d = new Date(), y = d.getFullYear() + Math.floor((d.getMonth() + h) / 12), m = (d.getMonth() + h) % 12 + 1;
    const ym = `${y}-${String(m).padStart(2, "0")}`, opts = DATA.months || [];
    if (opts.indexOf("M:" + ym) >= 0) return "M:" + ym;
    const goal = Date.UTC(y, m - 1, 15); let best = null, gap = Infinity;
    opts.filter(v => v[0] === "W").forEach(v => { const g = Math.abs(Date.parse(v.slice(2)) - goal); if (g < gap) { gap = g; best = v; } });
    return best; }
  function syncH() { $$(".when").forEach(w => { const sel = $("select", w); let any = false;
    $$("[data-h]", w).forEach(b => { const on = b.dataset.h !== "pick" && horizon(+b.dataset.h) === target; any = any || on; b.setAttribute("aria-pressed", String(on)); });
    const pk = $("[data-h=pick]", w); if (pk) pk.setAttribute("aria-pressed", String(!any)); if (sel && !any) sel.hidden = false; }); }
  $$("[data-h]").forEach(b => b.onclick = () => { if (b.dataset.h === "pick") { const sel = $("select", b.closest(".when")); sel.hidden = false; sel.focus(); return; }
    const v = horizon(+b.dataset.h); if (!v) return; target = v; store.set("cio-target", target); $$("#when").forEach(s => s.value = target); render(); });
  $$("#when").forEach(w => { w.value = target; w.onchange = () => { target = w.value; store.set("cio-target", target); $$("#when").forEach(s => s.value = target); render(); }; });

  /* ---------- filters + search ---------- */
  const tabs = $$(".tabs button"), qbox = $("#q"), count = $("#count"), empty = $("#empty"); let tab = "all";
  /* search: countries and materials together. "uganda kenya cement" = (Uganda or Kenya) with cement.
     Country words are OR-ed, material words AND-ed; every word matches the start of a word, in any language shown. */
  const REG = { east: ["east", "mashariki", "est"], south: ["southern", "kusini", "australe"], west: ["west", "magharibi", "ouest"], north: ["north", "kaskazini", "nord"],
    bench: ["benchmark", "benchmarks", "ulinganisho", "reference", "references", "global"] };
  const idx = {};
  function index(k) { if (idx[k]) return idx[k]; const c = DATA.countries[k];
    const mats = [...new Set([...Object.keys(c.paths || {}), ...(c.materials || []).map(m => m.name), ...(c.items || [])])];
    const names = ["en", "fr", "sw"].map(l => { try { return new Intl.DisplayNames([l], { type: "region" }).of(c.cc) || ""; } catch (e) { return ""; } });
    return (idx[k] = { place: words([c.country, cname(c), ...names, ...(c.aliases || []), k.replace("_", " "), c.currency, c.cc].join(" ")), region: REG[c.region] || [],
      mats: mats.map(m => ({ name: m, w: words(m + " " + T.mat(m)) })) }); }
  function matchLine(c, name) {
    const p = (c.paths || {})[name], m = (c.materials || []).find(x => x.name === name);
    if (p) { const x = at(p, target); if (x) return `<b>${T.mat(name)}</b> ${apct(x.q.median)} <span class=muted>${tr("match.by", { when: tLabel(target) })}</span>`; }
    if (m && m.change_period != null) return `<b>${T.mat(name)}</b> ${apct(m.change_period)} <span class=muted>${tr("match.last", { p: qlabel(m.period, c.step) })}</span>`;
    const h = at(c.paths[c.head], target); if (!h) return "";
    return `<b>${T.mat(name)}</b> <span class=muted>${tr("match.ind", { x: apct(h.q.median), when: tLabel(target) })}</span>`; }
  let gridOpen = false;
  const keys0 = () => $$("#grid .card").map(c => c.dataset.key);
  function applyFilters() {
    const cards = $$("#grid .card"); if (!cards.length) return; let n = 0;
    const open = gridOpen || words(qbox && qbox.value).length > 0 || tab !== "all", grid = $("#grid"), go = $("#grid-open");
    grid.classList.toggle("folded", !open); if (go) go.hidden = open;
    let raw = norm(qbox && qbox.value);
    const phrase = [];                     /* multi-word names and aliases ("south africa", "latin america") count as one place */
    keys0().forEach(k => { const c = DATA.countries[k]; [c.country, ...(c.aliases || [])].map(norm).filter(a => a.includes(" ")).forEach(a => {
      if (raw.includes(a)) { phrase.push(k); raw = raw.replace(a, " "); } }); });
    const toks = words(raw).filter(t => !STOP.has(t)), keys = cards.map(c => c.dataset.key);
    const isPlace = t => keys.some(k => hit(index(k).place, t) || index(k).region.some(r => r.startsWith(t)));
    const places = toks.filter(isPlace), mats = toks.filter(t => !isPlace(t)), anyPlace = places.length || phrase.length;
    cards.forEach(c => { const d = c.dataset, ix = index(d.key);
      const okTab = tab === "all" || (tab === "official" || tab === "indicator" ? d.type === tab : (tab === "rising" || tab === "easing") ? d.trend === tab : d.region === tab);
      const okPlace = !anyPlace || phrase.includes(d.key) || places.some(t => hit(ix.place, t) || ix.region.some(r => r.startsWith(t)));
      let found = mats.length ? ix.mats.filter(m => mats.every(t => hit(m.w, t))) : [];
      const c0 = DATA.countries[d.key], measured = found.filter(m => (c0.paths || {})[m.name] || (c0.materials || []).some(x => x.name === m.name));
      if (measured.length) found = measured;               /* official countries: show the measured series, not the report item */
      const ok = okTab && okPlace && (!mats.length || found.length); c.hidden = !ok; if (ok) n++;
      const box = $("[data-match]", c); if (box) { box.hidden = !(ok && found.length);
        box.innerHTML = ok ? found.slice(0, 3).map(m => `<li>${matchLine(DATA.countries[d.key], m.name)}</li>`).join("") : ""; } });
    if (count) count.textContent = open ? tr("count", { n, m: cards.length }) : ""; if (empty) empty.style.display = n || !open ? "none" : "block";
  }
  tabs.forEach(b => b.onclick = () => { tab = b.dataset.tab; tabs.forEach(x => x.setAttribute("aria-pressed", String(x === b))); applyFilters(); });
  if (qbox) qbox.addEventListener("input", applyFilters);
  const sf = $("#searchform");          /* the Search button (and Enter): show the matches and bring them into view */
  if (sf) sf.onsubmit = ev => { ev.preventDefault(); gridOpen = gridOpen || !qbox.value.trim(); applyFilters();
    const first = $$("#grid .card").find(c => !c.hidden && getComputedStyle(c).display !== "none");
    (first || $("#empty")).scrollIntoView({ behavior: "smooth", block: "start" }); if (window.innerWidth < 760) qbox.blur(); };
  const go = $("#grid-open"); if (go) go.onclick = () => { gridOpen = true; applyFilters(); };
  /* "what are you buying?": pick that material in the price box and show it across countries */
  const BUY = { cement: ["cement"], steel: ["steel", "rebar", "reinforc"], sand: ["sand"], diesel: ["diesel", "fuel"], roofing: ["roofing"] };
  $$("[data-buy]").forEach(b => b.onclick = () => { const terms = BUY[b.dataset.buy] || [], box = b.closest("[data-key]");
    $$("[data-buy]").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    const sel = box && $("[data-money-mat]", box);
    if (sel) { const o = [...sel.options].find(o => terms.some(t => hit(words(o.value), t))); if (o) { sel.value = o.value; sel.onchange && sel.onchange(); } }
    if (qbox) { qbox.value = b.textContent.trim(); applyFilters(); } });
  $$("#glance-table thead th[data-sort]").forEach((th, i) => { let asc = false; th.onclick = () => { asc = !asc;
    const tbody = $("#glance-table tbody"), rows = $$("tr", tbody), num = th.dataset.sort === "num";
    rows.sort((a, b) => { const A = a.children[i], B = b.children[i];
      const va = num ? parseFloat(A.dataset.v ?? A.textContent) : A.textContent.trim(), vb = num ? parseFloat(B.dataset.v ?? B.textContent) : B.textContent.trim();
      return (va > vb ? 1 : va < vb ? -1 : 0) * (asc ? 1 : -1); }).forEach(r => tbody.appendChild(r)); }; });
  render();

  /* ---------- share on WhatsApp ---------- */
  /* the phone's own share sheet (WhatsApp, SMS, email…); WhatsApp link where there is none */
  $$("[data-share]").forEach(b => b.onclick = () => { const box = b.closest("[data-key]"), k = box && box.dataset.key, c = DATA.countries[k]; if (!c) return;
    const q = at(c.paths[c.head], target).q, url = online ? `${location.origin}/countries/${k}/` : "";
    const text = `${c.flag} ${cname(c)}: ${advice(c, q, target)} — CiO Costs`;
    if (navigator.share) { navigator.share({ title: "CiO Costs", text, url: url || undefined }).catch(() => {}); return; }
    window.open("https://wa.me/?text=" + encodeURIComponent(text + (url ? " " + url : "")), "_blank", "noopener"); });

  /* ---------- posting to the server (public API) ---------- */
  async function post(url, body, msg) {
    if (!online) { msg.textContent = tr("net.offline"); return false; }
    try { const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json(); if (j.check) return j; if (!j.ok) { msg.textContent = tr("net.notsent", { e: j.error || "" }); return false; } return j; }
    catch (e) { msg.textContent = tr("net.unreach"); return false; }
  }

  /* ---------- anonymous visit counting (no cookies; skipped for "Do Not Track" and offline copies) ---------- */
  function track(kind, country) {
    if (!online || navigator.doNotTrack === "1" || window.doNotTrack === "1" || !navigator.sendBeacon) return;
    try { navigator.sendBeacon(rel + "api/public/hit", JSON.stringify({ path: location.pathname, kind, lang: T.lang, country: country || "",
      ref: kind === "view" || kind === "embed" ? document.referrer : "" })); } catch (e) { /* never break the page */ }
  }
  if (!$("#embed")) track("view", document.body.dataset.page === "country" ? Object.keys(DATA.countries || {})[0] : "");
  document.addEventListener("click", ev => {
    const t = ev.target.closest("[data-share],#share,#res-share,#drawshare,[data-buy],[data-emb-copy],a[href*='notes/weekly_']"); if (!t) return;
    track(t.matches("[data-buy]") ? "chip" : t.matches("[data-emb-copy]") ? "widget_copy" : t.matches("a") ? "note" : "share"); });
  const once = (el, ev, kind) => el && el.addEventListener(ev, () => track(kind), { once: true });
  once($(".money input"), "input", "money"); once($("#calcform"), "change", "calc");

  /* send a reported price; if it is far from the usual price, ask "is that right?" before saving */
  async function sendPrice(d, msg, ccy, priceField, done) {
    const j = await post(rel + "api/public/price", d, msg); if (!j) return;
    if (j.check) {
      msg.innerHTML = `${tr("rep.check", { p: Math.round(d.price).toLocaleString(), u: Math.round(j.usual).toLocaleString(), ccy })}
        <span class=actions><button type=button class="btn primary" data-yes>${tr("rep.yes")}</button><button type=button class=btn data-fix>${tr("rep.fix")}</button></span>`;
      $("[data-yes]", msg).onclick = () => sendPrice(Object.assign({}, d, { confirm: true }), msg, ccy, priceField, done);
      $("[data-fix]", msg).onclick = () => { msg.textContent = ""; priceField.focus(); priceField.select(); }; return; }
    msg.textContent = tr("rep.thanks"); priceField.value = ""; track(priceField.closest(".qr-form") ? "quick_report" : "report", d.country); if (done) done();
  }

  /* ---------- quick "what did you pay?" form (home + country pages) ---------- */
  $$(".quickrep").forEach(box => { const f = $("form", box), msg = $(".formmsg", f), it = f.querySelector("[name=item]"), town = $(".qr-town", f);
    const key = () => { const h = box.closest("[data-key]"); return h ? h.dataset.key : (($("#mycountry") || {}).value || "uganda"); };
    function setup() { const c = DATA.countries[key()]; if (!c) return; const prev = it.value;
      box.hidden = !(c.pitems || []).length; if (box.hidden) return;              /* the benchmark takes no price reports */
      it.innerHTML = (c.pitems || []).map(i => `<option value="${i.code}">${T.mat(i.name)}</option>`).join(""); if (prev) it.value = prev;
      if (!it.value && it.options.length) it.selectedIndex = 0;
      $("[data-qr-ccy]", f).textContent = `(${c.currency}${(c.pitems.find(i => i.code === it.value) || {}).unit ? " / " + c.pitems.find(i => i.code === it.value).unit : ""})`;
      $$("[data-capital]", f).forEach(x => x.textContent = c.capital || "");
      const n = (c.pending || {})[it.value] || 0, nm = T.mat((c.pitems.find(i => i.code === it.value) || {}).name || "");
      $("[data-qr-progress]", box).innerHTML = n >= 3 ? tr("qr.live", { i: nm, c: cname(c) }) : tr("qr.need", { n, i: nm, c: cname(c) }); }
    it.onchange = setup; $$("[name=area]", f).forEach(r => r.onchange = () => { town.hidden = f.querySelector("[name=area]:checked").value !== "other"; });
    const my = $("#mycountry"); if (my && !box.closest("[data-key]")) my.addEventListener("change", () => { it.value = ""; setup(); });
    setup();
    f.onsubmit = ev => { ev.preventDefault(); const c = DATA.countries[key()], area = f.querySelector("[name=area]:checked").value;
      const loc = area === "capital" ? c.capital : f.querySelector("[name=location]").value.trim();
      if (!loc) { msg.textContent = tr("qr.town"); f.querySelector("[name=location]").focus(); return; }
      sendPrice({ country: key(), item: it.value, price: +f.querySelector("[name=price]").value, location: loc, area, supplier: "",
        months_ago: +f.querySelector("[name=months_ago]").value }, msg, c.currency,
        f.querySelector("[name=price]"), () => { c.pending = c.pending || {}; c.pending[it.value] = (c.pending[it.value] || 0) + 1; setup(); msg.textContent = tr("rep.thanks"); }); }; });

  /* ---------- alerts (country pages) ---------- */
  $$(".alertbox").forEach(box => { const f = $("form", box), msg = $(".formmsg", box);
    f.onsubmit = async ev => { ev.preventDefault(); const d = Object.fromEntries(new FormData(f));
      d.country = box.dataset.country; d.threshold = +d.threshold; d.consent = !!d.consent;
      if (await post(rel + "api/public/alert", d, msg)) { msg.textContent = tr("alert.ok"); f.reset(); track("alert", box.dataset.country); } }; });

  /* ---------- report prices ---------- */
  const rf = $("#reportform");
  if (rf && DATA.report) {
    const fld = n => rf.querySelector(`[name=${n}]`);       // (form.elements.item is a built-in method, not the field)
    const cs = fld("country"), it = fld("item"), unit = fld("unit"), msg = $(".formmsg", rf), cv = $("#crowdview");
    const want = (location.hash || "").slice(1); if (DATA.report[want]) cs.value = want;
    function refresh() { const R = DATA.report[cs.value];
      it.innerHTML = R.items.map(i => `<option value="${i.code}">${i.name}</option>`).join(""); $$("[data-ccy]").forEach(x => x.textContent = R.currency);
      unit.value = "per " + (R.items[0] || {}).unit; $$("[data-capital]", rf).forEach(x => x.textContent = R.capital || "");
      fld("location").placeholder = R.capital ? `e.g. ${R.capital}` : ""; it.onchange = () => { const i = R.items.find(x => x.code === it.value); unit.value = "per " + (i ? i.unit : ""); };
      cv.innerHTML = R.crowd.length ? `<table class=glance><thead><tr><th>Item</th><th>Median</th><th>Reporters</th></tr></thead><tbody>${R.crowd.map(r =>
        `<tr><td>${r.name}</td><td>${r.published ? Math.round(r.median).toLocaleString() + " " + R.currency + " / " + r.unit
          : `<span class=muted>${tr("rep.needs", { n: r.pending })}</span>`}</td><td>${r.published ? r.reporters : "–"}</td></tr>`).join("")}</tbody></table>`
        : `<p>${tr("rep.none", { c: R.flag + " " + T.country(R.cc, R.country) })}</p>`; }
    cs.onchange = refresh; refresh();
    rf.onsubmit = ev => { ev.preventDefault(); const d = Object.fromEntries(new FormData(rf)); d.price = +d.price;
      sendPrice(d, msg, DATA.report[cs.value].currency, fld("price")); };
  }

  /* ---------- bid escalation calculator ---------- */
  const cf = $("#calcform");
  if (cf) {
    const out = $("#calcout"), all = nextMonths(24), now = all[0];          /* every month, not only those in the forecast picker */
    const PRESET = { building: { Cement: 30, Rebar: 25, "Reinforcement steel": 25, Sand: 10, Labour: 20, Diesel: 10,
                                 "Building cost index": 100, "Ready-mix concrete": 20, "Reinforcing steel": 25, "Construction stone and sand": 10 },
                     road: { Diesel: 35, Sand: 10, Cement: 15, Labour: 20, Rebar: 10, "Reinforcement steel": 10,
                             "Civil engineering cost index": 100, "Civil engineering materials": 70, "Construction stone and sand": 30 },
                     water: { Cement: 25, Rebar: 15, "Reinforcement steel": 15, Labour: 30, Diesel: 15, Sand: 10,
                              "Civil engineering cost index": 100, "Civil engineering materials": 60, "Ready-mix concrete": 20, Cement2: 0 } };
    cf.elements.country.innerHTML = Object.entries(DATA.countries).map(([k, c]) => `<option value=${k}>${c.flag} ${cname(c)}</option>`).join("");
    const want = new URLSearchParams(location.search).get("c") || store.get("cio-country", null);
    cf.elements.country.value = DATA.countries[want] ? want : (DATA.countries.uganda ? "uganda" : cf.elements.country.value);
    cf.elements.start.innerHTML = all.slice(0, -1).map(m => `<option value=${m}>${label(m)}</option>`).join("");
    cf.elements.end.innerHTML = all.slice(1).map(m => `<option value=${m}>${label(m)}</option>`).join("");
    cf.elements.end.value = all[Math.min(9, all.length - 1)];
    function mixInputs() { const c = DATA.countries[cf.elements.country.value], pr = PRESET[cf.elements.preset.value] || {};
      const series = Object.keys(c.paths).filter(n => !(c.trend || []).includes(n)); let w = series.map(s => pr[s] || 0); if (!w.some(Boolean)) w = series.map((_, i) => i === 0 ? 100 : 0);
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

  /* ---------- consecutive months from this month (calculators work month by month) ---------- */
  function nextMonths(n) { const d = new Date(), out = [];          /* declarations: also used by the calculator above */
    for (let i = 0; i <= n; i++) { const x = new Date(d.getFullYear(), d.getMonth() + i, 1); out.push(`${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}`); }
    return out; }
  function esc(s) { return String(s ?? "").replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch])); }
  /* average change from today over the work period (spending spread evenly), with the likely range */
  function overPeriod(pth, span) { if (!pth || !span.length) return [0, 0, 0]; const base = at(pth, "M:" + nextMonths(0)[0]).q;
    let e = 0, l = 0, h = 0; span.forEach(m => { const q = at(pth, "M:" + m).q; e += q.median - base.median; l += q.lo - base.median; h += q.hi - base.median; });
    return [e / span.length, l / span.length, h / span.length]; }

  /* ---------- bill of quantities escalation (free: up to 10 lines; kept in this browser) ---------- */
  const bf = $("#boqform");
  if (bf) {
    const fld = n => bf.querySelector(`[name=${n}]`), body = $("#boqrows"), MAX = 10, ML = nextMonths(24);
    fld("country").innerHTML = Object.entries(DATA.countries).map(([k, c]) => `<option value=${k}>${c.flag} ${cname(c)}</option>`).join("");
    const k0 = new URLSearchParams(location.search).get("c") || store.get("cio-country", null);
    fld("country").value = DATA.countries[k0] ? k0 : (DATA.countries.uganda ? "uganda" : fld("country").value);
    fld("start").innerHTML = ML.slice(0, -1).map(m => `<option value=${m}>${label(m)}</option>`).join("");
    fld("end").innerHTML = ML.slice(1).map(m => `<option value=${m}>${label(m)}</option>`).join(""); fld("end").value = ML[6];
    const C = () => DATA.countries[fld("country").value];
    const opts = c => Object.keys(c.paths).map(n => `<option value="${esc(n)}">${T.mat(n)}${(c.trend || []).includes(n) ? " · " + tr("trend") : ""}</option>`).join("")
      + `<option value="">${tr("boq.fixed")}</option>`;
    const guess = (c, desc) => { const w = words(desc).filter(t => t.length >= 3);
      return Object.keys(c.paths).find(n => { const nw = words(n + " " + T.mat(n)); return w.some(t => nw.some(x => x.startsWith(t) || t.startsWith(x) || (SYN[t] || []).some(y => x.startsWith(y)))); }) ?? c.head; };
    const fmt = v => Math.round(v).toLocaleString(T.loc || undefined);
    function addRow(v = {}) {
      if (body.children.length >= MAX) return;
      const row = document.createElement("tr"), c = C();
      row.innerHTML = `<td><input data-k=desc value="${esc(v.desc)}" placeholder="${esc(tr("boq.descph"))}" aria-label="${esc(tr("boq.desc"))}"></td>
        <td><input data-k=qty type=number min=0 step=any value="${esc(v.qty)}" aria-label="${esc(tr("boq.qty"))}"></td>
        <td><input data-k=unit value="${esc(v.unit)}" aria-label="${esc(tr("rep.unit"))}"></td>
        <td><input data-k=rate type=number min=0 step=any value="${esc(v.rate)}" aria-label="${esc(tr("boq.rate"))}"></td>
        <td><select data-k=series aria-label="${esc(tr("boq.series"))}">${opts(c)}</select></td><td data-o=today></td><td data-o=exp></td>
        <td><button type=button class=boq-del aria-label="${esc(tr("boq.del"))}">✕</button></td>`;
      body.appendChild(row);
      const sel = $("[data-k=series]", row); sel.value = v.series != null && (v.series === "" || c.paths[v.series]) ? v.series : guess(c, v.desc || "");
      if (v.manual) row.dataset.manual = 1;
      $("[data-k=desc]", row).addEventListener("change", () => { if (!row.dataset.manual) sel.value = guess(C(), $("[data-k=desc]", row).value); compute(); });
      sel.addEventListener("change", () => { row.dataset.manual = 1; compute(); });
      $(".boq-del", row).onclick = () => { row.remove(); compute(); };
      compute(); }
    function rows() { return $$("tr", body).map(r => ({ desc: $("[data-k=desc]", r).value, qty: $("[data-k=qty]", r).value, unit: $("[data-k=unit]", r).value,
      rate: $("[data-k=rate]", r).value, series: $("[data-k=series]", r).value, manual: !!r.dataset.manual, el: r })); }
    let last = [];
    function compute() {
      const c = C(), span = ML.filter(m => m >= fld("start").value && m <= fld("end").value);
      $$("[data-boq-ccy]").forEach(x => x.textContent = c.currency);
      let T0 = 0, T1 = 0, TL = 0, TH = 0; last = [];
      rows().forEach(r => { const amt = (+r.qty || 0) * (+r.rate || 0), [e, l, h] = r.series ? overPeriod(c.paths[r.series], span) : [0, 0, 0];
        const ex = amt * (1 + e / 100); T0 += amt; T1 += ex; TL += amt * (1 + l / 100); TH += amt * (1 + h / 100);
        $("[data-o=today]", r.el).textContent = amt ? fmt(amt) : "–";
        $("[data-o=exp]", r.el).innerHTML = amt ? `${fmt(ex)} <small>${apct(e)}</small>` : "–";
        last.push([r.desc, r.qty, r.unit, r.rate, r.series || tr("boq.fixed"), Math.round(amt), Math.round(ex), e.toFixed(2)]); });
      $("[data-boq-t0]").textContent = T0 ? fmt(T0) : "–"; $("[data-boq-t1]").textContent = T1 ? fmt(T1) : "–";
      $("[data-boq-sum]").innerHTML = T0 ? tr("boq.sum", { v: `<b>${fmt(T1)} ${c.currency}</b>`, d: pct((T1 / T0 - 1) * 100), lo: fmt(TL), hi: fmt(TH) + " " + c.currency,
        from: label(fld("start").value), to: label(fld("end").value) }) : tr("boq.empty");
      $("[data-boq-add]").disabled = body.children.length >= MAX;
      store.set("cio-boq", { country: fld("country").value, rows: rows().map(({ el, ...r }) => r) }); }
    fld("country").onchange = () => { const c = C(); $$("tr", body).forEach(r => { const sel = $("[data-k=series]", r), was = sel.value; sel.innerHTML = opts(c);
      sel.value = r.dataset.manual && c.paths[was] ? was : guess(c, $("[data-k=desc]", r).value); }); compute(); };
    fld("start").onchange = fld("end").onchange = compute; body.addEventListener("input", compute);
    $("[data-boq-add]").onclick = () => addRow();
    const pb = $("[data-boq-paste]", bf), box = $("[data-boq-pastebox]", bf);
    pb.onclick = () => { box.hidden = !box.hidden; if (!box.hidden) box.focus(); };
    box.addEventListener("change", () => { box.value.split(/\r?\n/).map(l => l.trim()).filter(Boolean).forEach(l => {
      const p = l.includes("\t") ? l.split("\t") : l.split(/[;,](?=\s*[\d.])/); const num = x => String(x || "").replace(/[^\d.\-]/g, "");
      addRow({ desc: (p[0] || "").trim(), qty: num(p[1]), unit: (p[2] || "").trim(), rate: num(p[3]) }); }); box.value = ""; box.hidden = true; });
    $("[data-boq-csv]", bf).onclick = () => { const head = ["description", "quantity", "unit", "rate_today", "price_follows", "amount_today", "amount_expected", "change_pct"];
      const csv = [head, ...last].map(r => r.map(x => `"${String(x ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "cio-boq-escalation.csv"; a.click(); };
    const saved = store.get("cio-boq", null);
    if (saved && DATA.countries[saved.country] && saved.rows && saved.rows.length) { fld("country").value = saved.country; saved.rows.slice(0, MAX).forEach(r => addRow(r)); }
    else if (saved && saved.rows && !saved.rows.length && saved.country) { fld("country").value = DATA.countries[saved.country] ? saved.country : fld("country").value; }
    else [{ desc: tr("boq.ex1"), unit: tr("boq.ex1u"), qty: 400 }, { desc: tr("boq.ex2"), unit: "t", qty: 3 }, { desc: tr("boq.ex3"), unit: tr("boq.ex3u"), qty: 10 }].forEach(r => addRow(r));
    compute();
  }

  /* ---------- price adjustment index for contracts ---------- */
  const cis = $("#ci-country");
  if (cis && DATA.cindex) {
    const want = new URLSearchParams(location.search).get("c") || (location.hash || "").slice(1), k0 = store.get("cio-country", null);
    cis.value = DATA.cindex[want] ? want : (DATA.cindex[k0] ? k0 : cis.value);
    const f = $("#ci-form"), out = $("[data-ci-out]");
    function ciCalc() { const X = DATA.cindex[cis.value], g = m => X.rows.find(r => r.m === m), b = g(f.elements.base.value), v = g(f.elements.val.value);
      if (!b || !v) return; const a = Math.min(100, Math.max(0, +f.elements.fixed.value || 0)) / 100, amt = +f.elements.amount.value || 0;
      const factor = a + (1 - a) * v.v / b.v, adj = amt * factor;
      out.innerHTML = `<p class=pct>${apct((factor - 1) * 100)}</p><p class=pct-l>${tr("ci.res", { i0: b.v.toFixed(2), i1: v.v.toFixed(2) })}</p>
        <p class=calcmoney>${tr("ci.adj", { v: `<b>${Math.round(adj).toLocaleString(T.loc || undefined)} ${X.currency}</b>`, d: Math.round(adj - amt).toLocaleString(T.loc || undefined) })}</p>
        ${b.s === "provisional" || v.s === "provisional" ? `<p class=fineprint>${tr("ci.prov")}</p>` : ""}`; }
    function ciShow() { const X = DATA.cindex[cis.value], rows = X.rows;
      $("[data-ci-what]").innerHTML = X.official ? tr("ci.what.off", { o: esc(X.office) }) : tr("ci.what.est");
      $("#ci-rows").innerHTML = rows.slice().reverse().map((r, i, arr) => { const p = arr[i + 1], ch = p ? (r.v / p.v - 1) * 100 : null;
        return `<tr><td>${qlabel(r.m, X.step)}</td><td>${r.v.toFixed(2)}</td><td>${ch == null ? "–" : apct(ch)}</td><td><span class="cist ${r.s}">${tr("ci.st." + r.s)}</span></td></tr>`; }).join("");
      $("[data-ci-csv]").href = rel + `data/contract_index_${cis.value}.csv`; $("[data-ci-csv]").setAttribute("download", `contract_index_${cis.value}.csv`);
      $("[data-ci-ccy]").textContent = X.currency;
      const o = rows.map(r => `<option value=${r.m}>${qlabel(r.m, X.step)}${r.s === "provisional" ? " *" : ""}</option>`).join("");
      f.elements.base.innerHTML = o; f.elements.val.innerHTML = o;
      f.elements.base.value = rows[Math.max(0, rows.length - (X.step === "quarter" ? 5 : 13))].m; f.elements.val.value = rows[rows.length - 1].m; ciCalc(); }
    cis.onchange = ciShow; f.oninput = ciCalc; ciShow();
  }

  /* ---------- embed widget ---------- */
  /* ---------- website widget (embed.html inside someone else's page) ---------- */
  const em = $("#embed");
  if (em) { const ps = new URLSearchParams(location.search), th = ps.get("theme");
    const k = DATA.countries[ps.get("c")] ? ps.get("c") : "uganda", c = DATA.countries[k], tg = DATA.default;
    if (th === "light" || th === "dark") root.setAttribute("data-theme", th); else root.removeAttribute("data-theme");
    const q = at(c.paths[c.head], tg).q, p = chance(q), home = (online ? location.origin + location.pathname.replace(/embed\.html$/, "") : "");
    em.dataset.key = k; if (ps.get("id") !== "pv") track("embed", k);     // our own preview is not a real embed
    em.innerHTML = `<div class=card-top><span class=flag aria-hidden=true>${c.flag}</span><b>${cname(c)}</b><span class=chip>CiO Costs</span></div>
      <p class=q>${question(c, tg)}</p>
      <div class=emb-row><div class=needle data-needle aria-hidden=true></div><div><span class="pct verdict">${verdict(q, p)}</span>
      <span class=pct-l>${tr("v.sub", { x: pct(q.median), when: tLabel(tg) })} · ${Math.round(p * 100)}% ${tr("lbl.chance")}</span></div></div>
      <p class=emb-adv>${advice(c, q, tg)}</p>
      <div class=emb-foot><a class=link rel=noopener href="${home}countries/${k}/index.html">${tr("emb.full")}</a><span class=fineprint>${tr("emb.notadvice")}</span></div>`;
    em.dataset.trend = q.median > 0.05 ? "rising" : (q.median < -0.05 ? "easing" : "flat"); needle(em, p);
    const send = () => parent !== window && parent.postMessage({ cio: "h", id: ps.get("id"), h: document.documentElement.scrollHeight }, "*");
    send(); if (window.ResizeObserver) new ResizeObserver(send).observe(document.body); }

  /* ---------- "put this on your website": options, live preview, copy ---------- */
  const eb = $("details.embed");
  if (eb) { const k = eb.dataset.key, code = $("[data-emb-code]", eb), pv = $("[data-emb-preview]", eb), note = $("[data-emb-note]", eb);
    const site = online ? location.origin + "/" : (DATA.site ? DATA.site + "/" : "");
    const upd = () => { const lang = $("[data-emb=lang]", eb).value, th = $("[data-emb=theme]", eb).value;
      code.value = `<div data-cio-costs="${k}"${lang ? ` data-lang="${lang}"` : ""}${th !== "auto" ? ` data-theme="${th}"` : ""}></div>\n<script async src="${site || "https://YOUR-CIO-COSTS-SITE/"}widget.js"></script>`;
      pv.src = `${rel}embed.html?c=${k}&lang=${lang}&theme=${th}&id=pv`;
      note.textContent = site ? "" : tr("emb.offline"); };
    $$("[data-emb]", eb).forEach(x => x.onchange = upd); upd();
    $("[data-emb-copy]", eb).onclick = async ev => { try { await navigator.clipboard.writeText(code.value); } catch (e) { code.select(); document.execCommand("copy"); }
      ev.target.textContent = tr("emb.copied"); setTimeout(() => ev.target.textContent = tr("emb.copy"), 2000); };
    window.addEventListener("message", e => { if (e.data && e.data.cio === "h" && e.data.id === "pv" && e.source === pv.contentWindow) pv.style.height = Math.ceil(e.data.h) + "px"; }); }

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
      track("game"); stats.played++; stats.wins += score; stats.dist = stats.dist || [0, 0, 0, 0, 0, 0]; stats.dist[score]++; stats.streak = (stats.last === y ? stats.streak : 0) + 1; stats.best = Math.max(stats.best, stats.streak); stats.last = today; store.set("cio-call-stats", stats); }
    statsRow(); const text = `CiO Cost Call ${today}\n${grid} ${score}/5\nWill building costs rise? Play: CiO Costs`;
    game.innerHTML = `<div class=qcard>${progress()}<h2>${tr("gm.score", { n: score })}</h2><div class=result-grid>${grid}</div>
      <p class=muted>${tr("gm.newcalls", { s: stats.streak })}</p>
      <div class=actions style="justify-content:center"><button class="btn primary" id=share>${tr("gm.share")}</button><button class=btn id=showres>${tr("res.h")}</button><a class=btn href="report.html">${tr("gm.report")}</a></div></div>`;
    $("#showres").onclick = () => results(score, grid, text);
    $("#share").onclick = async () => { try { if (navigator.share) await navigator.share({ text }); else { await navigator.clipboard.writeText(text); $("#share").textContent = tr("gm.copied"); } }
      catch (e) { $("#share").textContent = "Copy: " + grid; } };
    if (!game.dataset.shown) { game.dataset.shown = 1; results(score, grid, text); } }
  /* NYT-style results card: score, stats, past scores and a countdown to the next calls */
  function results(score, grid, text) { const dlg = $("#results"); if (!dlg || !dlg.showModal) return;
    const dist = stats.dist || [0, 0, 0, 0, 0, 0], top = Math.max(1, ...dist);
    dlg.innerHTML = `<form method=dialog class=res-close><button aria-label="${tr("res.close")}">✕</button></form>
      <h2 id=res-h>${tr("gm.score", { n: score })}</h2><div class=result-grid>${grid}</div>
      <div class=stats-row>${[[tr("st.played"), stats.played], [tr("st.avg"), stats.played ? (stats.wins / stats.played).toFixed(1) : "–"], [tr("st.streak"), stats.streak], [tr("st.best"), stats.best]]
        .map(([k, v]) => `<div class=stat><b>${v}</b><span>${k}</span></div>`).join("")}</div>
      <h3>${tr("res.dist")}</h3><div class=dist>${dist.map((d, i) => `<div><span>${i}</span><i style="width:${Math.max(6, d / top * 100)}%" class="${i === score ? "now" : ""}">${d}</i></div>`).join("")}</div>
      <div class=res-foot><div><span class=muted>${tr("res.next")}</span><b id=cd>--:--:--</b></div><button class="btn primary" id=res-share>${tr("gm.share")}</button></div>`;
    const cd = $("#cd", dlg), tick = () => { const now = new Date(), mid = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1), s = Math.max(0, Math.floor((mid - now) / 1000));
      cd.textContent = [s / 3600, s % 3600 / 60, s % 60].map(x => String(Math.floor(x)).padStart(2, "0")).join(":"); };
    tick(); const iv = setInterval(tick, 1000); dlg.addEventListener("close", () => clearInterval(iv), { once: true });
    dlg.addEventListener("click", ev => { if (ev.target === dlg) dlg.close(); });
    $("#res-share", dlg).onclick = async () => { try { if (navigator.share) await navigator.share({ text }); else { await navigator.clipboard.writeText(text); $("#res-share", dlg).textContent = tr("gm.copied"); } } catch (e) { /* cancelled */ } };
    dlg.showModal(); }
  statsRow(); ask();
  /* ---------- Draw it: guess the hidden part of an official index, then reveal it ---------- */
  const draw = $("#draw");
  if (draw) {
    const offs = Object.entries(DATA.countries).filter(([, c]) => c.official && c.spark && (c.spark.values || []).length >= 12);
    const dayN = Math.floor(Date.UTC(+today.slice(0, 4), +today.slice(5, 7) - 1, +today.slice(8)) / 864e5);
    if (offs.length) {
      const [k, c] = offs[dayN % offs.length], qtr = c.step === "quarter", hideN = qtr ? 4 : 6, showN = qtr ? 8 : 12;
      const vals = c.spark.values.slice(-(showN + hideN)), dates = c.spark.dates.slice(-(showN + hideN)), n = vals.length, k0 = n - hideN - 1;
      const fc = (c.paths[c.head] || []).slice(0, qtr ? 2 : 4).map(q => vals[n - 1] * (1 + q.median / 100));
      const all = vals.concat(fc), lo0 = Math.min(...all), hi0 = Math.max(...all), pad = (hi0 - lo0) * 0.6 || 1, lo = lo0 - pad, hi = hi0 + pad;
      const W = 640, H = 300, L = 46, R = 20, T0 = 16, B = 34, N = n + fc.length;
      const X = i => L + i * (W - L - R) / (N - 1), Y = v => T0 + (hi - v) * (H - T0 - B) / (hi - lo), V = y => hi - (y - T0) * (hi - lo) / (H - T0 - B);
      const line = (idx, get) => idx.map(i => `${X(i).toFixed(1)},${Y(get(i)).toFixed(1)}`).join(" ");
      const range = (a, b) => Array.from({ length: b - a + 1 }, (_, j) => a + j);
      let saved = store.get("cio-draw", null); if (saved && saved.date !== today) saved = null;
      const guess = saved ? saved.guess : Array(n).fill(null); guess[k0] = vals[k0];
      const ticks = dates.map((d, i) => i % (qtr ? 2 : 3) === 0 ? `<text x="${X(i)}" y="${H - 10}" text-anchor=middle class=tk>${qlabel(d, c.step)}</text>` : "").join("");
      const yt = [lo0, (lo0 + hi0) / 2, hi0].map(v => `<text x="${L - 6}" y="${Y(v) + 4}" text-anchor=end class=tk>${v.toFixed(0)}</text>`).join("");
      draw.innerHTML = `<p class=drawq>${c.flag} ${tr("draw.q", { s: T.mat(c.head), c: cname(c), a: qlabel(dates[k0], c.step), b: qlabel(dates[n - 1], c.step) })}</p>
        <svg viewBox="0 0 ${W} ${H}" class=drawsvg role=img aria-label="${tr("draw.h")}">
          <rect class=zone x="${X(k0)}" y="${T0}" width="${X(n - 1) - X(k0)}" height="${H - T0 - B}"/><text class=zonet x="${(X(k0) + X(n - 1)) / 2}" y="${T0 + 22}" text-anchor=middle>${tr("draw.hint")}</text>
          ${yt}${ticks}<polyline class=known points="${line(range(0, k0), i => vals[i])}"/>
          <polyline class=guess points=""/><polyline class=actual points=""/><polyline class=fcline points=""/></svg>
        <div class=drawfoot><button class="btn primary" id=reveal disabled>${tr("draw.reveal")}</button><p class=drawres aria-live=polite></p></div>`;
      const svg = $("svg", draw), gl = $(".guess", svg), btn = $("#reveal");
      const paint = () => { let last = k0; while (last + 1 < n && guess[last + 1] != null) last++;
        gl.setAttribute("points", line(range(k0, last), i => guess[i])); btn.disabled = last < n - 1 || !!saved; };
      function reveal(first) { $(".zonet", svg).textContent = ""; const act = $(".actual", svg);
        act.setAttribute("points", line(range(k0, n - 1), i => vals[i]));
        $(".fcline", svg).setAttribute("points", line(range(n - 1, N - 1), i => i < n ? vals[i] : fc[i - n]));
        const err = range(k0 + 1, n - 1).reduce((s, i) => s + Math.abs(guess[i] - vals[i]) / vals[k0] * 100, 0) / hideN;
        const score = Math.max(0, Math.round(100 - 25 * err));
        if (first) { saved = { date: today, guess, score }; store.set("cio-draw", saved); track("draw", k); }
        btn.hidden = true;
        $(".drawres", draw).innerHTML = `<b>${tr("draw.score", { n: score })}</b> ${tr("draw.off", { x: err.toFixed(1) })} ${tr("draw.fc")}
          <br><button class=btn id=drawshare>${tr("gm.share")}</button> <span class=muted>${tr("draw.done")}</span>`;
        $("#drawshare").onclick = async () => { const text = `CiO Draw it ${today}: ${score}/100 on ${cname(c)}'s construction prices.`;
          try { if (navigator.share) await navigator.share({ text }); else { await navigator.clipboard.writeText(text); $("#drawshare").textContent = tr("gm.copied"); } } catch (e) { /* cancelled */ } }; }
      if (saved) { paint(); reveal(false); }
      else {
        let down = false, prev = null;
        const at = ev => { const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; const q = pt.matrixTransform(svg.getScreenCTM().inverse());
          const i = Math.round((q.x - L) / ((W - L - R) / (N - 1))); return { i: Math.max(k0 + 1, Math.min(n - 1, i)), v: V(Math.max(T0, Math.min(H - B, q.y))), x: q.x }; };
        const put = ev => { const a = at(ev); if (a.x < X(k0) - 10) return;
          if (prev && prev.i !== a.i) { const s = Math.sign(a.i - prev.i); for (let i = prev.i + s; i !== a.i; i += s) guess[i] = prev.v + (a.v - prev.v) * (i - prev.i) / (a.i - prev.i); }
          guess[a.i] = a.v; for (let i = k0 + 1; i < a.i; i++) if (guess[i] == null) guess[i] = guess[i - 1]; prev = a; paint(); };
        svg.addEventListener("pointerdown", ev => { down = true; prev = null; svg.setPointerCapture(ev.pointerId); put(ev); });
        svg.addEventListener("pointermove", ev => { if (down) put(ev); });
        svg.addEventListener("pointerup", () => { down = false; });
        btn.onclick = () => reveal(true); paint(); }
    }
  }

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
