import { createStackNavigator } from '@react-navigation/stack';
import { useEffect, useState } from 'react';
import Home from './Home';
import Loading from './Loading';
import Login from './Login';
import Register from './Register';

const Stack = createStackNavigator();

const App = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load fonts or something
    setLoading(false)
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <Stack.Navigator
      initialRouteName="Login"
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
    </Stack.Navigator>
  );
};

export default App;
