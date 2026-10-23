---
doc: prd
status: approved
---
# BillSafe — Product Requirements
A browser tool for Indian freelancers and small businesses to sanity-check a GST tax invoice before sending it. Source: `scope.md > The Unique Kernel`.

## The Core Journey
1. Open the page. It shows a short hero and the invoice form, with a report panel beside it.
2. Fill in supplier GSTIN and state, recipient GSTIN (optional for B2C) and state, invoice number and date, line items (description, SAC/HSN, qty, rate, GST %), and the tax charged (CGST/SGST/IGST amounts). You can also click a sample.
3. The report updates on every keystroke: a 0–100 health score plus a list of checks, each pass, warn or fail, with a one-line fix and the rule reference.
4. Click "Auto-fix what's safe" to recompute the tax split and totals from the line items.
5. Click "Print report" to get a clean printable summary. Success means a score of 100 and zero fails.

## Screens and Layout
A single page: the form on the left, a sticky report on the right (stacked on mobile), and a footer with a privacy note.

## Look and Feel
Off-white background, deep green accent (#0f6b4f), amber warnings, red fails. System UI font, numbers in tabular figures. Spacious and calm.

## Features and Behavior
### Rule engine
- GSTIN format (15 chars, state code + PAN + entity + Z + checksum) and mod-36 checksum, for both supplier and recipient.
- The GSTIN's state code must match the selected state.
- Intra-state (same state) means CGST = SGST = half the rate and no IGST. Inter-state means IGST only (IGST Act s.7/8).
- Invoice number: at most 16 characters, only letters, digits, "/" and "-" (CGST Rule 46(b)).
- The invoice date is valid and not in the future.
- Every line has a SAC/HSN code of 4–8 digits.
- The GST rate is one of 0, 0.1, 0.25, 1.5, 3, 5, 12, 18 or 28 (with a warning if it's unusual for services).
- The tax charged matches the computed tax within ₹1.
- The grand total equals the taxable value plus tax.
- B2B with no recipient GSTIN gets a warning.
- Export (recipient state "Outside India") must have an LUT note if no IGST is charged.
- If the supplier is in the composition scheme, warn that it must be a bill of supply and charge no tax.
  - [ ] Each check shows a status, a message, a fix and a rule reference.

### Score, auto-fix and report
- Each fail costs 15 points and each warn costs 5 points, from a starting score of 100.
- Auto-fix recomputes the tax split and totals. It never touches GSTINs or numbers it can't infer.
- Print uses print CSS.

## States and Boundaries
- **Empty**: the score is hidden and the panel prompts you to try a sample.
- **Persistence**: none. Nothing leaves the browser.

## Product Decisions
- Fully client-side, for privacy and zero cost.

## What We're Building
The form, the rule engine, score, auto-fix, two samples (clean and broken), and print.

## Deferred From the POC
OCR import, CSV batch checks, live GSTIN lookup.

## Possible Later Enhancements
An e-invoice IRN QR check, and export to JSON.

## Non-Goals
It is not tax advice and does not generate invoices.

## Open Questions
None blocking.
