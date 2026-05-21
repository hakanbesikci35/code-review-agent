# Code Review Agent — Sunum Dökümanı

---

## 1. Proje Nedir?

**Code Review Agent**, bir GitHub reposuna açılan Pull Request'leri otomatik olarak inceleyen, önceden tanımlanmış bir checklist'e göre değerlendiren ve sonuçları hem PR yorumu hem de e-posta olarak raporlayan bir yapay zeka ajanıdır.

**Temel hedef:** Büyük şirketlerde manuel yapılan kod inceleme sürecini otomatize etmek.

---

## 2. Mimari Kararlar ve Gerekçeleri

### Neden Sadece PR? (Push değil)
- Push her commit'te tetiklenir → geliştirici henüz "bitmedi" derken review gelir
- PR, geliştiricinin "hazırım, inceleyin" dediği andır
- Tek PR = tüm değişiklikler bir arada → tek rapor, daha az gürültü
- Büyük şirketlerin (Google, Microsoft, Meta) standart yaklaşımı budur

### Neden GitHub Actions?
- Ekstra sunucu gerekmez, GitHub'ın kendi altyapısında çalışır
- PR olaylarına doğrudan entegre olur
- Ücretsiz (public repo'larda sınırsız, private'da 2000 dk/ay)
- Kurulum: tek bir YAML dosyası

### Neden Python?
- AI/ML ekosistemi Python merkezlidir
- Gemini ve Claude SDK'ları Python'da en olgun haldedir
- GitHub Actions'ta en yaygın kullanılan dil
- Hızlı geliştirme, az kod

### Neden YAML Checklist?
- İnsan tarafından okunabilir ve düzenlenebilir
- Ekstra bir veritabanı veya arayüz gerekmez
- Git ile versiyonlanır → checklist değişiklikleri de takip edilir
- GitHub Actions doğrudan repo'dan okur

### Neden Provider Soyutlaması (ai_client.py)?
- Bugün Gemini, yarın Claude veya başka bir model
- Geçiş için tek satır config değişikliği yeterli
- İş yerindeki ve kişisel API'ler kolayca değiştirilebilir

---

## 3. Genel Akış

```
Geliştirici PR açar
        │
        ▼
GitHub Actions tetiklenir
        │
        ▼
Kod diff'i alınır (değişen dosyalar)
        │
        ▼
checklist.yaml okunur
        │
        ▼
Gemini API'ye prompt gönderilir
        │
        ▼
   ┌────┴────┐
   │         │
   ▼         ▼
GitHub PR   Gmail
  Yorum     Mail
```

---

## 4. Proje Yapısı

```
code-review-agent/
│
├── .github/
│   └── workflows/
│       └── code-review.yml     → GitHub Actions iş akışı
│
├── agent/
│   ├── ai_client.py            → AI model soyutlama katmanı
│   ├── github_client.py        → GitHub PR yorum gönderme
│   ├── email_client.py         → Gmail SMTP mail gönderme
│   └── reviewer.py             → Ana orkestrasyon scripti
│
├── checklist.yaml              → Review kuralları (düzenlenebilir)
├── config.yaml                 → AI model ve provider ayarları
└── requirements.txt            → Python bağımlılıkları
```

---

## 5. Dosya Dosya Açıklama

---

### `checklist.yaml` — Review Kuralları

**Ne işe yarar:** Tüm review kriterlerini içerir. Agent bu listeye göre kodu değerlendirir.

**Yapısı:**
```yaml
version: 1
categories:
  - name: "Kategori Adı"
    items:
      - id: 1
        check: "Kontrol edilecek kural"
        severity: critical / high / medium / low
```

**Önem seviyeleri:**
| Seviye | Anlamı |
|--------|--------|
| `critical` | Güvenlik açığı, production'a geçemez |
| `high` | Ciddi kalite sorunu, düzeltilmeli |
| `medium` | İyileştirme önerilir |
| `low` | Küçük stil/dokümantasyon sorunu |

**8 Kategori, 35 Kural:**
- Kod Kalitesi (SRP, DRY, magic number, dead code)
- Güvenlik (hardcoded secret, SQL injection, input validation)
- Hata Yönetimi (exception handling, logging)
- Performans (N+1 sorgu, memory leak)
- Test (unit test, edge case)
- Mimari & Tasarım (SOLID, separation of concerns)
- Dokümantasyon
- Kod Standartları

**Nasıl güncellenir:** Herhangi bir metin editörüyle açılır, madde eklenir/çıkarılır, kaydedilir ve `git push` yapılır. Bir sonraki PR'dan itibaren yeni kurallar geçerli olur.

