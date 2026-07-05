import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../types';
import { formatPhoneDisplay } from '../utils/formatting';

type Props = NativeStackScreenProps<RootStackParamList, 'OtpVerify'>;

export function OtpVerifyScreen({ route, navigation }: Props) {
  const { phone } = route.params;
  const { verifyOtp } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleVerify = async () => {
    setError('');
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(phone, code);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-50"
    >
      <View className="flex-1 justify-center px-6">
        <Pressable onPress={() => navigation.goBack()} className="mb-6">
          <Text className="text-base font-semibold text-blue-600">← Back</Text>
        </Pressable>

        <Text className="mb-2 text-3xl font-extrabold text-slate-900">
          Enter code
        </Text>
        <Text className="mb-8 text-base text-slate-600">
          Code sent to {formatPhoneDisplay(phone)}. Demo: enter any 6 digits.
        </Text>

        <Pressable onPress={() => inputRef.current?.focus()}>
          <View className="mb-6 flex-row justify-center gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <View
                key={i}
                className="h-14 w-11 items-center justify-center rounded-xl border-2 border-slate-200 bg-white"
              >
                <Text className="text-2xl font-bold text-slate-900">
                  {code[i] ?? ''}
                </Text>
              </View>
            ))}
          </View>
        </Pressable>

        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
          className="absolute h-0 w-0 opacity-0"
        />

        {error ? (
          <View className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <Text className="text-sm font-medium text-red-700">{error}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={handleVerify}
          disabled={loading || code.length !== 6}
          className="items-center rounded-2xl bg-blue-600 py-4 active:bg-blue-700 disabled:opacity-60"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-lg font-bold text-white">Verify & Sign In</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
