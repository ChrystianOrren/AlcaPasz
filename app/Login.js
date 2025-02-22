import { Text, View, TouchableOpacity, TextInput, StyleSheet, StatusBar, Image } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { checkLogin } from "./database";
import { useState, useEffect } from "react";
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
  const [ loading, setLoading] = useState(false)

  const [isFocusedUser, setIsFocusedUser] = useState(false);
  const [isFocusedPass, setIsFocusedPass] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
  }, [])

  // Navigate to different screens
  const switchPage = (page) => {
    navigation.navigate(page)
  }

  // Handles submit button logic
  const clickedSubmit = async () => {
    setLoading(true); // Set loading to true immediately to update the UI
  
    try {
      // Perform time-consuming operations
      const hashedPassword = await encryptPass();
      const row = await checkLogin(username, hashedPassword);
  
      if (row === null) {
        setLoading(false);
        setFlag(true);
        return;
      }
  
      const isPasswordCorrect = bcrypt.compareSync(password, row.password);
      const id = row.id;
  
      if (isPasswordCorrect) {
        navigation.navigate("Home", { id });
      } else {
        setFlag(true);
      }
    } catch (error) {
      console.error("An error occurred during login:", error);
      setFlag(true);
    } finally {
      setLoading(false); // Ensure loading is set to false after operations complete
    }
  };
  
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

  const handleToggleBlinky = (focus) => {
    if (focus === 'user') {
      setIsFocusedUser(true)
      setIsFocusedPass(false)
    }
    else {
      setIsFocusedUser(false)
      setIsFocusedPass(true)
    }
  }

  const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  return (
    <View style={styles.container}>
      <StatusBar
        animated={true}
        barStyle="dark-content"
        backgroundColor="#00FF00"
      />

      <Image
        source={require('../assets/images/AsciiArt2.png')}
        resizeMode="contain"
        style={styles.image}
      />

      { loading ?       
        <View style={{width: '100%', justifyContent: 'center', alignItems: 'center', alignSelf: 'center'}}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View> 
      : <></>}

      <View style={styles.loginContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputHeader}>C:\Login\Username&gt;</Text>
          <TextInput
            style={isFocusedUser ? styles.inputActive : styles.inputInactive}
            onChangeText={setUsername}
            //selectionColor={'#464645'}
            onFocus={() => handleToggleBlinky('user')}
            onBlur={() => setIsFocusedUser(false)}
          />
          {isFocusedUser ? (
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
          <Text style={styles.inputHeader}>C:\Login\Password&gt;</Text>
          <TextInput
            style={isFocusedPass ? styles.inputActive : styles.inputInactive}
            onChangeText={setPassword}
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

        { flag ? 
          <Text style={styles.warningText}>Invalid username or password.</Text>
        : <></>}

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setLoading(true)
            clickedSubmit()
          }}
          //onPress={() => startLoadingText()}
        >
          <Text style={styles.buttonText}>Enter</Text>
        </TouchableOpacity>

        <View style={styles.dhaaContainer}>
          <Text style={styles.dhaaText}>Do you have an account? ( Y \ </Text>
          <TouchableOpacity
            style={styles.dhaaRegisterTO}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.dhaaRegister}>N</Text>
          </TouchableOpacity>
          <Text style={styles.dhaaText}> )</Text>
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
    fontSize: 18
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
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
    margin: 10,
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
  loadingText: {
    color: '#00FF00',
    fontSize: 25,
    fontFamily: 'Anonymous Pro Regular',
  },
  warningText: {
    color: 'red',
    fontSize: 18,
    fontFamily: 'Anonymous Pro Regular',
    textAlign: 'center'
  }
});


/*

    <View style={styles.container}>

      <StatusBar
        animated={true}
        barStyle="dark-content" 
        backgroundColor="#00FF00" 
        color='#00FF00' 
      />

      <Image source={require('../assets/images/AsciiArt2.png')} resizeMode='contain' style={styles.image}/>

      <KeyboardAvoidingView style={styles.loginContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputHeader}>C:\Login\Username&gt;</Text>
          <TextInput
            style={ isFocusedUser ? styles.inputActive : styles.inputInactive}
            onChangeText={setUsername}
            selectionColor={'#464645'}
            fontFamily= 'Anonymous Pro Regular'
            onFocus={() => handleToggleBlinky('user')}
            onBlur={() => setIsFocusedUser(false)}
            //caretHidden
          />
          { isFocusedUser ? <View style={{backgroundColor: '#00FF00', width: '3.5%', height: '25'}}><Text> </Text></View> : <></>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputHeader}>C:\Login\Password&gt;</Text>
          <TextInput
            style={ isFocusedPass ? styles.inputActive : styles.inputInactive}
            onChangeText={setPassword}
            onFocus={() => handleToggleBlinky('pass')}
            onBlur={() => setIsFocusedPass(false)}
          />
          { isFocusedPass ? <View style={{backgroundColor: '#00FF00', width: '3.5%', height: '25'}}><Text> </Text></View> : <></>}
        </View>

        <TouchableOpacity style={styles.button} onPress={() => clickedSubmit()}>
          <Text style={styles.buttonText}>Enter</Text>
        </TouchableOpacity>

        <View style={styles.dhaaContainer}>
          <Text style={styles.dhaaText}>Do you have an account? ( </Text>
          <TouchableOpacity style={styles.dhaaRegisterTO} onPress={() => switchPage("Register")}>
            <Text style={styles.dhaaRegister}>Y</Text>
          </TouchableOpacity>
          <Text style={styles.dhaaText}> \ N ) </Text>
        </View>
      </KeyboardAvoidingView>
    </View>

*/
