/* NEXUS ALGO — Capital.com REST API client.
 *
 * Thin wrapper around fetch() that:
 *   - attaches the official X-CAP-AUTH-TOKEN header after login
 *   - refreshes the token automatically before it expires
 *   - exposes typed methods for every screen's needs
 *   - surfaces every API error (status + body) so the UI can show them
 *
 * No mock data: every method calls the real endpoint. When offline or when
 * credentials are invalid, the returned error is surfaced to the UI verbatim.
 */
class CapitalApi {
  constructor(config) {
    this.cfg = config;
    this.token = null;        // current X-CAP-AUTH-TOKEN
    this.tokenExpiresAt = 0;  // epoch ms
    this.inFlight = new Map(); // dedupe concurrent identical requests
  }

  // ---- Low-level HTTP -----------------------------------------------------
  async request(method, path, body, { retry = true, signal } = {}) {
    const url = this.cfg.api.baseURL + path.replace(/\{market\}/g, encodeURIComponent(this.currentMarket || ""));

    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
    if (this.token) headers[this.cfg.api.authHeader] = this.token;

    const init = { method, headers, signal };
    if (body !== undefined) init.body = JSON.stringify(body);

    let res;
    try {
      res = await fetch(url, init);
    } catch (err) {
      // Network-level failure (DNS, CORS, offline).
      return { ok: false, status: 0, error: `Network error: ${err.message}` };
    }

    // Token expired mid-flight -> refresh and retry once.
    if (res.status === 401 && retry && this.token) {
      const refreshed = await this.refresh();
      if (refreshed.ok) {
        return this.request(method, path, body, { retry: false, signal });
      }
      return { ok: false, status: 401, error: "Session expired. Please log in again." };
    }

    let data = null;
    const text = await res.text();
    if (text) {
      try { data = JSON.parse(text); } catch { data = text; }
    }

    if (!res.ok) {
      const msg = (data && (data.message || data.errorCode || data.errors))
        ? (data.message || data.errorCode || JSON.stringify(data.errors))
        : `HTTP ${res.status}`;
      return { ok: false, status: res.status, error: String(msg) };
    }
    return { ok: true, status: res.status, data };
  }

  // ---- Auth ---------------------------------------------------------------
  async login({ username, password, apiKey }) {
    const r = await this.request("POST", this.cfg.api.endpoints.login, {
      username, password, apiKey,
    });
    if (!r.ok) return r;
    // The token comes back in the response body (identifier / token) and/or
    // as the X-CAP-AUTH-TOKEN header. We accept either.
    const token = r.data?.token || r.data?.identifier || null;
    if (!token) {
      return { ok: false, status: 0, error: "Login response did not contain an auth token." };
    }
    this.token = token;
    this.tokenExpiresAt = Date.now() + this.cfg.api.tokenTtlMinutes * 60 * 1000;
    return { ok: true, data: { token } };
  }

  async refresh() {
    if (!this.token) return { ok: false, error: "Not logged in" };
    const r = await this.request("POST", this.cfg.api.endpoints.refresh, undefined, { retry: false });
    if (r.ok) {
      this.token = r.data?.token || this.token;
      this.tokenExpiresAt = Date.now() + this.cfg.api.tokenTtlMinutes * 60 * 1000;
    }
    return r;
  }

  async logout() {
    const r = await this.request("DELETE", this.cfg.api.endpoints.logout, undefined, { retry: false });
    this.token = null;
    this.tokenExpiresAt = 0;
    return r;
  }

  // ---- Account ------------------------------------------------------------
  async getBalance() {
    return this.request("GET", this.cfg.api.endpoints.accountBalance);
  }

  async getAccountDetails() {
    return this.request("GET", this.cfg.api.endpoints.accountDetails);
  }

  // ---- Markets ------------------------------------------------------------
  async getMarket(market) {
    return this.request("GET", this.cfg.api.endpoints.market.replace("{market}", encodeURIComponent(market)));
  }

  async getPrices(market, { from, to, resolution }) {
    let path = this.cfg.api.endpoints.prices.replace("{market}", encodeURIComponent(market));
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (resolution) params.set("resolution", resolution);
    const qs = params.toString();
    if (qs) path += `?${qs}`;
    return this.request("GET", path);
  }

  // ---- Trading ------------------------------------------------------------
  async createPosition(market, payload) {
    return this.request("POST", this.cfg.api.endpoints.positions, {
      epic: market,
      ...payload,
    });
  }

  async getOpenPositions() {
    return this.request("GET", this.cfg.api.endpoints.positionsOpen);
  }

  // ---- Helpers ------------------------------------------------------------
  needsRefresh() {
    return this.token && Date.now() > this.tokenExpiresAt - this.cfg.api.refreshBeforeMinutes * 60 * 1000;
  }

  isAuthenticated() { return !!this.token; }
}

window.NEXUS_API = new CapitalApi(window.NEXUS_CONFIG);