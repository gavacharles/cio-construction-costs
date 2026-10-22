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
    el.dataset.trend = q.median > 0.05 ? "rising" : (q.median < -0.05 ? "easing" : "flat");
    const fan = $(".fan", el); if (fan) { const xs = JSON.parse(fan.dataset.xs || "{}"), mk = $(".marker", fan), m = tMonth(tg);
      const x = xs[m] || xs[Object.keys(xs).filter(k => k <= m).pop()]; if (mk && x) { mk.setAttribute("x1", x); mk.setAttribute("x2", x); } }
    $$("tr[data-mat]").forEach(row => { const pth = c.paths[row.dataset.mat] || (row.dataset.mat === "Reinforcement steel" ? c.paths["Rebar"] : null);
      const cell = $("[data-mexp]", row); if (cell) { const x = at(pth, tg); cell.textContent = x ? `${pct(x.q.median)}  (${pct(x.q.lo)} – ${pct(x.q.hi)})` : tr("notsep"); } });
  }

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
