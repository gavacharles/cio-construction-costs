/* CiO Costs — public site behaviour: theme, date picker, filters, search, sorting, The Cost Call. */
(function () {
  "use strict";
  const DATA = JSON.parse(document.getElementById("cio-data").textContent);
  const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
  };
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const label = m => MON[+m.slice(5) - 1] + " " + m.slice(0, 4);
  const pct = (v, d = 1) => { const r = +v.toFixed(d); return (r > 0 ? "+" : "") + (r === 0 ? (0).toFixed(d) : r.toFixed(d)) + "%"; };
  const qlabel = (m, step) => step === "quarter" ? "Q" + (Math.floor((+m.slice(5) - 1) / 3) + 1) + " " + m.slice(0, 4) : label(m);

  /* ---------- theme ---------- */
  const root = document.documentElement, tb = $("#theme"), order = ["auto", "light", "dark"], icon = { auto: "◐", light: "☀", dark: "☾" };
  let theme = store.get("cio-theme", "auto");
  function setTheme(v) { theme = v; v === "auto" ? root.removeAttribute("data-theme") : root.setAttribute("data-theme", v);
    if (tb) { tb.textContent = icon[v]; tb.setAttribute("aria-label", "Theme: " + v); } store.set("cio-theme", v); }
  setTheme(theme); if (tb) tb.onclick = () => setTheme(order[(order.indexOf(theme) + 1) % 3]);

  /* ---------- forecast maths ---------- */
  function erf(x) { const s = Math.sign(x); x = Math.abs(x); const t = 1 / (1 + 0.3275911 * x);
    return s * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)); }
  function at(path, m) { if (!path || !path.length) return null; let best = null;
    for (const q of path) if (q.month <= m) best = q; return best ? { q: best, beyond: m > path[path.length - 1].month } : { q: path[0], before: true }; }
  function chance(q) { const sd = (q.hi - q.lo) / (2 * 1.2816); if (!(sd > 0)) return q.median > 0 ? 0.99 : 0.01;
    return Math.min(0.99, Math.max(0.01, 0.5 * (1 + erf(q.median / (sd * Math.SQRT2))))); }
  function question(c, m) { return c.official ? `Will ${c.country}'s construction input prices rise by ${label(m)}?`
                                              : `Will import costs push ${c.country}'s building prices up by ${label(m)}?`; }
  function advice(c, q, m) {
    if (!c.official) return Math.abs(q.median) < 0.25 ? `Import costs look roughly flat to ${label(m)}, but the range is wide — check supplier quotes before fixing prices.`
      : `Import costs point ${q.median > 0 ? "up" : "down"} about ${Math.abs(q.median).toFixed(1)}% by ${label(m)} — check supplier quotes before fixing prices.`;
    if (q.median >= 0.25) return `Allow about ${pct(q.median)} on quotes for work priced to ${label(m)}, compared with ${c.base} prices.`;
    if (q.median <= -0.25) return `Prices may ease about ${Math.abs(q.median).toFixed(1)}% by ${label(m)} — consider delaying bulk buying.`;
    return `Little change expected to ${label(m)} — ${c.base} prices are a fair guide.`; }
  function spark(c) { const v = (c.spark || {}).values || []; if (v.length < 2) return "";
    const lo = Math.min(...v), hi = Math.max(...v), sp = hi - lo || 1;
    const pts = v.map((x, i) => `${(i * 116 / (v.length - 1) + 2).toFixed(1)},${(35 - (x - lo) * 30 / sp).toFixed(1)}`).join(" ");
    return `<svg class=spark viewBox="0 0 120 38" preserveAspectRatio=none aria-hidden=true><polygon points="2,38 ${pts} 118,38"/><polyline points="${pts}"/></svg>`; }

  /* ---------- fill a block (card / featured / country page) for month m ---------- */
  function fill(el, c, m) {
    const r = at(c.paths[c.head], m); if (!r) return; const q = r.q, p = chance(q);
    const set = (sel, html) => { const x = $(sel, el); if (x) x.innerHTML = html; };
    set("[data-q]", question(c, r.beyond ? q.month : m) + (r.beyond ? ` <small class=muted>(furthest forecast)</small>` : ""));
    set("[data-pct]", Math.round(p * 100) + "%");
    set("[data-exp]", pct(q.median)); set("[data-rng]", `${pct(q.lo)} to ${pct(q.hi)}`);
    set("[data-advice]", advice(c, q, r.beyond ? q.month : m));
    const bar = $("[data-bar]", el); if (bar) bar.style.width = Math.round(p * 100) + "%";
    const sl = $("[data-spark]", el); if (sl && !sl.innerHTML) sl.innerHTML = spark(c);
    const br = $("[data-breakdown]", el);
    if (br) br.innerHTML = Object.entries(c.paths).map(([n, pth]) => { const x = at(pth, m); return x ? `<li><span>${n}</span><b>${pct(x.q.median)}</b></li>` : ""; }).join("");
    el.dataset.trend = q.median > 0.05 ? "rising" : (q.median < -0.05 ? "easing" : "flat");
    const fan = $(".fan", el); if (fan) { const xs = JSON.parse(fan.dataset.xs || "{}"); const mk = $(".marker", fan);
      const x = xs[m] || xs[Object.keys(xs).filter(k => k <= m).pop()]; if (mk && x) { mk.setAttribute("x1", x); mk.setAttribute("x2", x); } }
    $$("tr[data-mat]", document).forEach(tr => { const pth = c.paths[tr.dataset.mat] || (tr.dataset.mat === "Reinforcement steel" ? c.paths["Rebar"] : null);
      const cell = $("[data-mexp]", tr); if (cell) { const x = at(pth, m); cell.textContent = x ? pct(x.q.median) + "  (" + pct(x.q.lo) + " to " + pct(x.q.hi) + ")" : "–"; } });
    return { q, p };
  }

  /* ---------- date picker ---------- */
  const when = $("#when");
  let month = store.get("cio-when", DATA.default); if (!DATA.months || DATA.months.indexOf(month) < 0) month = DATA.default;
  function render() {
    $$("[data-when-label]").forEach(x => x.textContent = month ? label(month) : "");
    $$(".card[data-key], .featured[data-key]").forEach(el => { const c = DATA.countries[el.dataset.key]; if (c) fill(el, c, month); });
    $$("#glance-table tbody tr").forEach(tr => { const c = DATA.countries[tr.dataset.key]; if (!c) return;
      const r = at(c.paths[c.head], month), q = r.q, p = chance(q), d = c.drivers || {};
      const cell = k => $(`[data-g=${k}]`, tr);
      const offY = c.materials && c.materials.length ? null : null;
      cell("exp").textContent = pct(q.median); cell("exp").dataset.v = q.median;
      cell("rng").textContent = `${pct(q.lo)} to ${pct(q.hi)}`;
      cell("pct").textContent = Math.round(p * 100) + "%"; cell("pct").dataset.v = p;
      const fx = d.fx_13w_pct; cell("fx").innerHTML = fx == null ? "–" : `<span class=${fx > 0 ? "up" : "down"}>${fx > 0 ? "weaker" : "stronger"} ${Math.abs(fx).toFixed(1)}%</span>`;
      cell("fx").dataset.v = fx == null ? 0 : fx;
      const of = cell("official"); if (of && !of.textContent.trim()) { const h = (c.spark || {}).values || [];
        const yr = c.step === "quarter" ? 4 : 12; if (c.official && h.length > yr) { const v = (h[h.length - 1] / h[h.length - 1 - yr] - 1) * 100; of.textContent = pct(v); of.dataset.v = v; } else { of.textContent = "–"; of.dataset.v = -999; } } });
    applyFilters();
  }
  if (when) { when.value = month; when.onchange = () => { month = when.value; store.set("cio-when", month); $$("#when").forEach(s => s.value = month); render(); }; }

  /* ---------- filters + search ---------- */
  const tabs = $$(".tabs button"), qbox = $("#q"), count = $("#count"), empty = $("#empty");
  let tab = "all";
  function applyFilters() {
    const cards = $$("#grid .card"); if (!cards.length) return; const s = (qbox && qbox.value || "").trim().toLowerCase(); let n = 0;
    cards.forEach(c => { const d = c.dataset;
      const okTab = tab === "all" || (tab === "official" || tab === "indicator" ? d.type === tab : (tab === "rising" || tab === "easing") ? d.trend === tab : d.region === tab);
      const ok = okTab && (!s || d.search.indexOf(s) >= 0); c.hidden = !ok; if (ok) n++; });
    if (count) count.textContent = `${n} of ${cards.length} countries`; if (empty) empty.style.display = n ? "none" : "block";
  }
  tabs.forEach(b => b.onclick = () => { tab = b.dataset.tab; tabs.forEach(x => x.setAttribute("aria-pressed", String(x === b))); applyFilters(); });
  if (qbox) qbox.addEventListener("input", applyFilters);

  /* ---------- sortable table ---------- */
  $$("#glance-table thead th[data-sort]").forEach((th, i) => { let asc = false; th.onclick = () => { asc = !asc;
    const tbody = $("#glance-table tbody"), rows = $$("tr", tbody), num = th.dataset.sort === "num";
    rows.sort((a, b) => { const A = a.children[i], B = b.children[i];
      const va = num ? parseFloat(A.dataset.v ?? A.textContent) : A.textContent.trim(), vb = num ? parseFloat(B.dataset.v ?? B.textContent) : B.textContent.trim();
      return (va > vb ? 1 : va < vb ? -1 : 0) * (asc ? 1 : -1); }).forEach(r => tbody.appendChild(r)); }; });

  render();

  /* ---------- The Cost Call ---------- */
  const game = $("#game"); if (!game || !DATA.quiz) return;
  const today = new Date().toISOString().slice(0, 10);
  function seeded(seed) { let h = 2166136261; for (const ch of seed) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 1e6) / 1e6; }; }
  const focus = (location.hash || "").slice(1);
  function todaysQuestions() {
    const rnd = seeded("cio" + today), pool = DATA.quiz.slice(), picked = [], usedC = {};
    while (picked.length < 5 && pool.length) { const i = Math.floor(rnd() * pool.length), q = pool.splice(i, 1)[0];
      if ((usedC[q.key] || 0) >= 2) continue; usedC[q.key] = (usedC[q.key] || 0) + 1; picked.push(q); }
    return picked; }
  const Q = todaysQuestions();
  let st = store.get("cio-call", {}); if (st.date !== today) st = { date: today, answers: [] };
  const stats = store.get("cio-call-stats", { played: 0, wins: 0, streak: 0, best: 0, last: null });
  const per = q => q.step === "quarter" ? "quarter" : "month";
  function statsRow() { const box = $("#stats"); if (!box) return;
    box.innerHTML = [["Played", stats.played], ["Avg score", stats.played ? (stats.wins / stats.played).toFixed(1) + "/5" : "–"], ["Streak", stats.streak], ["Best", stats.best]]
      .map(([k, v]) => `<div class=stat><b>${v}</b><span>${k}</span></div>`).join(""); }
  function progress() { return `<div class=progress>${Q.map((_, i) => `<i class="${i < st.answers.length ? (st.answers[i] ? "ok" : "no") : (i === st.answers.length ? "on" : "")}"></i>`).join("")}</div>`; }
  function ask() {
    const i = st.answers.length; if (i >= Q.length) return finish(); const q = Q[i];
    const per_ = q.step === "quarter" ? `the quarter starting ${label(q.period)}` : label(q.period);
    game.innerHTML = `<div class=qcard>${progress()}<div class=flag>${q.flag}</div>
      <h2>In ${per_}, did <u>${q.material.toLowerCase()}</u> prices in ${q.country} go up or down?</h2>
      <div class=choices><button class=choice data-a=up>↑ Up</button><button class=choice data-a=down>↓ Down</button></div><div class=reveal></div></div>`;
    $$(".choice", game).forEach(b => b.onclick = () => {
      const up = q.change > 0, right = (b.dataset.a === "up") === up; st.answers.push(right); store.set("cio-call", st);
      $$(".choice", game).forEach(x => { x.disabled = true; if ((x.dataset.a === "up") === up) x.classList.add("right"); else if (x === b) x.classList.add("wrong"); });
      $(".reveal", game).innerHTML = `${right ? "✅ Right." : "❌ Not this time."} Official figure: <b>${pct(q.change)}</b> on the previous ${per(q)}.
        <div class=actions style="justify-content:center"><a class=btn href="countries/${q.key}/index.html">See ${q.country}'s costs</a>
        <button class="btn primary" id=next>${st.answers.length < Q.length ? "Next call →" : "See my score"}</button></div>`;
      $("#next").onclick = ask; });
  }
  function finish() {
    const score = st.answers.filter(Boolean).length, grid = st.answers.map(a => a ? "🟩" : "🟥").join("");
    if (stats.last !== today) { const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      stats.played++; stats.wins += score; stats.streak = (stats.last === y ? stats.streak : 0) + 1; stats.best = Math.max(stats.best, stats.streak); stats.last = today; store.set("cio-call-stats", stats); }
    statsRow();
    const text = `CiO Cost Call ${today}\n${grid} ${score}/5\nWill building costs rise? Play: CiO Costs`;
    game.innerHTML = `<div class=qcard>${progress()}<h2>You called ${score} of 5</h2><div class=result-grid>${grid}</div>
      <p class=muted>New calls tomorrow. Streak: ${stats.streak} day${stats.streak === 1 ? "" : "s"}.</p>
      <div class=actions style="justify-content:center"><button class="btn primary" id=share>Share result</button><a class=btn href="index.html#countries">Explore costs</a></div></div>`;
    $("#share").onclick = async () => { try { if (navigator.share) await navigator.share({ text }); else { await navigator.clipboard.writeText(text); $("#share").textContent = "Copied ✓"; } }
      catch (e) { $("#share").textContent = "Copy: " + grid; } };
  }
  statsRow(); ask();

  /* this week's calls: next official print per country with an official index */
  const calls = $("#calls"), mine = store.get("cio-weekly-calls", {});
  if (calls) {
    const cs = Object.entries(DATA.countries).filter(([, c]) => c.official).sort(([a], [b]) => (a === focus ? -1 : b === focus ? 1 : 0));
    calls.innerHTML = cs.map(([k, c]) => { const q = c.paths[c.head][0], p = chance(q), id = k + ":" + q.month, my = mine[id];
      return `<article class="card callcard" data-id="${id}"><div class=card-top><span class=flag>${c.flag}</span><a class=country href="countries/${k}/index.html">${c.country}</a><span class=chip>Next official release</span></div>
        <h3 class=q>Will ${c.head.toLowerCase()} be higher in ${qlabel(q.month, c.step)} than in ${c.base}?</h3>
        ${my ? `<p>Your call: <b>${my.a === "up" ? "Higher" : "Lower"}</b> at ${my.c}% confidence.<br>Model: <b>${Math.round(p * 100)}%</b> chance it is higher. Scored when the official figure is published.</p>`
             : `<label class=muted>How sure are you? <b class=cv>70</b>%<input class=conf type=range min=50 max=95 step=5 value=70></label>
                <div class=row><button class=choice data-a=up>↑ Higher</button><button class=choice data-a=down>↓ Lower</button></div>`}
        <div class=card-foot><a class=link href="countries/${k}/index.html">See the inputs driving ${c.country}'s costs →</a></div></article>`; }).join("");
    $$(".callcard", calls).forEach(card => { const r = $(".conf", card); if (r) r.oninput = () => $(".cv", card).textContent = r.value;
      $$(".choice", card).forEach(b => b.onclick = () => { mine[card.dataset.id] = { a: b.dataset.a, c: +r.value, at: today }; store.set("cio-weekly-calls", mine); location.reload(); }); });
  }
})();
