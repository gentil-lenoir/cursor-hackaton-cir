import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { ProgressUpdate } from '../types';
import { formatDateTime } from '../utils/formatting';

type Props = {
  updates: ProgressUpdate[];
  onSubmit: (body: string, photoUri?: string) => Promise<void>;
  disabled?: boolean;
};

export function ProgressUpdateComposer({ updates, onSubmit, disabled }: Props) {
  const [body, setBody] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Camera access is required to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (body.trim().length < 10) {
      Alert.alert('Too short', 'Progress update must be at least 10 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(body, photoUri);
      setBody('');
      setPhotoUri(undefined);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not post update');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View>
      {updates.length > 0 && (
        <View className="mb-4">
          {updates.map((update) => (
            <View
              key={update.id}
              className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <Text className="text-xs text-slate-500">
                {formatDateTime(update.created_at)}
              </Text>
              <Text className="mt-1 text-sm text-slate-800">{update.body}</Text>
              {update.photo_url && (
                <Image
                  source={{ uri: update.photo_url }}
                  className="mt-2 h-32 w-full rounded-lg"
                  resizeMode="cover"
                />
              )}
            </View>
          ))}
        </View>
      )}

      {!disabled && (
        <View className="rounded-xl border border-slate-200 bg-white p-3">
          <Text className="mb-2 text-sm font-semibold text-slate-700">
            Post progress update
          </Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Describe work done (min 10 chars)..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="mb-3 min-h-[100px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900"
          />

          {photoUri && (
            <Image
              source={{ uri: photoUri }}
              className="mb-3 h-32 w-full rounded-lg"
              resizeMode="cover"
            />
          )}

          <View className="mb-3 flex-row gap-2">
            <Pressable
              onPress={takePhoto}
              className="flex-1 items-center rounded-xl border border-slate-300 bg-white py-3 active:bg-slate-50"
            >
              <Text className="text-sm font-semibold text-slate-700">Camera</Text>
            </Pressable>
            <Pressable
              onPress={pickPhoto}
              className="flex-1 items-center rounded-xl border border-slate-300 bg-white py-3 active:bg-slate-50"
            >
              <Text className="text-sm font-semibold text-slate-700">Gallery</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={submitting || body.trim().length < 10}
            className="items-center rounded-xl bg-blue-600 py-4 active:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-bold text-white">Post Update</Text>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}
