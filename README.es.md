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

**Crea claves API de Z.AI (GLM) en masa — inferencia compatible con OpenAI desde api.z.ai, más un conector 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-1%20served-412991?style=for-the-badge)](https://z.ai)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Inicio rápido](#-quick-start) · [🎁 Nivel gratuito](#-free-tier--how-much-you-get) · [🤖 Modelos](#-models--all-1-of-them) · [🧪 Usar la API](#-how-to-use-the-api) · [✅ Verificado](#-verified-working--every-key-is-tested) · [🧭 Cómo funciona](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Opciones](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problemas](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Por qué existe esto

Z.AI sirve la familia GLM a través de un endpoint **compatible con OpenAI** en `https://api.z.ai/api/paas/v4`, y el nivel gratuito es real: `glm-4.5-flash` responde a una llamada de chat en vivo con una clave tomada directamente de un proyecto de la consola (medido — ver *Verificado*). La parte interesante es la clave que no cuesta nada crear: un proyecto de la consola de Z.AI entrega **cualquier cantidad de claves** (`POST …/projects/{pid}/api_keys`), y cada una se comprueba con un chat-200 antes de aterrizar en `keys.txt`. La unidad que escala es **una cuenta (una sesión) por flota de claves**: cada clave de un proyecto consume la misma cuota, así que cuotas separadas implican cuentas separadas — por eso la herramienta toma una sesión por ejecución en lugar de acuñar claves de la nada.

## 🎁 Nivel gratuito — cuánto obtienes

| Qué | Valor |
| --- | --- |
| Modelo gratuito | **`glm-4.5-flash`** — la única clase que responde el nivel gratuito |
| Modelos de pago | `glm-4.6`, `glm-4.5`, `glm-5.3` → `429 {"error":{"code":"1113","message":"Insufficient balance or no resource package"}}` (medido 2026-10-21) |
| Modelo desconocido | `glm-4.6-flash` → `400` modelo desconocido |
| Tarjeta requerida | **No** para el nivel flash |
| Límite de velocidad | ninguno observado — 12 llamadas consecutivas en 27,5 s devolvieron todas 200 |
| Claves por cuenta | cualquier cantidad en el mismo proyecto; **comparten la cuota de la cuenta** |

> El nivel gratuito lo define Z.AI y puede cambiar. Consulta los números en vivo en [z.ai](https://z.ai) — y deja que la propia puerta de la herramienta decida: `node src/cli.js --verify-only` vuelve a probar cada clave de `keys.txt` con una llamada real a `glm-4.5-flash`.

> 💡 El nivel gratuito lo define Z.AI y puede cambiar. Consulta los números en vivo en [z.ai](https://z.ai) — y deja que la propia puerta de la herramienta decida:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelos — los 1 que hay

**Un id está verificado en vivo en el nivel gratuito**: `glm-4.5-flash` — el modelo de puerta predeterminado para cada clave que escribe esta herramienta (y por lo tanto el único que registra con el router).

| ID del modelo | Estado con una clave de nivel gratuito |
| --- | --- |
| `glm-4.5-flash` | **200** con contenido real — la puerta de la herramienta |
| `glm-4.6`, `glm-4.5`, `glm-5.3` | `429` — `Insufficient balance or no resource package` |
| `glm-4.6-flash` | `400` — modelo desconocido |

El endpoint es compatible con OpenAI (`GET /api/paas/v4/models` y `POST /api/paas/v4/chat/completions`), así que una clave con saldo alcanza el resto del catálogo con la misma URL base.

## 🧪 Cómo usar la API

La URL base es **`https://api.z.ai/api/paas/v4`** — compatible con OpenAI, así que cualquier cliente de OpenAI funciona.

```bash
curl https://api.z.ai/api/paas/v4/chat/completions \
  -H "Authorization: Bearer <apiKey>.<secretKey>" \
  -H "Content-Type: application/json" \
  -d '{"model":"glm-4.5-flash","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

Una clave es el par **`<apiKey>.<secretKey>`** de la consola — ambas mitades, unidas con un punto, van en la cabecera `Authorization: Bearer` (el `apiKey` solo no es suficiente).

## 🛠 Inicio rápido

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

### De dónde viene la sesión

La **cabeza de registro está ligada a un captcha y no se automatiza aquí**. Registrarse en `chat.z.ai` implica pasar un slider INPAINTING de Aliyun 2.0, y su callback de éxito del SDK no se dispara en modo headless — la SPA nunca envía `POST /auths/signup`, así que de esa parte no sale ninguna cuenta ni ninguna clave (medido 2026-10-22; ver *Verificado*). Por eso la herramienta parte de una sesión que ya posees, y dice exactamente qué paso necesita un navegador:

1. regístrate en `https://chat.z.ai` en un navegador (resuelve el slider); el correo lleva un token `verify-…`
2. `POST https://chat.z.ai/api/v1/auths/verify_email` `{username,email,token}`
3. `POST https://chat.z.ai/api/v1/auths/finish_signup` `{username,email,token,password,profile_image_url:"/user.png",sso_redirect:""}` → `user.token` es el **JWT de sesión**
4. entrega ese JWT al CLI: `node src/cli.js --jwt-file session-jwt.txt --count N` — el resto (intercambio OAuth → inicio de sesión en la consola → proyecto → claves → puerta de chat) se ejecuta en modo headless.

### 🖱️ El launcher

El launcher pide la lista de proxies, la cantidad y el modelo de verificación, los recuerda en `launcher.config.json` y ejecuta el CLI con los flags correctos — además de los conectores 9Router y OmniRoute.

## ✅ Verificado y funcionando — cada clave se prueba

| Comprobación | Resultado |
| --- | --- |
| `POST /api/paas/v4/chat/completions` con una clave de consola | **200** — `glm-4.5-flash`, contenido real |
| tres claves de `keys.txt` | las tres con chat-200 con `glm-4.5-flash`, producidas en una misma cuenta/org (cuota compartida) |
| `POST api.z.ai/api/auth/z/login {token}` | **200** — token de negocio |
| `GET /api/biz/customer/getCustomerInfo` | **200** — `data.organizations[].projects[].projectId` |
| `POST …/projects/{pid}/api_keys` y luego `GET …/api_keys/copy/{apiKey}` | **200** — `"<apiKey>.<secretKey>"` |
| Cola OAuth (`zcode` init → `chat.z.ai/api/oauth/authorize` → callback → poll) | **200** con un JWT de sesión; la llamada de autorización toma **form-urlencoded** (cuerpo JSON → 422), la ventana del flujo es de ~8 min |
| Cabeza de registro (`chat.z.ai`, slider INPAINTING de Aliyun) | **falla en headless** — el callback de éxito del SDK nunca se dispara, `/auths/signup` nunca se envía (2 intentos de arrastre, Aliyun `F008`, `signupBody=null`) |

> **Puertas de calidad.** Cada clave aquí pasó un `chat-200` en vivo antes de escribirse en `keys.txt`
> (las claves muertas nunca se entregan). Las combinaciones del router siguen la misma regla a nivel de modelo: una entrada se
> añade **solo si el modelo responde `chat-200` y puede llamar a herramientas** — un modelo sin soporte de herramientas,
> una clave muerta o un proveedor muerto se descarta en lugar de añadirse. Vuelve a ejecutar el paso de verificación cuando quieras;
> los fallos se reportan, nunca se ocultan.

> **Puertas de calidad.** Cada clave aquí pasó un `chat-200` en vivo antes de escribirse en `keys.txt`
> (las claves muertas nunca se entregan). Las combinaciones del router siguen la misma regla a nivel de modelo: una entrada se
> añade **solo si el modelo responde `chat-200` y puede llamar a herramientas** — un modelo sin soporte de herramientas,
> una clave muerta o un proveedor muerto se descarta en lugar de añadirse. Vuelve a ejecutar el paso de verificación cuando quieras;
> los fallos se reportan, nunca se ocultan.

## 🧭 Cómo funciona

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Z.AI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.z.ai/api/paas/v4/chat/completions → real content = the key is live
```

| Paso | Llamada | Notas |
| --- | --- | --- |
| cabeza de registro | página `chat.z.ai` | **solo humano/navegador** — slider INPAINTING de Aliyun 2.0; el callback de éxito del SDK nunca se dispara en headless |
| verificación de correo | `POST /api/v1/auths/verify_email {username,email,token}` | antes de `finish_signup`; un reenvío invalida el token anterior |
| sesión | `POST /api/v1/auths/finish_signup {…}` | devuelve `user.token` — el JWT de sesión (`--jwt-file`) |
| oauth | `POST zcode.z.ai/api/v1/oauth/cli/init` → `POST chat.z.ai/api/oauth/authorize` (**form-urlencoded**, `action=approve`) → callback del CLI → `GET …/cli/poll/{flow}` | `data.zai.access_token`, ventana de ~8 min (`--access-token` omite esto) |
| inicio de sesión | `POST api.z.ai/api/auth/z/login {token}` | → token de negocio |
| ids | `GET /api/biz/customer/getCustomerInfo` | `organizations[].projects[].projectId` |
| clave | `POST /api/biz/v1/organization/{oid}/projects/{pid}/api_keys` → `GET …/api_keys/copy/{apiKey}` | → `<apiKey>.<secretKey>` |
| puerta | `POST /api/paas/v4/chat/completions` | `glm-4.5-flash` 200 con contenido = la clave se escribe en `keys.txt` |

## ⚙️ Opciones del CLI

```bash
node src/cli.js --jwt-file session-jwt.txt --count N   # OAuth tail → mint N keys
node src/cli.js --access-token <zcode-token> --count N   # skip OAuth, mint from a token
node src/cli.js --verify-only                            # re-test every key in keys.txt
node src/cli.js --screen                                 # probe the pool exits against api.z.ai
node src/cli.js --help
```

| Flag | Significado |
| --- | --- |
| `--count N` | claves a acuñar en el proyecto de la cuenta (predeterminado `1`) |
| `--jwt-file <f>` | **JWT de sesión** de `chat.z.ai`; el CLI ejecuta el intercambio OAuth de zcode con él |
| `--access-token <t>` | un **token de acceso de zcode**, cuando el paso OAuth ya está hecho |
| `--verify-only` | prueba con chat cada línea de `keys.txt` con `--model`, no escribe nada |
| `--screen` | sondea cada salida del pool contra `api.z.ai:443` |
| `--pool <f>` | lista de salidas, una `http://host:port` por línea (env `ZAI_PROXIES`) |
| `--model <m>` | modelo para la puerta en vivo (predeterminado `glm-4.5-flash` — el modelo del nivel gratuito) |

| Variable de entorno | Predeterminado | Significado |
| --- | --- | --- |
| `ZAI_PROXIES` | `proxies.txt` | pool de salidas opcional, un proxy por línea |
| `ZAI_MODEL` | `glm-4.5-flash` | modelo usado para la puerta en vivo |

`keys.txt` se lee desde el **directorio de trabajo actual**; sin una sesión (`--jwt-file`/`--access-token`) la herramienta imprime el paso humano exacto que necesita y sale con código distinto de cero en lugar de fingir.

## 🛰️ Detrás de un proxy

**Opcional — recomendado a escala (límites de registro por IP y baneos).** La herramienta también funciona sin proxy.

- **Con un pool:** pasa `--pool <file>` (o define `ZAI_PROXIES`) y las peticiones salen por una salida de esa lista (`http://host:port`, `socks5://host:port`, `host:port`, `user:pass@host:port`). Una línea muerta hace fallar ese intento; la lista se filtra con `--screen`.
- **Sin un pool:** el CLI imprime `running WITHOUT a proxy (direct)` y se conecta directamente — la cola OAuth, la creación de claves y la puerta de chat no cambian.
- El panel bloquea WARP, y la cabeza de registro es sticky por host: mantén una salida por sesión durante todo el flujo en lugar de rotar a mitad de ejecución.

## 📄 Archivos

| Ruta | Contenido |
| --- | --- |
| `keys.txt` | una `<apiKey>.<secretKey>` verificada en vivo por línea — ignorada por git |
| `proxies.txt` | tus salidas, una por línea — ignorada por git |
| `launcher.config.json` | ajustes recordados del launcher — ignorado por git |

No se escribe nada más: el CLI nunca almacena una sesión, un token de negocio ni un token de sondeo OAuth en disco.

## 🔌 Conectar con 9Router

[9Router](https://9router.com) es un router autoalojado y compatible con OpenAI. Registra este proveedor una vez y cada clave de `keys.txt` se convierte en una conexión bajo un único nodo de proveedor:

```bash
node src/connect-9router.js
```

Predeterminados: `--base http://localhost:20128`, `--password 123456`, `--name "

## 🔌 Conectar con OmniRoute

[OmniRoute](https://omniroute.online) es un router autoalojado y compatible con OpenAI. Registra este proveedor una vez y cada clave de `keys.txt` se convierte en una conexión bajo un único nodo de proveedor:

```bash
node src/connect-omniroute.js
```

Predeterminados: `--base http://localhost:20128`, `--password 123456`, `--name "

Z.AI"`, `--prefix zai`, `--base-url https://api.z.ai/api/paas/v4`, `--model glm-4.5-flash`. Los modelos se sirven como `zai/<model id>` y se balancean entre todas las claves.

## 🔑 Qué te da una clave

| | |
| --- | --- |
| 🏢 Proveedor | **Z.AI** — [z.ai](https://z.ai) |
| 🎁 Qué da el proveedor | Nivel gratuito de GLM — claves acuñadas a través de la cola OAuth de zcode, cada una verificada por chat |
| 🔑 Qué te da una clave | una clave API limitada a su propia cuenta: los 1 ids de modelo en el endpoint de abajo, con los límites de tu plan. La cuota vive en la **cuenta**, que es exactamente por lo que esta herramienta crea una cuenta por clave |
| 🌐 Forma de la API | Compatible con OpenAI: `POST https://api.z.ai/api/paas/v4/chat/completions` |
| 🔒 Tus datos | solo se contacta con z.ai y el backend de correo que configures; las claves permanecen en tu máquina |

## 🐞 Problemas

Si Z.AI cambia los endpoints de la consola, la forma del OAuth o la lista de modelos del nivel gratuito, la herramienta se detiene en ese paso e imprime el estado y el cuerpo que vio. **[Abre un issue](../../issues)** con el comando y la salida exacta; los PR son bienvenidos.

## 📄 Licencia

MIT © 2026 — ver [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 z-ai-bulk-apikey contributors

</div>