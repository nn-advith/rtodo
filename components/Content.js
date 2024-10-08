import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  ScrollView,
} from "react-native";
import { useState, useEffect } from "react";

import styles from "../styles/styles";

import moment from "moment";
import { LinearGradient } from "expo-linear-gradient";
import Entypo from "@expo/vector-icons/Entypo";

import NoteForm from "./NoteForm";
import NoteItem from "./NoteItem";

const Content = ({ dateToday, setStatusColor, db, setPendingTaskCount }) => {
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [note, setNote] = useState({});

  const [error, setError] = useState("");
  const [cTasks, setCTasks] = useState([]);
  const [tTasks, setTTasks] = useState([]);
  const [oTasks, setOTasks] = useState([]);

  const [task, setTask] = useState("");
  const [dateString, setDateString] = useState("");
  const [date, setDate] = useState(
    new Date(dateToday.split("-").reverse().join("-"))
  );

  const [formMode, setFormMode] = useState(0);
  const [noteId, setNoteId] = useState(null);

  const getNotes = () => {
    try {
      db.withTransactionSync(() => {
        setNotes(db.getAllSync("SELECT * FROM notes"));
      });
      // setNotes(notes);
    } catch (error) {
      console.log("Error fetching data :", error);
      setStatusColor("#ff6800"); //orange
    }
  };

  const categorizeNotes = () => {
    try {
      const todayDate = moment(dateToday, "DD-MM-YYYY").valueOf();

      setOTasks(
        notes.filter(
          (item) => moment(item.due, "DD-MM-YYYY").valueOf() > todayDate
        )
      );
      setTTasks(
        notes.filter(
          (item) => moment(item.due, "DD-MM-YYYY").valueOf() === todayDate
        )
      );
      setCTasks(
        notes.filter(
          (item) => moment(item.due, "DD-MM-YYYY").valueOf() < todayDate
        )
      );
    } catch (error) {
      console.log("Error categorizing notes", error);
      // setStatusColor("#0808ff"); //blue
    }
  };

  const addNote = (newNote) => {
    try {
      db.withTransactionSync(() => {
        db.runSync(`INSERT INTO notes (note, due) VALUES (?,?)`, [
          newNote.note,
          newNote.due,
        ]);
      });

      getNotes();
    } catch (error) {
      console.log("Error while adding note : ", error);
      // setError(Error);
      // setStatusColor("#e908ff"); //blue
    }
  };

  const updateNote = (note) => {
    try {
      db.withTransactionSync(() => {
        db.runSync(`UPDATE notes SET note = ?, due = ? WHERE id = ?`, [
          note.note,
          note.due,
          note.id,
        ]);
      });
      getNotes();
    } catch (error) {
      console.log("Error while updating note: ", error);
    }
  };

  // const deleteAllNotes = async () => {
  //   try {
  //     await db.runAsync("DELETE FROM notes");
  //     await getNotes();
  //   } catch (error) {
  //     console.log("Error while deleting all the notes : ", error);
  //   }
  // };

  const deleteNote = (id) => {
    try {
      db.withTransactionSync(() => {
        db.runSync("DELETE FROM notes WHERE id = ?", [id]);
      });
      getNotes();
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

  const countPending = () => {
    setPendingTaskCount(cTasks.length);
  };

  const handleAdd = () => {
    setTask("");
    setDateString("");
    setDate(new Date(dateToday.split("-").reverse().join("-")));
    setShowForm(!showForm);
  };

  useEffect(() => {
    // deleteAllNotes();
    getNotes();

    // scheduleNotification();
    // Notifications.cancelAllScheduledNotificationsAsync();
  }, []);

  useEffect(() => {
    categorizeNotes();
  }, [notes]);

  useEffect(() => {
    countPending();
  }, [cTasks]);

  // useEffect(() => {}, [cTasks, oTasks, tTasks]);

  useEffect(() => {}, [note]);

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
                    setShowForm={setShowForm}
                    setDateString={setDateString}
                    setTask={setTask}
                    setDate={setDate}
                    setNoteId={setNoteId}
                    setFormMode={setFormMode}
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
                    setShowForm={setShowForm}
                    setDateString={setDateString}
                    setTask={setTask}
                    setDate={setDate}
                    setNoteId={setNoteId}
                    setFormMode={setFormMode}
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
                    setShowForm={setShowForm}
                    setDateString={setDateString}
                    setTask={setTask}
                    setDate={setDate}
                    setNoteId={setNoteId}
                    setFormMode={setFormMode}
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
          width: Dimensions.get("window").width,
        }}
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
          task={task}
          setTask={setTask}
          dateString={dateString}
          setDateString={setDateString}
          showForm={showForm}
          setShowForm={setShowForm}
          date={date}
          addNote={addNote}
          updateNote={updateNote}
          formMode={formMode}
          noteId={noteId}
        />
      )}
    </View>
  );
};

export default Content;
