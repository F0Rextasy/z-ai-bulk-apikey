#!/usr/bin/env node
'use strict';

/**
 * z-ai-bulk-apikey CLI — mint Z.AI (z.ai / GLM) API keys and prove each one with
 * a live chat call.
 *
 * What actually works, measured 2026-10-21/22 (see the provider's description.txt
 * and the lab scripts proxy-lab/zai3-*.js|.py):
 *
 *   sign-up head (chat.z.ai)   — NOT implemented here. The page is protected by an
 *                                Aliyun 2.0 INPAINTING slider; the SDK success
 *                                callback that makes the SPA POST /auths/signup
 *                                never fires headless (measured: two drag attempts,
 *                                Aliyun F008, signupBody=null, no /auths/signup
 *                                request). No account, no key comes out of this leg.
 *                                → this CLI's entry point is a session you already
 *                                  have (see --jwt-file / --access-token below).
 *   verify_email + finish_signup — plain HTTP, but they need the verify-… token out of
 *                                the sign-up mail, which only exists after the head above.
 *   OAuth tail                 — real and headless from a chat.z.ai session JWT:
 *                                zcode init → chat.z.ai/api/oauth/authorize (approve)
 *                                → CLI callback → poll → zcode access token.
 *   key mint                   — real: api.z.ai/api/auth/z/login → getCustomerInfo →
 *                                POST …/projects/<pid>/api_keys (+ /copy/<apiKey>)
 *                                → "<apiKey>.<secretKey>".
 *
 * Usage:
 *   node src/cli.js --jwt-file session-jwt.txt --count 3
 *   node src/cli.js --access-token <zcode-access-token> --count 1
 *   node src/cli.js --verify-only
 *   node src/cli.js --screen
 *   node src/cli.js --help
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const proxy = require('./vendor/proxy.js');

const API = 'api.z.ai';
const PAAS = 'https://api.z.ai/api/paas/v4';
const ZCODE = 'https://zcode.z.ai';
const CHAT = 'https://chat.z.ai';

const argv = process.argv.slice(2);
const arg = (n, d) => {
  const i = argv.indexOf('--' + n);
  if (i === -1) return d;
  const v = argv[i + 1];
  return v === undefined || v.startsWith('--') ? true : v;
};
const has = (n) => argv.includes('--' + n);

const MODEL = String(arg('model', process.env.ZAI_MODEL || 'glm-4.5-flash'));
const COUNT = Math.max(1, Number(arg('count', 1)) || 1);
const POOL_FILE = String(arg('pool', process.env.ZAI_PROXIES || 'proxies.txt'));
const KEYS_FILE = path.join(process.cwd(), 'keys.txt');

/** Dead-key report beside keys.txt: only definite rejections — a 429/5xx/transport
 *  failure says nothing about the key. */
const DEAD_FILE = path.join(process.cwd(), 'keys-dead.txt');
const DEAD_STATUS = new Set([401, 403]);
const DEAD_REASON = /banned|deactivated|disabled|suspended|quota|insufficient|forbidden|unauthorized/i;
function recordDead(key, status, sample) {
  if (!key) return;
  if (!DEAD_STATUS.has(Number(status)) && !DEAD_REASON.test(String(sample || ''))) return;
  const why = `${status}${sample ? ' ' + String(sample).replace(/\s+/g, ' ').slice(0, 60) : ''}`;
  try {
    fs.appendFileSync(DEAD_FILE, `${key}\t${why}\t${new Date().toISOString()}\n`);
  } catch (e) { /* diagnostics must never break the run */ }
}

// ------------------------------------------------------------------- exits
// Fail-closed: live traffic leaves through an exit from the pool file (one
// `http://host:port` per line). No pool → direct, and the CLI says so.
function loadExits() {
  for (const f of [POOL_FILE, path.resolve(process.cwd(), POOL_FILE)]) {
    try {
      const list = proxy.loadPoolFile(f);
      if (list.length) return { proxies: list, file: f };
    } catch (e) { /* not there — try the next candidate */ }
  }
  return { proxies: [], file: null };
}

let EXITS = { proxies: [], file: null };
let exitTurn = 0;

function pickExit() {
  if (!EXITS.proxies.length) return null;
  const p = proxy.proxyForIndex(EXITS.proxies, exitTurn++);
  return p;
}

