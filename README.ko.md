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

**Z.AI(GLM) API 키 일괄 생성 — api.z.ai의 OpenAI 호환 추론, 그리고 9Router 커넥터.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-1%20served-412991?style=for-the-badge)](https://z.ai)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 빠른 시작](#-quick-start) · [🎁 무료 티어](#-free-tier--how-much-you-get) · [🤖 모델](#-models--all-1-of-them) · [🧪 API 사용하기](#-how-to-use-the-api) · [✅ 검증됨](#-verified-working--every-key-is-tested) · [🧭 작동 방식](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ 옵션](#️-cli-options) · [🛰️ 프록시](#️-behind-a-proxy) · [🐞 이슈](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ 왜 만들었나

Z.AI는 GLM 제품군을 `https://api.z.ai/api/paas/v4`의 **OpenAI 호환** 엔드포인트로 제공하며, 무료 티어는 실제로 존재합니다: `glm-4.5-flash`는 콘솔 프로젝트에서 바로 가져온 키로 실시간 채팅 호출에 응답합니다(측정됨 — *검증됨* 참조). 흥미로운 부분은 만드는 데 비용이 들지 않는 키입니다: Z.AI 콘솔 프로젝트는 **원하는 만큼의 키**를 발급하며(`POST …/projects/{pid}/api_keys`), 각 키는 `keys.txt`에 기록되기 전에 채팅-200으로 검증됩니다. 확장되는 단위는 **키 플릿당 하나의 계정(하나의 세션)**입니다: 하나의 프로젝트에 있는 모든 키는 동일한 할당량을 소비하므로, 별도의 할당량은 별도의 계정을 의미합니다 — 그래서 이 도구는 무에서 키를 만들어내는 대신 실행마다 하나의 세션을 받습니다.

## 🎁 무료 티어 — 얼마나 받을 수 있나

| 항목 | 값 |
| --- | --- |
| 무료 모델 | **`glm-4.5-flash`** — 무료 티어가 응답하는 유일한 클래스 |
| 유료 모델 | `glm-4.6`, `glm-4.5`, `glm-5.3` → `429 {"error":{"code":"1113","message":"Insufficient balance or no resource package"}}` (2026-10-21 측정) |
| 알 수 없는 모델 | `glm-4.6-flash` → `400` 알 수 없는 모델 |
| 카드 필요 여부 | flash 티어에는 **불필요** |
| 속도 제한 | 관측되지 않음 — 27.5초 동안 연속 12회 호출 모두 200 반환 |
| 계정당 키 수 | 동일 프로젝트에서 원하는 만큼; **계정의 할당량을 공유**함 |

> 무료 티어는 Z.AI가 정하며 변경될 수 있습니다. 실시간 수치는 [z.ai](https://z.ai)에서 확인하세요 — 그리고 도구 자체의 게이트가 판단하게 하세요: `node src/cli.js --verify-only`는 `keys.txt`의 모든 키를 실제 `glm-4.5-flash` 호출로 다시 테스트합니다.

> 💡 무료 티어는 Z.AI가 정하며 변경될 수 있습니다. 실시간 수치는 [z.ai](https://z.ai)에서 확인하세요 — 그리고 도구 자체의 게이트가 판단하게 하세요:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 모델 — 그 1개 전부

**무료 티어에서 실시간으로 검증된 id는 하나**: `glm-4.5-flash` — 이 도구가 기록하는 모든 키의 기본 게이트 모델입니다(따라서 라우터에 등록하는 유일한 모델이기도 합니다).

| 모델 ID | 무료 티어 키에서의 상태 |
| --- | --- |
| `glm-4.5-flash` | 실제 콘텐츠와 함께 **200** — 도구의 게이트 |
| `glm-4.6`, `glm-4.5`, `glm-5.3` | `429` — `Insufficient balance or no resource package` |
| `glm-4.6-flash` | `400` — 알 수 없는 모델 |

엔드포인트는 OpenAI 호환이므로(`GET /api/paas/v4/models` 및 `POST /api/paas/v4/chat/completions`), 잔액이 있는 키는 동일한 base URL로 나머지 카탈로그에 접근할 수 있습니다.

## 🧪 API 사용하기

base URL은 **`https://api.z.ai/api/paas/v4`**입니다 — OpenAI 호환이므로 어떤 OpenAI 클라이언트든 작동합니다.

```bash
curl https://api.z.ai/api/paas/v4/chat/completions \
  -H "Authorization: Bearer <apiKey>.<secretKey>" \
  -H "Content-Type: application/json" \
  -d '{"model":"glm-4.5-flash","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

키는 콘솔의 **`<apiKey>.<secretKey>`** 쌍입니다 — 두 부분 모두 점으로 연결하여 `Authorization: Bearer` 헤더에 넣습니다(맨 `apiKey`만으로는 충분하지 않습니다).

## 🛠 빠른 시작

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

### 세션은 어디서 오는가

**가입 헤드 부분은 캡차에 묶여 있으며 여기서 자동화되지 않습니다**. `chat.z.ai`에서 가입한다는 것은 Aliyun 2.0 INPAINTING 슬라이더를 통과하는 것을 의미하며, 그 SDK 성공 콜백은 헤드리스에서 발생하지 않습니다 — SPA는 결코 `POST /auths/signup`을 보내지 않으므로, 그 단계에서 계정도 키도 나오지 않습니다(2026-10-22 측정; *검증됨* 참조). 따라서 이 도구는 이미 소유한 세션에서 시작하며, 어느 단계에 브라우저가 필요한지 정확히 알려줍니다:

1. 브라우저에서 `https://chat.z.ai`에 가입합니다(슬라이더 해결); 메일에는 `verify-…` 토큰이 담겨 있습니다
2. `POST https://chat.z.ai/api/v1/auths/verify_email` `{username,email,token}`
3. `POST https://chat.z.ai/api/v1/auths/finish_signup` `{username,email,token,password,profile_image_url:"/user.png",sso_redirect:""}` → `user.token`이 **세션 JWT**입니다
4. 그 JWT를 CLI에 넘깁니다: `node src/cli.js --jwt-file session-jwt.txt --count N` — 나머지(OAuth 교환 → 콘솔 로그인 → 프로젝트 → 키 → 채팅 게이트)는 헤드리스로 실행됩니다.

### 🖱️ 런처

런처는 프록시 목록, 개수, 검증 모델을 묻고 이를 `launcher.config.json`에 기억하며, 올바른 플래그로 CLI를 실행합니다 — 9Router 및 OmniRoute 커넥터도 함께 제공합니다.

## ✅ 검증됨 — 모든 키가 테스트됨

| 검사 | 결과 |
| --- | --- |
| 콘솔 키로 `POST /api/paas/v4/chat/completions` | **200** — `glm-4.5-flash`, 실제 콘텐츠 |
| `keys.txt`의 키 세 개 | 세 개 모두 `glm-4.5-flash`로 채팅-200, 하나의 계정/조직에서 생성됨(할당량 공유) |
| `POST api.z.ai/api/auth/z/login {token}` | **200** — 비즈니스 토큰 |
| `GET /api/biz/customer/getCustomerInfo` | **200** — `data.organizations[].projects[].projectId` |
| `POST …/projects/{pid}/api_keys` 후 `GET …/api_keys/copy/{apiKey}` | **200** — `"<apiKey>.<secretKey>"` |
| OAuth 테일(`zcode` init → `chat.z.ai/api/oauth/authorize` → 콜백 → 폴링) | 세션 JWT와 함께 **200**; authorize 호출은 **form-urlencoded**를 받음(JSON 본문 → 422), 흐름 창은 약 8분 |
| 가입 헤드(`chat.z.ai`, Aliyun INPAINTING 슬라이더) | **헤드리스에서 실패** — SDK 성공 콜백이 결코 발생하지 않고, `/auths/signup`이 결코 전송되지 않음(드래그 2회 시도, Aliyun `F008`, `signupBody=null`) |

> **품질 게이트.** 여기의 모든 키는 `keys.txt`에 기록되기 전에 실시간 `chat-200`을 통과했습니다
> (죽은 키는 절대 배포되지 않습니다). 라우터 콤보도 모델 수준에서 동일한 규칙을 따릅니다: 항목은
> **모델이 `chat-200`으로 응답하고 도구를 호출할 수 있는 경우에만** 추가됩니다 — 도구 지원이 없는 모델,
> 죽은 키 또는 죽은 제공자는 추가되지 않고 제거됩니다. 검증 단계는 언제든 다시 실행하세요;
> 실패는 보고되며 결코 숨겨지지 않습니다.

> **품질 게이트.** 여기의 모든 키는 `keys.txt`에 기록되기 전에 실시간 `chat-200`을 통과했습니다
> (죽은 키는 절대 배포되지 않습니다). 라우터 콤보도 모델 수준에서 동일한 규칙을 따릅니다: 항목은
> **모델이 `chat-200`으로 응답하고 도구를 호출할 수 있는 경우에만** 추가됩니다 — 도구 지원이 없는 모델,
> 죽은 키 또는 죽은 제공자는 추가되지 않고 제거됩니다. 검증 단계는 언제든 다시 실행하세요;
> 실패는 보고되며 결코 숨겨지지 않습니다.

## 🧭 작동 방식

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Z.AI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.z.ai/api/paas/v4/chat/completions → real content = the key is live
```

| 단계 | 호출 | 비고 |
| --- | --- | --- |
| 가입 헤드 | `chat.z.ai` 페이지 | **사람/브라우저 전용** — Aliyun 2.0 INPAINTING 슬라이더; SDK 성공 콜백이 헤드리스에서 결코 발생하지 않음 |
| 메일 검증 | `POST /api/v1/auths/verify_email {username,email,token}` | `finish_signup` 이전; 재전송은 이전 토큰을 무효화함 |
| 세션 | `POST /api/v1/auths/finish_signup {…}` | `user.token` 반환 — 세션 JWT(`--jwt-file`) |
| oauth | `POST zcode.z.ai/api/v1/oauth/cli/init` → `POST chat.z.ai/api/oauth/authorize` (**form-urlencoded**, `action=approve`) → CLI 콜백 → `GET …/cli/poll/{flow}` | `data.zai.access_token`, 약 8분 창(`--access-token`은 이를 건너뜀) |
| 로그인 | `POST api.z.ai/api/auth/z/login {token}` | → 비즈니스 토큰 |
| ids | `GET /api/biz/customer/getCustomerInfo` | `organizations[].projects[].projectId` |
| 키 | `POST /api/biz/v1/organization/{oid}/projects/{pid}/api_keys` → `GET …/api_keys/copy/{apiKey}` | → `<apiKey>.<secretKey>` |
| 게이트 | `POST /api/paas/v4/chat/completions` | 콘텐츠와 함께 `glm-4.5-flash` 200 = 키가 `keys.txt`에 기록됨 |

## ⚙️ CLI 옵션

```bash
node src/cli.js --jwt-file session-jwt.txt --count N   # OAuth tail → mint N keys
node src/cli.js --access-token <zcode-token> --count N   # skip OAuth, mint from a token
node src/cli.js --verify-only                            # re-test every key in keys.txt
node src/cli.js --screen                                 # probe the pool exits against api.z.ai
node src/cli.js --help
```

| 플래그 | 의미 |
| --- | --- |
| `--count N` | 계정의 프로젝트에서 생성할 키 수(기본 `1`) |
| `--jwt-file <f>` | `chat.z.ai` **세션 JWT**; CLI가 이를 사용해 zcode OAuth 교환을 실행함 |
| `--access-token <t>` | OAuth 단계가 이미 완료된 경우의 **zcode 액세스 토큰** |
| `--verify-only` | `keys.txt`의 모든 줄을 `--model`로 채팅 테스트하고 아무것도 쓰지 않음 |
| `--screen` | 각 풀 출구를 `api.z.ai:443`에 대해 프로브함 |
| `--pool <f>` | 출구 목록, 줄당 하나의 `http://host:port`(환경 변수 `ZAI_PROXIES`) |
| `--model <m>` | 실시간 게이트용 모델(기본 `glm-4.5-flash` — 무료 티어 모델) |

| 환경 변수 | 기본값 | 의미 |
| --- | --- | --- |
| `ZAI_PROXIES` | `proxies.txt` | 선택적 출구 풀, 줄당 하나의 프록시 |
| `ZAI_MODEL` | `glm-4.5-flash` | 실시간 게이트에 사용되는 모델 |

`keys.txt`는 **현재 작업 디렉터리**에서 읽습니다; 세션(`--jwt-file`/`--access-token`)이 없으면 도구는 필요한 정확한 사람 단계를 출력하고 가장하지 않고 0이 아닌 값으로 종료합니다.

## 🛰️ 프록시 뒤에서

**선택 사항 — 대규모에서는 권장됨(IP당 가입 제한 및 차단).** 이 도구는 프록시 없이도 작동합니다.

- **풀이 있는 경우:** `--pool <file>`을 전달하거나(또는 `ZAI_PROXIES` 설정) 요청이 해당 목록의 출구를 통해 나갑니다(`http://host:port`, `socks5://host:port`, `host:port`, `user:pass@host:port`). 죽은 줄은 해당 시도를 실패시킵니다; 목록은 `--screen`으로 스크리닝됩니다.
- **풀이 없는 경우:** CLI는 `running WITHOUT a proxy (direct)`를 출력하고 직접 연결합니다 — OAuth 테일, 키 생성, 채팅 게이트는 변경되지 않습니다.
- 패널은 WARP를 차단하며, 가입 헤드는 호스트별로 고정됩니다: 실행 중간에 회전하기보다 전체 흐름 동안 세션당 하나의 출구를 유지하세요.

## 📄 파일

| 경로 | 내용 |
| --- | --- |
| `keys.txt` | 줄당 하나의 실시간 검증된 `<apiKey>.<secretKey>` — git 무시됨 |
| `proxies.txt` | 출구 목록, 줄당 하나 — git 무시됨 |
| `launcher.config.json` | 기억된 런처 설정 — git 무시됨 |

그 외에는 아무것도 기록되지 않습니다: CLI는 세션, 비즈니스 토큰 또는 OAuth 폴링 토큰을 디스크에 저장하지 않습니다.

## 🔌 9Router에 연결

[9Router](https://9router.com)는 자체 호스팅되는 OpenAI 호환 라우터입니다. 이 제공자를 한 번 등록하면 `keys.txt`의 모든 키가 하나의 제공자 노드 아래 연결이 됩니다:

```bash
node src/connect-9router.js
```

기본값: `--base http://localhost:20128`, `--password 123456`, `--name "

## 🔌 OmniRoute에 연결

[OmniRoute](https://omniroute.online)는 자체 호스팅되는 OpenAI 호환 라우터입니다. 이 제공자를 한 번 등록하면 `keys.txt`의 모든 키가 하나의 제공자 노드 아래 연결이 됩니다:

```bash
node src/connect-omniroute.js
```

기본값: `--base http://localhost:20128`, `--password 123456`, `--name "

Z.AI"`, `--prefix zai`, `--base-url https://api.z.ai/api/paas/v4`, `--model glm-4.5-flash`. 모델은 `zai/<model id>`로 제공되며 모든 키에 걸쳐 로드 밸런싱됩니다.

## 🔑 키 하나로 얻는 것

| | |
| --- | --- |
| 🏢 제공자 | **Z.AI** — [z.ai](https://z.ai) |
| 🎁 제공자가 주는 것 | GLM 무료 티어 — zcode OAuth 테일을 통해 생성된 키, 모두 채팅 검증됨 |
| 🔑 키 하나로 얻는 것 | 자체 계정에 범위가 지정된 하나의 API 키: 아래 엔드포인트의 1개 모델 id, 요금제 한도 내에서. 할당량은 **계정**에 있으므로, 이 도구가 키당 하나의 계정을 만드는 것입니다 |
| 🌐 API 형태 | OpenAI 호환: `POST https://api.z.ai/api/paas/v4/chat/completions` |
| 🔒 데이터 | z.ai와 구성한 inbox 백엔드만 접촉됩니다; 키는 사용자의 컴퓨터에 남습니다 |

## 🐞 이슈

Z.AI가 콘솔 엔드포인트, OAuth 형태 또는 무료 티어 모델 목록을 변경하면, 도구는 해당 단계에서 멈추고 본 상태와 본문을 출력합니다. 명령과 정확한 출력을 포함하여 **[이슈를 열어주세요](../../issues)**; PR을 환영합니다.

## 📄 라이선스

MIT © 2026 — [LICENSE](LICENSE) 참조.

<div align="center">

**[MIT](LICENSE)** © 2026 z-ai-bulk-apikey contributors

</div>