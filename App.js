import { StatusBar } from 'expo-status-bar';
import { Button, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
        <Text style={styles.title}>Notes</Text>
        <Content style={styles.content} />

        <StatusBar style="light" />
      </View>

    </SQLiteProvider>
  );
}

const Content = () => {
  const db = useSQLiteContext()
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [note, setNote] = useState({ id: 0, note: 'Task', due: '2024-12-31', done: 0 });


  const getNotes = async () => {
    try {
      const notes = await db.getAllAsync('SELECT * FROM notes');
      setNotes(notes)
    } catch (error) {
      console.log("Error fetching data :", error)
    }
  }

  const addNote = async (newNote) => {
    try {
      const statement = await db.prepareAsync('INSERT INTO notes (note, due, done) VALUES (?,?,?)');
      await statement.executeAsync([newNote.note, newNote.due, newNote.done]);
      await getNotes();
    } catch (error) {
      console.log('Error while adding note : ', error);
    }
  };

  const deleteAllNotes = async () => {
    try {
      await db.runAsync('DELETE FROM notes');
      await getNotes();
    } catch (error) {
      console.log('Error while deleting all the notes : ', error);
    }
  };

  const deleteNote = async (id) => {
    try {
      await db.runAsync('DELETE FROM notes WHERE id = ?', [id]);
      await getNotes();
    } catch (error) {
      console.log('Error while deleting note : ', error);
    }
  }


  useEffect(() => {
    getNotes();
    // addNote({ note: 'Buy eggs', due: '2024-08-15', done: 0 });
    // deleteAllNotes();

  }, []);


  return (

    <View style={{ flex: 1 }}>
      {notes.length === 0 ?
        (
          <View style={{ flex: 5 }}>
            <Text style={styles.text}>NONE</Text>
          </View>
        )
        : (
          <View style={{ flex: 5 }}>
            <FlatList data={notes} renderItem={({ item }) => (
              <View style={styles.note}>

                <Text style={styles.text}>{item.id} - {item.note} - {item.due} - {item.done === 0 ? 'False' : 'True'}</Text>
                <TouchableOpacity onPress={() => deleteNote(item.id)} style={styles.button} >
                  <Text>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
              keyExtractor={(item) => item.id.toString()}
            />
          </View>

        )
      }
      <View style={{ flex: 2 }}>
        <TouchableOpacity onPress={() => { addNote({ note: 'Buy eggs', due: '2024-08-15', done: 0 }); }} style={styles.button} color='#fff'>
          <Text>Add</Text>
        </TouchableOpacity>
      </View>

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
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 40
  },
  text: {
    color: '#FFF'
  },
  content: {

  },
  note: {
    marginBottom: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  button: {
    color: '#000',
    backgroundColor: '#fff',
    borderRadius: 5,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 25,
    width: 100
  }
});
