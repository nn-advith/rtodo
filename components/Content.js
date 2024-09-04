import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  ScrollView,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useState, useEffect } from "react";

import styles from "../styles/styles";

import moment from "moment";
import { LinearGradient } from "expo-linear-gradient";
import Entypo from "@expo/vector-icons/Entypo";

import NoteForm from "./NoteForm";
import NoteItem from "./NoteItem";

const Content = ({ dateToday, setStatusColor }) => {
  const db = useSQLiteContext();

  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [note, setNote] = useState({});

  const [error, setError] = useState("");
  const [cTasks, setCTasks] = useState([]);
  const [tTasks, setTTasks] = useState([]);
  const [oTasks, setOTasks] = useState([]);

  const getNotes = async () => {
    try {
      const notes = await db.getAllAsync("SELECT * FROM notes");
      setNotes(notes);
    } catch (error) {
      console.log("Error fetching data :", error);
      setStatusColor("#ff6800"); //orange
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
      setStatusColor("#0808ff"); //blue
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
      setError(Error);
      setStatusColor("#e908ff"); //blue
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
          <Text>{error}</Text>
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

export default Content;
