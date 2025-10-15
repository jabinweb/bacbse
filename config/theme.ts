export const themeColors = {
  blue: '#3B82C4',      // ScioSprints Blue
  orange: '#F59E0B',    // ScioSprints Orange
  // Derived colors
  blueLight: '#60A5FA',
  blueDark: '#1E40AF',
  orangeLight: '#FBBF24',
  orangeDark: '#D97706',
} as const;

export const gradients = {
  primary: 'from-[#3B82C4] to-[#F59E0B]',
  primaryAlt: 'from-[#60A5FA] to-[#FBBF24]',
  dark: 'from-[#1E40AF] to-[#D97706]',
} as const;
