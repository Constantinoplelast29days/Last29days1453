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
| `side` | Sahnenin tarafı: `"ottoman"` (Osmanlı) ya da `"byzantine"` (Bizans). Başlığın üstünde taraf etiketi, panelin sol kenarında renkli şerit çıkar. | Hayır |
| `eyebrow` | Başlığın üstündeki küçük, büyük harfli yazı (`FLASHBACK 1` gibi). | Hayır |
| `title` | Sahnenin başlığı. | Evet (son sahnelerinde hayır) |
| `paragraphs` | Hikâye paragrafları. İstediğin kadar ekleyebilirsin. | Evet |
| `reports` | Sabah raporları: alıntı olarak görünür, altında kaynağın adı yazar. | Hayır |
| `choices` | Alttaki düğmeler. Her düğmenin bir yazısı (`text`) ve gideceği sahnenin `id`'si (`next`) vardır. | Evet (son sahnelerinde hayır) |
| `note` | Paragrafların altında görünen küçük not. Son sahnelerinde "Tarihte ne oldu" notu olur. | Hayır (son sahnelerinde evet) |
| `infoBox` | Oyuncunun isterse açıp okuyabileceği "Daha fazla bilgi" kutusu. | Hayır |
| `ending` | `true` ise sahne "Farklı bir son" ekranı olur (bkz. aşağıda). | Hayır |
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

`historical: false` bir seçenek bir son sahnesine (`ending: true`) gidiyorsa sonuç ekranı çıkmaz, oyuncu doğrudan son ekranına geçer; sonucu son ekranının paragrafı anlatır. Bu durumda `result` yazmana gerek yoktur.

## Örnek: karar sahnesi eklemek

Aşağıdaki örnekte `...` yerine materyaldeki metni koy.

```js
    // Flashback 4 — Osmanlı
    {
      id: "fb4-ottoman",
      day: 1,
      side: "ottoman",
      dateText: { en: "...", tr: "..." },
      eyebrow: { en: "FLASHBACK 4", tr: "FLASHBACK 4" },
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

- Üstteki "FARKLI BİR SON" yazısı ve alttaki "Başa Dön" düğmesi kendiliğinden gelir; `eyebrow`, `title` ve `choices` yazma.
- `note`, ekranda "Tarihte ne oldu" başlığıyla görünür. Buraya yalnızca materyalde yazan, doğrulanmış bilgiyi koy.

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

## Geçici "Devamı Gelecek" sahnesi

Prolog şu an `to-be-continued` adlı geçici bir sahnede bitiyor: oyuncuya "Devamı Gelecek / Hikâyenin bu bölümü henüz yazılıyor." gösterir ve "Başa Dön" düğmesi vardır. `story.js`'te üstünde `// GEÇİCİ` yorumu durur.

Şu anki akış:

```
title → prolog-intro → fb1-ottoman → fb1-byzantine → fb2-ottoman → fb2-byzantine
      → fb3-ottoman → fb3-byzantine ─┬─ tarihsel seçenek ───→ to-be-continued
                                     └─ diğer seçenek ──────→ ending-golden-horn (son)
```

Diğer karar sahnelerinde tarihsel olmayan seçenek önce sonuç ekranını gösterir, sonra bir sonraki sahneye geçer.

**Sonraki bölümü yazdığında:**

1. Yeni sahnelerini yaz.
2. `fb3-byzantine` sahnesinde tarihsel seçeneğin `next` değerini `"to-be-continued"` yerine kendi ilk sahnenin `id`'si yap.
3. Yazdığın son sahneden sonra hâlâ geçici bir sona ihtiyaç varsa `to-be-continued`'u yerinde bırak ve son sahnenin düğmesini ona bağla. Yoksa `to-be-continued` sahnesini, üstündeki `// GEÇİCİ` yorumuyla birlikte `{` ile başlayıp `},` ile biten bloğun tamamını silerek kaldır.

Silmeden önce `story.js` içinde `to-be-continued` diye arat: yalnızca silinecek sahnenin kendisinde geçmeli. Başka bir yerde hâlâ geçiyorsa oradaki düğme silinmiş bir sahneyi gösteriyordur; konsolda uyarı da çıkar.

## Sahne görseli eklemek

1. Resmi `assets` klasörüne koy (örneğin `assets/surlar.jpg`).
2. Sahneye bir satır ekle:

```js
      image: "assets/surlar.jpg",
```

Resim metin kutucuğunun arka planı olur. Yazılar okunabilsin diye üstünde yine koyu bir katman durur. Resim kutucuğu tamamen kaplar, kenarlarından biraz kırpılabilir.

- Satırı hiç yazmazsan kutucukta varsayılan resim (`assets/background.jpg`) kalır.
- Yol mutlaka `assets/` ile başlamalı. Dosya adında büyük-küçük harf de önemli: `Surlar.jpg` ile `surlar.jpg` farklı dosyalardır.
- Büyük resimler oyunun yavaş açılmasına yol açar; 500 KB'ın altında tutmaya çalış.

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
- Kutu, oyuncu seçim yapmadan önce de açılabilir. Tarihsel cevabı ele veren bir bilgiyi karar sahnesine koyarken bunu göz önünde bulundur.

## Kaynaklar ekranı

`sources` adlı bir Kaynaklar ekranı var, ama şu an hiçbir düğme ona gitmiyor. Oyuncunun görmesi için bir sahneye `next: "sources"` olan bir düğme eklemek gerekir. Bu ekranın içeriği `story.js`'in başındaki `STORY` bölümünde, iki alandan gelir.

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

Birden fazla sahnede aynı metin geçiyorsa onu tekrar yazma. Bu tür metinler dosyanın başındaki `SHARED` bölümünde durur. Şu an orada yalnızca "Başa Dön" düğmesi (`SHARED.restartChoice`) var. Bir sahnede kullanmak için:

```js
      choices: [SHARED.restartChoice],
```

`SHARED` içindeki bir metni değiştirirsen, onu kullanan her sahnede değişir.

Oyunun kendi çizdiği yazılar ("TARİHTE BÖYLE OLMADI", "FARKLI BİR SON", "Tarihte ne oldu", taraf etiketleri, "Devam Et", uyarı kutucuğu metni) dosyanın en başındaki `translations` bölümündedir.

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
- **"historical: false ama sonuç metni (result) yok"**: Tarihsel olmayan seçeneğin sonuç ekranında gösterilecek `result` metnini ekle.
- **"side ottoman ya da byzantine olmalı"**: `side` alanına yalnızca `"ottoman"` ya da `"byzantine"` yazılabilir.
- **"son sahnesinde Tarihte ne oldu notu (note) eksik"**: `ending: true` olan sahneye `note` ekle.
- **"görsel assets/ ile başlamıyor"**: Görsel yolu `assets/` ile başlamalı: `image: "assets/gun2.jpg"`.
- **"görsel bulunamadı"**: Dosya adı yanlış ya da dosya `assets/` klasöründe değil. Dosya adını, uzantısını (`.jpg` / `.png`) ve büyük/küçük harfleri kontrol et.

Düzelttikten sonra sayfayı yenile; uyarı kaybolmalı. Konsolda kırmızı bir hata varsa ve ekran boşsa sorun büyük ihtimalle bir virgül ya da tırnaktır (bkz. "Sık yapılan hatalar").
