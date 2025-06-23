// components/specific/AddTransactionModal.tsx
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, Alert, Pressable } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { addTransaction } from '../../lib/database';
import AnimatedButton from '../core/AnimatedButton';

type AddTransactionModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void; // Callback untuk memberitahu parent bahwa data berhasil ditambah
};

export default function AddTransactionModal({ visible, onClose, onSuccess }: AddTransactionModalProps) {
  const { session } = useAuth();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!amount || !category || !session?.user) {
      Alert.alert('Error', 'Jumlah dan Kategori wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      await addTransaction({
        amount: parseFloat(amount),
        category,
        description,
        type,
        user_id: session.user.id,
      });
      Alert.alert('Sukses', 'Transaksi berhasil ditambahkan!');
      onSuccess(); // Panggil callback sukses
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
        <Text style={styles.title}>Tambah Transaksi</Text>

        {/* Input Jumlah */}
        <TextInput
          placeholderTextColor="#6e6e6e"
          style={styles.input}
          placeholder="Rp 0"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        {/* Input Kategori */}
        <TextInput
          placeholderTextColor="#6e6e6e"
          style={styles.input}
          placeholder="Kategori (e.g., Makanan, Transportasi)"
          value={category}
          onChangeText={setCategory}
        />
        {/* Input Deskripsi */}
        <TextInput
          placeholderTextColor="#6e6e6e"
          style={styles.input}
          placeholder="Deskripsi (opsional)"
          value={description}
          onChangeText={setDescription}
        />

        {/* Pemilih Tipe */}
        <View style={styles.typeSelector}>
          <Pressable
            style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
            onPress={() => setType('expense')}
          >
            <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>Pengeluaran</Text>
          </Pressable>
          <Pressable
            style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
            onPress={() => setType('income')}
          >
            <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>Pemasukan</Text>
          </Pressable>
        </View>

        {/* Tombol Simpan */}
        <AnimatedButton onPress={handleSave}>
          <View style={styles.saveButton}>
            <Text style={styles.saveButtonText}>{loading ? 'Menyimpan...' : 'Simpan'}</Text>
          </View>
        </AnimatedButton>
      </View>
    </Modal>
  );
}

// Tambahkan styling yang sesuai
const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#f8f8f8',
        padding: 20,
        paddingBottom: 40,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#EFEFEF',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        fontSize: 16,
    },
    typeSelector: {
        flexDirection: 'row',
        marginBottom: 20,
        height: 50
    },
    typeButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EFEFEF',
        borderWidth: 2,
        borderColor: 'transparent'
    },
    typeButtonActive: {
        borderColor: '#007AFF',
    },
    typeText: {
        fontSize: 16,
        fontWeight: '600'
    },
    typeTextActive: {
        color: '#007AFF'
    },
    saveButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});