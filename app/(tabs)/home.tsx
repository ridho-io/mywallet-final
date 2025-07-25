// app/(tabs)/home.tsx
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { MotiText, MotiView } from "moti";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { getTransactionsForMonth, Transaction, setBudget } from "../../lib/database";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import { supabase } from "@/lib/supabase";
import AiAssistantModal from "@/components/specific/AiAssistantModal";
import ProfileModal from "@/components/specific/ProfileModal";

// Komponen untuk item transaksi
const TransactionItem = ({ item }: { item: Transaction }) => {
  const getIconInfo = (category: string) => {
    const cat = category.toLowerCase();
    if (
      cat.includes("drink") ||
      cat.includes("minuman") ||
      cat.includes("minum")
    )
      return { name: "cafe", color: "#4A90E2" };
    if (
      cat.includes("food") ||
      cat.includes("makanan") ||
      cat.includes("makan")
    )
      return { name: "fast-food", color: "#00704A" };
    if (cat.includes("transport") || cat.includes("transportasi"))
      return { name: "bus", color: "#F5A623" };
    if (
      cat.includes("gaji") ||
      cat.includes("pendapatan") ||
      cat.includes("salary") ||
      item.type === "income"
    )
      return { name: "wallet", color: Colors.light.secondary };
    return { name: "cash", color: Colors.light.icon };
  };

  const icon = getIconInfo(item.category);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 300 }}
      style={styles.transactionItem}
    >
      <View
        style={[
          styles.transactionIconContainer,
          { backgroundColor: `${icon.color}90` },
        ]}
      >
        <Ionicons name={icon.name as any} size={24} color={Colors.light.white} />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle}>{item.category}</Text>
        <Text style={styles.transactionDate}>
          {new Date(item.created_at!).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          })}
        </Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          {
            color:
              item.type === "income" ? Colors.light.success : Colors.light.danger,
          },
        ]}
      >
        {item.type === "income" ? "+" : "-"}
        {new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(item.amount)}
      </Text>
    </MotiView>
  );
};

// Komponen untuk grafik mini di Beranda
const MiniBarChart = ({ data }: { data: Transaction[] }) => {
  const weeklyExpenses = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let dailyTotals = Array(7)
      .fill(0)
      .map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return { label: days[d.getDay()], total: 0 };
      })
      .reverse();

    data.forEach((tx) => {
      if (tx.type === "expense") {
        const txDate = new Date(tx.created_at!);
        const today = new Date();
        const diffDays = Math.floor(
          (today.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays >= 0 && diffDays < 7) {
          const correctIndexInArray = 6 - diffDays;
          if (dailyTotals[correctIndexInArray]) {
            dailyTotals[correctIndexInArray].total += tx.amount;
          }
        }
      }
    });
    return dailyTotals;
  }, [data]);

  const maxValue = Math.max(...weeklyExpenses.map((d) => d.total), 1);

  return (
    <View style={styles.chartContainer}>
      {weeklyExpenses.map((day, index) => {
        const height = (day.total / maxValue) * 100;
        return (
          <View key={index} style={styles.barColumn}>
            <View style={styles.barWrapper}>
              <MotiView
                from={{ height: "0%" }}
                animate={{ height: `${height}%` }}
                transition={{
                  type: "timing",
                  duration: 500,
                  delay: index * 50,
                }}
                style={styles.bar}
              />
            </View>
            <Text style={styles.barLabel}>{day.label}</Text>
          </View>
        );
      })}
    </View>
  );
};

const InsightCard = ({ text }: { text: string }) => (
    <View style={styles.insightCard}>
        <Ionicons name="bulb-outline" size={24} color="#F5A623" />
        <Text style={styles.insightText}>{text}</Text>
    </View>
);

