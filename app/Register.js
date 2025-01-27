import { Text, View, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { checkRegister } from "./database";

export default function Register() {
  const [ username, setUsername] = useState('')
  const [ password1, setPassword1] = useState('')
  const [ password2, setPassword2] = useState('')

  const navigation = useNavigation();

  const switchPage = (page) => {
    if (page == "Login"){
      navigation.navigate(page)
    }
    else{
      navigation.navigate(page)
    }
  }

  const clickedSubmit = async () => {
    const check = await checkRegister(username)
    console.log(check)

    if (check == 1 && password1 == password2) {
      // Add account, switch to login screen
      console.log("adding account")
    }
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
