# Yeni Sahne Ekleme Kılavuzu

Hikâyenin tamamı `story.js` dosyasında. Yeni bir sahne eklemek için başka bir dosyaya dokunman gerekmez.

## Sahne nedir?

Oyundaki her ekran bir sahnedir. Her sahnede bir başlık, birkaç paragraf ve altta düğmeler bulunur. Oyuncu bir düğmeye bastığında başka bir sahneye geçer.

Sahneler `story.js` içindeki `scenes: [ ... ]` listesinde sırayla durur.

## Bir sahnenin parçaları

| Alan | Ne işe yarar | Zorunlu mu? |
|---|---|---|
| `id` | Sahnenin kısa adı. Boşluksuz yaz: `fb4-ottoman` gibi. Aynı ad iki sahnede olamaz. | Evet |
| `day` | Oyunun kaçıncı günü: 1 = 30 Nisan 1453, 30 = 29 Mayıs 1453. `dateText` yoksa sağ üstteki tarih buna göre hesaplanır. | Evet |
| `dateText` | Sağ üstte aynen gösterilecek tarih: `{ en: "2 APRIL 1453", tr: "2 NİSAN 1453" }`. Prolog gibi 29 günün dışındaki sahneler için. | Hayır |
| `hideDate` | `true` ise sağ üstteki tarih gizlenir; yeri korunur, üst çubuk kaymaz. Kaynaklar ekranında kullanılır: `hideDate: true,` | Hayır |
| `plainBackground` | `true` ise kutucukta görsel yerine düz koyu zemin olur; uzun metinler daha kolay okunur. Çerçeve ve iç çizgi aynı kalır. Kaynaklar ekranında kullanılır: `plainBackground: true,` | Hayır |
| `side` | Sahnenin tarafı: `"ottoman"` (Osmanlı) ya da `"byzantine"` (Bizans). Başlığın üstünde taraf etiketi, panelin sol kenarında renkli şerit çıkar. | Hayır |
| `eyebrow` | Başlığın üstündeki küçük, büyük harfli yazı (`GERİYE DÖNÜŞ 1` gibi; İngilizcesi `FLASHBACK 1`). | Hayır |
| `title` | Sahnenin başlığı. | Evet (son sahnelerinde hayır) |
| `paragraphs` | Hikâye paragrafları. İstediğin kadar ekleyebilirsin. | Evet |
| `reports` | Sabah raporları: alıntı olarak görünür, altında kaynağın adı yazar. | Hayır |
| `choices` | Alttaki düğmeler. Her düğmenin bir yazısı (`text`) ve gideceği sahnenin `id`'si (`next`) vardır. | Evet (son sahnelerinde hayır) |
| `note` | Paragrafların altında görünen küçük not. Son sahnelerinde "Tarihte ne oldu" notu olur. | Hayır |
| `infoBox` | Oyuncunun isterse açıp okuyabileceği "Daha fazla bilgi" kutusu: tek cümlelik `text` (başlık `title` isteğe bağlı). | Hayır |
| `ending` | `true` ise sahne son ekranı olur (bkz. "Son sahnesi"). | Hayır |
| `image` | Metin kutucuğunun arkasındaki resim. Boş bırakırsan varsayılan resim kullanılır. | Hayır |

Her yazı iki dilde, şu şekilde yazılır:

```js
{ en: "English text", tr: "Türkçe metin" }
```

İki dilden biri eksik olursa oyunda o yazının yerinde "undefined" görünür. Her metni mutlaka iki dilde de yaz.

## Düğmeler nasıl görünür?

- **Tek düğme** ("Devam Et" gibi): altın renkli büyük düğme olarak görünür.
- **İki veya daha fazla düğme** (karar sahnesi): alt alta seçenek listesi olarak görünür. Seçeneklerin sırası her oyunda rastgele belirlenir, A/B harfi görünmez. Oyuncu dili değiştirince sıra değişmez; "Başa Dön"e basınca yeniden karılır. Bu yüzden `story.js`'te seçenekleri hangi sırayla yazdığın önemli değildir.
- **Her birinde `style: "secondary"` olan düğmeler**: seçenek listesi yerine yan yana, çerçeveli düğmeler olarak görünür ("Başa Dön" gibi).

## Karar sahnesi: tarihsel ve tarihsel olmayan seçenekler

Karar sahnesindeki her seçenekte `historical` alanı olmalı:

