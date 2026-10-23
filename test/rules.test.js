import { test } from 'node:test'; import assert from 'node:assert/strict';
import { validateGstin, runChecks, score, autofix, SAMPLES } from '../src/rules.js';
test('known-valid GSTIN passes', () => assert.ok(validateGstin('27AAPFU0939F1ZV').ok));
test('bad checksum caught', () => { const r = validateGstin('27AAPFU0939F1ZX'); assert.equal(r.why, 'checksum'); assert.equal(r.expected, 'V'); });
test('clean sample scores 100', () => assert.equal(score(runChecks(SAMPLES.clean)), 100));
test('broken sample has many fails', () => { const f = runChecks(SAMPLES.broken).filter(r => r.status === 'fail'); assert.ok(f.length >= 6, f.map(x => x.id).join()); });
test('autofix switches IGST to CGST+SGST intra-state', () => { const x = autofix(SAMPLES.broken); assert.equal(x.charged.igst, 0); assert.ok(x.charged.cgst > 0); assert.ok(!runChecks(x).some(r => ['type','amount','total'].includes(r.id) && r.status === 'fail')); });
