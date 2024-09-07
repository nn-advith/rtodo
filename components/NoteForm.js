import styles from "../styles/styles";
import { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Modal,
  TextInput,
  Pressable,
  Dimensions,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AntDesign from "@expo/vector-icons/AntDesign";
import moment from "moment";
import { toLocalISOString } from "../common/utils";

const NoteForm = ({
  dateToday,
  showForm,
  setShowForm,
  note,
  setNote,
  addNote,
}) => {
  // const db = useSQLiteContext();

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
    }
  };

  const onChange = (e, d) => {
    if (e.type === "set") {
      setDateString(
        toLocalISOString(d).split("T")[0].split("-").reverse().join("-")
      );
    }
    setShowCalendar(!showCalendar);
  };

  useEffect(() => {}, [dateString]);

  return (
    // <View
    //   style={{
    //     flex: 1,
    //     justifyContent: "center",
    //     alignItems: "center",
    //     height: Dimensions.get("window").height,
    //   }}
    // >
    <Modal
      animationType="slide"
      transparent={true}
      visible={showForm}
      onRequestClose={() => {
        setShowForm(!showForm);
      }}
    >
      <View style={styles.form}>
        <View style={styles.formContent}>
          <Text style={[styles.text3, { paddingLeft: 18 }]}>Add Task</Text>
          <View
            style={{
              width: Dimensions.get("window").width * 0.9,
              borderBottomColor: taskEmpty ? "#ff3333" : "#aaa",
              borderBottomWidth: 1,
              marginLeft: 18,
              marginTop: 40,
              padding: 0,
            }}
          >
            <TextInput
              style={styles.input}
              onChangeText={(e) => {
                setTask(e), setTaskEmpty(false);
              }}
              value={task}
              placeholder="Task"
              placeholderTextColor={"#474747"}
              // underlineColorAndroid={"#aaa"}
            />
            <Text
              style={[
                styles.text,
                {
                  color: "#ff3333",
                  display: taskEmpty ? "flex" : "none",
                  position: "absolute",
                  top: 50,
                },
              ]}
            >
              Task cannot be empty
            </Text>
          </View>
          <View style={{ flexDirection: "row", marginTop: 50 }}>
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
            <View
              style={{
                width: Dimensions.get("window").width * 0.9,
                borderBottomColor: dateError ? "#ff3333" : "#aaa",
                borderBottomWidth: 1,
                marginLeft: 18,
                padding: 0,
              }}
            >
              <TextInput
                style={styles.input}
                onChangeText={(e) => {
                  setDateString(e), setDateError(false);
                }}
                value={dateString}
                placeholder="Due"
                placeholderTextColor={"#474747"}
              />
              <Text
                style={[
                  styles.text,
                  {
                    color: "#ff3333",
                    display: dateError ? "flex" : "none",
                    position: "absolute",
                    top: 50,
                  },
                ]}
              >
                Invalid date
              </Text>
            </View>
            <Pressable
              style={styles.calendar}
              onPress={() => {
                setShowCalendar(!showCalendar);
              }}
            >
              <AntDesign name="calendar" size={24} color="white" />
            </Pressable>
          </View>
          {/* {dateError ? <Text style={styles.text}> Invalid</Text> : null} */}
          <View
            style={{
              flex: 1,
              alignItems: "flex-end",
              justifyContent: "center",
              width: Dimensions.get("window").width,
              marginTop: 100,
              marginBottom: 40,
            }}
          >
            <TouchableOpacity
              onPress={handleOk}
              style={styles.addButton}
              color="#fff"
            >
              <AntDesign name="check" size={36} color="#7a7a7a" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    // </View>
  );
};

export default NoteForm;
