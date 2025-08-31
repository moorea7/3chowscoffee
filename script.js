// Simple data-driven menu rendering for GitHub Pages (static)
document.getElementById('year').textContent = new Date().getFullYear();

async function loadCoffees(){
  try{
    const res = await fetch('coffees.json', {cache:'no-store'});
    if(!res.ok) throw new Error('Failed to load coffees.json');
    const data = await res.json();
    renderCoffees(data.coffees || []);
    // If Venmo username set in data, wire it to the button
    if(data.venmo){
      const link = document.getElementById('venmo-link');
      if(data.venmo.url){
        link.href = data.venmo.url;
      }else if(data.venmo.username){
        link.href = `https://venmo.com/u/${data.venmo.username.replace(/^@/, '')}`;
      }
    }
  }catch(e){
    console.error(e);
    renderCoffees([]);
  }
}

function renderCoffees(list){
  const container = document.getElementById('coffee-list');
  const empty = document.getElementById('empty-state');
  container.innerHTML='';
  const available = list.filter(c => c.available !== false);
  if(!available.length){
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  for(const c of available){
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${c.name} ${c.roast ? `<span class="badge">${c.roast}</span>` : ''}</h3>
      ${c.origin ? `<div class="dim">${c.origin}</div>` : ''}
      ${c.notes ? `<div class="notes">${c.notes}</div>` : ''}
      ${c.price ? `<div class="price">${c.price}</div>` : ''}
      ${c.pack || c.grind ? `<div class="dim">${[c.pack, c.grind].filter(Boolean).join(' • ')}</div>` : ''}
    `;
    container.appendChild(card);
  }
}

loadCoffees();
