import type { Config } from "tailwindcss";
import forms from '@tailwindcss/forms';
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Status colors
        'validation-error': '#DC2626',    // Red for errors
        'validation-warning': '#F59E0B',  // Orange for warnings
        'validation-success': '#10B981',  // Green for success
        'validation-info': '#3B82F6',     // Blue for info
        'duplicate': '#F97316',           // Orange for duplicates
        'autocorrected': '#14B8A6',       // Teal for auto-corrected

        // UI element colors
        'primary': {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#DBEAFE',
        },
        'secondary': {
          DEFAULT: '#4B5563',
          hover: '#374151',
          light: '#F3F4F6',
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        "fade-out": {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        "zoom-in": {
          "0%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" },
        },
        "zoom-out": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(0.95)" },
        },
        "slide-in-from-top": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-in-from-bottom": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-in-from-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-from-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        "fade-in": "fade-in 200ms ease-out",
        "fade-out": "fade-out 200ms ease-in",
        "zoom-in": "zoom-in 200ms ease-out",
        "zoom-out": "zoom-out 200ms ease-in",
        "slide-in-from-top": "slide-in-from-top 200ms ease-out",
        "slide-in-from-bottom": "slide-in-from-bottom 200ms ease-out",
        "slide-in-from-left": "slide-in-from-left 200ms ease-out",
        "slide-in-from-right": "slide-in-from-right 200ms ease-out",
      },
      spacing: {
        'grid': '0.5rem',
        'header': '4rem',
      },
    },
  },
  plugins: [
    forms({
      strategy: 'class',
    }),
  ],
} satisfies Config;
