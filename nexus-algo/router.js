/* NEXUS ALGO — minimal router.
 *
 * Hash-based routing so the app works offline from a plain file:// URL.
 * Routes: #/login  #/dashboard  #/market  #/account
 */
const ROUTER = {
  routes: {
    login: () => renderLogin(),
    broker: () => renderBroker(),
    dashboard: () => renderDashboard(),
    market: () => renderMarket(),
    account: () => renderAccount(),
  },
  current: null,

  navigate(route) {
    if (!this.routes[route]) route = "login";
    this.current = route;
    location.hash = "#" + route;
    this.render();
    BUS.emit("route", route);
  },

  render() {
    const stack = document.getElementById("viewStack");
    if (!stack) return;
    stack.innerHTML = "";
    const fn = this.routes[this.current];
    if (fn) stack.appendChild(fn());
    this.syncChrome();
  },

  syncChrome() {
    const topbar = document.getElementById("topbar");
    const tabbar = document.getElementById("tabbar");
    const showChrome = this.current && this.current !== "login" && this.current !== "broker";
    topbar.hidden = !showChrome;
    tabbar.hidden = !showChrome;
    if (showChrome) {
      document.getElementById("topbarSub").textContent =
        STATE.broker ? STATE.broker.name : "—";
      document.querySelectorAll(".tab").forEach((t) => {
        t.classList.toggle("tab--active", t.dataset.route === this.current);
      });
    }
  },
};

window.NEXUS_ROUTER = ROUTER;

// Boot
window.addEventListener("hashchange", () => {
  const r = (location.hash || "#/login").replace(/^#/, "").replace(/^\//, "");
  ROUTER.current = r;
  ROUTER.render();
});