---

### `config.yaml` — Konfigürasyon

**Ne işe yarar:** Hangi AI modelinin kullanılacağını belirler.

```yaml
ai_provider: "gemini"              # "claude" yapılırsa Claude'a geçer
ai_model: "gemini-2.5-flash-lite"  # Model adı
```

**Provider değiştirmek için yeterli olan şey:** Bu iki satırı güncellemek. Başka hiçbir dosyaya dokunulması gerekmez.

---

### `requirements.txt` — Bağımlılıklar

**Ne işe yarar:** GitHub Actions'ın kurması gereken Python paketlerini listeler.

| Paket | Ne için |
|-------|---------|
| `anthropic` | Claude API (alternatif provider) |
| `google-genai` | Gemini API |
| `fastapi` + `uvicorn` | Web arayüzü (ilerisi için) |
| `pyyaml` | YAML dosyalarını okuma/yazma |
| `requests` | GitHub API HTTP çağrıları |
| `jinja2` | HTML mail şablonları |
| `python-multipart` | Form verisi işleme |

---

### `agent/ai_client.py` — AI Soyutlama Katmanı

**Ne işe yarar:** Gemini veya Claude'u tek bir arayüzle kullanmayı sağlar. Provider değiştiğinde sadece config güncellenir, bu dosyaya dokunulmaz.

**Sınıf: `AIClient`**

```
AIClient
├── __init__(provider, model, api_key)
│     Hangi AI kullanılacağını ve modeli belirler
│
├── review(prompt) → str
│     Dışarıdan çağrılan tek metot. Provider'a göre yönlendirir.
│
├── _call_claude(prompt) → str
│     Anthropic SDK üzerinden Claude'u çağırır
│     max_tokens: 4096
│
└── _call_gemini(prompt) → str
      Google GenAI SDK üzerinden Gemini'yi çağırır
```

**Provider ekleme:** Yeni bir AI servisi eklemek için `review()` metoduna `elif` eklemek ve yeni bir `_call_X()` metodu yazmak yeterlidir.

---

### `agent/github_client.py` — GitHub Entegrasyonu

**Ne işe yarar:** Review raporunu PR'ın yorum bölümüne ekler.

**Fonksiyon: `post_pr_comment(repo, pr_number, comment, token)`**

```
Parametreler:
  repo       → "kullanici/repo-adi" formatında repo yolu
  pr_number  → PR numarası (örn: 42)
  comment    → Markdown formatında yorum metni
  token      → GitHub Actions'ın sağladığı GITHUB_TOKEN

Ne yapar:
  GitHub REST API'nin /issues/{pr_number}/comments endpoint'ine
  POST isteği atar. Token, workflow tarafından otomatik sağlanır,
  ekstra kurulum gerekmez.
```

---

### `agent/email_client.py` — Mail Gönderme

**Ne işe yarar:** Review raporunu HTML formatında Gmail üzerinden gönderir.

**Fonksiyon: `send_email(sender, password, recipient, subject, body)`**

```
Parametreler:
  sender     → Gönderen Gmail adresi
  password   → Gmail uygulama şifresi (16 haneli)
  recipient  → Alıcı mail adresi
  subject    → Mail konusu
  body       → HTML formatında mail içeriği

Ne yapar:
  Gmail'in SMTP sunucusuna (smtp.gmail.com:465) SSL bağlantısı
  açar, kimlik doğrulama yapar ve HTML maili gönderir.
  Normal Gmail şifresi değil, "App Password" kullanır — bu Google'ın
  üçüncü parti uygulama erişimi için önerdiği yöntemdir.
```

---

### `agent/reviewer.py` — Ana Orkestrasyon

**Ne işe yarar:** Tüm bileşenleri bir araya getirir. GitHub Actions bu scripti çalıştırır.

**Fonksiyonlar:**

| Fonksiyon | Ne yapar |
|-----------|----------|
| `load_checklist()` | `checklist.yaml`'ı Python dict olarak okur |
| `load_config()` | `config.yaml`'ı okur (provider, model) |
| `load_diff()` | GitHub Actions'ın oluşturduğu `diff.patch` dosyasını okur. 12.000 karakter limitini aşarsa kırpar |
| `load_changed_files()` | `changed_files.txt`'den değişen dosya listesini alır |
| `build_checklist_text()` | Checklist'i AI'ın anlayacağı metin formatına dönüştürür |
| `build_prompt()` | PR bilgileri + diff + checklist'i birleştirip AI'a gönderilecek prompt'u oluşturur |
| `format_github_comment()` | AI'ın ürettiği raporu GitHub PR yorumu formatına getirir |
| `format_email_html()` | Raporu HTML mail şablonuna yerleştirir |
| `main()` | Tüm fonksiyonları sırayla çağırır: yükle → analiz et → raporla → gönder |

