import { Text, View, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { insertUser } from "./database";
import bcrypt from 'react-native-bcrypt';
import 'react-native-get-random-values';

bcrypt.setRandomFallback((n) => {
  const randomValues = new Uint8Array(n);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues).map((val) => val % 256);
});

export default function Register() {
  const [ username, setUsername] = useState('')
  const [ password1, setPassword1] = useState('')
  const [ password2, setPassword2] = useState('')
  const [ flag, setFlag ] = useState(0)

  const navigation = useNavigation();

  // Switch to login page
  const switchPage = (page) => {
    navigation.navigate(page)
  }

  // Handles submit button being pressed
  const clickedSubmit = async () => {
    if (password1 == password2) {
      try {
        const hashedPassword = await encryptPass()
        const inserting = await insertUser(username, hashedPassword)
        console.log(inserting)
        if (inserting == 0) {
          setFlag(2) // Username already taken.
        }
        else {
          setFlag(3) // Success
        }
        return
      }
      catch (error) {
        console.log(error)
      }
    }
    else {
      setFlag(1) // Passwords dont match
    }
  }

  const encryptPass = async () => {
    let hashedPassword
    try {
      const salt = bcrypt.genSaltSync(10); // Generate salt
      hashedPassword = bcrypt.hashSync(password1, salt); // Hash password
    } catch (error) {
      console.error("Error hashing password:", error);
    }
    return hashedPassword
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register Screen.</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputHeader}>Username</Text>
        <TextInput
          style={styles.input}
          onChangeText={setUsername}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputHeader}>Password</Text>
        <TextInput
          style={styles.input}
          onChangeText={setPassword1}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputHeader}>Confirm password</Text>
        <TextInput
          style={styles.input}
          onChangeText={setPassword2}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={() => clickedSubmit()}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>

      <View style={styles.dhaaContainer}>
        <Text style={styles.dhaaText}>Already have an account?</Text>
        <TouchableOpacity style={styles.dhaaLoginTO} onPress={() => switchPage("Login")}>
          <Text style={styles.dhaaLogin}>Login.</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {

  },
  button: {

  },
  input: {

  },
  inputHeader: {

  },
  inputContainer: {

  },
  buttonText: {

  },
  dhaaContainer: {

  },
  dhaaLogin: {

  },
  dhaaText: {

  },
  dhaaLoginTO: {
    
  }
});
