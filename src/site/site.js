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
