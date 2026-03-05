//app/(tabs)/index.tsx
import { Image, StyleSheet, View, Button, Alert, TextInput } from 'react-native';
import {Link, useLocalSearchParams} from 'expo-router';
import React from 'react';
//import * as loc from "../locPermissionsButton"; //import from second file

export default function HomeScreen() {

  return (
    
    <View style = {styles.header}>
      <View style = {styles.containerRow}>
          <Link href="../locPermissionsButton" asChild>
            <Button title="Location"></Button>
          </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 40
  },
  containerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8.
  }
  
});