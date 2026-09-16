// Verificador de guion en vivo (seis reglas de ejemplo, sin servidor) y calculadora de horas.
(function () {
  const reglas = [
    { code: "G01", sev: "block", re: /(tipo de cambio|exchange rate)[^.]{0,40}\d|\d+[.,]\d+\s*(pesos|quetzales|lempiras|soles|reales)\s*por\s*(d[óo]lar|euro)|el d[óo]lar est[áa] a \d/i, msg: "Menciona una cifra de tipo de cambio. Di que se ve en la app antes de enviar." },
    { code: "G02", sev: "block", re: /\b(al instante|instant[áa]neo|instantly|en segundos|in seconds|en 30 segundos)\b/i, msg: "Promete velocidad absoluta. Cambia a 'rápido' o 'puede llegar en minutos, según el banco'." },
    { code: "G03", sev: "block", re: /\b(gratis|sin comisi[óo]n(es)?|cero comisiones|no cobran|no fees|free)\b/i, msg: "Dice que es gratis o sin comisiones. Cambia a 'comisiones bajas: ves el costo total antes de enviar'." },
    { code: "G04", sev: "block", re: /\b(garantizado|garantizada|guaranteed|siempre llega|nunca falla)\b/i, msg: "Garantiza entrega o resultado. Habla de tu experiencia, sin garantías." },
    { code: "G07", sev: "warn", re: /\b(western union|remitly|xoom|moneygram)\b/i, msg: "Nombra a un competidor. Quita la comparación." },
  ];
  const promo = "JORGE10";
  const divulg = /(#ad\b|#publicidad|colaboraci[óo]n pagada|paid partnership)/i;
  const guion = document.getElementById("guion");
  const ver = document.getElementById("veredicto");
  const lista = document.getElementById("hallazgos");
  function evaluar() {
    const t = guion.value;
    const h = [];
    for (const r of reglas) { const m = t.match(r.re); if (m) h.push({ ...r, ev: m[0] }); }
    if (!divulg.test(t)) h.push({ code: "G05", sev: "block", ev: "sin #publicidad", msg: "No dice que es publicidad. Agrega #publicidad o 'colaboración pagada con Sendwave'." });
    if (!t.toUpperCase().replace(/\s+/g, "").includes(promo)) h.push({ code: "G06", sev: "block", ev: "código " + promo + " ausente", msg: "No menciona el código promocional registrado (" + promo + ")." });
    const bloqueos = h.filter((x) => x.sev === "block").length;
    ver.className = "veredicto " + (bloqueos ? "veredicto-changes" : "veredicto-pass");
    ver.innerHTML = bloqueos
      ? `<span class="ojo">${bloqueos} bloqueo${bloqueos > 1 ? "s" : ""} · ${h.length - bloqueos} aviso${h.length - bloqueos === 1 ? "" : "s"}</span><strong>Necesita cambios antes de enviarse</strong>`
      : `<span class="ojo">0 bloqueos · ${h.length} aviso${h.length === 1 ? "" : "s"}</span><strong>Pasa a revisión del equipo</strong>`;
    lista.innerHTML = h.map((x) => `<div class="hallazgo ${x.sev}"><span class="t">${x.code}</span><span><q>${esc(x.ev)}</q><br>${esc(x.msg)}</span></div>`).join("");
  }
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  guion.addEventListener("input", evaluar);
  evaluar();

  // Calculadora
  const $ = (id) => document.getElementById(id);
  const ids = ["piezas", "min", "rev", "costo", "pct"];
  function calc() {
    const v = Object.fromEntries(ids.map((k) => [k, +$("s-" + k).value]));
    ids.forEach((k) => ($("o-" + k).textContent = v[k]));
    const hoy = (v.piezas * v.min * v.rev) / 60;
    const llegan = v.piezas * (1 - v.pct / 100);
    const hub = (llegan * 4 * v.rev) / 60;
    const ahorro = Math.max(0, hoy - hub);
    const f = (n) => Math.round(n).toLocaleString("es-MX");
    $("r-horas-hoy").textContent = f(hoy);
    $("r-horas-hub").textContent = f(hub);
    $("r-ahorro").textContent = f(ahorro) + " h";
    $("r-usd").textContent = "USD " + f(ahorro * v.costo);
  }
  ids.forEach((k) => $("s-" + k).addEventListener("input", calc));
  calc();

  // Sección activa en la barra
  const enlaces = [...document.querySelectorAll(".nav a")];
  const obs = new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting) enlaces.forEach((a) => a.classList.toggle("activo", a.getAttribute("href") === "#" + e.target.id)); }); }, { rootMargin: "-40% 0px -55% 0px" });
  document.querySelectorAll("main section[id]").forEach((s) => obs.observe(s));
})();
