import { DeltaSignal } from '../types.js';

const TAILWIND_SPACING_SCALE: Record<string, number> = {
  '0': 0, '0.5': 0.5, '1': 1, '1.5': 1.5, '2': 2, '3': 3, '4': 4,
  '5': 5, '6': 6, '8': 8, '10': 10, '12': 12, '16': 16, '20': 20, '24': 24, '32': 32
};

const TAILWIND_RADIUS_SCALE: Record<string, number> = {
  none: 0, sm: 1, DEFAULT: 2, md: 3, lg: 4, xl: 5, '2xl': 6, '3xl': 7, full: 10
};

const TAILWIND_SHADOW_SCALE: Record<string, number> = {
  none: 0, sm: 1, DEFAULT: 2, md: 3, lg: 4, xl: 5, '2xl': 6, inner: 1
};

export function extractDeltas(aiContent: string, devContent: string): DeltaSignal[] {
  const deltas: DeltaSignal[] = [];

  // Spacing Scale Delta
  const aiSpacingMatches = aiContent.match(/\b(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap)-([0-9.]+)\b/g) || [];
  const devSpacingMatches = devContent.match(/\b(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap)-([0-9.]+)\b/g) || [];

  const aiSpacingAvg = computeAverageScale(aiSpacingMatches, TAILWIND_SPACING_SCALE);
  const devSpacingAvg = computeAverageScale(devSpacingMatches, TAILWIND_SPACING_SCALE);

  if (aiSpacingAvg !== null && devSpacingAvg !== null && Math.abs(devSpacingAvg - aiSpacingAvg) > 0.5) {
    const delta = devSpacingAvg > aiSpacingAvg ? 0.25 : -0.25;
    deltas.push({
      dimension: 'spacing_density',
      delta,
      reason: `Developer modified average spacing scale from ${aiSpacingAvg.toFixed(1)} to ${devSpacingAvg.toFixed(1)}.`
    });
  }

  // Corner Radius Delta
  const aiRadiusMatches = aiContent.match(/\brounded-(none|sm|md|lg|xl|2xl|3xl|full)\b/g) || [];
  const devRadiusMatches = devContent.match(/\brounded-(none|sm|md|lg|xl|2xl|3xl|full)\b/g) || [];

  const aiRadiusAvg = computeAverageScale(aiRadiusMatches, TAILWIND_RADIUS_SCALE, 'rounded-');
  const devRadiusAvg = computeAverageScale(devRadiusMatches, TAILWIND_RADIUS_SCALE, 'rounded-');

  if (aiRadiusAvg !== null && devRadiusAvg !== null && Math.abs(devRadiusAvg - aiRadiusAvg) > 0.5) {
    const delta = devRadiusAvg > aiRadiusAvg ? 0.20 : -0.20;
    deltas.push({
      dimension: 'radius_preference',
      delta,
      reason: `Developer modified border-radius preference scale from ${aiRadiusAvg.toFixed(1)} to ${devRadiusAvg.toFixed(1)}.`
    });
  }

  // Depth & Shadow Delta
  const aiShadowMatches = aiContent.match(/\bshadow-(none|sm|md|lg|xl|2xl|inner)\b/g) || [];
  const devShadowMatches = devContent.match(/\bshadow-(none|sm|md|lg|xl|2xl|inner)\b/g) || [];

  const aiShadowAvg = computeAverageScale(aiShadowMatches, TAILWIND_SHADOW_SCALE, 'shadow-');
  const devShadowAvg = computeAverageScale(devShadowMatches, TAILWIND_SHADOW_SCALE, 'shadow-');

  if (aiShadowAvg !== null && devShadowAvg !== null && Math.abs(devShadowAvg - aiShadowAvg) > 0.3) {
    const delta = devShadowAvg > aiShadowAvg ? 0.25 : -0.25;
    deltas.push({
      dimension: 'depth_style',
      delta,
      reason: `Developer modified shadow/depth style from average ${aiShadowAvg.toFixed(1)} to ${devShadowAvg.toFixed(1)}.`
    });
  }

  // Saturation & Temperature Delta
  const vibrantColors = ['purple', 'violet', 'indigo', 'pink', 'fuchsia', 'cyan'];
  let aiVibrantCount = 0;
  let devVibrantCount = 0;
  for (const c of vibrantColors) {
    aiVibrantCount += (aiContent.match(new RegExp(c, 'g')) || []).length;
    devVibrantCount += (devContent.match(new RegExp(c, 'g')) || []).length;
  }

  if (aiVibrantCount > devVibrantCount) {
    deltas.push({
      dimension: 'saturation_restraint',
      delta: 0.25,
      reason: `Developer reduced vibrant color tokens (${aiVibrantCount} -> ${devVibrantCount}) in favor of muted tones.`
    });
    deltas.push({
      dimension: 'color_temperature',
      delta: -0.20,
      reason: `Developer shifted color temperature towards cool slate/neutral tones.`
    });
  }

  return deltas;
}

function computeAverageScale(matches: string[], scaleMap: Record<string, number>, prefixToTrim: string = ''): number | null {
  if (matches.length === 0) {
    return null;
  }

  let total = 0;
  let count = 0;

  for (const match of matches) {
    let token = match;
    if (prefixToTrim && token.startsWith(prefixToTrim)) {
      token = token.substring(prefixToTrim.length);
    } else if (token.includes('-')) {
      token = token.split('-').pop() || '';
    }

    if (token in scaleMap) {
      total += scaleMap[token];
      count++;
    }
  }

  return count > 0 ? total / count : null;
}
