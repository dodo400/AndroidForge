/* NEXUS ALGO — Login screen.
 *
 * Collects the official Capital.com credentials:
 *   - username / password (account login)
 *   - API key (generated in the Capital.com client area → API)
 * POSTs to /api/v1/session and stores the X-CAP-AUTH-TOKEN in memory only.
 */
function renderLogin() {
  const el = document.createElement("section");
  el.className = "screen screen--login";
  el.innerHTML = `
    <div class="login-card">
      <div class="login-card__logo">◆</div>
      <h1 class="login-card__title">NEXUS ALGO</h1>
      <p class="login-card__sub">Automated trading on Capital.com</p>

      <form id="loginForm" class="login-form" autocomplete="off">
        <label class="field">
          <span class="field__label">Username / email</span>
          <input type="text" id="fUsername" class="field__input" autocomplete="username" required />
        </label>
        <label class="field">
          <span class="field__label">Password</span>
          <input type="password" id="fPassword" class="field__input" autocomplete="current-password" required />
        </label>
        <label class="field">
          <span class="field__label">API key</span>
          <input type="password" id="fApiKey" class="field__input" autocomplete="off" required />
          <span class="field__hint">Generate in your Capital.com account → API.</span>
        </label>

        <button type="submit" class="btn btn--primary btn--block" id="loginSubmit">
          <span class="btn__text">Connect</span>
          <span class="btn__spinner" hidden>◯</span>
        </button>
      </form>

      <div id="loginError" class="login-error" hidden></div>

      <p class="login-foot">
        Credentials are sent only to Capital.com and never stored on this device.
      </p>
    </div>
  `;

  const form = el.querySelector("#loginForm");
  const submit = el.querySelector("#loginSubmit");
  const errorEl = el.querySelector("#loginError");

  const showErr = (msg) => {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  };
  const clearErr = () => { errorEl.hidden = true; };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErr();
    submit.disabled = true;
    submit.querySelector(".btn__spinner").hidden = false;
    STATE.connection = "connecting";
    BUS.emit("connection", STATE.connection);

    const creds = {
      username: el.querySelector("#fUsername").value.trim(),
      password: el.querySelector("#fPassword").value,
      apiKey: el.querySelector("#fApiKey").value.trim(),
    };

    const r = await window.NEXUS_API.login(creds);
    if (!r.ok) {
      showErr(r.error || "Login failed.");
      submit.disabled = false;
      submit.querySelector(".btn__spinner").hidden = true;
      STATE.connection = "error";
      STATE.lastError = r.error || "Login failed";
      BUS.emit("connection", STATE.connection);
      return;
    }

    STATE.authenticated = true;
    STATE.broker = { id: "capital.com", name: "Capital.com" };
    STATE.token = window.NEXUS_API.token;
    STATE.connection = "online";
    BUS.emit("auth", true);
    BUS.emit("connection", "online");

    submit.disabled = false;
    submit.querySelector(".btn__spinner").hidden = true;
    ROUTER.navigate("dashboard");
  });

  return el;
}