- `historical: true` — tarihte yaşanan karar. Oyuncu doğrudan `next` sahnesine geçer.
- `historical: false` — tarihte yaşanmayan karar. Oyun kendiliğinden bir sonuç ekranı gösterir: üstte "TARİHTE BÖYLE OLMADI", altında oyuncunun seçtiği seçeneğin metni (alıntı olarak), sonra seçeneğin `result` metni ve bir "Devam Et" düğmesi. "Devam Et" oyuncuyu seçeneğin `next` sahnesine götürür. Bu ekran için ayrı bir sahne yazman gerekmez; yalnızca `result` metnini yaz.

`historical: false` bir seçenek **kendine ait** bir son sahnesine (`ending: true`) gidiyorsa sonuç ekranı çıkmaz, oyuncu doğrudan son ekranına geçer; sonucu son ekranının paragrafı anlatır. Bu durumda `result` yazmana gerek yoktur. "Kendine ait" şu demek: aynı sahnedeki başka hiçbir seçenek o son sahnesine gitmiyor. İki seçenek de aynı son sahnesine gidiyorsa (ör. `epilogue-orhan` → `epilogue-final`) o son seçimin sonucu sayılmaz; ara ekran normal şekilde gösterilir.

### Boş sonuç: "Tarihte yaşanan"

Materyaldeki sonuç yalnızca puan ya da gösterge değişiminden ibaretse (ör. "(-35 Puan)") temizlenince geriye metin kalmaz. Böyle bir seçenekte `result` alanını hiç yazma. Sonuç ekranı, sonuç metni yerine "Tarihte yaşanan:" / "What actually happened:" etiketini ve aynı sahnedeki tarihsel seçeneğin (`historical: true`) kendi metnini gösterir. Bunun için yeni bir cümle yazman gerekmez.

```js
        {
          text: { en: `Diğer seçenek.`, tr: `Diğer seçenek.` },
          historical: false,
          // result yok: sonuç ekranı tarihsel seçeneği gösterir
          next: "sonraki-sahne",
        },
```

## Onay ekranı ("Tarihte de böyle oldu")

Karar sahnesinde bir bilgi kutusu (`infoBox`) varsa ve oyuncu tarihsel seçeneği (`historical: true`) seçerse oyun kısa bir onay ekranı gösterir: üstte "TARİHTE DE BÖYLE OLDU", altında seçilen seçeneğin metni (alıntı olarak), sonra kapalı "Daha fazla bilgi" kutusu ve "Devam Et" düğmesi. "Devam Et" seçeneğin `next` sahnesine götürür.

Hem sonuç hem onay ekranında, seçilen seçeneğin alıntısının hemen üstünde küçük ve soluk bir **"Seçimin"** / **"Your choice"** etiketi görünür. Bu etiket oyunun kendisinden gelir (`translations` içinde `yourChoice`); sahnede bir şey yazman gerekmez.

Sahnede bilgi kutusu yoksa tarihsel seçim onay ekranı göstermez, oyuncu doğrudan `next` sahnesine geçer. Onay ekranı için ayrı bir sahne ya da metin yazman gerekmez.

## Bilgi kutusu seçimden sonra görünür

Karar sahnesindeki bilgi kutusu karar ekranında **görünmez**; oyuncu seçim yaptıktan sonra çıkar. Böylece kutudaki bilgi tarihsel cevabı önceden ele vermez:

| Oyuncunun seçimi | Kutunun göründüğü yer |
|---|---|
| Tarihsel olmayan (`historical: false`) | Sonuç ekranında, sonuç metninin altında, kapalı |
| Tarihsel (`historical: true`) | Onay ekranında, seçilen seçeneğin altında, kapalı |
| Kendine ait bir son sahnesine giden seçenek | Hiç görünmez (ara ekran çıkmaz) |

Karar sahnesi olmayan sahnelerde (tek düğmeli sahneler) bilgi kutusu eskisi gibi sahnenin kendisinde görünür.

Bir karar sahnesinin bütün seçenekleri son sahnelerine gidiyorsa kutu hiç görünmez; konsolda bunun için de uyarı çıkar.

## Dönem açılış ekranı (period intro)

Her periyot, kararlardan önce bir açılış ekranıyla başlar. Bu ekran ayrı bir türde değildir; şu alanlarla yazılmış sıradan bir sahnedir:

