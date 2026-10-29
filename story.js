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
    happened: "THIS IS WHAT HAPPENED",
    actuallyHappened: "What actually happened:",
    yourChoice: "Your choice",
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
    happened: "TARİHTE DE BÖYLE OLDU",
    actuallyHappened: "Tarihte yaşanan:",
    yourChoice: "Seçimin",
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
  // Son (ending) ekranları "Kaynaklar" ve "Başa Dön" düğmelerini kendiliğinden kullanır.
  sourcesChoice: {
    text: { en: "Sources", tr: "Kaynaklar" },
    next: "sources",
    style: "secondary",
  },
  // "Başa Dön": oyuncuyu açılışa götürür; seçenek sıraları yeniden karılır.
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
//   hideDate    true ise üst çubuktaki tarih gizlenir (yeri korunur), ör. Kaynaklar
//   plainBackground true ise kutucukta görsel yerine düz koyu zemin (ör. Kaynaklar)
//   side        isteğe bağlı: "ottoman" ya da "byzantine"; taraf etiketi ve renkli şerit
//   image       isteğe bağlı kutucuk resmi (assets/ altında); yoksa tarafın görseli
//               (STORY.sideBackgrounds), o da yoksa assets/background.jpg
//   opening     true ise açılış düzeni: büyük başlık, alt bilgi ve uyarı kutucuğu
//   eyebrow     başlığın üstündeki küçük yazı (ending sahnesinde "Farklı bir son" yerine geçer)
//   title       başlık (ending sahnelerinde gerekmez)
//   paragraphs  paragraf listesi
//   reports     isteğe bağlı sabah raporları: [{ who, text, cite }]; cite isteğe bağlı
//   note        isteğe bağlı küçük not; ending sahnesinde (isteğe bağlı) "Tarihte ne oldu" notu
//   infoBox     isteğe bağlı "Daha fazla bilgi" kutusu: { text } (tek cümle; title isteğe bağlı)
//               Karar sahnesinde seçimden SONRA görünür (sonuç ya da onay ekranında).
//   showSources true ise STORY.sources listesi ve görsel notu gösterilir
//   ending      true ise son ekranı; "Kaynaklar" ve "Başa Dön" düğmeleri kendiliğinden gelir
//   choices     düğmeler: text + next (+ isteğe bağlı style: "secondary")
//               Karar sahnelerinde her seçenek: historical: true/false;
//               historical: false ise result (sonuç metni) de yazılır; result
//               yoksa sonuç ekranı "Tarihte yaşanan:" ile tarihsel seçeneği gösterir.
const STORY = {
  start: "title",
  lastDay: 30,

  // Kaynak ekranındaki kaynakça: gruplar hâlinde. Her grup bir başlık ve künyelerden
  // oluşur; her künye iki dilde { tr, en }. Doğrulanması gerekenler
  // "DOĞRULANACAK" yorumuyla işaretli (bkz. HIKAYE-EKLEME.md).
  sources: [
    {
      heading: { tr: `Çağdaş tanıklar ve Batı–Bizans kaynakları`, en: `Contemporary witnesses and Western–Byzantine sources` },
      items: [
        {
          tr: `Nicolò Barbaro. Diary of the Siege of Constantinople, 1453 (Giornale dell'assedio di Costantinopoli 1453). Ed. Enrico Cornet. Vienna: Tendler &amp; Comp., 1856. İngilizce çeviri: J. R. Melville-Jones. New York: Exposition Press, 1969.`,
          en: `Nicolò Barbaro. Diary of the Siege of Constantinople, 1453 (Giornale dell'assedio di Costantinopoli 1453). Ed. Enrico Cornet. Vienna: Tendler &amp; Comp., 1856. English translation: J. R. Melville-Jones. New York: Exposition Press, 1969.`,
        },
        {
          tr: `Leonardo of Chios. "Letter to Pope Nicholas V (16 June 1453)" (Epistola ad Nicolaum V). Patrologia Graeca, CXLIX, 1865. İngilizce çeviri: J. R. Melville-Jones, The Siege of Constantinople 1453: Seven Contemporary Accounts içinde. Amsterdam: Hakkert, 1972.`,
          en: `Leonardo of Chios. "Letter to Pope Nicholas V (16 June 1453)" (Epistola ad Nicolaum V). Patrologia Graeca, CXLIX, 1865. English translation: J. R. Melville-Jones, in The Siege of Constantinople 1453: Seven Contemporary Accounts. Amsterdam: Hakkert, 1972.`,
        }, // DOĞRULANACAK
        {
          tr: `George Sphrantzes. Chronicon Minus / Chronicon Maius (1401–1477). Çeviri: Marios Philippides, The Fall of the Byzantine Empire. Amherst: University of Massachusetts Press, 1980.`,
          en: `George Sphrantzes. Chronicon Minus / Chronicon Maius (1401–1477). Translated by Marios Philippides, The Fall of the Byzantine Empire. Amherst: University of Massachusetts Press, 1980.`,
        },
        {
          tr: `Jacopo Tedaldi. "The Report of Jacopo Tedaldi." J. R. Melville-Jones (çev.), The Siege of Constantinople 1453: Seven Contemporary Accounts içinde. Amsterdam: Hakkert, 1972.`,
          en: `Jacopo Tedaldi. "The Report of Jacopo Tedaldi." J. R. Melville-Jones (trans.), in The Siege of Constantinople 1453: Seven Contemporary Accounts. Amsterdam: Hakkert, 1972.`,
        },
        {
          tr: `Michael Doukas. Decline and Fall of Byzantium to the Ottoman Turks (Historia Turco-Byzantina). Çeviri: Harry J. Magoulias. Detroit: Wayne State University Press, 1975.`,
          en: `Michael Doukas. Decline and Fall of Byzantium to the Ottoman Turks (Historia Turco-Byzantina). Translated by Harry J. Magoulias. Detroit: Wayne State University Press, 1975.`,
        },
        {
          tr: `Kritovoulos. History of Mehmed the Conqueror (Historiae). Çeviri: Charles T. Riggs. Princeton: Princeton University Press, 1954.`,
          en: `Kritovoulos. History of Mehmed the Conqueror (Historiae). Translated by Charles T. Riggs. Princeton: Princeton University Press, 1954.`,
        },
        {
          tr: `Zorzi Dolfin. Assedio e presa di Costantinopoli nell'anno 1453.`,
          en: `Zorzi Dolfin. Assedio e presa di Costantinopoli nell'anno 1453.`,
        },
      ],
    },
    // DOĞRULANACAK: neşir/çeviri ve yayın bilgileri eksik.
    {
      heading: { tr: `Osmanlı kronikleri`, en: `Ottoman chronicles` },
      items: [
        {
          tr: `Tursun Bey. Târîh-i Ebü'l-Feth.`,
          en: `Tursun Bey. Târîh-i Ebü'l-Feth.`,
        },
        {
          tr: `Âşıkpaşazâde. Tevârîh-i Âl-i Osmân.`,
          en: `Âşıkpaşazâde. Tevârîh-i Âl-i Osmân.`,
        },
        {
          tr: `Neşrî. Kitâb-ı Cihannümâ.`,
          en: `Neşrî. Kitâb-ı Cihannümâ.`,
        },
        {
          tr: `İbn Kemal (Kemalpaşazâde). Tevârîh-i Âl-i Osmân, VII. Defter.`,
          en: `İbn Kemal (Kemalpaşazâde). Tevârîh-i Âl-i Osmân, Book VII.`,
        },
        {
          tr: `Tâcizâde Cafer Çelebi. Mahrûse-i İstanbul Fetihnâmesi.`,
          en: `Tâcizâde Cafer Çelebi. Mahrûse-i İstanbul Fetihnâmesi.`,
        },
      ],
    },
    {
      heading: { tr: `Modern çalışmalar`, en: `Modern scholarship` },
      items: [
        {
          tr: `Halil İnalcık. İstanbul Fethinin Yakın Sebepleri. Ankara, 1953.`,
          en: `Halil İnalcık. İstanbul Fethinin Yakın Sebepleri. Ankara, 1953.`,
        }, // DOĞRULANACAK
        {
          tr: `Halil İnalcık. "İstanbul Kuşatması ve Fatih'in Sivil Politikası." Tarih Araştırmaları Dergisi, 1963, ss. 128–132.`,
          en: `Halil İnalcık. "İstanbul Kuşatması ve Fatih'in Sivil Politikası." Tarih Araştırmaları Dergisi, 1963, pp. 128–132.`,
        }, // DOĞRULANACAK
        {
          tr: `Halil İnalcık. Fatih Sultan Mehmet, İstanbul Fethi ve İmparatorluk, 1964.`,
          en: `Halil İnalcık. Fatih Sultan Mehmet, İstanbul Fethi ve İmparatorluk, 1964.`,
        }, // DOĞRULANACAK
        {
          tr: `Feridun M. Emecen. Fetih ve Kıyamet: 1453. İstanbul: Timaş Yayınları, 2012.`,
          en: `Feridun M. Emecen. Fetih ve Kıyamet: 1453. İstanbul: Timaş Yayınları, 2012.`,
        },
        {
          tr: `Feridun M. Emecen. "Konstantinopolis'in Son Kuşatması ve Düşüşü." Antik Çağ'dan XXI. Yüzyıla Büyük İstanbul Tarihi, Cilt II. İstanbul, 2015, ss. 294–347.`,
          en: `Feridun M. Emecen. "Konstantinopolis'in Son Kuşatması ve Düşüşü." Antik Çağ'dan XXI. Yüzyıla Büyük İstanbul Tarihi, Vol. II. İstanbul, 2015, pp. 294–347.`,
        },
        {
          tr: `Marios Philippides ve Walter K. Hanak. The Siege and the Fall of Constantinople in 1453: Historiography, Topography, and Military Studies. Farnham: Ashgate, 2011.`,
          en: `Marios Philippides and Walter K. Hanak. The Siege and the Fall of Constantinople in 1453: Historiography, Topography, and Military Studies. Farnham: Ashgate, 2011.`,
        },
        {
          tr: `Marios Philippides. Constantine XI Paleologus: Fall and Legend. 2000.`,
          en: `Marios Philippides. Constantine XI Paleologus: Fall and Legend. 2000.`,
        }, // DOĞRULANACAK
        {
          tr: `Steven Runciman. İstanbul Düştü: 1453 (The Fall of Constantinople 1453). Çeviri: Derin Türkömer. İstanbul: Türkiye İş Bankası Kültür Yayınları, 2008. (Orijinal basım: Cambridge University Press, 1965.)`,
          en: `Steven Runciman. İstanbul Düştü: 1453 (The Fall of Constantinople 1453). Translated by Derin Türkömer. İstanbul: Türkiye İş Bankası Kültür Yayınları, 2008. (Original edition: Cambridge University Press, 1965.)`,
        }, // DOĞRULANACAK (Türkçe baskı)
        {
          tr: `Donald M. Nicol. Bizans'ın Son Yüzyılları (1261–1453). Çeviri: Bilge Umar. İstanbul: Tarih Vakfı Yurt Yayınları, 1999.`,
          en: `Donald M. Nicol. Bizans'ın Son Yüzyılları (1261–1453). Translated by Bilge Umar. İstanbul: Tarih Vakfı Yurt Yayınları, 1999.`,
        },
        {
          tr: `Donald M. Nicol. The Immortal Emperor: The Life and Legend of Constantine Palaiologos. Cambridge University Press, 1992.`,
          en: `Donald M. Nicol. The Immortal Emperor: The Life and Legend of Constantine Palaiologos. Cambridge University Press, 1992.`,
        },
        {
          tr: `Agostino Pertusi. İstanbul'un Fethi (La Caduta di Costantinopoli). 2 Cilt. Milan: Mondadori, 1976.`,
          en: `Agostino Pertusi. İstanbul'un Fethi (La Caduta di Costantinopoli). 2 vols. Milan: Mondadori, 1976.`,
        },
        {
          tr: `Fahameddin Başar. "İstanbul'un Fethine Dair Literatür Değerlendirmesi." Türkiye Araştırmaları Literatür Dergisi (TALİD), Cilt 8, Sayı 16, 2010, ss. 61–100.`,
          en: `Fahameddin Başar. "İstanbul'un Fethine Dair Literatür Değerlendirmesi." Türkiye Araştırmaları Literatür Dergisi (TALİD), Vol. 8, No. 16, 2010, pp. 61–100.`,
        },
        {
          tr: `M. Münir Aktepe. "Çandarlı Halil Paşa." TDV İslâm Ansiklopedisi, Cilt 8, 1993, ss. 212–213.`,
          en: `M. Münir Aktepe. "Çandarlı Halil Paşa." TDV İslâm Ansiklopedisi, Vol. 8, 1993, pp. 212–213.`,
        },
        {
          tr: `İsmail Hakkı Uzunçarşılı. Osmanlı Tarihi, I. Cilt. Ankara: Türk Tarih Kurumu Yayınları.`,
          en: `İsmail Hakkı Uzunçarşılı. Osmanlı Tarihi, Vol. I. Ankara: Türk Tarih Kurumu Yayınları.`,
        }, // DOĞRULANACAK (yıl/baskı eksik)
        {
          tr: `Abdülkadir Emeksiz. "Efsanelerin İstanbul'u, Fetih ve Fatih." Fatih Sempozyumları I–II. İstanbul, 2007, ss. 148–160.`,
          en: `Abdülkadir Emeksiz. "Efsanelerin İstanbul'u, Fetih ve Fatih." Fatih Sempozyumları I–II. İstanbul, 2007, pp. 148–160.`,
        },
        {
          tr: `Michael Goodyear. When Death Docked in Constantinople.`,
          en: `Michael Goodyear. When Death Docked in Constantinople.`,
        }, // DOĞRULANACAK (yıl/yayın eksik)
        {
          tr: `Michael Goodyear. Epidemic Waves of the Black Death in the Byzantine Empire (1347–1453).`,
          en: `Michael Goodyear. Epidemic Waves of the Black Death in the Byzantine Empire (1347–1453).`,
        }, // DOĞRULANACAK (yıl/yayın eksik)
      ],
    },
  ],

  // Kaynak listesinin altındaki küçük not. Boş bırakılırsa ekranda görünmez.
  // TASLAK: ekip onayına tabi
  sourcesNote: {
    tr: `Kaynak listesi araştırma ekibi tarafından hazırlanmıştır.`,
    en: `This source list was compiled by the research team.`,
  },

  // Kaynak ekranındaki görsel notu (ör. görsellerin yorum olduğu).
  // Boş bırakılırsa ekranda görünmez.
  // TASLAK: ekip onayına tabi
  imageNote: {
    tr: `Oyundaki görseller yapay zekâ ile üretilmiş taslaklardır; sanatsal yorum niteliğindedir ve tarihî bir rekonstrüksiyon değildir.`,
    en: `The illustrations in this game are AI-generated drafts. They are artistic interpretations, not historical reconstructions.`,
  },

  // Tarafa özel kutucuk arka planı. Sahnede image yoksa ve sahnenin side
  // değeri burada varsa bu görsel kullanılır; yoksa assets/background.jpg.
  // position: görselin kutucuk içindeki konumu (CSS background-position).
  sideBackgrounds: {
    byzantine: { image: "assets/backgraund6.jpg", position: "70% center" },
  },

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
        SHARED.sourcesChoice,
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
      eyebrow: { en: "FLASHBACK 1", tr: `GERİYE DÖNÜŞ 1` },
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
      eyebrow: { en: "FLASHBACK 1", tr: `GERİYE DÖNÜŞ 1` },
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
      eyebrow: { en: "FLASHBACK 2", tr: `GERİYE DÖNÜŞ 2` },
      title: { en: "What Will You Do?", tr: "Ne Yapacaksın?" },
      paragraphs: [
        {
          en: `Hungarian engineer Orban, whom the Byzantines could not afford to pay, casts the giant bronze cannon "Şahi" in Edirne alongside Architect Muslihiddin and Saruca Pasha. However, on April 20, 3 Genoese cargo ships and 1 Byzantine grain ship break through Admiral Süleyman Baltaoğlu's blockade aided by a strong southern wind; Sultan Mehmed rides his horse into the sea in fury.`,
          tr: `Bizans'ın maaşını ödeyemediği Macar mühendis Orban, Mimar Muslihiddin ve Saruca Paşa ile birlikte Edirne'de dev "Şahi" topunu döker. Ancak 20 Nisan'da 3 Ceneviz ve 1 Bizans gemisi lodosla Amiral Süleyman Baltaoğlu'nun ablukasını yarar; Sultan Mehmed atını denize sürer.`,
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
            en: `Ottoman ships sink at the chain.`,
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
      eyebrow: { en: "FLASHBACK 2", tr: `GERİYE DÖNÜŞ 2` },
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
            en: `Line up the Venetian galleons behind the chain and transfer all troops from the Golden Horn walls to the St. Romanos land walls.`,
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
      eyebrow: { en: "FLASHBACK 3", tr: `GERİYE DÖNÜŞ 3` },
      title: { en: "What Will You Do?", tr: "Ne Yapacaksın?" },
      paragraphs: [
        {
          en: `On the night of April 21–22, 70–72 light ships are to be hauled overland into the Golden Horn on greased wooden slipways.`,
          tr: `21–22 Nisan gecesi 70–72 hafif gemi yağlanmış ahşap kızaklarla karadan Haliç'e indirilecektir.`,
        },
      ],
      // Materyal: 1. Periyot, Soru 2
      infoBox: {
        text: {
          en: `When the Ottoman fleet could not break the Golden Horn chain from the sea, Sultan Mehmed II bypassed the barrier on the night of April 21–22 by hauling 70–72 ships overland on greased wooden slipways (via the Tophane–Kasımpaşa or Beşiktaş–Dolmabahçe route) into the Golden Horn.`,
          tr: `Osmanlı donanması Haliç zincirini denizden kıramayınca Fatih Sultan Mehmed, 21–22 Nisan gecesi 70–72 gemiyi yağlanmış kızaklarla karadan (Tophane–Kasımpaşa veya Beşiktaş–Dolmabahçe hattından) Haliç'e indirerek zincir engelini aşmıştır.`,
        },
      },
      choices: [
        {
          text: {
            en: `Mask the noise with artillery bombardment from the hills of Galata and use the hidden Beşiktaş–Dolmabahçe valley route to launch the ships into the inner Golden Horn.`,
            tr: `Galata tepelerinden top ateşiyle gürültüyü örtüp gizli Beşiktaş–Dolmabahçe vadi güzergâhından gemileri Haliç'in iç kısmına indir.`,
          },
          historical: true,
          next: "fb3-byzantine",
        },
        {
          text: {
            en: `Use the short Tophane–Kasımpaşa route right beside the walls of Galata without artillery cover.`,
            tr: `Top koruması olmadan Galata surlarının hemen yanındaki kısa Tophane–Kasımpaşa hattını kullan.`,
          },
          historical: false,
          result: {
            en: `Genoese lookouts in Galata spot the ships early and alert the Venetian galleys.`,
            tr: `Galata gözcüleri gemileri erken fark eder ve Venedik kadırgalarını uyarır.`,
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
      eyebrow: { en: "FLASHBACK 3", tr: `GERİYE DÖNÜŞ 3` },
      title: { en: "What Will You Do?", tr: "Ne Yapacaksın?" },
      paragraphs: [
        {
          en: `Venetian captain Giacomo Coco proposes a night raid to burn the Ottoman fleet inside the Golden Horn.`,
          tr: `Venedikli kaptan Giacomo Coco, Haliç'e inen Osmanlı filosunu gece yakmayı teklif eder.`,
        },
      ],
      // Materyal: 2. Periyot, Soru 6
      infoBox: {
        text: {
          en: `Because the Ottoman ships were hauled overland into the Golden Horn, Byzantium had to move at least 20% of the troops guarding its 6 km of land walls to the weak sea walls of the Golden Horn, leaving only 1–2 soldiers per meter on the land walls.`,
          tr: `Osmanlı gemilerinin karadan Haliç'e indirilmesi, Bizans'ı 6 km'lik kara surlarındaki askerlerin en az %20'sini zayıf Haliç deniz surlarına kaydırmaya zorlamış; bu yüzden kara surlarında metre başına yalnızca 1–2 asker kalmıştır.`,
        },
      },
      choices: [
        {
          text: {
            en: `Authorize the night raid; when Genoese spies in Galata leak the plan and Coco's ship is sunk, station Cretan archers and Venetian sailors along the Golden Horn walls.`,
            tr: `Gece baskınına izin ver; ancak Galata'daki Cenevizlilerin haberi sızdırmasıyla Coco'nun gemisi batırılınca Haliç surlarına Giritli okçuları ve Venedikli denizcileri yerleştir.`,
          },
          historical: true,
          next: "period-1-intro",
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
          tr: `Hamza Bey'in denizcileri savunmasız Haliç surlarını erkenden aşar.`,
        },
      ],
      note: {
        en: `The night raid was authorized; Genoese spies in Galata leaked the plan and Coco's ship was sunk. Cretan archers and Venetian sailors were stationed along the Golden Horn walls, and the Golden Horn sea walls were secured.`,
        tr: `Gece baskınına izin verildi; Galata'daki Cenevizlilerin haberi sızdırmasıyla Coco'nun gemisi batırıldı. Haliç surlarına Giritli okçular ve Venedikli denizciler yerleştirildi ve Haliç deniz surları güvenceye alındı.`,
      },
    },

    // ───────────── 1. PERİYOT: 30 NİSAN – 5 MAYIS 1453 ─────────────

    // Dönem açılışı
    {
      id: "period-1-intro",
      day: 1,
      dateText: { en: "30 APRIL – 5 MAY 1453", tr: "30 NİSAN – 5 MAYIS 1453" },
      eyebrow: { en: "PERIOD 1", tr: "1. PERİYOT" },
      title: {
        en: "Collapse of the Stone Walls, Earthen Ramparts, and the Galley Slipping into the Dark",
        tr: "Taş Surların Çöküşü, Toprak Tabyalar ve Karanlıkta Sızan Kadırga",
      },
      reports: [
        {
          who: {
            en: "Tursun Bey (Târîh-i Ebü'l-Feth)",
            tr: "Tursun Bey (Târîh-i Ebü'l-Feth)",
          },
          text: {
            en: `"The Sultan of the World pitched his imperial tent opposite the Lykos Valley. Roaring like the breath of a dragon, our Şahi cannons have begun pounding the thousand-year-old bastions of Constantinople; stones shatter into dust and rise to the heavens."`,
            tr: `"Sultan-ı Cihan, Lykos Vadisi karşısında otağını kurdu. Ejderha nefesi gibi kükreyen Şahi toplarımız, bin yıllık Konstantinopolis burçlarını dövmeye başladı; taşlar toz duman olup göğe savruluyor."`,
          },
        },
        {
          who: {
            en: "Nicolò Barbaro (Venetian Diary)",
            tr: "Nicolò Barbaro (Venedik Ruznâmesi)",
          },
          text: {
            en: `"May 3... The monstrous cannon of the Turks is leveling the St. Romanos Gate. At noon today, the Emperor dispatched a secret brigantine flying the Ottoman standard into the Aegean to search for the Venetian fleet. Our prayers go with them."`,
            tr: `"3 Mayıs günü... Türklerin devasa topu St. Romanos kapısını yerle bir ediyor. Bugün öğle vakti İmparator, Osmanlı sancağı çekilmiş gizli bir brigantini (keşif kadırgasını) Venedik donanmasını araması için Ege'ye uğurladı. Dualarımız onlarla."`,
          },
        },
      ],
      choices: [
        { text: { en: "Continue", tr: "Devam Et" }, next: "p1-ottoman" },
      ],
    },

    // 1. Periyot — Osmanlı: Şahi topunun soğutulması
    {
      id: "p1-ottoman",
      day: 1,
      side: "ottoman",
      dateText: { en: "30 APRIL – 5 MAY 1453", tr: "30 NİSAN – 5 MAYIS 1453" },
      eyebrow: { en: "PERIOD 1", tr: "1. PERİYOT" },
      title: { en: "What Will You Do?", tr: "Ne Yapacaksın?" },
      paragraphs: [
        {
          en: `Relentless bombardment against the St. Romanos (Mesoteichion) walls has dangerously overheated the giant bronze Şahi cannon; hairline fractures have begun appearing on the barrel.`,
          tr: `St. Romanos (Mesoteichion) surlarına yapılan aralıksız atışlar dev tunç Şahi topunu aşırı ısıttı; namluda kılcal çatlaklar belirdi.`,
        },
      ],
      // Materyal: 3. Periyot, Soru 10
      infoBox: {
        text: {
          en: `To keep the giant Şahi cannons cast in Edirne from cracking and exploding, the hot bronze barrels were cooled with olive oil after every shot and the rate of fire was strictly limited.`,
          tr: `Edirne'de dökülen dev Şahi toplarının çatlayıp patlamasını önlemek için her atıştan sonra sıcak tunç namlular zeytinyağıyla soğutulmuş ve atış hızı sınırlandırılmıştır.`,
        },
      },
      choices: [
        {
          text: {
            en: `Cool the barrel with olive oil after every shot and limit firing to 6–7 shots a day.`,
            tr: `Namluyu her atıştan sonra zeytinyağıyla soğut, günde 6–7 gülle at.`,
          },
          historical: true,
          next: "p1-byzantine",
        },
        {
          text: {
            en: `Fire 12 shots a day without cooling.`,
            tr: `Soğutmadan günde 12 atış yap.`,
          },
          historical: false,
          result: {
            en: `The cannon explodes and Orban dies.`,
            tr: `Top patlar ve Orban ölür.`,
          },
          next: "p1-byzantine",
        },
      ],
    },

    // 1. Periyot — Bizans: toprak tabya
    {
      id: "p1-byzantine",
      day: 1,
      side: "byzantine",
      dateText: { en: "30 APRIL – 5 MAY 1453", tr: "30 NİSAN – 5 MAYIS 1453" },
      eyebrow: { en: "PERIOD 1", tr: "1. PERİYOT" },
      title: { en: "What Will You Do?", tr: "Ne Yapacaksın?" },
      paragraphs: [
        {
          en: `Ottoman cannonballs are shattering the 5th-century Theodosian stone walls, turning flying stone fragments into deadly shrapnel that kills the defenders.`,
          tr: `Osmanlı gülleleri 5. yüzyıldan kalma Theodosius taş surlarını parçalıyor ve kırılan taşlar şarapnel gibi askerleri öldürüyor.`,
        },
      ],
      // Materyal: 1. Periyot, Soru 1
      infoBox: {
        text: {
          en: `Because stone walls shattered under cannon fire into deadly shrapnel, Giustiniani held the Outer Wall rather than the taller Inner Wall and repaired the breaches with earth-filled barrels and wooden palisades instead of masonry, since compacted earth absorbed the cannonballs' kinetic energy.`,
          tr: `Taş surlar top güllesiyle parçalanıp ölümcül şarapnel etkisi yarattığından Giustiniani, ana savunmayı daha yüksek olan İç Sur yerine Dış Sur'a çekmiş ve yıkılan yerleri taşla örmek yerine, gülle enerjisini emen toprak dolu fıçılar ile ahşap palisatlarla kapatmıştır.`,
        },
      },
      choices: [
        {
          text: {
            en: `Hold the Outer Wall; build flexible Earthen Ramparts (Palisades) at night using wood and earth barrels.`,
            tr: `Savunmayı Dış Sur'da tut; gece ahşap ve toprak fıçılarla esnek toprak tabya (palisade) ör.`,
          },
          historical: true,
          next: "period-2-intro",
        },
        {
          text: {
            en: `Repair the breach with stone and retreat to the Inner Wall.`,
            tr: `Taşla onar ve İç Sur'a çekil.`,
          },
          historical: false,
          result: {
            en: `300 troops are killed by shrapnel.`,
            tr: `300 asker şarapnelden ölür.`,
          },
          next: "period-2-intro",
        },
      ],
    },

    // ───────────── 2. PERİYOT: 6 – 11 MAYIS 1453 ─────────────

    // Dönem açılışı
    {
      id: "period-2-intro",
      day: 7,
      dateText: { en: "6 – 11 MAY 1453", tr: "6 – 11 MAYIS 1453" },
      eyebrow: { en: "PERIOD 2", tr: "2. PERİYOT" },
      title: {
        en: "The May 7 Night Assault, Ditch Warfare, and the Wheat Black Market",
        tr: "7 Mayıs Gece Taarruzu, Hendek Savaşları ve Buğday Karaborsası",
      },
      reports: [
        {
          who: { en: "Tursun Bey", tr: "Tursun Bey" },
          text: {
            en: `"On the night of May 7 at the time of the night prayer, thirty thousand brave warriors marched upon the walls from the Lykos Valley chanting tekbirs. In a three-hour battle, the infidel ramparts shook; yet as the ditches were not fully filled, our Sultan sounded the retreat so that soldiers would not perish in vain."`,
            tr: `"7 Mayıs gecesi yatsı vakti, otuz bin yiğit tekbirlerle Lykos vadisinden surlara yürüdü. Üç saat süren cenkte küffarın tabyaları sarsıldı; lakin hendekler tam dolmadığından Sultanımız, asker telef olmasın diye geri çekilme borusu çaldırdı."`,
          },
        },
        {
          who: { en: "Nicolò Barbaro", tr: "Nicolò Barbaro" },
          text: {
            en: `"On the night of May 7 around the fourth hour, the Turks attacked by land with such terrifying war cries that heaven and earth trembled. Commander Giustiniani and our Emperor fought personally in the breach. Yet there is no bread left in the city; merchants are selling wheat at ten times its price!"`,
            tr: `"7 Mayıs gecesi saat dört sularında Türkler karadan öyle korkunç bir çığlıkla saldırdılar ki yer gök inledi. Komutan Giustiniani ve İmparatorumuz bizzat gedikte dövüştü. Ancak şehirde ekmek kalmadı; tüccarlar buğdayı on katı fiyata satıyor!"`,
          },
        },
      ],
      choices: [
        { text: { en: "Continue", tr: "Devam Et" }, next: "p2-ottoman" },
      ],
    },

    // 2. Periyot — Osmanlı: Yeniçeri / Azap, hendek
    {
      id: "p2-ottoman",
      day: 7,
      side: "ottoman",
      dateText: { en: "6 – 11 MAY 1453", tr: "6 – 11 MAYIS 1453" },
      eyebrow: { en: "PERIOD 2", tr: "2. PERİYOT" },
      title: { en: "What Will You Do?", tr: "Ne Yapacaksın?" },
      paragraphs: [
        {
          en: `The May 7 night assault revealed that the outer ditches (Fossa) were not sufficiently filled.`,
          tr: `7 Mayıs gece saldırısında hendeklerin (Fossa) yeterince dolmadığı görüldü.`,
        },
      ],
      choices: [
        {
          text: {
            en: `Save the Janissaries for May 29; use the Azaps on May 11 to fill the ditch with brushwood and barrels.`,
            tr: `Yeniçerileri 29 Mayıs'a sakla; 11 Mayıs'ta Azaplarla hendeği çalı demetleri ve fıçılarla doldur.`,
          },
          historical: true,
          next: "p2-byzantine",
        },
        {
          text: {
            en: `Send the Janissaries into the unfilled ditch.`,
            tr: `Yeniçerileri dolmamış hendeğe sür.`,
          },
          historical: false,
          result: {
            en: `2,000 Janissaries are lost.`,
            tr: `2.000 Yeniçeri kaybedilir.`,
          },
          next: "p2-byzantine",
        },
      ],
    },

    // 2. Periyot — Bizans: Rum Ateşi ve kilise altını
    {
      id: "p2-byzantine",
      day: 7,
      side: "byzantine",
      dateText: { en: "6 – 11 MAY 1453", tr: "6 – 11 MAYIS 1453" },
      eyebrow: { en: "PERIOD 2", tr: "2. PERİYOT" },
      title: { en: "What Will You Do?", tr: "Ne Yapacaksın?" },
      paragraphs: [
        {
          en: `Ottoman laborers are rapidly filling the ditch.`,
          tr: `Osmanlı işçileri hendeği hızla dolduruyor.`,
        },
        {
          en: `Flour and olive oil have run out; wheat prices on the black market have risen tenfold. The state treasury is empty, and soldiers are falling ill from malnutrition.`,
          tr: `Un ve zeytinyağı tükendi; karaborsada buğday 10 katına çıktı. Hazine boş, askerler yetersiz beslenmeden hastalanıyor.`,
        },
      ],
      // Materyal: 2. Periyot, Soru 4
      infoBox: {
        text: {
          en: `According to Nicolò Barbaro's diary, the defense held against the May 7 assault above all because the defenders repaired the breaches throughout the night and the commanders, Constantine XI and Giustiniani, led personally from the front lines.`,
          tr: `Barbaro'nun günlüğüne göre 7 Mayıs taarruzunun püskürtülmesinde en büyük etken, savunmacıların geceyi gedikleri onararak geçirmesi ve XI. Konstantinos ile Giustiniani'nin bizzat ön safta savaşarak liderlik etmesiydi.`,
        },
      },
      choices: [
        {
          text: {
            en: `Incinerate the brushwood in the ditch with Greek Fire and melt down church gold to buy wheat and gunpowder.`,
            tr: `Hendekteki çalıları Rum Ateşi ile yak ve kilise altınlarını eritip buğday ve barut al.`,
          },
          historical: true,
          next: "period-3-intro",
        },
        {
          text: {
            en: `Save the Greek Fire and raid the merchants' depots.`,
            tr: `Rum Ateşi'ni kullanma ve tüccarların depolarına baskın yap.`,
          },
          historical: false,
          result: {
            en: `The Latins mutiny and the gunpowder supply stops.`,
            tr: `Latinler isyan eder ve barut kesilir.`,
          },
          next: "period-3-intro",
        },
      ],
    },

    // ───────────── 3. PERİYOT: 12 – 18 MAYIS 1453 ─────────────

    // Dönem açılışı
    {
      id: "period-3-intro",
      day: 13,
      dateText: { en: "12 – 18 MAY 1453", tr: "12 – 18 MAYIS 1453" },
      eyebrow: { en: "PERIOD 3", tr: "3. PERİYOT" },
      title: {
        en: "The Blachernae Raid, Underground Tunnel Warfare, and the Giant Mobile Tower (Helepolis)",
        tr: "Blachernae Baskını, Yer Altı Tünel Savaşı ve Dev Yürüyen Kule (Helepolis)",
      },
      reports: [
        {
          who: { en: "Tursun Bey", tr: "Tursun Bey" },
          text: {
            en: `"From May 16 onward, our skilled sappers brought from Novo Brdo (Serbia) began digging through the veins of the earth beneath the Kaligaria Gate. On the morning of May 18, our engineers erected a massive mobile siege tower covered in wet ox and camel hides right at the edge of the ditch!"`,
            tr: `"16 Mayıs'tan itibaren Novo Brdo'dan (Sırbistan) getirilen mahir lağımcılarımız Kaligaria kapısı altından yerin damarlarını kazmaya başladı. 18 Mayıs sabahı ise mühendislerimiz, ıslak öküz ve deve derileriyle kaplı devasa yürüyen kuleyi hendeğin kenarına dikti!"`,
          },
        },
        {
          who: { en: "Nicolò Barbaro", tr: "Nicolò Barbaro" },
          text: {
            en: `"May 16... We discovered that the Turks are digging tunnels beneath the walls to enter the city! Thankfully, the Scottish engineer Johannes Grant is listening to the ground with water-filled barrels. Yet on the morning of May 18, we were all struck dumb upon seeing the giant wooden tower the Turks built in a single night."`,
            tr: `"16 Mayıs... Türklerin surların altından şehre girmek için tüneller kazdığını fark ettik! Neyse ki İskoç mühendis Johannes Grant su dolu fıçılarla toprağı dinliyor. 18 Mayıs sabahı ise Türklerin bir gecede inşa ettiği dev ahşap kuleyi görünce hepimiz donup kaldık."`,
          },
        },
      ],
      choices: [
        { text: { en: "Continue", tr: "Devam Et" }, next: "p3-ottoman" },
      ],
    },

    // 3. Periyot — Osmanlı: lağım ve yüzer köprü
    {
      id: "p3-ottoman",
      day: 13,
      side: "ottoman",
      dateText: { en: "12 – 18 MAY 1453", tr: "12 – 18 MAYIS 1453" },
      eyebrow: { en: "PERIOD 3", tr: "3. PERİYOT" },
      title: { en: "What Will You Do?", tr: "Ne Yapacaksın?" },
      paragraphs: [
        {
          en: `Serbian miners are digging tunnels under the single-layered Blachernae walls, while Byzantine engineer John Grant listens for ground vibrations.`,
          tr: `Sırp madenciler tek katlı Blachernae surları altına tünel kazıyor, ancak Bizans mühendisi John Grant titreşimleri dinliyor.`,
        },
        {
          en: `You have constructed a floating bridge of lashed barrels across the Golden Horn.`,
          tr: `Haliç üzerinde birbirine bağlı fıçılardan yüzer bir köprü inşa ettin.`,
        },
      ],
      choices: [
        {
          text: {
            en: `Dig more than 10 deep decoy tunnels with the Serbian miners to exhaust the defenders; mount cannons on the floating bridge to pin down Notaras's reserves.`,
            tr: `Sırp madencilerle 10'dan fazla derin ve şaşırtmalı tünel kazarak Bizans'ı yıprat; Haliç'teki fıçı köprüye top yerleştirip Notaras'ın yedek kuvvetlerini Haliç'e bağla.`,
          },
          historical: true,
          next: "p3-byzantine",
        },
        {
          text: {
            en: `Dig a single shallow tunnel and keep the fleet passive.`,
            tr: `Tek bir sığ tünel kaz ve donanmayı geride tut.`,
          },
          historical: false,
          result: {
            en: `The sappers drown.`,
            tr: `Lağımcılar boğulur.`,
          },
          next: "p3-byzantine",
        },
      ],
    },

    // 3. Periyot — Bizans: Blachernae, John Grant, Helepolis
    {
      id: "p3-byzantine",
      day: 13,
      side: "byzantine",
      dateText: { en: "12 – 18 MAY 1453", tr: "12 – 18 MAYIS 1453" },
      eyebrow: { en: "PERIOD 3", tr: "3. PERİYOT" },
      title: { en: "What Will You Do?", tr: "Ne Yapacaksın?" },
      paragraphs: [
        {
          en: `Karaca Pasha's troops have breached the outer line at Blachernae; Notaras is holding the reserves at the harbor.`,
          tr: `Karaca Paşa birlikleri Blachernae dış hattını yardı; Notaras yedekleri limanda tutuyor.`,
        },
        {
          en: `Tunnels are being dug underground while the giant mobile siege tower (Helepolis) looms before the walls.`,
          tr: `Hem yer altında tüneller kazılıyor hem de sur önünde dev yürüyen kule (Helepolis) duruyor.`,
        },
      ],
      // Materyal: 3. Periyot, Soru 5
      infoBox: {
        text: {
          en: `Against the mobile siege tower (Helepolis) brought before the Blachernae walls on May 18, the Byzantine defenders used no direct artillery fire; they launched a covert night raid and burned the tower completely with Greek Fire.`,
          tr: `Bizans savunması, 18 Mayıs'ta Blachernae surları önüne getirilen yürüyen kuşatma kulesini (Helepolis) doğrudan top atışıyla değil, gece düzenlediği gizli bir baskınla ve Rum Ateşi (Grejuva) kullanarak tamamen yakmıştır.`,
        },
      },
      choices: [
        {
          text: {
            en: `Rush the Emperor to Blachernae on May 12; have John Grant detect the tunnels with water barrels and destroy them with water, sulfur smoke, and Greek Fire; burn the Helepolis at night with Greek Fire.`,
            tr: `İmparatoru 12 Mayıs'ta Blachernae'ye yolla; John Grant su varilleriyle tünelleri bulup su, kükürt dumanı ve Rum Ateşi ile yok etsin; geceleri Helepolis'i Rum Ateşi ile yak.`,
          },
          historical: true,
          next: "period-4-intro",
        },
        {
          text: {
            en: `Keep the Emperor in the palace and save the Greek Fire.`,
            tr: `İmparatoru sarayda tut ve Rum Ateşi'ni harcama.`,
          },
          historical: false,
          result: {
            en: `The Kaligaria wall collapses.`,
            tr: `Kaligaria surları çöker.`,
          },
          next: "period-4-intro",
        },
      ],
    },

    // ───────────── 4. PERİYOT: 19 – 25 MAYIS 1453 ─────────────

    // Dönem açılışı
    {
      id: "period-4-intro",
      day: 20,
      dateText: { en: "19 – 25 MAY 1453", tr: "19 – 25 MAYIS 1453" },
      eyebrow: { en: "PERIOD 4", tr: "4. PERİYOT" },
      title: {
        en: "Islamic Law of War (Call for Peaceful Surrender), the Blood Moon, and the Locked Gates of Galata",
        tr: "İslam Savaş Hukuku (Sulhen Teslim Çağrısı), Kanlı Ay ve Galata'nın Kilitlenen Kapıları",
      },
      reports: [
        {
          who: { en: "Tursun Bey", tr: "Tursun Bey" },
          text: {
            en: `"In accordance with the Sunnah of the Prophet and the decree of Islamic Law (Sharia), İsfendiyaroğlu İsmail Bey was sent into the city as an envoy prior to the final assault to offer peaceful surrender ('Sulhen Teslim') so that no blood would be shed. Yet the Emperor stubbornly refused; thus conquest by force ('Cebren Fetih') has become lawful!"`,
            tr: `"Peygamber-i Zîşân'ın sünneti ve şeriat-ı garrâ hükmünce, son hücumdan evvel İsfendiyaroğlu İsmail Bey şehre elçi gönderildi ki 'Sulhen' teslim olalar ve kan dökülmeye. Lakin Tekfur inat edip reddetti; artık 'Cebren' fetih hak oldu!"`,
          },
        },
        {
          who: { en: "Nicolò Barbaro", tr: "Nicolò Barbaro" },
          text: {
            en: `"On the night of May 22, a terrifying Blood Moon eclipse darkened the sky; prophecy held that the city would never fall during a waxing moon, yet the moon turned the color of blood! On May 23, our scout ship returned from the Aegean: No help is coming, Christendom has forgotten us! The next day, the icon of the Virgin Mary (Hodegetria) slipped into the mud!"`,
            tr: `"22 Mayıs gecesi gökyüzünde korkunç bir Kanlı Ay Tutulması oldu; kehanete göre dolunay vaktinde şehir düşmezdi ama ay kan rengine büründü! 23 Mayıs'ta ise Ege'ye giden gemimiz döndü: Yardım yok, Hristiyan dünyası bizi unuttu! Ertesi gün Meryem Ana ikonası (Hodegetria) çamura düştü!"`,
          },
        },
      ],
      choices: [
        { text: { en: "Continue", tr: "Devam Et" }, next: "p4-ottoman" },
      ],
    },

    // 4. Periyot — Osmanlı: elçi, Akşemseddin ve Yavedud Sultan
    {
      id: "p4-ottoman",
      day: 20,
      side: "ottoman",
      dateText: { en: "19 – 25 MAY 1453", tr: "19 – 25 MAYIS 1453" },
      eyebrow: { en: "PERIOD 4", tr: "4. PERİYOT" },
      title: { en: "What Will You Do?", tr: "Ne Yapacaksın?" },
      paragraphs: [
        {
          en: `Islamic law of war (Fiqh) mandates offering peaceful surrender (Sulhen Teslim / Aman) before launching a final assault.`,
          tr: `İslam savaş hukuku (Fıkıh), son taarruzdan önce barışçıl teslimiyet (Sulhen Teslim / Aman) teklif edilmesini emreder.`,
        },
        {
          en: `The siege is entering its 7th week; the morale of the exhausted troops must be uplifted.`,
          tr: `Kuşatma 7. haftasında; yorgun askerlerin maneviyatını yükseltmek gerekiyor.`,
        },
      ],
      // Materyal: 4. Periyot, Soru 9
      infoBox: {
        text: {
          en: `Under Islamic law of war (Fiqh), Sultan Mehmed II's offer of peaceful surrender ("Sulhen") through the envoy İsmail Bey before the final assault meant that, once it was rejected and the city was taken by force ("Cebren"), the 3-day right of plunder and the conversion of Hagia Sophia, the chief church, into a mosque as a symbol of sovereignty gained full legal legitimacy.`,
          tr: `İslam savaş hukukuna (Fıkıh) göre Fatih Sultan Mehmed'in son taarruzdan önce İsmail Bey'i elçi göndererek şehri "Sulhen" teslim olmaya çağırması, teklifin reddedilip şehrin savaşla ("Cebren") alınması hâlinde 3 günlük yağma hakkına ve baş kilise Ayasofya'nın egemenlik sembolü olarak camiye çevrilmesine tam bir hukuki meşruiyet kazandırmıştır.`,
        },
      },
      choices: [
        {
          text: {
            en: `Send the envoy İsfendiyaroğlu İsmail Bey to offer Sulhen Teslim; have Molla Akşemseddin deliver a sermon and send Yavedud Sultan and the dervishes to the front trenches with prayers.`,
            tr: `İsfendiyaroğlu İsmail Bey'i elçi olarak gönderip Sulhen Teslim teklif et; Molla Akşemseddin'e vaaz verdir, Yavedud Sultan'ı ve dervişleri dualarla ön siperlere gönder.`,
          },
          historical: true,
          next: "p4-byzantine",
        },
        {
          text: {
            en: `Skip sending the envoy.`,
            tr: `Elçi gönderme.`,
          },
          historical: false,
          // Basit materyaldeki sonuç yalnızca göstergeydi; sonuç ana materyalden
          result: {
            en: `The Ulema criticize bypassing legal procedure.`,
            tr: `Ulema hukuki prosedürün atlanmasını eleştirir.`,
          },
          next: "p4-byzantine",
        },
      ],
    },

    // 4. Periyot — Bizans: elçinin reddi, ikona, Galata
    {
      id: "p4-byzantine",
      day: 20,
      side: "byzantine",
      dateText: { en: "19 – 25 MAY 1453", tr: "19 – 25 MAYIS 1453" },
      eyebrow: { en: "PERIOD 4", tr: "4. PERİYOT" },
      title: { en: "What Will You Do?", tr: "Ne Yapacaksın?" },
      paragraphs: [
        {
          en: `İsmail Bey has presented the terms of surrender.`,
          tr: `İsmail Bey teslimiyet şartlarını sundu.`,
        },
        {
          en: `The icon fell into the mud, and the terrified populace is flooding into Hagia Sophia.`,
          tr: `İkona çamura düştü, halk panik içinde Ayasofya'ya koşuyor.`,
        },
        {
          en: `Galata's gates are locked, and starvation and malnutrition (a crisis of food, water, and hygiene rather than plague) have reached their peak!`,
          tr: `Galata kapıları kilitlendi, şehirde açlık ve yetersiz beslenme (veba değil, gıda ve hijyen krizi) zirvede!`,
        },
      ],
      // Materyal: 4. Periyot, Soru 11
      infoBox: {
        text: {
          en: `Unlike the plague epidemics of earlier eras such as the 1347 Black Death, the health crisis inside Constantinople in 1453 was caused not by plague but by severe wheat scarcity, starvation, malnutrition, contaminated water, poor hygiene, and extreme exhaustion that weakened and sickened the defenders (Source: M. Goodyear).`,
          tr: `1453'te Konstantinopolis'teki sağlık krizinin nedeni, 1347 Kara Ölümü gibi bir veba salgını değil; şiddetli buğday kıtlığı, açlık, yetersiz beslenme, kirli su, zayıf hijyen ve aşırı yorgunluğun savunmacıları zayıflatıp hasta etmesiydi (Kaynak: M. Goodyear).`,
        },
      },
      choices: [
        {
          // Yemin alıntısı ana materyalden (basit materyalde kısa hâli vardı)
          text: {
            en: `Reject the envoy ("To surrender the city to you is neither in my power nor in that of anyone else who dwells in it; for we have all reached the mutual resolution to die of our own free will!"); carry the icon to the walls; send Giustiniani to Galata for the final gunpowder and distribute the palace rations equally.`,
            tr: `Elçiyi reddet ("Şehri sana teslim etmek ne benim ne de başkasının elindedir; hepimiz kendi özgür irademizle ölmeye karar verdik!"); ikonayı sura taşı; Giustiniani'yi son barutu almak için Galata'ya gönder ve saray erzakını halka eşit dağıt.`,
          },
          historical: true,
          next: "period-5-intro",
        },
        {
          text: {
            en: `Stall the envoy and hoard the rations for the nobles.`,
            tr: `Elçiyi oyala, erzakı soylulara sakla.`,
          },
          historical: false,
          result: {
            en: `Army morale collapses and the populace breaks down.`,
            tr: `Ordu morali ve halk çöker.`,
          },
          next: "period-5-intro",
        },
      ],
    },

    // ───────────── 5. PERİYOT: 26 – 28 MAYIS 1453 ─────────────

    // Dönem açılışı
    {
      id: "period-5-intro",
      day: 27,
      dateText: { en: "26 – 28 MAY 1453", tr: "26 – 28 MAYIS 1453" },
      eyebrow: { en: "PERIOD 5", tr: "5. PERİYOT" },
      title: {
        en: "The Grand Divan Debate, Fleet of Lights, Starvation Mutiny, and the Last Joint Liturgy at Hagia Sophia",
        tr: "Büyük Divan Tartışması, Işık Donanması, Açlık İsyanı ve Ayasofya'da Son Ortak Ayin",
      },
      reports: [
        {
          who: { en: "Tursun Bey", tr: "Tursun Bey" },
          text: {
            en: `"On May 26, the Imperial Divan convened. While Çandarlı Halil Pasha feared a Christian fleet arriving from the West, Zağanos Pasha invoked Alexander the Great and proclaimed that the hour of assault had struck. At nightfall, thousands of lamps were lit across the tents and the Golden Horn; the next day, the camp fell into deep silence and fasting."`,
            tr: `"26 Mayıs günü Divan-ı Hümayun toplandı. Çandarlı Halil Paşa garptan küffar donanması gelir diye vehmederken, Zağanos Paşa İskender-i Zülkarneyn misali taarruz vakti geldiğini haykırdı. Gece olunca çadırlarda ve Haliç'te binlerce kandil yakıldı; ertesi gün ise ordugâh derin bir sükûta ve oruca büründü."`,
          },
        },
        {
          who: { en: "Nicolò Barbaro", tr: "Nicolò Barbaro" },
          text: {
            en: `"On the night of May 26, so many fires were lit in the Turkish camp and along the Golden Horn that we thought the entire encampment was ablaze; a strange light even appeared atop the dome of Hagia Sophia. On the evening of May 28, a deathly silence fell over the Turkish side. Tonight is our final night; Greeks and Latins are marching in tears toward Hagia Sophia."`,
            tr: `"26 Mayıs gecesi Türk kampında ve Haliç'te öyle çok ateş yakıldı ki tüm ordugah yanıyor sandık; Ayasofya kubbesinde bile tuhaf bir ışık belirdi. 28 Mayıs akşamı ise Türk tarafında ölüm sessizliği çöktü. Bu gece son gecemiz; Rumlar ve Latinler gözyaşlarıyla Ayasofya'ya yürüyor."`,
          },
        },
      ],
      choices: [
        { text: { en: "Continue", tr: "Devam Et" }, next: "p5-ottoman" },
      ],
    },

    // 5. Periyot — Osmanlı: Büyük Divan, Işık Donanması
    {
      id: "p5-ottoman",
      day: 27,
      side: "ottoman",
      dateText: { en: "26 – 28 MAY 1453", tr: "26 – 28 MAYIS 1453" },
      eyebrow: { en: "PERIOD 5", tr: "5. PERİYOT" },
      title: { en: "What Will You Do?", tr: "Ne Yapacaksın?" },
      paragraphs: [
        {
          en: `The siege has exceeded 50 days. Çandarlı Halil Pasha cites the threat of Hungarian and Venetian intervention, urging that heavy tribute be taken and the siege lifted. Zağanos Pasha insists no Western aid will come and calls for an immediate general assault.`,
          tr: `Kuşatma 50 günü geçti. Çandarlı Halil Paşa, Macar ve Venedik tehdidini öne sürerek ağır vergi alınıp kuşatmanın kaldırılmasını istiyor. Zağanos Paşa ise Batı'dan yardım gelemeyeceğini belirterek derhal genel taarruz öneriyor.`,
        },
      ],
      choices: [
        {
          text: {
            en: `Support Zağanos Pasha and silence Çandarlı; light the Fleet of Lights (torches) on May 26–27 and proclaim silence and fasting on May 28.`,
            tr: `Zağanos Paşa'yı destekleyip Çandarlı'yı sustur; 26–27 Mayıs'ta Işık Donanması (meşaleler) yak, 28 Mayıs'ta tam sessizlik ve oruç ilan et.`,
          },
          historical: true,
          next: "p5-byzantine",
        },
        {
          text: {
            en: `Listen to Çandarlı and lift the siege.`,
            tr: `Çandarlı'yı dinleyip kuşatmayı kaldır.`,
          },
          historical: false,
          next: "ending-siege-lifted",
        },
      ],
    },

    // TASLAK: 5. Periyot Osmanlı, tarihsel olmayan seçenek (kuşatma kaldırılır).
    // Paragraf ana materyaldeki B sonucudur; "Tarihte ne oldu" notu yalnızca
    // A'nın ana materyaldeki sonuç cümlelerinden türetildi. Yazım ekibi gözden geçirmeli.
    {
      id: "ending-siege-lifted",
      day: 27,
      side: "ottoman",
      dateText: { en: "26 – 28 MAY 1453", tr: "26 – 28 MAYIS 1453" },
      ending: true,
      paragraphs: [
        {
          en: `The Janissaries mutiny and the conquest fails.`,
          tr: `Yeniçeriler ayaklanır, fetih gerçekleşmez.`,
        },
      ],
      note: {
        en: `The Divan united behind the Conquest faction, and the Ottoman army entered the final battle rested.`,
        tr: `Divan tamamen Fetih kanadına geçti; Osmanlı ordusu dinlenmiş olarak son savaşa girdi.`,
      },
    },

    // 5. Periyot — Bizans: son altınlar ve Ayasofya'da son ortak ayin
    {
      id: "p5-byzantine",
      day: 27,
      side: "byzantine",
      dateText: { en: "26 – 28 MAY 1453", tr: "26 – 28 MAYIS 1453" },
      eyebrow: { en: "PERIOD 5", tr: "5. PERİYOT" },
      title: { en: "What Will You Do?", tr: "Ne Yapacaksın?" },
      paragraphs: [
        {
          en: `Starving soldiers are raiding granaries, while the main wall breach requires one final repair.`,
          tr: `Aç kalan askerler ambarları basıyor, sur gediği ise son kez onarılmalı.`,
        },
      ],
      // Materyal: 5. Periyot, Soru 7
      infoBox: {
        text: {
          en: `The sudden illumination in the Ottoman camp between May 26 and 28, followed by complete silence, was recognized on the Byzantine side as the harbinger of the imminent final general assault, so church bells were rung and all units withdrew to their final defensive positions.`,
          tr: `Osmanlı ordugâhında 26–28 Mayıs'ta görülen ani ışıklandırma ve ardından gelen tam sessizlik, Bizans tarafında yaklaşan son genel taarruzun habercisi sayılmış; bu yüzden çanlar çalınmış ve tüm birlikler son savunma hatlarına çekilmiştir.`,
        },
      },
      choices: [
        {
          text: {
            en: `Quell the May 27 mutiny with the Emperor's last personal gold and call on the people to volunteer; distribute the final bread and olives on May 28 and hold the final joint Catholic-Orthodox liturgy in Hagia Sophia.`,
            tr: `27 Mayıs'ta İmparatorun son altınlarını dağıtarak isyanı bastır ve halka gönüllü seferberlik çağrısı yap; 28 Mayıs'ta son ekmek ve zeytini dağıt, Ayasofya'da Katolik ve Ortodoksların birlikte katıldığı son ortak ayini düzenle.`,
          },
          historical: true,
          next: "period-6-intro",
        },
        {
          text: {
            en: `Execute the mutineers and skip the liturgy.`,
            tr: `İsyancıları as, ayin yapma.`,
          },
          historical: false,
          result: {
            en: `On the morning of May 29, 30% of the native militias desert.`,
            tr: `29 Mayıs sabahı yerli milislerin %30'u firar eder.`,
          },
          next: "period-6-intro",
        },
      ],
    },

    // ───────────── 6. PERİYOT: 29 MAYIS 1453 ŞAFAĞI ─────────────

    // Dönem açılışı
    {
      id: "period-6-intro",
      day: 30,
      dateText: { en: "29 MAY 1453", tr: "29 MAYIS 1453" },
      eyebrow: { en: "PERIOD 6", tr: "6. PERİYOT" },
      title: {
        en: "The Three-Wave Final Assault, Kerkoporta, Giustiniani's Wounding, and the Fall of the City",
        tr: "Üç Dalgalı Nihai Taarruz, Kerkoporta, Giustiniani'nin Yaralanması ve Şehrin Düşüşü",
      },
      reports: [
        {
          who: { en: "Tursun Bey", tr: "Tursun Bey" },
          text: {
            en: `"On the night of Tuesday, May 29, before the break of dawn, the great war drums and kettledrums were struck! Sultan Mehmed Khan personally donned his armor and took his position opposite the Mesoteichion. Marching wave upon wave, the army of Islam rained arrows and cannonballs upon the walls!"`,
            tr: `"29 Mayıs Salı gecesi, seher vakti henüz sökmeden kösler ve nakkareler vuruldu! Sultan Mehmed Han bizzat pusatını kuşanıp Mesoteichion karşısına geçti. Dalga dalga yürüyen İslam askeri, surları ok ve gülle yağmuruna tuttu!"`,
          },
        },
        {
          who: { en: "Nicolò Barbaro", tr: "Nicolò Barbaro" },
          text: {
            en: `"Tuesday, May 29, three hours before dawn... The Turkish Sultan launched the general assault. With superhuman effort we repelled the first two waves; yet as day broke, the Janissaries charged in and our commander-in-chief Giustiniani was struck! O God, they are entering the city!"`,
            tr: `"29 Mayıs Salı, şafak öncesi saat üç... Türk padişahı genel saldırıyı başlattı. İlk iki dalgayı insanüstü bir gayretle püskürttük; ancak gün ağarırken Yeniçeriler girdi ve başkomutanımız Giustiniani vuruldu! Tanrım, şehre giriyorlar!"`,
          },
        },
      ],
      choices: [
        { text: { en: "Continue", tr: "Devam Et" }, next: "wave-1" },
      ],
    },

    // 1. Dalga (dalga sahnesi: taraf yok, tek düğme)
    {
      id: "wave-1",
      day: 30,
      dateText: { en: "29 MAY 1453", tr: "29 MAYIS 1453" },
      eyebrow: { en: "WAVE 1 · 01:30 – 03:30", tr: "1. DALGA · 01:30 – 03:30" },
      title: {
        en: "Assault of the Azaps and Irregulars",
        tr: "Azaplar ve Başıbozukların Hücumu",
      },
      paragraphs: [
        {
          en: `Ottoman Move: 20,000 lightly armored Azaps and irregulars are sent against the St. Romanos breach to exhaust Giustiniani's armored soldiers and deplete their ammunition, while the çavuş military police wait in the rear to prevent unauthorized retreats.`,
          tr: `Osmanlı Hamlesi: 20.000 hafif zırhlı Azap ve başıbozuk, St. Romanos gediğine sürülür; amaç Giustiniani'nin zırhlı askerlerini yıpratmak ve cephanelerini tüketmektir. Kaçmaya çalışanların arkasında çavuşlar bekler.`,
        },
        {
          en: `Byzantine Move: Giustiniani's 700 armored Genoese soldiers and the Cretan archers hold the outer rampart (palisade) line, while Emperor Constantine personally commands the defense in the Lykos Valley breach.`,
          tr: `Bizans Hamlesi: Giustiniani'nin 700 zırhlı Cenevizlisi ve Giritli okçular dış tabya (palisade) hattını tutar; İmparator Konstantinos bizzat Lykos vadisi gediğinde komuta eder.`,
        },
        {
          en: `03:30 AM Status: The Azaps withdraw with heavy casualties; however, the Byzantine defenders' arrow and gunpowder stocks are nearly depleted.`,
          tr: `Saat 03:30 Durumu: Azaplar ağır kayıpla geri çekilir; ancak Bizans savunmacılarının ok ve barut stokları tükenmeye yüz tutar.`,
        },
      ],
      choices: [
        { text: { en: "Continue", tr: "Devam Et" }, next: "wave-2" },
      ],
    },

    // 2. Dalga
    {
      id: "wave-2",
      day: 30,
      dateText: { en: "29 MAY 1453", tr: "29 MAYIS 1453" },
      eyebrow: { en: "WAVE 2 · 03:30 – 05:00", tr: "2. DALGA · 03:30 – 05:00" },
      title: {
        en: "Armored Anatolian Troops and Şahi Cannonballs",
        tr: "Zırhlı Anadolu Birlikleri ve Şahi Gülleleri",
      },
      paragraphs: [
        {
          en: `Ottoman Move: The armored Anatolian troops under İshak Pasha and Mahmud Pasha advance to the sound of war horns. In the darkness, the giant Şahi cannon is fired directly at the St. Romanos earthen rampart.`,
          tr: `Osmanlı Hamlesi: İshak Paşa ve Mahmud Paşa komutasındaki zırhlı Anadolu askerleri borular eşliğinde ileri sürülür. Karanlıkta dev Şahi topu doğrudan St. Romanos toprak tabyasına ateşlenir.`,
        },
        {
          en: `Byzantine Move: A massive Şahi cannonball demolishes a section of the earthen rampart, and 300 Anatolian soldiers pour into the breach. Emperor Constantine and Don Francisco de Toledo's Catalans fight hand to hand and drive the Anatolian troops back into the ditch.`,
          tr: `Bizans Hamlesi: Dev bir Şahi güllesi toprak tabyanın bir kısmını yıkar ve 300 Anadolu askeri gediğe girer. İmparator Konstantinos ve Don Francisco de Toledo'nun Katalanları göğüs göğüse çarpışarak Anadolu birliklerini hendeğe geri püskürtür.`,
        },
        {
          en: `05:00 AM Status: The Anatolian troops fall back; however, the Byzantine soldiers are left barely able to lift their swords.`,
          tr: `Saat 05:00 Durumu: Anadolu birlikleri geri çekilir; ancak Bizans askerlerinin kolları kılıç tutamaz hâle gelir.`,
        },
      ],
      choices: [
        { text: { en: "Continue", tr: "Devam Et" }, next: "p6-ottoman" },
      ],
    },

    // 6. Periyot — Osmanlı: üçüncü dalga, Kerkoporta
    {
      id: "p6-ottoman",
      day: 30,
      side: "ottoman",
      dateText: { en: "29 MAY 1453", tr: "29 MAYIS 1453" },
      eyebrow: { en: "PERIOD 6", tr: "6. PERİYOT" },
      title: { en: "What Will You Do?", tr: "Ne Yapacaksın?" },
      paragraphs: [
        {
          en: `The Anatolian troops are exhausted, and the defenders are on the verge of collapse.`,
          tr: `Anadolu birlikleri yoruldu; savunmacılar da çöküşün eşiğinde.`,
        },
      ],
      choices: [
        {
          text: {
            en: `Let Sultan Mehmed personally lead the 12,000 fresh Janissaries into the breach while a detachment slips through Kerkoporta to raise the banner.`,
            tr: `Fatih bizzat 12.000 taze Yeniçeri ile yüklensin; bir kol da Kerkoporta kapısından sızıp burçlara sancağı diksin.`,
          },
          historical: true,
          next: "p6-byzantine",
        },
        {
          text: {
            en: `Let the Sultan stay in the rear.`,
            tr: `Padişah geride kalsın.`,
          },
          historical: false,
          next: "ending-assault-stalls",
        },
      ],
    },

    // TASLAK: 6. Periyot Osmanlı, tarihsel olmayan seçenek (hücum durur).
    // Paragraf basit materyaldeki B sonucudur; "Tarihte ne oldu" notu yalnızca
    // A seçeneğinin ana materyaldeki metninden türetildi. Yazım ekibi gözden geçirmeli.
    {
      id: "ending-assault-stalls",
      day: 30,
      side: "ottoman",
      dateText: { en: "29 MAY 1453", tr: "29 MAYIS 1453" },
      ending: true,
      paragraphs: [
        {
          en: `The assault loses its momentum.`,
          tr: `Hücum ivmesini kaybeder.`,
        },
      ],
      note: {
        en: `Sultan Mehmed II rode his horse right up to the edge of the ditch; the Janissaries were sent in strict formation and discipline against the St. Romanos breach while a detachment infiltrated through the small side postern gate left unlocked near Blachernae (Kerkoporta). Ottoman banners waved atop the towers above Kerkoporta, and the Janissaries shattered the main breach.`,
        tr: `Sultan II. Mehmed bizzat atıyla hendeğin kenarına kadar ilerledi; Yeniçeriler tam nizam ve disiplinle St. Romanos gediğine sürülürken bir kol da Blachernae yakınındaki açık unutulan küçük yan kapıdan (Kerkoporta) sızdı. Kerkoporta burçlarında Osmanlı sancağı dalgalandı, Yeniçeriler gediği yardı.`,
      },
    },

    // 6. Periyot — Bizans: Giustiniani'nin yaralanması, İmparatorun sonu
    {
      id: "p6-byzantine",
      day: 30,
      side: "byzantine",
      dateText: { en: "29 MAY 1453", tr: "29 MAYIS 1453" },
      eyebrow: { en: "PERIOD 6", tr: "6. PERİYOT" },
      title: { en: "What Will You Do?", tr: "Ne Yapacaksın?" },
      paragraphs: [
        {
          en: `At sunrise, Commander-in-Chief Giovanni Giustiniani Longo is severely wounded in the chest or armpit by a bullet or crossbow bolt; writhing in agony from blood loss, he demands the Inner Wall gate be unlocked so he can be carried to his ship! Emperor Constantine begs him to remain at his post. Simultaneously, Turkish banners are spotted atop the walls above the Kerkoporta, and the cry "The city has fallen!" rings out!`,
          tr: `Gün doğarken Başkomutan Giovanni Giustiniani Longo göğsünden ya da koltuk altından bir kurşun veya okla ağır yaralanır; kan kaybından acı içinde kıvranarak İç Sur kapısının açılmasını ve gemisine götürülmeyi ister. İmparator Konstantinos ona surda kalması için yalvarır. Aynı anda Kerkoporta'nın üzerindeki sur tepesinde Türk sancakları görülür ve "Şehir düştü!" çığlığı kopar!`,
        },
      ],
      // Materyal: 6. Periyot, Soru 8
      infoBox: {
        text: {
          en: `According to the joint accounts of Nicolò Barbaro and Jacopo Tedaldi, the most critical turning point in the collapse of the defensive line on the morning of May 29 was the severe wounding and withdrawal of Giovanni Giustiniani, the land walls' commander-in-chief, which created a vacuum of command and triggered panic among the Genoese troops.`,
          tr: `Nicolò Barbaro ile Jacopo Tedaldi'nin ortak anlatımlarına göre 29 Mayıs sabahı savunma hattının çözülmesindeki en kritik dönüm noktası, kara surları başkomutanı Giovanni Giustiniani'nin ağır yaralanıp surları terk etmesiydi; bu, Ceneviz birliklerinde komuta boşluğu ve panik yarattı.`,
        },
      },
      choices: [
        {
          text: {
            en: `Let Emperor Constantine XI cast off his purple cloak and die fighting with his sword alongside Don Francisco de Toledo in the St. Romanos breach.`,
            tr: `İmparator XI. Konstantinos mor pelerinini çıkarıp atsın; Don Francisco de Toledo ile birlikte St. Romanos gediğinde kılıçla çarpışarak ölsün.`,
          },
          historical: true,
          next: "epilogue-orhan",
        },
        {
          text: {
            en: `Let the Emperor flee by ship.`,
            tr: `İmparator gemiyle kaçsın.`,
          },
          historical: false,
          next: "ending-emperor-flees",
        },
      ],
    },

    // TASLAK: 6. Periyot Bizans, tarihsel olmayan seçenek (İmparator kaçar).
    // Paragraf Görev 4'te verilen metindir (materyaldeki B sonucu yalnızca puan
    // ve etiketti). "Tarihte ne oldu" notu yalnızca A seçeneğinin ana
    // materyaldeki metninden türetildi.
    {
      id: "ending-emperor-flees",
      day: 30,
      side: "byzantine",
      dateText: { en: "29 MAY 1453", tr: "29 MAYIS 1453" },
      ending: true,
      paragraphs: [
        {
          en: `Emperor Constantine boards a ship with Giustiniani and tries to flee the city.`,
          tr: `İmparator Konstantinos, Giustiniani ile birlikte gemiye binip şehirden kaçmaya çalışır.`,
        },
      ],
      note: {
        en: `When Giustiniani had the gate unlocked and withdrew to his ship, his Genoese troops panicked and fled through the open gate. Refusing to be captured alive, Emperor Constantine XI cast off his purple imperial cloak and insignia, drew his sword alongside Don Francisco de Toledo and a few loyal companions, charged into the surging Janissaries at the St. Romanos breach, and died fighting as the last Roman Emperor.`,
        tr: `Giustiniani kapıyı açtırıp gemisine çekilince Cenevizliler paniğe kapılıp açılan kapıdan kaçmaya başladı. İmparator XI. Konstantinos, tanınmamak için imparatorluk mor pelerinini ve nişanlarını çıkarıp attı; yanında kalan Don Francisco de Toledo ve birkaç sadık dostuyla kılıcını çekip St. Romanos gediğinde Yeniçerilerin arasına dalarak son Roma İmparatoru olarak çarpışarak öldü.`,
      },
    },

    // ───────────── EPİLOG ─────────────

    // Sahne 7.1: Şehzade Orhan ve Giritli okçular (Osmanlı kararı)
    {
      id: "epilogue-orhan",
      day: 30,
      side: "ottoman",
      dateText: { en: "29 – 30 MAY 1453", tr: "29 – 30 MAYIS 1453" },
      eyebrow: { en: "EPILOGUE", tr: "EPİLOG" },
      title: { en: "What Will You Do?", tr: "Ne Yapacaksın?" },
      paragraphs: [
        {
          en: `Because the city was taken Cebren (by force), Islamic law of war granted the soldiers a 3-day right of plunder. Having defended the Marmara and Yedikule walls to the death with his 600 Turkish guards, Prince Orhan Çelebi disguised himself as a monk to escape, but threw himself from the walls (or was captured and executed) upon realizing he would be recognized. Meanwhile, the Cretan sailors and archers in the towers of Basileios, Leon, and Alexios along the Golden Horn refuse to surrender and continue fighting until midday.`,
          tr: `Şehir Cebren (savaşla) alındığı için İslam savaş hukukuna göre askerlere 3 günlük ganimet hakkı tanındı. Marmara ve Yedikule surlarını 600 Türk muhafızıyla ölümüne savunan Şehzade Orhan Çelebi, keşiş kılığına girerek kaçmaya çalışırken yakalandı (veya surlardan atlayarak öldü). Öte yandan Haliç'teki Basileios, Leon ve Alexios kulelerindeki Giritli denizciler ve okçular, öğle saatlerine kadar teslim olmadan direnmeye devam ediyor.`,
        },
      ],
      choices: [
        {
          text: {
            en: `Grant them Aman (clemency) and let them sail freely home with their weapons and ships.`,
            tr: `Giritlilere Aman ver; gemileri ve silahlarıyla serbestçe gitmelerine izin ver.`,
          },
          historical: true,
          next: "epilogue-final",
        },
        {
          // Materyaldeki sonuç yalnızca puan ve etiketti; sonuç ekranı
          // "Tarihte yaşanan:" ile tarihsel seçeneği gösterir.
          text: {
            en: `Demolish the towers and execute them.`,
            tr: `Kuleleri yıkıp kılıçtan geçir.`,
          },
          historical: false,
          next: "epilogue-final",
        },
      ],
    },

    // Sahne 7.2 (final): Ayasofya'da İlk Cuma Namazı
    {
      id: "epilogue-final",
      day: 30,
      dateText: { en: "1 JUNE 1453", tr: "1 HAZİRAN 1453" },
      ending: true,
      eyebrow: { en: "EPILOGUE", tr: "EPİLOG" },
      title: {
        en: "The First Friday Prayer at Hagia Sophia",
        tr: "Ayasofya'da İlk Cuma Namazı",
      },
      paragraphs: [
        {
          en: `On the afternoon of May 29, 21-year-old Sultan Mehmed II the Conqueror, accompanied by his spiritual mentor Molla Akşemseddin, Vizier Zağanos Pasha, and chronicler Tursun Bey, rides into the city through the Topkapı (St. Romanos) gate astride his white horse. He proceeds directly toward the thousand-year-old heart of Eastern Rome: Hagia Sophia (Megale Ekklesia).`,
          tr: `29 Mayıs ikindi vakti, 21 yaşındaki Fatih Sultan Mehmed Han, yanında hocası Molla Akşemseddin, veziri Zağanos Paşa ve vakanüvis Tursun Bey ile birlikte beyaz atının üzerinde Topkapı'dan (St. Romanos) şehre girer. Doğruca Doğu Roma'nın bin yıllık kalbi olan Ayasofya'ya (Megale Ekklesia) ilerler.`,
        },
        {
          en: `Dismounting from his horse, the young Sultan bows in prostration upon the ground, takes a handful of earth, and sprinkles it over his turban in humility and gratitude to God. Entering the sanctuary, he orders that the terrified Greek citizens and priests huddled inside be left unharmed, proclaiming that all may return safely to their homes and livelihoods (the policy of Istimalet and Aman). At that moment, he spots a soldier attempting to pry up the marble floor slabs of Hagia Sophia with an axe; striking the soldier back with the flat of his sword, he utters his historic decree: "I have granted you the treasures and spoils of the city; but the buildings of this city and this sacred sanctuary belong to me!"`,
          tr: `Atından inip secdeye kapanan genç Sultan, yerden bir avuç toprak alıp kavuğunun üzerine serper; Allah'a şükreder. İçeri girdiğinde, korkuyla birbirine sokulmuş Rum halkına ve rahiplere dokunulmamasını, herkesin evine ve işine güvenle dönmesini emreder (İstîmâlet ve Aman). O sırada Ayasofya'nın mermer döşemelerini balta ile sökmeye çalışan bir askeri görür; kılıcının tersiyle askeri durdurarak tarihe geçen şu sözü söyler: "Size şehrin hazinelerini ve ganimetini bağışladım; lakin bu şehrin binaları ve bu ulu mabet benimdir!"`,
        },
        {
          en: `When the calendar marks Friday, June 1, 1453, the first Muhammadan call to prayer (Adhan) rises inside Hagia Sophia, now converted into a mosque as the symbol of sovereign conquest and placed under imperial protection as Sultan Mehmed's royal endowment (Waqf). Molla Akşemseddin ascends the pulpit (Minbar) to deliver the first Friday sermon (Khutbah), and Sultan Mehmed the Conqueror leads the congregation in the First Friday Prayer. As chants of tekbir echo beneath the great dome, the Middle Ages come to a close, and Constantinople becomes Istanbul, the new imperial capital of Islamic Civilization.`,
          tr: `Takvimler 1 Haziran 1453 Cuma gününü gösterdiğinde, fethin sembolü olarak camiye dönüştürülen ve Sultan Mehmed'in imparatorluk vakfı olarak koruma altına alınan Ayasofya'da ilk ezan-ı Muhammedî yükselir. Molla Akşemseddin minbere çıkarak ilk Cuma hutbesini okur ve Fatih Sultan Mehmed cemaatin önünde İlk Cuma Namazı'nı kıldırır. Kubbe altında yankılanan tekbirlerle Orta Çağ kapanır; Konstantiniyye, İslam Medeniyeti'nin yeni payitahtı İstanbul olur.`,
        },
      ],
      // Materyal: Epilog, Soru 12 (seçim olmadığı için sahnede görünür)
      infoBox: {
        text: {
          en: `In Ottoman historiography, the eyewitness Tursun Bey (Târîh-i Ebü'l-Feth) writes in an ornate, court-centered literary style that exalts Mehmed II's political vision and leadership, whereas his contemporary Âşıkpaşazâde (Tevârîh-i Âl-i Osmân) uses a plain, vivid popular style centered on the spirit of Gaza, religious motifs, and folk narratives (Fahameddin Başar analysis).`,
          tr: `Osmanlı tarihyazımında görgü tanığı Tursun Bey (Târîh-i Ebü'l-Feth) saray merkezli, edebî ve süslü bir üslupla Fatih'in siyasi vizyonunu över; çağdaşı Âşıkpaşazâde'nin (Tevârîh-i Âl-i Osmân) anlatımı ise gaza ruhuna, dinî motiflere ve halk anlatısına dayalı sade ve canlı bir üsluptadır (Fahameddin Başar analizi).`,
        },
      },
    },

    // Kaynaklar (son ekranlarındaki "Kaynaklar" düğmesinden gelinir)
    {
      id: "sources",
      day: 30,
      hideDate: true,
      plainBackground: true,
      title: { en: "Sources", tr: "Kaynaklar" },
      showSources: true,
      choices: [SHARED.restartChoice],
    },
  ],
};
