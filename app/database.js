import * as SQLite from 'expo-sqlite';

let db;

export const initalizeDB = async () => {
    if (!db) {
        db = await SQLite.openDatabaseAsync('AlcaPasz.db');
        const createResult = await db.runAsync(
            'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, password TEXT NOT NULL);'
        );
        console.log("Creating table result:", createResult);
    }
    return db
}

export const checkLogin = async (username, password) => {
    await initalizeDB() // Init first then check
    try{
        const allRows = await db.getAllAsync('SELECT * FROM users');
        for (const row of allRows){
          if (username == row.username && password == row.password){ // Correct Login found
            return row.id
          }
          if ((username == row.username && password != row.password) || (password == row.password && username != row.username)) { // One of the credentials is wrong
            return -1
          }
        }
    }
    catch (error) {
        console.log(error)
    }
    return 0 // No matches found.
}

export const deleteUser = async (id) => {
    await initalizeDB()
    try{
        const deleteResult = await db.runAsync('DELETE FROM users WHERE id = $id', { $id: id })
        console.log(deleteResult)
    }
    catch (error) {
        console.log(error)
    }
}

export const printUsers = async () => {
    console.log("Printing Users");
    await initalizeDB()
    try{
        const allRows = await db.getAllAsync('SELECT * FROM users');
        for (const row of allRows){
          console.log([row.id, row.username, row.password]);
        }
    }
    catch (error) {
        console.log(error)
    }
}

export const checkRegister = async (username) => {
    await initalizeDB() // Init first then check
    try{
        const allRows = await db.getAllAsync('SELECT * FROM users');
        for (const row of allRows){
          if ( username == row.username) {
            return 0
          }
        }
    }
    catch (error) {
        console.log(error)
    }
    return 1 // No matches found.
}

export const insertUser = async (username, password) => {
    await initalizeDB()
    try {
        
    }
    catch (error) {
        console.log(error)
    }
}