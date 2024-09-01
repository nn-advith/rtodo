import { StatusBar } from "expo-status-bar";
import {
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  ScrollView,
} from "react-native";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { useState, useEffect } from "react";
import moment from "moment";
import { LinearGradient } from "expo-linear-gradient";
import Entypo from "@expo/vector-icons/Entypo";

import styles from "./styles/styles";

import Content from "./components/Content";

import { toLocalISOString } from "./common/utils";

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
      toLocalISOString(date).split("T")[0].split("-").reverse().join("-")
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
