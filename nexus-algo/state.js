/* NEXUS ALGO — shared state + event bus.
 *
 * Single source of truth for the whole app. Every screen reads from
 * STATE and emits events through the bus; nothing else touches localStorage
 * or the DOM directly.
 */
const STATE = {
  // Auth
  authenticated: false,
  broker: null,            // { id, name }
  token: null,

  // Connection
  connection: "offline",  // offline | connecting | online | error
  lastError: null,        // last API error string
  lastChecked: 0,         // epoch ms of last successful ping

  // Account
  balance: null,          // { balance, available, currency, ... } or null
  account: null,          // raw account details

  // Market
  market: null,           // epic string, e.g. "CS.D.EURUSD.MAX.CFD"
  resolution: "15m",
  markets: [],            // cached market list
  candles: [],            // last fetched OHLC array

  // Bot
  botRunning: false,
  botStatus: "stopped",   // stopped | starting | running | stopping | error
  botLog: [],             // recent log lines
};

const BUS = {
  _handlers: {},
  on(event, fn) {
    (this._handlers[event] ||= []).push(fn);
  },
  emit(event, payload) {
    (this._handlers[event] || []).forEach((fn) => {
      try { fn(payload); } catch (e) { console.error(e); }
    });
  },
  once(event, fn) {
    const wrap = (p) => { fn(p); BUS.off(event, wrap); };
    BUS.on(event, wrap);
  },
  off(event, fn) {
    if (this._handlers[event]) {
      this._handlers[event] = this._handlers[event].filter((h) => h !== fn);
    }
  },
};

window.NEXUS_STATE = STATE;
window.NEXUS_BUS = BUS;