// app/index.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import AnimatedButton from '@/components/core/AnimatedButton';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import LottieView from 'lottie-react-native';

export default function WelcomeOrRedirect() {

  // Jika tidak ada sesi, tampilkan halaman onboarding
  return <OnboardingScreen />;
}

const OnboardingScreen = () => {
    const router = useRouter();

    const animation = React.useRef<LottieView>(null);

    return (
        <LinearGradient
            colors={['#50E3C2', '#4A90E2']}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    <LottieView ref={animation} source={require('@/assets/animations/wallet.json')} autoPlay loop style={styles.illustration} />
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>Finance App</Text>
                        <Text style={styles.subtitle}>
                        Carrying out financial transactions with the best security.
                        </Text>
                    </View>
                </View>
                <View style={styles.footer}>
                    <AnimatedButton onPress={() => router.push('/login')}>
                        <View style={styles.button}>
                        <Text style={styles.buttonText}>Get started</Text>
                        </View>
                    </AnimatedButton>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  illustration: {
    width: 400,
    height: 400,
    resizeMode: 'contain',
    marginBottom: -30,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 25,
    paddingHorizontal: 20,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#4A90E2',
    fontSize: 18,
    fontWeight: 'bold',
  },
});