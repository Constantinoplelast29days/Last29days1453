// Oyun motoru: story.js'teki sahneleri okuyup çizer.
// Metinler ve sahneler story.js'te; burada metin yazılmaz.

const gameScreen = document.getElementById("game-screen");
const dateLabel = document.getElementById("date-label");
const languageButton = document.getElementById("language-button");
const footer = document.getElementById("footer");
const disclaimerBadge = document.getElementById("disclaimer-badge");
const versionBadge = document.getElementById("version-badge");

// Sağ üstteki sürüm etiketi; her değişiklikte 0.0.1 artırılır
const APP_VERSION = "0.0.2-alpha";

// Oyun günleri: 1. gün 30 Nisan 1453
const FIRST_DAY = Date.UTC(1453, 3, 30);

let language = loadLanguage();
let currentSceneId = STORY.start;

// Seçilen dildeki arayüz metnini getir
function t(key) {
  return translations[language][key];
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

// Oyuncunun bulunduğu günü sağ üstteki tarih etiketine yaz
function setDay(day) {
  const date = new Date(FIRST_DAY + (day - 1) * 24 * 60 * 60 * 1000);
  const month = t("months")[date.getUTCMonth()];
  dateLabel.textContent =
    `${date.getUTCDate()} ${month} ${date.getUTCFullYear()}`;
}

function buttonHtml(choice) {
  const style =
    choice.style === "secondary" ? "secondary-button" : "primary-button";
  return `
    <button class="${style}" data-next="${choice.next}">
      ${localize(choice.text)}
    </button>
  `;
}

function choicesHtml(choices) {
  // Tek düğme: "Devam" tarzı geçiş
  if (choices.length === 1) return buttonHtml(choices[0]);

  // Biçimi belirtilmiş düğmeler ("Kaynaklar", "Başa Dön"): yan yana
  if (choices.every((choice) => choice.style)) {
    return `<div class="actions">${choices.map(buttonHtml).join("")}</div>`;
  }

  // Birden fazla seçenek: seçim listesi

  return `
    <div class="choices">
      ${choices
        .map(
          (choice) => `
        <button class="choice-button" data-next="${choice.next}">
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

// Sahneyi çiz; dil değişince aynı sahne yeniden çizilir.
// moveFocus: oyuncu sahne değiştirdiğinde odak yeni başlığa taşınır.
function render(sceneId, moveFocus = false) {
  const scene = findScene(sceneId);

  // Dil değişiminde bilgi kutusu açıksa açık kalsın
  const infoOpen =
    sceneId === currentSceneId &&
    Boolean(gameScreen.querySelector(".info-box[open]"));
  currentSceneId = sceneId;

  setDay(scene.day);

  // Alt bilgi ve uyarı kutucuğu yalnızca açılış ekranında görünür
  footer.classList.toggle("is-hidden", !scene.opening);
  disclaimerBadge.classList.toggle("is-hidden", !scene.opening);

  // Sahneye özel resim yoksa style.css'teki varsayılan kullanılır
  if (scene.image) {
    if (!scene.image.startsWith("assets/")) {
      console.warn(`"${scene.id}" sahnesinin görseli assets/ altında değil: ${scene.image}`);
    }
    gameScreen.style.setProperty("--scene-image", `url("${scene.image}")`);
  } else {
    gameScreen.style.removeProperty("--scene-image");
  }

  const heading = scene.opening ? "h1" : "h2";
  const paragraphClass = scene.opening ? "intro" : "story-text";

  gameScreen.innerHTML = `
    ${scene.eyebrow ? `<p class="eyebrow">${localize(scene.eyebrow)}</p>` : ""}

    <${heading} tabindex="-1">${localize(scene.title)}</${heading}>

    ${(scene.paragraphs || [])
      .map((text) => `<p class="${paragraphClass}">${localize(text)}</p>`)
      .join("")}

    ${scene.note ? `<p class="disclaimer">${localize(scene.note)}</p>` : ""}

    ${scene.showSources ? sourcesHtml() : ""}

    ${infoBoxHtml(scene.infoBox, infoOpen)}

    ${choicesHtml(scene.choices || [])}
  `;

  gameScreen.querySelectorAll("[data-next]").forEach((button) => {
    button.addEventListener("click", () => render(button.dataset.next, true));
  });

  if (moveFocus) {
    gameScreen.scrollTop = 0;
    gameScreen.querySelector(heading).focus();
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
  versionBadge.setAttribute("aria-label", `${t("versionLabel")} ${APP_VERSION}`);

  disclaimerBadge.setAttribute("aria-label", t("disclaimerLabel"));
  document.getElementById("disclaimer-popup").textContent = t("disclaimerText").trim();
}

languageButton.addEventListener("click", () => {
  language = language === "en" ? "tr" : "en";
  try {
    localStorage.setItem("language", language);
  } catch (error) {}
  applyStaticTexts();
  render(currentSceneId);
});

applyStaticTexts();
render(STORY.start);
