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
import { LinearGradient } from "expo-linear-gradient";
import Entypo from "@expo/vector-icons/Entypo";

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
        <View
          // colors={["#0a0a0a", "#0a0a0a", "#0a0a0a00"]}
          // locations={[0.7, 0.8, 1]}
          style={styles.banner}
          pointerEvents="none"
        >
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
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        height: Dimensions.get("window").height,
      }}
    >
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
          {taskEmpty ? <Text style={styles.text}> EMPTY</Text> : null}
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
          {dateError ? <Text style={styles.text}> Invalid</Text> : null}
          <Pressable style={styles.button} onPress={handleOk}>
            <Text style={styles.textStyle}>Ok</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
};

const NoteItem = ({ item, handleDelete, type, setNote }) => {
  const [dueInWords, setDueInWords] = useState("");

  const getDueInWords = () => {
    dueDate = new Date(item.due.split("-").reverse().join("-"));
    today = new Date().getDate();

    yesterday = today - 1;
    tomorrow = today + 1;
    if (dueDate.getDate() === yesterday) {
      setDueInWords("Due Yesterday");
    } else if (dueDate.getDate() === tomorrow) {
      setDueInWords("Due Tomorrow");
    } else if (dueDate.getDate() === today) {
      setDueInWords("Due Today");
    } else {
      setDueInWords(
        "Due " + dueDate.toString().split(" ").slice(1, 3).join(" ")
      );
    }
  };

  useEffect(() => {
    getDueInWords();
  }, []);

  return (
    <View style={styles.note}>
      <TouchableOpacity
        style={{ flexDirection: "row" }}
        onPress={() => setNote(item)}
      >
        <Text style={[styles.text, { fontSize: 18 }]}>{item.note}</Text>
        <Text
          style={[
            styles.text,
            { marginLeft: 25, color: "#a4a4a4", paddingTop: 5 },
          ]}
        >
          {dueInWords}
        </Text>
      </TouchableOpacity>
      {/* <Pressable
        onPress={() => setNote(item)}
        style={styles.editbutton}
      ></Pressable> */}
      <TouchableOpacity
        onPress={() => handleDelete(item.id, type)}
        style={styles.check}
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
        // paddingTop: 70,
      }}
    >
      <View style={{ flex: 12 }}>
        <LinearGradient
          colors={["#0a0a0a", "#0a0a0a77", "#0a0a0a00"]}
          locations={[0.01, 0.4, 1]}
          style={{
            height: 40,
            position: "absolute",
            top: 0,
            left: 0,
            width: Dimensions.get("window").width,
            zIndex: 5,
          }}
        />
        <ScrollView style={{ flex: 1, paddingTop: 20 }} horizontal={false}>
          {cTasks.length === 0 ? (
            <View></View>
          ) : (
            <View
              style={{
                borderLeftColor: "#ff3333",
                borderLeftWidth: 2,
                marginBottom: 40,
              }}
            >
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
            <View
              style={{
                borderLeftColor: "#33A9FF",
                borderLeftWidth: 2,
                marginBottom: 40,
              }}
            >
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
            <View
              style={{
                borderLeftColor: "#2CDD00",
                borderLeftWidth: 2,
                marginBottom: 40,
              }}
            >
              <View style={styles.header}>
                <Text style={styles.text3}>Upcoming</Text>
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
        </ScrollView>
        <LinearGradient
          colors={["#0a0a0a", "#0a0a0a77", "#0a0a0a00"]}
          locations={[0.01, 0.4, 1]}
          style={{
            height: 40,
            position: "absolute",
            bottom: -5,
            left: 0,
            width: Dimensions.get("window").width,
            zIndex: 5,
            transform: [{ rotate: "180deg" }],
          }}
        />
      </View>
      <View
        style={{
          flex: 1,
          alignItems: "flex-end",
          zIndex: 100,
          justifyContent: "center",
          // backgroundColor: "#d078ff",
          // position: "absolute",
          // bottom: 0,
          // right: 0,
          width: Dimensions.get("window").width,
        }}
        // colors={["#0a0a0a00", "#0a0a0a", "#0a0a0a"]}
        // locations={[0.02, 0.3, 1]}
      >
        <TouchableOpacity
          onPress={handleAdd}
          style={styles.addButton}
          color="#fff"
        >
          <Entypo name="plus" size={36} color="#7a7a7a" />
        </TouchableOpacity>
      </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    // paddingTop: getStatusBarHeight(),
    paddingLeft: 10,
  },
  banner: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 7,
    // backgroundColor: "#d078ff",
    // marginTop: 7,
    paddingTop: getStatusBarHeight() + 7,
    zIndex: 100,
    width: Dimensions.get("window").width,
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
    fontSize: 14,
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
    paddingVertical: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "92%",
    paddingLeft: 12,
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
  addButton: {
    width: 50,
    height: 50,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "red",
    marginRight: 20,
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
  check: {
    width: 20,
    height: 20,
    borderColor: "#A6A6A6",
    borderWidth: 2,
  },
});
