# Advanced: session inheritance

The one-command path of this tool mints keys on an account that already exists.
The sign-up head (`https://chat.z.ai`) cannot be automated: the page is behind an
**Aliyun 2.0 INPAINTING** slider whose SDK success callback never fires headless,
so the SPA never sends `POST /auths/signup` (measured 2026-10-22: two drag
attempts, Aliyun `VerifyCode F008`, `signupBody=null`, no `/auths/signup` request
in the traffic). The flags below are the escape hatch: do the sign-up once by
hand, then let the CLI run the rest headlessly.

They are deliberately **not** in `--help` — the menu/tooling questions never
mention them, and a normal user never needs them.

## 1. Get a session (once, in a browser)

1. Sign up on <https://chat.z.ai> (solve the slider) — the mail carries a
   `verify-…` token.
2. `POST https://chat.z.ai/api/v1/auths/verify_email` with
   `{username, email, token}`.
3. `POST https://chat.z.ai/api/v1/auths/finish_signup` with
   `{username, email, token, password, profile_image_url:"/user.png", sso_redirect:""}`
   → the answer's `user.token` is the **session JWT**.
4. Save that JWT to a file, e.g. `session-jwt.txt`.

## 2. Hand the session to the CLI

```bash
# OAuth tail: session JWT -> zcode CLI access token -> mint N keys
node src/cli.js --jwt-file session-jwt.txt --count 3

# If you already ran the OAuth exchange yourself, skip it:
node src/cli.js --access-token <zcode-access-token> --count 3
```

Both flags are parsed exactly like the documented ones
(`--jwt-file <path>`, `--access-token <token>`); running `--count N` without a
session prints the manual chain above and exits non-zero — nothing is written.

## 3. What still applies

`keys.txt` and `keys-dead.txt` live in the current working directory; a key is
written only after a live chat-200 on `--model`, and a key the panel refuses
outright (401/403, ban or quota wording) is parked in `keys-dead.txt` as
`key<TAB>reason<TAB>ISO date`. A 429, a 5xx or a transport failure never lands
there — those are exit/pace problems, not dead keys.
