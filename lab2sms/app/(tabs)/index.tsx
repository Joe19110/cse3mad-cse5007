import { Image, StyleSheet, View, Button, Alert, TextInput } from 'react-native';
import * as SMS from 'expo-sms';
import {Link, useLocalSearchParams} from 'expo-router';
import React from 'react';

export default function HomeScreen() {
  
  const {id} = useLocalSearchParams<{id: ['0123456789', '9876543210']}>(); //, '9876543210']; //change these phone numbers
  const [text, onChangeText] = React.useState('Hello: My lecturer is the greatest!!');

  function askToSend() {
    Alert.alert('SMS Send', 'Send: ' + id, [
      {
        text: 'Cancel',
      },
      {
        text: 'Ok', onPress:()=> _handlePressButtonAsync()
      }
    ]);
  }

  async function _handlePressButtonAsync(){
  const { result } = await SMS.sendSMSAsync(
    id,
    text,
    /* {
      attachments: {
        uri: 'https://www.latrobe.edu.au/__data/assets/file/0010/796393/logo-white.svg',
        mimeType: 'image/png',
        filename: 'myfile.png',
      },
    } */
  );
  if (result === 'sent') {
    alert("Sent");
  } else {
    alert("Error: Check your balance or check phone");
  }
 }

  return (
    <View style = {styles.header}>
      <View style = {styles.containerRow}>
          <Button
              title = "Send SMS"
              onPress={()=>askToSend()}
              />
         
          <Link href="./contacts" asChild>
            <Button title="Contacts"></Button>
          </Link>
      </View>
      <TextInput
      onChangeText = {onChangeText}
      value={text}
      />
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