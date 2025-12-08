import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { auth } from '@/lib/firebase';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (!currentUser) {
        router.replace('/(auth)/login');
      }
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <ActivityIndicator size="large" color="#9333ea" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-900">
      <View className="p-4">
        <Text className="text-2xl font-bold text-white mb-2">
          Welcome to LitLabs
        </Text>
        <Text className="text-gray-400 mb-6">
          {user?.email}
        </Text>

        <View className="space-y-4">
          {/* Quick Stats */}
          <View className="bg-gray-800 rounded-lg p-4">
            <Text className="text-lg font-semibold text-white mb-4">
              Quick Stats
            </Text>
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-purple-400">0</Text>
                <Text className="text-sm text-gray-400">Posts</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-purple-400">0</Text>
                <Text className="text-sm text-gray-400">Clients</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-purple-400">$0</Text>
                <Text className="text-sm text-gray-400">Earnings</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="bg-gray-800 rounded-lg p-4">
            <Text className="text-lg font-semibold text-white mb-4">
              Quick Actions
            </Text>
            <Text className="text-gray-400 text-center py-8">
              More features coming soon...
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
