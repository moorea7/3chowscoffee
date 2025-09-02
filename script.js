const YEAR = new Date().getFullYear();
document.getElementById('year').textContent = YEAR;
document.getElementById('foot-year').textContent = YEAR;

const filterChips = [...document.querySelectorAll('.chip')];
let coffeesCache = [];

async function init(){
  try{
    const res = await fetch('coffees.json', {cache:'no-store'});
    const data = await res.json();
    coffeesCache = (data.coffees || []).filter(c => c.available !== false);
    renderCoffees(coffeesCache);
    const venmo = data.venmo || {};
    const url = venmo.url || (venmo.username ? `https://venmo.com/u/${venmo.username.replace(/^@/, '')}` : null);
    if(url){
      ['venmo-link','venmo-link-hero','venmo-link-sticky'].forEach(id => {
        const a = document.getElementById(id);
        if(a) a.href = url;
      });
    }
  }catch(e){ console.error(e); }
}
init();

function renderCoffees(list){
  const container = document.getElementById('coffee-list');
  const empty = document.getElementById('empty-state');
  container.innerHTML = '';
  if(!list.length){ empty.hidden = false; return; }
  empty.hidden = true;
  document.getElementById('coffee-count').textContent = String(list.length);
  for(const c of list){
    const card = document.createElement('article');
    card.className = 'card';
    const pack = c.pack || '250g bag';
    const price = c.price || '$15 / 250g';
    const roast = c.roast ? `<span class="badge">${c.roast}</span>` : '';
    const origin = c.origin ? `<span class="origin">• ${c.origin}</span>` : '';
    card.innerHTML = `
      <h3>${c.name}</h3>
      <div class="meta">${roast} ${origin}</div>
      ${c.notes ? `<div class="notes">${c.notes}</div>` : ''}
      <div class="dim">${pack}${c.grind ? ' • ' + c.grind : ''}</div>
      <div class="price">${price}</div>
    `;
    container.appendChild(card);
  }
}

filterChips.forEach(chip => {
  chip.addEventListener('click', () => {
    filterChips.forEach(c => c.setAttribute('aria-pressed', String(c===chip)));
    const key = chip.dataset.filter;
    if(key === 'All'){ renderCoffees(coffeesCache); return; }
    const filtered = coffeesCache.filter(c => (c.roast || '').includes(key));
    renderCoffees(filtered);
  });
});
