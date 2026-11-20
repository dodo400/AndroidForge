/* NEXUS ALGO — Broker selection screen.
 *
 * Capital.com is the only supported broker, per project scope. The card is
 * pre-selected and the user can only confirm — there is no other option to
 * switch between.
 */
function renderBroker() {
  const el = document.createElement("section");
  el.className = "screen screen--broker";
  el.innerHTML = `
    <div class="broker-card">
      <div class="broker-card__icon">◆</div>
      <h2 class="broker-card__title">Select broker</h2>
      <p class="broker-card__sub">Choose your trading data source.</p>

      <div class="broker-option broker-option--selected" aria-selected="true">
        <div class="broker-option__radio">✓</div>
        <div class="broker-option__body">
          <div class="broker-option__name">Capital.com</div>
          <div class="broker-option__desc">Official REST API · CFD trading</div>
          <div class="broker-option__tag">Only supported broker</div>
        </div>
      </div>

      <button class="btn btn--primary btn--block" id="brokerContinue">Continue</button>
      <button class="btn btn--ghost btn--block" id="brokerBack">Back to login</button>
    </div>
  `;

  el.querySelector("#brokerContinue").addEventListener("click", () => {
    ROUTER.navigate("login");
  });
  el.querySelector("#brokerBack").addEventListener("click", () => {
    ROUTER.navigate("login");
  });

  return el;
}