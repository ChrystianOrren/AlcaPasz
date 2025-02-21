import { Text, View, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { checkLogin } from "./database";
import { useState } from "react";
import bcrypt from 'react-native-bcrypt';
import 'react-native-get-random-values';

// Math.random is not secure
bcrypt.setRandomFallback((n) => {
  const randomValues = new Uint8Array(n);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues).map((val) => val % 256);
});

export default function Login() {
  const [ username, setUsername] = useState('')
  const [ password, setPassword] = useState('')
  const [ flag, setFlag ] = useState(false) // Login fail flags

  const navigation = useNavigation();

  // Navigate to different screens
  const switchPage = (page) => {
    navigation.navigate(page)
  }

  const test = async () => {
    const id = 4
    navigation.navigate("Home", {id})
  }

  // Handles submit button logic
  const clickedSubmit = async () => {
    // Check if user and pass match in database
    const hashedPassword = await encryptPass()
    const row = await checkLogin(username, hashedPassword)
    const isPasswordCorrect = bcrypt.compareSync(password, row.password);
    const id = row.id

    if ( isPasswordCorrect ) { // Successful login, primary key returned.
      navigation.navigate("Home", {id})
    }
    else {
      setFlag(true)
    }
  }

  const encryptPass = async () => {
    let hashedPassword
    try {
      const salt = bcrypt.genSaltSync(10); // Generate salt
      hashedPassword = bcrypt.hashSync(password, salt); // Hash password
    } catch (error) {
      console.error("Error hashing password:", error);
    }
    return hashedPassword
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login Screen.</Text>

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
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={() => clickedSubmit()}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>

      <View style={styles.dhaaContainer}>
        <Text style={styles.dhaaText}>Don't have an account?</Text>
        <TouchableOpacity style={styles.dhaaRegisterTO} onPress={() => switchPage("Register")}>
          <Text style={styles.dhaaRegister}>Register</Text>
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
  dhaaRegister: {

  },
  dhaaText: {

  },
  dhaaRegisterTO: {

  }
});
