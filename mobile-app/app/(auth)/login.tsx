import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      // Firebase auth would happen here
      // For now, just navigate to home
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-900"
    >
      <ScrollView className="flex-1" contentContainerClassName="justify-center">
        <View className="p-6 items-center justify-center flex-1">
          {/* Header */}
          <View className="mb-12 items-center">
            <Text className="text-4xl font-bold text-white mb-2">LitLabs</Text>
            <Text className="text-gray-400 text-center">
              Content creation & client management
            </Text>
          </View>

          {/* Login Form */}
          <View className="w-full space-y-4">
            {/* Email Input */}
            <View className="bg-gray-800 rounded-lg p-4 flex-row items-center">
              <Mail size={20} color="#9ca3af" />
              <TextInput
                placeholder="Email"
                placeholderTextColor="#6b7280"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 ml-3 text-white"
              />
            </View>

            {/* Password Input */}
            <View className="bg-gray-800 rounded-lg p-4 flex-row items-center">
              <Lock size={20} color="#9ca3af" />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#6b7280"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className="flex-1 ml-3 text-white"
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className={`py-4 rounded-lg items-center mt-6 ${
                loading ? 'bg-gray-600' : 'bg-purple-600'
              }`}
            >
              <Text className="text-white font-semibold text-lg">
                {loading ? 'Signing in...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-400">Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text className="text-purple-400 font-semibold">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
