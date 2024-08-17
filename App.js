import { StatusBar } from "expo-status-bar";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  TextInput,
} from "react-native";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { useState, useEffect } from "react";

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
    console.log("Database initialised");
  } catch (error) {
    console.log("Error initialising DB", error);
  }
}

export default function App() {
  const [dateToday, setDateToday] = useState("");
  useEffect(() => {
    setDateToday(new Date().toISOString().split("T")[0]);
  }, []);

  return (
    <SQLiteProvider databaseName="notes.db" onInit={initializeDB}>
      <View style={styles.container}>
        <Text style={styles.title}>Notes</Text>
        <Text style={styles.date}>{dateToday}</Text>
        <Content style={styles.content} dateToday={dateToday} />
        <StatusBar style="light" />
      </View>
    </SQLiteProvider>
  );
}

const NoteForm = ({ showForm, setShowForm, note, setNote, addNote }) => {
  const [task, setTask] = useState("");
  const [date, setDate] = useState("");

  const handleOk = () => {
    temp_note = { note: task, due: date, done: 0 };
    //setNote(temp_note)
    addNote(temp_note);
    setShowForm(!showForm);
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showForm}
        onRequestClose={() => {
          setShowForm(!showForm);
        }}
      >
        <View style={styles.form}>
          <Text style={styles.title}>Form here</Text>
          <TextInput
            style={styles.input}
            onChangeText={setTask}
            value={task}
            placeholder="Task"
          />
          <TextInput
            style={styles.input}
            onChangeText={setDate}
            value={date}
            placeholder="Due"
          />
          <Pressable style={styles.button} onPress={handleOk}>
            <Text style={styles.textStyle}>Ok</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
};

const NoteItem = ({ item, handleDelete }) => {
  return (
    <View style={styles.note}>
      <Text style={styles.text}>
        {" "}
        {item.note} - {item.due} - {item.done === 0 ? "False" : "True"}
      </Text>
      <Pressable
        onPress={() => setNote(item)}
        style={styles.editbutton}
      ></Pressable>
      <TouchableOpacity
        onPress={() => handleDelete(item.id, "c")}
        style={styles.button}
      >
        <Text>Delete</Text>
      </TouchableOpacity>
    </View>
  );
};

