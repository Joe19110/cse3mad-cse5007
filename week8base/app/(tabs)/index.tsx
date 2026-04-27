import {
  Image,
  StyleSheet,
  View,
  Button,
  Alert,
  TextInput,
  SafeAreaView,
  Text,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const { user, loading, error, signUp, signIn, logout, deleteAccount } = useAuth();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.header}>
          <ActivityIndicator size="large" color="#0000ff" />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    try {
      await signUp(email, password);
      Alert.alert('Success', 'Account created successfully!');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      const message = err.message || 'Sign up failed';
      setAuthError(message);
      Alert.alert('Sign Up Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    try {
      await signIn(email, password);
      Alert.alert('Success', 'Logged in successfully!');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      const message = err.message || 'Sign in failed';
      setAuthError(message);
      Alert.alert('Sign In Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: async () => {
          setIsLoading(true);
          setAuthError(null);
          try {
            await logout();
            Alert.alert('Success', 'Logged out successfully!');
          } catch (err: any) {
            const message = err.message || 'Logout failed';
            setAuthError(message);
            Alert.alert('Logout Error', message);
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    Alert.alert('Delete Account', 'This action cannot be undone. Are you sure?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: async () => {
          setIsLoading(true);
          setAuthError(null);
          try {
            await deleteAccount();
            Alert.alert('Success', 'Account deleted successfully!');
          } catch (err: any) {
            const message = err.message || 'Account deletion failed';
            setAuthError(message);
            Alert.alert('Delete Error', message);
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.header}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.colContainer}>
            {/* User Status */}
            <View style={styles.statusContainer}>
              <Text style={styles.statusTitle}>Authentication Status</Text>
              {user ? (
                <View style={styles.userInfo}>
                  <Text style={styles.userEmail}>Logged in as:</Text>
                  <Text style={styles.userEmailValue}>{user.email}</Text>
                  <Text style={styles.userId}>UID: {user.uid.substring(0, 10)}...</Text>
                </View>
              ) : (
                <Text style={styles.notLoggedIn}>Not logged in</Text>
              )}
            </View>

            {/* Error Display */}
            {authError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{authError}</Text>
              </View>
            )}

            {/* Input Fields */}
            {!user && (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  editable={!isLoading}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {!user ? (
                <>
                  <View style={styles.buttonRow}>
                    <View style={styles.flexButton}>
                      <Button
                        title={isLoading ? 'Signing In...' : 'Sign In'}
                        onPress={handleSignIn}
                        disabled={isLoading}
                        color="#007AFF"
                      />
                    </View>
                    <View style={styles.flexButton}>
                      <Button
                        title={isLoading ? 'Creating...' : 'Sign Up'}
                        onPress={handleSignUp}
                        disabled={isLoading}
                        color="#34C759"
                      />
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.buttonRow}>
                    <View style={styles.flexButton}>
                      <Button
                        title={isLoading ? 'Logging Out...' : 'Logout'}
                        onPress={handleLogout}
                        disabled={isLoading}
                        color="#FF9500"
                      />
                    </View>
                    <View style={styles.flexButton}>
                      <Button
                        title={isLoading ? 'Deleting...' : 'Delete Account'}
                        onPress={handleDeleteAccount}
                        disabled={isLoading}
                        color="#FF3B30"
                      />
                    </View>
                  </View>
                </>
              )}
            </View>

            {/* Loading Indicator */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  header: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  colContainer: {
    flexDirection: 'column',
    gap: 20,
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  userInfo: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 6,
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  userEmailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userId: {
    fontSize: 11,
    color: '#999',
  },
  notLoggedIn: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  errorContainer: {
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f88',
  },
  errorText: {
    color: '#c33',
    fontSize: 13,
  },
  inputContainer: {
    gap: 12,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  buttonContainer: {
    gap: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  flexButton: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
});