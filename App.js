import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import * as SQLite from "expo-sqlite";
import { useState, useEffect } from "react";

import styles from "./styles/styles";

import Content from "./components/Content";

import { toLocalISOString } from "./common/utils";

function openDatabase() {
  const db = SQLite.openDatabaseSync("notes.db");
  db.withTransactionSync(() => {
    db.runSync(
      ` CREATE TABLE IF NOT EXISTS notes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          note TEXT,
          due TEXT
        );`
    );
  });
  return db;
}

const db = openDatabase();

async function initializeDB(db) {
  // const db = await openDatabaseAsync("notes.db");
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

  const [statusColor, setStatusColor] = useState("#0a0a0a");

  // check if directory is

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
    // <SQLite.SQLiteProvider
    //   // assetSource={{ assetId: require("./assets/notes.db") }}
    //   databaseName={db}
    //   // onInit={initializeDB}
    //   // onError={() => setStatusColor("ff0000")}
    // >
    <View style={[styles.container, { backgroundColor: statusColor }]}>
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
      <Content
        style={styles.content}
        dateToday={dateToday}
        setStatusColor={setStatusColor}
        db={db}
      />
      <StatusBar style="light" />
    </View>
    // </SQLite.SQLiteProvider>
  );
}
