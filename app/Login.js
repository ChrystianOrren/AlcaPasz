import { Text, View, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { useNavigation } from '@react-navigation/native';

export default function Login() {

  const navigation = useNavigation();


  const switchPage = (page) => {
    if (page == "Register"){
      navigation.navigate(page)
    }
    else{
      navigation.navigate(page)
    }
  }

  const clickedSubmit = () => {
    console.log("Submit")
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login Screen.</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputHeader}>Username</Text>
        <TextInput
          style={styles.input}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputHeader}>Password</Text>
        <TextInput
          style={styles.input}
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
