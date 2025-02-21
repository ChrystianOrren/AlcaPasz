// React Native & Expo
import { Text, View, TouchableOpacity, StyleSheet, StatusBar, Modal, RefreshControl } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useEffect, useState, useCallback } from 'react';
import * as Clipboard from 'expo-clipboard';
import { CheckBox, Slider } from '@rneui/themed';
import { TextInput } from "react-native-gesture-handler";
import { SwipeListView } from "react-native-swipe-list-view";

// Security
import 'react-native-get-random-values';
import CryptoJS from "crypto-js";
//import { AES_KEY } from '@env';

// Icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEye, faCopy, faClose, faTrash, faSave, faCircle } from '@fortawesome/free-solid-svg-icons';

// Database
import { getUsersPasswords, insertPassword, deletePassword, updateEntry } from "./database";

// Chars for password generation
const charBank = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:',.<>?"
}

// Need to move to .env
const key = "mysecretkey1234567890123456"; // Must be 32 characters for AES-256

export default function Home() {
  // Id from Login
  const route = useRoute();
  const { id } = route.params;

  // Visibility Toggles
  const [showPasses, setShowPasses] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfirmVisible, setModalConfirmVisible] = useState(false);

  // Flag for loading
  const [ loading, setLoading ] = useState(true);

  // Password stuff
  const [passwords, setPasswords] = useState([]);
  const [idToDelete, setIdToDelete] = useState();
  const [refreshing, setRefreshing] = useState(false);

  // Storage for edits
  const [editedPasswords, setEditedPasswords] = useState({});
  const [editedTitles, setEditedTitles] = useState({});

  // Storage for creating new password
  const [ newTitle, setNewTitle ] = useState("")
  const [ newPass, setNewPass ] = useState("")

  // Settings states
  const [length, setLength] = useState(20);
  const [symbols, setSymbols] = useState(20);
  const [numbers, setNumbers] = useState(20);
  const [uppercase, setUppercase] = useState(20);

  // On page open get all users passwords
  useEffect(() => {
    getPasswords()
  }, [])

  // If we have passwords set loading false
  useEffect(() => {
    setLoading(false)
  }, [passwords])

  // Refresh passwords
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    
    getPasswords()

    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Get all passwords from db then decrypt and store
  const getPasswords = async () => {
    const passes = await getUsersPasswords(id)
    const decryptedPasses = passes.map(item => ({
      ...item,
      password: decrypt(item.password, key)
    }));
    console.log(decryptedPasses)
    setPasswords(decryptedPasses)
  }

  // Logic after hitting save on creating a new pass
  const createNewPassword = async () => {
    if (newTitle != "" && newPass != "") {
      const encryptedPass = encrypt(newPass, key)
      console.log("Saving to DB:", [encryptedPass, id, newTitle])
      const createdPass = await insertPassword(encryptedPass, id, newTitle)
      await getPasswords()
      setModalVisible(!modalVisible)
      setNewPass("")
      setNewTitle("")
    }
    else{
      console.log("Fields must be filled out")
    }
  }

  // Delete password by id
  const deletePassById = async (passId) => {
    console.log("Deleting pass with id: ", passId)
    const deletedPass = await deletePassword(passId)
    setIdToDelete()
    setModalConfirmVisible(!modalConfirmVisible)
    onRefresh()
  }

  // Generate pass based on settings
  const generatePassword = () => {
    const temp = new Uint8Array(200)
    crypto.getRandomValues(temp)
    const randomChoice = temp.map((x) => x % 4)

    const randomNums = new Uint16Array(200)
    crypto.getRandomValues(randomNums)

    let password = ""
    let i = 0
    while(password.length <= length) {
      let choice = randomChoice[i]
      switch (choice){
        case 0:
          if (!symbols) {
            break
          }
          password += charBank.symbols[randomNums[i] % charBank.symbols.length]
          break
        case 1:
          if (!numbers) {
            break
          }
          password += charBank.numbers[randomNums[i] % charBank.numbers.length]
          break
        case 2:
          if (!uppercase) {
            break
          }
          password += charBank.uppercase[randomNums[i] % charBank.uppercase.length]
          break
        case 3:
          password += charBank.lowercase[randomNums[i] % charBank.lowercase.length]
          break
      }
      i += 1
    }
    return password
  }

  // Copy pass to clipboard
  const copyToClipboard = async (password) => {
    console.log("Copying:", password)
    await Clipboard.setStringAsync(password);
  };

  // Generate password and save to useState
  const handleGenerateButton = () => {
    const generatedPass = generatePassword()
    setNewPass(generatedPass)
  }  

  // Encrypt plain text using key
  const encrypt = (text, key) => {
    const ciphertext = CryptoJS.AES.encrypt(text, key).toString();
    return ciphertext;
  };

  // Decrypt cipher text using key
  const decrypt = (ciphertext, key) => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
  };

  // Logic behind saving an edit and updating db
  const handleSaveEdit = async (id) => {
    let editedTitle = "";
    let editedPass = "";
    if (editedTitles[id]) {
      editedTitle = editedTitles[id]
      removeFirstEditedTitle()
    }
    if (!editedTitles[id]) {
      editedTitle = passwords.find(pass => pass.id === id)["title"]
    }
    if (editedPasswords[id]) {
      editedPass = editedPasswords[id]
      removeFirstEditedPassword()
    }
    if (!editedPasswords[id]) {
      editedPass = passwords.find(pass => pass.id === id)["password"]
    }

    console.log("Updating:", editedTitle, editedPass, id)
    let encryptedPass = encrypt(editedPass, key)
    const saveEdit = updateEntry(encryptedPass, editedTitle, id)
    onRefresh()
  };

  // Dequeue password to not edit multiple entries at once 
  const removeFirstEditedPassword = () => {
    setEditedPasswords((prev) => {
      const updatedPasswords = { ...prev };
      const firstKey = Object.keys(updatedPasswords)[0]; // Get the first key
      if (firstKey) {
        delete updatedPasswords[firstKey]; // Remove first key-value pair
      }
      return updatedPasswords;
    });
  };

  // Dequeue title to not edit multiple entries at once 
  const removeFirstEditedTitle = () => {
    setEditedTitles((prev) => {
      const updatedTitles = { ...prev };
      const firstKey = Object.keys(updatedTitles)[0]; // Get the first key
      if (firstKey) {
        delete updatedTitles[firstKey]; // Remove first key-value pair
      }
      return updatedTitles;
    });
  };

  // Save new text then check if we need to remove another entry (one at a time)
  const handleTextChangePassword = (text, id) => {
    setEditedPasswords((prev) => ({
      ...prev,
      [id]: text, // Store new text by ID
    }));
    let n = Object.keys(editedPasswords).length
    if ( n == 2) {
      removeFirstEditedPassword()
    }
  };

  // Save new text then check if need to remove another entry (one at a time)
  const handleTextChangeTitle = (text, id) => {
    setEditedTitles((prev) => ({
      ...prev,
      [id]: text, // Store new text by ID
    }));
    let n = Object.keys(editedTitles).length
    if ( n == 2) {
      removeFirstEditedTitle()
    }
    console.log(editedTitles)
  };

  // Make confirm visible and then stage delete id
  const handleDeleteButton = (id) => {
    setModalConfirmVisible(!modalConfirmVisible)
    setIdToDelete(id)
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

      {/* Top Buttons */}
      <View style={styles.buttonsView}>
        <TouchableOpacity onPress={() => setShowPasses(!showPasses)}>
          <FontAwesomeIcon icon={faEye}  size={35} color="black"/>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => setModalVisible(!modalVisible)} style={styles.addButton}>
          {/* <FontAwesomeIcon icon={faAdd}  size={35} color="black"/> */}
          <Text>New Password</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={{flex: 1, width: '100%'}}>
        <SwipeListView
          data={passwords}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
          keyExtractor={(item) => item.id}
          renderItem={({item}) => (
            <View style={styles.firstView}>
              <View>
                <TextInput
                  style={styles.itemInput}
                  onChangeText={(text) => handleTextChangeTitle(text, item.id)}
                  value={editedTitles[item.id] || item.title}
                />
                { showPasses ?
                  <TextInput
                    style={styles.itemInput}
                    onChangeText={(text) => handleTextChangePassword(text, item.id)}
                    value={editedPasswords[item.id] || item.password}
                  />
                  :
                  <><Text style={styles.itemInput}>*************</Text></>
                }
              </View>
              {((editedPasswords[item.id] && editedPasswords[item.id] !== item.password) || 
                (editedTitles[item.id] && editedTitles[item.id] !== item.title)) && (                
                <TouchableOpacity style={styles.saveButton} onPress={() => handleSaveEdit(item.id)}>
                  <FontAwesomeIcon icon={faSave} size={32} color="black" />
                </TouchableOpacity>
              )}

            </View>
          )}
          renderHiddenItem={({item}) => (
            <View style={styles.secondView}>
              <TouchableOpacity style={styles.copyButton} onPress={() => copyToClipboard(item.password)}>
                <FontAwesomeIcon icon={faCopy}  size={32} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteButton(item.id)}>
                <FontAwesomeIcon icon={faTrash}  size={32} color="white" />
              </TouchableOpacity>
            </View>
          )}
          leftOpenValue={75}
          rightOpenValue={-75}
          style={styles.rowStyle}
        />
      </View>

      {/* Modal for creating new password */}
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
              <FontAwesomeIcon icon={faClose} size={32} color="black" />
            </TouchableOpacity>
            <Text>Create a password</Text>

            <Text>Enter a title for the new password.</Text>
            <TextInput
              style={styles.input}
              onChangeText={setNewTitle}
            />
            <TouchableOpacity onPress={() => handleGenerateButton()}>
              <Text>Generate Strong Password</Text>
            </TouchableOpacity>

            <View style={{flexDirection: 'row', paddingHorizontal: 20}}>
              <View style={{flex: 1}}>
                <CheckBox value={symbols} checked={symbols} onPress={() => setSymbols(!symbols)} title="Symbols"/>
                <CheckBox value={numbers} checked={numbers} onPress={() => setNumbers(!numbers)} title="Numbers"/>
                <CheckBox value={uppercase} checked={uppercase} onPress={() => setUppercase(!uppercase)} title="Uppercase"/>
              </View>
              <View style={{justifyContent: 'center', flex: 1.5}}>
                <Text>Length: {length}</Text>
                <Slider
                  value={length}
                  onValueChange={setLength}
                  minimumValue={15}
                  maximumValue={40}
                  step={1}
                  allowTouchTrack
                  trackStyle={{ height: 5, backgroundColor: 'transparent' }}
                  thumbStyle={{ height: 20, width: 20, backgroundColor: 'transparent' }}
                  thumbProps={{
                    children: (
                      <FontAwesomeIcon icon={faCircle} size={20} color="black"/>
                    ),
                  }}
                />
              </View>
            </View>

            <View style={styles.newPassView}>
              <Text>New Password:</Text>
              <TextInput
              style={styles.input}
              onChangeText={setNewPass}
              value={newPass}
              />
            </View>

            <TouchableOpacity onPress={() => createNewPassword()}>
              <Text>Save</Text>
            </TouchableOpacity>

          </View>
      </Modal>
      
      {/* Modal for confirming deletion */}
      <Modal
          animationType="slide"
          transparent={true}
          visible={modalConfirmVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            setModalConfirmVisible(!modalConfirmVisible);
          }}
      >
        <View style={styles.sureView}>
          <Text style={styles.sureText}>Are you sure?</Text>
          <View style={{flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', width: '100%', paddingTop: 30}}>
            <TouchableOpacity style={styles.yesButton} onPress={() => deletePassById(idToDelete)}>
              <Text style={styles.yesNoText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalConfirmVisible(!modalConfirmVisible)}  style={styles.noButton}>
              <Text style={styles.yesNoText}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  // List / ScrollView Styles
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

  // Button Styles
  buttonsView: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  addButton: {
    margin: 10,
    backgroundColor: '#DD6E42',
    padding: 12,
    borderRadius: 20,
    elevation: 10
  },

  // Create New Pass Modal
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
  },
  input: {
    width: '80%',
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 15
  },
  newPassView: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  itemModalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    width: '80%',
    height: '40%',
    alignSelf: 'center',
    marginTop: 100,
  },

  // Swipe List View Styles
  firstView: {
    height: 100,
    backgroundColor: 'white',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    flexDirection: 'row',
  },
  secondView: {
    height: 100,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowStyle: {
    height: 100, // Ensures both firstView and secondView are the same height
  },
  deleteButton:{
    backgroundColor: 'red',
    height: 100,
    flex: 1,
    justifyContent: 'center',
    alignItems:'flex-end',
    paddingHorizontal: 20
  },
  copyButton: {
    backgroundColor: 'blue',
    height: 100,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  saveButton: {
    paddingLeft: 100,
  },
  itemInput: {
    fontSize: 20,
    height: 'auto',
  },

  // Are you sure? Modal
  sureView: {
    width: '50%',
    height: '20%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'white',
    marginTop: '50%',
    elevation: 20,
    borderRadius: 20
  },
  sureText: {
    fontSize: 25
  },
  yesButton: {
    backgroundColor: 'lightgreen',
    padding: 15,
    borderRadius: 20,
    width: 75
  },
  noButton: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 20,
    width: 75
  },
  yesNoText: {
    color: 'black',
    fontSize: 20,
    fontWeight: 600,
    textAlign: 'center',
  }
});