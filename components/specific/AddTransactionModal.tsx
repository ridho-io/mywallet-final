// components/specific/AddTransactionModal.tsx
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import AnimatedButton from "../core/AnimatedButton";
// --- Impor Fungsi Baru ---
import { getBudgetForCategory, getSpentAmountForCategory } from "../../lib/database";


type AddTransactionModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const AddTransactionModal = ({
  visible,
  onClose,
  onSuccess,
}: AddTransactionModalProps) => {
  const { session } = useAuth();
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);

  const handleSave = async () => {
    if (!amount || !category) {
      Alert.alert("Input Tidak Lengkap", "Jumlah dan Kategori harus diisi.");
      return;
    }
    if (!session?.user) return;
    setLoading(true);

    try {
      const numericAmount = parseFloat(amount);

      // --- LOGIKA PENGECEKAN BUDGET DIMULAI DI SINI ---
      if (type === "expense") {
        const now = new Date();
        const year = now.getFullYear();
        const monthJs = now.getMonth(); // 0-11
        const monthDb = monthJs + 1;   // 1-12 (untuk query ke DB)

        // 1. Cek apakah ada budget untuk kategori ini
        const budget = await getBudgetForCategory(session.user.id, category, year, monthDb);
        
        if (budget) {
          // 2. Jika ada, hitung total yang sudah dibelanjakan
          const spentAmount = await getSpentAmountForCategory(session.user.id, category, year, monthJs);

          // 3. Bandingkan dengan budget
          if (spentAmount + numericAmount > budget.amount) {
            Alert.alert(
              "Budget Melebihi Batas",
              `Transaksi ini akan membuat pengeluaran Anda melebihi budget bulanan untuk kategori "${category}".\n\nBudget: ${formatCurrency(budget.amount)}\nSudah terpakai: ${formatCurrency(spentAmount)}\n\nLanjutkan?`,
              [
                { text: "Batal", style: 'cancel', onPress: () => setLoading(false) },
                { text: "Tetap Simpan", onPress: () => proceedSavingTransaction() }
              ]
            );
            return; // Hentikan proses, tunggu keputusan pengguna
          }
        }
      }
      
      // Jika lolos pengecekan atau bukan 'expense', langsung simpan
      await proceedSavingTransaction();

    } catch (error: any) {
      Alert.alert("Error", error.message);
      setLoading(false);
    }
  };

  // Fungsi untuk melanjutkan penyimpanan setelah pengecekan
  const proceedSavingTransaction = async () => {
    if (!session?.user) return;
    setLoading(true); // Pastikan loading tetap true

    try {
      const { error } = await supabase.from("transactions").insert([
        {
          user_id: session.user.id,
          type,
          amount: parseFloat(amount),
          category,
        },
      ]);
      if (error) throw error;
      
      setAmount("");
      setCategory("");
      onSuccess();
    } catch (error: any) {
      Alert.alert("Error Saat Menyimpan", error.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.modalContainer}>
        <Text style={styles.title}>Add Transaction</Text>
        <View style={styles.typeSelector}>
          <Pressable
            style={[
              styles.typeButton,
              type === "expense" && styles.typeButtonActive,
            ]}
            onPress={() => setType("expense")}
          >
            <Text
              style={[
                styles.typeButtonText,
                type === "expense" && styles.typeButtonTextActive,
              ]}
            >
              Expense
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.typeButton,
              type === "income" && styles.typeButtonActive,
            ]}
            onPress={() => setType("income")}
          >
            <Text
              style={[
                styles.typeButtonText,
                type === "income" && styles.typeButtonTextActive,
              ]}
            >
              Income
            </Text>
          </Pressable>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Rp 0"
          placeholderTextColor="#6e6e6e"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Category (e.g., Food, Transport)"
          placeholderTextColor="#6e6e6e"
          value={category}
          onChangeText={setCategory}
        />
        <AnimatedButton onPress={handleSave}>
          <View style={styles.button}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save Transaction</Text>
            )}
          </View>
        </AnimatedButton>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    modalContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: Colors.light.background,
      padding: 20,
      paddingBottom: 40,
      borderTopLeftRadius: 40,
      borderTopRightRadius: 40,
      gap: 15,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)'
    },
    title: {
      fontSize: 22,
      fontWeight: "bold",
      textAlign: "center",
      color: Colors.light.black,
    },
    typeSelector: {
      flexDirection: "row",
      backgroundColor: `${Colors.light.tint}20`,
      borderRadius: 15,
      padding: 5,
    },
    typeButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
    },
    typeButtonActive: {
      backgroundColor: Colors.light.tint,
    },
    typeButtonText: {
      textAlign: "center",
      fontSize: 16,
      fontWeight: "600",
      color: Colors.light.tint,
    },
    typeButtonTextActive: {
      color: Colors.light.white,
    },
    input: {
      backgroundColor: `${Colors.light.tint}20`,
      color: Colors.light.black,
      borderRadius: 10,
      padding: 15,
      fontSize: 16,
    },
    button: {
      backgroundColor: Colors.light.tint,
      padding: 15,
      borderRadius: 15,
      alignItems: "center",
    },
    buttonText: {
      color: "white",
      fontSize: 18,
      fontWeight: "bold",
    },
  });
  
  export default AddTransactionModal;