// -------------------------------------------------------------------- http
function request(url, { method = 'GET', headers = {}, body = null, agent = null, timeoutMs = 45000, raw = false } = {}) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const data = body === null || body === undefined
      ? null
      : raw ? String(body) : typeof body === 'string' ? body : JSON.stringify(body);
    const h = { accept: 'application/json', 'user-agent': 'Mozilla/5.0', ...headers };
    if (data !== null) {
      if (!raw && !h['content-type']) h['content-type'] = 'application/json';
      h['content-length'] = Buffer.byteLength(data);
    }
    const r = https.request({ host: u.hostname, port: u.port || 443, path: u.pathname + u.search, method, agent: agent || undefined, timeout: timeoutMs, headers: h }, (res) => {
      let b = '';
      res.setEncoding('utf8');
      res.on('data', (c) => (b += c));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: b }));
    });
    r.on('error', (e) => resolve({ status: 0, error: e.message, body: '' }));
    r.on('timeout', () => { r.destroy(); resolve({ status: 0, error: 'timeout', body: '' }); });
    if (data !== null) r.write(data);
    r.end();
  });
}

const jparse = (t) => { try { return JSON.parse(t); } catch (e) { return null; } };

/**
 * Some panels answer a `stream:false` request with a text/event-stream anyway;
 * a JSON-only reader then reports a live key as dead. Handle both.
 */
function readAssistant(text) {
  if (!text) return '';
  if (!/^\s*data:/m.test(text)) {
    const j = jparse(text) || {};
    const m = ((j.choices || [])[0] || {}).message || {};
    return String(m.content || m.reasoning_content || '').trim();
  }
  let out = '';
  for (const line of String(text).split(/\r?\n/)) {
    const m = /^data:\s*(.*)$/.exec(line.trim());
    if (!m) continue;
    if (m[1] === '[DONE]') break;
    const j = jparse(m[1]);
    if (!j) continue;
    const d = ((j.choices || [])[0] || {}).delta || {};
    out += String(d.content || d.reasoning_content || '');
  }
  return out.trim();
}

/** The gate every key must pass before it is written. */
async function chatGate(key, { agent = null, model = MODEL } = {}) {
  const r = await request(`${PAAS}/chat/completions`, {
    method: 'POST',
    agent,
    headers: { authorization: `Bearer ${key}` },
    body: { model, messages: [{ role: 'user', content: 'Reply with the single word: pong' }], max_tokens: 16, stream: false },
  });
  const text = readAssistant(r.body);
  return { status: r.status, text, body: String(r.body || '').slice(0, 300) };
}

// ----------------------------------------------------------------- sign-up
const SIGNUP_BLOCKER = [
  'No session to mint from.',
  '',
  'The sign-up head (chat.z.ai) is captcha-bound and is NOT automated here: the page',
  'is behind an Aliyun 2.0 INPAINTING slider, and its SDK success callback never fires',
  'headless — the SPA never POSTs /auths/signup (measured 2026-10-22: 2 drag attempts,',
  'Aliyun VerifyCode F008, signupBody=null, no /auths/signup request in the traffic).',
  '',
  'What a human/browser has to do, once:',
  '  1. sign up on https://chat.z.ai (solve the slider) — the mail carries a verify-… token',
  '  2. POST https://chat.z.ai/api/v1/auths/verify_email  {username,email,token}',
  '  3. POST https://chat.z.ai/api/v1/auths/finish_signup {username,email,token,password,',
  '     profile_image_url:"/user.png",sso_redirect:""}  → user.token = the session JWT',
  '',
  'Then hand that session JWT to this tool — the exact flags are in ADVANCED.md.',
].join('\n');

// OAuth tail: chat.z.ai session JWT → zcode CLI access token (headless).
async function oauthTail(jwt, agent) {
  const auth = { authorization: `Bearer ${jwt}` };
  const init = await request(`${ZCODE}/api/v1/oauth/cli/init`, {
    method: 'POST', agent,
    headers: { ...auth, authorization: `Bearer ${crypto.randomBytes(32).toString('hex')}` },
    body: { provider: 'zai' },
  });
  const ij = jparse(init.body) || {};
  const d = ij.data || {};
  console.log(JSON.stringify({ step: 'oauth-init', status: init.status, flow: d.flow_id, expires: d.expires_at }));
  if (!d.authorize_url) return { error: 'no authorize_url in oauth init', body: String(init.body).slice(0, 300) };

  const q = new URL(d.authorize_url).searchParams;
  // chat.z.ai/api/oauth/authorize takes form-urlencoded — a JSON body is 422
  // (`loc: [body, client_id]`), measured 2026-10-21.
  const form = new URLSearchParams({
    client_id: q.get('client_id'), redirect_uri: q.get('redirect_uri'), state: q.get('state'),
    response_type: 'code', action: 'approve',
  }).toString();
  const appr = await request(`${CHAT}/api/oauth/authorize`, {
    method: 'POST', agent, raw: true,
    headers: { ...auth, 'content-type': 'application/x-www-form-urlencoded' },
    body: form,
  });
  console.log(JSON.stringify({ step: 'oauth-approve', status: appr.status }));
  const mc = /code=(code-[0-9a-f]+)/.exec(appr.body || '');
  if (!mc) return { error: 'no code in authorize response', body: String(appr.body).slice(0, 300) };

  const cbUrl = `${ZCODE}/api/v1/oauth/cli/callback/zai?code=${mc[1]}&state=${q.get('state')}`;
  await request(cbUrl, { agent });
  for (let i = 0; i < 10; i++) {
    const poll = await request(`${ZCODE}/api/v1/oauth/cli/poll/${d.flow_id}`, {
      agent, headers: { authorization: `Bearer ${d.poll_token}` },
    });
    const pj = jparse(poll.body);
    const tok = pj && pj.data && pj.data.zai && pj.data.zai.access_token;
    if (tok) { console.log(JSON.stringify({ step: 'oauth-poll', n: i, ok: true })); return { accessToken: tok }; }
    await new Promise((r) => setTimeout(r, 3000));
  }
  return { error: 'oauth poll never returned an access token (flow window ~8 min)' };
}

