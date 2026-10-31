// ===== Edit only this part for each café =====
const CONFIG = {
  name: 'Kailash Parbat',
  tagline: 'Taste & Tradition Since 1952',
  currency: '₹',
  sheetCsvUrl: '',        // Google Sheet "Publish to web" CSV link. Empty = use menu.csv
  logo: 'logo.png',       // café logo file in the same folder
  payment: true,          // false = menu only (₹3k plan), true = pay buttons (₹5k plan)
  review: true,           // show Google review button after paying
  upiId: '',              // e.g. cafe@okbank (café's own UPI ID)
  upiName: 'Kailash Parbat',
  upiQr: 'upi_qr.png',    // café's own UPI QR image
  googleReview: ''        // https://search.google.com/local/writereview?placeid=PLACE_ID
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

// ----- Branding -----
document.title = CONFIG.name + ' Menu';
$('#cafe-name').textContent = CONFIG.name;
$('#tagline').textContent = CONFIG.tagline;
const logo = new Image();
logo.onload = () => { document.documentElement.style.setProperty('--logo', `url("${CONFIG.logo}")`); const l = $('#logo'); l.src = CONFIG.logo; l.hidden = false; };
logo.src = CONFIG.logo;

// ----- Pay and review -----
const sheet = $('#sheet'), panel = $('#panel');
const btn = (t, fn, cls) => { const b = el('button', 'btn ' + (cls || ''), t); b.onclick = fn; return b; };
function view(title, ...nodes) {
  panel.replaceChildren();
  const x = el('button', 'x', '×'); x.onclick = () => { sheet.hidden = true; };
  panel.append(x, el('h3', null, title), ...nodes); sheet.hidden = false;
}
function reviewBtn() {
  if (!(CONFIG.review && CONFIG.googleReview)) return [];
  const a = el('a', 'btn gold', 'Rate us on Google ★'); a.href = CONFIG.googleReview; a.target = '_blank'; a.rel = 'noopener';
  return [el('p', 'note', 'Enjoyed your meal? Tell others.'), a];
}
const choose = () => view('How would you like to pay?', btn('Pay at counter', counter), btn('Pay online', online, 'alt'));
const counter = () => view('Thank you!', el('p', 'note', 'Please pay at the counter. We hope you enjoyed your meal.'), ...reviewBtn());
const paid = () => view('Thank you!', el('p', 'note', 'Please show the payment screen at the counter if asked.'), ...reviewBtn());
const onlyReview = () => view('Thank you!', ...reviewBtn());
function online() {
  const n = [], im = el('img', 'upi'); im.src = CONFIG.upiQr; im.alt = 'UPI QR'; im.onerror = () => im.remove();
  n.push(im, el('p', 'note', 'Scan with any UPI app and enter your bill amount.'));
  if (CONFIG.upiId) { const a = el('a', 'btn alt', 'Open UPI app'); a.href = 'upi://pay?pa=' + encodeURIComponent(CONFIG.upiId) + '&pn=' + encodeURIComponent(CONFIG.upiName) + '&cu=INR'; n.push(a); }
  n.push(btn("I've paid", paid)); view('Pay online', ...n);
}
sheet.onclick = e => { if (e.target === sheet) sheet.hidden = true; };
const bar = $('#pay-bar');
if (CONFIG.payment || (CONFIG.review && CONFIG.googleReview)) {
  bar.hidden = false;
  bar.textContent = CONFIG.payment ? 'Done eating? Pay & review' : 'Loved it? Rate us on Google';
  bar.onclick = CONFIG.payment ? choose : onlyReview;
}

$('#search').oninput = e => { query = e.target.value.toLowerCase(); render(); };
Papa.parse(CONFIG.sheetCsvUrl || 'menu.csv', {
  download: true, header: true, skipEmptyLines: true,
  complete: r => start(r.data),
  error: () => { $('#list').replaceChildren(el('p', 'empty', 'Could not load the menu. Please ask the staff.')); }
});
