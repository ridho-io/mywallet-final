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
import { getSavingGoals, SavingGoal } from "../../lib/database";
import { LinearGradient } from "expo-linear-gradient";

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
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<SavingGoal[]>([]);

  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [isContributeModalVisible, setContributeModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingGoal | null>(null);

  const fetchData = async () => {
    if (!session?.user) return setLoading(false);
    setLoading(true);
    try {
      const data = await getSavingGoals(session.user.id);
      if (data) setGoals(data);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [session])
  );

  const handleSuccess = () => {
    setCreateModalVisible(false);
    setContributeModalVisible(false);
    setSelectedGoal(null);
    fetchData(); // Refresh data
  };

  const openContributeModal = (goal: SavingGoal) => {
    setSelectedGoal(goal);
    setContributeModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#4A90E2', '#0ABAB5']} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saving & Goals</Text>
        <Pressable
          onPress={() => setCreateModalVisible(true)}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator
          style={{ marginTop: 50 }}
          size="large"
          color={Colors.light.tint}
        />
      ) : (
        <FlatList
          data={goals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SavingGoalCard
              goal={item}
              onContributePress={() => openContributeModal(item)}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>
                Start creating your first saving goal!
              </Text>
            </View>
          }
        />
      )}

      <CreateGoalModal
        visible={isCreateModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSuccess={handleSuccess}
      />
      <AddContributionModal
        visible={isContributeModalVisible}
        onClose={() => setContributeModalVisible(false)}
        onSuccess={handleSuccess}
        goal={selectedGoal}
      />
    </SafeAreaView>
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
