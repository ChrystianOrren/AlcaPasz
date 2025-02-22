import { Text, View, TouchableOpacity, TextInput, StyleSheet, StatusBar, Image } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { insertUser } from "./database";
import { checkLogin,  } from "./database";
import { useState, useEffect } from "react";
import bcrypt from 'react-native-bcrypt';
import 'react-native-get-random-values';

export default function LoginRegister() {
    const [ page, setPage ] = useState(true)

    return (
        <View style={styles.container}>

            <StatusBar animated={true} barStyle="dark-content" backgroundColor="#00FF00" />
            
            <Image source={require('../assets/images/AsciiArt2.png')} resizeMode="contain" style={styles.image}/>

            { page ? 
                <View style={styles.loginPage}>
                    <Text>Login</Text>
                </View>    
            :
                <View style={styles.registerPage}>
                    <Text>Register</Text>
                </View> 
            }

            

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#3C3C3B',
    },
    image: {
        height: '25%',
        top: 50,
        minHeight: '25%'
    },
});