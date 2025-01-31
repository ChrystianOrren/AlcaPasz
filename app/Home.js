import { Text, View, TouchableOpacity } from "react-native";
import { getUsersPasswords } from "./database";
import { useRoute } from "@react-navigation/native";
import { useEffect, useState } from 'react';

export default function Home() {
  const route = useRoute();
  const { id } = route.params;
  const [ passwords, setPasswords ] = useState([])
  const [ loading, setLoading ] = useState(true)

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


  const createNewPassword = () => {
    console.log("Creating Password")
  }

  const deletePassword = () => {

  }

  const generatePassword = () => {

  }

  const copyPasswordToClipboard = () => {

  }
  
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Home screen. {id}</Text>
      
    </View>
  );
}
