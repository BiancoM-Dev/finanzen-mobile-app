import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@finanzen_theme_mode';

export const lightColors = {
  isDark: false,
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  surfaceElevated: '#FFFFFF',
  border: '#E2E8F0',
  borderSubtle: '#F1F5F9',
  
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  
  primary: '#4F46E5', // Indigo vibrante moderno
  primaryLight: '#EEF2FF',
  primaryDark: '#3730A3',
  
  success: '#10B981', // Verde esmeralda fintech
  successLight: '#ECFDF5',
  successBorder: '#A7F3D0',
  successText: '#047857',
  
  danger: '#F43F5E', // Rosa/Rojo coral moderno
  dangerLight: '#FFF1F2',
  dangerBorder: '#FECDD3',
  dangerText: '#BE123C',
  
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningBorder: '#FDE68A',
  warningText: '#B45309',

  accentPurple: '#8B5CF6',
  accentPurpleLight: '#F5F3FF',

  cardShadow: 'rgba(15, 23, 42, 0.06)',
  balanceCardBg: '#0F172A', // Tarjeta premium oscura elegante en modo claro
  balanceCardText: '#F8FAFC',
  
  tabBarBg: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  tabBarActive: '#4F46E5',
  tabBarInactive: '#94A3B8',
};

export const darkColors = {
  isDark: true,
  background: '#090D16', // Fondo ultra oscuro moderno estilo Neo-Bank
  surface: '#131B2E',
  surfaceSubtle: '#1E293B',
  surfaceElevated: '#1A233A',
  border: '#243048',
  borderSubtle: '#1C263C',
  
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#64748B',
  
  primary: '#6366F1',
  primaryLight: '#1E1B4B',
  primaryDark: '#4F46E5',
  
  success: '#34D399',
  successLight: '#064E3B',
  successBorder: '#065F46',
  successText: '#A7F3D0',
  
  danger: '#FB7185',
  dangerLight: '#4C0519',
  dangerBorder: '#881337',
  dangerText: '#FECDD3',
  
  warning: '#FBBF24',
  warningLight: '#451A03',
  warningBorder: '#78350F',
  warningText: '#FDE68A',

  accentPurple: '#A78BFA',
  accentPurpleLight: '#2E1065',

  cardShadow: 'rgba(0, 0, 0, 0.4)',
  balanceCardBg: '#131B2E',
  balanceCardText: '#F8FAFC',
  
  tabBarBg: '#0F172A',
  tabBarBorder: '#1E293B',
  tabBarActive: '#818CF8',
  tabBarInactive: '#64748B',
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('dark'); // Default a dark moderno fintech

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved) {
          setThemeMode(saved);
        } else if (systemScheme) {
          setThemeMode(systemScheme);
        }
      } catch (e) {
        console.error('Error cargando tema:', e);
      }
    };
    loadTheme();
  }, [systemScheme]);

  const toggleTheme = async () => {
    const nextMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode);
    } catch (e) {
      console.error('Error guardando tema:', e);
    }
  };

  const colors = themeMode === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme, colors, isDark: themeMode === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider');
  }
  return context;
};
