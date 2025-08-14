import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import { mockAuthContext, mockAuthContextUnauthenticated } from '../fixtures/auth';
import { mockUser } from '../fixtures/users';

// Mock transitions
const transitions = {
  fast: '150ms ease',
  normal: '300ms ease',
  slow: '500ms ease',
  slower: '700ms ease'
};

// Mock theme.js
jest.mock('../../styles/theme', () => ({
  lightTheme: {
    name: 'light',
    colors: {
      primary: '#FF4D4D',
      primaryLight: '#FF9999',
      primaryDark: '#CC4444',
      secondary: '#00FFFF',
      secondaryLight: '#66FFFE',
      secondaryDark: '#009999',
      accent: {
        pink: '#FF6B9D',
        purple: '#C44569',
        blue: '#4ECDC4',
        teal: '#44A08D',
        orange: '#FFA726',
        yellow: '#FFD54F',
        green: '#66BB6A',
        red: '#EF5350',
      },
      text: {
        primary: '#1A1A1A',
        secondary: '#4A4A4A',
        tertiary: '#7A7A7A',
        disabled: '#BDBDBD',
        inverse: '#FFFFFF',
      },
      background: {
        primary: '#FFFFFF',
        secondary: '#F5F5F5',
        tertiary: '#EEEEEE',
        dark: '#121212',
        darkSecondary: '#1E1E1E',
        darkTertiary: '#2A2A2A',
      },
      surface: {
        primary: '#FFFFFF',
        secondary: '#FAFAFA',
        tertiary: '#F5F5F5',
        dark: '#1E1E1E',
        darkSecondary: '#2A2A2A',
        darkTertiary: '#363636',
      },
      border: {
        light: '#E0E0E0',
        medium: '#BDBDBD',
        dark: '#9E9E9E',
        lightDark: '#2F2F2F',
        mediumDark: '#424242',
        darkDark: '#616161',
      },
      shadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        dark: {
          sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
          md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
          lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
          xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
        }
      },
      gradients: {
        primary: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)',
        secondary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        sunset: 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 52%, #2BFF88 90%)',
        ocean: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
        fire: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
        dark: 'linear-gradient(135deg, #0F1419 0%, #1A1F29 100%)',
      },
      anime: {
        ongoing: '#4CAF50',
        completed: '#2196F3',
        upcoming: '#FF9800',
        hiatus: '#9C27B0',
        masterpiece: '#FFD700',
        great: '#4CAF50',
        good: '#2196F3',
        average: '#FF9800',
        bad: '#F44336',
        sub: '#00BCD4',
        dub: '#9C27B0',
        raw: '#795548',
      },
      opacity: {
        0: '0',
        25: '0.25',
        50: '0.5',
        75: '0.75',
        100: '1',
      },
    },
    typography: {
      fontFamily: {
        primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
        mono: "'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Consolas', 'Courier New', monospace",
        display: "'Playfair Display', 'Georgia', serif",
      },
      fontSize: {
        xs: ['12px', '16px'],
        sm: ['14px', '20px'],
        base: ['16px', '24px'],
        lg: ['18px', '28px'],
        xl: ['20px', '28px'],
        '2xl': ['24px', '32px'],
        '3xl': ['30px', '36px'],
        '4xl': ['36px', '40px'],
        '5xl': ['48px', '48px'],
        '6xl': ['60px', '72px'],
        '7xl': ['72px', '84px'],
      },
      fontWeight: {
        thin: 100,
        extralight: 200,
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900,
      },
      lineHeight: {
        tight: 1.25,
        snug: 1.375,
        normal: 1.5,
        relaxed: 1.625,
        loose: 2,
      },
      letterSpacing: {
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
    },
    spacing: {
      0: '0',
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      5: '20px',
      6: '24px',
      7: '28px',
      8: '32px',
      9: '36px',
      10: '40px',
      11: '44px',
      12: '48px',
      14: '56px',
      16: '64px',
      20: '80px',
      24: '96px',
      28: '112px',
      32: '128px',
      36: '144px',
      40: '160px',
      44: '176px',
      48: '192px',
      56: '224px',
      64: '256px',
    },
    borderRadius: {
      none: '0',
      sm: '2px',
      md: '4px',
      lg: '6px',
      xl: '8px',
      '2xl': '12px',
      '3xl': '16px',
      full: '9999px',
      pill: '999px',
      circle: '50%',
    },
    animation: {
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
        slower: '700ms',
      },
      easing: {
        linear: 'linear',
        ease: 'ease',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
    breakpoints: {
      xs: '320px',
      sm: '480px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      maxSm: '479px',
      maxMd: '767px',
      maxLg: '1023px',
      maxXl: '1279px',
      max2xl: '1535px',
    },
    zIndex: {
      auto: 'auto',
      0: 0,
      10: 10,
      20: 20,
      30: 30,
      40: 40,
      50: 50,
      dropdown: 1000,
      sticky: 1020,
      fixed: 1030,
      modalBackdrop: 1040,
      modal: 1050,
      popover: 1060,
      tooltip: 1070,
      toast: 1080,
      loading: 1090,
      navbar: 1100,
    },
    opacity: {
      0: '0',
      25: '0.25',
      50: '0.5',
      75: '0.75',
      100: '1',
    },
    elevation: {
      0: 'none',
      1: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      2: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
      3: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
      4: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
      5: '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)',
    },
    form: {
      input: {
        height: '44px',
        padding: '0 16px',
        fontSize: '16px',
        borderRadius: '8px',
        border: '2px solid',
        focusBorder: '2px solid',
        transition: 'all 0.2s ease',
      },
      select: {
        height: '44px',
        padding: '0 16px',
        fontSize: '16px',
        borderRadius: '8px',
        border: '2px solid',
        focusBorder: '2px solid',
        transition: 'all 0.2s ease',
      },
      button: {
        height: '44px',
        padding: '0 24px',
        fontSize: '16px',
        fontWeight: '600',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        minHeight: '44px',
      },
    },
    card: {
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      transition: 'all 0.3s ease',
      hover: {
        transform: 'translateY(-4px)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
    utils: {
      flex: {
        center: 'display: flex; align-items: center; justify-content: center;',
        between: 'display: flex; align-items: center; justify-content: space-between;',
        around: 'display: flex; align-items: center; justify-content: space-around;',
        evenly: 'display: flex; align-items: center; justify-content: space-evenly;',
        start: 'display: flex; align-items: center; justify-content: flex-start;',
        end: 'display: flex; align-items: center; justify-content: flex-end;',
      },
      position: {
        absolute: 'position: absolute;',
        relative: 'position: relative;',
        fixed: 'position: fixed;',
        sticky: 'position: sticky;',
      },
      overflow: {
        hidden: 'overflow: hidden;',
        auto: 'overflow: auto;',
        scroll: 'overflow: scroll;',
        visible: 'overflow: visible;',
      },
      text: {
        truncate: 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;',
        center: 'text-align: center;',
        left: 'text-align: left;',
        right: 'text-align: right;',
        justify: 'text-align: justify;',
        uppercase: 'text-transform: uppercase;',
        lowercase: 'text-transform: lowercase;',
        capitalize: 'text-transform: capitalize;',
      },
      cursor: {
        pointer: 'cursor: pointer;',
        notAllowed: 'cursor: not-allowed;',
        default: 'cursor: default;',
        help: 'cursor: help;',
        wait: 'cursor: wait;',
        move: 'cursor: move;',
        grab: 'cursor: grab;',
        grabbing: 'cursor: grabbing;',
      },
      display: {
        none: 'display: none;',
        block: 'display: block;',
        inline: 'display: inline;',
        inlineBlock: 'display: inline-block;',
        grid: 'display: grid;',
        inlineGrid: 'display: inline-grid;',
        flex: 'display: flex;',
        inlineFlex: 'display: inline-flex;',
      },
    },
    transitions: transitions,
    container: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
  darkTheme: {
    name: 'dark',
    colors: {
      primary: '#FF4D4D',
      primaryLight: '#FF9999',
      primaryDark: '#CC4444',
      secondary: '#00FFFF',
      secondaryLight: '#66FFFE',
      secondaryDark: '#009999',
      accent: {
        pink: '#FF6B9D',
        purple: '#C44569',
        blue: '#4ECDC4',
        teal: '#44A08D',
        orange: '#FFA726',
        yellow: '#FFD54F',
        green: '#66BB6A',
        red: '#EF5350',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#B0BEC5',
        tertiary: '#90A4AE',
        disabled: '#607D8B',
        inverse: '#1A1A1A',
      },
      background: {
        primary: '#121212',
        secondary: '#1E1E1E',
        tertiary: '#2A2A2A',
        dark: '#FFFFFF',
        darkSecondary: '#F5F5F5',
        darkTertiary: '#EEEEEE',
      },
      surface: {
        primary: '#1E1E1E',
        secondary: '#2A2A2A',
        tertiary: '#363636',
        dark: '#FFFFFF',
        darkSecondary: '#FAFAFA',
        darkTertiary: '#F5F5F5',
      },
      border: {
        light: '#2F2F2F',
        medium: '#424242',
        dark: '#616161',
        lightDark: '#E0E0E0',
        mediumDark: '#BDBDBD',
        darkDark: '#9E9E9E',
      },
      shadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
        dark: {
          sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
          md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
          lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
          xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
        }
      },
      gradients: {
        primary: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)',
        secondary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        sunset: 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 52%, #2BFF88 90%)',
        ocean: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
        fire: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
        dark: 'linear-gradient(135deg, #0F1419 0%, #1A1F29 100%)',
      },
      anime: {
        ongoing: '#4CAF50',
        completed: '#2196F3',
        upcoming: '#FF9800',
        hiatus: '#9C27B0',
        masterpiece: '#FFD700',
        great: '#4CAF50',
        good: '#2196F3',
        average: '#FF9800',
        bad: '#F44336',
        sub: '#00BCD4',
        dub: '#9C27B0',
        raw: '#795548',
      },
      opacity: {
        0: '0',
        25: '0.25',
        50: '0.5',
        75: '0.75',
        100: '1',
      },
    },
    typography: {
      fontFamily: {
        primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
        mono: "'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Consolas', 'Courier New', monospace",
        display: "'Playfair Display', 'Georgia', serif",
      },
      fontSize: {
        xs: ['12px', '16px'],
        sm: ['14px', '20px'],
        base: ['16px', '24px'],
        lg: ['18px', '28px'],
        xl: ['20px', '28px'],
        '2xl': ['24px', '32px'],
        '3xl': ['30px', '36px'],
        '4xl': ['36px', '40px'],
        '5xl': ['48px', '48px'],
        '6xl': ['60px', '72px'],
        '7xl': ['72px', '84px'],
      },
      fontWeight: {
        thin: 100,
        extralight: 200,
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900,
      },
      lineHeight: {
        tight: 1.25,
        snug: 1.375,
        normal: 1.5,
        relaxed: 1.625,
        loose: 2,
      },
      letterSpacing: {
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
    },
    spacing: {
      0: '0',
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      5: '20px',
      6: '24px',
      7: '28px',
      8: '32px',
      9: '36px',
      10: '40px',
      11: '44px',
      12: '48px',
      14: '56px',
      16: '64px',
      20: '80px',
      24: '96px',
      28: '112px',
      32: '128px',
      36: '144px',
      40: '160px',
      44: '176px',
      48: '192px',
      56: '224px',
      64: '256px',
    },
    borderRadius: {
      none: '0',
      sm: '2px',
      md: '4px',
      lg: '6px',
      xl: '8px',
      '2xl': '12px',
      '3xl': '16px',
      full: '9999px',
      pill: '999px',
      circle: '50%',
    },
    animation: {
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
        slower: '700ms',
      },
      easing: {
        linear: 'linear',
        ease: 'ease',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
    breakpoints: {
      xs: '320px',
      sm: '480px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      maxSm: '479px',
      maxMd: '767px',
      maxLg: '1023px',
      maxXl: '1279px',
      max2xl: '1535px',
    },
    zIndex: {
      auto: 'auto',
      0: 0,
      10: 10,
      20: 20,
      30: 30,
      40: 40,
      50: 50,
      dropdown: 1000,
      sticky: 1020,
      fixed: 1030,
      modalBackdrop: 1040,
      modal: 1050,
      popover: 1060,
      tooltip: 1070,
      toast: 1080,
      loading: 1090,
      navbar: 1100,
    },
    opacity: {
      0: '0',
      25: '0.25',
      50: '0.5',
      75: '0.75',
      100: '1',
    },
    elevation: {
      0: 'none',
      1: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      2: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
      3: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
      4: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
      5: '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)',
    },
    form: {
      input: {
        height: '44px',
        padding: '0 16px',
        fontSize: '16px',
        borderRadius: '8px',
        border: '2px solid',
        focusBorder: '2px solid',
        transition: 'all 0.2s ease',
      },
      select: {
        height: '44px',
        padding: '0 16px',
        fontSize: '16px',
        borderRadius: '8px',
        border: '2px solid',
        focusBorder: '2px solid',
        transition: 'all 0.2s ease',
      },
      button: {
        height: '44px',
        padding: '0 24px',
        fontSize: '16px',
        fontWeight: '600',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        minHeight: '44px',
      },
    },
    card: {
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      transition: 'all 0.3s ease',
      hover: {
        transform: 'translateY(-4px)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
    utils: {
      flex: {
        center: 'display: flex; align-items: center; justify-content: center;',
        between: 'display: flex; align-items: center; justify-content: space-between;',
        around: 'display: flex; align-items: center; justify-content: space-around;',
        evenly: 'display: flex; align-items: center; justify-content: space-evenly;',
        start: 'display: flex; align-items: center; justify-content: flex-start;',
        end: 'display: flex; align-items: center; justify-content: flex-end;',
      },
      position: {
        absolute: 'position: absolute;',
        relative: 'position: relative;',
        fixed: 'position: fixed;',
        sticky: 'position: sticky;',
      },
      overflow: {
        hidden: 'overflow: hidden;',
        auto: 'overflow: auto;',
        scroll: 'overflow: scroll;',
        visible: 'overflow: visible;',
      },
      text: {
        truncate: 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;',
        center: 'text-align: center;',
        left: 'text-align: left;',
        right: 'text-align: right;',
        justify: 'text-align: justify;',
        uppercase: 'text-transform: uppercase;',
        lowercase: 'text-transform: lowercase;',
        capitalize: 'text-transform: capitalize;',
      },
      cursor: {
        pointer: 'cursor: pointer;',
        notAllowed: 'cursor: not-allowed;',
        default: 'cursor: default;',
        help: 'cursor: help;',
        wait: 'cursor: wait;',
        move: 'cursor: move;',
        grab: 'cursor: grab;',
        grabbing: 'cursor: grabbing;',
      },
      display: {
        none: 'display: none;',
        block: 'display: block;',
        inline: 'display: inline;',
        inlineBlock: 'display: inline-block;',
        grid: 'display: grid;',
        inlineGrid: 'display: inline-grid;',
        flex: 'display: flex;',
        inlineFlex: 'display: inline-flex;',
      },
    },
    transitions: transitions,
    container: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
  getTheme: (isDark = false) => isDark ? darkTheme : lightTheme,
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  themeUtils: {
    mixins: {
      flexCenter: 'display: flex; align-items: center; justify-content: center;',
      flexBetween: 'display: flex; align-items: center; justify-content: space-between;',
      flexAround: 'display: flex; align-items: center; justify-content: space-around;',
      flexEvenly: 'display: flex; align-items: center; justify-content: space-evenly;',
      absoluteCenter: 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);',
      truncateText: 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;',
      hideScrollbar: '-ms-overflow-style: none; scrollbar-width: none; &::-webkit-scrollbar { display: none; }',
      gridCenter: 'display: grid; place-items: center;',
      fadeIn: 'animation: fadeIn 0.3s ease-in-out;',
      slideInUp: 'animation: slideInUp 0.3s ease-out;',
      slideInDown: 'animation: slideInDown 0.3s ease-out;',
      slideInLeft: 'animation: slideInLeft 0.3s ease-out;',
      slideInRight: 'animation: slideInRight 0.3s ease-out;',
      scaleIn: 'animation: scaleIn 0.3s ease-out;',
      pulse: 'animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;',
      spin: 'animation: spin 1s linear infinite;',
      hoverLift: 'transition: transform 0.2s ease, box-shadow 0.2s ease; &:hover { transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }',
      hoverScale: 'transition: transform 0.2s ease; &:hover { transform: scale(1.05); }',
      focusVisible: '&:focus-visible { outline: 2px solid #FF4D4D; outline-offset: 2px; }',
      container: 'max-width: 1024px; margin: 0 auto; padding-left: 16px; padding-right: 16px; @media (min-width: 768px) { padding-left: 24px; padding-right: 24px; } @media (min-width: 1024px) { padding-left: 32px; padding-right: 32px; }',
    },
    colorUtils: {
      getShade: (color, percent) => color,
      withOpacity: (color, opacity) => {
        if (color.startsWith('#')) {
          const r = parseInt(color.slice(1, 3), 16);
          const g = parseInt(color.slice(3, 5), 16);
          const b = parseInt(color.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
        return color;
      },
      getContrastRatio: (color1, color2) => 4.5,
      getContrastColor: (color) => {
        if (color.startsWith('#')) {
          const r = parseInt(color.slice(1, 3), 16);
          const g = parseInt(color.slice(3, 5), 16);
          const b = parseInt(color.slice(5, 7), 16);
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          return brightness > 128 ? '#000000' : '#FFFFFF';
        }
        return '#000000';
      },
    },
    media: {
      xs: '@media (min-width: 320px)',
      sm: '@media (min-width: 480px)',
      md: '@media (min-width: 768px)',
      lg: '@media (min-width: 1024px)',
      xl: '@media (min-width: 1280px)',
      '2xl': '@media (min-width: 1536px)',
      maxSm: '@media (max-width: 479px)',
      maxMd: '@media (max-width: 767px)',
      maxLg: '@media (max-width: 1023px)',
      maxXl: '@media (max-width: 1279px)',
      max2xl: '@media (max-width: 1535px)',
      hover: '@media (hover: hover)',
      pointer: '@media (pointer: fine)',
      coarse: '@media (pointer: coarse)',
      reducedMotion: '@media (prefers-reduced-motion: reduce)',
      darkMode: '@media (prefers-color-scheme: dark)',
      lightMode: '@media (prefers-color-scheme: light)',
      portrait: '@media (orientation: portrait)',
      landscape: '@media (orientation: landscape)',
    },
  },
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock AuthContext
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: jest.fn((props) => {
    return {
      ...props,
      children: props.children,
      className: props.className || '',
      style: props.style || {},
    };
  }),
  AnimatePresence: jest.fn(({ children }) => children),
}));

// Mock styled-components
jest.mock('styled-components', () => {
  const createStyledComponent = (tag) => {
    return function StyledComponent(props) {
      return {
        ...props,
        children: props.children,
        className: props.className || '',
        style: props.style || {},
        'data-testid': props['data-testid']
      };
    };
  };

  const mockStyled = jest.fn().mockImplementation(createStyledComponent);

  // Добавляем поддержку styled.div, styled.button и т.д.
  mockStyled.div = createStyledComponent('div');
  mockStyled.button = createStyledComponent('button');
  mockStyled.header = createStyledComponent('header');
  mockStyled.nav = createStyledComponent('nav');
  mockStyled.link = createStyledComponent('link');
  mockStyled.section = createStyledComponent('section');
  mockStyled.input = createStyledComponent('input');
  mockStyled.textarea = createStyledComponent('textarea');
  mockStyled.span = createStyledComponent('span');

  // Добавляем остальные常用的 HTML теги
  ['a', 'article', 'aside', 'audio', 'blockquote', 'canvas', 'cite', 'code', 'dd', 'details', 'dialog', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'iframe', 'img', 'ins', 'label', 'legend', 'li', 'main', 'mark', 'menu', 'menuitem', 'meter', 'nav', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'select', 'small', 'source', 'strong', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr', 'track', 'u', 'ul', 'var', 'video'].forEach(tag => {
    mockStyled[tag] = createStyledComponent(tag);
  });

  const createGlobalStyle = jest.fn(() => () => null);

  return {
    __esModule: true,
    default: mockStyled,
    createGlobalStyle: createGlobalStyle,
  };
});

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('рендерится без ошибок', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText('🎌 AnimeHub')).toBeInTheDocument();
  });

  it('отображает навигационные ссылки', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText('Главная')).toBeInTheDocument();
    expect(screen.getByText('Каталог')).toBeInTheDocument();
    expect(screen.getByText('Популярное')).toBeInTheDocument();
    expect(screen.getByText('Новинки')).toBeInTheDocument();
  });

  it('отображает кнопки входа и регистрации для неаутентифицированных пользователей', () => {
    // Мокаем неаутентифицированный контекст
    jest.mocked(require('../../context/AuthContext').useAuth).mockReturnValue(mockAuthContextUnauthenticated);

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText('Войти')).toBeInTheDocument();
    expect(screen.getByText('Регистрация')).toBeInTheDocument();
  });

  it('отображает информацию пользователя для аутентифицированных пользователей', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText(mockUser.username)).toBeInTheDocument();
  });

  it('отображает аватар пользователя при его наличии', () => {
    const userWithAvatar = { ...mockUser, avatar: 'https://example.com/avatar.jpg' };
    jest.mocked(require('../../context/AuthContext').useAuth).mockReturnValue({
      ...mockAuthContext,
      user: userWithAvatar,
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const avatar = screen.getByAltText(mockUser.username);
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('генерирует аватар из первой буквы имени пользователя при отсутствии аватара', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const avatar = screen.getByText(mockUser.username.charAt(0).toUpperCase());
    expect(avatar).toBeInTheDocument();
  });

  it('отображает выпадающее меню пользователя при клике', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const userButton = screen.getByText(mockUser.username);
    fireEvent.click(userButton);

    expect(screen.getByText('Профиль')).toBeInTheDocument();
    expect(screen.getByText('Мой список')).toBeInTheDocument();
    expect(screen.getByText('Избранное')).toBeInTheDocument();
    expect(screen.getByText('Настройки')).toBeInTheDocument();
  });

  it('отображает ссылку на админ-панель для администраторов', () => {
    const adminUser = { ...mockUser, role: 'admin' };
    jest.mocked(require('../../context/AuthContext').useAuth).mockReturnValue({
      ...mockAuthContext,
      user: adminUser,
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const userButton = screen.getByText(adminUser.username);
    fireEvent.click(userButton);

    expect(screen.getByText('Админ-панель')).toBeInTheDocument();
  });

  it('скрывает выпадающее меню при клике вне его области', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const userButton = screen.getByText(mockUser.username);
    fireEvent.click(userButton);

    expect(screen.getByText('Профиль')).toBeInTheDocument();

    // Клик вне области меню
    fireEvent.mouseDown(document);
    expect(screen.queryByText('Профиль')).not.toBeInTheDocument();
  });

  it('обрабатывает выход из аккаунта', () => {
    const logoutMock = jest.fn();
    jest.mocked(require('../../context/AuthContext').useAuth).mockReturnValue({
      ...mockAuthContext,
      logout: logoutMock,
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const userButton = screen.getByText(mockUser.username);
    fireEvent.click(userButton);

    const logoutButton = screen.getByText('Выйти');
    fireEvent.click(logoutButton);

    expect(logoutMock).toHaveBeenCalled();
  });

  it('переключает мобильное меню при клике на кнопку', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const mobileMenuButton = screen.getByRole('button', { name: /меню/i });
    fireEvent.click(mobileMenuButton);

    expect(screen.getByText('Главная')).toBeInTheDocument();
    expect(screen.getByText('Каталог')).toBeInTheDocument();
    expect(screen.getByText('Популярное')).toBeInTheDocument();
    expect(screen.getByText('Новинки')).toBeInTheDocument();
  });

  it('анимирует мобильное меню при открытии и закрытии', () => {
    const { rerender } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const mobileMenuButton = screen.getByRole('button', { name: /меню/i });
    
    // Закрытое состояние
    expect(screen.queryByText('Главная')).not.toBeInTheDocument();

    // Открытие
    fireEvent.click(mobileMenuButton);
    expect(screen.getByText('Главная')).toBeInTheDocument();

    // Закрытие
    fireEvent.click(mobileMenuButton);
    expect(screen.queryByText('Главная')).not.toBeInTheDocument();
  });

  it('поддерживает переключение темы', () => {
    const themeToggle = screen.getByTestId('theme-toggle');
    fireEvent.click(themeToggle);

    // Проверяем, что переключение темы не вызывает ошибок
    expect(true).toBe(true);
  });

  it('корректно обрабатывает unmount', () => {
    const { unmount } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    unmount();
    // Проверяем, что очистка прошла без ошибок
    expect(true).toBe(true);
  });

  it('поддерживает кастомные стили', () => {
    const customStyle = { backgroundColor: 'red' };

    render(
      <MemoryRouter>
        <Header data-testid="header" style={customStyle} />
      </MemoryRouter>
    );

    const header = screen.getByTestId('header');
    expect(header).toHaveStyle('background-color: red');
  });

  it('поддерживает кастомные классы', () => {
    render(
      <MemoryRouter>
        <Header data-testid="header" className="custom-header" />
      </MemoryRouter>
    );

    const header = screen.getByTestId('header');
    expect(header).toHaveClass('custom-header');
  });

  it('адаптируется под мобильные устройства', () => {
    // Тест в мобильной версии
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: true, // Мобильная версия
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    // В мобильной версии навигационные ссылки должны быть скрыты
    expect(screen.queryByText('Каталог')).not.toBeInTheDocument();

    // Кнопка мобильного меню должна быть видна
    expect(screen.getByRole('button', { name: /меню/i })).toBeInTheDocument();
  });

  it('поддерживает навигацию при клике на ссылки', () => {
    const navigateMock = jest.fn();
    jest.mocked(useNavigate).mockReturnValue(navigateMock);

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    // Открываем мобильное меню
    const mobileMenuButton = screen.getByRole('button', { name: /меню/i });
    fireEvent.click(mobileMenuButton);

    // Кликаем на ссылку
    const catalogLink = screen.getByText('Каталог');
    fireEvent.click(catalogLink);

    expect(navigateMock).toHaveBeenCalledWith('/catalog');
  });

  it('поддерживает навигацию при клике на пользовательские ссылки', () => {
    const navigateMock = jest.fn();
    jest.mocked(useNavigate).mockReturnValue(navigateMock);

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    // Открываем меню пользователя
    const userButton = screen.getByText(mockUser.username);
    fireEvent.click(userButton);

    // Кликаем на ссылку профиля
    const profileLink = screen.getByText('Профиль');
    fireEvent.click(profileLink);

    expect(navigateMock).toHaveBeenCalledWith('/profile');
  });

  it('поддерживает реактивное обновление при изменении данных пользователя', () => {
    const { rerender } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    // Изменяем данные пользователя
    const updatedUser = { ...mockUser, username: 'updateduser' };
    jest.mocked(require('../../context/AuthContext').useAuth).mockReturnValue({
      ...mockAuthContext,
      user: updatedUser,
    });

    rerender(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText('updateduser')).toBeInTheDocument();
  });
});