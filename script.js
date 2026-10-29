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
const APP_VERSION = "0.7.1-alpha";

// Oyun günleri: 1. gün 30 Nisan 1453
const FIRST_DAY = Date.UTC(1453, 3, 30);

const SIDES = { ottoman: "sideOttoman", byzantine: "sideByzantine" };

let language = loadLanguage();
let currentSceneId = STORY.start;
// Bir seçimin sonuç ya da onay ekranındaysak seçeneğin sırası, değilse null
let currentChoice = null;

// Test modu: adreste ?test varsa açılır, ?test=0 ile kapanır; tercih
// localStorage'da saklanır, böylece sayfa yenilense de açık kalır.
const testMode = loadTestMode();
let testLabel = null;
let testLabelText = "";

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

function loadTestMode() {
  const param = new URLSearchParams(window.location.search).get("test");
  try {
    if (param === "0") {
      localStorage.removeItem("testMode");
      return false;
    }
    if (param !== null) {
      localStorage.setItem("testMode", "1");
      return true;
    }
    return localStorage.getItem("testMode") === "1";
  } catch (error) {
    return param !== null && param !== "0";
  }
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

// Seçenek, yalnızca kendisinin gittiği bir son sahnesine mi gidiyor?
// Öyleyse sonucu o son sahnesi anlatır ve araya sonuç/onay ekranı girmez.
// (İki seçenek de aynı son sahnesine gidiyorsa, ör. Epilog, ara ekran gösterilir.)
function leadsToOwnEnding(scene, choice) {
  const target = STORY.scenes.find((other) => other.id === choice.next);
  return (
    Boolean(target && target.ending) &&
    scene.choices.filter((other) => other.next === choice.next).length === 1
  );
}

// { en, tr } metninin en az bir dilde dolu olup olmadığı
function hasText(text) {
  return Boolean(text) && ["en", "tr"].some((lang) => (text[lang] || "").trim());
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
      // cite isteğe bağlı; boşsa uyarı yok
      if (hasText(report.cite)) checkText(report.cite, `${name}, ${i + 1}. rapor, cite`);
    });
    if (scene.note) checkText(scene.note, `${name}, note`);
    if (scene.infoBox) {
      if (scene.infoBox.title) checkText(scene.infoBox.title, `${name}, infoBox.title`);
      checkText(scene.infoBox.text, `${name}, infoBox.text`);
    }

    const decision = isDecision(scene);

    // Karar sahnesinin bilgi kutusu seçimden sonra çıkar; her seçenek kendi
    // son sahnesine gidiyorsa kutu hiç görünmez.
    if (
      decision &&
      scene.infoBox &&
      scene.choices.every((choice) => leadsToOwnEnding(scene, choice))
    ) {
      warn(`${name}: bütün seçenekler son sahnesine gidiyor; bilgi kutusu hiç görünmez.`);
    }
    (scene.choices || []).forEach((choice, i) => {
      checkText(choice.text, `${name}, ${i + 1}. düğme`);
      if (!ids.has(choice.next)) {
        warn(`${name}, ${i + 1}. düğme: "next" değeri "${choice.next}" ama böyle bir sahne yok.`);
      }
      if (decision && typeof choice.historical !== "boolean") {
        warn(`${name}, ${i + 1}. seçenek: "historical: true" ya da "historical: false" eksik.`);
      }
      // Son sahnesine giden seçenekte sonuç, son ekranında gösterilir.
      // Sonuç metni boşsa sonuç ekranı tarihsel seçeneğin metnini gösterir.
      if (choice.historical === false && !leadsToOwnEnding(scene, choice)) {
        if (hasText(choice.result)) {
          checkText(choice.result, `${name}, ${i + 1}. seçenek, result`);
        } else if (!scene.choices.some((other) => other.historical === true)) {
          warn(`${name}, ${i + 1}. seçenek: sonuç metni (result) yok ve gösterilecek tarihsel seçenek de yok.`);
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

  Object.entries(STORY.sideBackgrounds || {}).forEach(([side, background]) => {
    if (!(side in SIDES)) {
      warn(`sideBackgrounds: "${side}" diye bir taraf yok ("ottoman" ya da "byzantine" olmalı).`);
    }
    if (!background.image || !background.image.startsWith("assets/")) {
      warn(`sideBackgrounds.${side}: görsel assets/ ile başlamıyor: ${background.image}`);
    }
  });

  // Kaynakça: gruplu biçimde her grubun başlığı ve künyeleri olmalı
  if (STORY.sources.some((entry) => entry.items || entry.heading)) {
    STORY.sources.forEach((group, g) => {
      const where = `sources, ${g + 1}. grup`;
      checkText(group.heading, `${where}, heading`);
      if (!Array.isArray(group.items) || !group.items.length) {
        warn(`${where}: künye listesi (items) yok ya da boş.`);
        return;
      }
      group.items.forEach((item, i) => checkText(item, `${where}, ${i + 1}. künye`));
    });
  } else {
    STORY.sources.forEach((source, i) => checkText(source, `${i + 1}. kaynak`));
  }
  if (hasText(STORY.sourcesNote)) checkText(STORY.sourcesNote, "sourcesNote");
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
// (Test modunda sıra karışmaz: story.js'teki sıra, A, B, … diye.)
function orderedChoices(scene) {
  if (!isDecision(scene) || testMode) return scene.choices || [];
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

  // Ana düğme ile ikincil düğme birlikte (açılıştaki "Hikâyeye Başla" + "Kaynaklar"): yan yana
  if (choices.some((choice) => choice.style)) {
    return `<div class="actions actions-mixed">${choices.map(buttonHtml).join("")}</div>`;
  }

  // Birden fazla seçenek: seçim listesi. Test modunda sıra veri sırasıdır,
  // her düğmenin başında [A]/[B] rozeti olur (ekran okuyucu okumaz).
  const letter = (index) =>
    testMode
      ? `<span class="choice-letter" aria-hidden="true">[${String.fromCharCode(65 + index)}]</span> `
      : "";

  return `
    <div class="choices">
      ${choices
        .map(
          (choice, index) => `
        <button class="choice-button" data-index="${index}">
          ${letter(index)}${localize(choice.text)}
        </button>
      `
        )
        .join("")}
    </div>
  `;
}

// "Daha fazla bilgi" kutusu; tarayıcının <details> öğesi klavye ve
// ekran okuyucu desteğini kendisi sağlar. Başlık (title) isteğe bağlıdır.
function infoBoxHtml(infoBox, open) {
  if (!infoBox) return "";
  return `
    <details class="info-box"${open ? " open" : ""}>
      <summary>${t("moreInfo")}</summary>
      <div class="info-box-body">
        ${infoBox.title ? `<h3>${localize(infoBox.title)}</h3>` : ""}
        <p>${localize(infoBox.text)}</p>
      </div>
    </details>
  `;
}

// Sabah raporu: alıntı, altında kaynağın adı ve (varsa) künye satırı
function reportsHtml(reports) {
  return (reports || [])
    .map(
      (report) => `
    <blockquote class="quote">
      <p>${localize(report.text)}</p>
      <footer>${localize(report.who)}</footer>
      ${hasText(report.cite) ? `<p class="report-cite">${localize(report.cite)}</p>` : ""}
    </blockquote>
  `
    )
    .join("");
}

// Kaynak listesi; liste boşsa "yakında eklenecek" yazar
// Gruplu biçim: [{ heading, items: [{ tr, en }] }]; eski düz biçim: [{ tr, en }]
function isGroupedSources() {
  return STORY.sources.length > 0 && STORY.sources.every((entry) => entry.items);
}

function sourceItemsHtml(items) {
  return `<ul class="source-list">
    ${items.map((item) => `<li>${localize(item)}</li>`).join("")}
  </ul>`;
}

// Kaynak listesi (gruplar, not, görsel notu); liste boşsa "yakında eklenecek" yazar
function sourcesHtml() {
  let list;
  if (!STORY.sources.length) {
    list = `<p class="story-text">${t("sourcesEmpty")}</p>`;
  } else if (isGroupedSources()) {
    list = STORY.sources
      .map(
        (group) => `
      <h3 class="source-group">${localize(group.heading)}</h3>
      ${sourceItemsHtml(group.items)}
    `
      )
      .join("");
  } else {
    list = sourceItemsHtml(STORY.sources);
  }

  const sourcesNote = hasText(STORY.sourcesNote)
    ? `<p class="sources-note">${localize(STORY.sourcesNote)}</p>`
    : "";

  const imageNote = localize(STORY.imageNote).trim()
    ? `<h3 class="image-note-heading">${t("imageNoteHeading")}</h3>
      <p class="disclaimer">${localize(STORY.imageNote)}</p>`
    : "";

  return list + sourcesNote + imageNote;
}

// Taraf etiketi (Osmanlı / Bizans)
function sideHtml(scene) {
  return scene.side in SIDES
    ? `<p class="side-label">${t(SIDES[scene.side])}</p>`
    : "";
}

// Başlık; başlığı olmayan ekranlarda (sonuç, onay, son) eyebrow başlık olur
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
  // Son sahnelerinde eyebrow verilmemişse "Farklı bir son" yazar
  const eyebrow = scene.eyebrow
    ? localize(scene.eyebrow)
    : scene.ending && t("differentEnding");
  const choices = scene.ending
    ? [SHARED.sourcesChoice, SHARED.restartChoice]
    : orderedChoices(scene);

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

      ${isDecision(scene) ? "" : infoBoxHtml(scene.infoBox, infoOpen)}

      ${choicesHtml(choices)}
    `,
  };
}

// Tarihsel olmayan seçimin sonucu; sonuç metni boşsa "Tarihte yaşanan:"
// etiketi ve tarihsel seçeneğin kendi metni gösterilir.
function resultHtml(scene, choice) {
  if (hasText(choice.result)) {
    return `<p class="story-text">${localize(choice.result)}</p>`;
  }
  const actual = scene.choices.find((other) => other.historical === true);
  return `
    <h3 class="note-heading">${t("actuallyHappened")}</h3>
    <p class="story-text">${localize(actual.text)}</p>
  `;
}

// Seçimden sonraki ekran; story.js'te ayrı sahne gerekmez.
// Tarihsel olmayan seçimde sonuç ekranı ("Tarihte böyle olmadı" + result),
// tarihsel seçimde onay ekranı ("Tarihte de böyle oldu"). Karar sahnesinin
// bilgi kutusu burada, kapalı olarak gösterilir.
function outcomeView(scene, choice, infoOpen) {
  const historical = choice.historical === true;
  const choices = [{ text: both("continue"), next: choice.next }];
  return {
    choices,
    html: `
      ${sideHtml(scene)}

      ${headingHtml("h2", null, t(historical ? "happened" : "notHappened"))}

      <p class="choice-label">${t("yourChoice")}</p>
      <blockquote class="quote">
        <p>${localize(choice.text)}</p>
      </blockquote>

      ${historical ? "" : resultHtml(scene, choice)}

      ${infoBoxHtml(scene.infoBox, infoOpen)}

      ${choicesHtml(choices)}
    `,
  };
}

// ───── Kutucuk arka planı ─────

// Ön yüklenen görseller (tarayıcı önbellekte tutsun diye referans saklanır)
// ve yüklenemeyenler (bunların yerine varsayılan arka plan kullanılır)
const preloadedImages = [];
const failedImages = new Set();

// Öncelik: sahnenin kendi görseli > tarafın görseli > varsayılan (null).
// Ara ekranlar karar sahnesiyle çizildiği için onun tarafını kullanır.
function sceneBackground(scene) {
  if (scene.image) return { image: scene.image };
  const side = (STORY.sideBackgrounds || {})[scene.side];
  return side && !failedImages.has(side.image) ? side : null;
}

// Varsayılana dönüşte değişkenler kaldırılır; style.css'teki
// assets/background.jpg ve ortalı konum kullanılır.
function applyBackground(scene) {
  const background = sceneBackground(scene);
  if (background) {
    gameScreen.style.setProperty("--scene-image", `url("${background.image}")`);
  } else {
    gameScreen.style.removeProperty("--scene-image");
  }
  if (background && background.position) {
    gameScreen.style.setProperty("--scene-image-position", background.position);
  } else {
    gameScreen.style.removeProperty("--scene-image-position");
  }
}

// Ekran geçişlerinde titreme ya da boş zemin görünmesin diye arka planları
// baştan yükle. Yüklenemeyen görsel için bir kez uyarı verilir.
function preloadBackgrounds() {
  const sources = [
    "assets/background.jpg",
    ...Object.values(STORY.sideBackgrounds || {}).map((background) => background.image),
  ];
  new Set(sources).forEach((src) => {
    const image = new Image();
    image.onerror = () => {
      console.warn(`[story.js] Arka plan görseli yüklenemedi: ${src}`);
      failedImages.add(src);
      applyBackground(findScene(currentSceneId));
    };
    image.src = src;
    preloadedImages.push(image);
  });
}

// Sahneyi çiz; dil değişince aynı sahne yeniden çizilir.
// moveFocus: oyuncu sahne değiştirdiğinde odak yeni başlığa taşınır.
// choiceIndex: verilirse o seçeneğin sonuç ya da onay ekranı çizilir.
function render(sceneId, moveFocus = false, choiceIndex = null) {
  const scene = findScene(sceneId);

  // Dil değişiminde bilgi kutusu açıksa açık kalsın
  const infoOpen =
    sceneId === currentSceneId &&
    choiceIndex === currentChoice &&
    Boolean(gameScreen.querySelector(".info-box[open]"));
  currentSceneId = sceneId;
  currentChoice = choiceIndex;

  setDate(scene);
  // hideDate: tarih gizlenir ama yeri korunur, üst çubuk kaymaz
  dateLabel.classList.toggle("is-hidden", Boolean(scene.hideDate));

  // Alt bilgi ve uyarı kutucuğu yalnızca açılış ekranında görünür
  footer.classList.toggle("is-hidden", !scene.opening);
  disclaimerBadge.classList.toggle("is-hidden", !scene.opening);

  // Panelin sol kenarındaki taraf şeridi
  if (scene.side in SIDES) {
    gameScreen.dataset.side = scene.side;
  } else {
    delete gameScreen.dataset.side;
  }

  applyBackground(scene);
  // plainBackground: görsel yerine düz koyu zemin (ör. Kaynaklar)
  gameScreen.classList.toggle("plain-bg", Boolean(scene.plainBackground));

  const view =
    choiceIndex === null
      ? sceneView(scene, infoOpen)
      : outcomeView(scene, scene.choices[choiceIndex], infoOpen);

  gameScreen.innerHTML = view.html;

  gameScreen.querySelectorAll("[data-index]").forEach((button) => {
    button.addEventListener("click", () =>
      choose(scene, view.choices[button.dataset.index])
    );
  });

  updateTestLabel(scene, choiceIndex);

  // Yeni sahnede sayfa en üste döner (animasyonsuz); dil değişiminde
  // kaydırma konumuna dokunulmaz.
  if (moveFocus) {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    gameScreen.querySelector("h1, h2").focus({ preventScroll: true });
  }
}

// Seçime göre ilerle: tarihsel olmayan seçimde önce sonuç ekranı, bilgi
// kutusu olan sahnedeki tarihsel seçimde önce onay ekranı gelir. Seçenek
// kendi son sahnesine gidiyorsa ara ekran çıkmaz; sonucu o sahne gösterir.
function choose(scene, choice) {
  const showOutcome =
    choice.historical === false ||
    (choice.historical === true && Boolean(scene.infoBox));
  if (showOutcome && !leadsToOwnEnding(scene, choice)) {
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

// ───── Test modu etiketi (yalnızca geliştirme ve hata bildirimi için) ─────

// Sol alttaki etiketi oluştur; tıklanınca ya da Enter'a basılınca metni kopyalar
function createTestLabel() {
  document.body.classList.add("test-mode");
  testLabel = document.createElement("div");
  testLabel.className = "test-label";
  testLabel.setAttribute("aria-hidden", "true");
  testLabel.tabIndex = 0;
  testLabel.addEventListener("click", copyTestLabel);
  testLabel.addEventListener("keydown", (event) => {
    if (event.key === "Enter") copyTestLabel();
  });
  document.body.appendChild(testLabel);
}

// "S{n} · {sahne-id} · {dil}"; ara ekranlarda "› A sonucu" / "› A onayı".
// A/B harfi seçeneğin story.js'teki sırasıdır, ekrandaki (karışık) sıra değil.
function updateTestLabel(scene, choiceIndex) {
  if (!testLabel) return;
  const number = STORY.scenes.indexOf(scene) + 1;
  let outcome = "";
  if (choiceIndex !== null) {
    const letter = String.fromCharCode(65 + choiceIndex);
    const kind = scene.choices[choiceIndex].historical === true ? "onayı" : "sonucu";
    outcome = ` › ${letter} ${kind}`;
  }
  testLabelText = `S${number} · ${scene.id}${outcome} · ${language.toUpperCase()}`;
  testLabel.textContent = testLabelText;
}

function copyTestLabel() {
  const text = testLabelText;
  const done = () => {
    testLabel.textContent = "kopyalandı";
    setTimeout(() => {
      testLabel.textContent = testLabelText;
    }, 1500);
  };
  const fallback = () => {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    try {
      if (document.execCommand("copy")) done();
    } catch (error) {}
    area.remove();
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, fallback);
  } else {
    fallback();
  }
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
  // Metin uzunluğu değişse de oyuncu sayfada aynı yerde kalsın
  const scrollY = window.scrollY;
  applyStaticTexts();
  render(currentSceneId, false, currentChoice);
  window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
  announceHeading();
});

// Doğrulayıcıdaki bir hata oyunu durdurmasın
try {
  validateStory();
} catch (error) {
  console.warn("[story.js] Doğrulama tamamlanamadı:", error);
}

preloadBackgrounds();

if (testMode) createTestLabel();

applyStaticTexts();
render(STORY.start);
