import { Text, View, TouchableOpacity, TextInput, StyleSheet, StatusBar, Image } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { deletePasswordsTable, deleteUsersTable, insertUser, printPasswords, printUsers } from "./database";
import { checkLogin,  } from "./database";
import { useState, useEffect } from "react";
import bcrypt from 'react-native-bcrypt';
import 'react-native-get-random-values';

const loginUserText = 'C:\\Login\\Username>'
const loginPassText = 'C:\\Login\\Password>'
const loginDHA1 = 'Do you have an account? ( Y \\ '
const loginDHA2 = ' )'
const loginDHAButton = 'N'
const registerDHAButton = 'Y'
const registerUserText = 'C:\\Register\\Username> '
const registerPassText1 = 'C:\\Register\\Password1>'
const registerPassText2 = 'C:\\Register\\Password2>'
const registerDHA1 = 'Do you have an account? ( '
const registerDHA2 = ' \\ N ) '

bcrypt.setRandomFallback((n) => {
  const randomValues = new Uint8Array(n);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues).map((val) => val % 256);
});

export default function LoginRegister() {
    const navigation = useNavigation();
    const [ page, setPage ] = useState(true)
    const [ inputFadeLogin, setInputFadeLogin ] = useState(false)
    const [ inputFadeRegister, setInputFadeRegister ] = useState(false)

    // Texts for animation
    const [loginTexts, setLoginTexts] = useState({
        loginUserText: '',
        loginPassText: '',
        loginDHA1: '',
        loginDHA2: '',
        registerUserText: '',
        registerPassText1: '',
        registerPassText2: '',
        registerDHA1: '',
        registerDHA2: '',
        loginDHAButton: '',
        registerDHAButton: ''
    });

    // Login variables
    const [ username, setUsername] = useState('')
    const [ password, setPassword] = useState('')
    const [ flag, setFlag ] = useState(false) // Login fail flags
    const [ loading, setLoading] = useState(false)
    const [isFocusedUser, setIsFocusedUser] = useState(false);
    const [isFocusedPass, setIsFocusedPass] = useState(false);

    // Login funcitons
    useEffect(() => {
        if (loading) {
            if (page) {
                clickedLogin()
            }
            else{
                clickedRegister()
            }
        }
    }, [loading])

    const clickedLogin = async () => {
        try {
            // Perform time-consuming operations
            console.log(username, password)
            const hashedPassword = await encryptPass(password);
            console.log(hashedPassword)
            const row = await checkLogin(username, hashedPassword);
        
            if (row === null) {
                setLoading(false);
                setFlag(true);
                return;
            }
        
            const isPasswordCorrect = bcrypt.compareSync(password, row.password);
            const id = row.id;
            console.log(isPasswordCorrect, password, row.password)
        
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
    }
    
    const encryptPass = async (passToEncrypt) => {
        let hashedPassword
        try {
            const salt = bcrypt.genSaltSync(10); // Generate salt
            hashedPassword = bcrypt.hashSync(passToEncrypt, salt); // Hash password
        } catch (error) {
            console.error("Error hashing password:", error);
        }
        return hashedPassword
    }

    const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Register Variables
    const [ password1, setPassword1] = useState('')
    const [ password2, setPassword2] = useState('')
    const [ flagLength, setFlagLength ] = useState(false)
    const [ flagMatch, setFlagMatch ] = useState(false)
    const [isFocusedConfirm, setIsFocusedConfirm] = useState(false);

    //Register funcitons
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

    const clickedRegister = async () => {
        if (password1 == password2) {
            try {
                const hashedPassword = await encryptPass(password1)
                const inserting = await insertUser(username, hashedPassword)
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
            finally {
                setLoading(false)
            }
        }
        else {
            setLoading(false)
            setFlag(1) // Passwords dont match
        }
    }

    // Page functions
    useEffect(() => {
        if (loginTexts.loginUserText === ''){
            loginFadeInText()
        }
    }, [])

    const loginFadeInText = async () => {
        const deleteSpeed = 15
        let n = loginUserText.length
        for (let i = 0; i < n; i++) {
            setLoginTexts((prevTexts) => ({
                ...prevTexts,
                loginUserText: (loginTexts.loginUserText += loginUserText.charAt(i)),
            }));
            await sleep(deleteSpeed)
        }

        n = loginPassText.length
        for (let i = 0; i < n; i++) {
            setLoginTexts((prevTexts) => ({
                ...prevTexts,
                loginPassText: (loginTexts.loginPassText += loginPassText.charAt(i)),
            }));
            await sleep(deleteSpeed)
        }

        n = loginDHA1.length
        for (let i = 0; i < n; i++) {
            setLoginTexts((prevTexts) => ({
                ...prevTexts,
                loginDHA1: (loginTexts.loginDHA1 += loginDHA1.charAt(i)),
            }));
            await sleep(deleteSpeed)
        }

        setLoginTexts((prevTexts) => ({
            ...prevTexts,
            loginDHAButton: loginDHAButton,
        }));

        n = loginDHA2.length
        for (let i = 0; i < n; i++) {
            setLoginTexts((prevTexts) => ({
                ...prevTexts,
                loginDHA2: (loginTexts.loginDHA2 += loginDHA2.charAt(i)),
            }));
            await sleep(deleteSpeed)
        }
        setInputFadeLogin(true)
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

    const switchPages = async () => {
        const deleteSpeed = 15

        const resetVariables = async () => {
            await setLoginTexts({
                loginUserText: '',
                loginPassText: '',
                loginDHA1: '',
                loginDHA2: '',
                registerUserText: '',
                registerPassText1: '',
                registerPassText2: '',
                registerDHA1: '',
                registerDHA2: '',
                loginDHAButton: '',
                registerDHAButton: ''
            });
        }

        const loginFadeOut = async () => {
            setFlag(false)
            setFlagLength(false)
            setFlagMatch(false);
            let n = loginTexts.loginDHA2.length
            for (let i = n; i >= 0; i--) {
                setLoginTexts((prevTexts) => ({
                    ...prevTexts,
                    loginDHA2: loginTexts.loginDHA2.slice(0, i),
                }));
                await sleep(deleteSpeed)
            }
    
            setLoginTexts((prevTexts) => ({
                ...prevTexts,
                loginDHAButton: '',
            }));
    
            n = loginTexts.loginDHA1.length
            for (let i = n; i >= 0; i--) {
                setLoginTexts((prevTexts) => ({
                    ...prevTexts,
                    loginDHA1: loginTexts.loginDHA1.slice(0, i),
                }));
                await sleep(deleteSpeed)
            }
    
            n = loginTexts.loginPassText.length
            for (let i = n; i >= 0; i--) {
                setLoginTexts((prevTexts) => ({
                    ...prevTexts,
                    loginPassText: loginTexts.loginPassText.slice(0, i),
                }));
                await sleep(deleteSpeed)
            }
    
            n = loginTexts.loginUserText.length
            for (let i = n; i >= 0; i--) {
                setLoginTexts((prevTexts) => ({
                    ...prevTexts,
                    loginUserText: loginTexts.loginUserText.slice(0, i),
                }));
                await sleep(deleteSpeed)
            }
        }

        const registerFadeOut = async () => {
            setFlag(0)
            setFlagLength(false)
            setFlagMatch(false)
            let n = loginTexts.registerDHA2.length
            for (let i = n; i >= 0; i--) {
                setLoginTexts((prevTexts) => ({
                    ...prevTexts,
                    registerDHA2: loginTexts.registerDHA2.slice(0, i),
                }));
                await sleep(deleteSpeed)
            }

            setLoginTexts((prevTexts) => ({
                ...prevTexts,
                registerDHAButton: '',
            }));

            n = loginTexts.registerDHA1.length
            for (let i = n; i >= 0; i--) {
                setLoginTexts((prevTexts) => ({
                    ...prevTexts,
                    registerDHA1: loginTexts.registerDHA1.slice(0, i),
                }));
                await sleep(deleteSpeed)
            }

            n = loginTexts.registerPassText2.length
            for (let i = n; i >= 0; i--) {
                setLoginTexts((prevTexts) => ({
                    ...prevTexts,
                    registerPassText2: loginTexts.registerPassText2.slice(0, i),
                }));
                await sleep(deleteSpeed)
            }

            n = loginTexts.registerPassText1.length
            for (let i = n; i >= 0; i--) {
                setLoginTexts((prevTexts) => ({
                    ...prevTexts,
                    registerPassText1: loginTexts.registerPassText1.slice(0, i),
                }));
                await sleep(deleteSpeed)
            }

            n = loginTexts.registerUserText.length
            for (let i = n; i >= 0; i--) {
                setLoginTexts((prevTexts) => ({
                    ...prevTexts,
                    registerUserText: loginTexts.registerUserText.slice(0, i),
                }));
                await sleep(deleteSpeed)
            }
        }

        const registerFadeIn = async () => {
            resetVariables()
            let n = registerUserText.length
            for (let i = 0; i < n; i++) {
                setLoginTexts((prevTexts) => ({
                    ...prevTexts,
                    registerUserText: (loginTexts.registerUserText += registerUserText.charAt(i)),
                }));
                await sleep(deleteSpeed)
            }

            n = registerPassText1.length
            for (let i = 0; i < n; i++) {
                setLoginTexts((prevTexts) => ({
                    ...prevTexts,
                    registerPassText1: (loginTexts.registerPassText1 += registerPassText1.charAt(i)),
                }));
                await sleep(deleteSpeed)
            }

            n = registerPassText2.length
            for (let i = 0; i < n; i++) {
                setLoginTexts((prevTexts) => ({
                    ...prevTexts,
                    registerPassText2: (loginTexts.registerPassText2 += registerPassText2.charAt(i)),
                }));
                await sleep(deleteSpeed)
            }

            n = registerDHA1.length
            for (let i = 0; i < n; i++) {
                setLoginTexts((prevTexts) => ({
                    ...prevTexts,
                    registerDHA1: (loginTexts.registerDHA1 += registerDHA1.charAt(i)),
                }));
                await sleep(deleteSpeed)
            }

            setLoginTexts((prevTexts) => ({
                ...prevTexts,
                registerDHAButton: registerDHAButton,
            }));

            n = registerDHA2.length
            for (let i = 0; i < n; i++) {
                setLoginTexts((prevTexts) => ({
                    ...prevTexts,
                    registerDHA2: (loginTexts.registerDHA2 += registerDHA2.charAt(i)),
                }));
                await sleep(deleteSpeed)
            }
            setInputFadeRegister(true)
        }

        const loginFadeIn = async () => {
            await resetVariables()
            let n = loginUserText.length
            for (let i = 0; i < n; i++) {
                setLoginTexts((prevTexts) => ({
                    ...prevTexts,
                    loginUserText: (loginTexts.loginUserText += loginUserText.charAt(i)),
                }));
                await sleep(deleteSpeed)
            }

            n = loginPassText.length
            for (let i = 0; i < n; i++) {
                setLoginTexts((prevTexts) => ({
                    ...prevTexts,
                    loginPassText: (loginTexts.loginPassText += loginPassText.charAt(i)),
                }));
                await sleep(deleteSpeed)
            }

            n = loginDHA1.length
            for (let i = 0; i < n; i++) {
                setLoginTexts((prevTexts) => ({
                    ...prevTexts,
                    loginDHA1: (loginTexts.loginDHA1 += loginDHA1.charAt(i)),
                }));
                await sleep(deleteSpeed)
            }

            setLoginTexts((prevTexts) => ({
                ...prevTexts,
                loginDHAButton: loginDHAButton,
            }));

            n = loginDHA2.length
            for (let i = 0; i < n; i++) {
                setLoginTexts((prevTexts) => ({
                    ...prevTexts,
                    loginDHA2: (loginTexts.loginDHA2 += loginDHA2.charAt(i)),
                }));
                await sleep(deleteSpeed)
            }
            setInputFadeLogin(true)
        }

        if (page) { //Login
            setInputFadeLogin(!inputFadeLogin)
            await loginFadeOut()
            setPage(!page)
            await registerFadeIn()

        }
        else {
            setInputFadeRegister(!inputFadeRegister)
            await registerFadeOut()
            setPage(!page)
            await loginFadeIn()
        }
    }      

    const test = async () => {
        printUsers()
        printPasswords()
    }

    return (
        <View style={styles.container}>

            <StatusBar animated={true} barStyle="dark-content" backgroundColor="#00FF00" />
            
            <Image source={require('../assets/images/AsciiArt2.png')} resizeMode="contain" style={styles.image}/>
            
            {/* 
            <TouchableOpacity onPress={() => test()}>
                <Text style={{color: 'red'}}>TEST</Text>
            </TouchableOpacity> */}

            { loading ?       
            <View style={{width: '100%', justifyContent: 'center', alignItems: 'center', alignSelf: 'center'}}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View> 
            : <></>}

            { page ? 
                <View style={styles.loginPage}>
                    <View style={styles.loginContainer}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputHeader}>{loginTexts.loginUserText}</Text>
                                { inputFadeLogin ? 
                                    <TextInput
                                        style={isFocusedUser ? styles.inputActive : styles.inputInactive}
                                        onChangeText={setUsername}
                                        //selectionColor={'#464645'}
                                        onFocus={() => handleToggleBlinky('user')}
                                        onBlur={() => setIsFocusedUser(false)}
                                    />
                                : <View style={{height: 40, width: '50%', marginVertical: 10}}></View>}
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
                              <Text style={styles.inputHeader}>{loginTexts.loginPassText}</Text>
                              { inputFadeLogin ?
                                <TextInput
                                    style={isFocusedPass ? styles.inputActive : styles.inputInactive}
                                    onChangeText={setPassword}
                                    onFocus={() => handleToggleBlinky('pass')}
                                    onBlur={() => setIsFocusedPass(false)}
                                />
                              : <View style={{height: 40, width: '50%', marginVertical: 10}}></View>}
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
                    
                            { inputFadeLogin ?
                                <TouchableOpacity
                                style={styles.button}
                                onPress={() => {
                                    setLoading(true);
                                }}
                                >
                                <Text style={styles.buttonText}>Login</Text>
                                </TouchableOpacity>
                            : <View style={{height: 40, width: 'auto', marginVertical: 20}}></View>}
                    
                            <View style={styles.dhaaContainer}>
                              <Text style={styles.dhaaText}>{loginTexts.loginDHA1}</Text>
                                { inputFadeLogin ? 
                                    <TouchableOpacity
                                        style={styles.dhaaRegisterTO}
                                        onPress={() => switchPages()}
                                    >
                                        <Text style={styles.dhaaRegister}>N</Text>
                                    </TouchableOpacity>
                                : <Text style={styles.dhaaText}>{loginTexts.loginDHAButton}</Text>}
                              <Text style={styles.dhaaText}>{loginTexts.loginDHA2}</Text>
                            </View>
                          </View>
                </View>    
            :
                <View style={styles.registerPage}>

                    <View style={styles.loginContainer}>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputHeader}>{loginTexts.registerUserText}</Text>
                            { inputFadeRegister ? 
                                <TextInput
                                    style={isFocusedUser ? styles.inputActive : styles.inputInactiveRegister}
                                    onChangeText={setUsername}
                                    selectionColor={'#464645'}
                                    onFocus={() => handleToggleBlinky('user')}
                                    onBlur={() => setIsFocusedUser(false)}
                                />
                            : <View style={{height: 40, width: '44%', marginVertical: 10}}></View>}
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
                            <Text style={styles.inputHeader}>{loginTexts.registerPassText1}</Text>
                            { inputFadeRegister ?
                                <TextInput
                                    style={isFocusedPass ? styles.inputActive : styles.inputInactiveRegister}
                                    onChangeText={setPassword1}
                                    selectionColor={'#464645'}
                                        onFocus={() => handleToggleBlinky('pass')}
                                        onBlur={() => setIsFocusedPass(false)}
                                />
                            : <View style={{height: 40, width: '44%', marginVertical: 10}}></View>}
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
                            <Text style={styles.inputHeader}>{loginTexts.registerPassText2}</Text>
                            { inputFadeRegister ?
                                <TextInput
                                    style={isFocusedConfirm ? styles.inputActive : styles.inputInactiveRegister}
                                    onChangeText={setPassword2}
                                    selectionColor={'#464645'}
                                    onFocus={() => handleToggleBlinky('confirm')}
                                    onBlur={() => setIsFocusedConfirm(false)}
                                />
                            : <View style={{height: 40, width: '44%', marginVertical: 10}}></View>}
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

                        { flag == 3 ? <Text style={styles.goodFlagText}>Account Created.</Text> : <></>}
                        { flag == 2 ? <Text style={styles.warningText}>Username not available.</Text> : <></>}

                        { inputFadeRegister ?
                            <TouchableOpacity style={styles.button} onPress={() => setLoading(true)}>
                                <Text style={styles.buttonText}>Register</Text>
                            </TouchableOpacity>
                        : <View style={{height: 40, width: 'auto', marginVertical: 20}}></View>}   
                                    
                        <View style={styles.dhaaContainer}>
                            <Text style={styles.dhaaText}>{loginTexts.registerDHA1}</Text>
                            { inputFadeRegister ? 
                                <TouchableOpacity
                                    style={styles.dhaaRegisterTO}
                                    onPress={() => switchPages()}
                                >
                                    <Text style={styles.dhaaRegister}>Y</Text>
                                </TouchableOpacity>
                            : <Text style={styles.dhaaText}>{loginTexts.registerDHAButton}</Text>}
                            <Text style={styles.dhaaText}>{loginTexts.registerDHA2}</Text>
                        </View>
                    </View>
                </View> 
            }
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
        width: 250,
        padding: '10',
        elevation: 10,
        marginVertical: 20
    },
    inputInactiveRegister: {
        width: '44%',
        height: 40,
        color: '#00FF00',
        fontFamily: 'Anonymous Pro Regular',
        top: 2,
        borderColor: '#00FF00',
        borderWidth: 2,
        borderRadius: 2,
        marginVertical: 10
    },
    inputInactive: {
        width: '50%',
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
        fontSize: 18,
    },
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
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
    },
    goodFlagText: {
        color: 'lightblue',
        fontSize: 18,
        fontFamily: 'Anonymous Pro Regular',
        textAlign: 'center'
    }
});