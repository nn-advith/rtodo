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
  Dimensions,
  ScrollView,
} from "react-native";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { useState, useEffect } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import { getStatusBarHeight } from "react-native-status-bar-height";

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
  const [dayToday, setDayToday] = useState("");
  const [dd, setDD] = useState("01");
  const [mm, setMM] = useState("01");
  useEffect(() => {
    const date = new Date();

    setDateToday(
      date.toISOString().split("T")[0].split("-").reverse().join("-")
    );
    setDD(date.getDate());
    setMM(date.getMonth() + 1);
    setDayToday(date.toLocaleDateString("en-US", { weekday: "long" }));
  }, []);

  return (
    <SQLiteProvider databaseName="notes.db" onInit={initializeDB}>
      <View style={styles.container}>
        <View style={styles.banner}>
          <Text style={styles.text2}>
            {dd}
            <Text style={{ color: "#ff3333" }}>/</Text>
            {mm}
          </Text>
          <Text style={styles.text1}>{dayToday}</Text>
        </View>
        <Content style={styles.content} dateToday={dateToday} />
      </View>
      <StatusBar style="light" />
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

  useEffect(() => {}, [dateString]);

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
      {/* <Pressable
        onPress={() => setNote(item)}
        style={styles.editbutton}
      ></Pressable> */}
      <TouchableOpacity
        onPress={() => handleDelete(item.id, type)}
        style={styles.button}
      ></TouchableOpacity>
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
      const todayDate = moment(dateToday, "DD-MM-YYYY").valueOf();

      for (i = 0; i < notes.length; i++) {
        const noteDate = moment(notes[i].due, "DD-MM-YYYY").valueOf();
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
    try {
      if (section === "c") {
        index = cTasks.findIndex((k) => k.id === id);

        setCTasks([...cTasks.slice(0, index), ...cTasks.slice(index + 1)]);
      } else if (section === "t") {
        index = tTasks.findIndex((k) => k.id === id);

        setTTasks([...tTasks.slice(0, index), ...tTasks.slice(index + 1)]);
      } else if (section === "o") {
        index = oTasks.findIndex((k) => k.id === id);

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
    // addNote({ note: "TASK", due: "31-03-2024" });
    // addNote({ note: "TASK", due: "31-03-2024" });
    // addNote({ note: "TASK", due: "31-03-2024" });
    // addNote({ note: "TASK", due: "31-10-2024" });
    // addNote({ note: "TASK", due: "31-10-2024" });
    // addNote({ note: "TASK", due: "31-10-2024" });
    // addNote({ note: "TASK", due: "31-03-2024" });
    // addNote({ note: "TASK", due: "31-03-2024" });
    // addNote({ note: "TASK", due: "31-03-2024" });
    // addNote({ note: "TASK", due: "31-10-2024" });
    // addNote({ note: "TASK", due: "31-10-2024" });
    // addNote({ note: "TASK", due: "31-10-2024" });

    // deleteAllNotes();
    getNotes();
  }, []);

  useEffect(() => {
    categorizeNotes();
  }, [notes]);

  // useEffect(() => {}, [cTasks, oTasks, tTasks]);

  useEffect(() => {
    console.log(note);
  }, [note]);

  return (
    <View
      style={{
        flex: 15,
        width: Dimensions.get("window").width,
        paddingTop: 20,
      }}
    >
      <View style={{ flex: 10, padding: 0, margin: 0 }}>
        <ScrollView
          style={{ flex: 1, overflow: "visible" }}
          horizontal={false}
          removeClippedSubviews={false}
        >
          {cTasks.length === 0 ? (
            <View></View>
          ) : (
            <View style={{ borderLeftColor: "#ff3333", borderLeftWidth: 1 }}>
              <View style={styles.header}>
                <Text style={styles.text3}>Pending</Text>
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
                horizontal={false}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}

          {tTasks.length === 0 ? (
            <View></View>
          ) : (
            <View style={{ borderLeftColor: "#33A9FF", borderLeftWidth: 2 }}>
              <View style={styles.header}>
                <Text style={styles.text3}>Today</Text>
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
                horizontal={false}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}

          {oTasks.length === 0 ? (
            <View></View>
          ) : (
            <View style={{ borderLeftColor: "#2CDD00", borderLeftWidth: 1 }}>
              <View style={styles.header}>
                <Text style={styles.text3}>Other</Text>
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
                horizontal={false}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
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
        </ScrollView>
      </View>
      <View style={{ flex: 1 }}>
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
    backgroundColor: "#0a0a0a",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    paddingTop: getStatusBarHeight(),
    paddingLeft: 10,
  },
  banner: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 7,
    backgroundColor: "#0a0a0a",
    width: Dimensions.get("window").width,
    marginTop: 7,
  },
  text1: {
    fontWeight: "800",
    color: "#ff3333",
    fontSize: 34,
    marginLeft: 7,
  },
  text2: {
    fontWeight: "600",
    color: "#fff",
    fontSize: 22,
    paddingTop: 10,
    marginLeft: 10,
  },
  text3: {
    fontWeight: "400",
    color: "#9F9F9F",
    fontSize: 18,
    paddingLeft: 12,
  },
  title: {
    fontSize: 28,
    color: "#FFF",
    fontWeight: "bold",
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
    width: "90%",
    paddingLeft: 7,
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
    fontWeight: "500",
    paddingHorizontal: 0,
    color: "#9F9F9F",
    // width: Dimensions.get("window").width,
    marginBottom: 15,
    flexDirection: "row",
  },
  calendar: {
    width: 30,
    height: 30,
    backgroundColor: "white",
    borderColor: "black",
    borderWidth: 5,
  },
});
