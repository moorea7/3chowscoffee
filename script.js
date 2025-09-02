// Global state
let coffeesCache = [];
let categoryKey = 'All';
let roastKey = 'All';

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

// Render grouped by category
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

  const mk = (c) => {
    const card = document.createElement('article');
    card.className = 'card';
    const pack = c.pack || '250g bag';
    const price = c.price || '$15 / 250g';
    const roast = c.roast ? `<span class="badge">${c.roast}</span>` : '';
    const origin = c.origin ? `<span class="origin">• ${c.origin}</span>` : '';
    const category = c.category ? `<span class="badge category">${c.category}</span>` : '';
    card.innerHTML = `
      <h3>${c.name || ''}</h3>
      <div class="meta">${roast} ${origin} ${category}</div>
      ${c.notes ? `<div class="notes">${c.notes}</div>` : ''}
      <div class="dim">${pack}${c.grind ? ' • ' + c.grind : ''}</div>
      <div class="price">${price}</div>
    `;
    return card;
  };

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
function applyFilters(){
  let list = coffeesCache.slice().filter(c => c && c.available === true);
  if(roastKey !== 'All'){
    list = list.filter(c => roastMatches(c.roast || '', roastKey));
  }
  if(categoryKey !== 'All'){
    list = list.filter(c => (c.category || 'Single Origin').toLowerCase() === categoryKey.toLowerCase());
  }
  renderCoffees(list);
}

// Init after DOM ready
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

    // Initial render
    applyFilters();
  }catch(e){
    console.error(e);
  }
});
