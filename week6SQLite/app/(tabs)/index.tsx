import { deleteDatabaseAsync, SQLiteDatabase, SQLiteProvider, SQLiteStatement, useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Pressable, Alert } from 'react-native';

export default function App() {
  
  return (
    <View style={styles.container}>
      <SQLiteProvider databaseName="test.db" onInit={migrateDbIfNeeded}>
        <Header />
        <Content />
      </SQLiteProvider>
    </View>
  );
}

export function Header() {
  const db = useSQLiteContext();
  const [version, setVersion] = useState('');

  useEffect(() => {
    async function setup() {
      const result = (await db.getFirstAsync<{ 'sqlite_version()': string }>(
        'SELECT sqlite_version()'
      ))!;
      
      setVersion(result['sqlite_version()']!);
    }
    setup();
  }, []);
    return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>SQLite version: {version}</Text>
    </View>
  );
}

interface Todo {
  value: string;
  intValue: number;
}

interface User {
  id: number;
  name: string;
  is_online: number;
}

export function Content() {
  const [name, onChangeName] = useState('Enter Name');
  const [number, onChangeNumber] = useState('1');
  const db = useSQLiteContext();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function setup() {
      const result = await db.getAllAsync<Todo>('SELECT * FROM todos');
      setTodos(result);
      const userResult = await db.getAllAsync<User>('SELECT * FROM users');
      setUsers(userResult);
    }
    setup();
  }, []); // empty deps: only run once on mount

  async function dropdB() {
   console.log("drop db");
   await db.execAsync('DROP TABLE IF EXISTS todos;');
   // Clear the local state so the UI updates immediately
   setTodos([]);
  }

  async function getall() {
    const todoResult = await db.getAllAsync<Todo>('SELECT * FROM todos');
    setTodos(todoResult);
    console.log(todoResult);
  }

  async function getUsersFromDB() {
    const userResult = await db.getAllAsync<User>('SELECT * FROM users');
    setUsers(userResult);
    console.log('users:', userResult);
  }

  async function toggleOnline() {
    // Find user by name (case-insensitive) and flip their is_online value
    const user = await db.getFirstAsync<User>(
      'SELECT * FROM users WHERE LOWER(name) = LOWER(?)', name
    );
    if (!user) {
      console.log('User not found:', name);
      return;
    }
    const newStatus = user.is_online === 1 ? 0 : 1;
    await db.runAsync(
      'UPDATE users SET is_online = ? WHERE id = ?', newStatus, user.id
    );
    console.log(`Toggled ${user.name} -> ${newStatus === 1 ? 'Online' : 'Offline'}`);
    getUsersFromDB(); // refresh the users list
  }

  async function createdB() {
   console.log("create db");
   await db.execAsync('PRAGMA user_version = 0;'); //tell it that the table is older.
   await migrateDbIfNeeded(db); //add the table again.
   getall();
   getUsersFromDB();
  }

  async function alldB() { //list all tables in case you added one. And it is still there!!
    console.log("all tables"); 
    const result = await db.getAllAsync("SELECT * FROM sqlite_master");
    console.log(result);
  }

  async function insertdB() {
    console.log("insert ");
    try {
      if (!name || name.trim() === '') {
        Alert.alert("Error", "Name cannot be empty!");
        return;
      }
      // Check if the user already exists to prevent duplicates
      const existing = await db.getFirstAsync<{ id: number }>('SELECT id FROM todos WHERE LOWER(value) = LOWER(?)', name);
      if (existing) {
        console.log("Duplicate name not allowed!");
        Alert.alert("Duplicate Name", "This name already exists in the list.");
        return;
      }

      // Ensure number is an integer
      const parsedNumber = parseInt(number, 10) || 0;

      const todoResult = await db.runAsync('INSERT INTO todos (value, intValue) VALUES (?, ?)', name, parsedNumber);
      const userResult = await db.runAsync('INSERT INTO users (name, is_online) VALUES (?, ?)', name, 0); // Offline by default

      if (todoResult.changes == 0) {
        Alert.alert("Error", "Could not insert record.");
      } else {
        Alert.alert("Success", `Inserted user ${name} with value ${parsedNumber}.`);
        // Clear inputs after successful insert
        onChangeName('');
        onChangeNumber('1');
      }
      getall();
      getUsersFromDB();
    } catch (error) {
      console.error("Insert error:", error);
      Alert.alert("Database Error", "Failed to insert record.");
    }
  }

  async function readdB() {
    console.log("read"); 
    if (!name || name.trim() === '') {
      Alert.alert("Error", "Please specify a name to read.");
      return;
    }
    try {
      const todo = await db.getFirstAsync<Todo>('SELECT * FROM todos WHERE LOWER(value)=LOWER(?)', name);
      const user = await db.getFirstAsync<User>('SELECT * FROM users WHERE LOWER(name)=LOWER(?)', name);
      
      if (!todo && !user) {
        Alert.alert("Not Found", `No records found for "${name}".`);
      } else {
        const todoInfo = todo ? `Number: ${todo.intValue}` : `No todo data.`;
        const userInfo = user ? `Online: ${user.is_online === 1 ? 'Yes' : 'No'}` : `No user data.`;
        Alert.alert("Read Results", `Name: ${name}\n${todoInfo}\n${userInfo}`);
      }
    } catch (error) {
      console.error("Read error:", error);
      Alert.alert("Database Error", "Failed to read record.");
    }
  }

  async function updatedB() { 
    console.log("update"); 
    if (!name || name.trim() === '') {
      Alert.alert("Error", "Please specify a name to update.");
      return;
    }
    try {
      const parsedNumber = parseInt(number, 10) || 0;
      const result = await db.runAsync('UPDATE todos SET intValue = ? WHERE LOWER(value) = LOWER(?)', parsedNumber, name);
      
      if (result.changes == 0) {
        Alert.alert("Not Found", `Could not find a record for "${name}" to update.`);
      } else {
        Alert.alert("Success", `Updated "${name}" with new number: ${parsedNumber}.`);
      }
      getall();
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Database Error", "Failed to update record.");
    }
  }

  async function deletedB() {
    console.log("delete"); 
    if (!name || name.trim() === '') {
      Alert.alert("Error", "Please specify a name to delete.");
      return;
    }
    try {
      const todoResult = await db.runAsync('DELETE FROM todos WHERE LOWER(value)=LOWER(?)', name);
      const userResult = await db.runAsync('DELETE FROM users WHERE LOWER(name)=LOWER(?)', name);

      if (todoResult.changes == 0 && userResult.changes == 0) {
        Alert.alert("Not Found", `No records found for "${name}" to delete.`);
      } else {
        Alert.alert("Success", `Deleted all records for "${name}".`);
        onChangeName('');
        onChangeNumber('');
      }
      getall();
      getUsersFromDB();
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert("Database Error", "Failed to delete record.");
    }
  }

  return (
    <View style={styles.contentContainer}>
      <View style={styles.buttons}>
      <Button 
        title="Drop dB" 
        onPress={()=>dropdB()}
        />
      <Button 
        title="Create and Populate dB" 
        onPress={()=>createdB()}
        />
        <Button 
        title="ALl Tables dB" 
        onPress={()=>alldB()}
        />
        </View>
      <View style={styles.textInput}>
          <TextInput
            onChangeText = {onChangeName}
            value={name}
          />
          <TextInput
            onChangeText = {onChangeNumber}
            value={number}
          />
        </View>
    
        <View style={styles.buttonsCRUD}>
        <Button 
        title="Insert" 
        onPress={()=>insertdB()}
        />
        <Button 
        title="Read" 
        onPress={()=>readdB()}
        />
        <Button 
        title="Update" 
        onPress={()=>updatedB()}
        />
        <Button 
        title="Delete" 
        onPress={()=>deletedB()}
        />
        </View>
      {todos.map((todo, todoIndex) => (
        <View style={styles.todoItemContainer} key={`todo-${todoIndex}`}>
          <Text>{`${todo.intValue} - ${todo.value}`}</Text>
        </View>
      ))}
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 6 }}>Users — tap a user to select them, then use buttons above</Text>
        <View style={styles.buttonsCRUD}>
          <Button title="Refresh Users" onPress={() => getUsersFromDB()} />
          <Button title="Toggle Online" onPress={() => toggleOnline()} />
        </View>
        {users.map((user, index) => (
          <Pressable
            key={`user-${index}`}
            onPress={() => onChangeName(user.name)}
            style={({ pressed }) => [
              styles.todoItemContainer,
              styles.userRow,
              pressed && styles.userRowPressed,
              name === user.name && styles.userRowSelected,
            ]}>
            <Text style={name === user.name ? styles.userRowTextSelected : undefined}>
              {`User: ${user.name}   Online: ${user.is_online === 1 ? '✅ True' : '❌ False'}`}
            </Text>
          </Pressable>
        ))}
      </View>
      </View>
  );
}

