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
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";

async function initializeDB(db) {
  try {
    await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS notes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          note TEXT,
          due TEXT
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
    setDateToday(
      new Date().toISOString().split("T")[0].split("-").reverse().join("-")
    );
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

const NoteForm = ({
  dateToday,
  showForm,
  setShowForm,
  note,
  setNote,
  addNote,
}) => {
  const [task, setTask] = useState("");
  const [date, setDate] = useState(
    new Date(dateToday.split("-").reverse().join("-"))
  );
  const [dateString, setDateString] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  const [taskEmpty, setTaskEmpty] = useState(false);
  const [dateError, setDateError] = useState(false);

  const validDate = (ds) => {
    if (moment(ds, "DD-MM-YYYY", true).isValid()) {
      return true;
    } else {
      return false;
    }
  };

  const handleOk = () => {
    if (validDate(dateString)) {
      setDateError(false);
    } else {
      setDateError(true);
    }

    if (task.length === 0) {
      setTaskEmpty(true);
    } else {
      setTaskEmpty(false);
    }
    temp_note = { note: task, due: dateString };
    if (validDate(dateString) === true && task.length !== 0) {
      addNote(temp_note);
      setShowForm(!showForm);
    } else {
      console.log("ERROR in FORM");
    }
  };

  const onChange = (e, d) => {
    if (e.type === "set") {
      setDateString(
        d.toISOString().split("T")[0].split("-").reverse().join("-")
      );
    }
    setShowCalendar(!showCalendar);
  };

  useEffect(() => {
    console.log(dateString);
  }, [dateString]);

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
          <View style={{ flexDirection: "row" }}>
            {showCalendar && (
              <DateTimePicker
                value={date}
                mode={"date"}
                is24Hour={true}
                display="default"
                onChange={onChange}
                style={{ backgroundColor: "white" }}
              />
            )}
            <TextInput
              style={styles.input}
              onChangeText={setDateString}
              value={dateString}
              placeholder="Due"
            />
            <Pressable
              style={styles.calendar}
              onPress={() => {
                setShowCalendar(!showCalendar);
              }}
            >
              <Text>---</Text>
            </Pressable>
          </View>
          <Pressable style={styles.button} onPress={handleOk}>
            <Text style={styles.textStyle}>Ok</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
};

const NoteItem = ({ item, handleDelete, type, setNote }) => {
  return (
    <View style={styles.note}>
      <Text style={styles.text}>
        {" "}
        {item.note} - {item.due}
      </Text>
      <Pressable
        onPress={() => setNote(item)}
        style={styles.editbutton}
      ></Pressable>
      <TouchableOpacity
        onPress={() => handleDelete(item.id, type)}
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
    console.log(section);
    try {
      if (section === "c") {
        index = cTasks.findIndex((k) => k.id === id);
        console.log(index);
        setCTasks([...cTasks.slice(0, index), ...cTasks.slice(index + 1)]);
      } else if (section === "t") {
        index = tTasks.findIndex((k) => k.id === id);
        console.log(index);
        setTTasks([...tTasks.slice(0, index), ...tTasks.slice(index + 1)]);
      } else if (section === "o") {
        index = oTasks.findIndex((k) => k.id === id);
        console.log(index);
        setOTasks([...oTasks.slice(0, index), ...oTasks.slice(index + 1)]);
      } else {
        throw new Error("Doesn't match type of note");
      }
      deleteNote(id);
    } catch (error) {
      console.log("Error executing handle delete", error);
    }
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

  // useEffect(() => {}, [cTasks, oTasks, tTasks]);

  useEffect(() => {
    console.log(note);
  }, [note]);

  return (
    <View style={{ flex: 1 }}>
      {cTasks.length === 0 ? (
        <View></View>
      ) : (
        <View style={{ flex: 5 }}>
          <View style={styles.header}>
            <Text style={styles.text}>Carried Over</Text>
          </View>
          <FlatList
            data={cTasks}
            renderItem={({ item }) => (
              <NoteItem
                item={item}
                handleDelete={handleDelete}
                type="c"
                setNote={setNote}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>
      )}

      {tTasks.length === 0 ? (
        <View></View>
      ) : (
        <View style={{ flex: 5 }}>
          <View style={styles.header}>
            <Text style={styles.text}>Today's tasks</Text>
          </View>
          <FlatList
            data={tTasks}
            renderItem={({ item }) => (
              <NoteItem
                item={item}
                handleDelete={handleDelete}
                type="t"
                setNote={setNote}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>
      )}

      {oTasks.length === 0 ? (
        <View></View>
      ) : (
        <View style={{ flex: 5 }}>
          <View style={styles.header}>
            <Text style={styles.text}>Other tasks</Text>
          </View>
          <FlatList
            data={oTasks}
            renderItem={({ item }) => (
              <NoteItem
                item={item}
                handleDelete={handleDelete}
                type="o"
                setNote={setNote}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>
      )}

      {showForm && (
        <NoteForm
          dateToday={dateToday}
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
  calendar: {
    width: 30,
    height: 30,
    backgroundColor: "white",
    borderColor: "black",
    borderWidth: 5,
  },
});
