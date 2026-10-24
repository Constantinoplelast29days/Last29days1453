// Oyun motoru: story.js'teki sahneleri okuyup çizer.
// Metinler ve sahneler story.js'te; burada metin yazılmaz.

const gameScreen = document.getElementById("game-screen");
const dateLabel = document.getElementById("date-label");
const languageButton = document.getElementById("language-button");
const footer = document.getElementById("footer");
const disclaimerBadge = document.getElementById("disclaimer-badge");
const versionBadge = document.getElementById("version-badge");
const sceneAnnouncer = document.getElementById("scene-announcer");

// Sağ üstteki sürüm etiketi; her değişiklikte 0.0.1 artırılır
const APP_VERSION = "0.1.0-alpha";

// Oyun günleri: 1. gün 30 Nisan 1453
const FIRST_DAY = Date.UTC(1453, 3, 30);

const SIDES = { ottoman: "sideOttoman", byzantine: "sideByzantine" };

let language = loadLanguage();
let currentSceneId = STORY.start;
// Tarihsel olmayan bir seçimin sonuç ekranındaysak seçeneğin sırası, değilse null
let currentResult = null;

// Karar sahnelerindeki seçenek sırası: sahneye ilk gelişte rastgele belirlenir,
// dil değişince korunur, "Başa Dön"de sıfırlanır.
const choiceOrders = new Map();

// Seçilen dildeki arayüz metnini getir
function t(key) {
  return translations[language][key];
}

// Arayüz metninin iki dildeki hâli (motorun kendi düğmeleri için)
function both(key) {
  return { en: translations.en[key], tr: translations.tr[key] };
}

// Sahnedeki { en, tr } metninin seçilen dildeki hâlini getir
function localize(text) {
  return text[language];
}

function loadLanguage() {
  try {
    const saved = localStorage.getItem("language");
    if (saved in translations) return saved;
  } catch (error) {}
  return "en";
}

function findScene(id) {
  const scene = STORY.scenes.find((scene) => scene.id === id);
  if (!scene) throw new Error(`Sahne bulunamadı: "${id}"`);
  return scene;
}

// Karar sahnesi: biçimi belirtilmemiş birden fazla seçenek
function isDecision(scene) {
  const choices = scene.choices || [];
  return choices.length > 1 && choices.every((choice) => !choice.style);
}

