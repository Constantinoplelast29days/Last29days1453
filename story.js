// Oyunun tüm metinleri ve sahneleri burada.
// Her metin hem "en" hem "tr" olarak yazılmalı.
// Yeni sahne ekleme kılavuzu: HIKAYE-EKLEME.md

// Sahne dışındaki arayüz metinleri (üst çubuk, alt bilgi, uyarı kutucuğu)
const translations = {
  en: {
    pageTitle: "The Last 29 Days of Constantinople",
    projectLabel: "A HISTORICAL INTERACTIVE STORY",
    footerDates: "30 April — 29 May 1453",
    footerTagline: "History · Choice · Consequence",
    languageButton: "TÜRKÇE",
    disclaimerLabel: "Disclaimer",
    versionLabel: "Version",
    moreInfo: "More information",
    sourcesEmpty: "Sources will be added soon.",
    imageNoteHeading: "Image note",
    disclaimerText: `
      Historical fiction. Your choices shape a character's
      experience, not the historical outcome.
    `,
    months: [
      "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
      "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
    ],
  },

  tr: {
    pageTitle: "Konstantinopolis'in Son 29 Günü",
    projectLabel: "TARİHÎ BİR ETKİLEŞİMLİ HİKÂYE",
    footerDates: "30 Nisan — 29 Mayıs 1453",
    footerTagline: "Tarih · Seçim · Sonuç",
    languageButton: "ENGLISH",
    disclaimerLabel: "Uyarı",
    versionLabel: "Sürüm",
    moreInfo: "Daha fazla bilgi",
    sourcesEmpty: "Kaynaklar yakında eklenecek.",
    imageNoteHeading: "Görsel notu",
    disclaimerText: `
      Tarihî kurgu. Seçimlerin bir karakterin deneyimini
      şekillendirir, tarihin sonucunu değil.
    `,
    months: [
      "OCAK", "ŞUBAT", "MART", "NİSAN", "MAYIS", "HAZİRAN",
      "TEMMUZ", "AĞUSTOS", "EYLÜL", "EKİM", "KASIM", "ARALIK",
    ],
  },
};

// Birden fazla sahnede kullanılan metinler
const SHARED = {
  endingEyebrow: {
    en: "THE HISTORICAL OUTCOME",
    tr: "TARİHÎ SONUÇ",
  },
  endingHistory: {
    en: `
      On 29 May 1453, Constantinople fell to the Ottoman
      forces of Sultan Mehmed II. Your decision changed
      your character's experience, not the historical outcome.
    `,
    tr: `
      29 Mayıs 1453'te Konstantinopolis, Sultan II. Mehmed
      komutasındaki Osmanlı kuvvetleri tarafından ele geçirildi. Kararın karakterinin
      deneyimini değiştirdi, tarihin sonucunu değil.
    `,
  },
  endingDisclaimer: {
    en: `
      The civilian character and personal events in this
      story are fictional. The historical outcome is real.
    `,
    tr: `
      Bu hikâyedeki sivil karakter ve kişisel olaylar
      kurgudur. Tarihî sonuç ise gerçektir.
    `,
  },
  restartChoice: {
    text: { en: "Return to the Beginning", tr: "Başa Dön" },
    next: "title",
    style: "secondary",
  },
  sourcesChoice: {
    text: { en: "Sources", tr: "Kaynaklar" },
    next: "sources",
    style: "secondary",
  },
};

