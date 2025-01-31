import * as SQLite from 'expo-sqlite';

let db;


export const initalizeDB = async () => {
    if (!db) {
        db = await SQLite.openDatabaseAsync('AlcaPasz.db');
        const createUsers = await db.runAsync(
            'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, password TEXT NOT NULL);'
        );
        console.log("Creating table result:", createUsers);

        const createPasswords = await db.runAsync(
            'CREATE TABLE IF NOT EXISTS passwords (id INTEGER PRIMARY KEY AUTOINCREMENT, uid INTEGER NOT NULL, password TEXT NOT NULL, FOREIGN KEY (uid) REFERENCES users(id));'
        );
        console.log("Creating table result:", createPasswords);
    }
    return db
}

export const deleteUser = async (id) => {
    await initalizeDB()
    try{
        const deleteResult = await db.runAsync('DELETE FROM users WHERE id = $id', { $id: id })
        const deletePassesResult = await db.runAsync('DELETE * FROM passwords WHERE uid = $uid', {$uid: id})
        console.log(deleteResult, deletePassesResult)
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
    let check = await checkRegister()
    try {
        if (check == 1) {
            const insertUser = await db.runAsync('INSERT INTO users (username, password) VALUES (?, ?)', username, password)
            console.log(insertUser)
            return 1
        }
        else {
            return 0
        }
    }
    catch (error) {
        console.log(error)
    }
}

export const printPasswords = async () => {
    console.log("Printing Passwords");
    await initalizeDB()
    try{
        const allRows = await db.getAllAsync('SELECT * FROM passwords');
        for (const row of allRows){
          console.log([row.id, row.uid, row.password]);
        }
    }
    catch (error) {
        console.log(error)
    }
}

export const insertPassword = async (password, uid) => {
    await initalizeDB()
    try {
        const insertPassword = await db.runAsync('INSERT INTO passwords (uid, password) VALUES (?, ?)', uid, password)
        console.log(insertPassword)
        return insertPassword
    }
    catch (error) {
        console.log(error)
    }
    return 0
}

export const deletePassword = async (id) => {
    await initalizeDB()
    try{
        const deleteResult = await db.runAsync('DELETE FROM passwords WHERE id = $id', { $id: id })
        console.log(deleteResult)
    }
    catch (error) {
        console.log(error)
    }
}

export const getUsersPasswords = async (uid) => {
    await initalizeDB()
    try{
        const allRows = await db.getAllAsync('SELECT * FROM passwords WHERE uid = ?', uid)
        return allRows
    }
    catch (error) {
        console.log(error)
    }
}

export const checkLogin = async (username, password) => {
    await initalizeDB() // Init first then check
    try{
        const allRows = await db.getAllAsync('SELECT * FROM users');
        for (const row of allRows){
          if (username == row.username) {
            return row
          }
        }
    }
    catch (error) {
        console.log(error)
    }
    return 0 // No matches found.
}