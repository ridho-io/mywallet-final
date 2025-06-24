// components/specific/EditGoalModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, Pressable, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { updateSavingGoal, SavingGoal } from '../../lib/database';
import AnimatedButton from '../core/AnimatedButton';

type EditGoalModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goalToEdit: SavingGoal | null;
};

const EditGoalModal = ({ visible, onClose, onSuccess, goalToEdit }: EditGoalModalProps) => {
    const { session } = useAuth();
    const [name, setName] = useState('');
    const [target, setTarget] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (goalToEdit) {
            setName(goalToEdit.goal_name);
            setTarget(String(goalToEdit.target_amount));
        }
    }, [goalToEdit]);

    const handleSave = async () => {
        if(!name || !target || !session?.user || !goalToEdit) {
            Alert.alert("Input Tidak Lengkap", "Nama impian dan target harus diisi.");
            return;
        }
        setLoading(true);
        try {
            await updateSavingGoal(goalToEdit.id, { goal_name: name, target_amount: parseFloat(target) });
            onSuccess();
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
                <Text style={styles.title}>Edit Impian</Text>
                <TextInput placeholderTextColor="#6e6e6e" style={styles.input} placeholder="Nama Impian (e.g., Laptop Baru)" value={name} onChangeText={setName} />
                <TextInput placeholderTextColor="#6e6e6e" style={styles.input} placeholder="Target (e.g., 20000000)" value={target} onChangeText={setTarget} keyboardType='numeric' />
                <AnimatedButton onPress={handleSave}>
                    <View style={styles.button}>
                        <Text style={styles.buttonText}>{loading ? "Menyimpan..." : "Simpan Perubahan"}</Text>
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
    input: { backgroundColor: '#EFEFEF', borderRadius: 10, padding: 15, fontSize: 16, color: 'black' },
    button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 15, alignItems: 'center' },
    buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default EditGoalModal;