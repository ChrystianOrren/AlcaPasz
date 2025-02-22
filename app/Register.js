import { Text, View, TouchableOpacity, TextInput, StyleSheet, Image } from "react-native";
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
  const [ flagLength, setFlagLength ] = useState(false)
  const [ flagMatch, setFlagMatch ] = useState(false)

  const navigation = useNavigation();

  const [isFocusedUser, setIsFocusedUser] = useState(false);
  const [isFocusedPass, setIsFocusedPass] = useState(false);
  const [isFocusedConfirm, setIsFocusedConfirm] = useState(false);

  useEffect(() => {
    if ( password1 != password2) {
      setFlagMatch(true)
    }
    if ( password1 == password2) {
      setFlagMatch(false)
    }
    if (password1.length < 8 && password1.length != 0) {
      setFlagLength(true)
    }
    if (password1.length > 8) {
      setFlagLength(false)
    }
  }, [password1, password2])

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

  const handleToggleBlinky = (focus) => {
    if (focus === 'user') {
      setIsFocusedUser(true)
      setIsFocusedPass(false)
      setIsFocusedConfirm(false)
      return
    }
    if (focus == 'pass'){
      setIsFocusedUser(false)
      setIsFocusedPass(true)
      setIsFocusedConfirm(false)
      return
    }
    else {
      setIsFocusedUser(false)
      setIsFocusedPass(false)
      setIsFocusedConfirm(true)
      return
    }
  }

  return (
    <View style={styles.container}>

      <Image
        source={require('../assets/images/AsciiArt2.png')}
        resizeMode="contain"
        style={styles.image}
      />

      <View style={styles.loginContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputHeader}>C:\Login\Username&gt;</Text>
          <TextInput
            style={isFocusedUser ? styles.inputActive : styles.inputInactive}
            onChangeText={setUsername}
            selectionColor={'#464645'}
            onFocus={() => handleToggleBlinky('user')}
            onBlur={() => setIsFocusedUser(false)}
          />
          {isFocusedUser ? (
            <View
              style={{
                backgroundColor: '#00FF00',
                width: '3.5%',
                height: 25,
                left:0
              }}
            />
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputHeader}>C:\Login\Password1&gt;</Text>
          <TextInput
            style={isFocusedPass ? styles.inputActive : styles.inputInactive}
            onChangeText={setPassword1}
            selectionColor={'#464645'}
              onFocus={() => handleToggleBlinky('pass')}
              onBlur={() => setIsFocusedPass(false)}
          />
          {isFocusedPass ? (
            <View
              style={{
                backgroundColor: '#00FF00',
                width: '3.5%',
                height: 25,
              }}
            />
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputHeader}>C:\Login\Password2&gt;</Text>
          <TextInput
              style={isFocusedConfirm ? styles.inputActive : styles.inputInactive}
              onChangeText={setPassword2}
              selectionColor={'#464645'}
                onFocus={() => handleToggleBlinky('confirm')}
                onBlur={() => setIsFocusedConfirm(false)}
            />
            {isFocusedConfirm ? (
              <View
                style={{
                  backgroundColor: '#00FF00',
                  width: '3.5%',
                  height: 25,
                }}
              />
            ) : null}
        </View>

        { flagMatch ?
          <View>
            <Text style={styles.warningText}>Passwords must match.</Text>
          </View>
        : <></>}

        { flagLength ?
          <View>
            <Text style={styles.warningText}>Passwords must be atleast 8 characters.</Text>
          </View>
        : <></>}

        <TouchableOpacity style={styles.button} onPress={() => clickedSubmit()}>
          <Text style={styles.buttonText}>Enter</Text>
        </TouchableOpacity>

        <View style={styles.dhaaContainer}>
          <Text style={styles.dhaaText}>Do you have an account? ( </Text>
          <TouchableOpacity
            style={styles.dhaaRegisterTO}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.dhaaRegister}>Y</Text>
          </TouchableOpacity>
          <Text style={styles.dhaaText}> \ N ) </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: '#3C3C3B',
    fontFamily: 'Anonymous Pro Regular',
    height: '100%'
  },
  button: {
    backgroundColor: '#00FF00',
    alignItems: 'center',
    alignSelf: 'center',
    width: '75%',
    padding: '10',
    elevation: 10,
    marginVertical: 20
  },
  inputInactive: {
    width:'50%',
    height: 40,
    color: '#00FF00',
    fontFamily: 'Anonymous Pro Regular',
    top: 2,
    borderColor: '#00FF00',
    borderWidth: 2,
    borderRadius: 2,
    marginVertical: 10
  },
  inputActive: {
    width:'auto',
    height: 40,
    color: '#00FF00',
    fontFamily: 'Anonymous Pro Regular',
    top: 2,
    marginVertical: 10
  },
  inputHeader: {
    color: '#00FF00',
    fontFamily: 'Anonymous Pro Regular',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignContent: 'center',
    alignItems: 'center',
    paddingLeft: 20
  },
  buttonText: {
    color: 'black',
    fontSize: 18,
    fontFamily: 'Anonymous Pro Bold',
    fontWeight: 600,
    width: '50%',
    textAlign: 'center'
  },
  dhaaContainer: {
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 40,
    margin: 10
  },
  dhaaRegister: {
    color: '#00FF00',
    fontSize: 20,
    fontFamily: 'Anonymous Pro Bold',
    textAlign: 'center',
    paddingLeft: 2
  },
  dhaaText: {
    color: '#00FF00',
    fontSize: 18,
    fontFamily: 'Anonymous Pro Bold',
  },
  dhaaRegisterTO: {
    borderWidth: 2,
    borderColor: '#00FF00',
    padding: 5,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    elevation: 10,
    borderRadius: 5,
    backgroundColor: '#464645'
  },
  image: {
    height: '25%',
    top: 50,
    minHeight: '25%'
  },
  loginContainer: {
    width: '100%',
    height: '50%',
  },
  warningText: {
    color: 'red',
    fontSize: 18,
    fontFamily: 'Anonymous Pro Regular',
    textAlign: 'center'
  }
});
