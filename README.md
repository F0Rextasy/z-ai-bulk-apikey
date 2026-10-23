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

**Bulk-create Z.AI (GLM) API keys — OpenAI-compatible inference from api.z.ai, plus a 9Router connector.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-1%20served-412991?style=for-the-badge)](https://z.ai)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Quick start](#-quick-start) · [🎁 Free tier](#-free-tier--how-much-you-get) · [🤖 Models](#-models--all-1-of-them) · [🧪 Use the API](#-how-to-use-the-api) · [✅ Verified](#-verified-working--every-key-is-tested) · [🧭 How it works](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Options](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Issues](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Why this exists

Z.AI serves the GLM family over an **OpenAI-compatible** endpoint at `https://api.z.ai/api/paas/v4`, and the free tier is real: `glm-4.5-flash` answers a live chat call with a key taken straight off a console project (measured — see *Verified*). The interesting part is the key that costs nothing to make: a Z.AI console project hands out **any number of keys** (`POST …/projects/{pid}/api_keys`), and each one is proven with a chat-200 before it lands in `keys.txt`. The unit that scales is **one account (one session) per key fleet**: every key on one project draws the same quota, so separate quotas mean separate accounts — which is why the tool takes a session per run rather than minting keys from nothing.

## 🎁 Free tier — how much you get

| What | Value |
| --- | --- |
| Free model | **`glm-4.5-flash`** — the only class the free tier answers |
| Priced models | `glm-4.6`, `glm-4.5`, `glm-5.3` → `429 {"error":{"code":"1113","message":"Insufficient balance or no resource package"}}` (measured 2026-10-21) |
| Unknown model | `glm-4.6-flash` → `400` unknown model |
| Card required | **No** for the flash tier |
| Rate limit | none observed — 12 back-to-back calls in 27.5 s all returned 200 |
| Keys per account | any number on the same project; they **share the account's quota** |

> The free tier is set by Z.AI and can change. Check the live numbers at [z.ai](https://z.ai) — and let the tool's own gate decide: `node src/cli.js --verify-only` re-tests every key in `keys.txt` with a real `glm-4.5-flash` call.

> 💡 The free tier is set by Z.AI and can change. Check the live numbers at [z.ai](https://z.ai) — and let the tool's own gate decide:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Models — all 1 of them

**One id is verified live on the free tier**: `glm-4.5-flash` — the default gate model for every key this tool writes (and therefore the only one it registers with the router).

| Model ID | Status on a free-tier key |
| --- | --- |
| `glm-4.5-flash` | **200** with real content — the tool's gate |
| `glm-4.6`, `glm-4.5`, `glm-5.3` | `429` — `Insufficient balance or no resource package` |
| `glm-4.6-flash` | `400` — unknown model |

The endpoint is OpenAI-compatible (`GET /api/paas/v4/models` and `POST /api/paas/v4/chat/completions`), so a key with balance reaches the rest of the catalogue with the same base URL.

## 🧪 How to use the API

The base URL is **`https://api.z.ai/api/paas/v4`** — OpenAI-compatible, so any OpenAI client works.

```bash
curl https://api.z.ai/api/paas/v4/chat/completions \
  -H "Authorization: Bearer <apiKey>.<secretKey>" \
  -H "Content-Type: application/json" \
  -d '{"model":"glm-4.5-flash","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

A key is the console's **`<apiKey>.<secretKey>`** pair — both halves, joined with a dot, go in the `Authorization: Bearer` header (the bare `apiKey` alone is not enough).

## 🛠 Quick start

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

### Where the session comes from

The **sign-up head is captcha-bound and is not automated here**. Signing up on `chat.z.ai` means passing an Aliyun 2.0 INPAINTING slider, and its SDK success callback does not fire headless — the SPA never sends `POST /auths/signup`, so no account and no key comes out of that leg (measured 2026-10-22; see *Verified*). The tool therefore starts from a session you already own, and says exactly which step needs a browser:

1. sign up on `https://chat.z.ai` in a browser (solve the slider); the mail carries a `verify-…` token
2. `POST https://chat.z.ai/api/v1/auths/verify_email` `{username,email,token}`
3. `POST https://chat.z.ai/api/v1/auths/finish_signup` `{username,email,token,password,profile_image_url:"/user.png",sso_redirect:""}` → `user.token` is the **session JWT**
4. hand that JWT to the CLI: `node src/cli.js --jwt-file session-jwt.txt --count N` — the rest (OAuth exchange → console login → project → keys → chat gate) runs headless.

### 🖱️ The launcher

The launcher asks for the proxy list, count and verification model, remembers them in `launcher.config.json`, and runs the CLI with the right flags — plus the 9Router and OmniRoute connectors.

## ✅ Verified working — every key is tested

| Check | Result |
| --- | --- |
| `POST /api/paas/v4/chat/completions` with a console key | **200** — `glm-4.5-flash`, real content |
| three keys from `keys.txt` | all three chat-200 with `glm-4.5-flash`, produced on one account/org (shared quota) |
| `POST api.z.ai/api/auth/z/login {token}` | **200** — business token |
| `GET /api/biz/customer/getCustomerInfo` | **200** — `data.organizations[].projects[].projectId` |
| `POST …/projects/{pid}/api_keys` then `GET …/api_keys/copy/{apiKey}` | **200** — `"<apiKey>.<secretKey>"` |
| OAuth tail (`zcode` init → `chat.z.ai/api/oauth/authorize` → callback → poll) | **200** with a session JWT; the authorize call takes **form-urlencoded** (JSON body → 422), the flow window is ~8 min |
| sign-up head (`chat.z.ai`, Aliyun INPAINTING slider) | **fails headless** — SDK success callback never fires, `/auths/signup` is never sent (2 drag attempts, Aliyun `F008`, `signupBody=null`) |

> **Quality gates.** Every key here passed a live `chat-200` before it was written to `keys.txt`
> (dead keys are never shipped). Router combos follow the same rule at the model level: an entry is
> added **only if the model answers `chat-200` and can call tools** — a model without tool support,
> a dead key or a dead provider is dropped instead of added. Re-run the verify step any time;
> failures are reported, never hidden.

> **Quality gates.** Every key here passed a live `chat-200` before it was written to `keys.txt`
> (dead keys are never shipped). Router combos follow the same rule at the model level: an entry is
> added **only if the model answers `chat-200` and can call tools** — a model without tool support,
> a dead key or a dead provider is dropped instead of added. Re-run the verify step any time;
> failures are reported, never hidden.

## 🧭 How it works

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Z.AI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.z.ai/api/paas/v4/chat/completions → real content = the key is live
```

| Step | Call | Notes |
| --- | --- | --- |
| sign-up head | `chat.z.ai` page | **human/browser only** — Aliyun 2.0 INPAINTING slider; the SDK success callback never fires headless |
| mail verify | `POST /api/v1/auths/verify_email {username,email,token}` | before `finish_signup`; a resend invalidates the old token |
| session | `POST /api/v1/auths/finish_signup {…}` | returns `user.token` — the session JWT (`--jwt-file`) |
| oauth | `POST zcode.z.ai/api/v1/oauth/cli/init` → `POST chat.z.ai/api/oauth/authorize` (**form-urlencoded**, `action=approve`) → CLI callback → `GET …/cli/poll/{flow}` | `data.zai.access_token`, ~8 min window (`--access-token` skips this) |
| login | `POST api.z.ai/api/auth/z/login {token}` | → business token |
| ids | `GET /api/biz/customer/getCustomerInfo` | `organizations[].projects[].projectId` |
| key | `POST /api/biz/v1/organization/{oid}/projects/{pid}/api_keys` → `GET …/api_keys/copy/{apiKey}` | → `<apiKey>.<secretKey>` |
| gate | `POST /api/paas/v4/chat/completions` | `glm-4.5-flash` 200 with content = the key is written to `keys.txt` |

## ⚙️ CLI options

```bash
node src/cli.js --jwt-file session-jwt.txt --count N   # OAuth tail → mint N keys
node src/cli.js --access-token <zcode-token> --count N   # skip OAuth, mint from a token
node src/cli.js --verify-only                            # re-test every key in keys.txt
node src/cli.js --screen                                 # probe the pool exits against api.z.ai
node src/cli.js --help
```

| Flag | Meaning |
| --- | --- |
| `--count N` | keys to mint on the account's project (default `1`) |
| `--jwt-file <f>` | `chat.z.ai` **session JWT**; the CLI runs the zcode OAuth exchange with it |
| `--access-token <t>` | a **zcode access token**, when the OAuth step is already done |
| `--verify-only` | chat-test every line of `keys.txt` with `--model`, write nothing |
| `--screen` | probe each pool exit against `api.z.ai:443` |
| `--pool <f>` | exit list, one `http://host:port` per line (env `ZAI_PROXIES`) |
| `--model <m>` | model for the live gate (default `glm-4.5-flash` — the free-tier model) |

| Environment variable | Default | Meaning |
| --- | --- | --- |
| `ZAI_PROXIES` | `proxies.txt` | optional exit pool, one proxy per line |
| `ZAI_MODEL` | `glm-4.5-flash` | model used for the live gate |

`keys.txt` is read from the **current working directory**; without a session (`--jwt-file`/`--access-token`) the tool prints the exact human step it needs and exits non-zero rather than pretending.

## 🛰️ Behind a proxy

**Optional — recommended at scale (per-IP sign-up limits and bans).** The tool works without a proxy too.

- **With a pool:** pass `--pool <file>` (or set `ZAI_PROXIES`) and the requests leave through an exit from that list (`http://host:port`, `socks5://host:port`, `host:port`, `user:pass@host:port`). A dead line fails that attempt; the list is screened with `--screen`.
- **Without a pool:** the CLI prints `running WITHOUT a proxy (direct)` and connects directly — the OAuth tail, the key mint and the chat gate are unchanged.
- The panel blocks WARP, and the sign-up head is sticky per host: keep one exit per session for the whole flow rather than rotating mid-run.

## 📄 Files

| Path | Contents |
| --- | --- |
| `keys.txt` | one live-verified `<apiKey>.<secretKey>` per line — git-ignored |
| `proxies.txt` | your exits, one per line — git-ignored |
| `launcher.config.json` | remembered launcher settings — git-ignored |

Nothing else is written: the CLI never stores a session, a business token or an OAuth poll token on disk.

## 🔌 Connect to 9Router

[9Router](https://9router.com) is a self-hosted, OpenAI-compatible router. Register this provider once and every key in `keys.txt` becomes a connection under one provider-node:

```bash
node src/connect-9router.js
```

Defaults: `--base http://localhost:20128`, `--password 123456`, `--name "

## 🔌 Connect to OmniRoute

[OmniRoute](https://omniroute.online) is a self-hosted, OpenAI-compatible router. Register this provider once and every key in `keys.txt` becomes a connection under one provider-node:

```bash
node src/connect-omniroute.js
```

Defaults: `--base http://localhost:20128`, `--password 123456`, `--name "

Z.AI"`, `--prefix zai`, `--base-url https://api.z.ai/api/paas/v4`, `--model glm-4.5-flash`. Models are served as `zai/<model id>` and load-balanced across every key.

## 🔑 What one key gets you

| | |
| --- | --- |
| 🏢 Provider | **Z.AI** — [z.ai](https://z.ai) |
| 🎁 What the provider gives | GLM free tier — keys minted through the zcode OAuth tail, every one chat-verified |
| 🔑 What one key gets you | one API key scoped to its own account: the 1 model ids on the endpoint below, at your plan's limits. The quota lives on the **account**, which is exactly why this tool creates one account per key |
| 🌐 API shape | OpenAI-compatible: `POST https://api.z.ai/api/paas/v4/chat/completions` |
| 🔒 Your data | only z.ai and the inbox backend you configure are contacted; keys stay on your machine |

## 🐞 Issues

If Z.AI changes the console endpoints, the OAuth shape or the free-tier model list, the tool stops at that step and prints the status and body it saw. **[Open an issue](../../issues)** with the command and the exact output; PRs are welcome.

## 📄 License

MIT © 2026 — see [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 z-ai-bulk-apikey contributors

</div>
