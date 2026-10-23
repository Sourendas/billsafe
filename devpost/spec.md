---
doc: spec
status: approved
---
# BillSafe — Technical Spec

## How This Works, In Plain Language
A single web page. As you type, a small JavaScript "rule engine" reads the form, runs each GST check and draws the report. There is no server.

## The Core Journey Through the System
Input event → `readForm()` → `runChecks(invoice)` returns results → `render(results)` updates the score and list. Auto-fix → `autofix(invoice)` writes the computed values → re-run. PRD ref: `prd.md > The Core Journey`.

## Stack
Plain HTML, CSS and ES modules, with no build step. Tests run on Node 20 with `node --test`. Chosen for zero dependencies and instant deploys.

## Where It Runs and How Someone Tries It
Any modern browser. Run locally with `npx serve .`, or open the GitHub Pages URL. The demo video records the broken sample → auto-fix flow.

## Look and Feel
Follows `prd.md > Look and Feel`.

## Components
### rules.js
Pure functions: `validateGstin`, `gstinChecksum`, `runChecks`, `computeTax`, `autofix`. PRD ref: `prd.md > Rule engine`.
### app.js
Form binding, line-item rows, rendering, samples, print. PRD ref: `prd.md > Score, auto-fix and report`.

## Data Model
`invoice = {supplierGstin, supplierState, composition, recipientGstin, recipientState, b2b, invoiceNo, date, lutNote, items:[{desc,sac,qty,rate,gst}], charged:{cgst,sgst,igst,total}}`. It is held in memory only.

## File Structure
```
app/
├── index.html      # page
├── styles.css
├── src/rules.js    # rule engine (pure)
├── src/app.js      # UI
├── src/states.js   # GST state codes
├── test/rules.test.js
├── devpost/        # scope, prd, spec, checklist
└── LICENSE (MIT)
```

## External Services and Dependencies
None. Hosted on GitHub Pages (free).

## Important Failure Modes
- **Non-numeric input** → it is treated as 0 and flagged.
- **Unknown state** → the state-match check is skipped with a warning.

## What Was Simplified and Why
- **Checksum-only GSTIN validation** instead of a live lookup, because a lookup needs paid GSP access.

## Decisions and Open Issues
The ₹1 rounding tolerance follows common practice. There was one uncertainty, the GSTIN checksum algorithm. It was resolved with a known-valid GSTIN in the unit tests.
