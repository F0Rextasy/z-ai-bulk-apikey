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

**Z.AI (GLM) API-Schlüssel in großen Mengen erstellen — OpenAI-kompatible Inferenz von api.z.ai, plus ein 9Router-Connector.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-1%20served-412991?style=for-the-badge)](https://z.ai)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Schnellstart](#-quick-start) · [🎁 Kostenlose Stufe](#-free-tier--how-much-you-get) · [🤖 Modelle](#-models--all-1-of-them) · [🧪 Die API verwenden](#-how-to-use-the-api) · [✅ Verifiziert](#-verified-working--every-key-is-tested) · [🧭 So funktioniert es](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Optionen](#️-cli-options) · [🛰️ Proxys](#️-behind-a-proxy) · [🐞 Probleme](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Warum es das gibt

Z.AI stellt die GLM-Familie über einen **OpenAI-kompatiblen** Endpunkt unter `https://api.z.ai/api/paas/v4` bereit, und die kostenlose Stufe ist echt: `glm-4.5-flash` beantwortet einen Live-Chat-Aufruf mit einem Schlüssel, der direkt aus einem Konsolenprojekt stammt (gemessen — siehe *Verifiziert*). Der interessante Teil ist der Schlüssel, dessen Erstellung nichts kostet: Ein Z.AI-Konsolenprojekt gibt **beliebig viele Schlüssel** aus (`POST …/projects/{pid}/api_keys`), und jeder wird mit einem Chat-200 bewiesen, bevor er in `keys.txt` landet. Die Einheit, die skaliert, ist **ein Konto (eine Sitzung) pro Schlüsselflotte**: Jeder Schlüssel in einem Projekt zieht dasselbe Kontingent, also bedeuten getrennte Kontingente getrennte Konten — deshalb nimmt das Tool eine Sitzung pro Lauf, statt Schlüssel aus dem Nichts zu prägen.

## 🎁 Kostenlose Stufe — wie viel du bekommst

| Was | Wert |
| --- | --- |
| Kostenloses Modell | **`glm-4.5-flash`** — die einzige Klasse, die die kostenlose Stufe beantwortet |
| Kostenpflichtige Modelle | `glm-4.6`, `glm-4.5`, `glm-5.3` → `429 {"error":{"code":"1113","message":"Insufficient balance or no resource package"}}` (gemessen 2026-10-21) |
| Unbekanntes Modell | `glm-4.6-flash` → `400` unbekanntes Modell |
| Karte erforderlich | **Nein** für die Flash-Stufe |
| Ratenlimit | keines beobachtet — 12 aufeinanderfolgende Aufrufe in 27,5 s lieferten alle 200 |
| Schlüssel pro Konto | beliebig viele im selben Projekt; sie **teilen sich das Kontingent des Kontos** |

> Die kostenlose Stufe wird von Z.AI festgelegt und kann sich ändern. Prüfe die aktuellen Zahlen auf [z.ai](https://z.ai) — und lass das eigene Gate des Tools entscheiden: `node src/cli.js --verify-only` testet jeden Schlüssel in `keys.txt` mit einem echten `glm-4.5-flash`-Aufruf erneut.

> 💡 Die kostenlose Stufe wird von Z.AI festgelegt und kann sich ändern. Prüfe die aktuellen Zahlen auf [z.ai](https://z.ai) — und lass das eigene Gate des Tools entscheiden:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelle — alle 1 davon

**Eine ID ist live in der kostenlosen Stufe verifiziert**: `glm-4.5-flash` — das Standard-Gate-Modell für jeden Schlüssel, den dieses Tool schreibt (und damit das einzige, das es beim Router registriert).

| Modell-ID | Status mit einem Schlüssel der kostenlosen Stufe |
| --- | --- |
| `glm-4.5-flash` | **200** mit echtem Inhalt — das Gate des Tools |
| `glm-4.6`, `glm-4.5`, `glm-5.3` | `429` — `Insufficient balance or no resource package` |
| `glm-4.6-flash` | `400` — unbekanntes Modell |

Der Endpunkt ist OpenAI-kompatibel (`GET /api/paas/v4/models` und `POST /api/paas/v4/chat/completions`), sodass ein Schlüssel mit Guthaben den Rest des Katalogs über dieselbe Basis-URL erreicht.

## 🧪 So verwendest du die API

Die Basis-URL ist **`https://api.z.ai/api/paas/v4`** — OpenAI-kompatibel, also funktioniert jeder OpenAI-Client.

```bash
curl https://api.z.ai/api/paas/v4/chat/completions \
  -H "Authorization: Bearer <apiKey>.<secretKey>" \
  -H "Content-Type: application/json" \
  -d '{"model":"glm-4.5-flash","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

Ein Schlüssel ist das **`<apiKey>.<secretKey>`**-Paar der Konsole — beide Hälften, mit einem Punkt verbunden, gehören in den `Authorization: Bearer`-Header (der bloße `apiKey` allein reicht nicht).

## 🛠 Schnellstart

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

### Woher die Sitzung kommt

Der **Registrierungs-Kopf ist captcha-gebunden und wird hier nicht automatisiert**. Sich auf `chat.z.ai` zu registrieren bedeutet, einen Aliyun 2.0 INPAINTING-Slider zu passieren, und dessen SDK-Erfolgs-Callback feuert nicht headless — die SPA sendet nie `POST /auths/signup`, also kommt aus diesem Teil weder ein Konto noch ein Schlüssel heraus (gemessen 2026-10-22; siehe *Verifiziert*). Das Tool startet daher von einer Sitzung, die du bereits besitzt, und sagt genau, welcher Schritt einen Browser benötigt:

1. registriere dich auf `https://chat.z.ai` in einem Browser (löse den Slider); die Mail enthält ein `verify-…`-Token
2. `POST https://chat.z.ai/api/v1/auths/verify_email` `{username,email,token}`
3. `POST https://chat.z.ai/api/v1/auths/finish_signup` `{username,email,token,password,profile_image_url:"/user.png",sso_redirect:""}` → `user.token` ist das **Sitzungs-JWT**
4. übergib dieses JWT an die CLI: `node src/cli.js --jwt-file session-jwt.txt --count N` — der Rest (OAuth-Austausch → Konsolen-Login → Projekt → Schlüssel → Chat-Gate) läuft headless.

### 🖱️ Der Launcher

Der Launcher fragt nach der Proxy-Liste, der Anzahl und dem Verifizierungsmodell, merkt sie sich in `launcher.config.json` und führt die CLI mit den richtigen Flags aus — plus die 9Router- und OmniRoute-Connectoren.

## ✅ Verifiziert funktionierend — jeder Schlüssel wird getestet

| Prüfung | Ergebnis |
| --- | --- |
| `POST /api/paas/v4/chat/completions` mit einem Konsolenschlüssel | **200** — `glm-4.5-flash`, echter Inhalt |
| drei Schlüssel aus `keys.txt` | alle drei Chat-200 mit `glm-4.5-flash`, erzeugt in einem Konto/einer Organisation (geteiltes Kontingent) |
| `POST api.z.ai/api/auth/z/login {token}` | **200** — Business-Token |
| `GET /api/biz/customer/getCustomerInfo` | **200** — `data.organizations[].projects[].projectId` |
| `POST …/projects/{pid}/api_keys` dann `GET …/api_keys/copy/{apiKey}` | **200** — `"<apiKey>.<secretKey>"` |
| OAuth-Tail (`zcode` init → `chat.z.ai/api/oauth/authorize` → Callback → Poll) | **200** mit einem Sitzungs-JWT; der Authorize-Aufruf erwartet **form-urlencoded** (JSON-Body → 422), das Flow-Fenster beträgt ~8 min |
| Registrierungs-Kopf (`chat.z.ai`, Aliyun INPAINTING-Slider) | **schlägt headless fehl** — SDK-Erfolgs-Callback feuert nie, `/auths/signup` wird nie gesendet (2 Drag-Versuche, Aliyun `F008`, `signupBody=null`) |

> **Qualitätsgates.** Jeder Schlüssel hier hat ein Live-`chat-200` bestanden, bevor er in `keys.txt`
> geschrieben wurde (tote Schlüssel werden nie ausgeliefert). Router-Kombinationen folgen derselben
> Regel auf Modellebene: Ein Eintrag wird **nur hinzugefügt, wenn das Modell `chat-200` antwortet und
> Tools aufrufen kann** — ein Modell ohne Tool-Unterstützung, ein toter Schlüssel oder ein toter
> Anbieter wird verworfen statt hinzugefügt. Führe den Verifizierungsschritt jederzeit erneut aus;
> Fehler werden gemeldet, nie verborgen.

> **Qualitätsgates.** Jeder Schlüssel hier hat ein Live-`chat-200` bestanden, bevor er in `keys.txt`
> geschrieben wurde (tote Schlüssel werden nie ausgeliefert). Router-Kombinationen folgen derselben
> Regel auf Modellebene: Ein Eintrag wird **nur hinzugefügt, wenn das Modell `chat-200` antwortet und
> Tools aufrufen kann** — ein Modell ohne Tool-Unterstützung, ein toter Schlüssel oder ein toter
> Anbieter wird verworfen statt hinzugefügt. Führe den Verifizierungsschritt jederzeit erneut aus;
> Fehler werden gemeldet, nie verborgen.

## 🧭 So funktioniert es

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Z.AI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.z.ai/api/paas/v4/chat/completions → real content = the key is live
```

| Schritt | Aufruf | Hinweise |
| --- | --- | --- |
| Registrierungs-Kopf | `chat.z.ai`-Seite | **nur Mensch/Browser** — Aliyun 2.0 INPAINTING-Slider; der SDK-Erfolgs-Callback feuert nie headless |
| Mail-Verifizierung | `POST /api/v1/auths/verify_email {username,email,token}` | vor `finish_signup`; ein erneutes Senden macht das alte Token ungültig |
| Sitzung | `POST /api/v1/auths/finish_signup {…}` | liefert `user.token` — das Sitzungs-JWT (`--jwt-file`) |
| OAuth | `POST zcode.z.ai/api/v1/oauth/cli/init` → `POST chat.z.ai/api/oauth/authorize` (**form-urlencoded**, `action=approve`) → CLI-Callback → `GET …/cli/poll/{flow}` | `data.zai.access_token`, ~8-min-Fenster (`--access-token` überspringt dies) |
| Login | `POST api.z.ai/api/auth/z/login {token}` | → Business-Token |
| IDs | `GET /api/biz/customer/getCustomerInfo` | `organizations[].projects[].projectId` |
| Schlüssel | `POST /api/biz/v1/organization/{oid}/projects/{pid}/api_keys` → `GET …/api_keys/copy/{apiKey}` | → `<apiKey>.<secretKey>` |
| Gate | `POST /api/paas/v4/chat/completions` | `glm-4.5-flash` 200 mit Inhalt = der Schlüssel wird in `keys.txt` geschrieben |

## ⚙️ CLI-Optionen

```bash
node src/cli.js --jwt-file session-jwt.txt --count N   # OAuth tail → mint N keys
node src/cli.js --access-token <zcode-token> --count N   # skip OAuth, mint from a token
node src/cli.js --verify-only                            # re-test every key in keys.txt
node src/cli.js --screen                                 # probe the pool exits against api.z.ai
node src/cli.js --help
```

| Flag | Bedeutung |
| --- | --- |
| `--count N` | Anzahl der im Projekt des Kontos zu erzeugenden Schlüssel (Standard `1`) |
| `--jwt-file <f>` | **Sitzungs-JWT** von `chat.z.ai`; die CLI führt damit den zcode-OAuth-Austausch aus |
| `--access-token <t>` | ein **zcode-Zugriffstoken**, wenn der OAuth-Schritt bereits erledigt ist |
| `--verify-only` | testet jede Zeile von `keys.txt` per Chat mit `--model`, schreibt nichts |
| `--screen` | prüft jeden Pool-Ausgang gegen `api.z.ai:443` |
| `--pool <f>` | Ausgangsliste, ein `http://host:port` pro Zeile (Env `ZAI_PROXIES`) |
| `--model <m>` | Modell für das Live-Gate (Standard `glm-4.5-flash` — das Modell der kostenlosen Stufe) |

| Umgebungsvariable | Standard | Bedeutung |
| --- | --- | --- |
| `ZAI_PROXIES` | `proxies.txt` | optionaler Ausgangspool, ein Proxy pro Zeile |
| `ZAI_MODEL` | `glm-4.5-flash` | Modell, das für das Live-Gate verwendet wird |

`keys.txt` wird aus dem **aktuellen Arbeitsverzeichnis** gelesen; ohne Sitzung (`--jwt-file`/`--access-token`) gibt das Tool den genauen menschlichen Schritt aus, den es benötigt, und beendet sich mit einem Fehlercode, statt etwas vorzutäuschen.

## 🛰️ Hinter einem Proxy

**Optional — bei Skalierung empfohlen (Registrierungslimits und Sperren pro IP).** Das Tool funktioniert auch ohne Proxy.

- **Mit einem Pool:** übergib `--pool <file>` (oder setze `ZAI_PROXIES`), und die Anfragen verlassen das System über einen Ausgang aus dieser Liste (`http://host:port`, `socks5://host:port`, `host:port`, `user:pass@host:port`). Eine tote Leitung lässt diesen Versuch fehlschlagen; die Liste wird mit `--screen` geprüft.
- **Ohne Pool:** die CLI gibt `running WITHOUT a proxy (direct)` aus und verbindet direkt — der OAuth-Tail, die Schlüsselerzeugung und das Chat-Gate bleiben unverändert.
- Das Panel blockiert WARP, und der Registrierungs-Kopf ist pro Host sticky: Behalte einen Ausgang pro Sitzung für den gesamten Ablauf, statt mitten im Lauf zu rotieren.

## 📄 Dateien

| Pfad | Inhalt |
| --- | --- |
| `keys.txt` | ein live-verifizierter `<apiKey>.<secretKey>` pro Zeile — von Git ignoriert |
| `proxies.txt` | deine Ausgänge, einer pro Zeile — von Git ignoriert |
| `launcher.config.json` | gemerkte Launcher-Einstellungen — von Git ignoriert |

Nichts anderes wird geschrieben: Die CLI speichert niemals eine Sitzung, ein Business-Token oder ein OAuth-Poll-Token auf der Festplatte.

## 🔌 Mit 9Router verbinden

[9Router](https://9router.com) ist ein selbst gehosteter, OpenAI-kompatibler Router. Registriere diesen Anbieter einmal, und jeder Schlüssel in `keys.txt` wird zu einer Verbindung unter einem Anbieter-Knoten:

```bash
node src/connect-9router.js
```

Standardwerte: `--base http://localhost:20128`, `--password 123456`, `--name "

## 🔌 Mit OmniRoute verbinden

[OmniRoute](https://omniroute.online) ist ein selbst gehosteter, OpenAI-kompatibler Router. Registriere diesen Anbieter einmal, und jeder Schlüssel in `keys.txt` wird zu einer Verbindung unter einem Anbieter-Knoten:

```bash
node src/connect-omniroute.js
```

Standardwerte: `--base http://localhost:20128`, `--password 123456`, `--name "

Z.AI"`, `--prefix zai`, `--base-url https://api.z.ai/api/paas/v4`, `--model glm-4.5-flash`. Modelle werden als `zai/<model id>` bereitgestellt und über alle Schlüssel lastverteilt.

## 🔑 Was ein Schlüssel dir bringt

| | |
| --- | --- |
| 🏢 Anbieter | **Z.AI** — [z.ai](https://z.ai) |
| 🎁 Was der Anbieter gibt | GLM kostenlose Stufe — Schlüssel, die über den zcode-OAuth-Tail erzeugt und jeder einzeln per Chat verifiziert werden |
| 🔑 Was ein Schlüssel dir bringt | ein API-Schlüssel, der auf sein eigenes Konto beschränkt ist: die 1 Modell-IDs am unten stehenden Endpunkt, im Rahmen der Limits deines Tarifs. Das Kontingent liegt beim **Konto**, weshalb dieses Tool genau ein Konto pro Schlüssel erstellt |
| 🌐 API-Form | OpenAI-kompatibel: `POST https://api.z.ai/api/paas/v4/chat/completions` |
| 🔒 Deine Daten | nur z.ai und das von dir konfigurierte Inbox-Backend werden kontaktiert; Schlüssel bleiben auf deinem Rechner |

## 🐞 Probleme

Wenn Z.AI die Konsolen-Endpunkte, die OAuth-Form oder die Modellliste der kostenlosen Stufe ändert, stoppt das Tool an diesem Schritt und gibt den Status und Body aus, den es gesehen hat. **[Öffne ein Issue](../../issues)** mit dem Befehl und der exakten Ausgabe; PRs sind willkommen.

## 📄 Lizenz

MIT © 2026 — siehe [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 z-ai-bulk-apikey contributors

</div>