// story.js'i kontrol eder; sorunları konsola uyarı olarak yazar, oyunu durdurmaz.
// Yazım ekibi story.js'i düzenledikten sonra tarayıcı konsoluna bakabilir.
function validateStory() {
  const warn = (message) => console.warn(`[story.js] ${message}`);
  const ids = new Set();

  // { en, tr } metninin iki dilde de dolu olduğunu kontrol et
  function checkText(text, where, allowEmpty = false) {
    if (!text || typeof text !== "object") {
      warn(`${where}: metin { en: "...", tr: "..." } biçiminde değil.`);
      return;
    }
    for (const lang of ["en", "tr"]) {
      const value = text[lang];
      if (typeof value !== "string" || (!allowEmpty && !value.trim())) {
        warn(`${where}: "${lang}" metni eksik.`);
      }
    }
  }

  // Arayüz metinleri: her anahtar iki dilde de olmalı
  for (const [lang, other] of [["en", "tr"], ["tr", "en"]]) {
    for (const key of Object.keys(translations[lang] || {})) {
      if (!(key in (translations[other] || {}))) {
        warn(`translations.${other} içinde "${key}" eksik.`);
      }
    }
  }

  STORY.scenes.forEach((scene, index) => {
    if (!scene.id) {
      warn(`${index + 1}. sahnenin id'si yok.`);
    } else if (ids.has(scene.id)) {
      warn(`"${scene.id}" id'si birden fazla sahnede kullanılmış.`);
    }
    ids.add(scene.id);
  });

  if (!ids.has(STORY.start)) {
    warn(`STORY.start "${STORY.start}" adlı bir sahneyi gösteriyor ama böyle bir sahne yok.`);
  }

  const endings = new Set(
    STORY.scenes.filter((scene) => scene.ending).map((scene) => scene.id)
  );

  STORY.scenes.forEach((scene, index) => {
    const name = scene.id ? `"${scene.id}" sahnesi` : `${index + 1}. sahne`;

    if (scene.side && !(scene.side in SIDES)) {
      warn(`${name}: side "ottoman" ya da "byzantine" olmalı, "${scene.side}" yazılmış.`);
    }
    if (scene.dateText) checkText(scene.dateText, `${name}, dateText`);
    if (scene.eyebrow) checkText(scene.eyebrow, `${name}, eyebrow`);
    if (!scene.ending) checkText(scene.title, `${name}, title`);
    (scene.paragraphs || []).forEach((text, i) =>
      checkText(text, `${name}, ${i + 1}. paragraf`)
    );
    (scene.reports || []).forEach((report, i) => {
      checkText(report.who, `${name}, ${i + 1}. rapor, who`);
      checkText(report.text, `${name}, ${i + 1}. rapor, text`);
    });
    if (scene.note) checkText(scene.note, `${name}, note`);
    if (scene.ending && !scene.note) {
      warn(`${name}: son sahnesinde "Tarihte ne oldu" notu (note) eksik.`);
    }
    if (scene.infoBox) {
      checkText(scene.infoBox.title, `${name}, infoBox.title`);
      checkText(scene.infoBox.text, `${name}, infoBox.text`);
    }

    const decision = isDecision(scene);
    (scene.choices || []).forEach((choice, i) => {
      checkText(choice.text, `${name}, ${i + 1}. düğme`);
      if (!ids.has(choice.next)) {
        warn(`${name}, ${i + 1}. düğme: "next" değeri "${choice.next}" ama böyle bir sahne yok.`);
      }
      if (decision && typeof choice.historical !== "boolean") {
        warn(`${name}, ${i + 1}. seçenek: "historical: true" ya da "historical: false" eksik.`);
      }
      // Son sahnesine giden seçenekte sonuç, son ekranında gösterilir
      if (choice.historical === false && !endings.has(choice.next)) {
        if (choice.result) {
          checkText(choice.result, `${name}, ${i + 1}. seçenek, result`);
        } else {
          warn(`${name}, ${i + 1}. seçenek: "historical: false" ama sonuç metni (result) yok.`);
        }
      }
    });

    if (scene.image) {
      if (!scene.image.startsWith("assets/")) {
        warn(`${name}: görsel assets/ ile başlamıyor: ${scene.image}`);
      }
      // Dosya adı yanlışsa resim yüklenemez
      const image = new Image();
      image.onerror = () => warn(`${name}: görsel bulunamadı: ${scene.image}`);
      image.src = scene.image;
    }
  });

  STORY.sources.forEach((source, i) => checkText(source, `${i + 1}. kaynak`));
  checkText(STORY.imageNote, "imageNote", true);
}

// Üst çubuktaki tarih: sahnede dateText varsa aynen, yoksa oyun gününden hesaplanır
function setDate(scene) {
  if (scene.dateText) {
    dateLabel.textContent = localize(scene.dateText);
    return;
  }
  const date = new Date(FIRST_DAY + (scene.day - 1) * 24 * 60 * 60 * 1000);
  const month = t("months")[date.getUTCMonth()];
  dateLabel.textContent =
    `${date.getUTCDate()} ${month} ${date.getUTCFullYear()}`;
}

// Karar sahnesinin seçeneklerini bu oyundaki (rastgele) sırasıyla getir
function orderedChoices(scene) {
  if (!isDecision(scene)) return scene.choices || [];
  if (!choiceOrders.has(scene.id)) {
    const order = scene.choices.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    choiceOrders.set(scene.id, order);
  }
  return choiceOrders.get(scene.id).map((i) => scene.choices[i]);
}

// Düğmeler; data-index, çizilen seçenek listesindeki sırayı gösterir
function buttonHtml(choice, index) {
  const style =
    choice.style === "secondary" ? "secondary-button" : "primary-button";
  return `
    <button class="${style}" data-index="${index}">
      ${localize(choice.text)}
    </button>
  `;
}

