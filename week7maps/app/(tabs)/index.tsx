import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, Button, Alert } from "react-native";
import MapView, { Marker, Polyline, Polygon, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from 'expo-location';

export default function App() {
  // Define our key locations
  const fxSudirman = { latitude: -6.224515, longitude: 106.803362 }; // Campus / FX Sudirman
  const binusSyahdan = { latitude: -6.200305, longitude: 106.784210 };
  const apartemenLaguna = { latitude: -6.115865, longitude: 106.782007 };

  const markers = [
    {
      coordinate: fxSudirman,
      title: "Campus - FX Sudirman",
      description: "University Campus",
    },
    {
      coordinate: binusSyahdan,
      title: "BINUS Syahdan",
      description: "Campus location 2",
    },
    {
      coordinate: apartemenLaguna,
      title: "Apartemen Laguna",
      description: "Home Base",
    },
  ];

  // Route to university (Simulated commute path from Laguna to FX Sudirman)
  const routeToUni = [
    apartemenLaguna,
    { latitude: -6.1400, longitude: 106.7850 }, // Waypoint near Pluit
    { latitude: -6.1650, longitude: 106.7880 }, // Waypoint near Grogol
    { latitude: -6.1950, longitude: 106.7950 }, // Waypoint near Slipi
    fxSudirman,
  ];

  // Polygon connecting the places frequently visited in a week
  const weeklyVisitedArea = [
    apartemenLaguna,
    binusSyahdan,
    fxSudirman,
    { latitude: -6.1855, longitude: 106.8222 }, // Optional corner (e.g. Central Jakarta) to shape the polygon
  ];

  const [addressInput, setAddressInput] = useState<string>('Senayan City, Jakarta');
  const [searchedCoords, setSearchedCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [addressOutput, setAddressOutput] = useState<string>('');

  const geocodeAddress = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Location permission is needed');
      return;
    }
    try {
      const results = await Location.geocodeAsync(addressInput);
      if (results.length > 0) {
        const { latitude, longitude } = results[0];
        setSearchedCoords({ latitude, longitude });
        setAddressOutput(''); // Reset output on new search
      } else {
        Alert.alert('No results', 'Could not find that address.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to geocode');
    }
  };

  const reverseGeocode = async () => {
    if (!searchedCoords) {
      Alert.alert('No coords', 'Please geocode an address first.');
      return;
    }
    try {
      const results = await Location.reverseGeocodeAsync(searchedCoords);
      if (results.length > 0) {
        const res = results[0];
        setAddressOutput(
          `${res.name ?? ''} ${res.street ?? ''}, ${res.city ?? ''} ${res.region ?? ''}, ${res.country ?? ''}`
        );
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to reverse geocode');
    }
  };

  return (
    <View style={styles.container}>
      {/* Geocoding Overlay UI */}
      <View style={styles.searchPanel}>
        <TextInput
          style={styles.input}
          value={addressInput}
          onChangeText={setAddressInput}
          placeholder="Enter address..."
        />
        <View style={styles.buttonRow}>
          <Button title="Geocode to Pin" onPress={geocodeAddress} />
          <Button title="Reverse Geocode" onPress={reverseGeocode} disabled={!searchedCoords} />
        </View>
        {addressOutput ? <Text style={styles.infoText}>Address: {addressOutput}</Text> : null}
      </View>

      <MapView
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={{
        latitude: -6.1800,
        longitude: 106.7920,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
      }}
      accessible={true}
      accessibilityLabel="Map of Jakarta showing commute routes and weekly visited areas"
    >
      {/* 1. Markers for specific points of interest */}
      {markers.map((marker, index) => (
        <Marker
          key={index}
          coordinate={marker.coordinate}
          title={marker.title}
          description={marker.description}
          accessible={true}
          accessibilityLabel={`${marker.title}. ${marker.description}`}
        />
      ))}

      {/* 2. Polyline: Commute mapped to university */}
      <Polyline
        coordinates={routeToUni}
        strokeColor="#007AFF" // Blue route
        strokeWidth={4}
      />

      {/* 3. Polygon: Area containing frequented weekly places */}
      <Polygon
        coordinates={weeklyVisitedArea}
        fillColor="rgba(255, 165, 0, 0.3)" // Semi-transparent Orange
        strokeColor="rgba(255, 140, 0, 1)"
        strokeWidth={2}
      />
      {searchedCoords && (
        <Marker
          coordinate={searchedCoords}
          title="Searched Location"
          description={addressOutput || "Tap 'Reverse Geocode' to get address"}
          pinColor="indigo"
          accessible={true}
          accessibilityLabel="Searched Location Marker"
        />
      )}

    </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  searchPanel: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    elevation: 4, // shadow for Android
    shadowColor: '#000', // shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    zIndex: 10,
  },
  input: {
    borderColor: '#888',
    borderWidth: 1,
    padding: 8,
    marginBottom: 8,
    borderRadius: 4,
    backgroundColor: '#f9f9f9',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});