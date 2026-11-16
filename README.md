# حلّة — Halla

React storefront theme for [Salla](https://salla.sa), customized for 3areb's
digital games and subscriptions store. It retains the Halla look and its six
editable home sections while using Salla's React theme engine for catalog,
product, cart, account, and checkout routes.

## Quick start

You need pnpm 10 and Node.js 22 (22.22.2 or later), 24 (24.15.0 or later) or 26+.

Scaffold a new theme with the Salla CLI:

```bash
npx @salla.sa/cli@beta theme create
```

Or work directly inside a copy of this package:

```bash
pnpm install
pnpm dev
```

Running `salla theme dev` writes a `.env` with `VITE_STORE_DOMAIN`
(defaults to the demo store), which points the dev server at your store's data,
and `VITE_TWILIGHT_URL`, the fallback twilight SDK build used only when the
store's settings don't pin a release (`theme.twilight.version`).

## Scripts

| Script                | Description                         |
| --------------------- | ----------------------------------- |
| `pnpm dev`            | Start the Vite dev server (workerd) |
| `pnpm build`          | Production build                    |
| `pnpm preview`        | Preview the production build        |
| `pnpm typecheck`      | TypeScript type checking            |
| `pnpm test`           | Run the test suite (Vitest)         |
| `pnpm check:manifest` | Validate `twilight.json`            |

## Salla publication

The source repository for this theme is
[yty767lk-cell/sl3](https://github.com/yty767lk-cell/sl3). Import or connect it
from the Salla Partners Portal before submitting a publication request.

Before submission, run:

```bash
salla theme doctor
pnpm check:manifest
pnpm typecheck
pnpm test
pnpm build
```

Then use `salla theme publish` from the theme folder. Salla builds the pushed
commit and sends it for review; this command does not make the theme live
immediately. The Partners Portal listing also needs a category, price, four
screenshots with Arabic and English titles/descriptions, at least one preview
store, and a bilingual publication note. Add a support email, website, phone
number, live-chat link, and documentation link. Salla also checks the partner
account's company and services-certificate verification.
