// components/specific/EditTransactionModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { updateTransaction, Transaction } from '../../lib/database'; // Ganti addTransaction dengan updateTransaction
import AnimatedButton from '../core/AnimatedButton';
import { Colors } from '@/constants/Colors';

type EditTransactionModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transaction: Transaction | null; // Menerima data transaksi yang akan diedit
};

export default function EditTransactionModal({ visible, onClose, onSuccess, transaction }: EditTransactionModalProps) {
  const { session } = useAuth();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [loading, setLoading] = useState(false);

  // Mengisi form dengan data transaksi saat modal dibuka
  useEffect(() => {
    if (transaction) {
      setAmount(String(transaction.amount));
      setCategory(transaction.category);
      setType(transaction.type);
    }
  }, [transaction]);

  const handleSaveChanges = async () => {
    if (!amount || !category || !transaction) {
      Alert.alert('Error', 'Jumlah dan Kategori wajib diisi.');
      return;
    }
    if (!session?.user) return;
    setLoading(true);

    try {
      await updateTransaction(transaction.id!, {
        amount: parseFloat(amount),
        category,
        type,
      });
      Alert.alert('Sukses', 'Transaksi berhasil diperbarui!');
      onSuccess();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
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
        <AnimatedButton onPress={handleSaveChanges}>
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
}

// Gunakan style yang mirip dengan modal tambah
const styles = StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: Colors.light.background,
      padding: 20,
      paddingBottom: 40,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
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