import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import * as SQLite from "expo-sqlite";
import * as SplashScreen from "expo-splash-screen";
import { useState, useEffect } from "react";

import styles from "./styles/styles";

import Content from "./components/Content";

import { toLocalISOString } from "./common/utils";

import * as Notifications from "expo-notifications";
import NotificationToggle from "./components/NotificationToggle";

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// async function initializeDB(db) {
//   // const db = await openDatabaseAsync("notes.db");
//   try {
//     await db.execAsync(`
//         PRAGMA journal_mode = WAL;
//         CREATE TABLE IF NOT EXISTS notes (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           note TEXT,
//           due TEXT
//         );
//       `);
//     console.log("Database initialised");
//   } catch (error) {
//     console.log("Error initialising DB", error);
//   }
// }

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

export default function App() {
  const [dateToday, setDateToday] = useState("");
  const [dayToday, setDayToday] = useState("");
  const [dd, setDD] = useState("01");
  const [mm, setMM] = useState("01");
  const [appReady, setAppReady] = useState(false);
  const [pendingTaskCount, setPendingTaskCount] = useState(0);
  // const [notificationEnabled, setNotificationEnabled] = useState(false);

  const [statusColor, setStatusColor] = useState("#0a0a0a");

  const checkAndRequestPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    ``;

    if (status !== "granted") {
      const { status: newStatus } =
        await Notifications.requestPermissionsAsync();
      if (newStatus !== "granted") {
        alert("You need to enable notifications in your settings."); // change to some sort toast
      }
    }
  };

  useEffect(() => {
    const waitForPermissionCheck = async () => {
      await checkAndRequestPermissions();
    };

    const date = new Date();

    setDateToday(
      toLocalISOString(date).split("T")[0].split("-").reverse().join("-")
    );

    setDD(date.getDate());
    setMM(date.getMonth() + 1);
    setDayToday(date.toLocaleDateString("en-US", { weekday: "long" }));
    waitForPermissionCheck()
      .then(() => setAppReady(true))
      .catch((error) => {
        console.log("Some error", error);
      });
  }, []);

  useEffect(() => {
    if (appReady == true) {
      SplashScreen.hideAsync();
    }
  }, [appReady]);

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
        // pointerEvents="none"
      >
        <View style={styles.bannerDate}>
          <Text style={styles.text2}>
            {dd}
            <Text style={{ color: "#ff3333" }}>/</Text>
            {mm}
          </Text>
          <Text style={styles.text1}>{dayToday}</Text>
        </View>
        <NotificationToggle
          pendingTaskCount={pendingTaskCount}
          // setNotificationEnabled={setNotificationEnabled}
          // notificationEnabled={notificationEnabled}
        />
      </View>
      <Content
        style={styles.content}
        dateToday={dateToday}
        setStatusColor={setStatusColor}
        setPendingTaskCount={setPendingTaskCount}
        db={db}
      />
      <StatusBar style="light" />
    </View>
    // </SQLite.SQLiteProvider>
  );
}
