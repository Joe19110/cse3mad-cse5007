import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();

  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState('');

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>
          Camera permission required
        </Text>

        <Button
          title="Grant Permission"
          onPress={requestPermission}
        />
      </View>
    );
  }

  const handleScan = ({ data }: { data: string }) => {
    setScanned(true);
    setResult(data);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={
          scanned ? undefined : handleScan
        }
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              setFacing(
                facing === 'back' ? 'front' : 'back'
              )
            }
          >
            <Text style={styles.buttonText}>
              Flip Camera
            </Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      <View style={styles.resultContainer}>
        <Text style={styles.result}>
          {result || 'Scan a QR code'}
        </Text>

        {scanned && (
          <Button
            title="Scan Again"
            onPress={() => {
              setScanned(false);
              setResult('');
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  text: {
    marginBottom: 12,
    fontSize: 16,
  },

  camera: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },

  button: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
  },

  resultContainer: {
    padding: 20,
    backgroundColor: '#111',
  },

  result: {
    color: '#fff',
    fontSize: 16,
  },
});