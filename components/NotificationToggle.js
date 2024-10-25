import styles from "../styles/styles";
import { TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import * as Notifications from "expo-notifications";

const NotificationToggle = ({
  pendingTaskCount,
  // setNotificationEnabled,
  // notificationEnabled,
}) => {
  const getEnabledNotificationCount = async () => {
    await Notifications.getAllScheduledNotificationsAsync()
      .then((notifs) => setNotifNum(notifs.length))
      .catch((error) =>
        console.log("Error while getting notifications ", error)
      );
  };
  const scheduleNotification = async (pendingTaskCount, hh, mm) => {
    const scheduled = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Pending tasks",
        body: `You have ${pendingTaskCount} tasks pending.`,
        sound: true,
      },
      trigger: {
        hour: hh,
        minute: mm,
        repeats: true,
      },
    });
    // console.log("Notification scheduled from the child component!", hh, mm);
  };

  const [notificationEnabled, setNotificationEnabled] = useState(false);

  const [bgcolor, setBgcolor] = useState("#0a0a0a");
  const [notifNum, setNotifNum] = useState(0);
  const toggle = async () => {
    await getEnabledNotificationCount()
      .then(async () => {
        if (notifNum == 0) {
          await scheduleNotification(pendingTaskCount, 9, 0);
          await scheduleNotification(pendingTaskCount, 18, 30);
          setNotificationEnabled(true);
        } else {
          await Notifications.cancelAllScheduledNotificationsAsync()
            .then(() => {
              setNotificationEnabled(false);
            })
            .catch((error) => console.log("Error while cancelling ", error));
        }
        await getEnabledNotificationCount();
      })
      .catch((error) => console.log("Error while toggling ", error));
  };

  useEffect(() => {
    const modifyNotifications = async () => {
      if (notificationEnabled == true) {
        await Notifications.cancelAllScheduledNotificationsAsync()
          .then(() => {})
          .catch((error) => console.log("Error while cancelling ", error));
        await scheduleNotification(pendingTaskCount, 9, 0);
        await scheduleNotification(pendingTaskCount, 18, 30);
      }
    };

    modifyNotifications();
  }, [pendingTaskCount]);

  useEffect(() => {
    getEnabledNotificationCount();
  }, []);

  return (
    <TouchableOpacity
      onPress={toggle}
      style={[
        styles.notificationToggle,
        { backgroundColor: notifNum == 0 ? "#0a0a0a" : "#ff333399" },
      ]}
    ></TouchableOpacity>
  );
};

export default NotificationToggle;
