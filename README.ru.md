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

**Массовое создание API-ключей Z.AI (GLM) — инференс, совместимый с OpenAI, через api.z.ai, плюс коннектор для 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-1%20served-412991?style=for-the-badge)](https://z.ai)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Быстрый старт](#-quick-start) · [🎁 Бесплатный тариф](#-free-tier--how-much-you-get) · [🤖 Модели](#-models--all-1-of-them) · [🧪 Использование API](#-how-to-use-the-api) · [✅ Проверено](#-verified-working--every-key-is-tested) · [🧭 Как это работает](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Опции](#️-cli-options) · [🛰️ Прокси](#️-behind-a-proxy) · [🐞 Проблемы](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Зачем это нужно

Z.AI предоставляет семейство GLM через **совместимую с OpenAI** конечную точку по адресу `https://api.z.ai/api/paas/v4`, и бесплатный тариф вполне реален: `glm-4.5-flash` отвечает на живой чат-запрос с ключом, взятым прямо из проекта в консоли (измерено — см. *Проверено*). Интересная часть — это ключ, создание которого ничего не стоит: проект в консоли Z.AI выдаёт **любое количество ключей** (`POST …/projects/{pid}/api_keys`), и каждый из них подтверждается ответом chat-200, прежде чем попасть в `keys.txt`. Единица масштабирования — **один аккаунт (одна сессия) на парк ключей**: все ключи одного проекта используют одну и ту же квоту, поэтому отдельные квоты означают отдельные аккаунты — именно поэтому инструмент принимает сессию на каждый запуск, а не создаёт ключи из ничего.

## 🎁 Бесплатный тариф — сколько вы получаете

| Что | Значение |
| --- | --- |
| Бесплатная модель | **`glm-4.5-flash`** — единственный класс, на который отвечает бесплатный тариф |
| Платные модели | `glm-4.6`, `glm-4.5`, `glm-5.3` → `429 {"error":{"code":"1113","message":"Insufficient balance or no resource package"}}` (измерено 2026-10-21) |
| Неизвестная модель | `glm-4.6-flash` → `400` неизвестная модель |
| Требуется карта | **Нет** для тарифа flash |
| Ограничение скорости | не обнаружено — 12 последовательных вызовов за 27,5 с все вернули 200 |
| Ключей на аккаунт | любое количество в рамках одного проекта; они **используют общую квоту аккаунта** |

> Бесплатный тариф устанавливается Z.AI и может измениться. Проверяйте актуальные цифры на [z.ai](https://z.ai) — и пусть решает собственный шлюз инструмента: `node src/cli.js --verify-only` повторно тестирует каждый ключ в `keys.txt` реальным вызовом `glm-4.5-flash`.

> 💡 Бесплатный тариф устанавливается Z.AI и может измениться. Проверяйте актуальные цифры на [z.ai](https://z.ai) — и пусть решает собственный шлюз инструмента:

```bash
node src/cli.js --verify-only     # каждый ключ в keys.txt повторно тестируется реальным чат-вызовом
```

## 🤖 Модели — все 1 из них

**Один идентификатор проверен вживую на бесплатном тарифе**: `glm-4.5-flash` — модель шлюза по умолчанию для каждого ключа, который записывает этот инструмент (и, следовательно, единственная, которую он регистрирует в роутере).

| ID модели | Статус на ключе бесплатного тарифа |
| --- | --- |
| `glm-4.5-flash` | **200** с реальным содержимым — шлюз инструмента |
| `glm-4.6`, `glm-4.5`, `glm-5.3` | `429` — `Insufficient balance or no resource package` |
| `glm-4.6-flash` | `400` — неизвестная модель |

Конечная точка совместима с OpenAI (`GET /api/paas/v4/models` и `POST /api/paas/v4/chat/completions`), поэтому ключ с балансом открывает доступ к остальному каталогу с тем же базовым URL.

## 🧪 Как использовать API

Базовый URL — **`https://api.z.ai/api/paas/v4`** — совместим с OpenAI, поэтому работает любой клиент OpenAI.

```bash
curl https://api.z.ai/api/paas/v4/chat/completions \
  -H "Authorization: Bearer <apiKey>.<secretKey>" \
  -H "Content-Type: application/json" \
  -d '{"model":"glm-4.5-flash","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

Ключ — это пара **`<apiKey>.<secretKey>`** из консоли: обе половины, соединённые точкой, идут в заголовок `Authorization: Bearer` (одного только `apiKey` недостаточно).

## 🛠 Быстрый старт

```bash
cd z-ai-bulk-apikey

# 0) сессия, из которой создавать — см. "Откуда берётся сессия" ниже

# 1) необязательно: ваш пул выходов, по одному в строке
printf 'http://host:port\n' > proxies.txt

# 2) создать 3 ключа через OAuth-хвост, каждый проверен живым чат-вызовом
node src/cli.js --jwt-file session-jwt.txt --count 3

# или, если вы уже выполнили OAuth-обмен:
node src/cli.js --access-token <zcode-access-token> --count 1

# в любой момент после этого
node src/cli.js --verify-only     # повторно тестировать каждый ключ в keys.txt
node src/launcher.js              # интерактивное меню (создание / проверка / отбор / 9Router)
```

### Откуда берётся сессия

**Голова регистрации привязана к капче и здесь не автоматизируется**. Регистрация на `chat.z.ai` означает прохождение слайдера Aliyun 2.0 INPAINTING, а его callback успеха SDK не срабатывает в headless-режиме — SPA никогда не отправляет `POST /auths/signup`, поэтому ни аккаунт, ни ключ из этого этапа не получаются (измерено 2026-10-22; см. *Проверено*). Поэтому инструмент начинает с сессии, которой вы уже владеете, и точно указывает, какой шаг требует браузера:

1. зарегистрируйтесь на `https://chat.z.ai` в браузере (пройдите слайдер); письмо содержит токен `verify-…`
2. `POST https://chat.z.ai/api/v1/auths/verify_email` `{username,email,token}`
3. `POST https://chat.z.ai/api/v1/auths/finish_signup` `{username,email,token,password,profile_image_url:"/user.png",sso_redirect:""}` → `user.token` — это **сессионный JWT**
4. передайте этот JWT в CLI: `node src/cli.js --jwt-file session-jwt.txt --count N` — остальное (OAuth-обмен → вход в консоль → проект → ключи → чат-шлюз) выполняется в headless-режиме.

### 🖱️ Лаунчер

Лаунчер запрашивает список прокси, количество и модель проверки, запоминает их в `launcher.config.json` и запускает CLI с нужными флагами — плюс коннекторы 9Router и OmniRoute.

## ✅ Проверено в работе — каждый ключ тестируется

| Проверка | Результат |
| --- | --- |
| `POST /api/paas/v4/chat/completions` с ключом из консоли | **200** — `glm-4.5-flash`, реальное содержимое |
| три ключа из `keys.txt` | все три chat-200 с `glm-4.5-flash`, созданы на одном аккаунте/организации (общая квота) |
| `POST api.z.ai/api/auth/z/login {token}` | **200** — бизнес-токен |
| `GET /api/biz/customer/getCustomerInfo` | **200** — `data.organizations[].projects[].projectId` |
| `POST …/projects/{pid}/api_keys` затем `GET …/api_keys/copy/{apiKey}` | **200** — `"<apiKey>.<secretKey>"` |
| OAuth-хвост (`zcode` init → `chat.z.ai/api/oauth/authorize` → callback → poll) | **200** с сессионным JWT; вызов authorize принимает **form-urlencoded** (JSON-тело → 422), окно потока ~8 мин |
| голова регистрации (`chat.z.ai`, слайдер Aliyun INPAINTING) | **не работает в headless** — callback успеха SDK никогда не срабатывает, `/auths/signup` никогда не отправляется (2 попытки перетаскивания, Aliyun `F008`, `signupBody=null`) |

> **Контроль качества.** Каждый ключ здесь прошёл живой `chat-200`, прежде чем был записан в `keys.txt`
> (мёртвые ключи никогда не выдаются). Комбинации роутера следуют тому же правилу на уровне модели: запись
> добавляется **только если модель отвечает `chat-200` и умеет вызывать инструменты** — модель без поддержки инструментов,
> мёртвый ключ или мёртвый провайдер отбрасывается, а не добавляется. Повторяйте шаг проверки в любой момент;
> сбои сообщаются, никогда не скрываются.

> **Контроль качества.** Каждый ключ здесь прошёл живой `chat-200`, прежде чем был записан в `keys.txt`
> (мёртвые ключи никогда не выдаются). Комбинации роутера следуют тому же правилу на уровне модели: запись
> добавляется **только если модель отвечает `chat-200` и умеет вызывать инструменты** — модель без поддержки инструментов,
> мёртвый ключ или мёртвый провайдер отбрасывается, а не добавляется. Повторяйте шаг проверки в любой момент;
> сбои сообщаются, никогда не скрываются.

## 🧭 Как это работает

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Z.AI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.z.ai/api/paas/v4/chat/completions → real content = the key is live
```

| Шаг | Вызов | Примечания |
| --- | --- | --- |
| голова регистрации | страница `chat.z.ai` | **только человек/браузер** — слайдер Aliyun 2.0 INPAINTING; callback успеха SDK никогда не срабатывает в headless |
| подтверждение почты | `POST /api/v1/auths/verify_email {username,email,token}` | перед `finish_signup`; повторная отправка делает старый токен недействительным |
| сессия | `POST /api/v1/auths/finish_signup {…}` | возвращает `user.token` — сессионный JWT (`--jwt-file`) |
| oauth | `POST zcode.z.ai/api/v1/oauth/cli/init` → `POST chat.z.ai/api/oauth/authorize` (**form-urlencoded**, `action=approve`) → CLI callback → `GET …/cli/poll/{flow}` | `data.zai.access_token`, окно ~8 мин (`--access-token` пропускает это) |
| вход | `POST api.z.ai/api/auth/z/login {token}` | → бизнес-токен |
| ids | `GET /api/biz/customer/getCustomerInfo` | `organizations[].projects[].projectId` |
| ключ | `POST /api/biz/v1/organization/{oid}/projects/{pid}/api_keys` → `GET …/api_keys/copy/{apiKey}` | → `<apiKey>.<secretKey>` |
| шлюз | `POST /api/paas/v4/chat/completions` | `glm-4.5-flash` 200 с содержимым = ключ записан в `keys.txt` |

## ⚙️ Опции CLI

```bash
node src/cli.js --jwt-file session-jwt.txt --count N   # OAuth tail → mint N keys
node src/cli.js --access-token <zcode-token> --count N   # skip OAuth, mint from a token
node src/cli.js --verify-only                            # re-test every key in keys.txt
node src/cli.js --screen                                 # probe the pool exits against api.z.ai
node src/cli.js --help
```

| Флаг | Значение |
| --- | --- |
| `--count N` | количество ключей для создания в проекте аккаунта (по умолчанию `1`) |
| `--jwt-file <f>` | **сессионный JWT** `chat.z.ai`; CLI выполняет с ним OAuth-обмен zcode |
| `--access-token <t>` | **access-токен zcode**, когда шаг OAuth уже выполнен |
| `--verify-only` | чат-тест каждой строки `keys.txt` с `--model`, ничего не записывает |
| `--screen` | проверка каждого выхода пула против `api.z.ai:443` |
| `--pool <f>` | список выходов, по одному `http://host:port` в строке (переменная окружения `ZAI_PROXIES`) |
| `--model <m>` | модель для живого шлюза (по умолчанию `glm-4.5-flash` — модель бесплатного тарифа) |

| Переменная окружения | По умолчанию | Значение |
| --- | --- | --- |
| `ZAI_PROXIES` | `proxies.txt` | необязательный пул выходов, по одному прокси в строке |
| `ZAI_MODEL` | `glm-4.5-flash` | модель, используемая для живого шлюза |

`keys.txt` читается из **текущего рабочего каталога**; без сессии (`--jwt-file`/`--access-token`) инструмент выводит точный шаг, который требуется от человека, и завершается с ненулевым кодом, а не делает вид.

## 🛰️ За прокси

**Необязательно — рекомендуется при масштабировании (лимиты и баны регистрации по IP).** Инструмент работает и без прокси.

- **С пулом:** передайте `--pool <file>` (или задайте `ZAI_PROXIES`), и запросы будут уходить через выход из этого списка (`http://host:port`, `socks5://host:port`, `host:port`, `user:pass@host:port`). Мёртвая строка проваливает эту попытку; список проверяется с помощью `--screen`.
- **Без пула:** CLI выводит `running WITHOUT a proxy (direct)` и подключается напрямую — OAuth-хвост, создание ключа и чат-шлюз не меняются.
- Панель блокирует WARP, а голова регистрации привязана к хосту: сохраняйте один выход на сессию для всего потока, а не меняйте его в середине запуска.

## 📄 Файлы

| Путь | Содержимое |
| --- | --- |
| `keys.txt` | по одному проверенному вживую `<apiKey>.<secretKey>` в строке — игнорируется git |
| `proxies.txt` | ваши выходы, по одному в строке — игнорируется git |
| `launcher.config.json` | сохранённые настройки лаунчера — игнорируется git |

Больше ничего не записывается: CLI никогда не сохраняет на диск сессию, бизнес-токен или токен опроса OAuth.

## 🔌 Подключение к 9Router

[9Router](https://9router.com) — это самостоятельно размещаемый роутер, совместимый с OpenAI. Зарегистрируйте этого провайдера один раз, и каждый ключ в `keys.txt` станет соединением под одним узлом-провайдером:

```bash
node src/connect-9router.js
```

По умолчанию: `--base http://localhost:20128`, `--password 123456`, `--name "

## 🔌 Подключение к OmniRoute

[OmniRoute](https://omniroute.online) — это самостоятельно размещаемый роутер, совместимый с OpenAI. Зарегистрируйте этого провайдера один раз, и каждый ключ в `keys.txt` станет соединением под одним узлом-провайдером:

```bash
node src/connect-omniroute.js
```

По умолчанию: `--base http://localhost:20128`, `--password 123456`, `--name "

Z.AI"`, `--prefix zai`, `--base-url https://api.z.ai/api/paas/v4`, `--model glm-4.5-flash`. Модели предоставляются как `zai/<model id>` и балансируются между всеми ключами.

## 🔑 Что даёт один ключ

| | |
| --- | --- |
| 🏢 Провайдер | **Z.AI** — [z.ai](https://z.ai) |
| 🎁 Что даёт провайдер | Бесплатный тариф GLM — ключи, созданные через OAuth-хвост zcode, каждый проверен чатом |
| 🔑 Что даёт один ключ | один API-ключ, привязанный к своему аккаунту: 1 идентификатор модели на конечной точке ниже, в пределах лимитов вашего тарифа. Квота привязана к **аккаунту**, именно поэтому этот инструмент создаёт один аккаунт на ключ |
| 🌐 Форма API | Совместим с OpenAI: `POST https://api.z.ai/api/paas/v4/chat/completions` |
| 🔒 Ваши данные | связь только с z.ai и настроенным вами бэкендом inbox; ключи остаются на вашей машине |

## 🐞 Проблемы

Если Z.AI изменит конечные точки консоли, форму OAuth или список моделей бесплатного тарифа, инструмент остановится на этом шаге и выведет статус и тело, которые увидел. **[Откройте issue](../../issues)** с командой и точным выводом; PR приветствуются.

## 📄 Лицензия

MIT © 2026 — см. [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 z-ai-bulk-apikey contributors

</div>