- `side` **yok** (taraf etiketi ve renkli şerit görünmez).
- `eyebrow`: `{ en: "PERIOD 1", tr: "1. PERİYOT" }`
- `title`: materyaldeki "Bölüm Başlığı".
- `dateText`: periyodun tarih aralığı, büyük harfle: `{ en: "30 APRIL – 5 MAY 1453", tr: "30 NİSAN – 5 MAYIS 1453" }`
- `reports`: o periyodun Sabah Raporu (bkz. "Sabah raporu eklemek").
- Tek düğme: "Devam Et", periyodun ilk karar sahnesine.

```js
    {
      id: "period-4-intro",
      day: 20,
      dateText: { en: "...", tr: "..." },
      eyebrow: { en: "PERIOD 4", tr: "4. PERİYOT" },
      title: { en: "...", tr: "..." },
      reports: [
        { who: { en: "Tursun Bey", tr: "Tursun Bey" }, text: { en: `...`, tr: `...` } },
        { who: { en: "Nicolò Barbaro", tr: "Nicolò Barbaro" }, text: { en: `...`, tr: `...` } },
      ],
      choices: [
        { text: { en: "Continue", tr: "Devam Et" }, next: "p4-ottoman" },
      ],
    },
```

`day` alanı burada yalnızca yedektir; `dateText` varken üstteki tarih `dateText`'ten gelir.

## Örnek: karar sahnesi eklemek

Aşağıdaki örnekte `...` yerine materyaldeki metni koy.

```js
    // Flashback 4 — Osmanlı
    {
      id: "fb4-ottoman",
      day: 1,
      side: "ottoman",
      dateText: { en: "...", tr: "..." },
      eyebrow: { en: "FLASHBACK 4", tr: "GERİYE DÖNÜŞ 4" },
      title: { en: "What Will You Do?", tr: "Ne Yapacaksın?" },
      paragraphs: [
        { en: `Durum anlatımı (İngilizce).`, tr: `Durum anlatımı (Türkçe).` },
      ],
      choices: [
        {
          text: { en: `Tarihsel seçenek.`, tr: `Tarihsel seçenek.` },
          historical: true,
          next: "fb4-byzantine",
        },
        {
          text: { en: `Diğer seçenek.`, tr: `Diğer seçenek.` },
          historical: false,
          result: { en: `Bu seçimin sonucu.`, tr: `Bu seçimin sonucu.` },
          next: "fb4-byzantine",
        },
      ],
    },
```

Sonra bir önceki sahnenin düğmesinin `next` değerini yeni sahnenin `id`'si yap (`next: "fb4-ottoman"`). Böylece oyun yeni sahneden geçer.

## Son sahnesi ("Farklı bir son")

Tarihsel olmayan bir seçim oyunu erken bitiriyorsa bir son sahnesi yaz ve seçeneğin `next` değerini ona ver:

```js
    {
      id: "ending-ornek",
      day: 1,
      side: "byzantine",
      dateText: { en: "...", tr: "..." },
      ending: true,
      paragraphs: [
        { en: `Ne oldu (İngilizce).`, tr: `Ne oldu (Türkçe).` },
      ],
      note: {
        en: `Tarihte gerçekte ne olduğu (İngilizce).`,
        tr: `Tarihte gerçekte ne olduğu (Türkçe).`,
      },
    },
```

