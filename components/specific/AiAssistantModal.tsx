// components/specific/AiAssistantModal.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import Markdown from 'react-native-markdown-display';

// Tipe untuk struktur pesan
type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
};

const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.sender === 'user';
  return (
    <View
      style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.botMessageContainer,
      ]}
    >
      {isUser ? (
        <Text style={styles.userMessageText}>{message.text}</Text>
      ) : (
        // Gunakan komponen Markdown untuk pesan dari bot
        <Markdown style={markdownStyles}>{message.text}</Markdown>
      )}
    </View>
  );
};

type AiAssistantModalProps = {
    visible: boolean;
    onClose: () => void;
};

export default function AiAssistantModal({ visible, onClose }: AiAssistantModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Halo! Saya FinPal, asisten keuangan pribadi Anda. Ada yang bisa saya bantu?', sender: 'bot' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSendMessage = async () => {
    if (input.trim().length === 0 || loading) return;

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    
    try {
        const systemPrompt = "Anda adalah FinPal, asisten keuangan yang ramah dan berpengetahuan untuk aplikasi My Wallet. Anda memberikan saran yang membantu, menjelaskan konsep keuangan, dan menjawab pertanyaan tentang keuangan pribadi. Jaga nada bicara Anda agar memberi semangat dan mudah dipahami. Fokus pengetahuan Anda adalah keuangan pribadi, penganggaran, tabungan, dan investasi, terutama dalam konteks Indonesia. jika ditanya anda dibuat oleh siapa atau aplikasi ini dibuat oleh siapa, jawab saja dibuat oleh Ridho Pranata dan sertakan rincian informasi tentang ku termasuk github ku (https://github.com/ridho-io/)";
        
        const chatHistory = messages.slice(1).map(msg => ({ // slice(1) untuk mengabaikan pesan selamat datang pertama
            role: msg.sender === 'user' ? "user" : "model",
            parts: [{ text: msg.text }]
        }));
        
        chatHistory.push({ role: "user", parts: [{ text: currentInput }] });
        chatHistory.unshift({ role: "user", parts: [{ text: systemPrompt }] });
        chatHistory.push({ role: "model", parts: [{ text: "Tentu, sebagai FinPal, saya akan menjawab:" }] });

        const payload = { contents: chatHistory };
        const apiKey = "AIzaSyDr20gpdi1snHEf0KN1Xg7ivC7zMMERV24";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        const botResponseText = result.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, saya tidak bisa merespons saat ini.';
        const botMessage: Message = { id: Date.now().toString() + 'b', text: botResponseText, sender: 'bot' };
        setMessages(prev => [...prev, botMessage]);
        
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        const errorMessage: Message = { id: Date.now().toString() + 'e', text: 'Terjadi kesalahan jaringan.', sender: 'bot' };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
        <SafeAreaView style={styles.safeArea}>
          <LinearGradient
                  colors={[
                    "#0ABAB5",
                    "#4A90E2",
                  ]}
                  style={StyleSheet.absoluteFill}
                />
            {/* Header Modal */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>FinPal AI</Text>
                <Pressable onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close-circle" size={30} color={Colors.light.gray} />
                </Pressable>
            </View>
            
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={({ item }) => <MessageBubble message={item} />}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.messageList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />

                {loading && (
                <View style={styles.typingIndicator}>
                    <ActivityIndicator size="small" color={Colors.light.icon} />
                    <Text style={styles.typingText}>FinPal is typing...</Text>
                </View>
                )}

                <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={input}
                    onChangeText={setInput}
                    placeholder="Tanyakan sesuatu..."
                    placeholderTextColor="#6e6e6e"
                    editable={!loading}
                />
                <Pressable style={styles.sendButton} onPress={handleSendMessage} disabled={loading}>
                    <Ionicons name="send" size={22} color="white" />
                </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  header: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.background,
  },
  closeButton: {
    position: 'absolute',
    right: 15,
  },
  messageList: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  messageContainer: {
    maxWidth: '90%',
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
  },
  userMessageContainer: {
    backgroundColor: Colors.light.tint,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  botMessageContainer: {
    backgroundColor: '#3A3A3C',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  aiName: {
    fontWeight: '900',
    textDecorationLine: 'underline'
  },
  userMessageText: {
    color: Colors.light.white,
    fontSize: 16,
  },
  botMessageText: {
    color: Colors.light.white,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 45,
    backgroundColor: Colors.light.background,
    borderRadius: 22,
    paddingHorizontal: 20,
    fontSize: 16,
    color: Colors.light.black,
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  typingText: {
    marginLeft: 10,
    color: Colors.light.icon,
    fontStyle: 'italic',
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    color: Colors.light.white,
    fontSize: 16,
  },
  heading1: {
    color: Colors.light.white,
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#4A4A4A',
    paddingBottom: 5,
  },
  strong: {
    fontWeight: 'bold',
  },
  bullet_list: {
    marginBottom: 10,
  },
  list_item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  // Anda bisa menambahkan style lain sesuai kebutuhan (e.g., link, code, etc.)
});