async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const DATABASE_VERSION = 1;
  let { user_version: currentDbVersion } = (await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  ))!;
  console.log(currentDbVersion);
  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }
  if (currentDbVersion === 0) {
    console.log("creating tables and populating");
    await db.execAsync(`
PRAGMA journal_mode = 'wal';
CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY NOT NULL, value TEXT NOT NULL, intValue INTEGER);
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY NOT NULL, name TEXT NOT NULL, is_online INTEGER);
`);
    await db.runAsync('INSERT INTO todos (value, intValue) VALUES (?, ?)', 'hello', 11);
    await db.runAsync('INSERT INTO todos (value, intValue) VALUES (?, ?)', 'world', 22);
    await db.runAsync('INSERT INTO todos (value, intValue) VALUES (?, ?)', 'everyone', 44);
    
    // Clear users to prevent duplicates if testing repeatedly
    await db.execAsync('DELETE FROM users;');
    await db.runAsync('INSERT INTO users (name, is_online) VALUES (?, ?)', 'Donald Trump', 1);
    await db.runAsync('INSERT INTO users (name, is_online) VALUES (?, ?)', 'Anthony Albanese', 0);
    
    currentDbVersion = 1;
  }
  // if (currentDbVersion === 1) {
  //   Add more migrations
  // }
  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}


const styles = StyleSheet.create({
  // Your styles
  headerContainer: {
    padding: 40
  },
  headerText: {
  
  },
  container: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  contentContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  buttons: {
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonsCRUD: {
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  todoItemContainer: {
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userRow: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    width: '100%',
    justifyContent: 'center',
  },
  userRowPressed: {
    opacity: 0.7,
  },
  userRowSelected: {
    backgroundColor: '#007AFF', // iOS blue
  },
  userRowTextSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});