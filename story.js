// Oyunun tüm metinleri ve sahneleri burada.
// Her metin hem "en" hem "tr" olarak yazılmalı.
// Yeni sahne ekleme kılavuzu: HIKAYE-EKLEME.md

// Sahne dışındaki arayüz metinleri (üst çubuk, alt bilgi, uyarı kutucuğu,
// motorun kendi çizdiği ekranlar)
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
    sideOttoman: "Ottoman",
    sideByzantine: "Byzantine",
    notHappened: "THIS IS NOT WHAT HAPPENED",
    differentEnding: "A DIFFERENT ENDING",
    whatHappened: "What happened in history",
    continue: "Continue",
    disclaimerText: `
      Historical interactive story. Some choices follow what happened;
      others explore what did not. The outcome of 29 May 1453 is historical.
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
    sideOttoman: "Osmanlı",
    sideByzantine: "Bizans",
    notHappened: "TARİHTE BÖYLE OLMADI",
    differentEnding: "FARKLI BİR SON",
    whatHappened: "Tarihte ne oldu",
    continue: "Devam Et",
    disclaimerText: `
      Tarihî bir etkileşimli hikâye. Bazı seçenekler tarihte yaşananı izler,
      bazıları yaşanmayanı gösterir. 29 Mayıs 1453'teki sonuç tarihîdir.
    `,
    months: [
      "OCAK", "ŞUBAT", "MART", "NİSAN", "MAYIS", "HAZİRAN",
      "TEMMUZ", "AĞUSTOS", "EYLÜL", "EKİM", "KASIM", "ARALIK",
    ],
  },
};

// Birden fazla sahnede kullanılan metinler
const SHARED = {
  // "Başa Dön": oyuncuyu açılışa götürür; seçenek sıraları yeniden karılır.
  // Son (ending) ekranları bu düğmeyi kendiliğinden kullanır.
  restartChoice: {
    text: { en: "Return to the Beginning", tr: "Başa Dön" },
    next: "title",
    style: "secondary",
  },
};

// Sahne alanları (ayrıntı ve örnekler: HIKAYE-EKLEME.md):
//   id          sahnenin benzersiz adı (seçenekler buna "next" ile gider)
//   day         oyun günü (1 = 30 Nisan 1453); dateText yoksa üstteki tarih buradan hesaplanır
//   dateText    isteğe bağlı: üst çubukta aynen gösterilecek tarih { en, tr }
//   side        isteğe bağlı: "ottoman" ya da "byzantine"; taraf etiketi ve renkli şerit
//   image       isteğe bağlı kutucuk resmi (assets/ altında); yoksa assets/background.jpg
//   opening     true ise açılış düzeni: büyük başlık, alt bilgi ve uyarı kutucuğu
//   eyebrow     başlığın üstündeki küçük yazı
//   title       başlık (ending sahnelerinde gerekmez)
//   paragraphs  paragraf listesi
//   reports     isteğe bağlı sabah raporları: [{ who, text }]
//   note        isteğe bağlı küçük not; ending sahnesinde "Tarihte ne oldu" notu
//   infoBox     isteğe bağlı "Daha fazla bilgi" kutusu: { title, text }
//   showSources true ise STORY.sources listesi ve görsel notu gösterilir
//   ending      true ise "Farklı bir son" ekranı; "Başa Dön" düğmesi kendiliğinden gelir
//   choices     düğmeler: text + next (+ isteğe bağlı style: "secondary")
//               Karar sahnelerinde her seçenek: historical: true/false;
//               historical: false ise result (sonuç metni) de yazılır.
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
        { text: { en: "Begin the Story", tr: "Hikâyeye Başla" }, next: "prolog-intro" },
      ],
    },

    // ───────────── PROLOG ─────────────

    {
      id: "prolog-intro",
      day: 1,
      dateText: { en: "1451 – 28 APRIL 1453", tr: "1451 – 28 NİSAN 1453" },
      eyebrow: { en: "PROLOGUE", tr: "PROLOG" },
      title: { en: "Before the Siege", tr: "Kuşatmadan Önce" },
      paragraphs: [
        {
          en: `Before the final 29 days of the siege, three scenes look back at the events that led here.`,
          tr: `Kuşatmanın son 29 gününe geçmeden önce, buraya yol açan olaylara üç sahneyle geri dönüyoruz.`,
        },
      ],
      choices: [
        { text: { en: "Continue", tr: "Devam Et" }, next: "fb1-ottoman" },
      ],
    },

    // Flashback 1: Boğazkesen ve Ayasofya'da Unio Krizi — Osmanlı
    {
      id: "fb1-ottoman",
      day: 1,
      side: "ottoman",
      dateText: { en: "1451 – DECEMBER 1452", tr: "1451 – ARALIK 1452" },
      eyebrow: { en: "FLASHBACK 1", tr: "FLASHBACK 1" },
      title: { en: "What Will You Do?", tr: "Ne Yapacaksın?" },
      paragraphs: [
        {
          en: `Upon ascending the throne, young Sultan Mehmed II recalls the childhood prophecies of Hacı Bayram-ı Velî and Molla Fenârî. When Byzantine envoys attempt to blackmail the Ottomans by demanding 300,000 akçes for Prince Orhan, the Sultan constructs Rumeli Hisarı (Boğazkesen / "Throat-Cutter") to seal the Bosphorus. During a night council, Grand Vizier Çandarlı Halil Pasha warns that a Western Crusade will be launched against them.`,
          tr: `Genç Sultan II. Mehmed tahta çıktığında Hacı Bayram-ı Velî ve Molla Fenârî'nin çocukluk müjdelerini hatırlar. Bizans elçileri Şehzade Orhan için 300.000 akçe şantajı yapınca Sultan, Boğaz'ı kesmek üzere Rumeli Hisarı'nı (Boğazkesen) inşa ettirir. Çandarlı Halil Paşa gece toplantısında Batı'dan Haçlı Seferi geleceği uyarısında bulunur.`,
        },
      ],
      choices: [
        {
          text: {
            en: `Reject Çandarlı's call for caution, sign a 3-year truce with the Hungarians (John Hunyadi), and sink Venetian Captain Antonio Rizzo's ship for passing through the Bosphorus without permission.`,
            tr: `Çandarlı'nın temkin çağrısını reddet, Macarlarla (Hunyadi Janos) 3 yıllık ateşkes imzala ve Boğaz'dan izinsiz geçen Venedikli Antonio Rizzo'nun gemisini batır.`,
          },
          historical: true,
          next: "fb1-byzantine",
        },
        {
          text: {
            en: `Allow Venetian ships free passage through the Bosphorus to avoid provoking Europe.`,
            tr: `Avrupa'yı kızdırmamak için Boğaz'dan geçen Venedik gemilerine geçiş izni ver.`,
          },
          historical: false,
          result: {
            en: `Byzantines fill their wheat granaries.`,
            tr: `Bizans buğday depolarını doldurur.`,
          },
          next: "fb1-byzantine",
        },
      ],
    },

    // Flashback 1 — Bizans
    {
      id: "fb1-byzantine",
      day: 1,
      side: "byzantine",
      dateText: { en: "12 DECEMBER 1452", tr: "12 ARALIK 1452" },
      eyebrow: { en: "FLASHBACK 1", tr: "FLASHBACK 1" },
      title: { en: "What Will You Do?", tr: "Ne Yapacaksın?" },
      paragraphs: [
        {
          en: `Emperor Constantine XI and his chief secretary George Sphrantzes conduct a census and find only 4,983 Greeks and 2,000 foreign soldiers capable of bearing arms. To secure papal military aid, the Union of the Churches (Unio) is proclaimed in Hagia Sophia; however, Gennadios Scholarios and Megas Doux Loukas Notaras protest, declaring, "I would rather see the Turkish turban reigning in the center of the City than the Latin mitre."`,
          tr: `İmparator XI. Konstantinos ve başsekreteri Georgios Sphrantzes şehirde sadece 4.983 Rum ve 2.000 yabancı asker olduğunu görür. Papa'dan yardım almak için Ayasofya'da Kilise Birliği (Unio) ilan edilir; ancak Gennadios Scholarios ve Megadük Loukas Notaras "Şehirde Latin külahı görmektense Türk sarığı görmeyi tercih ederim" diyerek tepki gösterir.`,
        },
      ],
      choices: [
        {
          text: {
            en: `Officially hold the Unio ceremony to keep Italian sailors and Cardinal Isidore in the city, but leave Gennadios unharmed to avoid an open revolt among the Orthodox populace.`,
            tr: `İtalyan denizcileri ve Kardinal Isidore'u şehirde tutmak için Unio ayinini resmen yap, ancak Ortodoks halkı yatıştırmak için Gennadios'a dokunma.`,
          },
          historical: true,
          next: "fb2-ottoman",
        },
        {
          text: {
            en: `Arrest Gennadios Scholarios and forcibly impose Latin liturgy across all churches.`,
            tr: `Gennadios Scholarios'u tutuklat ve tüm kiliselerde zorla Latin ayini başlat.`,
          },
          historical: false,
          result: {
            en: `Native Greek militias revolt.`,
            tr: `Yerli Rum milisler ayaklanır.`,
          },
          next: "fb2-ottoman",
        },
      ],
    },

    // Flashback 2: Dev Şahi Topları ve Haliç Zinciri — Osmanlı
    {
      id: "fb2-ottoman",
      day: 1,
      side: "ottoman",
      dateText: { en: "JANUARY – 20 APRIL 1453", tr: "OCAK – 20 NİSAN 1453" },
      eyebrow: { en: "FLASHBACK 2", tr: "FLASHBACK 2" },
      title: { en: "What Will You Do?", tr: "Ne Yapacaksın?" },
      paragraphs: [
        {
          en: `Hungarian engineer Orban, whom the Byzantines could not afford to pay, casts the giant bronze cannon "Şahi" in Edirne alongside Architect Muslihiddin and Saruca Pasha. However, on April 20, 3 Genoese cargo ships and 1 Byzantine grain ship break through Admiral Süleyman Baltaoğlu's blockade aided by a strong southern wind; Sultan Mehmed rides his horse into the sea in fury.`,
          tr: `Bizans'ın maaşını ödeyemediği Macar mühendis Orban; Mimar Muslihiddin ve Saruca Paşa ile Edirne'de dev "Şahi" topunu döker. Ancak 20 Nisan'da 3 Ceneviz ve 1 Bizans gemisi lodosla Amiral Süleyman Baltaoğlu'nun ablukasını yarar; Sultan Mehmed atını denize sürer.`,
        },
      ],
      choices: [
        {
          text: {
            en: `Immediately dismiss Baltaoğlu, appoint Hamza Bey in his place, and assign Zağanos Pasha to prepare the greased wooden slipways to haul ships overland into the Golden Horn.`,
            tr: `Baltaoğlu'nu derhal azledip yerine Hamza Bey'i ata ve Haliç'i karadan aşacak kızak hazırlığını Zağanos Paşa'ya ver.`,
          },
          historical: true,
          next: "fb2-byzantine",
        },
        {
          text: {
            en: `Keep Baltaoğlu in command and continue ramming the Golden Horn chain directly from the sea.`,
            tr: `Baltaoğlu'nu görevde tut ve Haliç zincirini gemilerle zorlamaya devam et.`,
          },
          historical: false,
          result: {
            en: `Ottoman ships sink before the chain.`,
            tr: `Osmanlı gemileri zincir önünde batar.`,
          },
          next: "fb2-byzantine",
        },
      ],
    },

    // Flashback 2 — Bizans
    {
      id: "fb2-byzantine",
      day: 1,
      side: "byzantine",
      dateText: { en: "2 APRIL 1453", tr: "2 NİSAN 1453" },
      eyebrow: { en: "FLASHBACK 2", tr: "FLASHBACK 2" },
      title: { en: "What Will You Do?", tr: "Ne Yapacaksın?" },
      paragraphs: [
        {
          en: `Engineer Bartolomeo Soligo stretches the massive iron chain across the entrance of the Golden Horn (between Kentenarion and Kastellion).`,
          tr: `Mühendis Bartolomeo Soligo, Haliç girişini (Kentenarion-Kastellion arası) dev demir zincirle kapatır.`,
        },
      ],
      choices: [
        {
          text: {
            en: `Array Venetian galleons behind the chain and transfer all troops from the Golden Horn walls to the St. Romanos land walls.`,
            tr: `Zincirin arkasına Venedik kalyonlarını diz ve Haliç surlarındaki tüm askerleri St. Romanos kara surlarına kaydır.`,
          },
          historical: true,
          next: "fb3-ottoman",
        },
        {
          text: {
            en: `Distrust the chain and keep 2,000 soldiers permanently stationed along the Golden Horn walls.`,
            tr: `Zincire güvenmeyip 2.000 askeri Haliç surlarında sabit beklet.`,
          },
          historical: false,
          result: {
            en: `Land walls remain undermanned, resulting in heavy casualties during the April 18 night assault.`,
            tr: `Kara surları zayıf kalır, 18 Nisan gece saldırısında ağır kayıp verilir.`,
          },
          next: "fb3-ottoman",
        },
      ],
    },

    // Flashback 3: Gemilerin Karadan İndirilmesi ve 28 Nisan Baskını — Osmanlı
    {
      id: "fb3-ottoman",
      day: 1,
      side: "ottoman",
      dateText: { en: "21 – 28 APRIL 1453", tr: "21 – 28 NİSAN 1453" },
      eyebrow: { en: "FLASHBACK 3", tr: "FLASHBACK 3" },
      title: { en: "What Will You Do?", tr: "Ne Yapacaksın?" },
      paragraphs: [
        {
          en: `On the night of April 21–22, 70–72 light ships are to be hauled overland into the Golden Horn on greased wooden slipways.`,
          tr: `21–22 Nisan gecesi 70–72 hafif gemi yağlanmış ahşap kızaklarla karadan Haliç'e indirilecektir.`,
        },
      ],
      // Materyal: 1. Periyot, Soru 2
      infoBox: {
        title: {
          en: `When the Ottoman fleet could not break the Golden Horn chain directly from the sea, what strategic maneuver did Sultan Mehmed II execute?`,
          tr: `Osmanlı donanması Haliç zincirini doğrudan denizden kıramayınca Fatih Sultan Mehmed nasıl bir stratejik hamle yapmıştır?`,
        },
        text: {
          en: `On the night of April 21–22, he bypassed the chain barrier by hauling 70–72 ships overland on greased wooden slipways (via the Tophane–Kasımpaşa or Beşiktaş–Dolmabahçe route) into the Golden Horn.`,
          tr: `21–22 Nisan gecesi 70–72 gemiyi karadan yağlanmış kızaklar üzerinden (Tophane–Kasımpaşa veya Beşiktaş–Dolmabahçe hattından) Haliç'e indirerek zincir engelini aşmıştır.`,
        },
      },
      choices: [
        {
          text: {
            en: `Mask the noise with artillery bombardment from the hills of Galata and use the hidden Beşiktaş–Dolmabahçe valley route to launch the ships into the inner Golden Horn.`,
            tr: `Galata tepelerinden toplarla ses maskelemesi yaparak gizli Beşiktaş–Dolmabahçe vadi güzergâhından gemileri Haliç'in iç kısmına indir.`,
          },
          historical: true,
          next: "fb3-byzantine",
        },
        {
          text: {
            en: `Use the short Tophane–Kasımpaşa route right beside the walls of Galata without artillery cover.`,
            tr: `Top koruması olmadan Galata surları dibindeki kısa hattı kullan.`,
          },
          historical: false,
          result: {
            en: `Genoese lookouts in Galata spot the ships early and alert the Venetian galleys.`,
            tr: `Galata gözcüleri gemileri erken fark eder, Venedik kadırgaları kızakları vurur.`,
          },
          next: "fb3-byzantine",
        },
      ],
    },

    // Flashback 3 — Bizans
    {
      id: "fb3-byzantine",
      day: 1,
      side: "byzantine",
      dateText: { en: "28 APRIL 1453", tr: "28 NİSAN 1453" },
      eyebrow: { en: "FLASHBACK 3", tr: "FLASHBACK 3" },
      title: { en: "What Will You Do?", tr: "Ne Yapacaksın?" },
      paragraphs: [
        {
          en: `Venetian captain Giacomo Coco proposes a night raid to burn the Ottoman fleet inside the Golden Horn.`,
          tr: `Venedikli kaptan Giacomo Coco, Haliç'e inen Osmanlı filosunu gece yakmayı teklif eder.`,
        },
      ],
      // Materyal: 2. Periyot, Soru 6
      infoBox: {
        title: {
          en: `How did the overland launch of the Ottoman fleet into the Golden Horn directly affect the Byzantine defense along the land walls?`,
          tr: `Osmanlı donanmasının Haliç'e indirilmesi Bizans'ın kara surlarındaki savunmasını doğrudan nasıl etkilemiştir?`,
        },
        text: {
          en: `Byzantium was forced to divert at least 20% of its troops from the 6 km land walls to the weak Golden Horn sea walls, reducing land wall density to 1–2 soldiers per meter.`,
          tr: `Bizans, 6 km'lik kara surlarındaki askerlerin en az %20'sini zayıf Haliç deniz surlarına kaydırmak zorunda kalmış ve kara suru yoğunluğu metre başına 1–2 askere düşmüştür.`,
        },
      },
      choices: [
        {
          text: {
            en: `Authorize the night raid; when Genoese spies in Galata leak the plan and Coco's ship is sunk, station Cretan archers and Venetian sailors along the Golden Horn walls.`,
            tr: `Gece baskınına izin ver; ancak Galata'daki Cenevizlilerin haberi sızdırmasıyla Coco'nun gemisi batırılınca Haliç surlarına Giritli okçuları ve Venedikli denizcileri yerleştir.`,
          },
          historical: true,
          next: "to-be-continued",
        },
        {
          text: {
            en: `Divert zero troops to the Golden Horn and keep all forces at Topkapı.`,
            tr: `Haliç'e hiç asker kaydırma, tüm gücü Topkapı'da tut.`,
          },
          historical: false,
          // Oyun erken biter: sonuç doğrudan son ekranında gösterilir
          next: "ending-golden-horn",
        },
      ],
    },

    // TASLAK: Flashback 3 Bizans, tarihsel olmayan seçenek ("Oyun Erken Biter").
    // Paragraf materyaldeki sonuç cümlesidir; "Tarihte ne oldu" notu yalnızca
    // tarihsel seçeneğin materyaldeki cümlelerinden türetildi. Yazım ekibi gözden geçirmeli.
    {
      id: "ending-golden-horn",
      day: 1,
      side: "byzantine",
      dateText: { en: "28 APRIL 1453", tr: "28 NİSAN 1453" },
      ending: true,
      paragraphs: [
        {
          en: `Hamza Bey's marines scale the undefended Golden Horn walls early.`,
          tr: `Hamza Bey'in denizcileri Haliç surlarını erkenden aşar.`,
        },
      ],
      note: {
        en: `The night raid was authorized; Genoese spies in Galata leaked the plan and Coco's ship was sunk. Cretan archers and Venetian sailors were stationed along the Golden Horn walls, and the Golden Horn sea walls were secured.`,
        tr: `Gece baskınına izin verildi; Galata'daki Cenevizlilerin haberi sızdırmasıyla Coco'nun gemisi batırıldı. Haliç surlarına Giritli okçular ve Venedikli denizciler yerleştirildi ve Haliç deniz surları güvenceye alındı.`,
      },
    },

    // GEÇİCİ: Prolog'dan sonraki bölüm yazılınca silinecek
    {
      id: "to-be-continued",
      day: 1,
      eyebrow: { en: "TO BE CONTINUED", tr: "DEVAMI GELECEK" },
      title: { en: "To Be Continued", tr: "Devamı Gelecek" },
      paragraphs: [
        {
          en: "This part of the story is still being written.",
          tr: "Hikâyenin bu bölümü henüz yazılıyor.",
        },
      ],
      choices: [SHARED.restartChoice],
    },

    // Kaynaklar (şu an hiçbir düğme buraya gitmiyor)
    {
      id: "sources",
      day: 30,
      title: { en: "Sources", tr: "Kaynaklar" },
      showSources: true,
      choices: [SHARED.restartChoice],
    },
  ],
};
