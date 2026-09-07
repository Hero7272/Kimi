(async function () {
  const strip = document.getElementById("strip");
  const toast = document.getElementById("toast");
  const btnText = document.getElementById("btnText");
  const btnBack = document.getElementById("btnBack");

  function showToast(msg) {
    toast.hidden = false;
    toast.textContent = msg;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { toast.hidden = true; }, 2200);
  }

  btnText.addEventListener("click", () => {
    document.body.classList.toggle("hide-text");
    showToast(document.body.classList.contains("hide-text") ? "Nur Bilder" : "Texte an");
  });
  btnBack.addEventListener("click", () => {
    if (history.length > 1) history.back();
    else showToast("Fleisch & Thron — K1");
  });

  let data;
  try {
    const res = await fetch("data/k1-script.json", { cache: "no-store" });
    if (!res.ok) throw new Error("script " + res.status);
    data = await res.json();
  } catch (e) {
    strip.innerHTML = `<div class="missing">Script fehlt oder Server nötig (Datei-Protokoll blockiert fetch).<br/>Öffne über einen lokalen Server.</div>`;
    console.error(e);
    return;
  }

  document.getElementById("serie").textContent = data.serie || "Fleisch & Thron";
  document.getElementById("episode").textContent = data.episode || "K1";
  document.title = `${data.serie || "Webtoon"} — ${data.episode || "K1"}`;

  const panels = Array.isArray(data.panels) ? data.panels.slice().sort((a, b) => a.n - b.n) : [];
  if (!panels.length) {
    strip.innerHTML = `<div class="missing">Keine Panels im Script.</div>`;
    return;
  }

  const frag = document.createDocumentFragment();
  for (const p of panels) {
    const file = p.file || String(p.n).padStart(2, "0") + ".png";
    const wrap = document.createElement("article");
    wrap.className = "panel-block";
    wrap.id = "p" + p.n;

    const figure = document.createElement("figure");
    figure.className = "panel";
    const badge = document.createElement("span");
    badge.className = "n";
    badge.textContent = String(p.n).padStart(2, "0");
    const img = document.createElement("img");
    img.loading = "lazy";
    img.alt = p.beat || ("Panel " + p.n);
    img.src = "panels/" + file;
    img.onerror = () => {
      img.replaceWith(Object.assign(document.createElement("div"), {
        className: "missing",
        textContent: "Panel " + p.n + " fehlt noch (" + file + ")"
      }));
    };
    figure.append(badge, img);
    wrap.appendChild(figure);

    if (p.caption) {
      const cap = document.createElement("div");
      cap.className = "caption";
      cap.textContent = p.caption;
      wrap.appendChild(cap);
    }

    if (Array.isArray(p.dialogue) && p.dialogue.length) {
      const box = document.createElement("div");
      box.className = "bubbles";
      for (const d of p.dialogue) {
        const b = document.createElement("div");
        const who = (d.who || "").toLowerCase();
        b.className = "bubble" + (who === "system" ? " system" : "");
        if (d.who) {
          const w = document.createElement("span");
          w.className = "who";
          w.textContent = d.who;
          b.appendChild(w);
        }
        b.appendChild(document.createTextNode(d.text || ""));
        box.appendChild(b);
      }
      wrap.appendChild(box);
    }

    frag.appendChild(wrap);
  }
  strip.appendChild(frag);
})();