function choicesHtml(choices) {
  // Tek düğme: "Devam" tarzı geçiş
  if (choices.length === 1) return buttonHtml(choices[0], 0);

  // Biçimi belirtilmiş düğmeler ("Kaynaklar", "Başa Dön"): yan yana
  if (choices.every((choice) => choice.style)) {
    return `<div class="actions">${choices.map(buttonHtml).join("")}</div>`;
  }

  // Birden fazla seçenek: seçim listesi

  return `
    <div class="choices">
      ${choices
        .map(
          (choice, index) => `
        <button class="choice-button" data-index="${index}">
          ${localize(choice.text)}
        </button>
      `
        )
        .join("")}
    </div>
  `;
}

// "Daha fazla bilgi" kutusu; tarayıcının <details> öğesi klavye ve
// ekran okuyucu desteğini kendisi sağlar.
function infoBoxHtml(infoBox, open) {
  if (!infoBox) return "";
  return `
    <details class="info-box"${open ? " open" : ""}>
      <summary>${t("moreInfo")}</summary>
      <div class="info-box-body">
        <h3>${localize(infoBox.title)}</h3>
        <p>${localize(infoBox.text)}</p>
      </div>
    </details>
  `;
}

// Sabah raporu: alıntı, altında kaynağın adı
function reportsHtml(reports) {
  return (reports || [])
    .map(
      (report) => `
    <blockquote class="quote">
      <p>${localize(report.text)}</p>
      <footer>${localize(report.who)}</footer>
    </blockquote>
  `
    )
    .join("");
}

// Kaynak listesi; liste boşsa "yakında eklenecek" yazar
function sourcesHtml() {
  const list = STORY.sources.length
    ? `<ol class="source-list">
        ${STORY.sources.map((source) => `<li>${localize(source)}</li>`).join("")}
      </ol>`
    : `<p class="story-text">${t("sourcesEmpty")}</p>`;

  const imageNote = localize(STORY.imageNote).trim()
    ? `<h3 class="image-note-heading">${t("imageNoteHeading")}</h3>
      <p class="disclaimer">${localize(STORY.imageNote)}</p>`
    : "";

  return list + imageNote;
}

// Taraf etiketi (Osmanlı / Bizans)
function sideHtml(scene) {
  return scene.side in SIDES
    ? `<p class="side-label">${t(SIDES[scene.side])}</p>`
    : "";
}

// Başlık; başlığı olmayan ekranlarda (sonuç, son) eyebrow başlık olur
function headingHtml(tag, title, eyebrow) {
  if (!title) return `<h2 class="eyebrow" tabindex="-1">${eyebrow}</h2>`;
  return `
    ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ""}
    <${tag} tabindex="-1">${title}</${tag}>
  `;
}

// Normal sahne (açılış, karar, son, kaynaklar)
function sceneView(scene, infoOpen) {
  const paragraphClass = scene.opening ? "intro" : "story-text";
  const eyebrow = scene.ending
    ? t("differentEnding")
    : scene.eyebrow && localize(scene.eyebrow);
  const choices = scene.ending ? [SHARED.restartChoice] : orderedChoices(scene);

  const note = scene.note
    ? `${scene.ending ? `<h3 class="note-heading">${t("whatHappened")}</h3>` : ""}
      <p class="disclaimer">${localize(scene.note)}</p>`
    : "";

  return {
    choices,
    html: `
      ${sideHtml(scene)}

      ${headingHtml(
        scene.opening ? "h1" : "h2",
        scene.title && localize(scene.title),
        eyebrow
      )}

      ${(scene.paragraphs || [])
        .map((text) => `<p class="${paragraphClass}">${localize(text)}</p>`)
        .join("")}

      ${reportsHtml(scene.reports)}

      ${note}

      ${scene.showSources ? sourcesHtml() : ""}

      ${infoBoxHtml(scene.infoBox, infoOpen)}

      ${choicesHtml(choices)}
    `,
  };
}

