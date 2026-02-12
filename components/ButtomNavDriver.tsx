// components/BottomNavDriver.tsx
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type NavItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: "/driver/beranda" | "/driver/riwayat" | "/driver/profil";
};

const navItems = [
  { icon: "home-sharp", label: "Beranda", route: "/driver/beranda" },
  { icon: "time", label: "Riwayat", route: "/driver/riwayat" },
  { icon: "person", label: "Profil", route: "/driver/profil" },
] as const;

export default function BottomNavDriver() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const isActive =
          pathname === item.route || pathname.startsWith(item.route + "/");

        return (
          <TouchableOpacity
            key={item.route}
            style={styles.navItem}
            onPress={() => router.replace(item.route)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={item.icon}
              size={26}
              color={isActive ? "#00456B" : "#757575"}
            />
            <Text
              style={[
                styles.navText,
                { color: isActive ? "#00456B" : "#757575" },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 68,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    marginBottom: 40,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
  },
  navText: {
    fontSize: 11,
    marginTop: 3,
    fontWeight: "500",
  },
});
