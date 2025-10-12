// Global state
let coffeesCache = [];
let categoryKey = 'All';
let availabilityKey = 'All';
let roastKey = 'All';
let rnCache = [];

// Helpers
function roastMatches(roast, key){
  if(!key || key === 'All') return true;
  if(!roast) return false;
  const r = String(roast).trim().toLowerCase();
  const k = key.toLowerCase();
  if(k === 'city'){ return r === 'city'; }
  if(k === 'city+'){ return r === 'city+'; }
  if(k === 'full city'){ return r === 'full city'; }
  if(k === 'full city+'){ return r === 'full city+'; }
  return r.includes(k);
}

// Safe element getter
function el(id){ return document.getElementById(id); }

// Global card factory (used across sections, including Ready Now)
function mk(c){
  const card = document.createElement('article');
  card.className = 'card';
  const pack = c.pack || '250g bag';
  const price = c.price || '$15 / 250g';
  const roast = c.roast ? `<span class="badge">${c.roast}</span>` : '';
  const origin = c.origin ? `<span class="origin">• ${c.origin}</span>` : '';
  const category = c.category ? `<span class="badge category">${c.category}</span>` : '';
  const cat2 = c.category2 ? `<span class="badge category">${c.category2}</span>` : '';
  const qtyLine = (c.qty != null) ? '<div class="dim qty">Qty Available: ' + c.qty + '</div>' : '';
  const roastDateLine = c.roastDate ? '<div class="dim roast-date">' + c.roastDate + '</div>' : '';

  card.innerHTML = `
    <h3>${c.name || ''}</h3>
    <div class="meta">${roast} ${origin} ${category} ${cat2}</div>
    ${c.notes ? `<div class="notes">${c.notes}</div>` : ''}
    <div class="dim">
    ${pack}${c.grind ? ' • ' + c.grind : ''}</div>
    ${roastDateLine}
    ${qtyLine}
    <div class="price">${price}</div>
  `;
  return card;
}

// Render grouped by category for coffees.json
function renderCoffees(list){
  const soHead = el('so-head');
  const blendHead = el('blend-head');
  const so = el('coffee-list-so');
  const blend = el('coffee-list-blend');
  const empty = el('empty-state');

  if(!so || !blend || !soHead || !blendHead){
    console.error('Missing coffee list containers in HTML.');
    return;
  }

  so.innerHTML = '';
  blend.innerHTML = '';
  let soCount = 0, blendCount = 0;

  const available = list || [];
  if(!available.length){
    if(empty) empty.hidden = false;
    soHead.hidden = true; blendHead.hidden = true;
    return;
  }
  if(empty) empty.hidden = true;

  const soList = [];
  const blendList = [];
  for(const c of available){
    const cat = ((c && c.category) ? c.category : 'Single Origin').toLowerCase();
    if(cat === 'blend' || cat === 'blends'){
      blendList.push(c);
    }else{
      soList.push(c);
    }
  }

  if(soList.length){
    soHead.hidden = false;
    for(const c of soList){ so.appendChild(mk(c)); soCount++; }
  }else{
    soHead.hidden = true;
  }

  if(blendList.length){
    blendHead.hidden = false;
    for(const c of blendList){ blend.appendChild(mk(c)); blendCount++; }
  }else{
    blendHead.hidden = true;
  }

  if(!soCount && !blendCount){
    if(empty) empty.hidden = false;
  }
}

// Combined filters

// Toggle visibility of Ready Now vs Ready to Roast sections
function fadeIn(el){ if(!el) return; el.classList.remove('fade-in'); void el.offsetWidth; el.classList.add('fade-in'); }

function applyAvailabilityVisibility(){
  const rnHead = el('ready-now-head');
  const rnList = el('ready-now-list');
  const rtrHead = el('rtr-head');
  const soHead = el('so-head');
  const blendHead = el('blend-head');
  const so = el('coffee-list-so');
  const blend = el('coffee-list-blend');

  const showRN = (availabilityKey === 'All' || availabilityKey === 'Ready Now');
  const showRTR = (availabilityKey === 'All' || availabilityKey === 'Ready to Roast');

  [rnHead, rnList].forEach(n => { if(n){ n.style.display = showRN ? '' : 'none'; }});
  [rtrHead, soHead, blendHead, so, blend].forEach(n => { if(n){ n.style.display = showRTR ? '' : 'none'; }});
}


// Render Ready Now cards from a list of mapped objects
function renderReadyNow(list){
  const rnList = el('ready-now-list');
  const rnHead = el('ready-now-head');
  if(!rnList || !rnHead) return;
  rnList.innerHTML = '';
  if(Array.isArray(list) && list.length){
    rnHead.hidden = false;
    list.forEach(obj => rnList.appendChild(mk(obj)));
  }else{
    rnHead.hidden = false; // keep header visible when filtering to zero results
    const p = document.createElement('p');
    p.className = 'muted';
    p.textContent = 'No Ready Now coffees match the current filters.';
    rnList.appendChild(p);
  }
}

