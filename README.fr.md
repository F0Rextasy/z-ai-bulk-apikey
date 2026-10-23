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

**Créer en masse des clés API Z.AI (GLM) — inférence compatible OpenAI depuis api.z.ai, plus un connecteur 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-1%20served-412991?style=for-the-badge)](https://z.ai)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Démarrage rapide](#-quick-start) · [🎁 Offre gratuite](#-free-tier--how-much-you-get) · [🤖 Modèles](#-models--all-1-of-them) · [🧪 Utiliser l'API](#-how-to-use-the-api) · [✅ Vérifié](#-verified-working--every-key-is-tested) · [🧭 Comment ça marche](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Options](#️-cli-options) · [🛰️ Proxys](#️-behind-a-proxy) · [🐞 Problèmes](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Pourquoi ce projet existe

Z.AI sert la famille GLM via un point de terminaison **compatible OpenAI** à l'adresse `https://api.z.ai/api/paas/v4`, et l'offre gratuite est bien réelle : `glm-4.5-flash` répond à un appel de chat en direct avec une clé prise directement sur un projet de la console (mesuré — voir *Vérifié*). Le point intéressant, c'est la clé qui ne coûte rien à créer : un projet de la console Z.AI distribue **autant de clés que voulu** (`POST …/projects/{pid}/api_keys`), et chacune est prouvée par un chat-200 avant d'atterrir dans `keys.txt`. L'unité qui se met à l'échelle est **un compte (une session) par flotte de clés** : toutes les clés d'un même projet puisent dans le même quota, donc des quotas distincts impliquent des comptes distincts — c'est pourquoi l'outil prend une session par exécution plutôt que de fabriquer des clés à partir de rien.

## 🎁 Offre gratuite — ce que vous obtenez

| Quoi | Valeur |
| --- | --- |
| Modèle gratuit | **`glm-4.5-flash`** — la seule classe à laquelle l'offre gratuite répond |
| Modèles payants | `glm-4.6`, `glm-4.5`, `glm-5.3` → `429 {"error":{"code":"1113","message":"Insufficient balance or no resource package"}}` (mesuré le 2026-10-21) |
| Modèle inconnu | `glm-4.6-flash` → `400` modèle inconnu |
| Carte requise | **Non** pour l'offre flash |
| Limite de débit | aucune observée — 12 appels consécutifs en 27,5 s ont tous renvoyé 200 |
| Clés par compte | autant que voulu sur le même projet ; elles **partagent le quota du compte** |

> L'offre gratuite est définie par Z.AI et peut changer. Vérifiez les chiffres en direct sur [z.ai](https://z.ai) — et laissez le propre filtre de l'outil trancher : `node src/cli.js --verify-only` reteste chaque clé de `keys.txt` avec un véritable appel `glm-4.5-flash`.

> 💡 L'offre gratuite est définie par Z.AI et peut changer. Vérifiez les chiffres en direct sur [z.ai](https://z.ai) — et laissez le propre filtre de l'outil trancher :

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modèles — les 1 au complet

**Un seul identifiant est vérifié en direct sur l'offre gratuite** : `glm-4.5-flash` — le modèle de filtre par défaut pour chaque clé que cet outil écrit (et donc le seul qu'il enregistre auprès du routeur).

| ID du modèle | Statut sur une clé de l'offre gratuite |
| --- | --- |
| `glm-4.5-flash` | **200** avec du contenu réel — le filtre de l'outil |
| `glm-4.6`, `glm-4.5`, `glm-5.3` | `429` — `Insufficient balance or no resource package` |
| `glm-4.6-flash` | `400` — modèle inconnu |

Le point de terminaison est compatible OpenAI (`GET /api/paas/v4/models` et `POST /api/paas/v4/chat/completions`), donc une clé disposant de solde atteint le reste du catalogue avec la même URL de base.

## 🧪 Comment utiliser l'API

L'URL de base est **`https://api.z.ai/api/paas/v4`** — compatible OpenAI, donc n'importe quel client OpenAI fonctionne.

```bash
curl https://api.z.ai/api/paas/v4/chat/completions \
  -H "Authorization: Bearer <apiKey>.<secretKey>" \
  -H "Content-Type: application/json" \
  -d '{"model":"glm-4.5-flash","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

Une clé est la paire **`<apiKey>.<secretKey>`** de la console — les deux moitiés, jointes par un point, vont dans l'en-tête `Authorization: Bearer` (le simple `apiKey` seul ne suffit pas).

## 🛠 Démarrage rapide

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

### D'où vient la session

La **tête d'inscription est liée à un captcha et n'est pas automatisée ici**. S'inscrire sur `chat.z.ai` implique de passer un slider Aliyun 2.0 INPAINTING, et son callback de succès du SDK ne se déclenche pas en mode headless — la SPA n'envoie jamais `POST /auths/signup`, donc aucun compte et aucune clé ne sortent de cette étape (mesuré le 2026-10-22 ; voir *Vérifié*). L'outil part donc d'une session que vous possédez déjà, et indique précisément quelle étape nécessite un navigateur :

1. inscrivez-vous sur `https://chat.z.ai` dans un navigateur (résolvez le slider) ; le courriel contient un jeton `verify-…`
2. `POST https://chat.z.ai/api/v1/auths/verify_email` `{username,email,token}`
3. `POST https://chat.z.ai/api/v1/auths/finish_signup` `{username,email,token,password,profile_image_url:"/user.png",sso_redirect:""}` → `user.token` est le **JWT de session**
4. transmettez ce JWT au CLI : `node src/cli.js --jwt-file session-jwt.txt --count N` — le reste (échange OAuth → connexion console → projet → clés → filtre de chat) s'exécute en headless.

