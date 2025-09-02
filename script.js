document.getElementById('year').textContent = new Date().getFullYear();

async function loadCoffees(){
  try{
    const res = await fetch('coffees.json');
    const data = await res.json();
    renderCoffees(data.coffees);
  } catch(err){ console.error(err); }
}

function renderCoffees(list){
  const container = document.getElementById('coffee-list');
  const empty = document.getElementById('empty-state');
  if(!list || list.length === 0){ empty.hidden = false; return; }
  empty.hidden = true;
  list.forEach(c => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<h3>${c.name}</h3>
      <div>${c.origin || ''}</div>
      <div>${c.roast || ''}</div>
      <div>${c.notes || ''}</div>
      <div class='price'>${c.price || '$15 / 250g'}</div>`;
    container.appendChild(card);
  });
}

loadCoffees();
