# Yeni Sahne Ekleme Kılavuzu

Hikâyenin tamamı `story.js` dosyasında. Yeni bir sahne eklemek için başka bir dosyaya dokunman gerekmez.

## Sahne nedir?

Oyundaki her ekran bir sahnedir. Her sahnede bir başlık, birkaç paragraf ve altta düğmeler bulunur. Oyuncu bir düğmeye bastığında başka bir sahneye geçer.

Sahneler `story.js` içindeki `scenes: [ ... ]` listesinde sırayla durur.

## Bir sahnenin parçaları

| Alan | Ne işe yarar | Zorunlu mu? |
|---|---|---|
| `id` | Sahnenin kısa adı. Boşluksuz yaz: `pazar-yeri` gibi. Aynı ad iki sahnede olamaz. | Evet |
| `day` | Oyunun kaçıncı günü: 1 = 30 Nisan 1453, 30 = 29 Mayıs 1453. Sağ üstteki tarih buna göre değişir. | Evet |
| `eyebrow` | Başlığın üstündeki küçük, büyük harfli yazı. | Evet |
| `title` | Sahnenin başlığı. | Evet |
| `paragraphs` | Hikâye paragrafları. İstediğin kadar ekleyebilirsin. | Evet |
| `choices` | Alttaki düğmeler. Her düğmenin bir yazısı (`text`) ve gideceği sahnenin `id`'si (`next`) vardır. | Evet |
| `note` | Paragrafların altında görünen küçük not. | Hayır |
| `image` | Metin kutucuğunun arkasındaki resim. Boş bırakırsan varsayılan resim kullanılır. | Hayır |
| `infoBox` | Oyuncunun isterse açıp okuyabileceği "Daha fazla bilgi" kutusu. | Hayır |

Her yazı iki dilde, şu şekilde yazılır:

```js
{ en: "English text", tr: "Türkçe metin" }
```

İki dilden biri eksik olursa oyunda o yazının yerinde "undefined" görünür. Her metni mutlaka iki dilde de yaz.

## Düğmeler nasıl görünür?

- **Tek düğme** ("Devam Et" gibi): altın renkli büyük düğme olarak görünür.
- **İki veya daha fazla düğme**: alt alta seçenek listesi olarak görünür.
- **Her birinde `style: "secondary"` olan düğmeler**: seçenek listesi yerine yan yana, çerçeveli düğmeler olarak görünür. Son ekrandaki "Kaynaklar" ve "Başa Dön" böyle.

## Örnek: yeni bir gün eklemek

Diyelim ki "Devam Et"ten sonra karar ekranından önce 3. güne ait bir sahne eklemek istiyoruz.

**1. Sahneyi yaz.** Sahneyi `scenes` listesine ekle; yeri önemli değil ama okunması kolay olsun diye `story` sahnesinin hemen altına koymak iyi olur:

```js
    // 3. gün: surlardaki sabah
    {
      id: "walls-morning",
      day: 3,
      image: "assets/surlar.jpg",
      eyebrow: {
        en: "DAY 3 · THE WALLS",
        tr: "3. GÜN · SURLAR",
      },
      title: {
        en: "Morning on the Walls",
        tr: "Surlarda Sabah",
      },
      paragraphs: [
        {
          en: "Smoke rises over the land walls as dawn breaks.",
          tr: "Gün ağarırken kara surlarının üzerinde duman yükseliyor.",
        },
        {
          en: "Somewhere below, a bell begins to ring.",
          tr: "Aşağılarda bir yerde bir çan çalmaya başlıyor.",
        },
      ],
      choices: [
        { text: { en: "Continue", tr: "Devam Et" }, next: "choice" },
      ],
    },
```

**2. Önceki sahneyi buna bağla.** `story` sahnesindeki düğmenin `next` değerini yeni sahnenin `id`'si yap:

```js
      choices: [
        { text: { en: "Continue", tr: "Devam Et" }, next: "walls-morning" },
      ],
```

Bu kadar. Artık oyun `story` → `walls-morning` → `choice` sırasıyla ilerler.

## Geçici "Devamı Gelecek" sahneleri

Karar ekranından sonra oyun şu an doğrudan sona atlamasın diye iki yer tutucu sahne var: `placeholder-supplies` (erzak seçeneği) ve `placeholder-family` (aile seçeneği). İkisi de oyuncuya "Devamı Gelecek / Hikâyenin bu bölümü henüz yazılıyor." gösterir, "Devam Et" düğmesiyle ilgili sona geçer. `story.js`'te üstlerinde `// GEÇİCİ: yazar gerçek bölümleri yazınca silinecek` yorumu durur.

Şu anki akış:

```
choice ─┬─ erzak ─→ placeholder-supplies ─→ ending-supplies
        └─ aile  ─→ placeholder-family   ─→ ending-family
```

**Gerçek bölümü yazdığında** (örnek erzak yolu için; aile yolu aynı şekilde):

1. Yeni sahne ya da sahnelerini yaz (bkz. "Örnek: yeni bir gün eklemek"). Son yazdığın sahnenin düğmesi sona gitsin: `next: "ending-supplies"`.
2. `choice` sahnesinde erzak seçeneğinin `next` değerini `"placeholder-supplies"` yerine kendi ilk sahnenin `id`'si yap.
3. `placeholder-supplies` sahnesini, üstündeki `// GEÇİCİ` yorumuyla birlikte `{` ile başlayıp `},` ile biten bloğun tamamını silerek kaldır.