### 🖱️ Le lanceur

Le lanceur demande la liste de proxys, le nombre et le modèle de vérification, les mémorise dans `launcher.config.json`, et exécute le CLI avec les bons drapeaux — plus les connecteurs 9Router et OmniRoute.

## ✅ Vérifié fonctionnel — chaque clé est testée

| Vérification | Résultat |
| --- | --- |
| `POST /api/paas/v4/chat/completions` avec une clé de console | **200** — `glm-4.5-flash`, contenu réel |
| trois clés de `keys.txt` | les trois répondent chat-200 avec `glm-4.5-flash`, produites sur un seul compte/org (quota partagé) |
| `POST api.z.ai/api/auth/z/login {token}` | **200** — jeton business |
| `GET /api/biz/customer/getCustomerInfo` | **200** — `data.organizations[].projects[].projectId` |
| `POST …/projects/{pid}/api_keys` puis `GET …/api_keys/copy/{apiKey}` | **200** — `"<apiKey>.<secretKey>"` |
| Queue OAuth (`zcode` init → `chat.z.ai/api/oauth/authorize` → callback → poll) | **200** avec un JWT de session ; l'appel authorize prend du **form-urlencoded** (corps JSON → 422), la fenêtre du flux est d'environ 8 min |
| Tête d'inscription (`chat.z.ai`, slider Aliyun INPAINTING) | **échoue en headless** — le callback de succès du SDK ne se déclenche jamais, `/auths/signup` n'est jamais envoyé (2 tentatives de glissement, Aliyun `F008`, `signupBody=null`) |

> **Filtres de qualité.** Chaque clé ici a passé un `chat-200` en direct avant d'être écrite dans `keys.txt`
> (les clés mortes ne sont jamais livrées). Les combos du routeur suivent la même règle au niveau du modèle : une entrée est
> ajoutée **uniquement si le modèle répond `chat-200` et peut appeler des outils** — un modèle sans support des outils,
> une clé morte ou un fournisseur mort est écarté plutôt qu'ajouté. Relancez l'étape de vérification à tout moment ;
> les échecs sont signalés, jamais masqués.

> **Filtres de qualité.** Chaque clé ici a passé un `chat-200` en direct avant d'être écrite dans `keys.txt`
> (les clés mortes ne sont jamais livrées). Les combos du routeur suivent la même règle au niveau du modèle : une entrée est
> ajoutée **uniquement si le modèle répond `chat-200` et peut appeler des outils** — un modèle sans support des outils,
> une clé morte ou un fournisseur mort est écarté plutôt qu'ajouté. Relancez l'étape de vérification à tout moment ;
> les échecs sont signalés, jamais masqués.

