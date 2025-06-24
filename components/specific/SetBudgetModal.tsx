// components/specific/SetBudgetModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, Alert, Pressable } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { setBudget, Budget } from '../../lib/database';
import AnimatedButton from '../core/AnimatedButton';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  budgetToEdit?: Budget | null; // Properti baru untuk mode edit
};

export default function SetBudgetModal({ visible, onClose, onSuccess, budgetToEdit }: Props) {
  const { session } = useAuth();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const isEditing = !!budgetToEdit;

  // Mengisi form jika dalam mode edit
  useEffect(() => {
    if (isEditing) {
      setAmount(String(budgetToEdit.amount));
      setCategory(budgetToEdit.category);
    } else {
      // Reset form jika modal dibuka untuk membuat baru
      setAmount('');
      setCategory('');
    }
  }, [budgetToEdit, visible]);

  const handleSave = async () => {
    if (!amount || !category || !session?.user) {
      Alert.alert('Error', 'Jumlah dan Kategori wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      const now = new Date();
      await setBudget({
        amount: parseFloat(amount),
        category: category.trim(),
        user_id: session.user.id,
        year: isEditing ? budgetToEdit.year : now.getFullYear(),
        month: isEditing ? budgetToEdit.month : now.getMonth() + 1,
      });
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
            <Text style={styles.title}>{isEditing ? 'Edit Budget' : 'Atur Budget'}</Text>
            <TextInput 
              placeholderTextColor="#6e6e6e" 
              style={[styles.input, isEditing && styles.inputDisabled]} 
              placeholder="Kategori (e.g., Makanan)" 
              value={category} 
              onChangeText={setCategory}
              editable={!isEditing} // Kategori tidak bisa diubah saat edit
            />
            <TextInput 
              placeholderTextColor="#6e6e6e" 
              style={styles.input} 
              placeholder="Jumlah Budget (e.g., 500000)" 
              keyboardType="numeric" 
              value={amount} 
              onChangeText={setAmount}
            />
            <AnimatedButton onPress={handleSave}>
                <View style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>{loading ? 'Menyimpan...' : 'Simpan'}</Text>
                </View>
            </AnimatedButton>
        </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#f8f8f8', padding: 20, paddingBottom: 40, borderTopLeftRadius: 24, borderTopRightRadius: 24, gap: 15 },
    title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
    input: { backgroundColor: '#EFEFEF', borderRadius: 10, padding: 15, fontSize: 16, color: 'black' },
    inputDisabled: {
      backgroundColor: '#DCDCDC',
      color: '#A0A0A0',
    },
    saveButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 15, alignItems: 'center' },
    saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});