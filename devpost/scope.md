---
doc: scope
status: approved
---
# GST Invoice Sanity Checker ("BillSafe")

One line: paste or fill in a GST invoice and get a plain-English pass/fail report on the mistakes that get Indian freelancers' invoices rejected or their ITC blocked.

## The Unique Kernel
It checks against the actual GST rules, not just the arithmetic: the GSTIN checksum, whether the place of supply means CGST+SGST or IGST, Rule 46 invoice-number limits, SAC/HSN presence, and the LUT/export wording. Every failure tells you how to fix it, with the rule behind it. It runs fully in the browser, so the invoice never leaves the device.

## Who It's For
Priya, a freelance designer in Pune with a new GST registration who bills 5–10 clients a month from a Google Docs template. Today she checks by eye, or waits for her CA to flag errors after the client's accounts team has already rejected the invoice.

## The Core Loop
Open the page, enter the invoice (or load a sample), and watch the checks go green or red as you type. Fix what's red, then copy or print the clean summary. She comes back for every invoice.

## Inspiration & Identity
Calm and trustworthy, like a good accountant: an off-white page, deep green for pass, amber and red for problems, clear type, and no jargon without an explanation.

## Why This Matters to the Learner
Souren runs a small Indian business and sees how much freelancer time goes into GST paperwork mistakes.

## What "Working" Looks Like
Load the "broken invoice" sample: it shows 6 issues, including a GSTIN with a bad checksum, IGST charged on an intra-state supply, a 19-character invoice number, and a total that doesn't add up. Click "Auto-fix what's safe" and the tax split and totals are corrected instantly. The checks still left are the human-only fixes (GSTIN typo, SAC code, invoice number), each with a clear instruction. Fix those and it reaches 100.

## The POC Boundary
One page with the invoice form, a live rule engine (about 12 checks), a health score, a fix hint for each rule, sample invoices, and a printable report.

## Later
Upload a PDF or image and use OCR to fill the form. Batch check a CSV. Check a GSTIN against the GST portal API.

## Explicitly Cut
- Live GSTIN lookup: it needs GSP credentials and paid access.
- PDF parsing: OCR is unreliable, and it would hide the kernel.
- Accounts and storage: privacy comes first, and they aren't needed to prove the loop.