const Content = ({ dateToday }) => {
  const db = useSQLiteContext();

  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [note, setNote] = useState({});

  const [cTasks, setCTasks] = useState([]);
  const [tTasks, setTTasks] = useState([]);
  const [oTasks, setOTasks] = useState([]);

  const getNotes = async () => {
    try {
      const notes = await db.getAllAsync("SELECT * FROM notes");
      setNotes(notes);
    } catch (error) {
      console.log("Error fetching data :", error);
    }
  };

  const ctnote = (note) => {
    try {
      console.log(note);
      const todayDate = new Date(dateToday).getTime();
      const noteDate = new Date(note.due).getTime();

      if (todayDate < noteDate) {
        return 1;
      } else if (todayDate === noteDate) {
        return 0;
      } else {
        return -1;
      }
    } catch (error) {
      console.log("Error while getting something:", error);
    }
  };

  const categorizeNotes = () => {
    try {
      const todayDate = new Date(dateToday).getTime();

      for (i = 0; i < notes.length; i++) {
        const noteDate = new Date(notes[i].due).getTime();
        if (noteDate === null) {
          setOTasks((oTasks) => [...oTasks, notes[i]]);
        }

        if (todayDate < noteDate) {
          if (!oTasks.some((k) => k.id === notes[i].id)) {
            setOTasks([...oTasks, notes[i]]);
          }
        } else if (todayDate === noteDate) {
          if (!tTasks.some((k) => k.id === notes[i].id)) {
            setTTasks([...tTasks, notes[i]]);
          }
        } else {
          if (!cTasks.some((k) => k.id === notes[i].id)) {
            setCTasks([...cTasks, notes[i]]);
          }
        }
      }
    } catch (error) {
      console.log("Error categorizing notes", error);
    }
  };

  const addNote = async (newNote) => {
    try {
      const statement = await db.prepareAsync(
        "INSERT INTO notes (note, due, done) VALUES (?,?,?)"
      );
      await statement.executeAsync([newNote.note, newNote.due, newNote.done]);
      await getNotes();
    } catch (error) {
      console.log("Error while adding note : ", error);
    }
  };

  const deleteAllNotes = async () => {
    try {
      await db.runAsync("DELETE FROM notes");
      await getNotes();
    } catch (error) {
      console.log("Error while deleting all the notes : ", error);
    }
  };

  const deleteNote = async (id) => {
    try {
      await db.runAsync("DELETE FROM notes WHERE id = ?", [id]);
      await getNotes();
    } catch (error) {
      console.log("Error while deleting note : ", error);
    }
  };

  const handleDelete = (id, section) => {
    if (section === "c") {
      index = cTasks.findIndex((k) => k.id === id);
      console.log(index);
      setCTasks([...cTasks.slice(0, index), ...cTasks.slice(index + 1)]);
    }
    deleteNote(id);
  };

  const handleAdd = () => {
    setShowForm(!showForm);
  };

  useEffect(() => {
    getNotes();
  }, []);

  useEffect(() => {
    categorizeNotes();
    console.log("Notes updated");
  }, [notes]);

  useEffect(() => {}, [cTasks, oTasks, tTasks]);

  useEffect(() => {
    console.log(note);
  }, [note]);

  return (
    <View style={{ flex: 1 }}>
      {/* {notes.length === 0 ? (
        <View style={{ flex: 5 }}>
          <Text style={styles.text}>NONE</Text>
        </View>
      ) : (
        <View style={{ flex: 5 }}>
          <FlatList
            data={notes}
            renderItem={({ item }) => {
              ctnote(item) === 1 ? (
                <View style={styles.note}>
                  <Text style={styles.text}>
                    {" "}
                    {item.note} - {item.due} -{" "}
                    {item.done === 0 ? "False" : "True"}
                  </Text>
                  <Pressable
                    onPress={() => setNote(item)}
                    style={styles.editbutton}
                  ></Pressable>
                  <TouchableOpacity
                    onPress={() => deleteNote(item.id)}
                    style={styles.button}
                  >
                    <Text>Delete</Text>
                  </TouchableOpacity>
                </View>
              ) : null;
            }}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>
      )} */}

      {cTasks.length === 0 ? (
        <View style={styles.header}>
          <Text style={styles.text}>Carried Over</Text>
        </View>
      ) : (
        <View style={{ flex: 5 }}>
          <View style={styles.header}>
            <Text style={styles.text}>Carried Over</Text>
          </View>
          <FlatList
            data={cTasks}
            renderItem={({ item }) => (
              <NoteItem item={item} handleDelete={handleDelete} />
            )}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>
      )}

      {/* {tTasks.length === 0 ? (
        <View style={styles.header}>
          <Text style={styles.text}>Today's tasks</Text>
        </View>
      ) : (
        <View style={{ flex: 5 }}>
          <View style={styles.header}>
            <Text style={styles.text}>Today's tasks</Text>
          </View>
          <FlatList
            data={tTasks}
            renderItem={({ item }) => (
              <View style={styles.note}>
                <Text style={styles.text}>
                  {" "}
                  {item.note} - {item.due} -{" "}
                  {item.done === 0 ? "False" : "True"}
                </Text>
                <Pressable
                  onPress={() => setNote(item)}
                  style={styles.editbutton}
                ></Pressable>
                <TouchableOpacity
                  onPress={() => deleteNote(item.id)}
                  style={styles.button}
                >
                  <Text>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>
      )}

      {oTasks.length === 0 ? (
        <View style={styles.header}>
          <Text style={styles.text}>Other tasks</Text>
        </View>
      ) : (
        <View style={{ flex: 5 }}>
          <View style={styles.header}>
            <Text style={styles.text}>Other tasks</Text>
          </View>
          <FlatList
            data={oTasks}
            renderItem={({ item }) => (
              <View style={styles.note}>
                <Text style={styles.text}>
                  {" "}
                  {item.note} - {item.due} -{" "}
                  {item.done === 0 ? "False" : "True"}
                </Text>
                <Pressable
                  onPress={() => setNote(item)}
                  style={styles.editbutton}
                ></Pressable>
                <TouchableOpacity
                  onPress={() => deleteNote(item.id)}
                  style={styles.button}
                >
                  <Text>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>
      )} */}

      {showForm && (
        <NoteForm
          showForm={showForm}
          setShowForm={setShowForm}
          note={note}
          setNote={setNote}
          addNote={addNote}
        />
      )}
      <View style={{ flex: 2, backgroundColor: "blue" }}>
        <TouchableOpacity
          onPress={handleAdd}
          style={styles.button}
          color="#fff"
        >
          <Text>Add</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 2, backgroundColor: "blue" }}>
        <TouchableOpacity
          onPress={() => console.log(oTasks, cTasks, tTasks)}
          style={styles.button}
          color="#fff"
        >
          <Text>LOG</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    paddingTop: 50,
    paddingLeft: 10,
  },
  title: {
    fontSize: 28,
    color: "#FFF",
    fontWeight: "bold",
    marginBottom: 40,
  },
  text: {
    color: "#FFF",
  },
  content: {},
  note: {
    marginBottom: 20,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    color: "#000",
    backgroundColor: "#fff",
    borderRadius: 5,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: 25,
    width: 100,
  },
  form: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00ff00",
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: 120,
  },
  date: {
    color: "#fff",
    marginBottom: 40,
  },
  editbutton: {
    width: 20,
    aspectRatio: "1/1",
    backgroundColor: "red",
    borderRadius: 5,
  },
  header: {
    fontWeight: "700",
    width: 150,
    padding: 5,
    backgroundColor: "#00ff00",
  },
});
