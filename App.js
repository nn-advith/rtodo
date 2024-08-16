import { StatusBar } from 'expo-status-bar';
import { Button, FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, Pressable, TextInput } from 'react-native';
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

const NoteForm = ({ showForm, setShowForm, note, setNote, addNote }) => {

  const [task, setTask] = useState('');
  const [date, setDate] = useState('');

  const handleOk = () => {
    temp_note = { note: task, due: date, done: 0 }
    //setNote(temp_note)
    addNote(temp_note)
    setShowForm(!showForm)

  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showForm}
        onRequestClose={() => {

          setShowForm(!showForm);
        }}>

        <View style={styles.form}>
          <Text style={styles.title}>
            Form here
          </Text>
          <TextInput
            style={styles.input}
            onChangeText={setTask}
            value={task}
            placeholder='Task'
          />
          <TextInput
            style={styles.input}
            onChangeText={setDate}
            value={date}
            placeholder='Due'
          />
          <Pressable
            style={styles.button}
            onPress={handleOk}>
            <Text style={styles.textStyle}>Ok</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  )
}

const Content = () => {
  const db = useSQLiteContext()
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [note, setNote] = useState({});


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

  const handleAdd = () => {
    setShowForm(!showForm);
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

                <Text style={styles.text}> {item.note} - {item.due} - {item.done === 0 ? 'False' : 'True'}</Text>
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
      {showForm && (<NoteForm showForm={showForm} setShowForm={setShowForm} note={note} setNote={setNote} addNote={addNote} />)}
      <View style={{ flex: 2, backgroundColor: 'blue' }}>
        <TouchableOpacity onPress={handleAdd} style={styles.button} color='#fff'>
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
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00ff00'

  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: 120
  }
});
