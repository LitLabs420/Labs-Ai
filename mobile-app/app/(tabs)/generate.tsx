import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Sparkles, Copy, Heart } from 'lucide-react-native';

const CONTENT_TYPES = [
  { id: 'caption', label: 'Caption', icon: 'Sparkles' },
  { id: 'script', label: 'Script', icon: 'Sparkles' },
  { id: 'dm', label: 'DM Template', icon: 'Sparkles' },
  { id: 'image', label: 'Image Prompt', icon: 'Sparkles' },
];

const TONES = [
  'Casual',
  'Professional',
  'Funny',
  'Inspirational',
];

export default function GenerateContentScreen() {
  const [selectedType, setSelectedType] = useState<string>('caption');
  const [selectedTone, setSelectedTone] = useState<string>('Casual');
  const [topic, setTopic] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      Alert.alert('Error', 'Please enter a topic');
      return;
    }

    try {
      setLoading(true);
      // API call would happen here
      // For now, mock response
      setGeneratedContent(`Generated ${selectedType} about "${topic}" in ${selectedTone} tone`);
      setSaved(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedContent) {
      // Copy to clipboard
      Alert.alert('Success', 'Content copied to clipboard');
    }
  };

  const handleSave = async () => {
    if (generatedContent) {
      try {
        setSaved(true);
        // Save API call would happen here
        Alert.alert('Success', 'Content saved to library');
      } catch (error) {
        Alert.alert('Error', 'Failed to save content');
      }
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-900">
      <View className="p-6">
        {/* Header */}
        <View className="mb-8">
          <View className="flex-row items-center mb-2">
            <Sparkles size={28} color="#a855f7" />
            <Text className="text-3xl font-bold text-white ml-3">Generate</Text>
          </View>
          <Text className="text-gray-400">Create engaging content instantly</Text>
        </View>

        {/* Content Type Selection */}
        <View className="mb-6">
          <Text className="text-white font-semibold mb-3">Content Type</Text>
          <View className="flex-row flex-wrap gap-2">
            {CONTENT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                onPress={() => setSelectedType(type.id)}
                className={`px-4 py-2 rounded-lg ${
                  selectedType === type.id
                    ? 'bg-purple-600'
                    : 'bg-gray-800'
                }`}
              >
                <Text className="text-white font-medium">{type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tone Selection */}
        <View className="mb-6">
          <Text className="text-white font-semibold mb-3">Tone</Text>
          <View className="flex-row flex-wrap gap-2">
            {TONES.map((tone) => (
              <TouchableOpacity
                key={tone}
                onPress={() => setSelectedTone(tone)}
                className={`px-4 py-2 rounded-lg ${
                  selectedTone === tone
                    ? 'bg-purple-600'
                    : 'bg-gray-800'
                }`}
              >
                <Text className="text-white font-medium text-sm">{tone}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Topic Input */}
        <View className="mb-6">
          <Text className="text-white font-semibold mb-3">Topic or Idea</Text>
          <TextInput
            placeholder="What do you want to create about?"
            placeholderTextColor="#6b7280"
            value={topic}
            onChangeText={setTopic}
            multiline
            numberOfLines={4}
            className="bg-gray-800 text-white rounded-lg p-4 text-base"
          />
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          onPress={handleGenerate}
          disabled={loading || !topic.trim()}
          className={`py-4 rounded-lg items-center mb-6 ${
            loading || !topic.trim()
              ? 'bg-gray-600'
              : 'bg-gradient-to-r from-purple-600 to-pink-600'
          }`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Generate Content</Text>
          )}
        </TouchableOpacity>

        {/* Generated Content */}
        {generatedContent && (
          <View className="bg-gray-800 rounded-lg p-4">
            <Text className="text-white font-semibold mb-3">Generated Content</Text>
            <Text className="text-gray-300 mb-4 leading-6">{generatedContent}</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleCopy}
                className="flex-1 bg-gray-700 py-3 rounded-lg items-center flex-row justify-center"
              >
                <Copy size={18} color="white" />
                <Text className="text-white font-semibold ml-2">Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                className={`flex-1 py-3 rounded-lg items-center flex-row justify-center ${
                  saved ? 'bg-green-600' : 'bg-purple-600'
                }`}
              >
                <Heart size={18} color="white" fill={saved ? 'white' : 'none'} />
                <Text className="text-white font-semibold ml-2">
                  {saved ? 'Saved' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