Silmeden önce `story.js` içinde `placeholder-supplies` diye arat: 2. adımdan sonra yalnızca silinecek sahnenin kendisinde geçmeli. Başka bir yerde hâlâ geçiyorsa oradaki düğme silinmiş bir sahneyi gösteriyordur ve oyun o düğmede takılır.

## Sahne görseli eklemek

1. Resmi `assets` klasörüne koy (örneğin `assets/surlar.jpg`).
2. Sahneye bir satır ekle:

```js
      image: "assets/surlar.jpg",
```

Resim metin kutucuğunun arka planı olur. Yazılar okunabilsin diye üstünde yine koyu bir katman durur. Resim kutucuğu tamamen kaplar, kenarlarından biraz kırpılabilir.

- Satırı hiç yazmazsan kutucukta varsayılan resim (`assets/background.jpg`) kalır.
- Yol mutlaka `assets/` ile başlamalı. Dosya adında büyük-küçük harf de önemli: `Surlar.jpg` ile `surlar.jpg` farklı dosyalardır.
- Büyük resimler oyunun yavaş açılmasına yol açar; yaklaşık 2 MB'ın altında tutmaya çalış.

## Bilgi kutusu eklemek

Bir sahnede tarihî bir ayrıntıyı anlatmak ama hikâyeyi bölmemek istiyorsan bilgi kutusu kullan. Kutu sahnede kapalı durur, üstünde "Daha fazla bilgi" yazar; oyuncu tıklayınca (ya da klavyeyle Tab'la gelip Enter'a basınca) açılır.

Sahneye şunu ekle:

```js
      infoBox: {
        title: {
          en: "Kutunun İngilizce başlığı",
          tr: "Kutunun Türkçe başlığı",
        },
        text: {
          en: "Kısa İngilizce açıklama.",
          tr: "Kısa Türkçe açıklama.",
        },
      },
```

- `infoBox` yazmazsan sahnede kutu hiç görünmez.
- Başlık da metin de iki dilde olmalı.
- Metni kısa tut. Kutu açılınca metin kutucuğa sığmazsa kutucuğun içinde kaydırma çubuğu çıkar.
- Kutuya yalnızca doğruluğundan emin olduğun bilgileri yaz; mümkünse kaynağını Kaynaklar ekranına da ekle.

## Kaynaklar ekranı

İki son ekranında da bir "Kaynaklar" düğmesi var; bu düğme Kaynaklar ekranını açar. Bu ekranın içeriği `story.js`'in başındaki `STORY` bölümünde, iki alandan gelir.

**Kaynak listesi (`sources`).** Şu an boş, bu yüzden ekranda "Kaynaklar yakında eklenecek" yazıyor. Kaynak eklemek için her kaynağı köşeli parantezlerin arasına ayrı bir satır olarak yaz:

```js
  sources: [
    { en: "...", tr: "..." },
    { en: "...", tr: "..." },
  ],
```

`...` yerine kaynağın oyuncuya görünecek hâlini yaz (yazar, eser adı, yayınevi, yıl gibi). İngilizce ve Türkçe hâli aynı olabilir; o zaman ikisine de aynı metni yaz. Listeye en az bir kaynak eklediğinde "yakında eklenecek" yazısı kendiliğinden kaybolur ve kaynaklar numaralı liste olarak görünür.

Yalnızca gerçekten kullandığın ve kendi gözünle kontrol ettiğin kaynakları ekle. Hatırladığını düşündüğün ama doğrulamadığın bir kaynağı yazma.

**Görsel notu (`imageNote`).** Oyundaki görsellerle ilgili kısa bir not. Örneğin görsellerin tarihî belge değil, sanatsal yorum olduğunu belirtmek için. Şu an boş, bu yüzden ekranda görünmüyor. Doldurduğunda listenin altında "Görsel notu" başlığıyla çıkar:

```js
  imageNote: {
    en: "İngilizce not.",
    tr: "Türkçe not.",
  },
```

## Ortak metinler

Birden fazla sahnede aynı metin geçiyorsa onu tekrar yazma. Bu tür metinler dosyanın başındaki `SHARED` bölümünde durur; örneğin iki sonda da görünen tarihî sonuç paragrafı, "Kaynaklar" ve "Başa Dön" düğmeleri. Bir sahnede kullanmak için metnin yerine adını yaz:

```js
      paragraphs: [
        { en: "...", tr: "..." },
        SHARED.endingHistory,
      ],
      note: SHARED.endingDisclaimer,
      choices: [SHARED.sourcesChoice, SHARED.restartChoice],
```

`SHARED` içindeki bir metni değiştirirsen, onu kullanan her sahnede değişir.

## Sık yapılan hatalar

- **Virgül unutmak.** Her alanın ve her sahnenin sonunda virgül olmalı: `},` gibi. Virgül eksikse oyun hiç açılmaz, ekran boş kalır.
- **`next` içinde yanlış ad yazmak.** `next` değeri bir sahnenin `id`'siyle harfi harfine aynı olmalı. Yanlışsa düğmeye basınca hiçbir şey olmaz.
- **Kesme işareti.** Metni `"` ile başlattıysan içinde `'` kullanabilirsin: `"Konstantinopolis'in"`. Birkaç satırlık metinlerde `` ` `` (ters tırnak) kullanmak en rahatıdır.
- **Başlıkta satır atlamak** için `<br>` yaz: `"Birinci satır<br>İkinci satır"`.

## Kontrol

Değişiklikten sonra `index.html`'i tarayıcıda aç ve yeni sahneye kadar oyna. Dil düğmesine basıp iki dilde de kontrol et. Ekran boş kalırsa büyük ihtimalle bir virgül ya da tırnak eksiktir.
