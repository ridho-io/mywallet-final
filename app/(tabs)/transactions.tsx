// app/(tabs)/transactions.tsx
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AddTransactionModal from "../../components/specific/AddTransactionModal";
import EditTransactionModal from "../../components/specific/EditTransactionModal"; // Import modal edit
import { useAuth } from "../../contexts/AuthContext";
import { getTransactions, deleteTransaction, Transaction } from "../../lib/database";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView, useAnimationState } from "moti";

// Komponen TransactionItem tetap sama, hanya akan dibungkus Pressable di FlatList
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
  const { session, setGlobalLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // State untuk modal
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Animation state for screen scaling and shifting down when modal opens/closes
  const screenAnimationState = useAnimationState({
    default: {
      scale: 1,
      translateY: 0,
    },
    modalOpen: {
      scale: 0.98,
      translateY: 10,
    },
  });

  const handleOpenAddModal = () => {
    screenAnimationState.transitionTo('modalOpen');
    setAddModalVisible(true);
  };

  const handleCloseAddModal = () => {
    screenAnimationState.transitionTo('default');
    setAddModalVisible(false);
  };

  const handleOpenEditModal = () => {
    screenAnimationState.transitionTo('modalOpen');
    setEditModalVisible(true);
  };

  const handleCloseEditModal = () => {
    screenAnimationState.transitionTo('default');
    setEditModalVisible(false);
    setSelectedTransaction(null);
  };

  const PAGE_SIZE = 20;

  const fetchTxs = async (currentPage: number, isInitialLoad = false) => {
    if (!session?.user || (!hasMore && !isInitialLoad)) return;

    if (isInitialLoad) {
      setGlobalLoading(true, "Memuat Transaksi...");
    } else {
      setLoadingMore(true);
    }

    try {
      const data = await getTransactions(session.user.id, currentPage, PAGE_SIZE);
      if (data) {
        setTransactions(prev => currentPage === 0 ? data : [...prev, ...data]);
        if (data.length < PAGE_SIZE) {
          setHasMore(false);
        }
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      if (isInitialLoad) {
        setGlobalLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  const handleRefresh = useCallback(() => {
    setPage(0);
    setHasMore(true);
    setTransactions([]);
    fetchTxs(0, true);
  }, [session]);

  useFocusEffect(handleRefresh);

  const loadMoreItems = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTxs(nextPage, false);
    }
  };
  
  const handleDeleteTransaction = (transactionId: string) => {
    Alert.alert(
      "Hapus Transaksi",
      "Apakah Anda yakin ingin menghapus transaksi ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTransaction(transactionId);
              Alert.alert("Sukses", "Transaksi telah dihapus.");
              handleRefresh(); // Muat ulang data
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ]
    );
  };

  const handleLongPress = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    Alert.alert(
      "Aksi",
      `Pilih aksi untuk transaksi "${transaction.category}"`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => handleDeleteTransaction(transaction.id!),
        },
        {
          text: "Edit",
          onPress: handleOpenEditModal,
        },
      ]
    );
  };
  
  return (
    <>
    <LinearGradient colors={['#4A90E2', '#0ABAB5']} style={StyleSheet.absoluteFill} />
    <MotiView 
        state={screenAnimationState} 
        style={styles.container}
        transition={{ type: 'timing', duration: 550 }}
      >
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        <Pressable onPress={handleOpenAddModal} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id!}
        renderItem={({ item }) => (
          <Pressable onLongPress={() => handleLongPress(item)}>
            <TransactionItem item={item} />
          </Pressable>
        )}
        contentContainerStyle={styles.list}
        onEndReached={loadMoreItems}
        onEndReachedThreshold={0.5}
        onRefresh={handleRefresh}
        refreshing={loading && transactions.length === 0}
      />
    </SafeAreaView>
    </MotiView>

      <AddTransactionModal
        visible={isAddModalVisible}
        onClose={handleCloseAddModal}
        onSuccess={() => {
          handleCloseAddModal();
          handleRefresh();
        }}
      />
      
      <EditTransactionModal
        visible={isEditModalVisible}
        onClose={handleCloseEditModal}
        onSuccess={() => {
          handleCloseEditModal();
          handleRefresh();
        }}
        transaction={selectedTransaction}
      />
    </>
  );
}

// Stylesheet tidak berubah
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: { flex: 1, borderRadius: 30, overflow: 'hidden' },
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
  emptyText: { color: Colors.light.white, fontSize: 16},
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
    textTransform: 'capitalize',
  },
  transactionDate: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
});