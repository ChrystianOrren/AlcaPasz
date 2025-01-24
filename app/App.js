import { createStackNavigator } from '@react-navigation/stack';
import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import Home from './Home';
import Loading from './Loading';
import Login from './Login';
import Register from './Register';

const Stack = createStackNavigator();
let db;

const App = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function initializeDb() {
      try {
        // Open the database
        db = await SQLite.openDatabaseAsync('AlcaPasz');
        console.log('Database opened successfully.');

        // Create a table
        const createResult = await db.runAsync(
          'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT);'
        );
        console.log('Table creation result:', createResult);

        // Insert a test user
        const insertResult = await db.runAsync(
          'INSERT INTO users (username, password) VALUES (?, ?);',
          ['test', 'testpass']
        );
        console.log('User insertion result:', insertResult);

        // Fetch all users
        const result = await db.runAsync('SELECT * FROM users;');
        if (result && result.rows) {
          const usersArray = [];
          for (let i = 0; i < result.rows.length; i++) {
            usersArray.push(result.rows.item(i)); // Use rows.item(i) to access row data
          }
          console.log('Users fetched:', usersArray);
          setUsers(usersArray);
        } else {
          console.warn('No rows returned from the query.');
        }

        setLoading(false);
      } catch (error) {
        console.error('Database initialization error:', error);
      }
    }

    initializeDb();
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