// Sahne alanları:
//   id         sahnenin benzersiz adı (seçenekler buna "next" ile gider)
//   day        oyun günü (1 = 30 Nisan 1453, 30 = 29 Mayıs 1453)
//   image      isteğe bağlı kutucuk resmi (assets/ altında); yoksa assets/background.jpg
//   opening    true ise açılış düzeni: büyük başlık, alt bilgi ve uyarı kutucuğu
//   eyebrow    başlığın üstündeki küçük yazı
//   title      başlık
//   paragraphs paragraf listesi
//   note       isteğe bağlı küçük not (paragrafların altında)
//   infoBox    isteğe bağlı "Daha fazla bilgi" kutusu: { title, text }
//   showSources true ise STORY.sources listesi ve görsel notu gösterilir
//   choices    düğmeler: text + next (+ isteğe bağlı style: "secondary")
const STORY = {
  start: "title",
  lastDay: 30,

  // Kaynak ekranındaki liste. Her kaynak: { en: "...", tr: "..." }
  // Yalnızca gerçekten kullanılan, doğrulanmış kaynaklar eklenmeli.
  sources: [],

  // Kaynak ekranındaki görsel notu (ör. görsellerin yorum olduğu).
  // Boş bırakılırsa ekranda görünmez.
  imageNote: { en: "", tr: "" },

  scenes: [
    // Açılış ekranı
    {
      id: "title",
      day: 1,
      opening: true,
      eyebrow: {
        en: "CONSTANTINOPLE · 1453",
        tr: "KONSTANTİNOPOLİS · 1453",
      },
      title: {
        en: "The Last 29 Days<br>of Constantinople",
        tr: "Konstantinopolis'in<br>Son 29 Günü",
      },
      paragraphs: [
        {
          en: `
            A city stands at the edge of history.
            Its walls remain, its people endure, and the
            final days of the siege approach.
          `,
          tr: `
            Bir şehir tarihin eşiğinde duruyor.
            Surları hâlâ ayakta, halkı direniyor ve
            kuşatmanın son günleri yaklaşıyor.
          `,
        },
      ],
      choices: [
        { text: { en: "Begin the Story", tr: "Hikâyeye Başla" }, next: "story" },
      ],
    },

    // İlk hikâye ekranı
    {
      id: "story",
      day: 1,
      eyebrow: {
        en: "DAY 1 · THE BESIEGED CITY",
        tr: "1. GÜN · KUŞATILMIŞ ŞEHİR",
      },
      title: {
        en: "A City Under Siege",
        tr: "Kuşatma Altındaki Şehir",
      },
      paragraphs: [
        {
          en: `
            Constantinople, 30 April 1453.
            The city remains under siege. Beyond its walls,
            the Ottoman army prepares for the struggle ahead.
            Inside, the people face uncertainty as the days pass.
          `,
          tr: `
            Konstantinopolis, 30 Nisan 1453.
            Şehir hâlâ kuşatma altında. Surların ötesinde
            Osmanlı ordusu önündeki mücadeleye hazırlanıyor.
            İçeride ise halk, günler geçtikçe belirsizlikle yüzleşiyor.
          `,
        },
        {
          en: `
            You follow a fictional civilian living within the city.
            As the siege continues, a difficult decision approaches.
          `,
          tr: `
            Şehirde yaşayan kurgusal bir sivili takip ediyorsun.
            Kuşatma sürerken zor bir karar yaklaşıyor.
          `,
        },
      ],
      choices: [
        { text: { en: "Continue", tr: "Devam Et" }, next: "choice" },
      ],
    },

    // Oyuncunun karar ekranı
    {
      id: "choice",
      day: 1,
      eyebrow: {
        en: "A MOMENT OF UNCERTAINTY",
        tr: "BİR BELİRSİZLİK ANI",
      },
      title: {
        en: "What Will You Do?",
        tr: "Ne Yapacaksın?",
      },
      paragraphs: [
        {
          en: `
            A fictional neighbour asks for your help.
            You have little time to decide how to respond.
          `,
          tr: `
            Kurgusal bir komşun senden yardım istiyor.
            Nasıl karşılık vereceğine karar vermek için az vaktin var.
          `,
        },
      ],
      choices: [
        {
          text: {
            en: "Help your neighbour prepare supplies.",
            tr: "Komşuna erzak hazırlamasında yardım et.",
          },
          next: "placeholder-supplies",
        },
        {
          text: {
            en: "Stay close to your family and protect what remains.",
            tr: "Ailenin yanında kal ve geriye kalanı koru.",
          },
          next: "placeholder-family",
        },
      ],
    },

    // GEÇİCİ: yazar gerçek bölümleri yazınca silinecek
    {
      id: "placeholder-supplies",
      day: 1,
      eyebrow: { en: "TO BE CONTINUED", tr: "DEVAMI GELECEK" },
      title: { en: "To Be Continued", tr: "Devamı Gelecek" },
      paragraphs: [
        {
          en: "This part of the story is still being written.",
          tr: "Hikâyenin bu bölümü henüz yazılıyor.",
        },
      ],
      choices: [
        { text: { en: "Continue", tr: "Devam Et" }, next: "ending-supplies" },
      ],
    },

    // GEÇİCİ: yazar gerçek bölümleri yazınca silinecek
    {
      id: "placeholder-family",
      day: 1,
      eyebrow: { en: "TO BE CONTINUED", tr: "DEVAMI GELECEK" },
      title: { en: "To Be Continued", tr: "Devamı Gelecek" },
      paragraphs: [
        {
          en: "This part of the story is still being written.",
          tr: "Hikâyenin bu bölümü henüz yazılıyor.",
        },
      ],
      choices: [
        { text: { en: "Continue", tr: "Devam Et" }, next: "ending-family" },
      ],
    },

    // Son: komşuya erzak yardımı
    {
      id: "ending-supplies",
      day: 30,
      eyebrow: SHARED.endingEyebrow,
      title: {
        en: "A Neighbour's Burden",
        tr: "Bir Komşunun Yükü",
      },
      paragraphs: [
        {
          en: `
            You spend your remaining time helping your neighbour.
            The task gives you a purpose, even as uncertainty
            hangs over the city.
          `,
          tr: `
            Kalan zamanını komşuna yardım ederek geçiriyorsun.
            Şehrin üzerine belirsizlik çökmüşken bile
            bu görev sana bir amaç veriyor.
          `,
        },
        SHARED.endingHistory,
      ],
      note: SHARED.endingDisclaimer,
      choices: [SHARED.sourcesChoice, SHARED.restartChoice],
    },

    // Son: ailenin yanında kalmak
    {
      id: "ending-family",
      day: 30,
      eyebrow: SHARED.endingEyebrow,
      title: {
        en: "Those Closest to You",
        tr: "En Yakınların",
      },
      paragraphs: [
        {
          en: `
            You remain with your family.
            The time you share becomes precious as the
            city's fate approaches.
          `,
          tr: `
            Ailenin yanında kalıyorsun.
            Şehrin kaderi yaklaşırken birlikte
            geçirdiğiniz zaman paha biçilmez hâle geliyor.
          `,
        },
        SHARED.endingHistory,
      ],
      note: SHARED.endingDisclaimer,
      choices: [SHARED.sourcesChoice, SHARED.restartChoice],
    },

    // Kaynaklar (iki sondan da gelinir)
    {
      id: "sources",
      day: 30,
      title: { en: "Sources", tr: "Kaynaklar" },
      showSources: true,
      choices: [SHARED.restartChoice],
    },
  ],
};