- Alttaki iki düğme, **"Kaynaklar"** (Kaynaklar ekranına) ve **"Başa Dön"**, kendiliğinden gelir; `choices` yazma.
- Üstte "FARKLI BİR SON" yazar. Başka bir yazı istiyorsan `eyebrow` ver; örneğin final sahnesinde `eyebrow: { en: "EPILOGUE", tr: "EPİLOG" }`.
- `title` isteğe bağlıdır. Yazmazsan üstteki yazı ("FARKLI BİR SON" ya da kendi `eyebrow`'un) başlık olarak kullanılır.
- `note` isteğe bağlıdır; yazarsan ekranda "Tarihte ne oldu" başlığıyla görünür. Buraya yalnızca materyalde yazan, doğrulanmış bilgiyi koy.
- `paragraphs` de isteğe bağlıdır; materyalde sonuç anlatısı yoksa boş bırakılabilir.
- Son sahnesine bir bilgi kutusu (`infoBox`) da ekleyebilirsin; seçim olmadığı için kutu sahnenin kendisinde görünür.

Oyundaki son sahneleri: `ending-golden-horn`, `ending-siege-lifted`, `ending-assault-stalls`, `ending-emperor-flees` (farklı sonlar, kodda `// TASLAK` işaretli) ve `epilogue-final` (tarihsel final).

## Dalga sahnesi (wave)

29 Mayıs'taki ilk iki saldırı dalgası, seçim içermeyen anlatı sahneleridir. Dönem açılışı gibi ayrı bir türde değildir, şu alanlarla yazılır:

- `side` **yok** (taraf etiketi ve şerit görünmez).
- `dateText`: `{ en: "29 MAY 1453", tr: "29 MAYIS 1453" }`
- `eyebrow`: dalga ve saat aralığı: `{ en: "WAVE 1 · 01:30 – 03:30", tr: "1. DALGA · 01:30 – 03:30" }`
- `title`: materyaldeki dalga başlığı.
- `paragraphs`: materyaldeki "Osmanlı Hamlesi:", "Bizans Hamlesi:" ve "Saat … Durumu:" metinleri, etiketleriyle birlikte.
- Tek düğme: "Devam Et".

```js
    {
      id: "wave-1",
      day: 30,
      dateText: { en: "29 MAY 1453", tr: "29 MAYIS 1453" },
      eyebrow: { en: "WAVE 1 · 01:30 – 03:30", tr: "1. DALGA · 01:30 – 03:30" },
      title: { en: "...", tr: "..." },
      paragraphs: [
        { en: `Ottoman Move: ...`, tr: `Osmanlı Hamlesi: ...` },
        { en: `Byzantine Move: ...`, tr: `Bizans Hamlesi: ...` },
        { en: `03:30 AM Status: ...`, tr: `Saat 03:30 Durumu: ...` },
      ],
      choices: [
        { text: { en: "Continue", tr: "Devam Et" }, next: "wave-2" },
      ],
    },
```

## Sabah raporu eklemek

Bir sahnenin başına günlük ya da kronik alıntısı koymak için:

```js
      reports: [
        {
          who: { en: "Kaynağın adı (İngilizce)", tr: "Kaynağın adı (Türkçe)" },
          text: { en: `Alıntı (İngilizce).`, tr: `Alıntı (Türkçe).` },
        },
      ],
```

Her rapor paragrafların altında alıntı olarak görünür, altında küçük yazıyla kaynağın adı yazar. İstediğin kadar rapor ekleyebilirsin. Alıntıyı yalnızca materyalde ya da kaynakta gerçekten geçtiği gibi yaz; tarihî bir kişiye söylemediği bir söz yazma.

**Künye satırı (`cite`, isteğe bağlı).** Alıntının hangi eserden, hangi baskıdan ya da sayfadan geldiğini göstermek için rapora `cite` ekleyebilirsin. Doluysa kaynak adının altında küçük, soluk bir satır olarak görünür; yazmazsan ya da boş bırakırsan hiçbir şey çizilmez ve konsolda uyarı çıkmaz.

```js
        {
          who: { en: "Nicolò Barbaro", tr: "Nicolò Barbaro" },
          text: { en: `Alıntı (İngilizce).`, tr: `Alıntı (Türkçe).` },
          cite: { en: "Eser, baskı, sayfa", tr: "Eser, baskı, sayfa" },
        },
```

Şu an hiçbir raporda `cite` dolu değil.

## Oyunun akışı

```
title → prolog-intro → fb1-ottoman → fb1-byzantine → fb2-ottoman → fb2-byzantine
      → fb3-ottoman → fb3-byzantine ─┬─ tarihsel ─→ period-1-intro
                                     └─ diğer ────→ ending-golden-horn (son)

period-1-intro → p1-ottoman → p1-byzantine
period-2-intro → p2-ottoman → p2-byzantine
period-3-intro → p3-ottoman → p3-byzantine
period-4-intro → p4-ottoman → p4-byzantine
period-5-intro → p5-ottoman ─┬─ tarihsel ─→ p5-byzantine
                             └─ diğer ────→ ending-siege-lifted (son)
p5-byzantine → period-6-intro → wave-1 → wave-2
             → p6-ottoman ─┬─ tarihsel ─→ p6-byzantine
                           └─ diğer ────→ ending-assault-stalls (son)
p6-byzantine ─┬─ tarihsel ─→ epilogue-orhan → epilogue-final (final)
              └─ diğer ────→ ending-emperor-flees (son)
```

Karar sahnelerinde tarihsel olmayan seçenek önce sonuç ekranını, bilgi kutulu sahnelerde tarihsel seçenek önce onay ekranını gösterir; sonra bir sonraki sahneye geçilir. Kendine ait bir son sahnesine giden seçenekte ara ekran yoktur. `epilogue-orhan`'da iki seçenek de `epilogue-final`'e gider; bu yüzden orada ara ekran gösterilir.

Yeni bir sahneyi araya eklemek için önceki sahnenin düğmesinin `next` değerini yeni sahnenin `id`'si yap, yeni sahnenin düğmesini de bir sonrakine bağla.

## Panel yüksekliği

Metin kutucuğu (panel) içerik kadar uzar; içinde kaydırma çubuğu çıkmaz. Kısa sahnelerde en az ekran yüksekliğine yakın bir boyda durur, uzun sahnelerde sayfa aşağı kayar. Bu yüzden uzun paragraf ya da uzun seçenek yazmak düzeni bozmaz, yalnızca sayfayı uzatır. Oyuncu yeni bir sahneye geçtiğinde sayfa en üste döner; dili değiştirdiğinde bulunduğu yerde kalır.

## Sahne görseli eklemek

1. Resmi `assets` klasörüne koy (örneğin `assets/surlar.jpg`).
2. Sahneye bir satır ekle:

```js
      image: "assets/surlar.jpg",
```

Resim metin kutucuğunun arka planı olur. Yazılar okunabilsin diye üstünde yine koyu bir katman durur. Resim kutucuğu tamamen kaplar, kenarlarından biraz kırpılabilir.

- Satırı hiç yazmazsan kutucukta tarafın görseli (bkz. aşağıda), o da yoksa varsayılan resim (`assets/background.jpg`) kullanılır.
- Yol mutlaka `assets/` ile başlamalı. Dosya adında büyük-küçük harf de önemli: `Surlar.jpg` ile `surlar.jpg` farklı dosyalardır.
- Büyük resimler oyunun yavaş açılmasına yol açar; 500 KB'ın altında tutmaya çalış.

### Tarafa özel arka plan (`sideBackgrounds`)

Bir tarafın bütün sahnelerine aynı arka planı vermek için her sahneye `image` yazmak gerekmez. `story.js`'in başındaki `STORY` bölümünde `sideBackgrounds` alanı var:

```js
  sideBackgrounds: {
    byzantine: { image: "assets/backgraund6.jpg", position: "70% center" },
  },
```

- `byzantine` (Bizans) ya da `ottoman` (Osmanlı) yazılabilir. Şu an yalnızca Bizans için kayıt var; Osmanlı sahneleri varsayılan resmi kullanır.
- `image`: görselin yolu, `assets/` ile başlamalı.
- `position`: görselin kutucuk içindeki konumu (isteğe bağlı). İlk değer yatay, ikincisi dikey konumdur: `"70% center"` görseli biraz sağa kaydırır, `"center top"` üst kısmını gösterir. Yazmazsan görsel ortalanır.

**Hangi arka plan kullanılır? (öncelik sırası)**

0. Sahnede `plainBackground: true` varsa görsel yok, düz koyu zemin (ör. Kaynaklar).
1. Sahnede `image` varsa o.
2. Yoksa sahnenin `side` değeri `sideBackgrounds` içinde varsa tarafın görseli.
3. Hiçbiri yoksa varsayılan `assets/background.jpg`, ortalı.

"Tarihte böyle olmadı" ve "Tarihte de böyle oldu" ekranları, seçimin yapıldığı karar sahnesinin arka planını kullanır. Son sahneleri (`ending: true`) kendi `side` değerine göre arka plan alır. `side` alanı olmayan sahneler (açılış, prolog girişi, dönem açılışları, dalgalar, final, Kaynaklar) her zaman varsayılan resmi kullanır.

Arka plan görselleri oyun açılırken baştan yüklenir, böylece ekran geçişlerinde boş zemin görünmez. Bir görsel yüklenemezse konsolda bir kez uyarı çıkar ve o görselin yerine varsayılan resim kullanılır.

## Bilgi kutusu eklemek

Bir sahnede tarihî bir ayrıntıyı anlatmak ama hikâyeyi bölmemek istiyorsan bilgi kutusu kullan. Kutu sahnede kapalı durur, üstünde "Daha fazla bilgi" yazar; oyuncu tıklayınca (ya da klavyeyle Tab'la gelip Enter'a basınca) açılır.

Kutu yalnızca **tek cümlelik bir metin** (`text`) taşır. Sahneye şunu ekle:

```js
      infoBox: {
        text: {
          en: `Tek cümlelik İngilizce açıklama.`,
          tr: `Tek cümlelik Türkçe açıklama.`,
        },
      },
```

- `infoBox` yazmazsan sahnede kutu hiç görünmez.
- Metin iki dilde olmalı.
- Oyundaki bütün kutular başlıksızdır: kutu açılınca yalnızca bu cümle görünür. Bilgiyi soru-cevap biçiminde değil, kendi başına anlaşılır tek bir cümle olarak yaz.
- `title` (başlık) isteğe bağlıdır ve şu an hiçbir kutuda kullanılmıyor. Yazarsan cümlenin üstünde başlık olarak görünür: `title: { en: "...", tr: "..." },`
- Kutu açılınca panel uzar ve sayfa aşağı kayar.
- Kutuya yalnızca doğruluğundan emin olduğun bilgileri yaz; mümkünse kaynağını Kaynaklar ekranına da ekle.
- Karar sahnesine eklediğin kutu karar ekranında görünmez, seçimden sonra çıkar (bkz. "Bilgi kutusu seçimden sonra görünür").

## Kaynaklar ekranı

Kaynaklar ekranına (`sources`) iki yerden gidilir: açılış ekranındaki **"Kaynaklar"** düğmesinden ve bütün son ekranlarındaki (farklı sonlar ve final) **"Kaynaklar"** düğmesinden. Ekrandaki "Başa Dön" açılışa döner. Başka bir sahneden de gitmek istersen `choices` içine `SHARED.sourcesChoice` ekle.

Ekranın içeriği `story.js`'in başındaki `STORY` bölümünde, üç alandan gelir. Sırayla şöyle görünür: grup başlıkları ve altlarında künyeler, kaynak notu, görsel notu.

**Kaynakça (`sources`), gruplar hâlinde.** Her grubun bir başlığı (`heading`) ve künye listesi (`items`) vardır. Her künye iki dilde yazılır:

```js
  sources: [
    {
      heading: { tr: `Osmanlı kronikleri`, en: `Ottoman chronicles` },
      items: [
        {
          tr: `Yazar. Eser adı. Şehir: Yayınevi, Yıl.`,
          en: `Yazar. Eser adı. Şehir: Yayınevi, Yıl.`,
        },
      ],
    },
  ],
```

- Künyeler ekranda madde işareti ya da numara olmadan, her biri ayrı satırda ve asılı girintiyle görünür.
- **Künye girme biçimi:** Yazar. Eser adı. (Varsa çeviren, editör.) Şehir: Yayınevi, Yıl. (Makalede: dergi adı, cilt, sayı, yıl, sayfa.)
- İngilizce künye Türkçesiyle aynıdır; yalnızca kalıp sözcükler çevrilir: "İngilizce çeviri:" → "English translation:", "Çeviri:" → "Translated by", "(çev.)" → "(trans.)", "ss." → "pp.", "Cilt" → "Vol.", "Sayı" → "No.", "2 Cilt" → "2 vols" (sondaki noktayı cümle sonu noktası sağlar: "2 Cilt." → "2 vols."), "(Orijinal basım:" → "(Original edition:", yazar adları arasındaki "ve" → "and". Eser adları, yerler, yayınevleri ve yıllar çevrilmez.
- **"içinde" kuralı:** Türkçede "… eser adı içinde" diye eser adından sonra gelen "içinde", İngilizcede kelime kelime çevrilmez. Çeviri eserin adından **önce** ", in " yazılır:
  - TR: `J. R. Melville-Jones (çev.), The Siege of Constantinople 1453: Seven Contemporary Accounts içinde. Amsterdam: …`
  - EN: `J. R. Melville-Jones (trans.), in The Siege of Constantinople 1453: Seven Contemporary Accounts. Amsterdam: …`
- Metinde `&` gerekiyorsa `&amp;` yaz (ekranda `&` görünür).
- Eski düz biçim (`sources: [ { tr, en }, … ]`, grupsuz) de çalışır.
- Yalnızca gerçekten kullandığın ve kendi gözünle kontrol ettiğin kaynakları ekle. Hatırladığını düşündüğün ama doğrulamadığın bir kaynağı yazma.

**Doğrulanacak künyeler.** Bilgisi eksik ya da kontrol edilmesi gereken künyelerin yanında `// DOĞRULANACAK` yorumu durur; Osmanlı kronikleri grubunun üstünde de bir tane var. Hepsini bulmak için proje klasöründe:

```
grep -n "DOĞRULANACAK" story.js
```

Bir künyeyi doğruladığında yorumunu sil.

**Kaynak notu (`sourcesNote`, isteğe bağlı).** Listenin altında küçük, soluk bir paragraf. Boş bırakılırsa görünmez:

```js
  sourcesNote: {
    tr: `Türkçe not.`,
    en: `İngilizce not.`,
  },
```

**Görsel notu (`imageNote`).** Oyundaki görsellerle ilgili kısa bir not; en altta "Görsel notu" başlığıyla çıkar. Boş bırakılırsa görünmez:

```js
  imageNote: {
    tr: `Türkçe not.`,
    en: `İngilizce not.`,
  },
```

`sourcesNote` ve `imageNote` şu an `// TASLAK: ekip onayına tabi` yorumuyla işaretli.

## Ortak metinler

Birden fazla sahnede aynı metin geçiyorsa onu tekrar yazma. Bu tür metinler dosyanın başındaki `SHARED` bölümünde durur. Şu an orada "Kaynaklar" (`SHARED.sourcesChoice`) ve "Başa Dön" (`SHARED.restartChoice`) düğmeleri var. Son sahneleri bunları kendiliğinden kullanır; başka bir sahnede kullanmak için:

```js
      choices: [SHARED.sourcesChoice, SHARED.restartChoice],
```

`SHARED` içindeki bir metni değiştirirsen, onu kullanan her sahnede değişir.

Oyunun kendi çizdiği yazılar ("TARİHTE BÖYLE OLMADI", "TARİHTE DE BÖYLE OLDU", "Tarihte yaşanan:", "FARKLI BİR SON", "Tarihte ne oldu", taraf etiketleri, "Devam Et", uyarı kutucuğu metni) dosyanın en başındaki `translations` bölümündedir.

## Sık yapılan hatalar

- **Virgül unutmak.** Her alanın ve her sahnenin sonunda virgül olmalı: `},` gibi. Virgül eksikse oyun hiç açılmaz, ekran boş kalır.
- **`next` içinde yanlış ad yazmak.** `next` değeri bir sahnenin `id`'siyle harfi harfine aynı olmalı. Yanlışsa düğmeye basınca hiçbir şey olmaz.
- **Kesme işareti.** Metni `"` ile başlattıysan içinde `'` kullanabilirsin: `"Konstantinopolis'in"`. Birkaç satırlık ya da içinde `"` geçen metinlerde `` ` `` (ters tırnak) kullanmak en rahatıdır.
- **Başlıkta satır atlamak** için `<br>` yaz: `"Birinci satır<br>İkinci satır"`.
- Metinler sayfaya HTML olarak yazıldığı için metin içinde `<` ve `&` işaretlerini kullanma (yalnızca satır atlamak için `<br>`). Ters tırnakla yazılan metinlerin içinde `${` yazma.

## Kontrol

Değişiklikten sonra `index.html`'i tarayıcıda aç ve yeni sahneye kadar oyna. Karar sahnelerinde iki seçeneği de dene. Dil düğmesine basıp iki dilde de kontrol et. Ekran boş kalırsa büyük ihtimalle bir virgül ya da tırnak eksiktir.

## Konsolda uyarı görürsen ne yapmalı

Oyun açılırken `story.js`'i kendiliğinden kontrol eder ve bulduğu sorunları tarayıcı konsoluna sarı uyarı olarak yazar. Uyarılar oyunu durdurmaz, ama düzeltilmeleri gerekir.

Konsolu açmak için: Chrome'da Mac'te `Cmd + Option + J`, Windows'ta `F12` ya da `Ctrl + Shift + J`. Safari'de önce Ayarlar → Gelişmiş → "Geliştirici menüsünü göster" seçeneğini aç, sonra `Cmd + Option + C`.

Her uyarı `[story.js]` ile başlar ve hangi sahnede, hangi alanda sorun olduğunu söyler:

- **"id'si birden fazla sahnede kullanılmış"**: İki sahneye aynı `id`'yi vermişsin. Birinin adını değiştir; o sahneye giden `next` değerlerini de güncelle.
- **"next değeri ... ama böyle bir sahne yok"**: Düğmenin `next` değeri hiçbir sahnenin `id`'siyle eşleşmiyor. Yazımı kontrol et (büyük/küçük harf, tire).
- **"en metni eksik" / "tr metni eksik"**: O metnin bir dili boş ya da hiç yazılmamış. Her metin iki dilde de olmalı.
- **"metin { en: ..., tr: ... } biçiminde değil"**: Metni düz yazmışsın (`title: "..."`). `title: { en: "...", tr: "..." }` biçiminde yaz.
- **"historical: true ya da historical: false eksik"**: Karar sahnesindeki bir seçeneğin tarihsel olup olmadığı yazılmamış.
- **"sonuç metni (result) yok ve gösterilecek tarihsel seçenek de yok"**: `result` yazılmamış bir seçenekte sonuç ekranı tarihsel seçeneği gösterir; ama bu sahnede `historical: true` olan bir seçenek yok. Ya `result` yaz ya da tarihsel seçeneği işaretle.
- **"side ottoman ya da byzantine olmalı"**: `side` alanına yalnızca `"ottoman"` ya da `"byzantine"` yazılabilir.
- **"bütün seçenekler son sahnesine gidiyor; bilgi kutusu hiç görünmez"**: Bu karar sahnesinin her seçeneği kendine ait bir son sahnesine gidiyor, bu yüzden bilgi kutusu oyuncuya hiçbir zaman gösterilmez. Kutuyu başka bir sahneye taşı ya da bir seçeneği son sahnesi olmayan bir sahneye bağla.
- **"görsel assets/ ile başlamıyor"**: Görsel yolu `assets/` ile başlamalı: `image: "assets/gun2.jpg"`.
- **"görsel bulunamadı"**: Dosya adı yanlış ya da dosya `assets/` klasöründe değil. Dosya adını, uzantısını (`.jpg` / `.png`) ve büyük/küçük harfleri kontrol et.
- **"sideBackgrounds.…: görsel assets/ ile başlamıyor"** ya da **"Arka plan görseli yüklenemedi"**: `sideBackgrounds` içindeki yol yanlış. Yol `assets/` ile başlamalı ve dosya gerçekten orada olmalı. Düzeltene kadar o tarafın sahnelerinde varsayılan resim görünür.

Düzelttikten sonra sayfayı yenile; uyarı kaybolmalı. Konsolda kırmızı bir hata varsa ve ekran boşsa sorun büyük ihtimalle bir virgül ya da tırnaktır (bkz. "Sık yapılan hatalar").

## Test modu

Oyunu denerken hangi sahnede olduğunu görmek için test modunu aç. Ekranın sol altında küçük bir etiket çıkar.

- **Açmak:** adresin sonuna `?test` ekle, ör. `index.html?test` ya da `https://constantinoplelast29days.github.io/Last29days1453/?test`. Tarayıcı bunu hatırlar; sayfayı yenilesen de test modu açık kalır.
- **Kapatmak:** adresin sonuna `?test=0` ekleyip sayfayı aç. Etiket kaybolur.

Etiketin anlamı:

| Etiket | Anlamı |
|---|---|
| `S7 · fb3-ottoman · TR` | `story.js`'teki 7. sahne, adı (`id`) `fb3-ottoman`, dil Türkçe |
| `S7 · fb3-ottoman › B sonucu · TR` | Aynı sahnede ikinci seçeneğin (B) "Tarihte böyle olmadı" sonuç ekranı |
| `S7 · fb3-ottoman › A onayı · EN` | Aynı sahnede birinci seçeneğin (A) "Tarihte de böyle oldu" onay ekranı, dil İngilizce |

A, B harfleri seçeneklerin `story.js`'te yazıldığı sırayı gösterir: ilk yazılan seçenek A, ikincisi B.

Test modunda karar sahnelerinin seçenekleri de **karışık değil, `story.js`'teki sırayla** gösterilir ve her seçeneğin başında küçük, soluk bir **[A]** ya da **[B]** rozeti çıkar:

```
[A] Namluyu her atışta zeytinyağıyla soğut, günde 6–7 gülle at.
[B] Soğutmadan günde 12 atış yap.
```

Böylece "B'yi seçince şu oldu" gibi bir hatayı tarif etmek kolaylaşır. Rozet ekran okuyucuya okunmaz. Test modu kapalıyken her şey normaldir: seçeneklerin sırası her oyunda karışır ve rozet görünmez.

**Hata bildirirken** etikete tıkla (ya da Tab ile gelip Enter'a bas): metin panoya kopyalanır ve etiket kısa bir süre "kopyalandı" der. Kopyalanan metni hata mesajının başına yapıştır; böylece sorunun hangi sahnede, hangi ekranda ve hangi dilde olduğu kesin olarak bilinir.
