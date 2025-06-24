// app/(tabs)/budget.tsx
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
import SetBudgetModal from "../../components/specific/SetBudgetModal";
import { useAuth } from "../../contexts/AuthContext";
import {
  Budget,
  deleteBudget,
  getBudgetsForMonth,
  getTransactionsForMonth,
  Transaction,
} from "../../lib/database";
import { LinearGradient } from "expo-linear-gradient";

// BudgetCard (tidak berubah)
const BudgetCard = ({ category, budgetAmount, spentAmount }: {category: string, budgetAmount: number, spentAmount: number}) => {
    // ... kode BudgetCard tidak berubah
    const progress = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
    const remaining = budgetAmount - spentAmount;
    const getProgressColor = () => {
      if (progress > 90) return Colors.light.danger;
      if (progress > 70) return "#F5A623"; // Orange
      return Colors.light.secondary;
    };
    return (
      <View style={styles.budgetCard}>
        <Text style={styles.budgetCategory}>{category}</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.spentAmount}>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(spentAmount)}</Text>
          <Text style={styles.budgetAmount}> / {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(budgetAmount)}</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: getProgressColor() }]} />
        </View>
        <Text style={styles.remainingText}>Sisa: {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(remaining)}</Text>
      </View>
    );
};

export default function BudgetScreen() {
  const { session, setGlobalLoading, isGlobalLoading } = useAuth();
  const [isModalVisible, setModalVisible] = useState(false);
  const [budgetInfo, setBudgetInfo] = useState<(Budget & { spentAmount: number })[]>([]);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);

  const loadData = useCallback(async () => {
    if (!session?.user) return;
    setGlobalLoading(true, "Memuat Anggaran...");

    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();

      const budgets: Budget[] | null = await getBudgetsForMonth(session.user.id, year, month + 1);
      const transactions: Transaction[] | null = await getTransactionsForMonth(session.user.id, year, month);
      
      const spendingByCategory: { [key: string]: number } = {};
      if (transactions) {
        transactions.forEach((tx) => {
          if (tx.type === "expense") {
            spendingByCategory[tx.category] = (spendingByCategory[tx.category] || 0) + tx.amount;
          }
        });
      }

      const displayInfo = (budgets || []).map((budget) => ({
        ...budget,
        spentAmount: spendingByCategory[budget.category] || 0,
      }));

      setBudgetInfo(displayInfo);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setGlobalLoading(false);
    }
  }, [session]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleSuccess = () => {
    setModalVisible(false);
    setBudgetToEdit(null); // Reset state edit
    loadData();
  };
  
  const handleDeleteBudget = async (id: string) => {
    Alert.alert("Hapus Budget", "Apakah Anda yakin ingin menghapus budget ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteBudget(id);
            Alert.alert("Sukses", "Budget telah dihapus.");
            loadData();
          } catch (error: any) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };
  
  const handleLongPress = (budget: Budget) => {
    Alert.alert(
      `Budget: ${budget.category}`,
      "Pilih aksi yang diinginkan",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => handleDeleteBudget(budget.id!),
        },
        {
          text: "Edit",
          onPress: () => {
            setBudgetToEdit(budget);
            setModalVisible(true);
          },
        },
      ]
    );
  };
  
  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={["#4A90E2", "#0ABAB5"]} style={StyleSheet.absoluteFill} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Budgeting</Text>
          <Pressable onPress={() => { setBudgetToEdit(null); setModalVisible(true); }} style={styles.addButton}>
            <Ionicons name="add" size={24} color="#fff" />
          </Pressable>
        </View>

        <FlatList
          data={budgetInfo}
          keyExtractor={(item) => item.id!}
          renderItem={({ item }) => (
            <Pressable onLongPress={() => handleLongPress(item)}>
              <BudgetCard
                category={item.category}
                budgetAmount={item.amount}
                spentAmount={item.spentAmount}
              />
            </Pressable>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            !isGlobalLoading ? (
              <View style={styles.center}>
                <Text style={styles.emptyText}>
                  Belum ada budget bulan ini.
                </Text>
              </View>
            ) : null
          }
        />
      </SafeAreaView>

      <SetBudgetModal
        visible={isModalVisible}
        onClose={() => { setModalVisible(false); setBudgetToEdit(null); }}
        onSuccess={handleSuccess}
        budgetToEdit={budgetToEdit}
      />
    </>
  );
}

// Stylesheet tidak berubah
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
  headerTitle: { fontSize: 28, fontWeight: "bold", color: Colors.light.text },
  addButton: {
    backgroundColor: Colors.light.card,
    padding: 10,
    borderRadius: 20,
  },
  list: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: { color: Colors.light.white, fontSize: 16 },
  budgetCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    gap: 8,
  },
  budgetCategory: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.white,
    textTransform: "capitalize",
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  spentAmount: {
    fontSize: 16,
    color: Colors.light.white,
    fontWeight: "600",
  },
  budgetAmount: {
    fontSize: 14,
    color: Colors.light.icon,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 5,
    overflow: "hidden",
    marginVertical: 10,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  remainingText: {
    fontSize: 16,
    color: Colors.light.icon,
    fontStyle: "italic",
    textAlign: "right",
  },
});