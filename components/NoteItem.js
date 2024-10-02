import styles from "../styles/styles";
import { Dimensions } from "react-native";
import { useState, useEffect } from "react";
import { View, TouchableOpacity, Text } from "react-native";

const NoteItem = ({
  item,
  handleDelete,
  type,
  setNote,
  setShowForm,
  setDateString,
  setDate,
  setTask,
  setNoteId,
  setFormMode,
}) => {
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
        onPress={() => {
          setShowForm(true);
          setNote(item);
          setNoteId(item.id);
          setFormMode(1);
          setTask(item.note);
          setDateString(item.due);
          setDate(new Date(item.due.split("-").reverse().join("-")));
        }}
      >
        <Text
          style={[
            styles.text,
            {
              fontSize: 18,
              maxWidth: Dimensions.get("window").width * 0.52,
              minWidth: Dimensions.get("window").width * 0.52,
            },
          ]}
        >
          {item.note}
        </Text>
        <Text
          style={[
            styles.text,
            {
              color: "#a4a4a4",
              paddingTop: 5,
              marginLeft: 20,
            },
          ]}
        >
          {dueInWords}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleDelete(item.id, type)}
        style={styles.check}
      ></TouchableOpacity>
    </View>
  );
};

export default NoteItem;