## 🧭 Comment ça marche

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Z.AI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.z.ai/api/paas/v4/chat/completions → real content = the key is live
```

| Étape | Appel | Remarques |
| --- | --- | --- |
| tête d'inscription | page `chat.z.ai` | **humain/navigateur uniquement** — slider Aliyun 2.0 INPAINTING ; le callback de succès du SDK ne se déclenche jamais en headless |
| vérification du courriel | `POST /api/v1/auths/verify_email {username,email,token}` | avant `finish_signup` ; un renvoi invalide l'ancien jeton |
| session | `POST /api/v1/auths/finish_signup {…}` | renvoie `user.token` — le JWT de session (`--jwt-file`) |
| oauth | `POST zcode.z.ai/api/v1/oauth/cli/init` → `POST chat.z.ai/api/oauth/authorize` (**form-urlencoded**, `action=approve`) → callback CLI → `GET …/cli/poll/{flow}` | `data.zai.access_token`, fenêtre d'environ 8 min (`--access-token` saute cette étape) |
| connexion | `POST api.z.ai/api/auth/z/login {token}` | → jeton business |
| ids | `GET /api/biz/customer/getCustomerInfo` | `organizations[].projects[].projectId` |
| clé | `POST /api/biz/v1/organization/{oid}/projects/{pid}/api_keys` → `GET …/api_keys/copy/{apiKey}` | → `<apiKey>.<secretKey>` |
| filtre | `POST /api/paas/v4/chat/completions` | `glm-4.5-flash` 200 avec contenu = la clé est écrite dans `keys.txt` |

## ⚙️ Options du CLI

```bash
node src/cli.js --jwt-file session-jwt.txt --count N   # OAuth tail → mint N keys
node src/cli.js --access-token <zcode-token> --count N   # skip OAuth, mint from a token
node src/cli.js --verify-only                            # re-test every key in keys.txt
node src/cli.js --screen                                 # probe the pool exits against api.z.ai
node src/cli.js --help
```

| Drapeau | Signification |
| --- | --- |
| `--count N` | nombre de clés à créer sur le projet du compte (par défaut `1`) |
| `--jwt-file <f>` | **JWT de session** `chat.z.ai` ; le CLI effectue l'échange OAuth zcode avec |
| `--access-token <t>` | un **jeton d'accès zcode**, lorsque l'étape OAuth est déjà faite |
| `--verify-only` | teste en chat chaque ligne de `keys.txt` avec `--model`, n'écrit rien |
| `--screen` | teste chaque sortie du pool contre `api.z.ai:443` |
| `--pool <f>` | liste de sorties, une `http://host:port` par ligne (env `ZAI_PROXIES`) |
| `--model <m>` | modèle pour le filtre en direct (par défaut `glm-4.5-flash` — le modèle de l'offre gratuite) |

| Variable d'environnement | Défaut | Signification |
| --- | --- | --- |
| `ZAI_PROXIES` | `proxies.txt` | pool de sorties optionnel, un proxy par ligne |
| `ZAI_MODEL` | `glm-4.5-flash` | modèle utilisé pour le filtre en direct |

`keys.txt` est lu depuis le **répertoire de travail courant** ; sans session (`--jwt-file`/`--access-token`), l'outil affiche l'étape humaine exacte dont il a besoin et se termine avec un code non nul plutôt que de faire semblant.

## 🛰️ Derrière un proxy

**Optionnel — recommandé à grande échelle (limites et bannissements d'inscription par IP).** L'outil fonctionne aussi sans proxy.

- **Avec un pool :** passez `--pool <file>` (ou définissez `ZAI_PROXIES`) et les requêtes sortent par une sortie de cette liste (`http://host:port`, `socks5://host:port`, `host:port`, `user:pass@host:port`). Une ligne morte fait échouer cette tentative ; la liste est filtrée avec `--screen`.
- **Sans pool :** le CLI affiche `running WITHOUT a proxy (direct)` et se connecte directement — la queue OAuth, la création de clé et le filtre de chat sont inchangés.
- Le panneau bloque WARP, et la tête d'inscription est collante par hôte : gardez une sortie par session pour tout le flux plutôt que de tourner en cours d'exécution.

## 📄 Fichiers

| Chemin | Contenu |
| --- | --- |
| `keys.txt` | une `<apiKey>.<secretKey>` vérifiée en direct par ligne — ignoré par git |
| `proxies.txt` | vos sorties, une par ligne — ignoré par git |
| `launcher.config.json` | paramètres du lanceur mémorisés — ignoré par git |

Rien d'autre n'est écrit : le CLI ne stocke jamais une session, un jeton business ou un jeton de poll OAuth sur le disque.

## 🔌 Se connecter à 9Router

[9Router](https://9router.com) est un routeur auto-hébergé, compatible OpenAI. Enregistrez ce fournisseur une fois et chaque clé de `keys.txt` devient une connexion sous un même nœud fournisseur :

```bash
node src/connect-9router.js
```

Valeurs par défaut : `--base http://localhost:20128`, `--password 123456`, `--name "

## 🔌 Se connecter à OmniRoute

[OmniRoute](https://omniroute.online) est un routeur auto-hébergé, compatible OpenAI. Enregistrez ce fournisseur une fois et chaque clé de `keys.txt` devient une connexion sous un même nœud fournisseur :

```bash
node src/connect-omniroute.js
```

Valeurs par défaut : `--base http://localhost:20128`, `--password 123456`, `--name "

Z.AI"`, `--prefix zai`, `--base-url https://api.z.ai/api/paas/v4`, `--model glm-4.5-flash`. Les modèles sont servis sous `zai/<model id>` et répartis en charge sur chaque clé.

## 🔑 Ce qu'une clé vous apporte

| | |
| --- | --- |
| 🏢 Fournisseur | **Z.AI** — [z.ai](https://z.ai) |
| 🎁 Ce que le fournisseur offre | Offre gratuite GLM — clés créées via la queue OAuth zcode, chacune vérifiée en chat |
| 🔑 Ce qu'une clé vous apporte | une clé API limitée à son propre compte : les 1 identifiants de modèle sur le point de terminaison ci-dessous, aux limites de votre forfait. Le quota vit sur le **compte**, ce qui explique précisément pourquoi cet outil crée un compte par clé |
| 🌐 Forme de l'API | Compatible OpenAI : `POST https://api.z.ai/api/paas/v4/chat/completions` |
| 🔒 Vos données | seuls z.ai et le backend de boîte de réception que vous configurez sont contactés ; les clés restent sur votre machine |

## 🐞 Problèmes

Si Z.AI modifie les points de terminaison de la console, la forme de l'OAuth ou la liste des modèles de l'offre gratuite, l'outil s'arrête à cette étape et affiche le statut et le corps qu'il a vus. **[Ouvrez un ticket](../../issues)** avec la commande et la sortie exacte ; les PR sont bienvenues.

## 📄 Licence

MIT © 2026 — voir [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 z-ai-bulk-apikey contributors

</div>