/* NEXUS ALGO — Dashboard screen.
 *
 * Shows: connection status pill, account balance (live from /account/balance),
 * a compact market + resolution selector, and the bot control button that
 * opens the market/chart view.
 */
function renderDashboard() {
  const el = document.createElement("section");
  el.className = "screen screen--dashboard";
  el.innerHTML = `
    <div class="status-row">
      <span class="status-pill" id="dashStatus">—</span>
      <span class="status-time" id="dashTime">—</span>
    </div>

    <div class="balance-card">
      <div class="balance-card__label">Account balance</div>
      <div class="balance-card__value" id="dashBalance">—</div>
      <div class="balance-card__sub" id="dashBalanceSub">No data yet</div>
    </div>

    <div class="market-row">
      <div class="market-row__label">Market</div>
      <button class="market-chip" id="dashMarket">
        <span class="market-chip__name" id="dashMarketName">Select market</span>
        <span class="market-chip__arrow">›</span>
      </button>
    </div>

    <div class="bot-card">
      <div class="bot-card__head">
        <span class="bot-dot" id="botDot"></span>
        <span class="bot-card__label" id="botLabel">Bot</span>
      </div>
      <div class="bot-card__sub" id="botSub">Stopped</div>
      <div class="bot-card__log" id="botLog"></div>
      <button class="btn btn--primary btn--block" id="dashOpenMarket">Open market view</button>
    </div>
  `;

  el.querySelector("#dashMarket").addEventListener("click", () => ROUTER.navigate("market"));
  el.querySelector("#dashOpenMarket").addEventListener("click", () => ROUTER.navigate("market"));

  BUS.on("connection", () => updateDashboard(el));
  BUS.on("balance", () => updateDashboard(el));
  BUS.on("bot", () => updateDashboard(el));
  BUS.on("market", () => updateDashboard(el));

  updateDashboard(el);
  return el;
}

function updateDashboard(el) {
  const status = STATE.connection;
  const pill = el.querySelector("#dashStatus");
  pill.textContent = status === "online" ? "Online" : status === "connecting" ? "Connecting" : status === "error" ? "Error" : "Offline";
  pill.className = "status-pill status-pill--" + status;

  const time = el.querySelector("#dashTime");
  if (STATE.lastChecked) time.textContent = new Date(STATE.lastChecked).toLocaleTimeString();
  else time.textContent = "—";

  const bal = el.querySelector("#dashBalance");
  const sub = el.querySelector("#dashBalanceSub");
  if (STATE.balance) {
    bal.textContent = (STATE.balance.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    sub.textContent = `${STATE.balance.currency || ""} · available ${(STATE.balance.available ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else {
    bal.textContent = "—";
    sub.textContent = STATE.authenticated ? "Loading balance…" : "Not connected";
  }

  const mname = el.querySelector("#dashMarketName");
  mname.textContent = STATE.market ? STATE.market.replace("CS.D.", "").replace(".MAX.CFD", "") : "Select market";

  const dot = el.querySelector("#botDot");
  const label = el.querySelector("#botLabel");
  const botsub = el.querySelector("#botSub");
  const log = el.querySelector("#botLog");
  dot.className = "bot-dot bot-dot--" + STATE.botStatus;
  label.textContent = STATE.botStatus === "running" ? "Bot running" : STATE.botStatus === "starting" ? "Bot starting" : STATE.botStatus === "stopping" ? "Bot stopping" : STATE.botStatus === "error" ? "Bot error" : "Bot stopped";
  botsub.textContent = STATE.botStatus === "running" ? "Monitoring live candles" : STATE.botStatus === "stopped" ? "Ready to start" : STATE.botStatus;
  log.innerHTML = STATE.botLog.slice(-4).map((l) => `<div class="bot-card__log-line">${l}</div>`).join("") || `<div class="bot-card__log-line">No activity</div>`;
}