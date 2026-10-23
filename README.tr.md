<div align="center">

```

███████╗ █████╗ ██╗
╚══███╔╝██╔══██╗██║
  ███╔╝ ███████║██║
 ███╔╝  ██╔══██║██║
███████╗██║  ██║██║
╚══════╝╚═╝  ╚═╝╚═╝
```

# z-ai-bulk-apikey

**Toplu Z.AI (GLM) API anahtarı oluşturma — api.z.ai üzerinden OpenAI uyumlu çıkarım, ayrıca bir 9Router bağlayıcısı.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-1%20served-412991?style=for-the-badge)](https://z.ai)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Hızlı başlangıç](#-quick-start) · [🎁 Ücretsiz katman](#-free-tier--how-much-you-get) · [🤖 Modeller](#-models--all-1-of-them) · [🧪 API'yi kullanma](#-how-to-use-the-api) · [✅ Doğrulandı](#-verified-working--every-key-is-tested) · [🧭 Nasıl çalışır](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Seçenekler](#️-cli-options) · [🛰️ Proxy'ler](#️-behind-a-proxy) · [🐞 Sorunlar](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Bu neden var

Z.AI, GLM ailesini `https://api.z.ai/api/paas/v4` adresinde **OpenAI uyumlu** bir uç nokta üzerinden sunar ve ücretsiz katman gerçektir: `glm-4.5-flash`, doğrudan bir konsol projesinden alınan bir anahtarla canlı bir sohbet çağrısını yanıtlar (ölçüldü — bkz. *Doğrulandı*). İlginç olan kısım, oluşturmanın hiçbir maliyeti olmayan anahtardır: bir Z.AI konsol projesi **herhangi bir sayıda anahtar** dağıtır (`POST …/projects/{pid}/api_keys`) ve her biri `keys.txt` dosyasına düşmeden önce bir chat-200 ile kanıtlanır. Ölçeklenen birim **anahtar filosu başına bir hesap (bir oturum)**dur: bir projedeki her anahtar aynı kotayı çeker, dolayısıyla ayrı kotalar ayrı hesaplar demektir — bu yüzden araç, yoktan anahtar üretmek yerine her çalıştırma için bir oturum alır.

## 🎁 Ücretsiz katman — ne kadar alırsınız

| Ne | Değer |
| --- | --- |
| Ücretsiz model | **`glm-4.5-flash`** — ücretsiz katmanın yanıtladığı tek sınıf |
| Ücretli modeller | `glm-4.6`, `glm-4.5`, `glm-5.3` → `429 {"error":{"code":"1113","message":"Insufficient balance or no resource package"}}` (ölçüldü 2026-10-21) |
| Bilinmeyen model | `glm-4.6-flash` → `400` bilinmeyen model |
| Kart gerekli mi | Flash katmanı için **Hayır** |
| Hız sınırı | gözlemlenmedi — 27,5 saniyede arka arkaya 12 çağrının tümü 200 döndü |
| Hesap başına anahtar | aynı projede herhangi bir sayıda; **hesabın kotasını paylaşırlar** |

> Ücretsiz katman Z.AI tarafından belirlenir ve değişebilir. Güncel sayıları [z.ai](https://z.ai) adresinden kontrol edin — ve kararı aracın kendi kapısına bırakın: `node src/cli.js --verify-only`, `keys.txt` içindeki her anahtarı gerçek bir `glm-4.5-flash` çağrısıyla yeniden test eder.

> 💡 Ücretsiz katman Z.AI tarafından belirlenir ve değişebilir. Güncel sayıları [z.ai](https://z.ai) adresinden kontrol edin — ve kararı aracın kendi kapısına bırakın:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modeller — hepsi 1 tane

**Ücretsiz katmanda canlı olarak doğrulanan tek bir kimlik var**: `glm-4.5-flash` — bu aracın yazdığı her anahtar için varsayılan kapı modeli (ve dolayısıyla yönlendiriciye kaydettiği tek model).

| Model Kimliği | Ücretsiz katman anahtarında durum |
| --- | --- |
| `glm-4.5-flash` | Gerçek içerikle **200** — aracın kapısı |
| `glm-4.6`, `glm-4.5`, `glm-5.3` | `429` — `Insufficient balance or no resource package` |
| `glm-4.6-flash` | `400` — bilinmeyen model |

Uç nokta OpenAI uyumludur (`GET /api/paas/v4/models` ve `POST /api/paas/v4/chat/completions`), dolayısıyla bakiyesi olan bir anahtar aynı temel URL ile kataloğun geri kalanına erişir.

## 🧪 API'yi kullanma

Temel URL **`https://api.z.ai/api/paas/v4`** — OpenAI uyumlu, dolayısıyla herhangi bir OpenAI istemcisi çalışır.

```bash
curl https://api.z.ai/api/paas/v4/chat/completions \
  -H "Authorization: Bearer <apiKey>.<secretKey>" \
  -H "Content-Type: application/json" \
  -d '{"model":"glm-4.5-flash","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

Bir anahtar, konsolun **`<apiKey>.<secretKey>`** çiftidir — nokta ile birleştirilen her iki yarı da `Authorization: Bearer` başlığına gider (tek başına `apiKey` yeterli değildir).

## 🛠 Hızlı başlangıç

```bash
cd z-ai-bulk-apikey

# 0) a session to mint from — see "Where the session comes from" below

# 1) optional: your exit pool, one per line
printf 'http://host:port\n' > proxies.txt

# 2) mint 3 keys through the OAuth tail, each gated by a live chat call
node src/cli.js --jwt-file session-jwt.txt --count 3

# or, if you already ran the OAuth exchange:
node src/cli.js --access-token <zcode-access-token> --count 1

# any time afterwards
node src/cli.js --verify-only     # re-test every key in keys.txt
node src/launcher.js              # interactive menu (mint / verify / screen / 9Router)
```

### Oturum nereden gelir

**Kayıt başlangıcı captcha'ya bağlıdır ve burada otomatikleştirilmemiştir**. `chat.z.ai` üzerinde kaydolmak, bir Aliyun 2.0 INPAINTING kaydırıcısını geçmek anlamına gelir ve SDK başarı geri çağrısı headless olarak tetiklenmez — SPA hiçbir zaman `POST /auths/signup` göndermez, dolayısıyla o bacaktan ne hesap ne de anahtar çıkar (ölçüldü 2026-10-22; bkz. *Doğrulandı*). Bu nedenle araç, zaten sahip olduğunuz bir oturumdan başlar ve hangi adımın tarayıcı gerektirdiğini tam olarak söyler:

1. bir tarayıcıda `https://chat.z.ai` üzerinde kaydolun (kaydırıcıyı çözün); e-posta bir `verify-…` belirteci taşır
2. `POST https://chat.z.ai/api/v1/auths/verify_email` `{username,email,token}`
3. `POST https://chat.z.ai/api/v1/auths/finish_signup` `{username,email,token,password,profile_image_url:"/user.png",sso_redirect:""}` → `user.token` **oturum JWT**'sidir
4. bu JWT'yi CLI'ye verin: `node src/cli.js --jwt-file session-jwt.txt --count N` — geri kalanı (OAuth değişimi → konsol girişi → proje → anahtarlar → sohbet kapısı) headless çalışır.

### 🖱️ Başlatıcı

Başlatıcı proxy listesini, sayıyı ve doğrulama modelini sorar, bunları `launcher.config.json` içinde hatırlar ve CLI'yi doğru bayraklarla çalıştırır — ayrıca 9Router ve OmniRoute bağlayıcılarını.

## ✅ Doğrulandı — her anahtar test edilir

| Kontrol | Sonuç |
| --- | --- |
| Bir konsol anahtarıyla `POST /api/paas/v4/chat/completions` | **200** — `glm-4.5-flash`, gerçek içerik |
| `keys.txt` içinden üç anahtar | üçü de `glm-4.5-flash` ile chat-200, tek bir hesap/org üzerinde üretildi (paylaşılan kota) |
| `POST api.z.ai/api/auth/z/login {token}` | **200** — iş belirteci |
| `GET /api/biz/customer/getCustomerInfo` | **200** — `data.organizations[].projects[].projectId` |
| `POST …/projects/{pid}/api_keys` ardından `GET …/api_keys/copy/{apiKey}` | **200** — `"<apiKey>.<secretKey>"` |
| OAuth kuyruğu (`zcode` init → `chat.z.ai/api/oauth/authorize` → callback → poll) | Bir oturum JWT'si ile **200**; authorize çağrısı **form-urlencoded** alır (JSON gövdesi → 422), akış penceresi ~8 dk |
| Kayıt başlangıcı (`chat.z.ai`, Aliyun INPAINTING kaydırıcısı) | **headless başarısız** — SDK başarı geri çağrısı hiç tetiklenmez, `/auths/signup` hiç gönderilmez (2 sürükleme denemesi, Aliyun `F008`, `signupBody=null`) |

> **Kalite kapıları.** Buradaki her anahtar, `keys.txt` dosyasına yazılmadan önce canlı bir `chat-200` geçti
> (ölü anahtarlar asla gönderilmez). Yönlendirici kombinasyonları model düzeyinde aynı kuralı izler: bir giriş
> **yalnızca model `chat-200` yanıtlıyorsa ve araçları çağırabiliyorsa** eklenir — araç desteği olmayan bir model,
> ölü bir anahtar veya ölü bir sağlayıcı eklenmek yerine çıkarılır. Doğrulama adımını istediğiniz zaman yeniden çalıştırın;
> başarısızlıklar bildirilir, asla gizlenmez.

> **Kalite kapıları.** Buradaki her anahtar, `keys.txt` dosyasına yazılmadan önce canlı bir `chat-200` geçti
> (ölü anahtarlar asla gönderilmez). Yönlendirici kombinasyonları model düzeyinde aynı kuralı izler: bir giriş
> **yalnızca model `chat-200` yanıtlıyorsa ve araçları çağırabiliyorsa** eklenir — araç desteği olmayan bir model,
> ölü bir anahtar veya ölü bir sağlayıcı eklenmek yerine çıkarılır. Doğrulama adımını istediğiniz zaman yeniden çalıştırın;
> başarısızlıklar bildirilir, asla gizlenmez.

## 🧭 Nasıl çalışır

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Z.AI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.z.ai/api/paas/v4/chat/completions → real content = the key is live
```

| Adım | Çağrı | Notlar |
| --- | --- | --- |
| kayıt başlangıcı | `chat.z.ai` sayfası | **yalnızca insan/tarayıcı** — Aliyun 2.0 INPAINTING kaydırıcısı; SDK başarı geri çağrısı headless olarak hiç tetiklenmez |
| e-posta doğrulama | `POST /api/v1/auths/verify_email {username,email,token}` | `finish_signup` öncesinde; yeniden gönderim eski belirteci geçersiz kılar |
| oturum | `POST /api/v1/auths/finish_signup {…}` | `user.token` döndürür — oturum JWT'si (`--jwt-file`) |
| oauth | `POST zcode.z.ai/api/v1/oauth/cli/init` → `POST chat.z.ai/api/oauth/authorize` (**form-urlencoded**, `action=approve`) → CLI callback → `GET …/cli/poll/{flow}` | `data.zai.access_token`, ~8 dk pencere (`--access-token` bunu atlar) |
| giriş | `POST api.z.ai/api/auth/z/login {token}` | → iş belirteci |
| kimlikler | `GET /api/biz/customer/getCustomerInfo` | `organizations[].projects[].projectId` |
| anahtar | `POST /api/biz/v1/organization/{oid}/projects/{pid}/api_keys` → `GET …/api_keys/copy/{apiKey}` | → `<apiKey>.<secretKey>` |
| kapı | `POST /api/paas/v4/chat/completions` | içerikle `glm-4.5-flash` 200 = anahtar `keys.txt` dosyasına yazılır |

## ⚙️ CLI seçenekleri

```bash
node src/cli.js --jwt-file session-jwt.txt --count N   # OAuth tail → mint N keys
node src/cli.js --access-token <zcode-token> --count N   # skip OAuth, mint from a token
node src/cli.js --verify-only                            # re-test every key in keys.txt
node src/cli.js --screen                                 # probe the pool exits against api.z.ai
node src/cli.js --help
```

| Bayrak | Anlamı |
| --- | --- |
| `--count N` | hesabın projesinde oluşturulacak anahtar sayısı (varsayılan `1`) |
| `--jwt-file <f>` | `chat.z.ai` **oturum JWT**'si; CLI bununla zcode OAuth değişimini çalıştırır |
| `--access-token <t>` | OAuth adımı zaten tamamlandıysa bir **zcode erişim belirteci** |
| `--verify-only` | `keys.txt` dosyasının her satırını `--model` ile sohbet testinden geçirir, hiçbir şey yazmaz |
| `--screen` | her havuz çıkışını `api.z.ai:443` adresine karşı yoklar |
| `--pool <f>` | çıkış listesi, satır başına bir `http://host:port` (ortam değişkeni `ZAI_PROXIES`) |
| `--model <m>` | canlı kapı için model (varsayılan `glm-4.5-flash` — ücretsiz katman modeli) |

| Ortam değişkeni | Varsayılan | Anlamı |
| --- | --- | --- |
| `ZAI_PROXIES` | `proxies.txt` | isteğe bağlı çıkış havuzu, satır başına bir proxy |
| `ZAI_MODEL` | `glm-4.5-flash` | canlı kapı için kullanılan model |

`keys.txt` **geçerli çalışma dizininden** okunur; bir oturum olmadan (`--jwt-file`/`--access-token`) araç, ihtiyaç duyduğu tam insan adımını yazdırır ve rol yapmak yerine sıfırdan farklı bir kodla çıkar.

## 🛰️ Proxy arkasında

**İsteğe bağlı — ölçekte önerilir (IP başına kayıt sınırları ve yasaklar).** Araç proxy olmadan da çalışır.

- **Havuzla:** `--pool <file>` geçin (veya `ZAI_PROXIES` ayarlayın) ve istekler o listeden bir çıkıştan ayrılır (`http://host:port`, `socks5://host:port`, `host:port`, `user:pass@host:port`). Ölü bir satır o denemeyi başarısız kılar; liste `--screen` ile taranır.
- **Havuz olmadan:** CLI `running WITHOUT a proxy (direct)` yazdırır ve doğrudan bağlanır — OAuth kuyruğu, anahtar oluşturma ve sohbet kapısı değişmez.
- Panel WARP'ı engeller ve kayıt başlangıcı ana makine başına yapışkandır: tüm akış boyunca oturum başına bir çıkış tutun, çalışma ortasında döndürmeyin.

## 📄 Dosyalar

| Yol | İçerik |
| --- | --- |
| `keys.txt` | satır başına bir canlı doğrulanmış `<apiKey>.<secretKey>` — git tarafından yok sayılır |
| `proxies.txt` | çıkışlarınız, satır başına bir tane — git tarafından yok sayılır |
| `launcher.config.json` | hatırlanan başlatıcı ayarları — git tarafından yok sayılır |

Başka hiçbir şey yazılmaz: CLI, bir oturumu, iş belirtecini veya OAuth yoklama belirtecini asla diske kaydetmez.

## 🔌 9Router'a bağlanma

[9Router](https://9router.com) kendi barındırdığınız, OpenAI uyumlu bir yönlendiricidir. Bu sağlayıcıyı bir kez kaydedin ve `keys.txt` içindeki her anahtar tek bir sağlayıcı düğümü altında bir bağlantı haline gelir:

```bash
node src/connect-9router.js
```

Varsayılanlar: `--base http://localhost:20128`, `--password 123456`, `--name "

## 🔌 OmniRoute'a bağlanma

[OmniRoute](https://omniroute.online) kendi barındırdığınız, OpenAI uyumlu bir yönlendiricidir. Bu sağlayıcıyı bir kez kaydedin ve `keys.txt` içindeki her anahtar tek bir sağlayıcı düğümü altında bir bağlantı haline gelir:

```bash
node src/connect-omniroute.js
```

Varsayılanlar: `--base http://localhost:20128`, `--password 123456`, `--name "

Z.AI"`, `--prefix zai`, `--base-url https://api.z.ai/api/paas/v4`, `--model glm-4.5-flash`. Modeller `zai/<model id>` olarak sunulur ve her anahtar arasında yük dengelenir.

## 🔑 Bir anahtar size ne kazandırır

| | |
| --- | --- |
| 🏢 Sağlayıcı | **Z.AI** — [z.ai](https://z.ai) |
| 🎁 Sağlayıcının verdikleri | GLM ücretsiz katmanı — zcode OAuth kuyruğu üzerinden oluşturulan anahtarlar, her biri sohbet doğrulamalı |
| 🔑 Bir anahtar size ne kazandırır | kendi hesabına kapsamlanmış bir API anahtarı: aşağıdaki uç noktada 1 model kimliği, planınızın sınırlarında. Kota **hesapta** yaşar, bu aracın anahtar başına bir hesap oluşturmasının nedeni tam da budur |
| 🌐 API şekli | OpenAI uyumlu: `POST https://api.z.ai/api/paas/v4/chat/completions` |
| 🔒 Verileriniz | yalnızca z.ai ve yapılandırdığınız gelen kutusu arka ucuna bağlanılır; anahtarlar makinenizde kalır |

## 🐞 Sorunlar

Z.AI konsol uç noktalarını, OAuth şeklini veya ücretsiz katman model listesini değiştirirse, araç o adımda durur ve gördüğü durumu ve gövdeyi yazdırır. Komut ve tam çıktıyla birlikte **[bir sorun açın](../../issues)**; PR'lar memnuniyetle karşılanır.

## 📄 Lisans

MIT © 2026 — bkz. [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 z-ai-bulk-apikey katkıda bulunanlar

</div>