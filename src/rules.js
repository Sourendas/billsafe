// BillSafe rule engine: pure functions, no DOM.
import { STATES } from './states.js';
const CH = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const VALID_RATES = [0, 0.1, 0.25, 1.5, 3, 5, 12, 18, 28];
const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
const r2 = n => Math.round(n * 100) / 100;

export function gstinChecksum(first14) {
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const p = CH.indexOf(first14[i]) * (i % 2 ? 2 : 1);
    sum += Math.floor(p / 36) + (p % 36);
  }
  return CH[(36 - (sum % 36)) % 36];
}
export function validateGstin(g) {
  g = (g || '').trim().toUpperCase();
  if (!/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(g)) return { ok: false, why: 'format' };
  if (!STATES[g.slice(0, 2)]) return { ok: false, why: 'state' };
  const c = gstinChecksum(g.slice(0, 14));
  return c === g[14] ? { ok: true } : { ok: false, why: 'checksum', expected: c };
}
export function computeTax(inv) {
  const taxable = r2(inv.items.reduce((s, it) => s + num(it.qty) * num(it.rate), 0));
  const tax = r2(inv.items.reduce((s, it) => s + num(it.qty) * num(it.rate) * num(it.gst) / 100, 0));
  const export_ = inv.recipientState === '96';
  const intra = !export_ && inv.supplierState === inv.recipientState;
  let cgst = 0, sgst = 0, igst = 0;
  if (inv.composition) {} else if (intra) { cgst = r2(tax / 2); sgst = r2(tax - cgst); } else if (!(export_ && inv.lutNote)) igst = tax;
  return { taxable, tax: r2(cgst + sgst + igst), cgst, sgst, igst, total: r2(taxable + cgst + sgst + igst), intra, export_ };
}
export function runChecks(inv) {
  const out = []; const add = (id, status, title, msg, fix, ref) => out.push({ id, status, title, msg, fix, ref });
  const c = computeTax(inv); const ch = { cgst: num(inv.charged.cgst), sgst: num(inv.charged.sgst), igst: num(inv.charged.igst), total: num(inv.charged.total) };
  // Supplier GSTIN
  const s = validateGstin(inv.supplierGstin);
  if (!s.ok) add('sup-gstin', 'fail', 'Supplier GSTIN', s.why === 'checksum' ? `Checksum digit is wrong; expected “${s.expected}”. Likely a typo.` : 'Not a valid 15-character GSTIN.', 'Copy your GSTIN exactly from your GST registration certificate (REG-06).', 'CGST Rule 46(a)');
  else if (inv.supplierGstin.trim().slice(0, 2).toUpperCase() !== inv.supplierState) add('sup-state', 'fail', 'Supplier state', `GSTIN is registered in ${STATES[inv.supplierGstin.slice(0, 2)]}, but you picked ${STATES[inv.supplierState] || 'nothing'}.`, 'Set the supplier state to match the first two digits of your GSTIN.', 'CGST Rule 46(a)');
  else add('sup-gstin', 'pass', 'Supplier GSTIN', 'Valid format, checksum and state.', '', 'CGST Rule 46(a)');
  // Recipient
  if (inv.recipientState === '96') add('rec', 'pass', 'Recipient', 'Export of services: no recipient GSTIN needed.', '', 'IGST Act s.16');
  else if (!inv.recipientGstin.trim()) add('rec', inv.b2b ? 'warn' : 'pass', 'Recipient GSTIN', inv.b2b ? 'B2B invoice without the client’s GSTIN, so your client cannot claim ITC.' : 'B2C invoice: GSTIN not required.', inv.b2b ? 'Ask the client for their GSTIN and add it.' : '', 'CGST Rule 46(d)');
  else { const r = validateGstin(inv.recipientGstin);
    if (!r.ok) add('rec', 'fail', 'Recipient GSTIN', r.why === 'checksum' ? `Checksum digit is wrong; expected “${r.expected}”.` : 'Not a valid GSTIN.', 'Re-check the client’s GSTIN on the GST portal “Search Taxpayer”.', 'CGST Rule 46(d)');
    else if (inv.recipientGstin.trim().slice(0, 2).toUpperCase() !== inv.recipientState) add('rec', 'fail', 'Place of supply', `Client GSTIN is from ${STATES[inv.recipientGstin.slice(0, 2)]} but the place of supply is ${STATES[inv.recipientState] || 'unset'}.`, 'For B2B services the place of supply is the recipient’s registered state.', 'IGST Act s.12(2)');
    else add('rec', 'pass', 'Recipient GSTIN', 'Valid, and matches the place of supply.', '', 'CGST Rule 46(d)'); }
  // Invoice number
  const no = (inv.invoiceNo || '').trim();
  if (!no) add('inv-no', 'fail', 'Invoice number', 'Missing.', 'Use a running serial like INV/26-27/001.', 'CGST Rule 46(b)');
  else if (no.length > 16 || !/^[A-Za-z0-9/-]+$/.test(no)) add('inv-no', 'fail', 'Invoice number', `“${no}” is ${no.length} chars${/^[A-Za-z0-9/-]+$/.test(no) ? '' : ' and has invalid characters'}. The max is 16, with only letters, digits, / and -.`, 'Shorten it, e.g. INV/26-27/001.', 'CGST Rule 46(b)');
  else add('inv-no', 'pass', 'Invoice number', 'Within 16 characters and uses allowed symbols.', '', 'CGST Rule 46(b)');
  // Date
  const d = new Date(inv.date);
  if (!inv.date || isNaN(d)) add('date', 'fail', 'Invoice date', 'Missing or invalid.', 'Add the date of issue.', 'CGST Rule 46(c)');
  else if (d > new Date(Date.now() + 864e5)) add('date', 'warn', 'Invoice date', 'Date is in the future.', 'Invoices should carry the actual issue date.', 'CGST s.31');
  else add('date', 'pass', 'Invoice date', 'Looks fine.', '', 'CGST Rule 46(c)');
  // Items
  if (!inv.items.length) add('items', 'fail', 'Line items', 'No line items.', 'Add at least one service.', 'CGST Rule 46(g)');
  inv.items.forEach((it, i) => {
    if (!/^\d{4,8}$/.test((it.sac || '').trim())) add('sac' + i, 'fail', `Line ${i + 1}: SAC/HSN`, `“${it.sac || ''}” is not a 4–8 digit SAC/HSN code.`, 'Most creative/IT services use 9983xx (e.g. 998314 IT design, 998361 advertising).', 'CGST Rule 46(g), Notf. 78/2020');
    if (!VALID_RATES.includes(num(it.gst))) add('rate' + i, 'fail', `Line ${i + 1}: GST rate`, `${it.gst}% is not a GST slab.`, 'Most professional services are 18%.', 'Notf. 11/2017-CT(R)');
  });
  if (inv.items.length && inv.items.every(it => /^\d{4,8}$/.test((it.sac || '').trim()) && VALID_RATES.includes(num(it.gst)))) add('items', 'pass', 'Line items', 'Every line has a SAC/HSN code and a valid GST slab.', '', 'CGST Rule 46(g)');
  // Composition
  if (inv.composition && (ch.cgst || ch.sgst || ch.igst)) add('comp', 'fail', 'Composition scheme', 'Composition taxpayers cannot collect GST from clients.', 'Issue a “Bill of Supply” with no tax.', 'CGST s.10(4)');
  // Tax type
  if (!inv.composition) {
    if (c.intra && ch.igst > 0) add('type', 'fail', 'Tax type', 'Supplier and place of supply are the same state, but IGST was charged.', 'Charge CGST + SGST (half each) instead of IGST.', 'IGST Act s.8');
    else if (!c.intra && !c.export_ && (ch.cgst > 0 || ch.sgst > 0)) add('type', 'fail', 'Tax type', 'Inter-state supply, but CGST/SGST was charged.', 'Charge IGST at the full rate.', 'IGST Act s.7');
    else if (c.export_ && !inv.lutNote && ch.igst === 0) add('type', 'fail', 'Export without LUT', 'Zero-tax export, but no LUT declaration.', 'Add “Supply meant for export under LUT without payment of IGST” and your LUT ARN.', 'IGST Act s.16, Rule 96A');
    else add('type', 'pass', 'Tax type', c.export_ ? 'Export treatment is correct.' : c.intra ? 'Intra-state: CGST + SGST.' : 'Inter-state: IGST.', '', 'IGST Act s.7/8');
    const diff = Math.abs(ch.cgst - c.cgst) + Math.abs(ch.sgst - c.sgst) + Math.abs(ch.igst - c.igst);
    if (diff > 1) add('amount', 'fail', 'Tax amount', `Charged ₹${r2(ch.cgst + ch.sgst + ch.igst)}, but the line items imply ₹${c.tax} (CGST ${c.cgst} / SGST ${c.sgst} / IGST ${c.igst}).`, 'Use “Auto-fix” to recompute.', 'CGST Rule 46(i)-(k)');
    else add('amount', 'pass', 'Tax amount', 'Matches the line items (±₹1).', '', 'CGST Rule 46(i)-(k)');
  }
  if (Math.abs(ch.total - r2(c.taxable + ch.cgst + ch.sgst + ch.igst)) > 1) add('total', 'fail', 'Grand total', `Total ₹${ch.total} ≠ taxable ₹${c.taxable} + tax ₹${r2(ch.cgst + ch.sgst + ch.igst)}.`, 'Use “Auto-fix” to recompute.', 'CGST Rule 46(l)');
  else add('total', 'pass', 'Grand total', 'Adds up.', '', 'CGST Rule 46(l)');
  const order = { fail: 0, warn: 1, pass: 2 }; out.sort((a, b) => order[a.status] - order[b.status]);
  return out;
}
export function score(results) { return Math.max(0, 100 - results.reduce((s, r) => s + (r.status === 'fail' ? 15 : r.status === 'warn' ? 5 : 0), 0)); }
export function autofix(inv) {
  const c = computeTax(inv);
  return { ...inv, charged: inv.composition ? { cgst: 0, sgst: 0, igst: 0, total: c.taxable } : { cgst: c.cgst, sgst: c.sgst, igst: c.igst, total: c.total } };
}
export const SAMPLES = {
  clean: { supplierGstin: '27AAPFU0939F1ZV', supplierState: '27', composition: false, recipientGstin: '29AAGCB7383J1Z4', recipientState: '29', b2b: true, invoiceNo: 'INV/26-27/014', date: '2026-10-20', lutNote: false,
    items: [{ desc: 'Brand identity design', sac: '998391', qty: 1, rate: 40000, gst: 18 }, { desc: 'Social media kit (10 posts)', sac: '998361', qty: 10, rate: 1500, gst: 18 }], charged: { cgst: 0, sgst: 0, igst: 9900, total: 64900 } },
  broken: { supplierGstin: '27AAPFU0939F1ZX', supplierState: '27', composition: false, recipientGstin: '27AAGCB7383J1Z4', recipientState: '27', b2b: true, invoiceNo: 'PRIYA-DESIGN#2026-OCT-14', date: '2026-10-20', lutNote: false,
    items: [{ desc: 'Brand identity design', sac: '', qty: 1, rate: 40000, gst: 18 }, { desc: 'Social media kit (10 posts)', sac: '998361', qty: 10, rate: 1500, gst: 15 }], charged: { cgst: 0, sgst: 0, igst: 9450, total: 65000 } },
};
