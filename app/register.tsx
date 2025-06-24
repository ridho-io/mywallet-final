// app/register.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, SafeAreaView, Pressable, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import AnimatedButton from '../components/core/AnimatedButton';
import { Colors } from '@/constants/Colors';
import LottieView from 'lottie-react-native';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords tidak cocok.');
      return;
    }
    setLoading(true);

    // Mendaftar pengguna baru
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (signUpError) {
      setLoading(false);
      Alert.alert('Error Pendaftaran', signUpError.message);
      return;
    }

    if (signUpData.user) {
      // --- BAGIAN BARU: Tandai sebagai pengguna baru ---
      const { error: updateError } = await supabase.auth.updateUser({
        data: { is_new_user: true } 
      });

      if (updateError) {
        console.warn("Gagal menandai pengguna baru:", updateError.message);
        // Tetap lanjutkan meskipun gagal, ini bukan error kritis
      }
      // --- AKHIR BAGIAN BARU ---

      setLoading(false);
      Alert.alert(
        'Pendaftaran Berhasil',
        'Silakan periksa email Anda untuk verifikasi sebelum login.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>

            <LottieView source={require('../assets/animations/finance.json')} autoPlay loop style={styles.lottie} />
            
            <Text style={styles.title}>Buat Akun</Text>
            <Text style={styles.subtitle}>Mulai kelola keuanganmu hari ini!</Text>

            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="Alamat Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholderTextColor={Colors.light.icon}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholderTextColor={Colors.light.icon}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Konfirmasi Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    placeholderTextColor={Colors.light.icon}
                />
                <View style={{height: 20}}/>
                <AnimatedButton onPress={handleSignUp}>
                    <View style={styles.button}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Daftar</Text>}
                    </View>
                </AnimatedButton>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Sudah punya akun? </Text>
                <Link href="/login" asChild>
                    <Pressable>
                        <Text style={styles.link}>Masuk</Text>
                    </Pressable>
                </Link>
            </View>
        </ScrollView>
    </SafeAreaView>
  );
}

// ... Styles tidak berubah
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    lottie: {
    width: 330,
    height: 300,
    alignSelf: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        color: Colors.light.black,
        marginBottom: 8,
        marginTop: -40
    },
    subtitle: {
        fontSize: 18,
        textAlign: 'center',
        color: Colors.light.icon,
        marginBottom: 50,
    },
    form: {
        width: '100%',
    },
    input: {
        backgroundColor: Colors.light.background,
        borderRadius: 12,
        padding: 18,
        marginBottom: 16,
        fontSize: 16,
        color: Colors.light.black,
    },
    button: {
        backgroundColor: Colors.light.tint,
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 16,
        color: Colors.light.icon,
    },
    link: {
        fontSize: 16,
        color: Colors.light.tint,
        fontWeight: 'bold',
    },
});