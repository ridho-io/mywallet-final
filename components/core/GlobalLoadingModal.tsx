// components/core/GlobalLoadingModal.tsx
import React from 'react';
import { Modal, StyleSheet, View, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/Colors';

type Props = {
  visible: boolean;
  message?: string;
};

export default function GlobalLoadingModal({ visible, message = "Memproses..." }: Props) {
  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
    >
        <View style={styles.backdrop} />
      <BlurView intensity={20} tint="dark" style={styles.absolute}>
        <View style={styles.container}>
          <View style={styles.card}>
            <LottieView
              source={require('../../assets/animations/loading.json')} // GANTI DENGAN FILE LOTTIE ANDA
              autoPlay
              loop
              style={styles.lottie}
            />
            <Text style={styles.message}>{message}</Text>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  absolute: {
    ...StyleSheet.absoluteFillObject,
  },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 100,
  },
  card: {
    backgroundColor: 'rgba(50, 50, 50, 0.8)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  lottie: {
    width: 120,
    height: 120,
  },
  message: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: '600',
  },
});