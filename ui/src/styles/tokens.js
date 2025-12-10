// Design System Tokens
export const colors = {
  primary: {
    DEFAULT: "#0A4D9C",
    50: "#EBF2FF",
    100: "#D6E4FF", 
    200: "#B3CCFF",
    300: "#80A9FF",
    400: "#4D7FFF",
    500: "#1A56FF",
    600: "#0A4D9C",
    700: "#083D7A",
    800: "#062E5C",
    900: "#041F3E"
  },
  success: "#15A371",
  danger: "#D64545",
  warning: "#F59E0B",
  muted: "#6B7280",
  bg: "#F4F6F8"
};

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px"
};

export const typography = {
  fontFamily: {
    sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif']
  },
  fontSize: {
    xs: "12px",
    sm: "14px", 
    base: "16px",
    lg: "18px",
    xl: "20px",
    "2xl": "24px",
    "3xl": "30px"
  }
};

export const borderRadius = {
  sm: "4px",
  md: "6px", 
  lg: "12px",
  full: "9999px"
};

export const shadows = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  soft: "0 2px 8px 0 rgba(0, 0, 0, 0.08)"
};

export const animation = {
  duration: {
    fast: "150ms",
    normal: "200ms", 
    slow: "300ms"
  },
  easing: {
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out"
  }
};

// Component-specific tokens
export const components = {
  button: {
    height: "40px",
    minWidth: "44px", // accessibility
    borderRadius: borderRadius.md
  },
  input: {
    height: "40px",
    borderRadius: borderRadius.md
  },
  card: {
    borderRadius: borderRadius.lg,
    shadow: shadows.soft
  },
  sidebar: {
    width: "256px"
  }
};