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

**Z.AI (GLM) APIキーを一括作成 — api.z.ai からの OpenAI 互換推論、さらに 9Router コネクタ付き。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-1%20served-412991?style=for-the-badge)](https://z.ai)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 クイックスタート](#-quick-start) · [🎁 無料枠](#-free-tier--how-much-you-get) · [🤖 モデル](#-models--all-1-of-them) · [🧪 API の使い方](#-how-to-use-the-api) · [✅ 検証済み](#-verified-working--every-key-is-tested) · [🧭 仕組み](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ オプション](#️-cli-options) · [🛰️ プロキシ](#️-behind-a-proxy) · [🐞 問題報告](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ これが存在する理由

Z.AI は GLM ファミリーを `https://api.z.ai/api/paas/v4` の **OpenAI 互換**エンドポイントで提供しており、無料枠は実在します。`glm-4.5-flash` はコンソールプロジェクトからそのまま取得したキーで実際のチャット呼び出しに応答します（実測 — *検証済み* を参照）。興味深いのは、作成にコストがかからないキーのほうです。Z.AI のコンソールプロジェクトは**任意の数のキー**を発行でき（`POST …/projects/{pid}/api_keys`）、それぞれが `keys.txt` に書き込まれる前に chat-200 で証明されます。スケールする単位は**キーフリートごとに 1 アカウント（1 セッション）**です。1 つのプロジェクト上のすべてのキーは同じクォータを消費するため、別々のクォータには別々のアカウントが必要です。だからこそこのツールは、何もないところからキーを鋳造するのではなく、実行ごとに 1 セッションを受け取るのです。

## 🎁 無料枠 — どれだけ使えるか

| 項目 | 値 |
| --- | --- |
| 無料モデル | **`glm-4.5-flash`** — 無料枠が応答する唯一のクラス |
| 有料モデル | `glm-4.6`、`glm-4.5`、`glm-5.3` → `429 {"error":{"code":"1113","message":"Insufficient balance or no resource package"}}`（2026-10-21 実測） |
| 不明なモデル | `glm-4.6-flash` → `400` 不明なモデル |
| カード要否 | flash 枠では**不要** |
| レート制限 | 観測されず — 27.5 秒間に 12 回連続呼び出し、すべて 200 を返却 |
| アカウントあたりのキー数 | 同一プロジェクト上で任意の数。ただし**アカウントのクォータを共有**する |

> 無料枠は Z.AI が設定するもので、変更される可能性があります。最新の数値は [z.ai](https://z.ai) で確認してください — そしてツール自身のゲートに判断させましょう: `node src/cli.js --verify-only` は `keys.txt` 内のすべてのキーを実際の `glm-4.5-flash` 呼び出しで再テストします。

> 💡 無料枠は Z.AI が設定するもので、変更される可能性があります。最新の数値は [z.ai](https://z.ai) で確認してください — そしてツール自身のゲートに判断させましょう:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 モデル — 全部で 1 個

**無料枠でライブ検証済みの id は 1 つ**: `glm-4.5-flash` — このツールが書き込むすべてのキーのデフォルトゲートモデル（したがってルーターに登録する唯一のモデル）です。

| モデル ID | 無料枠キーでのステータス |
| --- | --- |
| `glm-4.5-flash` | 実際のコンテンツ付きで **200** — ツールのゲート |
| `glm-4.6`、`glm-4.5`、`glm-5.3` | `429` — `Insufficient balance or no resource package` |
| `glm-4.6-flash` | `400` — 不明なモデル |

エンドポイントは OpenAI 互換（`GET /api/paas/v4/models` および `POST /api/paas/v4/chat/completions`）なので、残高のあるキーは同じベース URL でカタログの残りに到達できます。

## 🧪 API の使い方

ベース URL は **`https://api.z.ai/api/paas/v4`** です — OpenAI 互換なので、任意の OpenAI クライアントが動作します。

```bash
curl https://api.z.ai/api/paas/v4/chat/completions \
  -H "Authorization: Bearer <apiKey>.<secretKey>" \
  -H "Content-Type: application/json" \
  -d '{"model":"glm-4.5-flash","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

キーはコンソールの **`<apiKey>.<secretKey>`** ペアです — 両方の半分をドットで結合し、`Authorization: Bearer` ヘッダーに入れます（`apiKey` だけでは不十分です）。

## 🛠 クイックスタート

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

### セッションの入手元

**サインアップの先頭部分はキャプチャに縛られており、ここでは自動化されていません**。`chat.z.ai` でのサインアップは Aliyun 2.0 INPAINTING スライダーを通過する必要があり、その SDK の成功コールバックはヘッドレスでは発火しません — SPA は `POST /auths/signup` を決して送信しないため、その区間からアカウントもキーも得られません（2026-10-22 実測。*検証済み* を参照）。したがってこのツールは、あなたがすでに所有しているセッションから開始し、どのステップにブラウザが必要かを正確に示します:

1. ブラウザで `https://chat.z.ai` にサインアップする（スライダーを解く）。メールに `verify-…` トークンが届きます
2. `POST https://chat.z.ai/api/v1/auths/verify_email` `{username,email,token}`
3. `POST https://chat.z.ai/api/v1/auths/finish_signup` `{username,email,token,password,profile_image_url:"/user.png",sso_redirect:""}` → `user.token` が**セッション JWT** です
4. その JWT を CLI に渡します: `node src/cli.js --jwt-file session-jwt.txt --count N` — 残り（OAuth 交換 → コンソールログイン → プロジェクト → キー → チャットゲート）はヘッドレスで実行されます。

### 🖱️ ランチャー

ランチャーはプロキシリスト、件数、検証モデルを尋ね、それらを `launcher.config.json` に記憶し、正しいフラグで CLI を実行します — さらに 9Router と OmniRoute のコネクタも備えています。

## ✅ 検証済み — すべてのキーがテストされます

| チェック | 結果 |
| --- | --- |
| コンソールキーでの `POST /api/paas/v4/chat/completions` | **200** — `glm-4.5-flash`、実際のコンテンツ |
| `keys.txt` からの 3 つのキー | 3 つすべてが `glm-4.5-flash` で chat-200、1 つのアカウント/組織で生成（クォータ共有） |
| `POST api.z.ai/api/auth/z/login {token}` | **200** — ビジネストークン |
| `GET /api/biz/customer/getCustomerInfo` | **200** — `data.organizations[].projects[].projectId` |
| `POST …/projects/{pid}/api_keys` の後に `GET …/api_keys/copy/{apiKey}` | **200** — `"<apiKey>.<secretKey>"` |
| OAuth テール（`zcode` init → `chat.z.ai/api/oauth/authorize` → callback → poll） | セッション JWT で **200**。authorize 呼び出しは **form-urlencoded** を受け取ります（JSON ボディ → 422）、フローウィンドウは約 8 分 |
| サインアップ先頭（`chat.z.ai`、Aliyun INPAINTING スライダー） | **ヘッドレスでは失敗** — SDK 成功コールバックが発火せず、`/auths/signup` が送信されない（ドラッグ 2 回試行、Aliyun `F008`、`signupBody=null`） |

> **品質ゲート。** ここにあるすべてのキーは、`keys.txt` に書き込まれる前にライブの `chat-200` を通過しています
> （死んだキーは決して出荷されません）。ルーターのコンボもモデルレベルで同じルールに従います: エントリは
> **モデルが `chat-200` を返し、ツールを呼び出せる場合にのみ**追加されます — ツールサポートのないモデル、
> 死んだキー、死んだプロバイダーは追加されずに除外されます。検証ステップはいつでも再実行できます。
> 失敗は報告され、決して隠されません。

> **品質ゲート。** ここにあるすべてのキーは、`keys.txt` に書き込まれる前にライブの `chat-200` を通過しています
> （死んだキーは決して出荷されません）。ルーターのコンボもモデルレベルで同じルールに従います: エントリは
> **モデルが `chat-200` を返し、ツールを呼び出せる場合にのみ**追加されます — ツールサポートのないモデル、
> 死んだキー、死んだプロバイダーは追加されずに除外されます。検証ステップはいつでも再実行できます。
> 失敗は報告され、決して隠されません。

## 🧭 仕組み

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Z.AI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.z.ai/api/paas/v4/chat/completions → real content = the key is live
```

| ステップ | 呼び出し | 備考 |
| --- | --- | --- |
| サインアップ先頭 | `chat.z.ai` ページ | **人間/ブラウザのみ** — Aliyun 2.0 INPAINTING スライダー。SDK 成功コールバックはヘッドレスでは発火しない |
| メール検証 | `POST /api/v1/auths/verify_email {username,email,token}` | `finish_signup` の前。再送すると古いトークンは無効になる |
| セッション | `POST /api/v1/auths/finish_signup {…}` | `user.token` を返す — セッション JWT（`--jwt-file`） |
| oauth | `POST zcode.z.ai/api/v1/oauth/cli/init` → `POST chat.z.ai/api/oauth/authorize`（**form-urlencoded**、`action=approve`）→ CLI callback → `GET …/cli/poll/{flow}` | `data.zai.access_token`、約 8 分のウィンドウ（`--access-token` でこれをスキップ） |
| ログイン | `POST api.z.ai/api/auth/z/login {token}` | → ビジネストークン |
| ids | `GET /api/biz/customer/getCustomerInfo` | `organizations[].projects[].projectId` |
| キー | `POST /api/biz/v1/organization/{oid}/projects/{pid}/api_keys` → `GET …/api_keys/copy/{apiKey}` | → `<apiKey>.<secretKey>` |
| ゲート | `POST /api/paas/v4/chat/completions` | `glm-4.5-flash` がコンテンツ付きで 200 = キーが `keys.txt` に書き込まれる |

## ⚙️ CLI オプション

```bash
node src/cli.js --jwt-file session-jwt.txt --count N   # OAuth tail → mint N keys
node src/cli.js --access-token <zcode-token> --count N   # skip OAuth, mint from a token
node src/cli.js --verify-only                            # re-test every key in keys.txt
node src/cli.js --screen                                 # probe the pool exits against api.z.ai
node src/cli.js --help
```

| フラグ | 意味 |
| --- | --- |
| `--count N` | アカウントのプロジェクトで作成するキーの数（デフォルト `1`） |
| `--jwt-file <f>` | `chat.z.ai` の**セッション JWT**。CLI はこれで zcode OAuth 交換を実行します |
| `--access-token <t>` | **zcode アクセストークン**。OAuth ステップがすでに完了している場合に使用 |
| `--verify-only` | `keys.txt` のすべての行を `--model` でチャットテストし、何も書き込みません |
| `--screen` | 各プール出口を `api.z.ai:443` に対してプローブします |
| `--pool <f>` | 出口リスト、1 行につき 1 つの `http://host:port`（環境変数 `ZAI_PROXIES`） |
| `--model <m>` | ライブゲート用のモデル（デフォルト `glm-4.5-flash` — 無料枠モデル） |

| 環境変数 | デフォルト | 意味 |
| --- | --- | --- |
| `ZAI_PROXIES` | `proxies.txt` | オプションの出口プール、1 行につき 1 つのプロキシ |
| `ZAI_MODEL` | `glm-4.5-flash` | ライブゲートに使用するモデル |

`keys.txt` は**現在の作業ディレクトリ**から読み込まれます。セッション（`--jwt-file`/`--access-token`）がない場合、ツールは必要な人間のステップを正確に表示し、ふりをせずに非ゼロで終了します。

## 🛰️ プロキシの背後で

**オプション — 規模を拡大する場合は推奨（IP ごとのサインアップ制限と BAN）。** ツールはプロキシなしでも動作します。

- **プールあり:** `--pool <file>` を渡す（または `ZAI_PROXIES` を設定する）と、リクエストはそのリストの出口（`http://host:port`、`socks5://host:port`、`host:port`、`user:pass@host:port`）を経由します。死んだ行はその試行を失敗させます。リストは `--screen` でスクリーニングされます。
- **プールなし:** CLI は `running WITHOUT a proxy (direct)` と表示し、直接接続します — OAuth テール、キー作成、チャットゲートは変わりません。
- パネルは WARP をブロックし、サインアップ先頭はホストごとにスティッキーです: 実行の途中でローテーションするのではなく、フロー全体を通してセッションごとに 1 つの出口を維持してください。

## 📄 ファイル

| パス | 内容 |
| --- | --- |
| `keys.txt` | 1 行につき 1 つのライブ検証済み `<apiKey>.<secretKey>` — git 無視 |
| `proxies.txt` | あなたの出口、1 行につき 1 つ — git 無視 |
| `launcher.config.json` | 記憶されたランチャー設定 — git 無視 |

他には何も書き込まれません: CLI はセッション、ビジネストークン、OAuth ポーリングトークンをディスクに保存しません。

## 🔌 9Router に接続する

[9Router](https://9router.com) はセルフホストの OpenAI 互換ルーターです。このプロバイダーを一度登録すれば、`keys.txt` 内のすべてのキーが 1 つのプロバイダーノードの下の接続になります:

```bash
node src/connect-9router.js
```

デフォルト: `--base http://localhost:20128`、`--password 123456`、`--name "

## 🔌 OmniRoute に接続する

[OmniRoute](https://omniroute.online) はセルフホストの OpenAI 互換ルーターです。このプロバイダーを一度登録すれば、`keys.txt` 内のすべてのキーが 1 つのプロバイダーノードの下の接続になります:

```bash
node src/connect-omniroute.js
```

デフォルト: `--base http://localhost:20128`、`--password 123456`、`--name "

Z.AI"`、`--prefix zai`、`--base-url https://api.z.ai/api/paas/v4`、`--model glm-4.5-flash`。モデルは `zai/<model id>` として提供され、すべてのキーにわたってロードバランスされます。

## 🔑 1 つのキーで得られるもの

| | |
| --- | --- |
| 🏢 プロバイダー | **Z.AI** — [z.ai](https://z.ai) |
| 🎁 プロバイダーが提供するもの | GLM 無料枠 — zcode OAuth テールを通じて作成されたキー、すべてチャット検証済み |
| 🔑 1 つのキーで得られるもの | 独自のアカウントにスコープされた 1 つの API キー: 以下のエンドポイントで 1 つのモデル id を、あなたのプランの制限で利用可能。クォータは**アカウント**に存在するため、このツールがキーごとに 1 つのアカウントを作成するのです |
| 🌐 API の形 | OpenAI 互換: `POST https://api.z.ai/api/paas/v4/chat/completions` |
| 🔒 あなたのデータ | 接触するのは z.ai と、あなたが設定した受信トレイバックエンドのみ。キーはあなたのマシンに留まります |

## 🐞 問題報告

Z.AI がコンソールエンドポイント、OAuth の形、または無料枠のモデルリストを変更した場合、ツールはそのステップで停止し、見たステータスとボディを表示します。コマンドと正確な出力を添えて **[issue を開いてください](../../issues)**。PR も歓迎します。

## 📄 ライセンス

MIT © 2026 — [LICENSE](LICENSE) を参照。

<div align="center">

**[MIT](LICENSE)** © 2026 z-ai-bulk-apikey contributors

</div>