import assert from 'node:assert';
import { test } from 'node:test';
import { extractDeltas } from './diff/extractor.js';
import { compileBrief, compileChecklist } from './compiler/compiler.js';
import { getInitialProfile } from './profile/aggregator.js';

test('extractDeltas detects spacing density shift from tight to generous', () => {
  const aiContent = '<div className="p-2 gap-2 bg-purple-600 rounded-xl shadow-lg">Title</div>';
  const devContent = '<div className="p-8 gap-6 bg-slate-800 rounded-sm shadow-none">Title</div>';

  const deltas = extractDeltas(aiContent, devContent);
  assert.strictEqual(deltas.length > 0, true);

  const spacingDelta = deltas.find(d => d.dimension === 'spacing_density');
  assert.notStrictEqual(spacingDelta, undefined);
  assert.strictEqual(spacingDelta!.delta > 0, true);
});

test('compileBrief generates concrete design defaults', () => {
  const profile = getInitialProfile();
  profile.dimensions.spacing_density.value = 0.58;
  profile.dimensions.saturation_restraint.value = 0.62;

  const brief = compileBrief(profile);
  assert.strictEqual(brief.includes('generous'), true);
  assert.strictEqual(brief.includes('cool-neutral base'), true);
});

test('compileChecklist generates verification questions', () => {
  const profile = getInitialProfile();
  profile.dimensions.spacing_density.value = 0.58;

  const checklist = compileChecklist(profile);
  assert.strictEqual(checklist.includes('generous density'), true);
});
