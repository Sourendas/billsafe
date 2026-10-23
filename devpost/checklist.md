---
doc: checklist
status: approved
---
# Build Checklist
Build mode: fast

## Slices
- [x] **1. Rule engine validates an invoice**
  Becomes usable: `runChecks` returns results for a sample invoice.
  Why now: It is the kernel.
  PRD ref: `prd.md > Rule engine`
  Spec ref: `spec.md > Components`
  Build: rules.js, states.js, tests.
  Verify (mechanical): `node --test` passes.
  Learner check: Read the test output for the broken sample.
  Commit: `Add GST rule engine with tests`
- [x] **2. Live report UI with score, samples, auto-fix, print**
  Becomes usable: The full page works end to end.
  Why now: It completes the core loop.
  PRD ref: `prd.md > The Core Journey`
  Spec ref: `spec.md > Components`
  Build: index.html, styles.css, app.js.
  Verify (mechanical): Load the page, load the broken sample, check the score is below 100, auto-fix and check the GST errors are cleared.
  Learner check: Try the broken sample.
  Commit: `Add live report UI`

## Hands-on Checkpoints
- [x] Early usable behavior explored: slice 2
- [x] Final kick-the-tires exploration and feedback completed

## Final Review
- [x] Final review complete

## Code Tour and App Map
- [x] Learning activity complete: brief recap
Activity and evidence: reviewed rules.js and the tests.

## Revisions
- Auto-fix does not reach 100 on its own: it only fixes values it can compute (tax split, totals). GSTINs, SAC codes and invoice numbers need the human, which is safer.
