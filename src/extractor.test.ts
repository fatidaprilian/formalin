import assert from 'node:assert';
import { test } from 'node:test';
import { evaluateNarrativeBrief } from './layer0/detector.js';
import { extractDeltas } from './layer1/extractor.js';
import { getInitialProfile } from './layer1/aggregator.js';
import { compileBrief, compileChecklist } from './compiler/compiler.js';
import { generateAgentHooks } from './hooks/generator.js';

test('evaluateNarrativeBrief rejects brief with dense buzzwords and no specific constraint', () => {
  const genericBrief = 'We want an innovative, seamless, and cutting-edge dashboard for an elevated user experience.';
  const result = evaluateNarrativeBrief(genericBrief);

  assert.strictEqual(result.passed, false);
  assert.strictEqual(result.flaggedBuzzwords.length >= 2, true);
});

test('evaluateNarrativeBrief passes brief with named constraints and low buzzword density', () => {
  const specificBrief = 'Build an unhurried, editorial financial journal for quiet decisions. Avoid saturated gradients and prefer slate palettes.';
  const result = evaluateNarrativeBrief(specificBrief);

  assert.strictEqual(result.passed, true);
  assert.strictEqual(result.score > 70, true);
});

test('extractDeltas detects spacing density shift from tight to generous', () => {
  const aiContent = '<div className="p-2 gap-2 bg-purple-600 rounded-xl shadow-lg">Title</div>';
  const devContent = '<div className="p-8 gap-6 bg-slate-800 rounded-sm shadow-none">Title</div>';

  const deltas = extractDeltas(aiContent, devContent);
  assert.strictEqual(deltas.length > 0, true);

  const spacingDelta = deltas.find(d => d.dimension === 'spacing_density');
  assert.notStrictEqual(spacingDelta, undefined);
  assert.strictEqual(spacingDelta!.delta > 0, true);
});

test('extractDeltas detects typography character shift', () => {
  const aiContent = '<div className="font-sans">Title</div>';
  const devContent = '<div className="font-mono">Title</div>';

  const deltas = extractDeltas(aiContent, devContent);
  const typoDelta = deltas.find(d => d.dimension === 'typography_character');
  assert.notStrictEqual(typoDelta, undefined);
  assert.strictEqual(typoDelta!.delta > 0, true);
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

test('generateAgentHooks generates claude settings path', () => {
  const result = generateAgentHooks(process.cwd());
  assert.strictEqual(typeof result.claudePath, 'string');
});