export default function HomeScreen() {
  const { session, setGlobalLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAiModalVisible, setAiModalVisible] = useState(false);
  const [isProfileModalVisible, setProfileModalVisible] = useState(false);

  const runOnboarding = async () => {
    if (!session?.user) return;

    console.log("Menjalankan proses onboarding untuk pengguna baru...");

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-12
    const userId = session.user.id;
    
    // Buat beberapa budget default
    const defaultBudgets = [
      { category: 'Makanan', amount: 0 },
      { category: 'Transportasi', amount: 0 },
      { category: 'Hiburan', amount: 0 },
      { category: 'Tagihan', amount: 0 },
    ];

    try {
      for (const budget of defaultBudgets) {
        await setBudget({
          user_id: userId,
          category: budget.category,
          amount: budget.amount,
          year: year,
          month: month,
        });
      }
      
      // Setelah selesai, perbarui metadata pengguna
      await supabase.auth.updateUser({ data: { is_new_user: false } });
      console.log("Onboarding selesai. Metadata pengguna diperbarui.");

    } catch (error) {
      console.error("Gagal saat proses onboarding:", error);
    }
  };

  const balance = totalIncome - totalExpense;



  const loadDashboardData = useCallback(async () => {
    if (!session?.user) return;

    try {
      const now = new Date();
      const monthlyTxs = await getTransactionsForMonth(session.user.id, now.getFullYear(), now.getMonth());

      if (monthlyTxs) {
        let income = 0;
        let expense = 0;
        monthlyTxs.forEach(tx => tx.type === 'income' ? income += tx.amount : expense += tx.amount);
        setTotalIncome(income);
        setTotalExpense(expense);
        setTransactions([...monthlyTxs].sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()));
      }
    } catch (error) {
      console.error("Gagal memuat data dasbor:", error);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        if (session) {
          setGlobalLoading(true, "Memuat Dasbor..."); // <-- TAMPILKAN LOADING
          try {
            if (session.user.user_metadata?.is_new_user) {
              await runOnboarding();
            }
            await loadDashboardData();
          } catch (error) {
            console.error(error);
          } finally {
            setGlobalLoading(false); // <-- SELALU SEMBUNYIKAN LOADING
          }
        }
      };
      loadData();
    }, [session, loadDashboardData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, [session, loadDashboardData]);

  // if (loading) {
  //   return (
  //     <View style={styles.center}>
  //       <ActivityIndicator size="large" color={Colors.light.tint} />
  //     </View>
  //   );
  // }

  return (
    <>
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.light.tint}
          />
        }
      >
        {/* Header */}
        <LinearGradient colors={['#4A90E2', Colors.light.background, Colors.light.background]} style={StyleSheet.absoluteFill} />
        <View style={styles.header}>
          <Pressable onPress={() => setProfileModalVisible(true)} style={{ flex: 2 }}>
            <Ionicons name="person-circle" size={50} color={Colors.light.white} />
          </Pressable>
          <Text style={styles.informationCard}>
            
          </Text>
          <Pressable onPress={() => setAiModalVisible(true)} style={{ flex: 2 }}>
            <LottieView
              source={require("../../assets/animations/ai.json")}
              autoPlay
              loop
              style={{ width: 60, height: 60 }}
            />
          </Pressable>
        </View>


        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Your balance</Text>
          <MotiText
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
          <Text style={styles.balanceAmount}>
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(balance)}
          </Text>
          </MotiText>
        </View>

        <View style={styles.incomeExpenseCard}>
            <View style={[styles.incomeExpenseBox, {flex: 3}]}>
              <Ionicons
                name="arrow-down-circle"
                size={25}
                color={Colors.light.success}
              />
              <Text style={styles.incomeExpenseText}>
                Rp {new Intl.NumberFormat("id-ID").format(totalIncome)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={[styles.incomeExpenseBox, {flex: 3}]}>
              <Ionicons
                name="arrow-up-circle"
                size={25}
                color={Colors.light.danger}
              />
              <Text style={styles.incomeExpenseText}>
                Rp {new Intl.NumberFormat("id-ID").format(totalExpense)}
              </Text>
            </View>
        </View>

        {/* Weekly Expense Chart Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.chartTitle}>Weekly Expenses</Text>
            <Pressable onPress={() => router.push("/(tabs)/reports")}>
              <Text style={styles.seeAllText}>Details</Text>
            </Pressable>
          </View>
          <MiniBarChart data={transactions} />
        </View>


        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Recent Transactions</Text>
            <Pressable onPress={() => router.push("/(tabs)/transactions")}>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </View>
          {transactions.length > 0 ? (
            transactions
              .slice(0, 5)
              .map((tx) => <TransactionItem key={tx.id} item={tx} />)
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No transactions this month.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
    <AiAssistantModal 
      visible={isAiModalVisible}
      onClose={() => setAiModalVisible(false)}
    />
    <ProfileModal 
      visible={isProfileModalVisible}
      onClose={() => setProfileModalVisible(false)}
    />
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
  container: { paddingBottom: 100 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 30,
    top: 0,
  },
  informationCard: {
    flex: 10,
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.light.text,
    textAlign: "center",
  },
  card: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingVertical: 40,
    paddingHorizontal: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  balanceCard: { alignItems: "flex-start", marginBottom: 20, paddingHorizontal: 20, paddingVertical: 20 },
  balanceLabel: { fontSize: 16, marginBottom: 20, color: "rgba(255, 255, 255, 0.8)" },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: Colors.light.white,
    marginTop: 8,
  },
  divider: {
    width: 2,
    height: "100%",
    backgroundColor: Colors.light.white,
  },
  incomeExpenseCard: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.light.tint,
    borderRadius: 20,
    padding: 10,
    paddingHorizontal: 15,
    marginBottom: -20,
    marginHorizontal: 30,
    zIndex: 99,
    gap: 5
  },
  incomeExpenseBox: { flexDirection: "row", alignItems: "center", gap: 6 },
  incomeExpenseText: {
    fontSize: 14,
    color: Colors.light.white,
    fontWeight: "600",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: Colors.light.tint },
  chartTitle: { fontSize: 18, fontWeight: "bold", color: Colors.light.tint },
  seeAllText: { fontSize: 16, color: Colors.light.tint, fontWeight: "600", textDecorationLine: "underline" },
  chartContainer: {
    height: 120,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  barColumn: { flex: 1, alignItems: "center", gap: 8 },
  barWrapper: {
    flex: 1,
    width: 13,
    backgroundColor: `${Colors.light.secondary}50`,
    borderRadius: 6,
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    backgroundColor: Colors.light.secondary,
    borderRadius: 6,
  },
  barLabel: { fontSize: 12, color: Colors.light.icon },
  transactionsSection: { 
    backgroundColor: Colors.light.background,
    padding: 30
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  transactionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  transactionDetails: { flex: 1 },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.black,
  },
  transactionDate: { fontSize: 14, color: Colors.light.icon, marginTop: 2 },
  transactionAmount: { fontSize: 16, fontWeight: "600" },
  emptyCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  emptyText: { textAlign: "center", color: Colors.light.icon, fontSize: 16 },

  insightCard: {
        backgroundColor: '#2C2C2E',
        borderRadius: 15,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 20,
        marginTop: 10,
        gap: 10,
    },
    insightText: {
        color: 'white',
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    }
});