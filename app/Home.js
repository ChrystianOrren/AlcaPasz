import { Text, View, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Modal, Checkbox } from "react-native";
import { getUsersPasswords, insertPassword } from "./database";
import { useRoute } from "@react-navigation/native";
import { useEffect, useState } from 'react';
import * as Clipboard from 'expo-clipboard';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEye, faCopy, faAdd, faClose } from '@fortawesome/free-solid-svg-icons';
import { TextInput } from "react-native-gesture-handler";

const charBank = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:',.<>?"
}

export default function Home() {
  const route = useRoute();
  const { id } = route.params;
  const [ passwords, setPasswords ] = useState([])
  const [ loading, setLoading ] = useState(true)
  const [ visibility, setVisibility ] = useState(
    passwords.map(() => false)
  );
  const [modalVisible, setModalVisible] = useState(false);

  //Storage for creating new password
  const [ newTitle, setNewTitle ] = useState("")
  const [ newPass, setNewPass ] = useState("")

  // Settings state
  const [ passwordSettings, setPasswordSettings ] = useState({
    symbols: true,
    numbers: true,
    length: 20,
    uppercase: true,
  });

  useEffect(() => {
    const getPasswords = async () => {
      const passes = await getUsersPasswords(id)
      setPasswords(passes)
    }
    getPasswords()
  }, [])

  useEffect(() => {
    setLoading(false)
  }, [passwords])


  const getChoiceAmount = () => {
    let n = 0
    if ( passwordSettings.numbers == true ) {
      n++
    }
    if ( passwordSettings.symbols == true ) {
      n++
    }
    if ( passwordSettings.uppercase == true ) {
      n++
    }
    if ( passwordSettings.lowercase == true ) {
      n++
    }
    return n
  }

  const createNewPassword = async () => {
    const createdPass = await insertPassword(newPass, id, newTitle)
  }

  const deletePassword = async (passId) => {
    const deletedPass = await deletePassword(passId)
  }

  const generatePassword = () => {
    // Random nums for char selection
    const randomArray = new Uint8Array(passwordSettings.length);
    crypto.getRandomValues(randomArray);

    // Random nums for choice of char category
    const choiceArray = new Uint8Array(passwordSettings.length);
    crypto.getRandomValues(choiceArray)
    const n = getChoiceAmount()
    const choices = Array.from(choiceArray, (value) => (value % n) + 1);

    let password = ""

    // Build password
    for (let i = 0; i < passwordSettings.length; i++) {
      switch (choices[i]) {
        case 1:
          password += charBank.lowercase[randomArray[i] % charBank.lowercase.length]
          break;
        case 2:
          password += charBank.uppercase[randomArray[i] % charBank.uppercase.length]
          break
        case 3:
          password += charBank.symbols[randomArray[i] % charBank.symbols.length]
          break;
        case 3:
          password += charBank.numbers[randomArray[i] % charBank.numbers.length]
          break;
      }
    }
    //console.log(password)
    return password
  }

  const copyToClipboard = async (password) => {
    await Clipboard.setStringAsync(password);
  };

  const toggleVisibility = (index) => {
    setVisibility((prev) => {
      const newVisibility = [...prev];
      newVisibility[index] = !newVisibility[index]; // Toggle the specific index
      return newVisibility;
    });
  };

  const test = async () => {
    console.log(shows)
  }
  
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#DD6E42" />
      <ScrollView style={styles.scrollView}>
        { passwords.map((password, index) => {
          return (
            <View key={index} style={styles.listContainer}>
              <View style={styles.listTextContainer}>
                <Text style={styles.listTitle}>{password.title}</Text>
                <Text style={styles.listPassword}>{ visibility[index] ? password.password : "*********"} </Text>
              </View>
              <View style={styles.listIconContainer}>
                <TouchableOpacity onPress={() => toggleVisibility(index)}>
                  <FontAwesomeIcon icon={faEye} size={32} color="black" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => copyToClipboard(password.password)}>
                  <FontAwesomeIcon icon={faCopy}  size={32} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            setModalVisible(!modalVisible);
          }}>
          <View style={styles.modalView}>
            <TouchableOpacity onPress={() => setModalVisible(!modalVisible)} style={styles.closeModal}>
              <FontAwesomeIcon icon={faClose}  size={32} color="black" />
            </TouchableOpacity>
            <Text>Create a password</Text>

            <Text>Title</Text>
            <TextInput
              onChangeText={setNewTitle()}
            />

          </View>
        </Modal>

      <TouchableOpacity onPress={() => setModalVisible(!modalVisible)} style={styles.addButton}>
        <FontAwesomeIcon icon={faAdd}  size={35} color="black" />
      </TouchableOpacity>
      
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    display: 'flex',
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 15,
    padding: 20,
    width: '95%',
    marginTop: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center'
  },
  listIconContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1
  },
  listTitle: {
    fontSize: 20
  },
  listPassword: {
    fontSize: 15
  },
  listTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 3.5
  },
  scrollView: {

  },
  addButton: {
    margin: 10,
    backgroundColor: '#DD6E42',
    padding: 12,
    borderRadius: 20,
    elevation: 10
  },
  modalView: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    alignSelf: 'center',
    zIndex: 2,
    width: '100%',
    height: '100%',
    display: 'flex',
    backgroundColor: 'white'
  },
  closeModal: {
    alignSelf: 'flex-end',
    margin: 15
  }
});