**`main()` Akışı:**
```
1. config.yaml ve checklist.yaml yükle
2. diff.patch ve changed_files.txt oku
3. Ortam değişkenlerinden PR bilgilerini al (başlık, yazar, numara)
4. Prompt oluştur
5. AIClient ile review yaptır
6. GitHub PR'a yorum ekle
7. Mail gönder
```

---

### `.github/workflows/code-review.yml` — GitHub Actions İş Akışı

**Ne işe yarar:** PR olaylarını dinler, ortamı hazırlar ve agent'ı çalıştırır.

**Tetikleyici:**
```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened]
```
- `opened`: Yeni PR açıldığında
- `synchronize`: Mevcut PR'a yeni commit eklendiğinde
- `reopened`: Kapatılmış PR yeniden açıldığında

**Adımlar:**

| Adım | Ne yapar | Süre |
|------|----------|------|
| Checkout | Repo'yu runner'a klonlar (`fetch-depth: 0` ile tüm geçmiş) | ~1s |
| Set up Python | Python 3.11 kurar | ~1s |
| Install dependencies | `pip install -r requirements.txt` | ~8s |
| Get diff | `git diff` ile değişen dosyaları ve farkları dosyaya yazar | ~0s |
| Run Agent | `python agent/reviewer.py` çalıştırır | ~13s |

**Toplam süre: ~25 saniye**

**Güvenlik:**
```yaml
permissions:
  pull-requests: write   # PR'a yorum yazabilmek için
  contents: read         # Repo'yu okuyabilmek için
```

**Ortam Değişkenleri (Secrets):**
- `AI_API_KEY` → Gemini/Claude API anahtarı
- `GMAIL_USER` → Gönderen Gmail
- `GMAIL_APP_PASSWORD` → Gmail uygulama şifresi
- `REVIEW_EMAIL` → Raporun gideceği adres
- `GITHUB_TOKEN` → Otomatik sağlanır, elle girilmez

---

## 6. Güvenlik Tasarımı

- Tüm hassas bilgiler (API key, şifre) GitHub Secrets'ta saklanır
- Workflow dosyasında hiçbir zaman düz metin secret görünmez
- `GITHUB_TOKEN` her çalışmada GitHub tarafından otomatik üretilir ve sınırlı yetkiye sahiptir
- Mail için normal Gmail şifresi değil, sadece bu uygulama için üretilmiş 16 haneli App Password kullanılır

---

## 7. Genişletilebilirlik

| İhtiyaç | Yapılacak |
|---------|-----------|
| Yeni AI modeline geç | `config.yaml`'da 2 satır değiştir |
| Yeni kural ekle | `checklist.yaml`'a madde ekle |
| Farklı repoya uygula | `.github/workflows/` ve `agent/` klasörlerini kopyala |
| Slack bildirimi ekle | `email_client.py`'e benzer `slack_client.py` yaz |
| Sadece belirli dosya tiplerini incele | Workflow'da `changed_files.txt`'e filtre ekle |

---

## 8. Örnek Review Çıktısı

Gerçek bir PR'da agent şu tür bulgular üretir:

```
| Dosya      | Kural                              | Önem     | Açıklama              |
|------------|------------------------------------|-----------|-----------------------|
| ornek.py   | Şifre hardcode edilmiş mi?         | CRITICAL  | PASSWORD değişkeni    |
| ornek.py   | SQL injection riski var mı?        | CRITICAL  | Raw string birleştirme|
| ornek.py   | Magic number kullanılmış mı?       | MEDIUM    | 1337 sabiti           |
| ornek.py   | Catch-all exception kullanımı      | HIGH      | Boş except bloğu      |
```

**Karar:** DÜZELTME GEREKİYOR / ONAYLANDI / REDDEDİLDİ

---

## 9. Özet

| Özellik | Detay |
|---------|-------|
| Tetikleyici | Pull Request (açılma, güncelleme, yeniden açılma) |
| Analiz kapsamı | Değişen ve yeni eklenen tüm dosyalar |
| AI Modeli | Gemini 2.5 Flash-Lite (değiştirilebilir) |
| Çıktı | GitHub PR yorumu + HTML e-posta |
| Ortalama süre | ~25 saniye |
| Altyapı | GitHub Actions (ekstra sunucu yok) |
| Kural yönetimi | YAML dosyası (git ile versiyonlanır) |
| Güvenlik | GitHub Secrets + Gmail App Password |
