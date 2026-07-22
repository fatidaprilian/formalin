import assert from 'node:assert';
import { test } from 'node:test';
import { sanitizeClassString, sanitizeFileContent } from './sanitizer/sanitizer.js';

test('sanitizeClassString strips heavy drop shadows and rounded-xl', () => {
  const input = 'p-3 bg-purple-600 rounded-xl shadow-lg';
  const result = sanitizeClassString(input);

  assert.strictEqual(result.transformations.length > 0, true);
  assert.strictEqual(result.sanitizedClass.includes('shadow-lg'), false);
  assert.strictEqual(result.sanitizedClass.includes('rounded-sm'), true);
});

test('sanitizeFileContent replaces className attributes in TSX', () => {
  const tsxInput = 'export function Button() { return <button className="p-3 bg-purple-600 rounded-xl shadow-lg">Click</button>; }';
  const { content, totalTransformations } = sanitizeFileContent(tsxInput);

  assert.strictEqual(totalTransformations > 0, true);
  assert.strictEqual(content.includes('shadow-lg'), false);
  assert.strictEqual(content.includes('rounded-sm'), true);
});
