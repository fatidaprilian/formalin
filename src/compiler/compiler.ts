import { PreferenceProfile } from '../types.js';

/**
 * Compiles a scored preference profile into a pre-generation design brief.
 */
export function compileBrief(profile: PreferenceProfile): string {
  const d = profile.dimensions;
  const dateStr = profile.lastUpdated.split('T')[0];

  let brief = `Design defaults for this developer (derived from ${profile.sampleCount} prior edits, updated ${dateStr}):\n`;

  // Palette & Saturation
  if (d.saturation_restraint.value > 0.2) {
    brief += `- Palette: cool-neutral base, single restrained warm accent. Avoid saturated hues.\n`;
  } else {
    brief += `- Palette: expressive colors with distinct primary accent highlights.\n`;
  }

  // Spacing Density
  if (d.spacing_density.value > 0.2) {
    brief += `- Spacing: generous — default to gap-6/p-8 over tighter scales.\n`;
  } else {
    brief += `- Spacing: compact — default to gap-2/p-4 scales for high information density.\n`;
  }

  // Radius Preference
  if (d.radius_preference.value < -0.1) {
    brief += `- Corners: sharp / low-radius; reserve rounding for primary CTAs only.\n`;
  } else {
    brief += `- Corners: soft / rounded borders (rounded-xl or rounded-full).\n`;
  }

  // Depth & Shadows
  if (d.depth_style.value < -0.1) {
    brief += `- Depth: avoid drop shadows; use subtle borders and contrast instead.\n`;
  } else {
    brief += `- Depth: use elevated cards with soft drop shadows (shadow-md).\n`;
  }

  // Typography
  if (d.typography_character.value > 0.2) {
    brief += `- Typography: distinctive display face paired with neutral system body font.\n`;
  } else {
    brief += `- Typography: clean, modern sans-serif typography.\n`;
  }

  return brief.trim();
}

/**
 * Compiles a scored preference profile into a post-generation verification checklist.
 */
export function compileChecklist(profile: PreferenceProfile): string {
  const d = profile.dimensions;

  let checklist = `Before finishing, check the generated component against this developer's history:\n`;

  if (d.spacing_density.value > 0.2) {
    checklist += `- Does spacing match the generous density this developer consistently keeps?\n`;
  }
  if (d.radius_preference.value < -0.1) {
    checklist += `- Are corners consistent with their historical low-radius pattern?\n`;
  }
  if (d.saturation_restraint.value > 0.2) {
    checklist += `- Does the palette avoid saturated accents this developer repeatedly reverts?\n`;
  }
  if (d.depth_style.value < -0.1) {
    checklist += `- Is there an unnecessary drop-shadow this developer tends to remove?\n`;
  }

  checklist += `- Are interactive components correctly aligned without orphan elements?`;

  return checklist.trim();
}
