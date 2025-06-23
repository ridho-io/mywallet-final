// components/specific/CreateGoalModal.tsx
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, Pressable, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { createSavingGoal } from '../../lib/database';
import AnimatedButton from '../core/AnimatedButton';

type CreateGoalModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const CreateGoalModal = ({ visible, onClose, onSuccess }: CreateGoalModalProps) => {
    const { session } = useAuth();
    const [name, setName] = useState('');
    const [target, setTarget] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if(!name || !target || !session?.user) {
            Alert.alert("Input Tidak Lengkap", "Nama impian dan target harus diisi.");
            return;
        }
        setLoading(true);
        try {
            await createSavingGoal({ goal_name: name, target_amount: parseFloat(target), user_id: session.user.id });
            onSuccess();
            setName('');
            setTarget('');
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
                <Text style={styles.title}>Buat Impian Baru</Text>
                <TextInput placeholderTextColor="#6e6e6e" style={styles.input} placeholder="Nama Impian (e.g., Laptop Baru)" value={name} onChangeText={setName} />
                <TextInput placeholderTextColor="#6e6e6e" style={styles.input} placeholder="Target (e.g., 20000000)" value={target} onChangeText={setTarget} keyboardType='numeric' />
                <AnimatedButton onPress={handleSave}>
                    <View style={styles.button}>
                        <Text style={styles.buttonText}>{loading ? "Menyimpan..." : "Simpan"}</Text>
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
    input: { backgroundColor: '#EFEFEF', borderRadius: 10, padding: 15, fontSize: 16 },
    button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 15, alignItems: 'center' },
    buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default CreateGoalModal;