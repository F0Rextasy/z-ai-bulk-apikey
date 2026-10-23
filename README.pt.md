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

**Crie chaves de API do Z.AI (GLM) em massa — inferência compatível com OpenAI a partir de api.z.ai, além de um conector 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-1%20served-412991?style=for-the-badge)](https://z.ai)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Início rápido](#-quick-start) · [🎁 Camada gratuita](#-free-tier--how-much-you-get) · [🤖 Modelos](#-models--all-1-of-them) · [🧪 Use a API](#-how-to-use-the-api) · [✅ Verificado](#-verified-working--every-key-is-tested) · [🧭 Como funciona](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Opções](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problemas](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Por que isto existe

A Z.AI serve a família GLM por um endpoint **compatível com OpenAI** em `https://api.z.ai/api/paas/v4`, e a camada gratuita é real: `glm-4.5-flash` responde a uma chamada de chat ao vivo com uma chave obtida diretamente de um projeto do console (medido — veja *Verificado*). A parte interessante é a chave que não custa nada para criar: um projeto do console Z.AI distribui **qualquer número de chaves** (`POST …/projects/{pid}/api_keys`), e cada uma é comprovada com um chat-200 antes de chegar a `keys.txt`. A unidade que escala é **uma conta (uma sessão) por frota de chaves**: todas as chaves de um projeto consomem a mesma cota, então cotas separadas exigem contas separadas — por isso a ferramenta recebe uma sessão por execução em vez de criar chaves do nada.

## 🎁 Camada gratuita — quanto você recebe

| O quê | Valor |
| --- | --- |
| Modelo gratuito | **`glm-4.5-flash`** — a única classe que a camada gratuita responde |
| Modelos pagos | `glm-4.6`, `glm-4.5`, `glm-5.3` → `429 {"error":{"code":"1113","message":"Insufficient balance or no resource package"}}` (medido em 2026-10-21) |
| Modelo desconhecido | `glm-4.6-flash` → `400` modelo desconhecido |
| Cartão exigido | **Não** para a camada flash |
| Limite de taxa | nenhum observado — 12 chamadas consecutivas em 27,5 s retornaram todas 200 |
| Chaves por conta | qualquer número no mesmo projeto; elas **compartilham a cota da conta** |

> A camada gratuita é definida pela Z.AI e pode mudar. Confira os números ao vivo em [z.ai](https://z.ai) — e deixe o próprio gate da ferramenta decidir: `node src/cli.js --verify-only` retesta cada chave em `keys.txt` com uma chamada real de `glm-4.5-flash`.

> 💡 A camada gratuita é definida pela Z.AI e pode mudar. Confira os números ao vivo em [z.ai](https://z.ai) — e deixe o próprio gate da ferramenta decidir:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelos — todos os 1 deles

**Um id é verificado ao vivo na camada gratuita**: `glm-4.5-flash` — o modelo de gate padrão para cada chave que esta ferramenta grava (e, portanto, o único que ela registra no roteador).

| ID do modelo | Status em uma chave da camada gratuita |
| --- | --- |
| `glm-4.5-flash` | **200** com conteúdo real — o gate da ferramenta |
| `glm-4.6`, `glm-4.5`, `glm-5.3` | `429` — `Insufficient balance or no resource package` |
| `glm-4.6-flash` | `400` — modelo desconhecido |

O endpoint é compatível com OpenAI (`GET /api/paas/v4/models` e `POST /api/paas/v4/chat/completions`), então uma chave com saldo alcança o restante do catálogo com a mesma URL base.

## 🧪 Como usar a API

A URL base é **`https://api.z.ai/api/paas/v4`** — compatível com OpenAI, então qualquer cliente OpenAI funciona.

```bash
curl https://api.z.ai/api/paas/v4/chat/completions \
  -H "Authorization: Bearer <apiKey>.<secretKey>" \
  -H "Content-Type: application/json" \
  -d '{"model":"glm-4.5-flash","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

Uma chave é o par **`<apiKey>.<secretKey>`** do console — as duas metades, unidas por um ponto, vão no cabeçalho `Authorization: Bearer` (apenas o `apiKey` sozinho não basta).

## 🛠 Início rápido

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

### De onde vem a sessão

A **etapa de cadastro está vinculada a captcha e não é automatizada aqui**. Cadastrar-se em `chat.z.ai` significa passar por um slider Aliyun 2.0 INPAINTING, e seu callback de sucesso do SDK não dispara em modo headless — a SPA nunca envia `POST /auths/signup`, então nenhuma conta e nenhuma chave sai dessa etapa (medido em 2026-10-22; veja *Verificado*). A ferramenta, portanto, parte de uma sessão que você já possui, e diz exatamente qual passo precisa de um navegador:

1. cadastre-se em `https://chat.z.ai` em um navegador (resolva o slider); o e-mail traz um token `verify-…`
2. `POST https://chat.z.ai/api/v1/auths/verify_email` `{username,email,token}`
3. `POST https://chat.z.ai/api/v1/auths/finish_signup` `{username,email,token,password,profile_image_url:"/user.png",sso_redirect:""}` → `user.token` é o **JWT de sessão**
4. entregue esse JWT à CLI: `node src/cli.js --jwt-file session-jwt.txt --count N` — o resto (troca OAuth → login no console → projeto → chaves → gate de chat) roda em modo headless.

### 🖱️ O launcher

O launcher pede a lista de proxies, a contagem e o modelo de verificação, lembra-os em `launcher.config.json` e executa a CLI com as flags corretas — além dos conectores 9Router e OmniRoute.

## ✅ Verificado e funcionando — cada chave é testada

| Verificação | Resultado |
| --- | --- |
| `POST /api/paas/v4/chat/completions` com uma chave do console | **200** — `glm-4.5-flash`, conteúdo real |
| três chaves de `keys.txt` | todas as três com chat-200 usando `glm-4.5-flash`, produzidas em uma conta/org (cota compartilhada) |
| `POST api.z.ai/api/auth/z/login {token}` | **200** — token de negócio |
| `GET /api/biz/customer/getCustomerInfo` | **200** — `data.organizations[].projects[].projectId` |
| `POST …/projects/{pid}/api_keys` e depois `GET …/api_keys/copy/{apiKey}` | **200** — `"<apiKey>.<secretKey>"` |
| Etapa OAuth (`zcode` init → `chat.z.ai/api/oauth/authorize` → callback → poll) | **200** com um JWT de sessão; a chamada de authorize aceita **form-urlencoded** (corpo JSON → 422), a janela do fluxo é de ~8 min |
| Etapa de cadastro (`chat.z.ai`, slider Aliyun INPAINTING) | **falha em modo headless** — o callback de sucesso do SDK nunca dispara, `/auths/signup` nunca é enviado (2 tentativas de arrasto, Aliyun `F008`, `signupBody=null`) |

> **Portões de qualidade.** Cada chave aqui passou por um `chat-200` ao vivo antes de ser gravada em `keys.txt`
> (chaves mortas nunca são entregues). As combinações do roteador seguem a mesma regra no nível do modelo: uma entrada é
> adicionada **somente se o modelo responder `chat-200` e puder chamar ferramentas** — um modelo sem suporte a ferramentas,
> uma chave morta ou um provedor morto é descartado em vez de adicionado. Reexecute a etapa de verificação a qualquer momento;
> as falhas são relatadas, nunca ocultadas.

> **Portões de qualidade.** Cada chave aqui passou por um `chat-200` ao vivo antes de ser gravada em `keys.txt`
> (chaves mortas nunca são entregues). As combinações do roteador seguem a mesma regra no nível do modelo: uma entrada é
> adicionada **somente se o modelo responder `chat-200` e puder chamar ferramentas** — um modelo sem suporte a ferramentas,
> uma chave morta ou um provedor morto é descartado em vez de adicionado. Reexecute a etapa de verificação a qualquer momento;
> as falhas são relatadas, nunca ocultadas.

## 🧭 Como funciona

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Z.AI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.z.ai/api/paas/v4/chat/completions → real content = the key is live
```

| Etapa | Chamada | Observações |
| --- | --- | --- |
| etapa de cadastro | página `chat.z.ai` | **somente humano/navegador** — slider Aliyun 2.0 INPAINTING; o callback de sucesso do SDK nunca dispara em modo headless |
| verificação de e-mail | `POST /api/v1/auths/verify_email {username,email,token}` | antes de `finish_signup`; um reenvio invalida o token antigo |
| sessão | `POST /api/v1/auths/finish_signup {…}` | retorna `user.token` — o JWT de sessão (`--jwt-file`) |
| oauth | `POST zcode.z.ai/api/v1/oauth/cli/init` → `POST chat.z.ai/api/oauth/authorize` (**form-urlencoded**, `action=approve`) → callback da CLI → `GET …/cli/poll/{flow}` | `data.zai.access_token`, janela de ~8 min (`--access-token` pula isto) |
| login | `POST api.z.ai/api/auth/z/login {token}` | → token de negócio |
| ids | `GET /api/biz/customer/getCustomerInfo` | `organizations[].projects[].projectId` |
| chave | `POST /api/biz/v1/organization/{oid}/projects/{pid}/api_keys` → `GET …/api_keys/copy/{apiKey}` | → `<apiKey>.<secretKey>` |
| gate | `POST /api/paas/v4/chat/completions` | `glm-4.5-flash` 200 com conteúdo = a chave é gravada em `keys.txt` |

## ⚙️ Opções da CLI

```bash
node src/cli.js --jwt-file session-jwt.txt --count N   # OAuth tail → mint N keys
node src/cli.js --access-token <zcode-token> --count N   # skip OAuth, mint from a token
node src/cli.js --verify-only                            # re-test every key in keys.txt
node src/cli.js --screen                                 # probe the pool exits against api.z.ai
node src/cli.js --help
```

| Flag | Significado |
| --- | --- |
| `--count N` | chaves a criar no projeto da conta (padrão `1`) |
| `--jwt-file <f>` | **JWT de sessão** do `chat.z.ai`; a CLI executa a troca OAuth do zcode com ele |
| `--access-token <t>` | um **token de acesso zcode**, quando a etapa OAuth já foi feita |
| `--verify-only` | testa por chat cada linha de `keys.txt` com `--model`, não grava nada |
| `--screen` | testa cada saída do pool contra `api.z.ai:443` |
| `--pool <f>` | lista de saídas, uma `http://host:port` por linha (env `ZAI_PROXIES`) |
| `--model <m>` | modelo para o gate ao vivo (padrão `glm-4.5-flash` — o modelo da camada gratuita) |

| Variável de ambiente | Padrão | Significado |
| --- | --- | --- |
| `ZAI_PROXIES` | `proxies.txt` | pool de saídas opcional, um proxy por linha |
| `ZAI_MODEL` | `glm-4.5-flash` | modelo usado para o gate ao vivo |

`keys.txt` é lido do **diretório de trabalho atual**; sem uma sessão (`--jwt-file`/`--access-token`) a ferramenta imprime o passo humano exato de que precisa e sai com código diferente de zero em vez de fingir.

## 🛰️ Atrás de um proxy

**Opcional — recomendado em escala (limites de cadastro por IP e banimentos).** A ferramenta também funciona sem proxy.

- **Com um pool:** passe `--pool <file>` (ou defina `ZAI_PROXIES`) e as requisições saem por uma saída dessa lista (`http://host:port`, `socks5://host:port`, `host:port`, `user:pass@host:port`). Uma linha morta faz aquela tentativa falhar; a lista é testada com `--screen`.
- **Sem um pool:** a CLI imprime `running WITHOUT a proxy (direct)` e conecta diretamente — a etapa OAuth, a criação de chaves e o gate de chat permanecem inalterados.
- O painel bloqueia WARP, e a etapa de cadastro é fixa por host: mantenha uma saída por sessão durante todo o fluxo em vez de rotacionar no meio da execução.

## 📄 Arquivos

| Caminho | Conteúdo |
| --- | --- |
| `keys.txt` | uma `<apiKey>.<secretKey>` verificada ao vivo por linha — ignorada pelo git |
| `proxies.txt` | suas saídas, uma por linha — ignorada pelo git |
| `launcher.config.json` | configurações lembradas do launcher — ignoradas pelo git |

Nada mais é gravado: a CLI nunca armazena uma sessão, um token de negócio ou um token de poll OAuth em disco.

## 🔌 Conectar ao 9Router

[9Router](https://9router.com) é um roteador auto-hospedado e compatível com OpenAI. Registre este provedor uma vez e cada chave em `keys.txt` se torna uma conexão sob um nó de provedor:

```bash
node src/connect-9router.js
```

Padrões: `--base http://localhost:20128`, `--password 123456`, `--name "

## 🔌 Conectar ao OmniRoute

[OmniRoute](https://omniroute.online) é um roteador auto-hospedado e compatível com OpenAI. Registre este provedor uma vez e cada chave em `keys.txt` se torna uma conexão sob um nó de provedor:

```bash
node src/connect-omniroute.js
```

Padrões: `--base http://localhost:20128`, `--password 123456`, `--name "

Z.AI"`, `--prefix zai`, `--base-url https://api.z.ai/api/paas/v4`, `--model glm-4.5-flash`. Os modelos são servidos como `zai/<model id>` e balanceados entre todas as chaves.

## 🔑 O que uma chave oferece

| | |
| --- | --- |
| 🏢 Provedor | **Z.AI** — [z.ai](https://z.ai) |
| 🎁 O que o provedor oferece | Camada gratuita GLM — chaves criadas pela etapa OAuth do zcode, cada uma verificada por chat |
| 🔑 O que uma chave oferece | uma chave de API limitada à sua própria conta: os 1 ids de modelo no endpoint abaixo, nos limites do seu plano. A cota fica na **conta**, e é exatamente por isso que esta ferramenta cria uma conta por chave |
| 🌐 Formato da API | Compatível com OpenAI: `POST https://api.z.ai/api/paas/v4/chat/completions` |
| 🔒 Seus dados | apenas z.ai e o backend de caixa de entrada que você configurar são contatados; as chaves permanecem na sua máquina |

## 🐞 Problemas

Se a Z.AI alterar os endpoints do console, o formato do OAuth ou a lista de modelos da camada gratuita, a ferramenta para nessa etapa e imprime o status e o corpo que viu. **[Abra uma issue](../../issues)** com o comando e a saída exata; PRs são bem-vindos.

## 📄 Licença

MIT © 2026 — veja [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 z-ai-bulk-apikey contributors

</div>