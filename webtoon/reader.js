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
    else location.href = "./index.html";
  });

  const ep = (document.body.dataset.ep || "k1").toLowerCase();
  const panelDir = ep === "k1" ? "panels/" : ("panels/" + ep + "/");

  let data;
  try {
    let res = await fetch("data/" + ep + "-script.json", { cache: "no-store" });
    if (!res.ok) res = await fetch(ep + "-script.json", { cache: "no-store" });
    if (!res.ok) throw new Error("script " + res.status);
    data = await res.json();
  } catch (e) {
    strip.innerHTML = `<div class="missing">Script fehlt. Bitte über HTTP öffnen.</div>`;
    return;
  }

  document.getElementById("serie").textContent = data.serie || "Fleisch & Thron";
  document.getElementById("episode").textContent = data.episode || ep.toUpperCase();
  document.title = `${data.serie || "Webtoon"} — ${data.episode || ep.toUpperCase()}`;

  const panels = (data.panels || []).slice().sort((a, b) => a.n - b.n);
  const frag = document.createDocumentFragment();

  for (const p of panels) {
    const file = p.file || String(p.n).padStart(2, "0") + ".png";
    const art = document.createElement("article");
    art.className = "panel";
    art.id = "p" + p.n;

    const img = document.createElement("img");
    img.loading = "lazy";
    img.alt = p.beat || ("Panel " + p.n);
    img.src = panelDir + file;
    img.onerror = () => {
      const m = document.createElement("div");
      m.className = "missing";
      m.textContent = "Panel " + p.n + " fehlt noch";
      img.replaceWith(m);
    };

    const layout = p.text_layout || {};
    const layer = document.createElement("div");
    layer.className = "layer" + (layout.caption === "top" ? " top" : "");

    if (Array.isArray(p.sfx) && p.sfx.length) {
      for (const s of p.sfx) {
        const el = document.createElement("div");
        el.className = "sfx-on";
        el.textContent = s;
        layer.appendChild(el);
      }
    }

    if (Array.isArray(p.dialogue) && p.dialogue.length) {
      const box = document.createElement("div");
      box.className = "bubbles-on";
      for (const d of p.dialogue) {
        const b = document.createElement("div");
        const style = (d.style || "").toLowerCase();
        const who = (d.who || "").toLowerCase();
        b.className = "bubble-on" + (who === "system" || style === "system" ? " system" : "") + (style === "distant" ? " distant" : "");
        if (d.who && who !== "system") {
          const w = document.createElement("span");
          w.className = "who";
          w.textContent = d.who;
          b.appendChild(w);
        } else if (who === "system") {
          const w = document.createElement("span");
          w.className = "who";
          w.textContent = "System";
          b.appendChild(w);
        }
        b.appendChild(document.createTextNode(d.text || ""));
        box.appendChild(b);
      }
      layer.appendChild(box);
    }

    if (p.caption) {
      const cap = document.createElement("div");
      cap.className = "caption-on";
      cap.textContent = p.caption;
      layer.appendChild(cap);
    }

    art.append(img, layer);
    frag.appendChild(art);
  }
  strip.appendChild(frag);
})();
