import { Dimensions, Platform } from 'react-native';

// Enhanced responsive dimensions
const { width, height } = Dimensions.get('window');
const isTablet = width > 768;
const isLargeScreen = width > 414;

// Professional spacing system
const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Professional padding system
const SCREEN_PADDING = width * 0.04;
const CARD_SPACING = width * 0.025;

// Enhanced border radius system
const BORDER_RADIUS = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  xxxl: 24,
  round: 50,
};

// Professional typography scale
const FONT_SCALE = Math.min(width / 375, 1.3);
const FONTS = {
  xs: 11 * FONT_SCALE,
  sm: 13 * FONT_SCALE,
  base: 15 * FONT_SCALE,
  lg: 17 * FONT_SCALE,
  xl: 19 * FONT_SCALE,
  xxl: 22 * FONT_SCALE,
  xxxl: 26 * FONT_SCALE,
  huge: 32 * FONT_SCALE,
};

const baseURL = 'http://212.38.94.189:8000';

// Professional color palette
const COLORS = {
  // Primary brand colors with depth
  primary: '#FF6B35',
  primaryDark: '#E8541C',
  primaryLight: '#FFE8E0',
  primaryUltraLight: '#FFF5F2',
  
  // Enhanced secondary colors
  secondary: '#4A90E2',
  accent: '#F7B731',
  accentLight: '#FEF3CD',
  
  // Sophisticated neutrals
  background: '#FAFBFC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceAlt: '#F8F9FA',
  surfaceCard: '#FFFFFF',
  
  // Typography hierarchy
  text: '#1A1D29',
  textPrimary: '#2C2F36',
  textSecondary: '#6C7278',
  textMuted: '#9CA3AF',
  textDisabled: '#D1D5DB',
  textInverse: '#FFFFFF',
  
  // Status colors
  success: '#10B981',
  successLight: '#D1FAE5',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  
  // Enhanced borders and dividers
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#F1F3F4',
  
  // Professional shadows
  shadow: 'rgba(17, 25, 40, 0.12)',
  shadowDark: 'rgba(17, 25, 40, 0.25)',
  shadowLight: 'rgba(17, 25, 40, 0.06)',
  
  // Glass morphism
  glass: 'rgba(255, 255, 255, 0.85)',
  glassBlur: 'rgba(255, 255, 255, 0.2)',
};

const VALID_SECTION_TYPES = ['topSection', 'recommendedForYouSection', 'fullCardSection'];

export {
  width,
  height,
  isTablet,
  isLargeScreen,
  SPACING,
  SCREEN_PADDING,
  CARD_SPACING,
  BORDER_RADIUS,
  FONTS,
  COLORS,
  baseURL,
  VALID_SECTION_TYPES,
};
