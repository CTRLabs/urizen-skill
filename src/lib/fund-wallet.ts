// Live reads of the URIZEN fund wallet on Robinhood Chain (4663) — its positions
// (tokenized equities + crypto it holds) and its on-chain execution feed. Blockscout
// v2, no key. The wallet is the fund's non-custodial trading account.

import { ROBINHOOD_CHAIN } from "./chain";
import { STOCKS } from "./stocks";

const BS = ROBINHOOD_CHAIN.blockscoutApi;

export const FUND_WALLET = (process.env.NEXT_PUBLIC_FUND_WALLET ??
  "0x6e752fB542b2717eadafb6E2E6E9f593FCd51542") as `0x${string}`;

const STOCK_SET = new Set(STOCKS.map((s) => s.address.toLowerCase()));
const SYM_BY_ADDR = new Map(STOCKS.map((s) => [s.address.toLowerCase(), s]));

export type Position = {
  symbol: string;
  name: string;
  address: string;
  amount: number;
  valueUsd: number | null;
  kind: "equity" | "etf" | "crypto" | "cash";
};

/** The fund's book: every token it holds, valued in USD via Blockscout's fiat feed. */
export async function getPositions(wallet = FUND_WALLET): Promise<Position[]> {
  const r = await fetch(`${BS}/addresses/${wallet}/token-balances`, { next: { revalidate: 30 } });
  if (!r.ok) return [];
  const rows = (await r.json()) as any[];
  const out: Position[] = [];
  for (const it of rows ?? []) {
    const t = it.token ?? {};
    const addr = String(t.address_hash ?? t.address ?? "").toLowerCase();
    const dec = Number(t.decimals ?? 18) || 18;
    const amount = Number(it.value ?? 0) / 10 ** dec;
    if (!(amount > 0)) continue;
    const px = Number(t.exchange_rate ?? 0) || null;
    const stock = SYM_BY_ADDR.get(addr);
    out.push({
      symbol: t.symbol ?? stock?.symbol ?? "?",
      name: t.name ?? stock?.name ?? "Token",
      address: addr,
      amount,
      valueUsd: px ? amount * px : null,
      kind: STOCK_SET.has(addr)
        ? (stock?.kind ?? "equity")
        : /USDG|USDC|USDT|USDE/i.test(t.symbol ?? "")
          ? "cash"
          : "crypto",
    });
  }
  // biggest holdings first (valued ones on top)
  return out.sort((a, b) => (b.valueUsd ?? 0) - (a.valueUsd ?? 0));
}

export type FundTrade = {
  hash: string;
  timestamp: string;
  side: "buy" | "sell" | "move";
  symbol: string;
  name: string;
  amount: number;
  valueUsd: number | null;
};

/** The fund's live execution feed — real token movements in/out of the wallet. */
export async function getFundTrades(wallet = FUND_WALLET, limit = 20): Promise<FundTrade[]> {
  const r = await fetch(`${BS}/addresses/${wallet}/token-transfers?type=ERC-20`, {
    next: { revalidate: 20 },
  });
  if (!r.ok) return [];
  const { items } = (await r.json()) as { items: any[] };
  const w = wallet.toLowerCase();
  return (items ?? []).slice(0, limit).map((it) => {
    const t = it.token ?? {};
    const dec = Number(t.decimals ?? 18) || 18;
    const amount = Number(it.total?.value ?? 0) / 10 ** dec;
    const to = (it.to?.hash ?? "").toLowerCase();
    const px = Number(t.exchange_rate ?? 0) || null;
    return {
      hash: it.transaction_hash,
      timestamp: it.timestamp,
      side: to === w ? "buy" : (it.from?.hash ?? "").toLowerCase() === w ? "sell" : "move",
      symbol: t.symbol ?? "?",
      name: t.name ?? "Token",
      amount,
      valueUsd: px ? amount * px : null,
    };
  });
}

export type Book = {
  wallet: string;
  positions: Position[];
  navUsd: number | null;
  equityCount: number;
};

/** Assemble the fund's book: positions + a rough NAV (sum of valued holdings). */
export async function getBook(wallet = FUND_WALLET): Promise<Book> {
  const positions = await getPositions(wallet);
  const valued = positions.filter((p) => p.valueUsd != null);
  const navUsd = valued.length ? valued.reduce((s, p) => s + (p.valueUsd ?? 0), 0) : null;
  const equityCount = positions.filter((p) => p.kind === "equity" || p.kind === "etf").length;
  return { wallet, positions, navUsd, equityCount };
}
