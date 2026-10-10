/**
 * KrishiSetu Centralized Theme & Design System Tokens
 * Single source of truth for color palette, semantic tokens, and category indicators.
 */

export const THEME = {
  colors: {
    // Brand & Core Accents (Warm Monochrome & Editorial Minimalist)
    primary: '#111111',        // Editorial solid off-black
    primaryHover: '#333333',
    primaryLight: '#F7F6F3',
    primaryBorder: '#EAEAEA',

    // Semantic Financial Indicators (Muted Pastels per protocol)
    positive: '#346538',       // Pale green text
    positiveLight: '#EDF3EC',  // Pale green pastel
    positiveBorder: '#D2E5D0',
    positiveDark: '#204323',

    negative: '#9F2F2D',       // Pale red text
    negativeLight: '#FDEBEC',  // Pale red pastel
    negativeBorder: '#F9D1D3',
    negativeDark: '#6B1B1A',

    warning: '#956400',        // Pale yellow text
    warningLight: '#FBF3DB',   // Pale yellow pastel
    warningBorder: '#F5E6B8',

    neutral: '#787774',        // Neutral editorial muted gray
    neutralLight: '#F9F9F8',
    neutralBorder: '#EAEAEA',

    // Commodity Categories (Soft, muted editorial pastels)
    vegetable: '#346538',      // Forest sage
    vegetableBg: '#EDF3EC',
    vegetableBorder: '#D2E5D0',
    vegetableSoftBar: '#E2EDE1',

    fruit: '#A35324',          // Warm clay / terracotta
    fruitBg: '#FBF3EB',
    fruitBorder: '#F3DEC9',
    fruitSoftBar: '#F5E4D2',

    grain: '#956400',          // Muted gold / wheat
    grainBg: '#FBF3DB',
    grainBorder: '#F5E6B8',
    grainSoftBar: '#F8ECC4',

    spices: '#6D4C82',         // Muted fig / plum
    spicesBg: '#F5EEF9',
    spicesBorder: '#E6D7EE',
    spicesSoftBar: '#EDE0F4',

    other_category: '#1F6C9F', // Muted slate blue
    otherBg: '#E1F3FE',
    otherBorder: '#C9E6FA',
    otherSoftBar: '#D4ECFB',

    // Layout Surfaces & Neutrals
    background: '#F7F6F3',     // Warm Bone / Off-White
    backgroundWash: '#FBFBFA', // Subtle wash
    surface: '#FFFFFF',        // Crisp white card
    surfaceSubtle: '#F9F9F8',  // Subtle nested surface
    surfaceDark: '#111111',    // Dark editorial accents

    // Typography
    textPrimary: '#111111',    // Charcoal off-black
    textSecondary: '#787774',  // Muted gray
    textMuted: '#9B9A97',      // Tertiary labels
    textLight: '#FFFFFF',      // Light text

    // Structural Borders & Dividers
    border: '#EAEAEA',         // Crisp 1px ultra-light gray
    borderSubtle: 'rgba(0,0,0,0.06)',
    borderDark: '#2E2E2E',
  },

  // Category Color & Visual Assets Helper
  getCategoryTheme: (category: string) => {
    switch (category?.toLowerCase()) {
      case 'vegetable':
      case 'perishable':
        return {
          id: 'vegetable',
          color: THEME.colors.vegetable,
          bg: THEME.colors.vegetableBg,
          border: THEME.colors.vegetableBorder,
          softBar: THEME.colors.vegetableSoftBar,
          label: 'Vegetable (तरकारी)',
          shortLabel: 'Vegetables',
          iconType: 'vegetable' as const,
        };
      case 'fruit':
      case 'fruits':
      case 'exotic':
        return {
          id: 'fruit',
          color: THEME.colors.fruit,
          bg: THEME.colors.fruitBg,
          border: THEME.colors.fruitBorder,
          softBar: THEME.colors.fruitSoftBar,
          label: 'Fruit & Exotic (फलफूल)',
          shortLabel: 'Fruits & Exotic',
          iconType: 'fruit' as const,
        };
      case 'grain':
      case 'staple':
      case 'cereal':
        return {
          id: 'staple',
          color: THEME.colors.grain,
          bg: THEME.colors.grainBg,
          border: THEME.colors.grainBorder,
          softBar: THEME.colors.grainSoftBar,
          label: 'Staple / Grain (अन्नबाली)',
          shortLabel: 'Staples & Grains',
          iconType: 'grain' as const,
        };
      case 'spices':
      case 'spice':
        return {
          id: 'spices',
          color: THEME.colors.spices,
          bg: THEME.colors.spicesBg,
          border: THEME.colors.spicesBorder,
          softBar: THEME.colors.spicesSoftBar,
          label: 'Spices (मसला)',
          shortLabel: 'Spices & Herbs',
          iconType: 'spices' as const,
        };
      default:
        return {
          id: 'other',
          color: THEME.colors.other_category,
          bg: THEME.colors.otherBg,
          border: THEME.colors.otherBorder,
          softBar: THEME.colors.otherSoftBar,
          label: 'Other / Exotic (अन्य)',
          shortLabel: 'Other Crops',
          iconType: 'other' as const,
        };
    }
  },
} as const;

export default THEME;
