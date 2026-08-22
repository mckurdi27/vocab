# 📂 Proje Dosya ve Klasör Yapısı .

Projenin kök dizininde bulunan klasörler ve dosyaların genel hiyerarşisi şu şekildedir:

```

vocab/
├── analiz/             # Analiz işlemlerine ait alt dosyalar
                        cefra1.csv cefra2.csv cefrb1.csv cefrb2.csv cefrc1.csv cefrc2.csv.     
                        cefra1.json
├── data/               # JSON veri dosyalarının bulunduğu klasör
                        a101.json a102.json a103.json ... a150.json
                        a201.json ... a250.json
                        b101.json ... b150.json
                        b201.json ... b250.json
                        c101.json ... c150.json
                        c201.json ... c250.json
├── PDF/                # PDF dokümanlarının saklandığı klasör

├── analiz.html         # Analiz arayüzü / ekranı
├── app.js              # Ana JavaScript işlevleri
├── index.html          # Ana giriş sayfası
├── style.html / .css   # Stil ve tasarım dosyaları
└── README.md           # Proje dokümantasyonu

'''

#Aşağıdaki sitede kelimeleri kullan:.

kelimelog.com/oxford-5000-kelime-listesi

#Ve:

✔ Her seviyede 20 grup olacak
✔ Her grup 50 kelime olacak
✔ Gruplar alfabetik değil
✔ Gruplar bağlamsal
✔ Her grup bir hikâye sahnesi olacak
✔ Kelimeler sahneye uygun olacak
✔ Her seviye için tek bir JSON dosyası vereceğim
✔ Dosya adları:A1.jsonA2.jsonB1.jsonB2.jsonC1.json

#Her kelime:İngilizceTürkçeÖrnek cümle

✔ Gruplar arasında boşluk olacak
✔ Hikâye yazılabilir kelime evrenleri olacak
✔ “Sadece sebze”, “sadece hayvan” gibi anlamsız gruplar asla olmayacak
Sahneleri sen belirle (her seviyede 20 sahne)

#Aşağıdaki sahneler A1 için örnek:

Evde Sabah
Okula Gidiş
Sınıfta
Arkadaşlarla Buluşma
Markette 
Restoranda
Parkta
Doktorda
Otobüs Yolculuğu
Aile ile Akşam
Basit Duygular
Günlük Rutin
Teknoloji ve Cihazlar
Ev İşleri
Hava Durumu ve Doğa
Basit Meslekler
Tatil ve Seyahat
Basit Problemler
Eğlence ve Hobiler
Şehirde Bir Gün

#A1, A2, B1, B2, C1 için sahneler seviyeye uygun şekilde daha karmaşık olacak.


#Projeyi harika bir sistemle kurguladım. 

#Oxford 5000 kelime listesini temel alarak; anlamsız kategoriler yerine bağlamsal, hikâye kurulabilir sahneler (her seviye için 20 grup, her grupta 50 kelime) üzerinden ilerleyeceğiz. 

#Her kelime için İngilizce, Türkçe ve örnek cümle yapısını koruyarak JSON formatında sunacağız.

#​A1 seviyesi için verdiğiniz 20 sahne harika bir temel oluşturuyor. Projenin devamı ve sonraki adımlar için hazırlık olması adına, A2, B1, B2 ve C1 seviyeleri için de aynı mantıkta 20'şer adet bağlamsal sahneyi seviyelerin dil karmaşıklığına ve kelime dağarcığına uygun olarak belirledim:

#​A2 Seviyesi Sahneleri (Genişletilmiş Günlük Yaşam ve Deneyimler)

​Ev Tasarımı ve Eşyalar
​Alışveriş Merkezinde
​Kıyafetler ve Moda
​Semt Pazarı ve Gıda
​Sağlık ve Vücut Ağrıları
​Seyahat Planlama ve İstasyon
​Otelde Konaklama
​Yemek Pişirme ve Tarifler
​Arkadaşlarla Kutlama ve Partiler
​Hobiler ve Spor Dalları
​İş Yeri ve Ofis Ortamı
​Meslekler ve Sorumluluklar
​Geçmiş Anılar ve Çocukluk
​Gelecek Planları ve Hayaller
​Hava Olayları ve Mevsimler
​Şehir İçi Ulaşım ve Yol Tarifi
​Basit Teknolojik Sorunlar
​Duygular ve İlişkiler
​Acil Durumlar ve Güvenlik
​Kültür ve Gelenekler

#​B1 Seviyesi Sahneleri (Sosyal Hayat, Fikirler ve Anlatım)

​Kariyer ve İş Görüşmeleri
​Eğitim ve Üniversite Hayatı
​Medya, Haberler ve Gazeteler
​Bankacılık ve Finansal İşlemler
​Ev Kiralama ve Komşuluk İlişkileri
​Sağlıklı Yaşam ve Diyet
​Çevre Bilinci ve Geri Dönüşüm
​Seyahat Deneyimleri ve Maceralar
​Sanat, Tiyatro ve Sinema
​Kişisel Gelişim ve Hedefler
​Tartışmalar ve Fikir Ayrılıkları
​E-posta ve Resmi Yazışmalar
​Sosyal Medya ve Dijital İletişim
​Toplumsal Kurallar ve Yasalar
​Misafirlik ve İkram Kültürü
​Alışverişte Haklar ve İadeler
​Boş Zaman Aktiviteleri ve Kulüpler
​Karakter Özellikleri ve Davranışlar
​Başarılar ve Hayal Kırıklıkları
​Planlama ve Organizasyon Yönetimi

#​B2 Seviyesi Sahneleri (İleri Düzey, Soyut Kavramlar ve Profesyonel Alan)

​Küresel Sorunlar ve Siyaset
​Ekonomi ve İş Dünyası
​Bilim, Buluşlar ve Uzay
​Psikoloji ve İnsan Davranışları
​Hukuk, Adalet ve Suç
​Edebiyat ve Felsefi Akımlar
​Reklamcılık ve Pazarlama Stratejileri
​İnovasyon ve Girişimcilik
​İş Ahlakı ve Kurumsal Kültür
​Çatışma Çözme ve Arabuluculuk
​Kültürlerarası İletişim
​Medya Manipülasyonu ve Eleştirel Düşünce
​Sağlık Sektörü ve Tıbbi Gelişmeler
​Modern Mimari ve Kentleşme
​Doğal Afetler ve Kriz Yönetimi
​Eğitim Sistemleri ve Pedagoji
​Kariyer Basamakları ve Liderlik
​İnsan Hakları ve Toplumsal Adalet
​Sürdürülebilir Enerji ve Gelecek
​Biyografi ve Yaşam Öyküleri

#​C1 Seviyesi Sahneleri (Akademik, Uzmanlık ve Üst Düzey Söylem)

​Akademik Araştırma ve Makale Yazımı
​Diplomatik İlişkiler ve Uluslararası Anlaşmalar
​Makroekonomi ve Küresel Piyasalar
​Yapay Zekâ ve Bilgisayar Bilimleri
​İleri Düzey Felsefe ve Etik Tartışmalar
​Sosyolojik Yapılar ve Toplumsal Değişim
​Hukuksal Metinler ve Mahkeme Süreçleri
​Edebi Sanatlar ve Dil Bilimi
​Stratejik Planlama ve Risk Analizi
​Kriz İletişimi ve Halkla İlişkiler
​Biyoteknoloji ve Genetik Çalışmalar
​Küresel Güvenlik ve Jeopolitik
​Estetik, Sanat Tarihi ve Eleştiri
​İleri Psikolojik Analizler ve Davranış Bilimleri
​Çevre Politikaları ve Ekolojik Denge
​Kültürel Miras ve Koruma Çalışmaları
​Finansal Piyasalar ve Yatırım Stratejileri
​İnovasyon Yönetimi ve Ar-Ge
​Siyaset Felsefesi ve Devlet Kuramları
​Evrensel Değerler ve Metafizik Sorgulamalar

-------

#Eee inceleyelim.