// Mint tail: zcode access token → business token → project → keys.
async function mintTail(accessToken, agent, count) {
  const login = await request(`https://${API}/api/auth/z/login`, { method: 'POST', agent, body: { token: accessToken } });
  console.log(JSON.stringify({ step: 'login', status: login.status, body: String(login.body || '').slice(0, 300) }));
  const lj = jparse(login.body) || {};
  const ld = lj.data || lj;
  const biz = ld.access_token || ld.token || lj.access_token || lj.token;
  if (!biz) return { error: 'no business token in /api/auth/z/login response' };
  const auth = { authorization: `Bearer ${biz}` };

  const who = await request(`https://${API}/api/biz/customer/getCustomerInfo`, { agent, headers: auth });
  console.log(JSON.stringify({ step: 'customer', status: who.status }));
  const wj = jparse(who.body) || {};
  const d = wj.data || wj;
  let oid = d.organizationId || d.organization_id || (d.organization && d.organization.id);
  let pid = d.projectId || d.project_id || (d.project && d.project.id);
  for (const o of d.organizations || []) {
    oid = oid || o.organizationId || o.id;
    const p = (o.projects || [])[0] || {};
    pid = pid || p.projectId || p.id;
  }
  console.log(JSON.stringify({ step: 'ids', oid, pid }));
  if (!oid || !pid) return { error: 'could not find organization/project ids in getCustomerInfo' };

  const made = [];
  for (let i = 0; i < count; i++) {
    const created = await request(`https://${API}/api/biz/v1/organization/${oid}/projects/${pid}/api_keys`, {
      method: 'POST', agent, headers: auth, body: { name: `zai-${Date.now().toString(36)}-${i}` },
    });
    console.log(JSON.stringify({ step: 'createKey', n: i, status: created.status, body: String(created.body || '').slice(0, 200) }));
    const cj = jparse(created.body) || {};
    const cd = cj.data || cj;
    const apiKey = cd.apiKey || cd.api_key || cd.key || (cd.item && cd.item.apiKey);
    if (!apiKey) continue;
    const copy = await request(`https://${API}/api/biz/v1/organization/${oid}/projects/${pid}/api_keys/copy/${apiKey}`, { agent, headers: auth });
    const sj = jparse(copy.body) || {};
    const secret = (sj.data && (sj.data.secretKey || sj.data.secret)) || sj.secretKey || '';
    const full = secret ? `${apiKey}.${secret}` : apiKey;
    const chat = await chatGate(full, { agent });
    console.log(JSON.stringify({ step: 'chat', n: i, model: MODEL, status: chat.status, text: chat.text.slice(0, 60) }));
    if (chat.status === 200 && chat.text) made.push(full);
    else {
      recordDead(full, chat.status, chat.text);
      console.log(JSON.stringify({ step: 'skip', n: i, why: `chat gate failed (status ${chat.status})` }));
    }
  }
  return { made };
}

// ------------------------------------------------------------------ files
function readKeys() {
  try {
    return fs.readFileSync(KEYS_FILE, 'utf8').split(/\r?\n/).map((s) => s.trim()).filter((s) => s && !s.startsWith('#'));
  } catch (e) {
    return [];
  }
}

function appendKeys(keys) {
  const prev = readKeys();
  const all = [...new Set([...prev, ...keys])];
  fs.writeFileSync(KEYS_FILE, all.join('\n') + '\n');
  return all.length;
}

