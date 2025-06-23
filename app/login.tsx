// app/login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator, Pressable } from 'react-native';
import { supabase } from '../lib/supabase';
import AnimatedButton from '@/components/core/AnimatedButton';
import { Link, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email and password are required.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('Login Error', error.message);
    // Redirect akan ditangani oleh app/index.tsx secara otomatis
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
            <LottieView source={require('../assets/animations/finance.json')} autoPlay loop style={styles.lottie} />

            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Log in to your account</Text>

            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="Email Address"
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
                <View style={{height: 20}}/>
                <AnimatedButton onPress={handleLogin}>
                    <View style={styles.button}>
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Log In</Text>
                        )}
                    </View>
                </AnimatedButton>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <Link href="/register" asChild>
                    <Pressable>
                        <Text style={styles.link}>Sign up</Text>
                    </Pressable>
                </Link>
            </View>
        </ScrollView>
    </SafeAreaView>
  );
}

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
        color: `${Colors.light.black}80`,
        marginBottom: 40,
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