import { NextResponse } from "next/server";

// Public, agent-facing JSON. CORS-open so other agents (Bankr, MCP clients) can read
// the fund's live state cross-origin.
export function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "content-type",
      "cache-control": "public, max-age=15, s-maxage=15",
      ...(init?.headers ?? {}),
    },
  });
}

export function options() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "content-type",
    },
  });
}
