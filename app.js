// ===== Edit only this part for each café =====
const CONFIG = {
  name: 'Brew & Bean',
  tagline: 'Fresh coffee, good vibes',
  currency: '₹',
  sheetCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSyAOzX9e7Ho0e9h3b3mUG5F8x7GiQv-tQWiNU4fWPvMqHsns8SQCPQ9MIiN0Rhd3sa0wUF8SzSxe--/pub?gid=4278897&single=true&output=csv' // paste Google Sheet "Publish to web" CSV link here. Empty = use menu.csv
};
// =============================================

const $ = s => document.querySelector(s);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const yes = v => ['y', 'yes', 'true', '1', 'veg'].includes(String(v || '').trim().toLowerCase());
const no = v => ['n', 'no', 'false', '0'].includes(String(v || '').trim().toLowerCase());
let items = [], cats = [], cat = 'All', query = '';

function render() {
  const list = $('#list'); list.replaceChildren();
  const shown = items.filter(i => (cat === 'All' || i.category === cat) && (i.name + ' ' + i.description).toLowerCase().includes(query));
  if (!shown.length) return list.append(el('p', 'empty', 'No items found'));
  let last = '';
  shown.forEach(i => {
    if (cat === 'All' && i.category !== last) { list.append(el('h2', 'cat', i.category)); last = i.category; }
    const card = el('div', 'item' + (i.out ? ' out' : ''));
    if (i.photo.startsWith('http')) { const im = el('img'); im.src = i.photo; im.alt = i.name; im.loading = 'lazy'; card.append(im); }
    const info = el('div', 'info'), name = el('div', 'name');
    name.append(el('span', 'dot ' + (i.veg ? 'veg' : 'nonveg')), el('span', null, i.name));
    info.append(name);
    if (i.description) info.append(el('p', 'desc', i.description));
    card.append(info, el('div', 'price', i.out ? 'Sold out' : CONFIG.currency + i.price));
    list.append(card);
  });
}

function chips() {
  const nav = $('#chips'); nav.replaceChildren();
  ['All', ...cats].forEach(c => {
    const b = el('button', 'chip' + (c === cat ? ' on' : ''), c);
    b.onclick = () => { cat = c; chips(); render(); };
    nav.append(b);
  });
}

function start(rows) {
  items = rows.filter(r => r.name && r.name.trim()).map(r => ({
    category: (r.category || 'Menu').trim(), name: r.name.trim(), price: (r.price || '').trim(),
    description: (r.description || '').trim(), veg: yes(r.veg), out: no(r.available), photo: (r.photo || '').trim()
  }));
  cats = [...new Set(items.map(i => i.category))];
  items.sort((a, b) => cats.indexOf(a.category) - cats.indexOf(b.category));
  chips(); render();
}

document.title = CONFIG.name + ' Menu';
$('#cafe-name').textContent = CONFIG.name;
$('#tagline').textContent = CONFIG.tagline;
$('#search').oninput = e => { query = e.target.value.toLowerCase(); render(); };
Papa.parse(CONFIG.sheetCsvUrl || 'menu.csv', {
  download: true, header: true, skipEmptyLines: true,
  complete: r => start(r.data),
  error: () => { $('#list').replaceChildren(el('p', 'empty', 'Could not load the menu. Please ask the staff.')); }
});
