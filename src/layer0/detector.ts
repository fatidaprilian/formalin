import { Layer0GateResult } from '../types.js';

const BUZZWORD_BLACKLIST = [
  'innovative',
  'seamless',
  'cutting-edge',
  'revolutionize',
  'modern',
  'clean',
  'elevate',
  'world-class',
  'state-of-the-art',
  'next-generation',
  'disruptive',
  'game-changer',
  'best-in-class',
  'frictionless'
];

/**
 * Layer 0: Evaluates creative brief text for genericness, buzzword density, and structural signals.
 */
export function evaluateNarrativeBrief(briefText: string): Layer0GateResult {
  const lowerText = briefText.toLowerCase();
  const flaggedBuzzwords: string[] = [];
  const reasons: string[] = [];

  // 1. Check Buzzword Blacklist Density
  for (const word of BUZZWORD_BLACKLIST) {
    if (new RegExp(`\\b${word}\\b`, 'i').test(lowerText)) {
      flaggedBuzzwords.push(word);
    }
  }

  if (flaggedBuzzwords.length >= 2) {
    reasons.push(`Contains dense usage of generic buzzwords: [${flaggedBuzzwords.join(', ')}].`);
  }

  // 2. Check for Specific Project Signals / Named References / Mood Constraints
  const hasSpecificConstraint = briefText.length > 25 && (
    /for\s+[a-z0-9_-]+/i.test(briefText) ||
    /avoid\s+[a-z0-9_-]+/i.test(briefText) ||
    /prefer\s+[a-z0-9_-]+/i.test(briefText) ||
    /style:\s+[a-z0-9_-]+/i.test(briefText) ||
    /quiet|editorial|industrial|monochrome|contemplative|architectural/i.test(briefText)
  );

  if (!hasSpecificConstraint) {
    reasons.push('Lacks specific project constraints, named references, or mood boundaries.');
  }

  // 3. Structural Rigidity Check
  const containsTemplateHeaders = /#\s*(overview|goals|style)/i.test(briefText);
  if (containsTemplateHeaders && flaggedBuzzwords.length > 0) {
    reasons.push('Adheres to a rigid generic brief template without distinct project character.');
  }

  const passed = flaggedBuzzwords.length < 2 && hasSpecificConstraint;
  const score = Math.max(0, 100 - (flaggedBuzzwords.length * 20) - (hasSpecificConstraint ? 0 : 30));

  return {
    passed,
    score,
    flaggedBuzzwords,
    reasons
  };
}
