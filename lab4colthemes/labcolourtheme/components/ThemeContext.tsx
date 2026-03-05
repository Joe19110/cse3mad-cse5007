// ThemeContext.tsx

import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationLightTheme,
} from '@react-navigation/native';

export type Theme = {
  dark: boolean;
  mode: 'light' | 'dark' | 'blue' | 'yellow';
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
  };
  customColors: {
    buttonBackground: string;
    buttonText: string;
  };
};

export const lightTheme: Theme = {
  dark: false,
  mode: 'light',
  colors: {
    ...NavigationLightTheme.colors,
  },
  customColors: {
    buttonBackground: '#dddddd',
    buttonText: '#000000',
  },
};

export const darkTheme: Theme = {
  dark: true,
  mode: 'dark',
  colors: {
    ...NavigationDarkTheme.colors,
  },
  customColors: {
    buttonBackground: '#333333',
    buttonText: '#ffffff',
  },
};

export const blueTheme: Theme = {
  dark: false,
  mode: 'blue',
  colors: {
    ...NavigationLightTheme.colors,
    background: '#e6f0ff',
    card: '#cce0ff',
    text: '#003366',
    border: '#99c2ff',
    primary: '#0055cc',
    notification: '#3399ff',
  },
  customColors: {
    buttonBackground: '#3399ff',
    buttonText: '#ffffff',
  },
};

export const yellowTheme: Theme = {
  dark: false,
  mode: 'yellow',
  colors: {
    ...NavigationLightTheme.colors,
    background: '#fffce6',
    card: '#fff799',
    text: '#665500',
    border: '#ffee66',
    primary: '#ffcc00',
    notification: '#ffeb3b',
  },
  customColors: {
    buttonBackground: '#ffcc00',
    buttonText: '#000000',
  },
};