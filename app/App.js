import { createStackNavigator } from '@react-navigation/stack';
import { useEffect, useState } from 'react';
import Home from './Home';
import Loading from './Loading';
import Login from './Login';
import Register from './Register';
import LoginRegister from './LoginRegister';
import { useFonts } from 'expo-font';

const Stack = createStackNavigator();

const App = () => {
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    'Anonymous Pro Regular': require('../assets/fonts/Anonymous Pro Regular.ttf'),
    'Anonymous Pro Bold': require('../assets/fonts/Anonymous Pro Bold.ttf'),
  });
  
  useEffect(() => {
    // Load fonts or something
    setLoading(false)
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <Stack.Navigator
      initialRouteName="LoginRegister"
      screenOptions={{
        gestureEnabled: false,
        gestureDirection: 'horizontal',
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
      <Stack.Screen name="Loading" component={Loading} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
      <Stack.Screen name="LoginRegister" component={LoginRegister} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default App;
