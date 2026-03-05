// index.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';

// ✅ Import themes and type
import type { Theme } from '../../components/ThemeContext';
import {
  blueTheme,
  darkTheme,
  lightTheme,
  yellowTheme,
} from '../../components/ThemeContext';

// List of available themes (you can add more)
const themes: Theme[] = [lightTheme, darkTheme, blueTheme, yellowTheme];

const ThemedApp = () => {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const [themeIndex, setThemeIndex] = useState<number>(0);
  const [theme, setTheme] = useState<Theme>(lightTheme);

  // 🧠 On first load: match system theme
  useEffect(() => {
    if (systemScheme === 'dark') {
      setTheme(darkTheme);
      setThemeIndex(1); // darkTheme is at index 1 in the array
    } else {
      setTheme(lightTheme);
      setThemeIndex(0);
    }
  }, [systemScheme]);

  // 🔁 Cycle to the next theme manually
  const cycleTheme = () => {
    const nextIndex = (themeIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
    setThemeIndex(nextIndex);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.text, { color: theme.colors.text }]}>
        Current theme: {theme.mode}
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.customColors.buttonBackground }]}
        onPress={cycleTheme}
      >
        <Text style={{ color: theme.customColors.buttonText }}>
          Switch Theme
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ThemedApp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  text: {
    fontSize: 20,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
});