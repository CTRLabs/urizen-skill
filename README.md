# URIZEN Skill

The fund, as an API. **No UI** — a headless skill any agent can call to read Urizen's
live state and buy **$URI** on Robinhood Chain (chain 4663).

## What it does

It reads the fund straight from the chain — nothing mocked, nothing stored:

- the fund's **book** (positions + NAV) and **tape** (on-chain fills), from the fund wallet
- the **$URI** price and a ready-to-sign **buy quote**
- the autonomous **strategies** the fund runs

## Endpoints (public, key-less, CORS-open)

| Capability | Call |
|---|---|
| Price & stats | `GET /api/fund/stats` |
| The book | `GET /api/fund/book` |
| The tape | `GET /api/fund/trades` |
| Strategies | `GET /api/fund/strategies` |
| Buy quote | `GET /api/fund/quote?side=buy&amount=0.01&taker=0x…` |
| Manifest | `GET /api/skill` |

`/` redirects to `/api/skill`. There is no web page.

## Skill package

`skill/SKILL.md` + `skill/catalog.json` — the Bankr-style descriptor. To publish, PR to
`BankrBot/skills`.

## Buy $URI

- Plain language: `@bankrbot buy $URI`
- App: https://ctrl.build/urizen

## Dev

```bash
npm install
npm run dev
npm run build
```

Non-custodial · can-trade, cannot-withdraw · not investment advice.
