# ✓ BillSafe: GST invoice sanity checker

**Catch GST invoice mistakes before your client does.** BillSafe is a one-page tool for Indian freelancers and small businesses. Fill in a GST tax invoice (or load a sample) and it checks the invoice live against the actual GST rules, then explains how to fix each problem.

**Live demo:** https://billsafe-souren1.vercel.app/

## What it checks
- The GSTIN format, its **mod-36 checksum** (which catches typos), and that its state code matches (supplier and client)
- **CGST+SGST vs IGST** from the place of supply (IGST Act s.7/8)
- The invoice number is **≤16 chars** and uses only letters, digits, `/` and `-` (CGST Rule 46(b))
- SAC/HSN codes and valid GST slabs on every line
- Tax amounts and grand total within ±₹1
- Missing client GSTIN on B2B invoices, a missing LUT on zero-tax exports, and composition-scheme misuse

Each issue lowers the health score. **Auto-fix** recomputes the tax split and totals, and **Print** produces a clean report. Everything runs client-side, with no uploads or tracking.

## Run it
```bash
npx serve .        # then open http://localhost:3000
npm test           # rule-engine unit tests (Node 20+)
```
Plain HTML, CSS and ES modules, with no build step and no dependencies.

## How it was built
It was built from an empty folder during the Devpost *Build With AI: Basics* hackathon using the [Devpost Learn Skill Pack](https://github.com/challengepost/learn-ai-basics) (`npx skills add challengepost/learn-ai-basics --all -y`) with a coding agent. The planning docs the pack generated are in [`devpost/`](devpost/): `scope.md`, `prd.md`, `spec.md` and `checklist.md`. No pre-existing code was used.

*This is a sanity check, not tax advice.*

MIT © Souren Das
