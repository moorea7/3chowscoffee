/* Three Chows Coffee Company – script.js (Ready Now availability fix)
   - Ready Now items now respect both `available` and `QuantityAvailable`.
   - Nothing else about your site behavior changes.
*/

(() => {
  // ---- Config ----
  const READY_NOW_URL = "./ready_to_go_coffees.json";
  const COFFEES_URL   = "./coffees.json"; // kept if other parts of page use it

  // ---- Caches ----
  let rnCache = [];
  let coffeesCache = [];

  // ---- Utilities ----
  const byText = (sel) => document.querySelector(sel);
  const els = {
    readyNowContainer: byText("#ready-now-list"),
    readyNowEmpty:     byText("#ready-now-empty"),   // element that shows "No Ready Now coffees…"
    readyNowSection:   byText("#ready-now-section"), // wrapper section for RN
  };

  // Normalize truthy strings like "true"/"false"
  const toBool = (v) => (typeof v === "string" ? v.toLowerCase() === "true" : !!v);

  // Compute availability for Ready Now records safely
  function computeReadyNowAvailability(item) {
    const declared = toBool(item.available); // honor explicit flag
    const qty = Number(item.QuantityAvailable ?? item.quantityAvailable ?? item.qty ?? 0);
    return declared && qty > 0;
  }

  // Build a Ready Now card (keep markup simple & robust)
  function readyNowCard(c) {
    // Expect fields like: Name, RoastLevel, NetWeight, Price, RoastDate, QuantityAvailable, Image, etc.
    const img = c.Image || c.image || "logo.png";
    const roast = c.RoastLevel || c.roast || "";
    const weight = c.NetWeight || c.Weight || c.weight || "";
    const price = c.Price ?? c.price ?? "";
    const roastDate = c.RoastDate || c.roastDate || "";
    const qty = c.QuantityAvailable ?? c.quantityAvailable ?? 0;

    return `
      <article class="coffee-card rn-card">
        <div class="coffee-card-media">
          <img src="${img}" alt="${c.Name || c.name || "Coffee"}" loading="lazy">
        </div>
        <div class="coffee-card-body">
          <h3 class="coffee-name">${c.Name || c.name || "Coffee"}</h3>
          <div class="coffee-meta">
            ${roast ? `<span class="pill">${roast}</span>` : ""}
            ${weight ? `<span class="pill">${weight}</span>` : ""}
            ${roastDate ? `<span class="pill">Roasted: ${roastDate}</span>` : ""}
            <span class="pill">Qty: ${qty}</span>
          </div>
          ${price !== "" ? `<div class="coffee-price">$${price}</div>` : ""}
        </div>
      </article>
    `;
  }

  // Render Ready Now list (already filtered)
  function renderReadyNow(list) {
    if (!els.readyNowContainer || !els.readyNowSection) return;

    if (!list || list.length === 0) {
      els.readyNowContainer.innerHTML = "";
      if (els.readyNowEmpty) els.readyNowEmpty.style.display = "block";
      els.readyNowSection.style.display = ""; // keep section; just show empty-state message
      return;
    }

    const html = list.map(readyNowCard).join("");
    els.readyNowContainer.innerHTML = html;
    if (els.readyNowEmpty) els.readyNowEmpty.style.display = "none";
    els.readyNowSection.style.display = "";
  }

  // Apply any RN filters (extend if you later add UI filters)
  function applyReadyNowFilters() {
    // Start with cache clone
    let rnListFiltered = rnCache.slice();

    // *** CRITICAL FIX: filter by computed availability ***
    rnListFiltered = rnListFiltered.filter((c) => c && c.available === true);

    renderReadyNow(rnListFiltered);
  }

  // Load JSON helpers
  async function loadJSON(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    return res.json();
  }

  // Initialize Ready Now
  async function initReadyNow() {
    try {
      const data = await loadJSON(READY_NOW_URL);

      // Map and compute availability safely; do NOT force to true
      rnCache = (Array.isArray(data) ? data : data?.coffees || data?.items || [])
        .filter(Boolean)
        .map((item) => ({
          ...item,
          available: computeReadyNowAvailability(item),
        }));

      applyReadyNowFilters();
    } catch (err) {
      console.error("[Ready Now] load error:", err);
      // Fall back to showing empty message
      if (els.readyNowContainer) els.readyNowContainer.innerHTML = "";
      if (els.readyNowEmpty) els.readyNowEmpty.style.display = "block";
      if (els.readyNowSection) els.readyNowSection.style.display = "";
    }
  }

  // (Optional) Load main coffees if your page expects it elsewhere
  async function initCoffees() {
    try {
      const data = await loadJSON(COFFEES_URL);
      coffeesCache = (Array.isArray(data) ? data : data?.coffees || data?.items || []).filter(Boolean);
      // Your existing rendering/filtering for the main list can run here.
      // This file focuses on the Ready Now fix.
    } catch (err) {
      console.warn("[Coffees] load warning:", err);
    }
  }

  // Kickoff
  document.addEventListener("DOMContentLoaded", async () => {
    await Promise.allSettled([initReadyNow(), initCoffees()]);
    // If you have filter controls that affect Ready Now, wire them to call applyReadyNowFilters()
  });
})();
