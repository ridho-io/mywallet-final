// app/(tabs)/profile.tsx
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { LinearGradient } from "expo-linear-gradient";

// Komponen untuk setiap baris menu
const ProfileMenuItem = ({
  icon,
  text,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  onPress: () => void;
}) => (
  <Pressable style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemIcon}>
      <Ionicons name={icon} size={24} color={Colors.light.tint} />
    </View>
    <Text style={styles.menuItemText}>{text}</Text>
    <Ionicons
      name="chevron-forward-outline"
      size={22}
      color={Colors.light.icon}
    />
  </Pressable>
);

export default function ProfileScreen() {
  const { session } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert("Konfirmasi Logout", "Apakah Anda yakin ingin keluar?", [
      {
        text: "Batal",
        style: "cancel",
      },
      {
        text: "Ya, Keluar",
        onPress: async () => {
          await supabase.auth.signOut();
          

        },
        style: "destructive",
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <LinearGradient colors={['#4A90E2', '#0ABAB5']} style={StyleSheet.absoluteFill} />
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons
              name="person-circle"
              size={80}
              color={Colors.light.tint}
            />
          </View>
          <Text style={styles.profileName}>
            {session?.user?.email?.split("@")[0] || "MyWallet User"}
          </Text>
          <Text style={styles.profileEmail}>{session?.user?.email || "pleasem login"}</Text>
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Fitur Utama</Text>
          <View style={styles.menuCard}>
            <ProfileMenuItem
              icon="wallet-outline"
              text="Savings Goals"
              onPress={() => router.push("/(tabs)/savings")}
            />
            <View style={styles.separator} />
            <ProfileMenuItem
              icon="cash-outline"
              text="Budget"
              onPress={() => router.push("/(tabs)/budget")}
            />
            <View style={styles.separator} />
            <ProfileMenuItem
              icon="bar-chart-outline"
              text="Reports"
              onPress={() => router.push("/(tabs)/reports")}
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Aplikasi</Text>
          <View style={styles.menuCard}>
            <ProfileMenuItem
              icon="information-circle-outline"
              text="Tentang Aplikasi"
              onPress={() =>
                Alert.alert(
                  "MyWallet v1.0.0",
                  "Aplikasi pengelola keuangan pribadi."
                )
              }
            />
            <View style={styles.separator} />
            <ProfileMenuItem
              icon="help-buoy-outline"
              text="Bantuan & Dukungan"
              onPress={() =>
                Linking.openURL("https://github.com/ridho-io/mywallet")
              }
            />
          </View>
        </View>

        {/* Logout Button */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
    paddingVertical: 20,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: `${Colors.light.white}`,
    marginBottom: 15,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  profileEmail: {
    fontSize: 16,
    color: Colors.light.gray,
    marginTop: 4,
  },
  menuSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  menuCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 15,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  menuItemIcon: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: `${Colors.light.tint}45`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuItemText: {
    flex: 1,
    fontSize: 17,
    color: Colors.light.text,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.light.background,
    marginHorizontal: 15,
  },
  logoutButton: {
    backgroundColor: Colors.light.card,
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 80
  },
  logoutButtonText: {
    color: Colors.light.danger,
    fontSize: 17,
    fontWeight: "600",
  },
});