// ------------------------------------------------------------------- cmds
async function cmdVerify() {
  const keys = readKeys();
  if (!keys.length) {
    console.error(`no keys to verify (${KEYS_FILE} is missing or empty)`);
    return 1;
  }
  const vp = pickExit();
  const agent = vp ? proxy.createAgent(vp) : null;
  console.log(JSON.stringify({ step: 'verify', file: KEYS_FILE, count: keys.length, model: MODEL, proxy: agent ? 'pool' : 'direct' }));
  let live = 0;
  for (const key of keys) {
    const r = await chatGate(key, { agent });
    const ok = r.status === 200 && r.text;
    if (ok) live++;
    else recordDead(key, r.status, r.text);
    console.log(JSON.stringify({ key: key.slice(0, 8) + '…', status: r.status, live: !!ok, text: r.text.slice(0, 40) }));
  }
  console.log(JSON.stringify({ step: 'verify-done', live, dead: keys.length - live }));
  return live ? 0 : 1;
}

async function cmdScreen() {
  if (!EXITS.proxies.length) {
    const r = await chatGate('screen', { agent: null });
    console.log(JSON.stringify({ step: 'screen', mode: 'direct', note: 'no pool file — testing direct', status: r.status }));
    return 0;
  }
  console.log(JSON.stringify({ step: 'screen', pool: EXITS.file, exits: EXITS.proxies.length }));
  let live = 0;
  for (const p of EXITS.proxies) {
    const r = await proxy.probe(p, { host: API, port: 443, timeoutMs: 12000 });
    if (r.ok) live++;
    console.log(JSON.stringify({ exit: proxy.label ? proxy.label(p) : `${p.host}:${p.port}`, ok: r.ok, ms: r.ms, error: r.error }));
  }
  console.log(JSON.stringify({ step: 'screen-done', live, total: EXITS.proxies.length }));
  return live ? 0 : 1;
}

async function cmdMint() {
  const jwt = arg('jwt-file', null);
  const token = arg('access-token', null);
  if (jwt === true || token === true) {
    console.error('--jwt-file/--access-token need a value');
    return 1;
  }
  if (!jwt && !token) {
    console.error(SIGNUP_BLOCKER);
    return 1;
  }
  const p = pickExit();
  const agent = p ? proxy.createAgent(p) : null;
  console.log(JSON.stringify({ step: 'start', proxy: p ? (proxy.label ? proxy.label(p) : `${p.host}:${p.port}`) : 'direct', count: COUNT, model: MODEL }));

  let accessToken = token;
  if (!accessToken) {
    const jwtText = fs.readFileSync(String(jwt), 'utf8').trim();
    const oauth = await oauthTail(jwtText, agent);
    if (oauth.error) { console.error(JSON.stringify({ step: 'fatal', where: 'oauth', error: oauth.error, body: oauth.body })); return 1; }
    accessToken = oauth.accessToken;
  }

  const res = await mintTail(accessToken, agent, COUNT);
  if (res.error) { console.error(JSON.stringify({ step: 'fatal', where: 'mint', error: res.error })); return 1; }
  if (res.made.length) {
    const total = appendKeys(res.made);
    console.log(JSON.stringify({ step: 'keys.txt', added: res.made.length, total }));
  } else {
    console.log(JSON.stringify({ step: 'done', added: 0, note: 'no key passed its chat gate — nothing written' }));
  }
  return res.made.length ? 0 : 1;
}

const HELP = `z-ai-bulk-apikey — mint Z.AI (GLM) API keys, verify each with a live chat call.

Usage:
  node src/cli.js --count N      mint N keys on the account's project
  node src/cli.js --verify-only  re-test every key in keys.txt
  node src/cli.js --screen       test the pool exits against api.z.ai
  node src/cli.js --help

Flags:
  --count N            keys to mint on the account's project (default 1)
  --verify-only        chat-test every line of keys.txt with --model, write nothing
  --screen             probe each pool exit against api.z.ai:443
  --pool <f>           exit list, one http://host:port per line (env ZAI_PROXIES)
  --model <m>          model for the live gate (default glm-4.5-flash — free tier)
  --help               this text

The sign-up head (chat.z.ai) is captcha-bound and NOT automated: the Aliyun 2.0
INPAINTING slider's success callback never fires headless, so the SPA never sends
POST /auths/signup. This tool therefore starts from a session that already exists —
the advanced session-inheritance flags are documented in ADVANCED.md.

keys.txt lives in the current working directory; a key is written only after a
live chat-200 from ${PAAS}/chat/completions.`;

(async () => {
  if (has('help') || has('h') || argv.length === 0) {
    console.log(HELP);
    return 0;
  }
  EXITS = loadExits();
  if (EXITS.proxies.length) console.log(JSON.stringify({ step: 'pool', file: EXITS.file, exits: EXITS.proxies.length }));
  else console.log(JSON.stringify({ step: 'pool', file: POOL_FILE, exits: 0, note: 'running WITHOUT a proxy (direct)' }));

  if (has('verify-only')) return cmdVerify();
  if (has('screen')) return cmdScreen();
  return cmdMint();
})().then(
  (code) => process.exit(code || 0),
  (e) => { console.error('[fatal]', e && e.stack ? e.stack : e); process.exit(1); }
);