function applyFilters(){

  let list = coffeesCache.slice().filter(c => c && c.available === true);
  if(roastKey !== 'All'){
    list = list.filter(c => roastMatches(c.roast || '', roastKey));
  }
  if(categoryKey !== 'All'){
    if(categoryKey === 'Ready to Roast'){
      // All non-ready-now items
      list = list.filter(c => (String(c.category || '')).toLowerCase() !== 'ready now');
    }else{
      list = list.filter(c => (c.category || 'Single Origin').toLowerCase() === categoryKey.toLowerCase());
    }
  }
    // Apply same roast/type filters to Ready Now cache
  let rnListFiltered = rnCache.slice();
        rnListFiltered = rnListFiltered.filter(c => c && c.available === true);
  if(roastKey !== 'All'){
    rnListFiltered = rnListFiltered.filter(c => roastMatches(c.roast || '', roastKey));
  }
  if(categoryKey !== 'All'){
    rnListFiltered = rnListFiltered.filter(c => (c.category2 || 'Single Origin').toLowerCase().replace('blends','blend') === categoryKey.toLowerCase().replace('blends','blend'));
  }
  renderReadyNow(rnListFiltered);
  renderCoffees(list);

  applyAvailabilityVisibility();
}

// Init after DOM ready
console.info('[ReadyNow] v5 loaded');
document.addEventListener('DOMContentLoaded', async () => {
  try{
    const res = await fetch('coffees.json', {cache:'no-store'});
    const data = await res.json();
    coffeesCache = (data.coffees || []).filter(Boolean);

    // Wire Venmo button in Order section
    const venmo = data.venmo || {};
    const url = venmo.url || (venmo.username ? `https://venmo.com/u/${String(venmo.username).replace(/^@/, '')}` : null);
    const orderBtn = el('venmo-link-order');
    if(url && orderBtn){ orderBtn.href = url; }

    // Setup filter chips
    // Availability chips
    const availChips = [...document.querySelectorAll('.chip-avail')];
    availChips.forEach(chip => {
      chip.addEventListener('click', () => {
        availChips.forEach(c => c.setAttribute('aria-pressed', String(c===chip)));
        availabilityKey = chip.dataset.avail;
        applyFilters();
      });
    });
    const roastChips = [...document.querySelectorAll('.chip-roast')];
    const catChips = [...document.querySelectorAll('.chip-cat')];

    roastChips.forEach(chip => {
      chip.addEventListener('click', () => {
        roastChips.forEach(c => c.setAttribute('aria-pressed', String(c===chip)));
        roastKey = chip.dataset.filter;
        applyFilters();
      });
    });

    catChips.forEach(chip => {
      chip.addEventListener('click', () => {
        catChips.forEach(c => c.setAttribute('aria-pressed', String(c===chip)));
        categoryKey = chip.dataset.cat;
        applyFilters();
      });
    });

    // ---- Ready Now (pre-roasted inventory) ----
    try {
      const rnRes = await fetch('./ready_to_go_coffees.json?v=' + Date.now(), { cache: 'no-store' });
      if (rnRes.ok) {
        const rn = await rnRes.json();
        const rnList = document.getElementById('ready-now-list');
        const rnHead = document.getElementById('ready-now-head');
        if (rnHead) rnHead.hidden = false;
        if (Array.isArray(rn) && rn.length && rnList) {
          rnCache = rn.map(item => {
          const cat = item.Category || (/(?:^|\s)blend/i.test(item.Name) ? 'Blend' : 'Single Origin');
          return {
            name: item.Name,
            roast: item.RoastLevel,
            notes: item.TastingNotes || '',
            roastDate: item.DateRoasted ? 'Roasted: ' + item.DateRoasted : '',
            pack: (item.PackageSize ? item.PackageSize + ' bag' : '250g bag'),
            price: (item.Price ? ('$' + item.Price + ' / ' + (item.PackageSize || '250g')) : '$15 / 250g'),
            category: 'Ready Now',
            category2: cat,
            origin: undefined,
            available: ((String(item.available).toLowerCase() === 'true') && (Number(item.QuantityAvailable || 0) > 0)),
            qty: Number(item.QuantityAvailable || 0),
            qty: item.QuantityAvailable
          };
        });
        // Render Ready Now now with current roast/type filters
        let rnListFiltered = rnCache.slice();
        rnListFiltered = rnListFiltered.filter(c => c && c.available === true);
        if(roastKey !== 'All'){
          rnListFiltered = rnListFiltered.filter(c => roastMatches(c.roast || '', roastKey));
        }
        if(categoryKey !== 'All'){
          rnListFiltered = rnListFiltered.filter(c => (c.category2 || 'Single Origin').toLowerCase().replace('blends','blend') === categoryKey.toLowerCase().replace('blends','blend'));
        }
        renderReadyNow(rnListFiltered);

        } else if (rnList) {
          const p = document.createElement('p');
          p.className = 'muted';
          p.textContent = 'No Ready Now coffees at the moment — check back soon!';
          rnList.appendChild(p);
        }
      }
    } catch (e) {
      console.warn('Ready Now load failed', e);
    }
    // ---- End Ready Now ----

    // Apply initial visibility based on availabilityKey
    applyAvailabilityVisibility();

    // Initial render
    applyFilters();
  }catch(e){
    console.error(e);
  }
});