// app/(tabs)/transactions.tsx
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AddTransactionModal from "../../components/specific/AddTransactionModal";
import { useAuth } from "../../contexts/AuthContext";
import { getTransactions, Transaction } from "../../lib/database";
import { LinearGradient } from "expo-linear-gradient";
import { rgbaColor } from "react-native-reanimated/lib/typescript/Colors";

// Komponen TransactionItem dengan UI BARU
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
    if (
      cat.includes("gaji") ||
      cat.includes("pendapatan") ||
      cat.includes("salary") ||
      item.type === "income"
    )
      return { name: "wallet", color: Colors.light.success };
    if (cat.includes("pengeluaran"))
      return { name: "wallet-outline", color: Colors.light.text };
    return { name: "cash", color: Colors.light.icon };
  };
  const icon = getIconInfo(item.category);

  return (
    <View style={styles.transactionItem}>
      <View
        style={[
          styles.transactionIconContainer,
          { backgroundColor: `${icon.color}60` },
        ]}
      >
        <Ionicons name={icon.name as any} size={24} color={Colors.light.white} />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle}>{item.category}</Text>
        <Text style={styles.transactionDate}>
          {new Date(item.created_at!).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
          })}
        </Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          {
            color:
              item.type === "income"
                ? Colors.light.success
                : Colors.light.danger,
          },
        ]}
      >
        {item.type === "income" ? "+" : "-"}
        {new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(item.amount)}
      </Text>
    </View>
  );
};

export default function TransactionsScreen() {
  // === LOGIKA ASLI DARI REPOSITORY ANDA DIKEMBALIKAN ===
  const { session } = useAuth();
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

  const PAGE_SIZE = 20;

  const fetchTxs = async (currentPage: number, isInitialLoad = false) => {
    if (!session?.user) return;
    // Guard untuk mencegah fetch jika sudah tidak ada data lagi (kecuali initial load)
    if (!hasMore && !isInitialLoad) return;

    if (currentPage > 0) setLoadingMore(true);
    else setLoading(true);

    try {
      const data = await getTransactions(
        session.user.id,
        currentPage,
        PAGE_SIZE
      );

      if (data) {
        setTransactions((prev) =>
          currentPage === 0 ? data : [...prev, ...data]
        );
        if (data.length < PAGE_SIZE) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreItems = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTxs(nextPage);
    }
  };

  const handleRefresh = () => {
    setPage(0);
    setHasMore(true);
    fetchTxs(0, true);
  };

  useFocusEffect(
    useCallback(() => {
      handleRefresh();
    }, [session])
  );

  const handleSuccessAdd = () => {
    setModalVisible(false);
    handleRefresh();
  };
  // === AKHIR DARI LOGIKA ASLI ===

  // Tampilan JSX menggunakan UI BARU
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#4A90E2', '#0ABAB5']} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        <Pressable
          onPress={() => setModalVisible(true)}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id!}
        renderItem={({ item }) => <TransactionItem item={item} />}
        contentContainerStyle={styles.list}
        // Menggunakan bug fix dari sebelumnya yang cocok dengan logika asli Anda
        onEndReached={hasMore ? loadMoreItems : null}
        onEndReachedThreshold={0.5}
        onRefresh={handleRefresh}
        refreshing={loading && transactions.length === 0}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              style={{ marginVertical: 20 }}
              color={Colors.light.tint}
            />
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.center}>
              <Text style={styles.emptyText}>Belum ada transaksi.</Text>
            </View>
          ) : null
        }
      />

      <AddTransactionModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={handleSuccessAdd}
      />
    </SafeAreaView>
  );
}

// Stylesheet untuk UI BARU
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
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
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: { color: Colors.light.icon, fontSize: 16},
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  transactionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
  },
  transactionDate: {
    fontSize: 14,
    color: Colors.light.white,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
