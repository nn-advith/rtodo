import styles from "../styles/styles";
import { useState, useEffect } from "react";
import { View, TouchableOpacity, Text } from "react-native";

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

export default NoteItem;
