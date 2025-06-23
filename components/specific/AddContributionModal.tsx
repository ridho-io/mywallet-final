// components/specific/AddContributionModal.tsx
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, Pressable, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { addContribution, SavingGoal } from '../../lib/database';
import AnimatedButton from '../core/AnimatedButton';
import { Colors } from 'react-native/Libraries/NewAppScreen';

type AddContributionModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goal: SavingGoal | null;
};

const AddContributionModal = ({ visible, onClose, onSuccess, goal }: AddContributionModalProps) => {
    const { session } = useAuth();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    
    const handleSave = async () => {
        if(!amount || !goal || !session?.user) {
            Alert.alert("Input Tidak Lengkap", "Jumlah tabungan harus diisi.");
            return;
        }
        setLoading(true);
        try {
            await addContribution(goal.id, session.user.id, parseFloat(amount));
            onSuccess();
            setAmount('');
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    }
    
    return (
        <Modal visible={visible} transparent={true} animationType='slide' onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose}/>
            <View style={styles.modalContainer}>
                <Text style={styles.title}>Tabung untuk "{goal?.goal_name}"</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Jumlah yang ditabung"
                    placeholderTextColor="#6e6e6e"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType='numeric'
                />
                <AnimatedButton onPress={handleSave}>
                    <View style={styles.button}>
                        <Text style={styles.buttonText}>{loading ? "Menyimpan..." : "Tambah Tabungan"}</Text>
                    </View>
                </AnimatedButton>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#f8f8f8', padding: 20, paddingBottom: 40, borderTopLeftRadius: 24, borderTopRightRadius: 24, gap: 15 },
    title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
    input: { backgroundColor: '#EFEFEF', color: Colors.light.black, borderRadius: 10, padding: 15, fontSize: 16 },
    button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 15, alignItems: 'center' },
    buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default AddContributionModal;