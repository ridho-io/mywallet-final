// app/(tabs)/profile.tsx
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert, Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View,
} from "react-native";
import Constants from 'expo-constants'; // Import Constants
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import AiAssistantModal from "@/components/specific/AiAssistantModal";

const ProfileMenuItem = ({ icon, text, onPress, }: { icon: keyof typeof Ionicons.glyphMap; text: string; onPress: () => void; }) => (
    <Pressable style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuItemIcon}>
            <Ionicons name={icon} size={24} color={Colors.light.tint} />
        </View>
        <Text style={styles.menuItemText}>{text}</Text>
        <Ionicons name="chevron-forward-outline" size={22} color={Colors.light.icon} />
    </Pressable>
);

export default function ProfileScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const [isAiModalVisible, setAiModalVisible] = useState(false);

  const { setGlobalLoading } = useAuth();

  // Mengambil data dari app.json
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const appAuthor = Constants.expoConfig?.extra?.author || 'Ridho Pranata';

  const handleLogout = async () => {
    Alert.alert("Konfirmasi Logout", "Apakah Anda yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Ya, Keluar",
        onPress: async () => {
          setGlobalLoading(true, "Logging out...");
          await supabase.auth.signOut();
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <LinearGradient colors={['#4A90E2', '#0ABAB5']} style={StyleSheet.absoluteFill} />
          
          <View style={styles.profileHeader}>
             <View style={styles.avatarContainer}>
                <Ionicons name="person-circle" size={80} color={Colors.light.tint} />
             </View>
             <Text style={styles.profileName}>{session?.user?.email?.split("@")[0] || "MyWallet User"}</Text>
             <Text style={styles.profileEmail}>{session?.user?.email || "Silakan login"}</Text>
          </View>

          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Fitur</Text>
            <View style={styles.menuCard}>
              <ProfileMenuItem
                icon="chatbubble-ellipses-outline"
                text="Asisten AI (FinPal)"
                onPress={() => setAiModalVisible(true)}
              />
              <View style={styles.separator} />
              <ProfileMenuItem
                icon="cash-outline"
                text="Budgeting"
                onPress={() => router.push("/(tabs)/savings")}
              />
              <View style={styles.separator} />
              <ProfileMenuItem
                icon="wallet-outline"
                text="Savings Goals"
                onPress={() => router.push("/(tabs)/savings")}
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
                    `MyWallet v${appVersion}`,
                    `Dibuat dengan ❤️ oleh ${appAuthor}.\n\nAplikasi pengelola keuangan pribadi untuk membantu Anda mencapai tujuan finansial.`
                  )
                }
              />
              <View style={styles.separator} />
              <View style={styles.separator} />
              <ProfileMenuItem
                icon="shield-checkmark-outline"
                text="Hak Cipta"
                onPress={() => 
                    Alert.alert(
                        "Hak Cipta",
                        `© ${new Date().getFullYear()} ${appAuthor}. Semua hak dilindungi undang-undang.`
                    )
                }
              />
            </View>
          </View>

          <View style={styles.medsosContainer}>
              <Pressable onPress={() => Linking.openURL("https://github.com/ridho-io/mywallet-final")}>
                <Ionicons name="logo-github" size={35} color={Colors.light.text} />
              </Pressable>
              <Pressable onPress={() => Linking.openURL("https://www.instagram.com/rdprnata_1.0")}>
                <Ionicons name="logo-instagram" size={35} color={Colors.light.text} />
              </Pressable>
          </View>

          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </Pressable>

          {/* Teks Copyright di bagian bawah */}
          <Text style={styles.copyrightText}>
            MyWallet v{appVersion} © {new Date().getFullYear()} {appAuthor}
          </Text>

        </ScrollView>
      </SafeAreaView>

      <AiAssistantModal 
        visible={isAiModalVisible}
        onClose={() => setAiModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
    backgroundColor: 'rgba(255,255,255,0.8)',
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 15,
  },
  medsosContainer: {
    flexDirection: "row",
    gap: 20,
    marginTop: 15,
    marginBottom: 20,
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  logoutButton: {
    backgroundColor: Colors.light.card,
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
  },
  logoutButtonText: {
    color: Colors.light.danger,
    fontSize: 17,
    fontWeight: "600",
  },
  copyrightText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 40,
    marginBottom: 80, // Memberi ruang dari tab bar
  },
});