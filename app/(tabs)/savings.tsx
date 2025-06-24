// app/(tabs)/savings.tsx
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AddContributionModal from "../../components/specific/AddContributionModal";
import CreateGoalModal from "../../components/specific/CreateGoalModal";
import { useAuth } from "../../contexts/AuthContext";
import {
  getSavingGoals,
  deleteSavingGoal,
  SavingGoal,
} from "../../lib/database";
import { LinearGradient } from "expo-linear-gradient";
import EditGoalModal from "@/components/specific/EditGoalModal";

const SavingGoalCard = ({
  goal,
  onContributePress,
}: {
  goal: SavingGoal;
  onContributePress: () => void;
}) => {
  const progress =
    goal.target_amount > 0
      ? (goal.current_amount / goal.target_amount) * 100
      : 0;

  return (
    <View style={styles.goalCard}>
      <Text style={styles.goalName}>{goal.goal_name}</Text>

      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${Math.min(progress, 100)}%` },
          ]}
        />
      </View>

      <View style={styles.detailsContainer}>
        <View>
          <Text style={styles.amountText}>
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
            }).format(goal.current_amount)}
          </Text>
          <Text style={styles.targetText}>
            from{" "}
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
            }).format(goal.target_amount)}
          </Text>
        </View>
        <Pressable style={styles.contributeButton} onPress={onContributePress}>
          <Text style={styles.contributeText}>+ Tabung</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default function SavingsScreen() {
  const { session, setGlobalLoading, isGlobalLoading } = useAuth();
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [isContributeModalVisible, setContributeModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingGoal | null>(null);

  const fetchData = async () => {
    if (!session?.user) return;
    setGlobalLoading(true, "Memuat Tabungan...");
    try {
      const data = await getSavingGoals(session.user.id);
      if (data) setGoals(data);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setGlobalLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, [session]));

  const handleSuccess = () => {
    setCreateModalVisible(false);
    setContributeModalVisible(false);
    setEditModalVisible(false);
    setSelectedGoal(null);
    fetchData(); // Refresh data
  };

  const openContributeModal = (goal: SavingGoal) => {
    setSelectedGoal(goal);
    setContributeModalVisible(true);
  };

  const handleDeleteGoal = (goalId: string) => {
    Alert.alert(
      "Hapus Impian",
      "Menghapus impian ini tidak akan menghapus riwayat transaksi kontribusi Anda. Lanjutkan?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSavingGoal(goalId);
              Alert.alert("Sukses", "Impian telah dihapus.");
              fetchData();
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ]
    );
  };

  const handleLongPress = (goal: SavingGoal) => {
    setSelectedGoal(goal);
    Alert.alert(
      `Aksi untuk "${goal.goal_name}"`,
      "Pilih aksi yang diinginkan",
      [
        {
          text: "Batal",
          style: "cancel",
          onPress: () => setSelectedGoal(null),
        },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => handleDeleteGoal(goal.id),
        },
        { text: "Edit", onPress: () => setEditModalVisible(true) },
        {
          text: "Tambah Tabungan",
          onPress: () => setContributeModalVisible(true),
        },
      ]
    );
  };

  return (
    <>
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient colors={['#4A90E2', '#0ABAB5']} style={StyleSheet.absoluteFill} />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Saving & Goals</Text>
                <Pressable onPress={() => setCreateModalVisible(true)} style={styles.addButton}>
                <Ionicons name="add" size={24} color="#fff" />
                </Pressable>
            </View>

            <FlatList
                data={goals}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Pressable onLongPress={() => handleLongPress(item)} onPress={() => openContributeModal(item)}>
                        <SavingGoalCard
                          goal={item}
                          onContributePress={() => openContributeModal(item)}
                        />
                    </Pressable>
                )}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                !isGlobalLoading ? (
                    <View style={styles.center}>
                        <Text style={styles.emptyText}>Buat impian pertamamu!</Text>
                    </View>
                ) : null
                }
            />
        </SafeAreaView>

        {/* ... (Semua modal tidak berubah) ... */}
        <CreateGoalModal visible={isCreateModalVisible} onClose={() => setCreateModalVisible(false)} onSuccess={handleSuccess} />
        <AddContributionModal visible={isContributeModalVisible} onClose={() => setContributeModalVisible(false)} onSuccess={handleSuccess} goal={selectedGoal} />
        <EditGoalModal visible={isEditModalVisible} onClose={() => setEditModalVisible(false)} onSuccess={handleSuccess} goalToEdit={selectedGoal} />
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  addButton: {
    backgroundColor: Colors.light.card,
    padding: 10,
    borderRadius: 20,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    color: Colors.light.icon,
    fontSize: 16,
  },
  goalCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    gap: 8,
  },
  goalName: {
    color: Colors.light.text,
    fontSize: 20,
    fontWeight: "bold",
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: Colors.light.background,
    borderRadius: 5,
    overflow: "hidden",
    marginVertical: 10,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.light.secondary,
    borderRadius: 5,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountText: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: "600",
  },
  targetText: {
    color: Colors.light.icon,
    fontSize: 12,
  },
  contributeButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  contributeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
});
