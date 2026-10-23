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

**批量创建 Z.AI (GLM) API 密钥 — 通过 api.z.ai 提供 OpenAI 兼容推理，并附带一个 9Router 连接器。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-1%20served-412991?style=for-the-badge)](https://z.ai)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 快速开始](#-quick-start) · [🎁 免费额度](#-free-tier--how-much-you-get) · [🤖 模型](#-models--all-1-of-them) · [🧪 使用 API](#-how-to-use-the-api) · [✅ 已验证](#-verified-working--every-key-is-tested) · [🧭 工作原理](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ 选项](#️-cli-options) · [🛰️ 代理](#️-behind-a-proxy) · [🐞 问题反馈](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ 为什么会有这个项目

Z.AI 通过位于 `https://api.z.ai/api/paas/v4` 的 **OpenAI 兼容**端点提供 GLM 系列模型，而且免费额度是真实存在的：`glm-4.5-flash` 可以用一个直接从控制台项目取出的密钥响应实时聊天调用（已实测——见*已验证*）。有趣的部分是那个零成本创建的密钥：一个 Z.AI 控制台项目可以发放**任意数量的密钥**（`POST …/projects/{pid}/api_keys`），而且每个密钥在写入 `keys.txt` 之前都要通过一次 chat-200 验证。可扩展的单位是**每个密钥集群一个账户（一个会话）**：同一个项目上的所有密钥共享同一配额，所以想要独立配额就需要独立账户——这就是为什么该工具每次运行需要一个会话，而不是凭空铸造密钥。

## 🎁 免费额度 — 你能获得多少

| 项目 | 值 |
| --- | --- |
| 免费模型 | **`glm-4.5-flash`** — 免费额度唯一会响应的类别 |
| 付费模型 | `glm-4.6`、`glm-4.5`、`glm-5.3` → `429 {"error":{"code":"1113","message":"Insufficient balance or no resource package"}}`（实测于 2026-10-21） |
| 未知模型 | `glm-4.6-flash` → `400` 未知模型 |
| 是否需要绑卡 | flash 层级**不需要** |
| 速率限制 | 未观察到 — 27.5 秒内连续 12 次调用全部返回 200 |
| 每账户密钥数 | 同一项目上任意数量；它们**共享该账户的配额** |

> 免费额度由 Z.AI 设定，可能会变化。请在 [z.ai](https://z.ai) 查看实时数据——并让工具自身的关卡来判定：`node src/cli.js --verify-only` 会用一次真实的 `glm-4.5-flash` 调用重新测试 `keys.txt` 中的每个密钥。

> 💡 免费额度由 Z.AI 设定，可能会变化。请在 [z.ai](https://z.ai) 查看实时数据——并让工具自身的关卡来判定：

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 模型 — 全部 1 个

**只有一个 id 在免费额度上经过实时验证**：`glm-4.5-flash` — 这是本工具写入的每个密钥的默认关卡模型（因此也是它向路由器注册的唯一模型）。

| 模型 ID | 在免费额度密钥上的状态 |
| --- | --- |
| `glm-4.5-flash` | **200**，返回真实内容 — 本工具的关卡 |
| `glm-4.6`、`glm-4.5`、`glm-5.3` | `429` — `Insufficient balance or no resource package` |
| `glm-4.6-flash` | `400` — 未知模型 |

该端点是 OpenAI 兼容的（`GET /api/paas/v4/models` 和 `POST /api/paas/v4/chat/completions`），因此有余额的密钥可以用相同的基础 URL 访问目录中的其余模型。

## 🧪 如何使用 API

基础 URL 是 **`https://api.z.ai/api/paas/v4`** — OpenAI 兼容，因此任何 OpenAI 客户端都可以使用。

```bash
curl https://api.z.ai/api/paas/v4/chat/completions \
  -H "Authorization: Bearer <apiKey>.<secretKey>" \
  -H "Content-Type: application/json" \
  -d '{"model":"glm-4.5-flash","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

密钥是控制台的 **`<apiKey>.<secretKey>`** 对 — 两半用点号连接，一起放入 `Authorization: Bearer` 请求头（仅用裸 `apiKey` 是不够的）。

## 🛠 快速开始

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

### 会话从何而来

**注册环节受验证码约束，此处未自动化。** 在 `chat.z.ai` 上注册意味着要通过阿里云 2.0 INPAINTING 滑块，而它的 SDK 成功回调在无头模式下不会触发——SPA 从不发送 `POST /auths/signup`，因此该环节既不会产生账户也不会产生密钥（实测于 2026-10-22；见*已验证*）。因此该工具从你已拥有的会话开始，并明确说明哪一步需要浏览器：

1. 在浏览器中于 `https://chat.z.ai` 注册（解决滑块）；邮件中带有 `verify-…` 令牌
2. `POST https://chat.z.ai/api/v1/auths/verify_email` `{username,email,token}`
3. `POST https://chat.z.ai/api/v1/auths/finish_signup` `{username,email,token,password,profile_image_url:"/user.png",sso_redirect:""}` → `user.token` 即**会话 JWT**
4. 将该 JWT 交给 CLI：`node src/cli.js --jwt-file session-jwt.txt --count N` — 其余部分（OAuth 交换 → 控制台登录 → 项目 → 密钥 → 聊天关卡）均无头运行。

### 🖱️ 启动器

启动器会询问代理列表、数量和验证模型，将它们记住在 `launcher.config.json` 中，并用正确的标志运行 CLI——外加 9Router 和 OmniRoute 连接器。

## ✅ 已验证可用 — 每个密钥都经过测试

| 检查 | 结果 |
| --- | --- |
| 用控制台密钥执行 `POST /api/paas/v4/chat/completions` | **200** — `glm-4.5-flash`，真实内容 |
| 来自 `keys.txt` 的三个密钥 | 三个都用 `glm-4.5-flash` 返回 chat-200，产生于同一账户/组织（共享配额） |
| `POST api.z.ai/api/auth/z/login {token}` | **200** — 业务令牌 |
| `GET /api/biz/customer/getCustomerInfo` | **200** — `data.organizations[].projects[].projectId` |
| `POST …/projects/{pid}/api_keys` 然后 `GET …/api_keys/copy/{apiKey}` | **200** — `"<apiKey>.<secretKey>"` |
| OAuth 尾部（`zcode` init → `chat.z.ai/api/oauth/authorize` → 回调 → 轮询） | **200**，使用会话 JWT；authorize 调用接受 **form-urlencoded**（JSON 请求体 → 422），流程窗口约 8 分钟 |
| 注册环节（`chat.z.ai`，阿里云 INPAINTING 滑块） | **无头模式下失败** — SDK 成功回调从不触发，`/auths/signup` 从不发送（2 次拖动尝试，阿里云 `F008`，`signupBody=null`） |

> **质量关卡。** 这里的每个密钥在写入 `keys.txt` 之前都通过了实时 `chat-200`
> （死密钥绝不交付）。路由器组合在模型层面遵循同样的规则：只有当模型响应 `chat-200` 且能调用工具时，
> 才会添加条目——不支持工具的模型、死密钥或死提供商会直接丢弃而不是添加。随时重新运行验证步骤；
> 失败会被报告，绝不隐藏。

> **质量关卡。** 这里的每个密钥在写入 `keys.txt` 之前都通过了实时 `chat-200`
> （死密钥绝不交付）。路由器组合在模型层面遵循同样的规则：只有当模型响应 `chat-200` 且能调用工具时，
> 才会添加条目——不支持工具的模型、死密钥或死提供商会直接丢弃而不是添加。随时重新运行验证步骤；
> 失败会被报告，绝不隐藏。

## 🧭 工作原理

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Z.AI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.z.ai/api/paas/v4/chat/completions → real content = the key is live
```

| 步骤 | 调用 | 说明 |
| --- | --- | --- |
| 注册环节 | `chat.z.ai` 页面 | **仅限人工/浏览器** — 阿里云 2.0 INPAINTING 滑块；SDK 成功回调在无头模式下从不触发 |
| 邮件验证 | `POST /api/v1/auths/verify_email {username,email,token}` | 在 `finish_signup` 之前；重新发送会使旧令牌失效 |
| 会话 | `POST /api/v1/auths/finish_signup {…}` | 返回 `user.token` — 会话 JWT（`--jwt-file`） |
| oauth | `POST zcode.z.ai/api/v1/oauth/cli/init` → `POST chat.z.ai/api/oauth/authorize`（**form-urlencoded**，`action=approve`）→ CLI 回调 → `GET …/cli/poll/{flow}` | `data.zai.access_token`，约 8 分钟窗口（`--access-token` 可跳过此步） |
| 登录 | `POST api.z.ai/api/auth/z/login {token}` | → 业务令牌 |
| ids | `GET /api/biz/customer/getCustomerInfo` | `organizations[].projects[].projectId` |
| 密钥 | `POST /api/biz/v1/organization/{oid}/projects/{pid}/api_keys` → `GET …/api_keys/copy/{apiKey}` | → `<apiKey>.<secretKey>` |
| 关卡 | `POST /api/paas/v4/chat/completions` | `glm-4.5-flash` 返回 200 且有内容 = 该密钥写入 `keys.txt` |

## ⚙️ CLI 选项

```bash
node src/cli.js --jwt-file session-jwt.txt --count N   # OAuth tail → mint N keys
node src/cli.js --access-token <zcode-token> --count N   # skip OAuth, mint from a token
node src/cli.js --verify-only                            # re-test every key in keys.txt
node src/cli.js --screen                                 # probe the pool exits against api.z.ai
node src/cli.js --help
```

| 标志 | 含义 |
| --- | --- |
| `--count N` | 在该账户的项目上铸造的密钥数量（默认 `1`） |
| `--jwt-file <f>` | `chat.z.ai` **会话 JWT**；CLI 用它运行 zcode OAuth 交换 |
| `--access-token <t>` | **zcode 访问令牌**，当 OAuth 步骤已完成时使用 |
| `--verify-only` | 用 `--model` 对 `keys.txt` 的每一行进行聊天测试，不写入任何内容 |
| `--screen` | 针对 `api.z.ai:443` 探测每个出口池 |
| `--pool <f>` | 出口列表，每行一个 `http://host:port`（环境变量 `ZAI_PROXIES`） |
| `--model <m>` | 用于实时关卡的模型（默认 `glm-4.5-flash` — 免费额度模型） |

| 环境变量 | 默认值 | 含义 |
| --- | --- | --- |
| `ZAI_PROXIES` | `proxies.txt` | 可选的出口池，每行一个代理 |
| `ZAI_MODEL` | `glm-4.5-flash` | 用于实时关卡的模型 |

`keys.txt` 从**当前工作目录**读取；没有会话（`--jwt-file`/`--access-token`）时，工具会打印它所需的确切人工步骤并以非零状态退出，而不是假装成功。

## 🛰️ 在代理之后

**可选 — 大规模使用时推荐（按 IP 的注册限制和封禁）。** 该工具在没有代理的情况下也能工作。

- **有代理池时：** 传入 `--pool <file>`（或设置 `ZAI_PROXIES`），请求将通过该列表中的一个出口发出（`http://host:port`、`socks5://host:port`、`host:port`、`user:pass@host:port`）。失效的行会使该次尝试失败；该列表可用 `--screen` 进行筛选。
- **没有代理池时：** CLI 会打印 `running WITHOUT a proxy (direct)` 并直接连接——OAuth 尾部、密钥铸造和聊天关卡均不变。
- 面板会封锁 WARP，且注册环节按主机粘性：整个流程中每个会话保持一个出口，而不是在运行中途轮换。

## 📄 文件

| 路径 | 内容 |
| --- | --- |
| `keys.txt` | 每行一个经过实时验证的 `<apiKey>.<secretKey>` — 已被 git 忽略 |
| `proxies.txt` | 你的出口，每行一个 — 已被 git 忽略 |
| `launcher.config.json` | 记住的启动器设置 — 已被 git 忽略 |

不会写入其他内容：CLI 从不将会话、业务令牌或 OAuth 轮询令牌存储到磁盘。

## 🔌 连接到 9Router

[9Router](https://9router.com) 是一个自托管的、OpenAI 兼容的路由器。注册此提供商一次，`keys.txt` 中的每个密钥都会成为一个提供商节点下的连接：

```bash
node src/connect-9router.js
```

默认值：`--base http://localhost:20128`、`--password 123456`、`--name "

## 🔌 连接到 OmniRoute

[OmniRoute](https://omniroute.online) 是一个自托管的、OpenAI 兼容的路由器。注册此提供商一次，`keys.txt` 中的每个密钥都会成为一个提供商节点下的连接：

```bash
node src/connect-omniroute.js
```

默认值：`--base http://localhost:20128`、`--password 123456`、`--name "

Z.AI"`、`--prefix zai`、`--base-url https://api.z.ai/api/paas/v4`、`--model glm-4.5-flash`。模型以 `zai/<model id>` 形式提供，并在所有密钥之间进行负载均衡。

## 🔑 一个密钥能给你什么

| | |
| --- | --- |
| 🏢 提供商 | **Z.AI** — [z.ai](https://z.ai) |
| 🎁 提供商提供什么 | GLM 免费额度 — 通过 zcode OAuth 尾部铸造的密钥，每个都经过聊天验证 |
| 🔑 一个密钥能给你什么 | 一个限定于其自身账户的 API 密钥：下方端点上的 1 个模型 id，受你的套餐限制。配额存在于**账户**上，这正是本工具为每个密钥创建一个账户的原因 |
| 🌐 API 形态 | OpenAI 兼容：`POST https://api.z.ai/api/paas/v4/chat/completions` |
| 🔒 你的数据 | 仅联系 z.ai 和你配置的收件箱后端；密钥保留在你的机器上 |

## 🐞 问题反馈

如果 Z.AI 更改了控制台端点、OAuth 形态或免费额度模型列表，工具会在该步骤停止，并打印它看到的状态码和响应体。请**[提交 issue](../../issues)**，附上命令和确切输出；欢迎 PR。

## 📄 许可证

MIT © 2026 — 见 [LICENSE](LICENSE)。

<div align="center">

**[MIT](LICENSE)** © 2026 z-ai-bulk-apikey contributors

</div>