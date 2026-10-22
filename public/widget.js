/* CiO Costs website widget.
   <div data-cio-costs="uganda" data-lang="en" data-theme="auto"></div>
   <script async src="https://<cio-costs-site>/widget.js"></script>
   Each placeholder becomes an iframe that sizes itself to its content. */
(function () {
  var s = document.currentScript, base = s ? s.src.replace(/widget\.js(\?.*)?$/, "") : "";
  function mount(el) {
    if (el.getAttribute("data-cio-mounted")) return; el.setAttribute("data-cio-mounted", "1");
    var f = document.createElement("iframe"), id = "cio" + Math.random().toString(36).slice(2);
    f.src = base + "embed.html?c=" + encodeURIComponent(el.getAttribute("data-cio-costs") || "uganda") +
      "&lang=" + encodeURIComponent(el.getAttribute("data-lang") || "") + "&theme=" + encodeURIComponent(el.getAttribute("data-theme") || "auto") + "&id=" + id;
    f.id = id; f.title = "Construction cost outlook — CiO Costs"; f.loading = "lazy";
    f.style.cssText = "border:0;width:100%;max-width:380px;height:300px;display:block;background:transparent";
    el.appendChild(f);
  }
  window.addEventListener("message", function (e) {
    var d = e.data; if (!d || d.cio !== "h") return;
    var f = document.getElementById(d.id); if (f && e.source === f.contentWindow) f.style.height = Math.ceil(d.h) + "px";
  });
  function go() { [].forEach.call(document.querySelectorAll("[data-cio-costs]"), mount); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
})();
