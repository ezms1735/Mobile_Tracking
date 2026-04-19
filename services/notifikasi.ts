import * as Notifications from "expo-notifications"
import * as Device from "expo-device"

async function registerForPushNotificationsAsync(): Promise<string | undefined> {

  const { status } = await Notifications.requestPermissionsAsync();

  if (status !== "granted") {
    alert("Izin notifikasi tidak diberikan");
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  console.log("Expo Push Token:", token);

  return token;
}