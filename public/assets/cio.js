/* CiO Costs — translations (English source text lives in the page; Kiswahili and French here).
   Draft translations: have native speakers review before launch.
   Static text: elements with data-i18n="key" (data-i18n-ph for placeholders, data-cc for country names).
   Dynamic text: I18N.t("key", {vars}). Months and country names come from the browser (Intl). */
window.I18N = (function () {
  "use strict";
  const D = {
    sw: {
      "fd.basehelp": "Base Date = siku 28 kabla ya tarehe ya mwisho ya kuwasilisha Zabuni (kama ilivyoandikwa kwenye mkataba).", "fd.cannot": "Haiwezi kukokotolewa: fahirisi inakosekana kwa Base Date au tarehe ya fahirisi (au fahirisi uliyoandika iko tupu).", "fd.flag.latest": "Fahirisi ya tarehe hii bado haijachapishwa: ya karibuni zaidi imetumika; rekebisha itakapochapishwa.", "fd.flag.manual": "Andika thamani zote mbili (I₀ na Iₙ) kwa fahirisi uliyoingiza mwenyewe.", "fd.flag.missing": "Fahirisi haipatikani kwa mojawapo ya tarehe.", "fd.flag.provisional": "Inatumia thamani ya muda ya CiO: kokotoa upya fahirisi rasmi ikichapishwa (FIDIC inaruhusu marekebisho kurekebishwa).", "fd.formula": "Pₙ = a + Σ kiwango × Iₙ / I₀ (FIDIC 13.7 / 13.8). I₀: fahirisi ya Base Date; Iₙ: fahirisi siku 49 kabla ya mwisho wa kipindi cha IPC.", "fd.l1": "Fahirisi: mwezi wa Base Date unatoa I₀; mwezi ulio siku 49 kabla ya mwisho wa kila kipindi cha IPC unatoa Iₙ (fahirisi za robo mwaka: robo hiyo). Fahirisi ikiwa bado haijachapishwa, ya karibuni zaidi hutumika na mstari huwekewa alama, ili urekebishwe baadaye kama FIDIC inavyoruhusu.", "fd.l2": "Nchi zisizo na fahirisi rasmi (Nigeria, Rwanda, Tanzania, Zambia): tumia makadirio ya CiO ya gharama za uagizaji kwa vifaa vinavyoagizwa, au andika thamani za fahirisi yoyote inayotajwa na mkataba wako (kwa mfano CPI ya taifa kwa kazi).", "fd.lede": "Kwa njia ya FIDIC (Kifungu 13.7 cha vitabu vya 2017, 13.8 cha 1999): weka Jedwali la fahirisi za gharama kutoka Contract Data, Base Date na thamani ya kazi katika kila IPC. CiO Costs hutafuta fahirisi na kukokotoa kila marekebisho.", "fd.line": "Marekebisho = (Pₙ − 1) × thamani ya kazi = ({p} − 1) × {v} = {a}", "fd.s2d": "Inakili kutoka Contract Data. Viwango, pamoja na sehemu isiyobadilika, lazima vijumlishe 1.00.", "fd.s3d": "Thamani ya kazi iliyothibitishwa katika kila kipindi, bila vitu vilivyothaminiwa kwa bei za sasa, kazi za kutwa na kiasi cha akiba.", "tr.d": "Kila utabiri unaochapishwa na tovuti huhifadhiwa. Takwimu rasmi zikitoka, hukaguliwa hapa moja kwa moja: je, ulikuwa ndani ya kiwango, na ulikosea kwa kiasi gani ukilinganisha na kudhani hakuna mabadiliko?", "tr.none": "Hakuna utabiri uliohifadhiwa uliofikia takwimu zake rasmi bado. Ukaguzi wa kwanza utaonekana takwimu zinazofuata zikitoka (nchi za ulinganisho kila mwezi, UBOS na Stats SA kila mwezi, KNBS kila robo mwaka).",
      "nav.notes": "Taarifa za wiki", "note.line": "Taarifa ya wiki hii, kwa maneno rahisi:", "note.week": "Taarifa ya wiki hii", "note.earlier": "Za awali:", "note.read": "Soma taarifa →", "notes.eyebrow": "Bure · kila wiki", "notes.h": "Taarifa za wiki", "notes.lede": "Taarifa fupi kwa kila nchi, kwa maneno rahisi: kinachotarajiwa kutokea kwa gharama za ujenzi katika miezi mitatu ijayo, maana yake kwa pesa yako, na bei za kufuatilia. Mabadiliko katika taarifa hupimwa kuanzia leo.", "notes.bench": "Nchi za ulinganisho", "notes.benchd": "Nchi zenye takwimu rasmi nzuri, zinazotumika kuonyesha jinsi mbinu inavyofanya kazi.", "lp.t3": "Taarifa kwa maneno rahisi kila wiki",
      "lp.sub2": "Takwimu rasmi huchelewa kwa miezi. Ona mabadiliko yanayotarajiwa ya gharama za ujenzi kwa tarehe yoyote ndani ya mwaka ujao, pamoja na kiwango.", "lp.t1": "Imejaribiwa kwa miezi 48 ya takwimu rasmi", "lp.t2": "Vyanzo: UBOS, KNBS, Stats SA na vingine 8", "mat.steady": "Thabiti", "mat.range": "Huenda kati ya {lo} na {hi}", "mat.steadynote": "Thabiti: katika majaribio yetu hakuna kilichotabiri hivi vizuri kuliko “hakuna mabadiliko”. Weka kipanya kuona kiwango.",
      "cr.eyebrow": "CiO Costs Pro · jaribu bure mara moja kwa siku", "cr.h": "Soma data ya marekebisho kutoka mkataba wangu", "cr.d": "Pakia Contract Data au Particular Conditions (PDF, hadi kurasa 80). Msaidizi wa CiO hupata Base Date na Jedwali la fahirisi za gharama, pamoja na ukurasa na maneno kwa kila thamani, na kuyakagua dhidi ya hati. Unakagua thamani kabla hazijajaza fomu.", "cr.file": "Mkataba (PDF)", "cr.code": "Msimbo wa Pro (si lazima)", "cr.go": "Usome", "cr.wait": "Inasoma… inaweza kuchukua hadi dakika moja.", "cr.priv": "Faili lako husomwa kisha kufutwa; halihifadhiwi. Hutumwa kwa Anthropic (Claude) ili lisomwe.", "cr.err": "Imeshindwa kusoma faili. Tafadhali jaribu tena.", "cr.found": "Kilichopatikana kwenye mkataba", "cr.none": "Hakuna marekebisho ya bei yaliyopatikana", "cr.base": "Base Date", "cr.fixed": "Sehemu isiyobadilika (a)", "cr.idx": "Kwenye mkataba", "cr.check": "Ukaguzi", "cr.use": "Tumia thamani hizi", "cr.sumok": "Viwango vinajumlisha 1 ✓", "cr.sumbad": "Viwango vinajumlisha {s}, si 1: vikague dhidi ya mkataba.", "cr.used": "Imejazwa hapa chini. Kagua kila thamani dhidi ya mkataba kabla ya kuitegemea.",
      "lp.eyebrow": "Utabiri wa gharama za ujenzi · nchi 7 za Afrika", "lp.h": "Je, bei ya {m} itapanda {city}?", "lp.m1": "saruji", "lp.m2": "nondo", "lp.m3": "dizeli", "lp.m4": "mchanga", "lp.sub": "Takwimu rasmi huchelewa kwa miezi. CiO Costs inaziba pengo: mabadiliko yanayotarajiwa ya gharama za ujenzi kwa tarehe unayochagua, pamoja na kiwango, yakisasishwa kila baada ya saa chache kutoka takwimu rasmi, mafuta na sarafu.", "lp.cta": "Ona utabiri", "lp.cta2": "Pata utabiri wa kila wiki kwenye WhatsApp", "lp.f1": "Imejaribiwa kwa miezi 48", "lp.f1d": "ya takwimu rasmi, katika nchi 6 za ulinganisho", "lp.f2": "Husasishwa kila saa 3", "lp.f3": "Jinsi inavyofanya kazi, kwa kina →", "lp.f4": "bei zilizoripotiwa", "lp.f4d": "mwezi huu, na", "lp.f4p": "watu", "lp.src": "Takwimu kutoka", "lp.pe": "Tatizo", "lp.ph": "Kupanga bei za ujenzi hakupaswi kuwa kubahatisha", "lp.p1": "Takwimu rasmi huchelewa kwa miezi", "lp.p1d": "Ofisi za takwimu huchapisha miezi baada ya bei kubadilika, kwa hivyo takwimu rasmi ya karibuni tayari imepitwa na wakati unapopanga bei.", "lp.p2": "Nukuu huisha kabla hujasaini", "lp.p2d": "Saruji, nondo na dizeli hubadilika zabuni ikiwa wazi, na akiba ya dharura ni kubahatisha.", "lp.p3": "Marekebisho ya bei ni vigumu kukubaliana", "lp.p3d": "Bila fahirisi ambayo pande zote zinaweza kukagua, kila cheti cha malipo kinakuwa majadiliano.", "lp.he": "Jinsi inavyofanya kazi", "lp.hh": "Hatua tatu, bure wakati wa majaribio", "lp.s1": "Chagua nchi yako na tarehe", "lp.s1d": "Mwezi ujao, miezi mitatu ijayo, au tarehe yoyote hadi mwaka mmoja mbele.", "lp.s1g": "Ona utabiri →", "lp.s2": "Ona mabadiliko yanayotarajiwa na kiwango chake", "lp.s2d": "Kwa soko zima na kila kifaa, pamoja na kiwango na kinachosukuma.", "lp.s2g": "Gharama kwa kifaa →", "lp.s3": "Itumie katika zabuni au IPC yako", "lp.s3d": "Panga bei ya jedwali la kiasi, au hesabu marekebisho ya bei ya FIDIC kwa cheti cha malipo.", "lp.s3g": "Zabuni na mikataba →", "fc.eyebrow": "Utabiri wako", "fc.h": "Je, gharama za ujenzi zitapanda unapofanya kazi?",
      "ft.methodology": "Mbinu", "ft.terms": "Masharti", "ft.privacy": "Faragha",
      "tr.h": "Rekodi ya usahihi ya moja kwa moja", "tr.n": "Utabiri uliokaguliwa", "tr.in": "Ndani ya kiwango (lengo 80%)", "tr.miss": "Wastani wa kukosea, yetu / hakuna mabadiliko", "tr.csv": "Pakua ukaguzi wote (CSV)", "si.reported": "Imeripotiwa na wanunuzi (watu 3+ kwa mwezi)",
      "mm.main": "modeli kuu", "mm.tipmain": "Utabiri kutoka modeli kuu ya CiO ya nchi hii (muundo wa fahirisi, mafuta, sarafu, mvua, mabadiliko ya kodi).",
      "si.h": "Bei za bidhaa moja moja", "si.latest": "Ya karibuni", "si.chg": "Mabadiliko kwa mwezi", "si.trend": "Miezi 12", "si.src": "Chanzo", "si.notice": "tangazo rasmi", "si.idx": "fahirisi", "si.good": "Makadirio ya CiO, yamejaribiwa", "si.rough": "Makadirio ya CiO, ya jumla",
      "pro.eyebrow": "CiO Costs Pro · inakuja hivi karibuni", "pro.h": "Kwa mikataba yenye vyeti vingi vya malipo", "pro.f1": "IPC zisizo na kikomo, kwa muda wote wa mkataba", "pro.f2": "Mikataba iliyohifadhiwa, ikishirikiwa na mteja au mshauri wako", "pro.f3": "Taarifa zenye nembo yako, tayari kuambatisha kwa kila IPC", "pro.f4": "Marekebisho ya moja kwa moja fahirisi ya muda ikibadilishwa na rasmi", "pro.f5": "Fahirisi kwa kifaa na mji, pamoja na historia kamili na mtiririko wa data", "pro.email": "Barua pepe", "pro.org": "Shirika (si lazima)", "pro.role": "Wewe ni", "pro.r1": "Mkandarasi", "pro.r2": "Mshauri / mkadiriaji wa kiasi", "pro.r3": "Mteja / mwajiri", "pro.r4": "Mkopeshaji au bima", "pro.r5": "Nyingine", "pro.consent": "Nitumie barua pepe Pro ikiwa tayari. Hakuna barua taka; bofya mara moja kuacha.", "pro.join": "Jiunge na orodha ya kusubiri", "pro.thanks": "Uko kwenye orodha ✓ Tutakutumia barua pepe Pro ikifunguliwa.", "pro.free": "Bure: hadi IPC {n} kwa kila mkataba.", "pro.cap": "Toleo la bure linashughulikia IPC {n} kwa kila mkataba.", "pro.more": "Zaidi na CiO Costs Pro →",
      "th.cidx": "Fahirisi ya bei", "fd.crowd": "Bei zilizoripotiwa: {i} (CiO)",
      "fd.h": "Marekebisho ya bei kwa Cheti cha Malipo ya Muda (IPC)", "fd.s1": "Mkataba", "fd.base": "Tarehe ya Msingi", "fd.s2": "Jedwali la fahirisi za gharama", "fd.el": "Kipengele", "fd.coef": "Kigawo", "fd.src": "Fahirisi", "fd.addel": "Ongeza kipengele", "fd.s3": "Vyeti vya Malipo ya Muda", "fd.end": "Kipindi kinaisha", "fd.value": "Thamani ya kazi", "fd.idate": "Tarehe ya fahirisi (−siku 49)", "fd.adj": "Marekebisho", "fd.total": "Jumla ya marekebisho ya bei", "fd.addipc": "Ongeza IPC", "fd.print": "Chapisha taarifa ya marekebisho", "fd.csv": "Pakua fahirisi (CSV)", "fd.fixed": "Isiyobadilika (haitarekebishwa)", "fd.statement": "Taarifa ya marekebisho ya bei", "fd.overall": "Fahirisi ya jumla ya vifaa vya ujenzi (rasmi)", "fd.estimate": "Makadirio ya CiO ya gharama za uagizaji", "fd.manual": "Fahirisi nyingine — andika thamani", "fd.othermat": "Vifaa vingine (fahirisi ya jumla)", "fd.imported": "Vifaa vya kuagiza (makadirio ya CiO)", "fd.newel": "Kipengele kipya", "fd.notadj": "hairekebishwi", "fd.sumwarn": "lazima iwe 1.00", "fd.weighted": "Uzito", "fd.seeidx": "Ona fahirisi ya jumla mwezi kwa mwezi",
      "rep.sum": "{c}: bidhaa {n} kati ya {m} zina bei ya kawaida hadi sasa. Gusa bidhaa kuiripoti.", "rep.people": "watu {n}", "rep.vsprev": "dhidi ya miezi 2 iliyotangulia", "rep.per": "kwa {u}",
      "boq.imported": "Vifaa vya kuagiza (makadirio ya CiO)", "boq.local": "Kifaa cha ndani — makisio yangu", "boq.labour": "Kazi — makisio yangu", "boq.assume": "Mabadiliko yanayotarajiwa, % kwa mwaka", "boq.peryear": "% kwa mwaka", "boq.kind.idx": "{c} inachapisha fahirisi rasmi za bei kwa kila kifaa ({o}). Kila mstari unafuata utabiri wa kifaa chake.", "boq.kind.est": "{c} haina fahirisi rasmi ya bei kwa kila kifaa. Vifaa vya kuagiza vinafuata makadirio ya CiO (mafuta na sarafu). Kwa vifaa vya ndani na kazi, weka mabadiliko unayotarajia kwa mwaka — bei zinazoripotiwa zitachukua nafasi hii zikiingia.", "ci.mode": "Fahirisi", "ci.one": "Fahirisi moja ya jumla", "ci.multi": "Fahirisi moja kwa kila kifaa", "ci.wnote": "Uzito: sehemu ya kiasi kinachorekebishwa inayofungwa na kila kifaa (vinapimwa kujumlisha).", "ci.nomonth": "Hakuna fahirisi ya {m} katika miezi uliyochagua: chagua miezi mingine au weka uzito 0.", "ci.multif": "Kanuni ya fahirisi nyingi: kiasi × (a + Σ wᵢ × Iᵢ₁ / Iᵢ₀), fahirisi rasmi ya kila kifaa (msingi 100).",
      "mm.model": "modeli ya visababishi", "mm.nochange": "hakuna mabadiliko", "mm.tipmodel": "Utabiri kutoka kinachosukuma bei ya kifaa hiki: {how}.", "mm.tipnc": "Hakuna kisababishi kilichoshinda “hakuna mabadiliko” katika majaribio, kwa hivyo utabiri ni hakuna mabadiliko, pamoja na kiwango kilichojaribiwa.", "mm.test": "Imejaribiwa kwa vipindi {n} ambavyo haikuona: ndani ya kiwango mara {p}%; makosa madogo kwa {r}% kuliko “hakuna mabadiliko”.",
      "dv.usdidx": "Dola ya Marekani dhidi ya sarafu kuu (fahirisi)", "dv.usdup": "imeimarika katika miezi 3 — bidhaa za kuagiza zinagharimu kidogo", "dv.usddown": "imedhoofika katika miezi 3 — bidhaa za kuagiza zinagharimu zaidi",
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
      "q.official": "Je, gharama za ujenzi nchini {c} zitapanda kufikia {when}?",
      "q.indicator": "Je, gharama za uagizaji zitapandisha gharama za ujenzi nchini {c} kufikia {when}?",
      "adv.up": "Ongeza takriban {x} kwenye bei za leo kwa kazi zinazopangwa hadi {when}.",
      "adv.down": "Bei zinaweza kushuka takriban {x} kufikia {when} — fikiria kuchelewesha manunuzi makubwa.",
      "adv.flat": "Mabadiliko madogo yanatarajiwa hadi {when} — bei za leo ni mwongozo mzuri.",
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
      "fd.basehelp": "Date de référence = 28 jours avant la date limite de remise des offres (comme indiqué dans le contrat).", "fd.cannot": "Calcul impossible : un indice manque pour la Date de référence ou la date d'indice (ou un indice saisi est vide).", "fd.flag.latest": "L'indice de cette date n'est pas encore publié : le dernier disponible est utilisé ; à réviser à sa publication.", "fd.flag.manual": "Saisissez les deux valeurs (I₀ et Iₙ) de l'indice entré à la main.", "fd.flag.missing": "Un indice n'est pas disponible pour l'une des dates.", "fd.flag.provisional": "Utilise une valeur provisoire de CiO : recalculez à la publication de l'indice officiel (FIDIC permet de réviser l'ajustement).", "fd.formula": "Pₙ = a + Σ coefficient × Iₙ / I₀ (FIDIC 13.7 / 13.8). I₀ : indice de la Date de référence ; Iₙ : indice 49 jours avant la fin de la période du décompte.", "fd.l1": "Indices : le mois de la Date de référence donne I₀ ; le mois situé 49 jours avant la fin de chaque période de décompte donne Iₙ (indices trimestriels : ce trimestre). Si un indice n'est pas encore publié, le dernier est utilisé et la ligne est signalée, pour être révisée ensuite comme FIDIC le permet.", "fd.l2": "Pays sans indices officiels (Nigeria, Rwanda, Tanzanie, Zambie) : utilisez l'estimation CiO des coûts d'importation pour les intrants importés, ou saisissez les valeurs de l'indice que votre contrat désigne (par exemple un IPC national pour la main-d'œuvre).", "fd.lede": "À la manière FIDIC (sous-clause 13.7 des livres 2017, 13.8 de 1999) : saisissez le tableau d'indexation des Données du contrat, la Date de référence et la valeur des travaux de chaque décompte. CiO Costs trouve les indices et calcule chaque ajustement.", "fd.line": "Ajustement = (Pₙ − 1) × valeur des travaux = ({p} − 1) × {v} = {a}", "fd.s2d": "Recopiez-le depuis les Données du contrat. Les coefficients, partie fixe comprise, doivent faire 1,00 au total.", "fd.s3d": "Valeur des travaux certifiés pour chaque période, hors éléments évalués aux prix courants, travaux en régie et sommes provisionnelles.", "tr.d": "Chaque prévision publiée par le site est enregistrée. Quand le chiffre officiel sort, elle est vérifiée ici automatiquement : était-elle dans la fourchette, et quelle était l'erreur par rapport à l'hypothèse « pas de changement » ?", "tr.none": "Aucune prévision enregistrée n'a encore atteint sa publication officielle. Les premières vérifications apparaîtront avec les prochains chiffres (pays de référence chaque mois, UBOS et Stats SA chaque mois, KNBS chaque trimestre).",
      "nav.notes": "Notes hebdo", "note.line": "La note de la semaine, en mots simples :", "note.week": "La note de la semaine", "note.earlier": "Précédentes :", "note.read": "Lire la note →", "notes.eyebrow": "Gratuit · chaque semaine", "notes.h": "Notes hebdomadaires", "notes.lede": "Une courte note par pays, en mots simples : ce qui devrait arriver aux coûts de construction dans les trois prochains mois, ce que cela signifie pour votre budget, et les prix à surveiller. Les variations des notes sont mesurées à partir d'aujourd'hui.", "notes.bench": "Pays de référence", "notes.benchd": "Pays aux bonnes données officielles, utilisés pour montrer la performance de la méthode.", "lp.t3": "Une note en mots simples chaque semaine",
      "lp.sub2": "Les chiffres officiels arrivent avec des mois de retard. Voyez la variation attendue des coûts de construction à toute date de l'année à venir, avec une fourchette.", "lp.t1": "Testé sur 48 mois de données officielles", "lp.t2": "Sources : UBOS, KNBS, Stats SA et 8 autres", "mat.steady": "Stable", "mat.range": "Probablement entre {lo} et {hi}", "mat.steadynote": "Stable : dans nos tests, rien n'a prévu ces prix mieux que « pas de changement ». Survolez pour la fourchette.",
      "cr.eyebrow": "CiO Costs Pro · essai gratuit une fois par jour", "cr.h": "Lire les données de révision dans mon contrat", "cr.d": "Téléversez les Données du contrat ou les Conditions particulières (PDF, 80 pages au plus). L'assistant de CiO trouve la Date de référence et le tableau d'indexation, avec la page et les mots de chaque valeur, et les vérifie dans le document. Vous vérifiez les valeurs avant qu'elles remplissent le formulaire.", "cr.file": "Contrat (PDF)", "cr.code": "Code Pro (facultatif)", "cr.go": "Lire", "cr.wait": "Lecture… cela peut prendre jusqu'à une minute.", "cr.priv": "Votre fichier est lu puis supprimé ; il n'est jamais conservé. Il est envoyé à Anthropic (Claude) pour être lu.", "cr.err": "Impossible de lire le fichier. Veuillez réessayer.", "cr.found": "Trouvé dans le contrat", "cr.none": "Aucune révision des prix trouvée", "cr.base": "Date de référence", "cr.fixed": "Partie fixe (a)", "cr.idx": "Dans le contrat", "cr.check": "Vérification", "cr.use": "Utiliser ces valeurs", "cr.sumok": "Les coefficients font 1 au total ✓", "cr.sumbad": "Les coefficients font {s} au total, pas 1 : vérifiez-les dans le contrat.", "cr.used": "Rempli ci-dessous. Vérifiez chaque valeur dans le contrat avant de vous y fier.",
      "lp.eyebrow": "Prévisions des coûts de construction · 7 pays africains", "lp.h": "Le prix {m} va-t-il augmenter à {city} ?", "lp.m1": "du ciment", "lp.m2": "de l'acier", "lp.m3": "du gazole", "lp.m4": "du sable", "lp.sub": "Les chiffres officiels arrivent avec des mois de retard. CiO Costs comble l'écart : la variation attendue des coûts de construction à la date choisie, avec une fourchette, mise à jour toutes les quelques heures à partir des données officielles, du pétrole et des taux de change.", "lp.cta": "Voir la prévision", "lp.cta2": "Recevoir la prévision hebdomadaire sur WhatsApp", "lp.f1": "Testé sur 48 mois", "lp.f1d": "de données officielles, dans 6 pays de référence", "lp.f2": "Mis à jour toutes les 3 heures", "lp.f3": "La méthode en détail →", "lp.f4": "prix signalés", "lp.f4d": "ce mois-ci, par", "lp.f4p": "personnes", "lp.src": "Données de", "lp.pe": "Le problème", "lp.ph": "Chiffrer la construction ne devrait pas être un pari", "lp.p1": "Les chiffres officiels arrivent tard", "lp.p1d": "Les instituts statistiques publient des mois après que les prix ont bougé : le dernier chiffre officiel est déjà dépassé quand vous chiffrez.", "lp.p2": "Les devis expirent avant la signature", "lp.p2d": "Ciment, acier et gazole bougent pendant l'appel d'offres, et la provision pour aléas est une supposition.", "lp.p3": "La révision des prix est difficile à convenir", "lp.p3d": "Sans indice vérifiable par les deux parties, chaque décompte devient une négociation.", "lp.he": "Comment ça marche", "lp.hh": "Trois étapes, gratuit pendant le pilote", "lp.s1": "Choisissez votre pays et une date", "lp.s1d": "Le mois prochain, dans trois mois, ou toute date jusqu'à un an.", "lp.s1g": "Voir la prévision →", "lp.s2": "Voyez la variation attendue et sa fourchette", "lp.s2d": "Pour l'ensemble du marché et chaque matériau, avec une fourchette et ce qui la fait bouger.", "lp.s2g": "Coûts par matériau →", "lp.s3": "Utilisez-la dans votre offre ou votre IPC", "lp.s3d": "Chiffrez un devis quantitatif, ou calculez une révision des prix FIDIC pour un décompte.", "lp.s3g": "Offres et contrats →", "fc.eyebrow": "Votre prévision", "fc.h": "Les coûts de construction vont-ils augmenter là où vous travaillez ?",
      "ft.methodology": "Méthodologie", "ft.terms": "Conditions", "ft.privacy": "Confidentialité",
      "tr.h": "Historique en direct", "tr.n": "Prévisions vérifiées", "tr.in": "Dans la fourchette (objectif 80 %)", "tr.miss": "Erreur moyenne, la nôtre / sans changement", "tr.csv": "Télécharger toutes les vérifications (CSV)", "si.reported": "Signalé par des acheteurs (3+ personnes par mois)",
      "mm.main": "modèle principal", "mm.tipmain": "Prévision du modèle principal de CiO pour ce pays (structure de l'indice, pétrole, change, pluie, changements fiscaux).",
      "si.h": "Prix d'articles particuliers", "si.latest": "Dernier", "si.chg": "Variation sur le mois", "si.trend": "12 mois", "si.src": "Source", "si.notice": "avis officiel", "si.idx": "indice", "si.good": "Estimation CiO, testée", "si.rough": "Estimation CiO, approximative",
      "pro.eyebrow": "CiO Costs Pro · bientôt", "pro.h": "Pour les contrats à nombreux décomptes", "pro.f1": "Décomptes (IPC) illimités, pour toute la durée du contrat", "pro.f2": "Contrats enregistrés, partagés avec votre client ou consultant", "pro.f3": "États à votre en-tête, prêts à joindre à chaque IPC", "pro.f4": "Révision automatique quand un indice provisoire est remplacé par l'officiel", "pro.f5": "Indices par matériau et par ville, historique complet et flux de données", "pro.email": "E-mail", "pro.org": "Organisation (facultatif)", "pro.role": "Vous êtes", "pro.r1": "Entreprise", "pro.r2": "Consultant / économiste de la construction", "pro.r3": "Maître d'ouvrage", "pro.r4": "Prêteur ou assureur", "pro.r5": "Autre", "pro.consent": "Prévenez-moi par e-mail quand Pro sera prêt. Pas de spam ; désinscription en un clic.", "pro.join": "Rejoindre la liste d'attente", "pro.thanks": "Vous êtes sur la liste ✓ Nous vous écrirons à l'ouverture de Pro.", "pro.free": "Gratuit : jusqu'à {n} IPC par contrat.", "pro.cap": "La version gratuite couvre {n} IPC par contrat.", "pro.more": "Plus avec CiO Costs Pro →",
      "th.cidx": "Indice des prix", "fd.crowd": "Prix signalés : {i} (CiO)",
      "fd.h": "Révision des prix d'un décompte provisoire (IPC)", "fd.s1": "Contrat", "fd.base": "Date de référence", "fd.s2": "Tableau d'indexation des coûts", "fd.el": "Élément", "fd.coef": "Coefficient", "fd.src": "Indice", "fd.addel": "Ajouter un élément", "fd.s3": "Décomptes provisoires (IPC)", "fd.end": "Fin de période", "fd.value": "Valeur des travaux", "fd.idate": "Date d'indice (−49 jours)", "fd.adj": "Révision", "fd.total": "Révision totale des prix", "fd.addipc": "Ajouter un IPC", "fd.print": "Imprimer l'état de révision", "fd.csv": "Télécharger l'indice (CSV)", "fd.fixed": "Partie fixe (non révisée)", "fd.statement": "État de révision des prix", "fd.overall": "Indice global des intrants de construction (officiel)", "fd.estimate": "Estimation CiO des coûts d'importation", "fd.manual": "Autre indice — saisir les valeurs", "fd.othermat": "Autres matériaux (indice global)", "fd.imported": "Intrants importés (estimation CiO)", "fd.newel": "Nouvel élément", "fd.notadj": "non révisé", "fd.sumwarn": "doit faire 1,00", "fd.weighted": "Pondéré", "fd.seeidx": "Voir l'indice global mois par mois",
      "rep.sum": "{c} : {n} articles sur {m} ont déjà un prix habituel. Touchez un article pour le signaler.", "rep.people": "{n} personnes", "rep.vsprev": "vs 2 mois précédents", "rep.per": "par {u}",
      "boq.imported": "Matériaux importés (estimation CiO)", "boq.local": "Matériau local — mon hypothèse", "boq.labour": "Main-d'œuvre — mon hypothèse", "boq.assume": "Variation attendue, % par an", "boq.peryear": "% par an", "boq.kind.idx": "{c} publie des indices officiels de prix pour chaque matériau ({o}). Chaque ligne suit la prévision de son matériau.", "boq.kind.est": "{c} n'a pas d'indice officiel par matériau. Les matériaux importés suivent l'estimation CiO (pétrole et change). Pour les matériaux locaux et la main-d'œuvre, indiquez la variation attendue par an — les prix signalés la remplaceront au fur et à mesure.", "ci.mode": "Indice", "ci.one": "Un indice global", "ci.multi": "Un indice par matériau", "ci.wnote": "Pondérations : part de la partie révisable liée à chaque matériau (ramenées à 100 %).", "ci.nomonth": "Pas d'indice pour {m} aux mois choisis : choisissez d'autres mois ou mettez son poids à 0.", "ci.multif": "Formule multi-indices : montant × (a + Σ wᵢ × Iᵢ₁ / Iᵢ₀), indice officiel de chaque matériau (base 100).",
      "mm.model": "modèle à facteurs", "mm.nochange": "sans changement", "mm.tipmodel": "Prévision à partir de ce qui fait bouger ce matériau : {how}.", "mm.tipnc": "Aucun facteur n'a battu « sans changement » pour ce matériau lors des tests : la prévision est sans changement, avec une fourchette testée.", "mm.test": "Testé sur {n} périodes jamais vues : dans la fourchette {p} % du temps ; erreurs {r} % plus petites que « sans changement » (négatif = plus grandes).",
      "dv.usdidx": "Dollar US face aux grandes devises (indice)", "dv.usdup": "plus fort en 3 mois — importations un peu moins chères", "dv.usddown": "plus faible en 3 mois — importations plus chères",
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
      "q.official": "{c} : les coûts de construction vont-ils augmenter d'ici {when} ?",
      "q.indicator": "{c} : les coûts d'importation vont-ils faire monter les coûts de construction d'ici {when} ?",
      "adv.up": "Prévoyez environ {x} sur les devis d'aujourd'hui pour les travaux chiffrés jusqu'à {when}.",
      "adv.down": "Les prix pourraient baisser d'environ {x} d'ici {when} — envisagez de reporter les gros achats.",
      "adv.flat": "Peu de changement attendu jusqu'à {when} — les prix d'aujourd'hui restent un bon repère.",
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
      "nav.notes": "Weekly notes", "note.line": "This week's note, in plain words:", "note.week": "This week's note", "note.earlier": "Earlier:", "note.read": "Read the note →", "notes.eyebrow": "Free · every week", "notes.h": "Weekly notes", "notes.lede": "A short note for each country, in plain words: what is likely to happen to construction costs in the next three months, what it means for your money, and the prices to watch. Changes in the notes are measured from today.", "notes.bench": "Benchmark countries", "notes.benchd": "Countries with good official data, used to show how the method performs.", "lp.t3": "A plain-language note every week",
      "lp.sub2": "Official figures arrive months late. See the expected change in construction costs for any date in the next year, with a likely range.", "lp.t1": "Tested on 48 months of official data", "lp.t2": "Sources: UBOS, KNBS, Stats SA and 8 more", "mat.steady": "Steady", "mat.range": "Likely between {lo} and {hi}", "mat.steadynote": "Steady: in our tests nothing forecast these better than “no change”. Hover for the likely range.",
      "cr.eyebrow": "CiO Costs Pro · try it free once a day", "cr.h": "Read the adjustment data from my contract", "cr.d": "Upload the Contract Data or Particular Conditions (PDF, up to 80 pages). CiO's assistant finds the Base Date and the Schedule of cost indexation, with the page and the words for each value, and checks them against the document. You check the values before they fill the form.", "cr.file": "Contract (PDF)", "cr.code": "Pro code (optional)", "cr.go": "Read it", "cr.wait": "Reading… this can take up to a minute.", "cr.priv": "Your file is read and then discarded; it is never stored. It is sent to Anthropic (Claude) to be read.", "cr.err": "Could not read the file. Please try again.", "cr.found": "Found in the contract", "cr.none": "No price adjustment found", "cr.base": "Base Date", "cr.fixed": "Fixed part (a)", "cr.idx": "In the contract", "cr.check": "Check", "cr.use": "Use these values", "cr.sumok": "The coefficients add up to 1 ✓", "cr.sumbad": "The coefficients add up to {s}, not 1: check them against the contract.", "cr.used": "Filled in below. Check each value against the contract before you rely on it.",
      "lp.eyebrow": "Construction cost forecasts · 7 African countries", "lp.h": "Will {m} prices rise in {city}?", "lp.m1": "cement", "lp.m2": "steel", "lp.m3": "diesel", "lp.m4": "sand", "lp.sub": "Official figures arrive months late. CiO Costs fills the gap: the expected change in construction costs for the date you choose, with a likely range, updated every few hours from official data, oil and exchange rates.", "lp.cta": "See the forecast", "lp.cta2": "Get the weekly forecast on WhatsApp", "lp.f1": "Tested on 48 months", "lp.f1d": "of official data, in 6 benchmark countries", "lp.f2": "Updated every 3 hours", "lp.f3": "How it works, in full →", "lp.f4": "prices reported", "lp.f4d": "this month, by", "lp.f4p": "people", "lp.src": "Data from", "lp.pe": "The problem", "lp.ph": "Pricing construction shouldn't be guesswork", "lp.p1": "Official figures arrive months late", "lp.p1d": "Statistics offices publish months after prices move, so the latest official figure is already out of date when you price.", "lp.p2": "Quotes expire before you sign", "lp.p2d": "Cement, steel and diesel move while a tender is open, and the contingency is a guess.", "lp.p3": "Price adjustment is hard to agree", "lp.p3d": "Without an index both sides can check, every payment certificate becomes a negotiation.", "lp.he": "How it works", "lp.hh": "Three steps, free during the pilot", "lp.s1": "Choose your country and date", "lp.s1d": "Next month, in three months, or any date up to a year ahead.", "lp.s1g": "See the forecast →", "lp.s2": "See the expected change and its range", "lp.s2d": "For the whole market and each material, with a likely range and what is driving it.", "lp.s2g": "Costs by material →", "lp.s3": "Use it in your bid or IPC", "lp.s3d": "Price a bill of quantities, or work out a FIDIC price adjustment for a payment certificate.", "lp.s3g": "Bids & contracts →", "fc.eyebrow": "Your forecast", "fc.h": "Will construction costs rise where you work?",
      "ft.methodology": "Methodology", "ft.terms": "Terms", "ft.privacy": "Privacy",
      "tr.h": "Live track record", "tr.d": "Every forecast the site publishes is saved. When the official figure comes out, it is checked here automatically: was it inside the likely range, and how far off was it compared with assuming no change?", "tr.n": "Forecasts checked", "tr.in": "Inside the range (aim 80%)", "tr.miss": "Average miss, ours / no change", "tr.csv": "Download every check (CSV)", "tr.none": "No saved forecast has reached its official release yet. The first checks appear as the next figures come out (benchmarks monthly, UBOS and Stats SA monthly, KNBS quarterly).", "si.reported": "Reported by buyers (3+ people a month)",
      "mm.main": "main model", "mm.tipmain": "Forecast from CiO's main model for this country (index structure, oil, exchange rate, rainfall, tax changes).",
      "si.h": "Prices of single items", "si.latest": "Latest", "si.chg": "Change on month", "si.trend": "12 months", "si.src": "Source", "si.notice": "official notice", "si.idx": "index", "si.good": "CiO estimate, tested", "si.rough": "CiO estimate, rough",
      "pro.eyebrow": "CiO Costs Pro · coming soon", "pro.h": "For contracts with many payment certificates", "pro.f1": "Unlimited IPCs, for the whole life of the contract", "pro.f2": "Saved contracts, shared with your client or consultant", "pro.f3": "Statements with your letterhead, ready to attach to each IPC", "pro.f4": "Automatic revision when a provisional index is replaced by the official one", "pro.f5": "Indices by material and city, with full history and a data feed", "pro.email": "Email", "pro.org": "Organisation (optional)", "pro.role": "You are", "pro.r1": "Contractor", "pro.r2": "Consultant / quantity surveyor", "pro.r3": "Client / employer", "pro.r4": "Lender or insurer", "pro.r5": "Other", "pro.consent": "Email me when Pro is ready. No spam; one click to stop.", "pro.join": "Join the waitlist", "pro.thanks": "You're on the list ✓ We'll email you when Pro opens.", "pro.free": "Free: up to {n} IPCs per contract.", "pro.cap": "The free version covers {n} IPCs per contract.", "pro.more": "More with CiO Costs Pro →",
      "th.cidx": "Price index", "fd.crowd": "Reported prices: {i} (CiO)",
      "fd.h": "Price adjustment for an Interim Payment Certificate", "fd.lede": "The FIDIC way (Sub-Clause 13.7 of the 2017 books, 13.8 of 1999): enter the Schedule of cost indexation from your Contract Data, the Base Date and the value of work in each IPC. CiO Costs looks up the indices and works out each adjustment.", "fd.s1": "Contract", "fd.base": "Base Date", "fd.basehelp": "Base Date = 28 days before the latest date for submitting the Tender (as stated in the contract).", "fd.s2": "Schedule of cost indexation", "fd.s2d": "Copy it from the Contract Data. The coefficients, including the fixed part, must add up to 1.00.", "fd.el": "Element", "fd.coef": "Coefficient", "fd.src": "Index", "fd.addel": "Add an element", "fd.s3": "Interim Payment Certificates", "fd.s3d": "Value of work certified in each period, without items valued at current prices, dayworks and provisional sums.", "fd.end": "Period ends", "fd.value": "Value of work", "fd.idate": "Index date (−49 days)", "fd.adj": "Adjustment", "fd.total": "Total price adjustment", "fd.addipc": "Add an IPC", "fd.print": "Print price adjustment statement", "fd.csv": "Download the index (CSV)", "fd.seeidx": "See the headline index month by month", "fd.overall": "Overall construction input index (official)", "fd.estimate": "CiO import-cost estimate", "fd.manual": "Other index — type the values", "fd.fixed": "Fixed (not adjusted)", "fd.othermat": "Other materials (overall index)", "fd.imported": "Imported inputs (CiO estimate)", "fd.newel": "New element", "fd.notadj": "not adjusted", "fd.sumwarn": "must be 1.00", "fd.statement": "Price adjustment statement", "fd.weighted": "Weighted", "fd.line": "Adjustment = (Pₙ − 1) × value of work = ({p} − 1) × {v} = {a}", "fd.cannot": "Cannot compute: an index is missing for the Base Date or the index date (or a typed index is empty).", "fd.flag.provisional": "Uses a provisional CiO value: recalculate when the official index is published (FIDIC allows the adjustment to be revised).", "fd.flag.latest": "The index for the index date is not published yet: the latest available is used; revise when it is published.", "fd.flag.missing": "An index is not available for one of the dates.", "fd.flag.manual": "Type both values (I₀ and Iₙ) for the index you entered by hand.", "fd.formula": "Pₙ = a + Σ coefficient × Iₙ / I₀ (FIDIC 13.7 / 13.8). I₀: index for the Base Date; Iₙ: index 49 days before the end of the IPC period.", "fd.l1": "Indices: the month of the Base Date gives I₀; the month 49 days before the end of each IPC period gives Iₙ (quarterly indices: that quarter). If an index is not yet published, the latest one is used and the line is marked, so it can be revised later as FIDIC allows.", "fd.l2": "Countries without official indices (Nigeria, Rwanda, Tanzania, Zambia): use the CiO import-cost estimate for imported inputs, or type in the values of whatever index your contract names (for example a national CPI for labour).",
      "home.h1": "Will construction costs rise where you work?",
      "rep.sum": "{c}: {n} of {m} items have a typical price so far. Tap an item to report it.", "rep.people": "{n} people", "rep.vsprev": "vs previous 2 months", "rep.per": "per {u}",
      "boq.imported": "Imported materials (CiO estimate)", "boq.local": "Local material — my assumption", "boq.labour": "Labour — my assumption", "boq.assume": "Expected change, % a year", "boq.peryear": "% a year", "boq.kind.idx": "{c} publishes official price indices for each material ({o}). Each line follows the forecast for its own material.", "boq.kind.est": "{c} has no official price index per material, so lines follow CiO's estimate for imported construction inputs (oil and the exchange rate). It does not include local materials or labour: mark a line as fixed price if it should not move.", "ci.mode": "Index", "ci.one": "One overall index", "ci.multi": "One index per material", "ci.wnote": "Weights: the share of the adjustable part tied to each material (they are scaled to add up).", "ci.nomonth": "No index for {m} in the chosen months: pick other months or set its weight to 0.", "ci.multif": "Multi-index formula: amount × (a + Σ wᵢ × Iᵢ₁ / Iᵢ₀), each material's own official index (rebased to 100).",
      "mm.model": "driver model", "mm.nochange": "no change", "mm.tipmodel": "Forecast from what drives this material: {how}.", "mm.tipnc": "No driver beat “no change” for this material in testing, so the forecast is no change, with a tested range.", "mm.test": "Tested on {n} periods it never saw: inside the range {p}% of the time; misses {r}% smaller than “no change” (negative = larger).",
      "dv.usdidx": "US dollar vs major currencies (index)", "dv.usdup": "stronger in 3 months — imports cost a little less", "dv.usddown": "weaker in 3 months — imports cost more",
      "bc.h1": "Bids & contracts", "bc.lede": "Before the job: price your bid with the expected change in material costs. During the job: adjust payments with a monthly index both sides can check.", "bc.bid": "Price a bid", "bc.adjust": "Adjust a payment", "bc.quick": "No bill of quantities? Quick estimate", "bc.pricebid": "Price a bid", "bc.useindex": "Use as contract index", "bc.add": "+ Add to my bill", "trend.test": "Tested on {n} past periods: the real change fell inside the range {p}% of the time.",
      "tip.fc": "forecast", "tip.exp": "Expected {x} from {base}", "tip.rng": "Likely range {lo} to {hi}", "tip.lvl": "Index", "tip.off": "published", "tip.mom": "on the previous period",
      "boq.eyebrow": "Free during the pilot · up to 10 lines", "boq.h": "Bill of quantities escalation", "boq.d": "Enter your lines at today's rates. Each line is matched to the forecast for that material, and you get the expected cost over the work period, with a likely range. Paste straight from Excel: description, quantity, unit, rate.", "boq.desc": "Description", "boq.qty": "Quantity", "boq.rate": "Rate today", "boq.series": "Price follows", "boq.today": "Amount today", "boq.exp": "Expected", "boq.total": "Total", "boq.add": "Add a line", "boq.paste": "Paste from Excel", "boq.csv": "Download CSV", "boq.del": "Remove line", "boq.limit": "Up to 10 lines free during the pilot. Larger bills, saved projects and branded PDFs are planned for CiO Costs Pro.", "boq.fixed": "Fixed price (no change)", "boq.descph": "e.g. Cement, 50 kg bag", "boq.sum": "Expected over {from} – {to}: {v} ({d} on today's rates). Likely range {lo} to {hi}.", "boq.empty": "Add quantities and today's rates to see the expected cost.", "boq.ex1": "Cement, 50 kg bag", "boq.ex1u": "bag", "boq.ex2": "Reinforcement steel, Y12", "boq.ex3": "Sand, per trip", "boq.ex3u": "trip", "ci.link": "Price adjustment index for contracts →", "ci.short": "Contract index", "ci.eyebrow": "Free during the pilot", "ci.h1": "A price adjustment index for contracts", "ci.lede": "Many construction contracts adjust payments when input prices move (price adjustment or fluctuation clauses). They need an index both sides can look up. Here is one for each pilot country, month by month, with a calculator.", "ci.month": "Month", "ci.index": "Index", "ci.chg": "Change", "ci.status": "Status", "ci.calc": "Adjust a payment", "ci.amount": "Amount to adjust", "ci.base": "Base month (tender)", "ci.val": "Valuation month", "ci.fixed": "Fixed part, not adjusted (%)", "ci.formula": "Formula: adjusted amount = amount × (a + b × I₁ / I₀), where a is the fixed part, b = 1 − a, I₀ the index in the base month and I₁ in the valuation month — the one-index form of standard price adjustment clauses.", "ci.how": "How to use it — and its limits", "ci.l1": "Official months come straight from the statistics office (UBOS, KNBS, Stats SA). Provisional months are our forecast, used only until the official figure is published; agree in the contract that provisional values are replaced.", "ci.l2": "Countries without an official construction index (Nigeria, Rwanda, Tanzania, Zambia) show our import-cost index from oil and the exchange rate. It does not cover local materials or labour, so use it with care and say so in the contract.", "ci.l3": "This is free during the pilot. Indices by material and city, long history, monthly certificates and a data feed are planned for CiO Costs Pro.", "ci.what.off": "Official construction input price index from {o}, extended with provisional months until the next official release.", "ci.what.est": "No official construction index yet: CiO import-cost index (oil and exchange rate). Local materials and labour are not included.", "ci.st.official": "Official", "ci.st.provisional": "Provisional (CiO)", "ci.st.estimate": "CiO estimate", "ci.res": "change in the adjustable part's value: index {i0} → {i1}", "ci.adj": "Adjusted amount: {v} (difference {d})", "ci.prov": "* Uses a provisional month: recalculate when the official figure is published.",
      "trend": "trend", "trend.tip": "Forecast from this material's own price history only (no oil, currency or weather model): a rougher guide.",
      "dv.h": "What is moving costs", "dv.oil": "World oil (Brent)", "dv.off": "Latest official figures", "dv.upd": "Forecast updated", "dv.every": "Refreshed every 3 hours as oil and currencies move", "dv.up3": "in 3 months — fuel, transport, asphalt and plastics cost more", "dv.down3": "in 3 months — fuel and transport cost less", "dv.fx": "{ccy} per US dollar", "dv.weaker": "weaker in 3 months — imported steel, cement inputs and fittings cost more", "dv.stronger": "stronger in 3 months — imports cost a little less", "dv.usd": "Prices here are in US dollars: no currency effect", "dv.none": "No official index yet", "dv.est": "Estimate from oil and currency moves", "dv.now": "Just now", "dv.hago": "{h} h ago",
      "bm.q": "How well does CiO Costs forecast construction prices where the official data is good?", "bm.latest": "latest", "bm.in1": "inside the likely range, 1 month ahead", "bm.in3": "inside the likely range, 3 months ahead", "bm.miss": "average miss (points), ours / “no change”", "bm.beat": "Beats “no change”", "bm.nobeat": "Does not beat “no change” yet", "bm.months": "months tested, each with only the data known at the time", "bm.aim": "The aim is 80%: the real change should land inside our likely range 8 times in 10. Much higher means the range is too cautious; much lower, too bold.", "bm.vs": "Forecast vs what happened", "bm.t1": "1 month ahead", "bm.t3": "3 months ahead", "bm.lg.rng": "our likely range", "bm.lg.mid": "our central forecast", "bm.lg.hit": "official result, inside", "bm.lg.miss": "official result, outside", "bm.next": "What we expect next", "bm.idx": "The official index", "bm.how": "How this test works", "bm.how1": "Every month in the past four years, we made a forecast using only the figures that were published by then.", "bm.how2": "We compared it with the official figure that came out later: did it land inside our likely range?", "bm.how3": "We also compare with the simplest rule — “prices stay where they are” — to see whether the forecast adds anything.", "bm.source": "Official source", "bm.back": "The seven pilot countries",
      "search.btn": "Search", "bench.h2": "Benchmarks: the same tool where official data is good", "bench.d2": "We also run CiO Costs on official construction prices in North America, Europe, Asia and Latin America. They are published every month and on time, so anyone can check how well the forecasts do. The aim: the real change lands inside the likely range 8 times in 10.", "bench.c1": "Inside range, 1 month", "bench.c3": "3 months", "bench.cb": "Beats “no change”", "empty": "No country matches. Try “cement”, “Kenya”, “East” or “Benchmark”.",
      "link.makecall": "Play today's game",
      "cta.report": "Report a price", "home.eyebrow": "Construction cost outlook · 7 African countries", "join.h": "Take part", "join.d2": "Anyone can use CiO Costs and add prices — no account. Tell us what you paid for cement, steel, sand or diesel whenever you buy, even months later, and follow the free weekly update.", "rep.h1": "What did you pay?", "rep.lede2": "Tell us a price you paid or were quoted for a construction material — today or up to 6 months ago, whenever you have a moment. Reports are anonymous: we publish typical prices from at least 3 people — never names, numbers or single reports.", "qr.h2": "What did you pay recently?", "qr.d2": "Tell us one price — today or from the last few months. It is anonymous and takes 20 seconds; once 3 people report an item, everyone sees the typical price.", "rep.when": "When did you pay?", "when.0": "This month", "when.1": "Last month", "when.2": "2 months ago", "when.3": "3 months ago", "when.4": "4 months ago", "when.5": "5 months ago", "when.6": "6 months ago", "th.vsprev": "vs previous 2 months", "crowd.areas2": "Typical prices pool the last 2 months, so people can report whenever they buy. Area prices appear once 3 people report from that area.", "track.crowdsoon2": "once 3 people have reported an item over two periods of 2 months, we show the change in what they pay next to our estimate here.", "grp.bench": "Benchmark", "tab.bench": "Benchmark", "bench.eyebrow": "How good are the forecasts?", "bench.h": "Benchmark: the same tool where data is good", "bench.d": "We also run CiO Costs on the United States' official construction input prices, published every month on time, so anyone can check how well it forecasts.", "bench.in1": "inside the likely range, 1 month ahead", "bench.in3": "3 months ahead (aim: 80%)", "bench.see": "See the benchmark",
      "grp.pilot": "Pilot countries", "grp.more": "More countries",
      "qr.h": "What did you pay this week?", "qr.d": "Tell us one price. It is anonymous and takes 20 seconds — and once 3 people report an item, everyone sees the typical price.", "qr.need": "<b>{n} of 3</b> people have reported {i} in {c} in the last 2 months. Add yours to unlock the typical price.", "qr.live": "<b>✓ Live:</b> the typical price for {i} in {c} is published — your report keeps it current.", "qr.town": "Please type the town or area.",
      "whatis": "CiO Costs is a forecasting tool. It estimates how construction costs (materials, fuel and labour) are likely to move, with a range. It is not an official statistic, a price list or financial advice.", "fc.note": "Forecast, not a guarantee: 8 times in 10 the real change falls inside the range.", "crowd.note": "Typical prices reported by buyers — not official or supplier prices.", "emb.notadvice": "Forecast · not advice",
      "rep.area": "Where is that?", "rep.incap": "In", "rep.elsewhere": "Elsewhere in the country", "rep.check": "{p} {ccy} is far from the usual {u} {ccy}. Is that right?", "rep.yes": "Yes, it's right — send", "rep.fix": "Let me fix it", "th.item": "Item", "th.typical": "Typical price", "th.elsewhere": "Elsewhere", "th.reporters": "Reporters", "th.vs4": "vs 4 weeks", "crowd.areas": "Area prices use the last 4 weeks and appear once 3 people report from that area.", "track.crowdsoon": "once 3 people report an item for 4 weeks, we show what they pay next to our estimate here.", "track.addyours": "Report a price", "track.vscrowd": "our estimate vs what people pay", "track.est": "Our import-cost estimate, last month",
      "lbl.chance": "chance of a rise",
      "emb.lang": "Language", "emb.visitor": "Visitor's language", "emb.theme": "Colours", "emb.match": "Match the visitor", "emb.light": "Light", "emb.dark": "Dark", "emb.help": "Copy this code into any web page. On WordPress, add a “Custom HTML” block and paste it there. It updates by itself.", "emb.copy": "Copy code", "emb.copied": "Copied ✓", "emb.preview": "Preview", "emb.full": "Full outlook on CiO Costs →", "emb.offline": "The site address is filled in automatically once CiO Costs is online.",
      "needle.down": "Prices down", "needle.up": "Prices up", "draw.h": "Draw it", "draw.d": "Guess how an official price index moved. Draw the line, then reveal the real one.", "draw.q": "How did {s} in {c} move from {a} to {b}? Draw the line.", "draw.hint": "Draw here →", "draw.reveal": "Reveal", "draw.score": "You scored {n}/100.", "draw.off": "Your line was off by {x} points on average.", "draw.fc": "The dashed line is where our forecast says it goes next.", "draw.done": "A new chart tomorrow.", "res.h": "See results", "res.dist": "Your scores so far", "res.next": "Next calls in", "res.close": "Close",
      "home.lede": "Choose your country and a date. See whether construction costs — the prices of materials, fuel and labour — are likely to go up, by how much, and what that means for the price you pay. Updated every few hours.",
      "h.1": "Next month", "h.3": "3 months", "h.6": "6 months", "h.pick": "Pick a date", "v.sure.up": "Almost certainly up", "v.likely.up": "Likely up", "v.lean.up": "Leaning up", "v.sure.down": "Almost certainly down", "v.likely.down": "Likely down", "v.lean.down": "Leaning down", "v.same": "About the same", "v.sub": "about {x} by {when}", "lbl.chance.cap": "Chance of a rise", "buy.q": "What are you buying?", "buy.cement": "Cement", "buy.steel": "Steel", "buy.sand": "Sand", "buy.diesel": "Diesel", "buy.roofing": "Roofing", "grid.open": "Show all countries", "glance.link": "Compare all countries in one table →", "game.line": "Five quick calls a day on real prices.", "track.h": "Track record", "track.none": "no official index to check against yet; we compare with reported prices as they come in.", "track.soon": "we log every forecast and will show it here next to the official figure once it is published.", "join.signin": "Pilot sign-in", "rep.needs": "{n} of 3 people in the last 2 months — add yours",
      "match.by": "expected by {when}", "match.last": "official, latest ({p})", "match.ind": "import costs {x} by {when}",
      "share": "Share", "wa.weekly": "Free weekly update on WhatsApp",
      "nav.prices": "Prices", "nav.plan": "Bids & contracts", "nav.reportshort": "Report a price", "nav.playshort": "Play", "pick.country": "Your country", "chip.yours": "Your country", "chip.officialdata": "Official data", "chip.estimate": "Estimate", "tip.official": "Built from the country's official construction price statistics, updated with this week's oil and currency moves.", "tip.estimate": "No usable official construction price index yet: an estimate of the pressure on imported materials from oil prices and the exchange rate. Local materials and labour are not included.", "trust.sources": "Official data from UBOS, KNBS and Stats SA", "trust.track": "Track record", "trust.ago": "updated {h} h ago", "trust.justnow": "updated just now", "wa.follow": "Follow on WhatsApp (free)", "money.h": "Your price", "money.ph": "Your latest price", "money.need": "Type what you paid last to see the expected price.", "money.out": "Expect about {p} by {when} (most likely {lo} – {hi}).", "alert.email": "Email", "tab.official": "Official data", "tab.indicator": "Estimates",
      "q.official": "Will construction costs in {c} rise by {when}?", "q.indicator": "Will import costs push construction costs in {c} up by {when}?",
      "adv.up": "Allow about {x} on today's quotes for work priced to {when}.",
      "adv.down": "Prices may ease about {x} by {when} — consider delaying bulk buying.",
      "adv.flat": "Little change expected to {when} — today's prices are a fair guide.",
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
    sw: { "Cement": "Saruji", "Skilled mason, per day": "Fundi mwashi, kwa siku", "Casual labourer, per day": "Kibarua, kwa siku", "Diesel": "Dizeli", "Rebar": "Nondo", "Reinforcement steel": "Nondo (chuma cha kuimarisha)", "Reinforcing steel": "Nondo",
      "Sand": "Mchanga", "Labour": "Nguvu kazi", "Roofing sheets": "Mabati", "Aggregate": "Kokoto", "Aggregate stone": "Kokoto",
      "Concrete blocks": "Matofali ya saruji", "Timber": "Mbao", "Paint": "Rangi", "Plastic pipes": "Mabomba ya plastiki", "Tiles": "Vigae",
      "Bricks": "Matofali", "Asphalt": "Lami", "Ready-mix concrete": "Zege tayari", "Steel and reinforcement": "Chuma na nondo",
      "Fuel and lubricants": "Mafuta na vilainishi", "Ballast and crushed stone": "Kokoto na mawe yaliyosagwa", "Hardcore": "Mawe ya msingi",
      "Overall construction inputs": "Vifaa vyote vya ujenzi", "Overall construction input prices": "Bei za jumla za vifaa vya ujenzi",
      "Building cost index": "Fahirisi ya gharama za majengo", "Civil engineering cost index": "Fahirisi ya gharama za uhandisi wa kiraia",
      "Construction input prices (whole industry)": "Bei za vifaa vya ujenzi (sekta nzima)", "Construction stone and sand": "Mawe na mchanga wa ujenzi",
      "Civil engineering materials": "Vifaa vya uhandisi wa kiraia", "Imported-input cost pressure": "Shinikizo la gharama za vifaa vinavyoagizwa" },
    fr: { "Cement": "Ciment", "Skilled mason, per day": "Maçon qualifié, par jour", "Casual labourer, per day": "Manœuvre, par jour", "Diesel": "Gazole", "Rebar": "Fer à béton", "Reinforcement steel": "Acier d'armature", "Reinforcing steel": "Acier d'armature",
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
  /* Changes people see are measured from TODAY: the path's level for the current month is taken as today's prices,
     exactly as the weekly notes do (plain_note._from_today). The range keeps the uncertainty about the months not yet
     published. atBase() is the path itself, measured from the latest official figure. */
  const NOWM = (d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`)(new Date());
  function at(path, tg) { const r = atBase(path, tg); if (!r) return r;
    let n = 0; for (const q of path) if (q.month <= NOWM) n = q.median;
    if (!n) return r;
    const f = x => ((1 + x / 100) / (1 + n / 100) - 1) * 100;
    return Object.assign({}, r, { q: { month: r.q.month, median: f(r.q.median), lo: f(r.q.lo), hi: f(r.q.hi) } }); }
  /* linear interpolation along the forecast path; 0 change at the base month (one month before the first point) */
  function atBase(path, tg) {
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
    if (br) { let steady = false;
      br.innerHTML = Object.entries(c.paths).filter(([n]) => !(c.trend || []).includes(n)).map(([n, pth]) => { const x = at(pth, tg); if (!x) return "";
        if (Math.abs(x.q.median) < 0.05) { steady = true;
          return `<li><span>${T.mat(n)}</span><b class=steady title="${esc(tr("mat.range", { lo: pct(x.q.lo), hi: pct(x.q.hi) }))}">➡ ${tr("mat.steady")}</b></li>`; }
        return `<li><span>${T.mat(n)}</span><b>${apct(x.q.median)}</b></li>`; }).join("") + (steady ? `<li class=steady-note>${tr("mat.steadynote")}</li>` : ""); }
    money(el, c, tg); needle(el, p);
    el.dataset.trend = q.median > 0.05 ? "rising" : (q.median < -0.05 ? "easing" : "flat");
    const fan = $(".fan", el); if (fan) { const xs = JSON.parse(fan.dataset.xs || "{}"), mk = $(".marker", fan), m = tMonth(tg);
      const x = xs[m] || xs[Object.keys(xs).filter(k => k <= m).pop()]; if (mk && x) { mk.setAttribute("x1", x); mk.setAttribute("x2", x); } }
    $$("tr[data-mat]").forEach(row => { const pth = c.paths[row.dataset.mat] || (row.dataset.mat === "Reinforcement steel" ? c.paths["Rebar"] : null);
      const cell = $("[data-mexp]", row); if (cell) { const x = at(pth, tg); cell.innerHTML = x ? `${apct(x.q.median)}  (${pct(x.q.lo)} – ${pct(x.q.hi)})${(c.trend_stats || {})[row.dataset.mat] ? ` ${(() => { const st = (c.trend_stats || {})[row.dataset.mat] || {}, drv = st.kind && st.kind !== "nochange" && (st.drivers || []).length;
        const tag = st.kind === "structural" ? tr("mm.main") : drv ? tr("mm.model") : tr("mm.nochange");
        const tip = (st.kind === "structural" ? tr("mm.tipmain") : drv ? tr("mm.tipmodel", { how: st.how || "" }) : tr("mm.tipnc")) + (st.n ? " " + tr("mm.test", { n: st.n, p: Math.round((st.inside || 0) * 100),
          r: st.mae_nochange ? Math.round((1 - st.mae / st.mae_nochange) * 100) : 0 }) : "");
        return ` <span class="trendtag${drv ? " mdl" : ""}" title="${esc(tip)}">${tag}</span>`; })()}` : ""}` : tr("notsep"); } });
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
    /* #adjust, or a link to anything inside the adjust pane (e.g. #reader, #pro), opens that tab */
    const pick = () => { let el = null; try { el = location.hash.length > 1 && document.querySelector(location.hash); } catch (e) {}
      const pane = el && el.closest("[data-bc-pane]"); const t = location.hash === "#adjust" ? "adjust" : pane ? pane.dataset.bcPane : "bid";
      go(t); if (pane) el.scrollIntoView(); };
    pick(); window.addEventListener("hashchange", pick); }

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
    set("fxk", d.usd_index ? tr("dv.usdidx") : tr("dv.fx", { ccy: c.currency }));
    if (d.fx && d.usd_index) { set("fx", d.fx.toFixed(1)); set("fxch", chg(d.fx_13w_pct, "dv.usdup", "dv.usddown")); }
    else if (d.fx) { set("fx", `${(d.fx >= 100 ? Math.round(d.fx) : +d.fx.toFixed(3)).toLocaleString(T.loc || undefined)} ${c.currency}`); set("fxch", chg(d.fx_13w_pct, "dv.weaker", "dv.stronger")); }
    else { set("fx", "–"); set("fxch", tr("dv.usd")); }
    set("off", c.official ? T.base(c.base) : tr("dv.none")); set("offsrc", c.official ? (c.office || "") : tr("dv.est"));
    const b = Date.parse((($("#updated-ago") || {}).dataset || {}).built || ""), h = Math.max(0, Math.round((Date.now() - b) / 36e5));
    set("upd", isNaN(h) ? "–" : (h < 1 ? tr("dv.now") : tr("dv.hago", { h }))); }

  /* ---------- landing headline: "Will [cement] prices rise in [Kampala]?" — material and city both rotate through the
     pilot (starting from the visitor's own country); still for people who ask for reduced motion ---------- */
  const lpH = $("[data-lp-h]");
  function lpCity() { const k = ($("#mycountry") || {}).value, c = DATA.countries[k]; return c ? (c.capital || cname(c)) : "Kampala"; }
  let lpTo = () => {};
  if (lpH) { const mats = [tr("lp.m1"), tr("lp.m2"), tr("lp.m3"), tr("lp.m4")];
    const cities = [...new Set(Object.values(DATA.countries || {}).filter(c => !c.bench && c.capital).map(c => c.capital))];
    let i = 0, j = 0;
    const draw = () => { lpH.innerHTML = tr("lp.h", { m: `<mark class=lp-word>${mats[i % mats.length]}</mark>`,
      city: `<span class="lp-word lp-city">${esc(cities.length ? cities[j % cities.length] : lpCity())}</span>` }); };
    lpTo = city => { const k = cities.indexOf(city); if (k >= 0) j = k; draw(); };
    draw();
    if (!window.matchMedia || !matchMedia("(prefers-reduced-motion: reduce)").matches)
      setInterval(() => { i++; j++; $$(".lp-word", lpH).forEach(w => w.classList.add("out")); setTimeout(draw, 260); }, 2600); }

  /* ---------- country-first home ---------- */
  const my = $("#mycountry"), feat = $(".featured:not(.solo)");
  Object.entries(DATA.countries || {}).forEach(([k, c]) => { c.key = k; });
  if (my && feat) {
    $$("option", my).forEach(o => { const c = DATA.countries[o.value]; if (c) o.textContent = `${c.flag} ${cname(c)}`; });
    const show = k => { const c = DATA.countries[k]; if (!c) return; feat.dataset.key = k; drivers(k);
      $(".flag", feat).textContent = c.flag; const nm = $("[data-feat-name]", feat); nm.textContent = cname(c); nm.dataset.cc = c.cc;
      $$("[data-feat-name], [data-feat-link]", feat).forEach(a => a.href = `countries/${k}/index.html`);
      const fb = $("[data-feat-bid]", feat); if (fb) { fb.href = `calculator.html?c=${k}#bid`; fb.hidden = !!c.bench; }
      const nl = $("[data-feat-noteline]", feat); if (nl) { nl.hidden = !c.note; if (c.note) { $("[data-feat-note]", nl).href = `countries/${k}/${c.note}`;
        $("[data-feat-notename]", nl).textContent = cname(c); } }
      $("[data-chart]", feat).innerHTML = ""; };
    const k0 = store.get("cio-country", null); my.value = DATA.countries[k0] ? k0 : feat.dataset.key; show(my.value); lpTo(lpCity());
    my.onchange = () => { track("country", my.value); store.set("cio-country", my.value); lpTo(lpCity()); show(my.value); render(); };
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
    /* returning visitors: a yes/no flag kept in this browser, never an id */
    let ret; if (kind === "view") { ret = store.get("cio-seen", false) ? 1 : 0; if (!ret) store.set("cio-seen", true); }
    try { navigator.sendBeacon(rel + "api/public/hit", JSON.stringify({ path: location.pathname, kind, lang: T.lang, country: country || "", ret,
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
      /* every item of this country: its typical price, or how close it is to having one (3 people in 2 months) */
      const by = Object.fromEntries((R.crowd || []).map(r => [r.item, r])), num = v => Math.round(v).toLocaleString(T.loc || undefined);
      const live = R.items.filter(i => (by[i.code] || {}).published).length;
      cv.innerHTML = `<p class=cl-sum>${tr("rep.sum", { n: live, m: R.items.length, c: R.flag + " " + T.country(R.cc, R.country) })}</p><ul class=crowdlist>` +
        R.items.map(i => { const r = by[i.code] || {}, n = r.pending || 0;
          const meta = r.published ? [tr("rep.people", { n: r.reporters }), r.change_pct != null ? `${apct(r.change_pct)} ${tr("rep.vsprev")}` : "",
            r.capital != null ? `${R.capital}: ${num(r.capital)}` : "", r.other != null ? `${tr("th.elsewhere")}: ${num(r.other)}` : ""].filter(Boolean).join(" · ") : "";
          return `<li><button type=button class=cl-item data-pick="${i.code}"><span class=cl-top><b>${T.mat(i.name)}</b><span class=muted>${tr("rep.per", { u: i.unit })}</span></span>` +
            (r.published ? `<span class=cl-price>${num(r.median)} <small>${R.currency}</small></span><span class=cl-meta>${meta}</span>`
              : `<span class=cl-prog aria-hidden=true><i style="width:${Math.min(100, n / 3 * 100)}%"></i></span><span class=cl-meta>${tr("rep.needs", { n })}</span>`) +
            `</button></li>`; }).join("") + `</ul>`;
      $$("[data-pick]", cv).forEach(b => b.onclick = () => { it.value = b.dataset.pick; it.onchange(); fld("price").focus(); }); }
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
    /* two styles: countries with official indices per material follow each material's forecast; countries without
       them use CiO's import-cost estimate for imported materials and the user's own assumption for local ones */
    const indexed = c => c.official && Object.keys(c.paths).length > 1;
    const opts = c => indexed(c)
      ? Object.keys(c.paths).map(n => `<option value="${esc(n)}">${T.mat(n)}</option>`).join("") + `<option value="">${tr("boq.fixed")}</option>`
      : `<option value="${esc(c.head)}">${tr("boq.imported")}</option>` + Object.keys(c.single || {}).filter(n => c.paths[n]).map(n => `<option value="${esc(n)}">${esc(n)}</option>`).join("")
        + `<option value="">${tr("boq.fixed")}</option>`;
    const LOCAL = ["sand", "stone", "aggregate", "ballast", "hardcore", "murram", "block", "brick", "timber", "wood", "gravel", "quarry", "mchanga", "sable"];
    const guess = (c, desc) => { const w = words(desc).filter(t => t.length >= 3);
      if (!indexed(c)) {                                    /* fuel and steel lines follow their own item where one exists */
        const single = Object.keys(c.single || {}).filter(n => c.paths[n]);
        const fuel = w.some(t => ["diesel", "fuel", "petrol", "dizeli", "gazole"].some(x => t.startsWith(x))) && single.find(n => /diesel|fuel/i.test(n));
        const steel = w.some(t => ["steel", "rebar", "iron", "nondo", "chuma", "acier", "roofing", "mabati"].some(x => t.startsWith(x))) && single.find(n => /steel/i.test(n));
        const rep = single.find(n => /reported/i.test(n) && w.some(t => t.length > 3 && words(n).some(x => x.startsWith(t))));
        return rep || fuel || steel || c.head; }
      return Object.keys(c.paths).find(n => { const nw = words(n + " " + T.mat(n)); return w.some(t => nw.some(x => x.startsWith(t) || t.startsWith(x) || (SYN[t] || []).some(y => x.startsWith(y)))); }) ?? c.head; };
    const fmt = v => Math.round(v).toLocaleString(T.loc || undefined);
    function addRow(v = {}) {
      if (body.children.length >= MAX) return;
      const row = document.createElement("tr"), c = C();
      row.innerHTML = `<td><input data-k=desc value="${esc(v.desc)}" placeholder="${esc(tr("boq.descph"))}" aria-label="${esc(tr("boq.desc"))}"></td>
        <td><input data-k=qty type=number min=0 step=any value="${esc(v.qty)}" aria-label="${esc(tr("boq.qty"))}"></td>
        <td><input data-k=unit value="${esc(v.unit)}" aria-label="${esc(tr("rep.unit"))}"></td>
        <td><input data-k=rate type=number min=0 step=any value="${esc(v.rate)}" aria-label="${esc(tr("boq.rate"))}"></td>
        <td><select data-k=series aria-label="${esc(tr("boq.series"))}">${opts(c)}</select>
          <label class=boq-assume hidden><input data-k=assume type=number step=0.5 value="${esc(v.assume ?? 8)}" aria-label="${esc(tr("boq.assume"))}"> ${tr("boq.peryear")}</label></td>
        <td data-o=today></td><td data-o=exp></td>
        <td><button type=button class=boq-del aria-label="${esc(tr("boq.del"))}">✕</button></td>`;
      body.appendChild(row);
      const sel = $("[data-k=series]", row); sel.value = v.series != null && (v.series === "" || c.paths[v.series] || (!indexed(c) && v.series.startsWith("@"))) ? v.series : guess(c, v.desc || "");
      if (v.manual) row.dataset.manual = 1;
      $("[data-k=desc]", row).addEventListener("change", () => { if (!row.dataset.manual) sel.value = guess(C(), $("[data-k=desc]", row).value); compute(); });
      sel.addEventListener("change", () => { row.dataset.manual = 1; compute(); });
      $(".boq-del", row).onclick = () => { row.remove(); compute(); };
      compute(); }
    function rows() { return $$("tr", body).map(r => ({ desc: $("[data-k=desc]", r).value, qty: $("[data-k=qty]", r).value, unit: $("[data-k=unit]", r).value,
      rate: $("[data-k=rate]", r).value, series: $("[data-k=series]", r).value, assume: $("[data-k=assume]", r).value, manual: !!r.dataset.manual, el: r })); }
    /* the user's own expected change (% a year) for local materials and labour, averaged over the work period */
    const assumed = (pa, span) => { const now = ML[0], mi = m => (+m.slice(0, 4) - +now.slice(0, 4)) * 12 + (+m.slice(5, 7) - +now.slice(5, 7));
      const e = span.reduce((a, m) => a + (Math.pow(1 + pa / 100, mi(m) / 12) - 1) * 100, 0) / (span.length || 1); return [e, e * 0.5, e * 1.5]; };
    let last = [];
    function compute() {
      const c = C(), span = ML.filter(m => m >= fld("start").value && m <= fld("end").value);
      $$("[data-boq-ccy]").forEach(x => x.textContent = c.currency);
      let T0 = 0, T1 = 0, TL = 0, TH = 0; last = [];
      $("[data-boq-kind]").innerHTML = indexed(c) ? tr("boq.kind.idx", { c: cname(c), o: esc(c.office || "") }) : tr("boq.kind.est", { c: cname(c) });
      rows().forEach(r => { $(".boq-assume", r.el).hidden = !r.series.startsWith("@");
        const amt = (+r.qty || 0) * (+r.rate || 0), [e, l, h] = r.series.startsWith("@") ? assumed(+r.assume || 0, span) : r.series ? overPeriod(c.paths[r.series], span) : [0, 0, 0];
        const ex = amt * (1 + e / 100); T0 += amt; T1 += ex; TL += amt * (1 + l / 100); TH += amt * (1 + h / 100);
        $("[data-o=today]", r.el).textContent = amt ? fmt(amt) : "–";
        $("[data-o=exp]", r.el).innerHTML = amt ? `${fmt(ex)} <small>${apct(e)}</small>` : "–";
        last.push([r.desc, r.qty, r.unit, r.rate, r.series.startsWith("@") ? `${tr(r.series === "@local" ? "boq.local" : "boq.labour")} ${r.assume}%/yr`
          : r.series || tr("boq.fixed"), Math.round(amt), Math.round(ex), e.toFixed(2)]); });
      $("[data-boq-t0]").textContent = T0 ? fmt(T0) : "–"; $("[data-boq-t1]").textContent = T1 ? fmt(T1) : "–";
      $("[data-boq-sum]").innerHTML = T0 ? tr("boq.sum", { v: `<b>${fmt(T1)} ${c.currency}</b>`, d: pct((T1 / T0 - 1) * 100), lo: fmt(TL), hi: fmt(TH) + " " + c.currency,
        from: label(fld("start").value), to: label(fld("end").value) }) : tr("boq.empty");
      $("[data-boq-add]").disabled = body.children.length >= MAX;
      store.set("cio-boq", { country: fld("country").value, rows: rows().map(({ el, ...r }) => r) }); }
    fld("country").onchange = () => { const c = C(); $$("tr", body).forEach(r => { const sel = $("[data-k=series]", r), was = sel.value; sel.innerHTML = opts(c);
      sel.value = r.dataset.manual && [...sel.options].some(o => o.value === was) ? was : guess(c, $("[data-k=desc]", r).value); }); compute(); };
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
    const asked = new URLSearchParams(location.search).get("c");
    if (asked && DATA.countries[asked] && fld("country").value !== asked) { fld("country").value = asked; fld("country").onchange(); }
    else [{ desc: tr("boq.ex1"), unit: tr("boq.ex1u"), qty: 400 }, { desc: tr("boq.ex2"), unit: "t", qty: 3 }, { desc: tr("boq.ex3"), unit: tr("boq.ex3u"), qty: 10 }].forEach(r => addRow(r));
    compute();
  }

  /* ---------- price adjustment for an IPC, the FIDIC way (Sub-Clause 13.7 / 13.8) ---------- */
  const cis = $("#ci-country"), fd = $("#fd-form");
  if (cis && fd && DATA.cindex) {
    const want = new URLSearchParams(location.search).get("c") || store.get("cio-country", null);
    if (DATA.cindex[want]) cis.value = want;
    const X = () => DATA.cindex[cis.value], ymd = d => d.toISOString().slice(0, 10), num = v => Math.round(v).toLocaleString(T.loc || undefined);
    /* index sources for this country: the headline index, each material's official index, or values typed in */
    const sources = x => [["overall", x.official ? tr("fd.overall") : tr("fd.estimate")], ...Object.keys(x.mats || {}).map(n => ["mat:" + n, T.mat(n)]),
      ...Object.keys(x.single || {}).map(n => ["single:" + n, n]),
      ...Object.keys(x.crowd || {}).map(n => ["crowd:" + n, tr("fd.crowd", { i: T.mat(n) })]), ["manual", tr("fd.manual")]];
    const series = (x, src) => src === "overall" ? x.rows : src.startsWith("mat:") ? (x.mats || {})[src.slice(4)]
      : src.startsWith("crowd:") ? (x.crowd || {})[src.slice(6)] : src.startsWith("single:") ? (x.single || {})[src.slice(7)] : null;
    const periodOf = (x, date) => { const y = date.slice(0, 4), m = +date.slice(5, 7);
      return x.step === "quarter" ? `${y}-${String(3 * Math.floor((m - 1) / 3) + 1).padStart(2, "0")}` : `${y}-${String(m).padStart(2, "0")}`; };
    /* index value for a date: that month (quarter); later than the latest published -> the latest, flagged */
    function look(rows, x, date) { if (!rows || !rows.length || !date) return null; const p = periodOf(x, date), r = rows.find(z => z.m === p);
      if (r) return { v: r.v, m: r.m, s: r.s };
      if (p > rows[rows.length - 1].m) { const l = rows[rows.length - 1]; return { v: l.v, m: l.m, s: "latest" }; }
      return null; }
    /* steel first: "reinforcement" contains the letters "cement" */
    const DEF = [["steel", 0.20], ["reinforc", 0.20], ["rebar", 0.20], ["cement", 0.20], ["labour", 0.15], ["diesel", 0.10], ["fuel", 0.10], ["sand", 0.05], ["aggregate", 0.05], ["ballast", 0.05]];
    function defaults(x) { const el = [{ el: tr("fd.fixed"), coef: 0.15, src: "fixed" }]; let left = 0.85; const used = new Set();
      Object.keys(x.mats || {}).forEach(n => { const k = DEF.find(([w]) => n.toLowerCase().includes(w)); if (!k || used.has(k[0].slice(0, 4)) || left - k[1] < 0.05) return;
        used.add(k[0].slice(0, 4)); el.push({ el: T.mat(n), coef: k[1], src: "mat:" + n }); left -= k[1]; });
      el.push({ el: x.official ? tr("fd.othermat") : tr("fd.imported"), coef: +left.toFixed(2), src: "overall" }); return el; }
    let st = store.get("cio-fidic", null);
    function fresh() { const x = X(), b = new Date(); b.setMonth(b.getMonth() - 12);
      const ipc = [3, 6, 9].map((k, i) => { const d = new Date(b); d.setMonth(d.getMonth() + k); return { no: i + 1, end: ymd(new Date(d.getFullYear(), d.getMonth() + 1, 0)), value: 250000000 }; });
      return { country: cis.value, base: ymd(b), sched: defaults(x), ipcs: ipc }; }
    if (!st || st.country !== cis.value) st = fresh();
    const FREE_IPCS = 3;                                  /* free tier: 3 IPCs per contract; more in CiO Costs Pro */
    st.ipcs = st.ipcs.slice(0, FREE_IPCS);
    const sched = $("#fd-sched"), ipcs = $("#fd-ipcs"), out = $("[data-fd-detail]");
    function drawSched() { const x = X(), so = sources(x);
      sched.innerHTML = st.sched.map((r, i) => `<tr data-i=${i}><td>${r.src === "fixed" ? `<b>a</b> · ${esc(r.el)}` : `<input data-f=el value="${esc(r.el)}">`}</td>
        <td><input data-f=coef type=number step=0.01 min=0 max=1 value="${r.coef}"></td>
        <td>${r.src === "fixed" ? `<span class=muted>${tr("fd.notadj")}</span>` : `<select data-f=src>${so.map(([v, l]) => `<option value="${esc(v)}"${v === r.src ? " selected" : ""}>${esc(l)}</option>`).join("")}</select>
          ${r.src === "manual" ? `<span class=fd-man><input data-f=io type=number step=any placeholder="I₀" value="${r.io ?? ""}"><input data-f=in type=number step=any placeholder="Iₙ" value="${r.in ?? ""}"></span>` : ""}`}</td>
        <td>${r.src === "fixed" ? "" : `<button type=button class=boq-del data-del aria-label="${esc(tr("boq.del"))}">✕</button>`}</td></tr>`).join(""); }
    function drawIpcs() { ipcs.innerHTML = st.ipcs.map((r, i) => `<tr data-i=${i}><td>${r.no}</td><td><input data-f=end type=date value="${r.end}"></td>
        <td><input data-f=value type=number min=0 step=any value="${r.value}"></td><td data-o=idate></td><td data-o=pn></td><td data-o=adj></td>
        <td><button type=button class=boq-del data-del aria-label="${esc(tr("boq.del"))}">✕</button></td></tr>`).join(""); }
    function compute() {
      const x = X(), sum = st.sched.reduce((a, r) => a + (+r.coef || 0), 0); $$("[data-ci-ccy]").forEach(e => e.textContent = x.currency);
      $("[data-fd-sum]").innerHTML = `${sum.toFixed(2)}${Math.abs(sum - 1) > 0.005 ? ` <span class=bad>${tr("fd.sumwarn")}</span>` : " ✓"}`;
      let total = 0; const blocks = [];
      st.ipcs.forEach((p, i) => { const row = $$("tr", ipcs)[i]; if (!row) return;
        const idx = new Date(p.end); idx.setDate(idx.getDate() - 49); const idate = isNaN(idx) ? "" : ymd(idx);
        $("[data-o=idate]", row).textContent = idate ? qlabel(periodOf(x, idate), x.step) : "–";
        let Pn = 0, ok = true, flags = new Set(); const lines = [];
        st.sched.forEach(r => { const c = +r.coef || 0;
          if (r.src === "fixed") { Pn += c; lines.push([r.el, c, "", "", "", c]); return; }
          let io, inn;
          if (r.src === "manual") { io = { v: +r.io }; inn = { v: +r.in }; if (!(io.v > 0 && inn.v > 0)) { ok = false; flags.add("manual"); } }
          else { const S = series(x, r.src); io = look(S, x, st.base); inn = look(S, x, idate);
            if (!io || !inn) { ok = false; flags.add("missing"); }
            else { if (io.s === "provisional" || inn.s === "provisional") flags.add("provisional"); if (inn.s === "latest") flags.add("latest"); } }
          if (io && inn && io.v > 0) { const w = c * inn.v / io.v; Pn += w; lines.push([r.el, c, io.v, inn.v, inn.v / io.v, w, io.m, inn.m]); } });
        const adj = ok ? (Pn - 1) * (+p.value || 0) : null; if (adj != null) total += adj;
        $("[data-o=pn]", row).textContent = ok ? Pn.toFixed(4) : "–"; $("[data-o=adj]", row).innerHTML = adj == null ? "–" : `${adj < 0 ? "−" : ""}${num(Math.abs(adj))}`;
        blocks.push(`<div class=fd-ipcblock><h4>IPC ${p.no} · ${tr("fd.end")} ${p.end} · ${tr("fd.idate")} ${idate ? qlabel(periodOf(x, idate), x.step) : "–"}</h4>
          <table class=glance><thead><tr><th>${tr("fd.el")}</th><th>${tr("fd.coef")}</th><th>I₀</th><th>Iₙ</th><th>Iₙ / I₀</th><th>${tr("fd.weighted")}</th></tr></thead><tbody>
          ${lines.map(l => `<tr><td>${esc(l[0])}</td><td>${(+l[1]).toFixed(2)}</td><td>${l[2] === "" ? "–" : (+l[2]).toFixed(2)}</td><td>${l[3] === "" ? "–" : (+l[3]).toFixed(2)}</td>
            <td>${l[4] === "" ? "–" : (+l[4]).toFixed(4)}</td><td>${(+l[5]).toFixed(4)}</td></tr>`).join("")}</tbody>
          <tfoot><tr><th colspan=5>P<sub>n</sub></th><th>${ok ? Pn.toFixed(4) : "–"}</th></tr></tfoot></table>
          <p>${ok ? tr("fd.line", { v: num(+p.value || 0), p: Pn.toFixed(4), a: `<b>${adj < 0 ? "−" : ""}${num(Math.abs(adj))} ${x.currency}</b>` }) : tr("fd.cannot")}</p>
          ${[...flags].map(fl => `<p class=fineprint>${tr("fd.flag." + fl)}</p>`).join("")}</div>`); });
      $("[data-fd-total]").innerHTML = `<b>${total < 0 ? "−" : ""}${num(Math.abs(total))}</b>`;
      out.innerHTML = `<h3>${tr("fd.statement")}</h3><p class=muted>${x.flag} ${cname(DATA.countries[cis.value] || { country: x.country, cc: x.cc })} · ${tr("fd.base")} ${st.base}</p>${blocks.join("")}
        <p class=fineprint>${tr("fd.formula")}</p>`;
      store.set("cio-fidic", st); }
    function showIndex() { const x = X(), rows = x.rows;
      $("[data-ci-what]").innerHTML = x.official ? tr("ci.what.off", { o: esc(x.office) }) : tr("ci.what.est");
      $("#ci-rows").innerHTML = rows.slice().reverse().map((r, i, arr) => { const p = arr[i + 1], ch = p ? (r.v / p.v - 1) * 100 : null;
        return `<tr><td>${qlabel(r.m, x.step)}</td><td>${r.v.toFixed(2)}</td><td>${ch == null ? "–" : apct(ch)}</td><td><span class="cist ${r.s}">${tr("ci.st." + r.s)}</span></td></tr>`; }).join("");
      $("[data-ci-csv]").href = rel + `data/contract_index_${cis.value}.csv`; $("[data-ci-csv]").setAttribute("download", `contract_index_${cis.value}.csv`); }
    function all() { fd.elements.base.value = st.base; drawSched(); drawIpcs(); showIndex(); compute(); capNote(); }
    const pf = $(".pro-form");
    if (pf) pf.onsubmit = async ev => { ev.preventDefault(); const m = $(".formmsg", pf), g = n => pf.querySelector(`[name=${n}]`);
      const j = await post(rel + "api/public/waitlist", { email: g("email").value, org: g("org").value, role: g("role").value, consent: g("consent").checked,
        country: cis.value, feature: "ipc" }, m);
      if (j) { m.textContent = tr("pro.thanks"); pf.reset(); track("alert", cis.value); } };
    cis.onchange = () => { st = fresh(); all(); };
    fd.elements.base.onchange = () => { st.base = fd.elements.base.value; compute(); };
    sched.addEventListener("input", ev => { const tr_ = ev.target.closest("tr"), r = st.sched[+tr_.dataset.i], f = ev.target.dataset.f; if (!f) return;
      r[f] = f === "coef" || f === "io" || f === "in" ? +ev.target.value : ev.target.value; if (f === "src") { drawSched(); } compute(); });
    sched.addEventListener("change", ev => { if (ev.target.dataset.f === "src") { const r = st.sched[+ev.target.closest("tr").dataset.i]; r.src = ev.target.value; drawSched(); compute(); } });
    sched.addEventListener("click", ev => { if (ev.target.matches("[data-del]")) { st.sched.splice(+ev.target.closest("tr").dataset.i, 1); drawSched(); compute(); } });
    ipcs.addEventListener("input", ev => { const r = st.ipcs[+ev.target.closest("tr").dataset.i], f = ev.target.dataset.f; if (!f) return; r[f] = f === "value" ? +ev.target.value : ev.target.value; compute(); });
    ipcs.addEventListener("click", ev => { if (ev.target.matches("[data-del]")) { st.ipcs.splice(+ev.target.closest("tr").dataset.i, 1); st.ipcs.forEach((p, i) => p.no = i + 1); drawIpcs(); compute(); capNote(); } });
    $("[data-fd-addel]").onclick = () => { st.sched.push({ el: tr("fd.newel"), coef: 0, src: "overall" }); drawSched(); compute(); };
    const capNote = () => { const full = st.ipcs.length >= FREE_IPCS; $("[data-fd-addipc]").disabled = full;
      $("[data-fd-cap]").innerHTML = full ? tr("pro.cap", { n: FREE_IPCS }) + ` <a href="#pro">${tr("pro.more")}</a>` : tr("pro.free", { n: FREE_IPCS }); };
    $("[data-fd-addipc]").onclick = () => { if (st.ipcs.length >= FREE_IPCS) { capNote(); return; } const last = st.ipcs[st.ipcs.length - 1], d = last ? new Date(last.end) : new Date();
      const e = new Date(d.getFullYear(), d.getMonth() + 2, 0); st.ipcs.push({ no: st.ipcs.length + 1, end: ymd(e), value: last ? last.value : 0 }); drawIpcs(); compute(); capNote(); };
    /* contract reader (Pro): the adjustment data read from an uploaded contract, each value with its words and page */
    const cr = $("#cr-form");
    if (cr) { const out = $(".cr-out"), saved = store.get("cio-pro-code", ""); if (saved) cr.elements.code.value = saved;
      cr.onsubmit = async ev => { ev.preventDefault(); const f = cr.elements.file.files[0]; if (!f) return;
        const fdata = new FormData(), btn = $("button", cr); fdata.append("file", f); fdata.append("country", cis.value);
        fdata.append("options", JSON.stringify(Object.fromEntries(sources(X()).filter(([v]) => v !== "manual"))));
        fdata.append("code", cr.elements.code.value.trim()); btn.disabled = true; out.innerHTML = `<p class=muted>${tr("cr.wait")}</p>`;
        let j; try { j = await (await fetch(rel + "api/pro/contract", { method: "POST", body: fdata })).json(); } catch (e) { j = { ok: false, error: tr("cr.err") }; }
        btn.disabled = false; track("contract", cis.value);
        if (!j.ok) { out.innerHTML = `<p class=bad>${esc(j.error || tr("cr.err"))}</p>`; return; }
        if (j.pro) store.set("cio-pro-code", cr.elements.code.value.trim());
        const lab = Object.fromEntries(sources(X())), chk = c => `<span class="crchk ${/^found/.test(c || "") ? "ok" : ""}">${esc(c || "")}</span>`;
        const q = (t, p) => t ? `<span class=crq>“${esc(t)}”${p ? ` · p. ${p}` : ""}</span>` : "";
        if (!j.found || !j.elements.length) { out.innerHTML = `<h4>${tr("cr.none")}</h4><p>${esc(j.note)}</p>`; return; }
        out.innerHTML = `<h4>${tr("cr.found")}</h4><p class=muted>${esc(j.note)}</p>
          <div class=tablewrap><table class="glance fd-table"><thead><tr><th>${tr("fd.el")}</th><th>${tr("fd.coef")}</th><th>${tr("cr.idx")}</th><th>${tr("fd.src")}</th><th>${tr("cr.check")}</th></tr></thead><tbody>
          <tr><td>${tr("cr.base")}</td><td>${esc(j.base_date || "–")}</td><td>${q(j.base_date_quote, j.base_date_page)}</td><td></td><td>${chk(j.base_date_check)}</td></tr>
          ${j.fixed_coef != null ? `<tr><td>${tr("cr.fixed")}</td><td>${j.fixed_coef}</td><td>${q(j.fixed_quote, j.fixed_page)}</td><td>${tr("fd.notadj")}</td><td>${chk(j.fixed_check)}</td></tr>` : ""}
          ${j.elements.map(x => `<tr><td>${esc(x.label)}</td><td>${x.coef}</td><td>${esc(x.index_named)}${q(x.quote, x.page)}</td><td>${esc(lab[x.source] || tr("fd.manual"))}</td><td>${chk(x.check)}</td></tr>`).join("")}
          </tbody></table></div>
          <p>${j.sum_ok ? tr("cr.sumok") : `<span class=bad>${tr("cr.sumbad", { s: j.sum })}</span>`}</p>
          <p class=actions><button type=button class="btn primary" data-cr-use>${tr("cr.use")}</button></p>`;
        $("[data-cr-use]", out).onclick = () => { if (j.base_date) st.base = j.base_date;
          st.sched = [...(j.fixed_coef != null ? [{ el: tr("fd.fixed"), coef: j.fixed_coef, src: "fixed" }] : []),
            ...j.elements.map(x => ({ el: x.label, coef: x.coef, src: x.source }))];
          all(); out.insertAdjacentHTML("beforeend", `<p class=good>${tr("cr.used")}</p>`); fd.scrollIntoView({ behavior: "smooth" }); }; }; }
    all();
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
    statsRow(); const text = `CiO Cost Call ${today}\n${grid} ${score}/5\nWill construction costs rise? Play: CiO Costs`;
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
