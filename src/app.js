import { runChecks, score, autofix, SAMPLES } from './rules.js';
import { STATES } from './states.js';
const f = document.getElementById('f'), tbody = document.getElementById('items'), $ = id => document.getElementById(id);
document.querySelectorAll('.states').forEach(s => { s.innerHTML = '<option value="">Select…</option>' + Object.entries(STATES).map(([c, n]) => `<option value="${c}">${c} · ${n}</option>`).join(''); });
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function addRow(it = { desc: '', sac: '', qty: 1, rate: '', gst: 18 }) {
  const tr = document.createElement('tr');
  tr.innerHTML = `<td><input data-k="desc" value="${esc(it.desc)}" placeholder="Service"></td><td><input data-k="sac" value="${esc(it.sac)}" placeholder="998314"></td><td><input data-k="qty" value="${esc(it.qty)}" inputmode="decimal"></td><td><input data-k="rate" value="${esc(it.rate)}" inputmode="decimal"></td><td><input data-k="gst" value="${esc(it.gst)}" inputmode="decimal"></td><td><button type="button" class="del" aria-label="Remove line">×</button></td>`;
  tr.querySelector('.del').onclick = () => { tr.remove(); update(); }; tbody.append(tr);
}
function read() {
  const v = n => f.elements[n].value, c = n => f.elements[n].checked;
  return { supplierGstin: v('supplierGstin'), supplierState: v('supplierState'), composition: c('composition'), recipientGstin: v('recipientGstin'), recipientState: v('recipientState'), b2b: c('b2b'), invoiceNo: v('invoiceNo'), date: v('date'), lutNote: c('lutNote'),
    items: [...tbody.rows].map(r => Object.fromEntries([...r.querySelectorAll('input')].map(i => [i.dataset.k, i.value]))), charged: { cgst: v('cgst'), sgst: v('sgst'), igst: v('igst'), total: v('total') } };
}
function fill(inv) {
  for (const k of ['supplierGstin', 'supplierState', 'recipientGstin', 'recipientState', 'invoiceNo', 'date']) f.elements[k].value = inv[k] ?? '';
  for (const k of ['composition', 'b2b', 'lutNote']) f.elements[k].checked = !!inv[k];
  for (const k of ['cgst', 'sgst', 'igst', 'total']) f.elements[k].value = inv.charged[k] ?? '';
  tbody.innerHTML = ''; (inv.items.length ? inv.items : [undefined]).forEach(addRow); update();
}
const touched = inv => inv.supplierGstin || inv.invoiceNo || inv.items.some(i => i.rate);
function update() {
  const inv = read(), on = !!touched(inv); $('fix').disabled = $('print').disabled = !on;
  if (!on) { $('score').textContent = '–'; $('verdict').textContent = 'Fill in an invoice or load a sample'; $('counts').textContent = ''; $('checks').innerHTML = ''; $('ring').style.setProperty('--p', 0); return; }
  const res = runChecks(inv), sc = score(res), n = s => res.filter(r => r.status === s).length;
  $('score').textContent = sc; $('ring').style.setProperty('--p', sc); $('ring').style.setProperty('--c', sc === 100 ? 'var(--g)' : sc >= 70 ? 'var(--a)' : 'var(--r)');
  $('verdict').textContent = n('fail') ? `${n('fail')} issue${n('fail') > 1 ? 's' : ''} to fix before sending` : n('warn') ? 'Good to send, with a caveat' : 'Ready to send ✓';
  $('counts').textContent = `${n('pass')} passed · ${n('warn')} warnings · ${n('fail')} failed`;
  $('checks').innerHTML = res.map(r => `<li class="${r.status}"><b>${r.status === 'pass' ? '✓' : r.status === 'warn' ? '!' : '✕'} ${esc(r.title)}</b>${esc(r.msg)}${r.fix ? `<div class="fixit">→ ${esc(r.fix)}</div>` : ''}<div class="ref">${esc(r.ref)}</div></li>`).join('');
}
f.addEventListener('input', update); f.addEventListener('change', update); tbody.addEventListener('input', update);
$('add').onclick = () => { addRow(); update(); };
$('fix').onclick = () => fill(autofix(read()));
$('print').onclick = () => print();
$('reset').onclick = () => fill({ items: [], charged: {}, b2b: true });
document.querySelectorAll('[data-sample]').forEach(b => b.onclick = () => fill(structuredClone(SAMPLES[b.dataset.sample])));
fill({ items: [], charged: {}, b2b: true });
