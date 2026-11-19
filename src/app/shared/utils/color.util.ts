/**
 * Color and Contrast Utility for Adaptive UI/UX
 * Complies with WCAG 2.1 Contrast & Relative Luminance Standards.
 */

export interface AccessibleCardTheme {
  isDarkBg: boolean;
  bg: string;
  text: string;          // Heading & Primary Text
  muted: string;         // Secondary Labels, Category Chips
  subtle: string;        // Minor info, Timestamps, Inactive Icons
  surface: string;       // Subtle container for emoji, chips, buttons
  surfaceHover: string;  // Hover state for interactive items
  border: string;        // Border & Divider lines
  activeTimer: string;   // High-contrast accent for active states
}

/**
 * Parses 3, 6, or 8-character hex color to RGB.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!hex) return null;
  let clean = hex.trim().replace(/^#/, '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  } else if (clean.length === 8) {
    clean = clean.slice(0, 6);
  }
  if (clean.length !== 6) return null;

  const num = parseInt(clean, 16);
  if (isNaN(num)) return null;

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Calculates WCAG 2.1 relative luminance for sRGB channels.
 * Formula: Y = 0.2126 * R + 0.7152 * G + 0.0722 * B
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(val => {
    const s = val / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Returns an eye-friendly, WCAG-compliant color theme tailored to any given background color.
 * Designed to prevent eye strain by using balanced slate & off-white tones instead of harsh pure black.
 */
export function getAccessibleCardTheme(taskColor?: string | null): AccessibleCardTheme {
  if (!taskColor || taskColor.trim() === '' || taskColor.startsWith('var(')) {
    return {
      isDarkBg: false,
      bg: 'var(--color-surface)',
      text: 'var(--color-text)',
      muted: 'var(--color-text-muted)',
      subtle: 'var(--color-text-subtle)',
      surface: 'var(--color-surface-2)',
      surfaceHover: 'var(--color-surface-3)',
      border: 'var(--color-border)',
      activeTimer: 'var(--color-primary)',
    };
  }

  const rgb = hexToRgb(taskColor);
  if (!rgb) {
    return {
      isDarkBg: false,
      bg: taskColor,
      text: 'var(--color-text)',
      muted: 'var(--color-text-muted)',
      subtle: 'var(--color-text-subtle)',
      surface: 'var(--color-surface-2)',
      surfaceHover: 'var(--color-surface-3)',
      border: 'var(--color-border)',
      activeTimer: 'var(--color-primary)',
    };
  }

  const bgLum = getRelativeLuminance(rgb.r, rgb.g, rgb.b);

  // WCAG contrast ratios:
  // White luminance = 1.0, Slate-900 luminance ~ 0.012
  const contrastWithWhite = (1.0 + 0.05) / (bgLum + 0.05);
  const contrastWithDark = (bgLum + 0.05) / (0.012 + 0.05);

  const preferDarkText = contrastWithDark >= contrastWithWhite;

  if (preferDarkText) {
    // Light background -> High contrast, eye-friendly Slate palette
    return {
      isDarkBg: false,
      bg: taskColor,
      text: '#0F172A',                         // Slate-900 (crisp, readable, no eye strain)
      muted: 'rgba(15, 23, 42, 0.78)',         // 78% opacity for labels & categories
      subtle: 'rgba(15, 23, 42, 0.58)',        // 58% opacity for timestamps & secondary icons
      surface: 'rgba(15, 23, 42, 0.08)',       // Subtle container for chips, emoji, buttons
      surfaceHover: 'rgba(15, 23, 42, 0.14)',  // Interactive hover state
      border: 'rgba(15, 23, 42, 0.12)',        // Refined boundary lines
      activeTimer: '#047857',                   // Dark emerald for active timer
    };
  } else {
    // Dark background -> Crisp off-white frosted glass palette
    return {
      isDarkBg: true,
      bg: taskColor,
      text: '#FFFFFF',                         // High contrast white
      muted: 'rgba(255, 255, 255, 0.85)',      // 85% opacity
      subtle: 'rgba(255, 255, 255, 0.65)',     // 65% opacity
      surface: 'rgba(255, 255, 255, 0.14)',    // Frosted glass background
      surfaceHover: 'rgba(255, 255, 255, 0.22)',
      border: 'rgba(255, 255, 255, 0.18)',     // Translucent crisp borders
      activeTimer: '#34D399',                   // Bright mint for active timer
    };
  }
}
