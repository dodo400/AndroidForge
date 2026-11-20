/* NEXUS ALGO — Capital.com API configuration.
 *
 * These values reflect the official Capital.com REST API (see
 * https://api-docs.capital.com / https://www.capital.com/en-eu/trading-platforms/api-development-guide).
 *
 * Authentication model (official):
 *   - REST API base: https://api-capital.com/api/v1
 *   - Login: POST /api/v1/session  { username, password, apiKey }
 *   - Returns: X-CAP-AUTH-TOKEN  (bearer token, 30-min TTL)
 *   - Refresh:  POST /api/v1/session  with header X-CAP-AUTH-TOKEN (no body)
 *   - Logout:   DELETE /api/v1/session
 *
 *   - Account balance: GET /api/v1/account/balance
 *   - Markets:        GET /api/v1/markets/{market}
 *   - Historical prices (candles): GET /api/v1/markets/{market}/prices?from&to&resolution
 *   - Create order:   POST /api/v1/positions  (CFD)
 *
 * Secrets (apiKey, password) are entered by the user at runtime and never
 * stored in this file. Only the broker identity + endpoints are here.
 */
const CONFIG = {
  broker: {
    id: "capital.com",
    name: "Capital.com",
    description: "CFD trading via the official Capital.com REST API.",
  },

  // The single official API base. No other broker endpoints are referenced.
  api: {
    baseURL: "https://api-capital.com/api/v1",
    endpoints: {
      login: "/session",
      refresh: "/session",
      logout: "/session",
      accountBalance: "/account/balance",
      accountDetails: "/account",
      markets: "/markets",
      market: "/markets/{market}",
      prices: "/markets/{market}/prices",
      positions: "/positions",
      positionsOpen: "/positions/open",
      workingOrders: "/workingorders",
    },
    // Official auth header name returned by /session.
    authHeader: "X-CAP-AUTH-TOKEN",
    // Token TTL in minutes; we refresh proactively at 25 min.
    tokenTtlMinutes: 30,
    refreshBeforeMinutes: 25,
  },

  // Default market for the chart when the user has not picked one yet.
  defaults: {
    market: "CS.D.EURUSD.MAX.CFD",
    resolution: "15m",
  },

  // Supported price resolutions (Capital.com uses ISO 8601 durations).
  resolutions: {
    "1m": "1m",
    "5m": "5m",
    "15m": "15m",
    "30m": "30m",
    "1h": "1h",
    "4h": "4h",
    "1d": "1d",
    "1w": "1w",
  },

  // Pre-bundled popular markets (fetched from /markets at runtime; these are
  // only fallback labels so the UI never shows an empty selector).
  marketCategories: [
    { key: "forex", label: "Forex" },
    { key: "indices", label: "Indices" },
    { key: "commodities", label: "Commodities" },
    { key: "crypto", label: "Crypto" },
    { key: "shares", label: "Shares" },
  ],
};

// Expose to every script via the global window.
window.NEXUS_CONFIG = CONFIG;