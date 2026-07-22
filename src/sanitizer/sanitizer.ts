import { ClassTransformationResult, SanitizerConfig } from '../types.js';

const defaultConfig: SanitizerConfig = {
  stripShadows: true,
  normalizeRadius: true,
  normalizeSpacing: true,
  neutralizeGradients: true
};

/**
 * Deterministically sanitizes AI Slop centroids in Tailwind / CSS class strings.
 */
export function sanitizeClassString(
  classString: string,
  config: SanitizerConfig = defaultConfig
): ClassTransformationResult {
  const transformations: string[] = [];
  let sanitized = classString;

  // 1. Strip heavy drop shadows and replace with crisp border tokens
  if (config.stripShadows) {
    if (/\bshadow-(lg|xl|2xl)\b/.test(sanitized)) {
      sanitized = sanitized.replace(/\bshadow-(lg|xl|2xl)\b/g, 'border border-slate-200 dark:border-slate-800');
      transformations.push('Replaced heavy drop shadow with crisp border tokens.');
    }
  }

  // 2. Normalize excessive rounded corners
  if (config.normalizeRadius) {
    if (/\brounded-(xl|2xl|3xl)\b/.test(sanitized)) {
      sanitized = sanitized.replace(/\brounded-(xl|2xl|3xl)\b/g, 'rounded-sm');
      transformations.push('Normalized rounded corners to rounded-sm.');
    }
  }

  // 3. Neutralize generic saturated gradients
  if (config.neutralizeGradients) {
    if (/\b(bg-purple-[0-9]+|from-purple-[0-9]+|to-indigo-[0-9]+)\b/.test(sanitized)) {
      sanitized = sanitized.replace(
        /\b(bg-purple-[0-9]+|from-purple-[0-9]+|to-indigo-[0-9]+)\b/g,
        'bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900'
      );
      transformations.push('Replaced generic purple gradient with high-contrast neutral palette.');
    }
  }

  // 4. Normalize spacing scale anomalies (e.g. p-3 -> p-4, gap-5 -> gap-6)
  if (config.normalizeSpacing) {
    if (/\b(p|px|py|gap|m|mx|my)-3\b/.test(sanitized)) {
      sanitized = sanitized.replace(/\b(p|px|py|gap|m|mx|my)-3\b/g, '$1-4');
      transformations.push('Normalized -3 spacing step to -4 modular scale.');
    }
    if (/\b(p|px|py|gap|m|mx|my)-5\b/.test(sanitized)) {
      sanitized = sanitized.replace(/\b(p|px|py|gap|m|mx|my)-5\b/g, '$1-6');
      transformations.push('Normalized -5 spacing step to -6 modular scale.');
    }
  }

  return {
    originalClass: classString,
    sanitizedClass: sanitized.replace(/\s+/g, ' ').trim(),
    transformations
  };
}

/**
 * Parses and sanitizes all className / class attributes inside TSX/JSX file content.
 */
export function sanitizeFileContent(fileContent: string): { content: string; totalTransformations: number } {
  let totalTransformations = 0;
  const content = fileContent.replace(/(className|class)=["']([^"']+)["']/g, (match, attr, classStr) => {
    const result = sanitizeClassString(classStr);
    if (result.transformations.length > 0) {
      totalTransformations += result.transformations.length;
      return `${attr}="${result.sanitizedClass}"`;
    }
    return match;
  });

  return { content, totalTransformations };
}
