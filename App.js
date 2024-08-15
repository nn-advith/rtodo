import { StatusBar } from 'expo-status-bar';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { useState, useEffect } from 'react';

async function initializeDB(db) {
  try {
    await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS notes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          note TEXT,
          due TEXT,
          done INTEGER
        );
      `);
    console.log("Database initialised")
  } catch (error) {
    console.log("Error initialising DB", error)
  }
}

export default function App() {
  return (
    <SQLiteProvider databaseName='notes.db' onInit={initializeDB}>
      <View style={styles.container}>
        <StatusBar style="light" />
        <Text style={styles.title}>Notes</Text>
        <Content style={styles.content} />
      </View>
    </SQLiteProvider>
  );
}

const Content = () => {
  const db = useSQLiteContext()
  const [notes, setNotes] = useState([]);

  const getNotes = async () => {
    try {
      const notes = await db.getAllAsync('SELECT * FROM notes');
      setNotes(notes)

    } catch (error) {
      console.log("Error fetching data", error)
    }
  }

  useEffect(() => {
    getNotes();
  }, []);


  return (

    <View>
      {notes.length === 0 ?
        (
          <Text style={styles.text}>NONE</Text>
        )
        : (
          <FlatList data={notes} renderItem={({ item }) => (
            <Text>{item.id} - {item.note}</Text>
          )}
            keyExtractor={(item) => item.id.toString()}
          />
        )
      }
    </View>

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingTop: 50,
    paddingLeft: 10
  },
  title: {
    fontSize: 28,
    color: '#FF0088',
    fontWeight: 'bold'
  },
  text: {
    color: '#FFF'
  },
  content: {

  }
});