// Tarihsel olmayan seçimin sonuç ekranı; story.js'te ayrı sahne gerekmez
function resultView(scene, choice) {
  const choices = [{ text: both("continue"), next: choice.next }];
  return {
    choices,
    html: `
      ${sideHtml(scene)}

      ${headingHtml("h2", null, t("notHappened"))}

      <blockquote class="quote">
        <p>${localize(choice.text)}</p>
      </blockquote>

      <p class="story-text">${localize(choice.result)}</p>

      ${choicesHtml(choices)}
    `,
  };
}

// Sahneyi çiz; dil değişince aynı sahne yeniden çizilir.
// moveFocus: oyuncu sahne değiştirdiğinde odak yeni başlığa taşınır.
// resultIndex: verilirse o seçeneğin sonuç ekranı çizilir.
function render(sceneId, moveFocus = false, resultIndex = null) {
  const scene = findScene(sceneId);

  // Dil değişiminde bilgi kutusu açıksa açık kalsın
  const infoOpen =
    sceneId === currentSceneId &&
    resultIndex === currentResult &&
    Boolean(gameScreen.querySelector(".info-box[open]"));
  currentSceneId = sceneId;
  currentResult = resultIndex;

  setDate(scene);

  // Alt bilgi ve uyarı kutucuğu yalnızca açılış ekranında görünür
  footer.classList.toggle("is-hidden", !scene.opening);
  disclaimerBadge.classList.toggle("is-hidden", !scene.opening);

  // Panelin sol kenarındaki taraf şeridi
  if (scene.side in SIDES) {
    gameScreen.dataset.side = scene.side;
  } else {
    delete gameScreen.dataset.side;
  }

  // Sahneye özel resim yoksa style.css'teki varsayılan kullanılır
  if (scene.image) {
    gameScreen.style.setProperty("--scene-image", `url("${scene.image}")`);
  } else {
    gameScreen.style.removeProperty("--scene-image");
  }

  const view =
    resultIndex === null
      ? sceneView(scene, infoOpen)
      : resultView(scene, scene.choices[resultIndex]);

  gameScreen.innerHTML = view.html;

  gameScreen.querySelectorAll("[data-index]").forEach((button) => {
    button.addEventListener("click", () =>
      choose(scene, view.choices[button.dataset.index])
    );
  });

  if (moveFocus) {
    gameScreen.scrollTop = 0;
    gameScreen.querySelector("h1, h2").focus();
  }
}

// Seçime göre ilerle: tarihsel olmayan seçimde önce sonuç ekranı gelir
// (seçenek bir son sahnesine gidiyorsa sonucu o sahne gösterir).
function choose(scene, choice) {
  if (choice.historical === false && !findScene(choice.next).ending) {
    render(scene.id, true, scene.choices.indexOf(choice));
    return;
  }
  if (choice.next === STORY.start) choiceOrders.clear();
  render(choice.next, true);
}

// Odak taşınmadan yeniden çizilen sahnenin (ör. dil değişimi) başlığını
// ekran okuyucuya duyur. Odak taşındığında başlık zaten okunduğu için
// burada tekrar duyurulmaz.
function announceHeading() {
  sceneAnnouncer.textContent = gameScreen.querySelector("h1, h2").textContent;
}

// Ekran dışındaki sabit metinleri güncelle
function applyStaticTexts() {
  document.documentElement.lang = language;
  document.title = t("pageTitle");
  document.getElementById("project-label").textContent = t("projectLabel");
  document.getElementById("footer-dates").textContent = t("footerDates");
  document.getElementById("footer-tagline").textContent = t("footerTagline");
  languageButton.textContent = t("languageButton");

  versionBadge.textContent = `v${APP_VERSION}`;

  disclaimerBadge.setAttribute("aria-label", t("disclaimerLabel"));
  document.getElementById("disclaimer-popup").textContent = t("disclaimerText").trim();
}

languageButton.addEventListener("click", () => {
  language = language === "en" ? "tr" : "en";
  try {
    localStorage.setItem("language", language);
  } catch (error) {}
  applyStaticTexts();
  render(currentSceneId, false, currentResult);
  announceHeading();
});

// Doğrulayıcıdaki bir hata oyunu durdurmasın
try {
  validateStory();
} catch (error) {
  console.warn("[story.js] Doğrulama tamamlanamadı:", error);
}

applyStaticTexts();
render(STORY.start);
