// React Native & Expo
import { Text, View, TouchableOpacity, StyleSheet, StatusBar, Modal, RefreshControl } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useEffect, useState, useCallback } from 'react';
import * as Clipboard from 'expo-clipboard';
import { CheckBox, Slider } from '@rneui/themed';
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { SwipeListView } from "react-native-swipe-list-view";
import { AES_KEY} from './env'

// Security
import 'react-native-get-random-values';
import CryptoJS from "crypto-js";

// Icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEye, faCopy, faClose, faTrash, faSave, faCircle, faSquare } from '@fortawesome/free-solid-svg-icons';
import { faSquare as faSquareRegular } from '@fortawesome/free-regular-svg-icons';

// Database
import { getUsersPasswords, insertPassword, deletePassword, updateEntry } from "./database";

// Chars for password generation
const charBank = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:',.<>?"
}

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

  // Textinput focuses
  const [isFocusedTitle, setIsFocusedTitle] = useState(false);
  const [isFocusedNewPass, setIsFocusedNewPass] = useState(false);

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
      password: decrypt(item.password, AES_KEY)
    }));
    console.log(decryptedPasses)
    setPasswords(decryptedPasses)
  }

  // Logic after hitting save on creating a new pass
  const createNewPassword = async () => {
    if (newTitle != "" && newPass != "") {
      const encryptedPass = encrypt(newPass, AES_KEY)
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
    let encryptedPass = encrypt(editedPass, AES_KEY)
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
      style={styles.container}
    >
      <StatusBar
        animated={true}
        barStyle="dark-content"
        backgroundColor="#00FF00"
      />

      {/* Main Content */}
      <View style={{flex: 1, width: '100%', marginTop: 20}}>
        <SwipeListView
          data={passwords}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
          keyExtractor={(item) => item.id}
          renderItem={({item}) => (
            <View style={styles.firstView}>
              <View style={{}}>
                <TextInput
                  style={styles.itemInputText}
                  onChangeText={(text) => handleTextChangeTitle(text, item.id)}
                  value={editedTitles[item.id] || item.title}
                  color={'#00FF00'}
                />
                { showPasses ?
                  <TextInput
                    style={styles.itemInput}
                    onChangeText={(text) => handleTextChangePassword(text, item.id)}
                    value={editedPasswords[item.id] || item.password}
                    color={'#00FF00'}
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

      {/* Bottom Buttons */}
      <View style={styles.buttonsView}>
        <TouchableOpacity onPress={() => setShowPasses(!showPasses)} style={{elevation: 10}}>
          <FontAwesomeIcon icon={faEye}  size={35} color="#00FF00"/>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => setModalVisible(!modalVisible)} style={styles.addButton}>
          {/* <FontAwesomeIcon icon={faAdd}  size={35} color="black"/> */}
          <Text style={{fontFamily: 'Anonymous Pro Regular', fontSize: 20}}>New Password</Text>
        </TouchableOpacity>
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
          <ScrollView style={styles.modalView}>
            
            <View style={styles.headerContainer}>
              <TouchableOpacity onPress={() => setModalVisible(!modalVisible)} style={styles.closeModal}>
                <FontAwesomeIcon icon={faClose} size={32} color="#00FF00" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>C:\AlcaPasz&gt; Create Password</Text>
            </View>

            <View style={styles.inputContainer}> 

              <View style={styles.titleContainer}>
                <Text style={styles.modalLabel}>C:\NewPassword&gt; Enter Title</Text>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
                  <TextInput
                    style={ isFocusedTitle ? styles.inputActive : styles.inputInactive}
                    onChangeText={setNewTitle}
                    selectionColor={'#464645'}
                    onFocus={() => setIsFocusedTitle(true)}
                    onBlur={() => setIsFocusedTitle(false)}
                  />
                  {isFocusedTitle ? (
                    <View
                      style={{
                        backgroundColor: '#00FF00',
                        width: '3.5%',
                        height: 25,
                      }}
                    />
                  ) : null}
                </View>
              </View>

              <View style={{borderWidth: 2, borderRadius: 2, borderColor: '#00FF00', }}>
                <TouchableOpacity onPress={() => handleGenerateButton()} style={styles.saveButton}>
                  <Text style={styles.saveText}>Generate Strong Password</Text>
                </TouchableOpacity>

                <View style={styles.generateContainer}>
                  <View style={{flex: 1}}>

                    <View style={styles.checkBoxView}>
                      { symbols ? 
                        <TouchableOpacity onPress={() => setSymbols(!symbols)}>
                          <FontAwesomeIcon icon={faSquare} color="#00FF00" />
                        </TouchableOpacity>
                        :
                        <TouchableOpacity onPress={() => setSymbols(!symbols)}>
                          <FontAwesomeIcon icon={faSquareRegular} color="#00FF00" />
                        </TouchableOpacity>
                      }
                        <TouchableOpacity onPress={() => setSymbols(!symbols)}>
                          <Text style={styles.checkBoxText}>Symobls</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.checkBoxView}>
                      { numbers ? 
                        <TouchableOpacity onPress={() => setNumbers(!numbers)}>
                          <FontAwesomeIcon icon={faSquare} color="#00FF00" />
                        </TouchableOpacity>
                        :
                        <TouchableOpacity onPress={() => setNumbers(!numbers)}>
                          <FontAwesomeIcon icon={faSquareRegular} color="#00FF00" />
                        </TouchableOpacity>
                      }
                      <TouchableOpacity onPress={() => setNumbers(!numbers)}>
                        <Text style={styles.checkBoxText}>Numbers</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.checkBoxView}>
                      { uppercase ? 
                        <TouchableOpacity onPress={() => setUppercase(!uppercase)}>
                          <FontAwesomeIcon icon={faSquare} color="#00FF00" />
                        </TouchableOpacity>
                        :
                        <TouchableOpacity onPress={() => setUppercase(!uppercase)}>
                          <FontAwesomeIcon icon={faSquareRegular} color="#00FF00" />
                        </TouchableOpacity>
                      }
                      <TouchableOpacity onPress={() => setUppercase(!uppercase)}>
                        <Text style={styles.checkBoxText}>Uppercase</Text>
                      </TouchableOpacity>
                    </View>

                  </View>
                  <View style={{justifyContent: 'center', flex: 1.5}}>
                    <Text style={styles.checkBoxText}>Length: {length}</Text>
                    <Slider
                      value={length}
                      onValueChange={setLength}
                      minimumValue={15}
                      maximumValue={40}
                      step={1}
                      allowTouchTrack
                      minimumTrackTintColor="#00FF00"
                      maximumTrackTintColor="white"
                      trackStyle={{ height: 7}}
                      thumbStyle={{ height: 20, width: 20, backgroundColor: 'transparent' }}
                      thumbProps={{
                        children: (
                          <FontAwesomeIcon icon={faCircle} size={20} color="#00FF00"/>
                        ),
                      }}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.newPassView}>
                <Text style={styles.modalLabel}>C:\NewPassword&gt; New Password</Text>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
                  <TextInput
                    style={ isFocusedNewPass ? styles.inputActive : styles.inputInactive}
                    onChangeText={setNewPass}
                    value={newPass}
                    selectionColor={'#464645'}
                    onFocus={() => setIsFocusedNewPass(true)}
                    onBlur={() => setIsFocusedNewPass(false)}
                  />
                  {isFocusedNewPass ? (
                    <View
                      style={{
                        backgroundColor: '#00FF00',
                        width: '3.5%',
                        height: 25,
                      }}
                    />
                  ) : null}
                </View>
              </View>

              <TouchableOpacity onPress={() => createNewPassword()} style={styles.saveButton}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
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
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#3C3C3B'
  },  
  listContainer: {
    display: 'flex',
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 15,
    padding: 20,
    width: '95%',
    marginTop: 50,
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
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
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 20
  },
  addButton: {
    margin: 10,
    backgroundColor: '#00FF00',
    padding: 12,
    borderRadius: 2,
    elevation: 10,
    fontFamily: 'Anonymous Pro Regular',
  },

  // Create New Pass Modal
  modalView: {
    zIndex: 2,
    width: '100%',
    height: '100%',
    display: 'flex',
    backgroundColor: '#3C3C3B'
  },
  inputContainer: {
    width: '100%',
    height: '75%',
    padding: 20,
    marginTop: '20%'
  },
  headerContainer: {
    width: '100%'
  },
  closeModal: {
    alignSelf: 'flex-end',
    margin: 15,

  },
  inputActive: {
    width: 'auto',
    height: 50,
    color: '#00FF00',
    fontFamily: 'Anonymous Pro Regular',
  },
  inputInactive: {
    width: '100%',
    borderColor: '#00FF00',
    borderWidth: 2,
    borderRadius: 2,
    marginTop: 10,
    height: 50,
    color: '#00FF00',
    fontFamily: 'Anonymous Pro Regular',
  },
  newPassView: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginTop: 30,
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
  modalTitle: {
    color: '#00FF00',
    fontFamily: 'Anonymous Pro Regular',
    fontSize: 24,
    padding: 20
  },
  modalLabel: {
    color: '#00FF00',
    fontFamily: 'Anonymous Pro Regular',
    fontSize: 18,
    textAlign: 'left'
  },
  titleContainer: {
    paddingBottom: 30
  },
  generateContainer: {
    flexDirection: 'row', 
    padding: 20,
  },
  checkBoxView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 5
  },
  checkBoxText: {
    color: '#00FF00',
    fontFamily: 'Anonymous Pro Regular',
    fontSize: 16,
    marginLeft: 10
  },

  // Swipe List View Styles
  firstView: {
    height: 100,
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 20,
    flexDirection: 'row',
    backgroundColor: '#3C3C3B',
    borderWidth: 2,
    borderColor: '#00FF00',
    borderRadius: 5,
    marginVertical: 10
  },
  secondView: {
    height: 100,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10
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
    backgroundColor: '#00FF00',
    alignItems: 'center',
    alignSelf: 'center',
    padding: 10,
    elevation: 10,
    marginVertical: 20,
  },
  saveText: {
    color: 'black',
    fontSize: 18,
    fontFamily: 'Anonymous Pro Bold',
    fontWeight: 600
  },
  itemInput: {
    fontSize: 20,
    height: 'auto',
    fontFamily: 'Anonymous Pro Regular',
    color: '#00FF00',
    width: 'auto',
  },
  itemInputText: {
    fontSize: 20,
    height: 'auto',
    fontFamily: 'Anonymous Pro Regular',
    color: '#00FF00',
    width: 200,
  },

  // Are you sure? Modal
  sureView: {
    width: '50%',
    height: '20%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#70706e',
    marginTop: '50%',
    elevation: 20,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: '#00FF00',
    borderRadius: 2
  },
  sureText: {
    fontSize: 25,
    fontFamily: 'Anonymous Pro Bold',
    color: '#00FF00'
  },
  yesButton: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 2,
    width: 75
  },
  noButton: {
    backgroundColor: '#00FF00',
    padding: 15,
    borderRadius: 2,
    width: 75
  },
  yesNoText: {
    color: 'black',
    fontSize: 25,
    fontWeight: 600,
    textAlign: 'center',
    fontFamily: 'Anonymous Pro Bold',
  }
});