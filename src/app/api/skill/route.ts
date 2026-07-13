import { json, options } from "@/lib/api";
import { URIZEN_TOKEN, URIZEN_POOL, ROBINHOOD_CHAIN } from "@/lib/chain";

export const revalidate = 300;
export const OPTIONS = options;

// The URIZEN Skill — a machine-readable capabilities manifest so any AI agent (Bankr, MCP client,
// autonomous treasury) can price, buy, hold, mirror and read the fund. This is the "scale file":
// the fund exposed as an on-chain-native primitive other agents plug into.
export async function GET() {
  return json({
    name: "urizen",
    provider: "URIZEN",
    description:
      "Urizen, as an API. Read the fund's live strategies and on-chain book, mirror its allocation to copy-trade it (e.g. via Bankr), follow its execution tape, see the reads behind its positions, and take one-token exposure via $URI — all on Robinhood Chain.",
    version: "0.3.0",
    homepage: "https://urizenfund.com",
    x: "https://x.com/urizenfund",
    token: {
      symbol: "URI",
      name: "Urizen",
      address: URIZEN_TOKEN,
      chainId: ROBINHOOD_CHAIN.id,
      chain: "robinhood",
      decimals: 18,
      poolId: URIZEN_POOL,
      pair: "WETH",
    },
    capabilities: [
      { id: "strategies", method: "GET", path: "/api/fund/strategies", desc: "The fund's own strategies — the autonomous mandates it runs, their targets and cadence." },
      { id: "book", method: "GET", path: "/api/fund/book", desc: "The fund's live on-chain positions (tokenized equities + crypto) and NAV." },
      { id: "mirror", method: "GET", path: "/api/fund/mirror", desc: "Copy-trade the fund: the live target weights of its real book, to replicate the allocation (e.g. via Bankr)." },
      { id: "trades", method: "GET", path: "/api/fund/trades", desc: "The fund's live on-chain execution feed." },
      { id: "signals", method: "GET", path: "/api/fund/signals", desc: "The reads behind the book — momentum/trend/RSI + stance on the names the fund trades." },
      { id: "stats", method: "GET", path: "/api/fund/stats", desc: "Live $URI price, market cap, liquidity, holders." },
      { id: "quote", method: "GET", path: "/api/fund/quote?side=buy&amount=0.01&taker=0x", desc: "Est-out + a ready-to-sign $URI swap tx on Robinhood Chain." },
    ],
    buy: {
      natural_language: "@bankrbot buy $URI",
      app: "https://ctrl.build/urizen",
      note: "Native ETH in, no approval; the tx credits the connected wallet.",
    },
    updatedAt: new Date().toISOString(),
  });
}
