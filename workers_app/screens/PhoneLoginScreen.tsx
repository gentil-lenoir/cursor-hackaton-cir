import { useState } from 'react';
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
import { isValidRwandaPhone } from '../utils/formatting';

type Props = NativeStackScreenProps<RootStackParamList, 'PhoneLogin'>;

export function PhoneLoginScreen({ navigation }: Props) {
  const { requestOtp } = useAuth();
  const [phone, setPhone] = useState('+250');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setError('');
    const normalized = phone.replace(/\s/g, '');

    if (!isValidRwandaPhone(normalized)) {
      setError('Enter a valid Rwanda number: +250 followed by 9 digits.');
      return;
    }

    setLoading(true);
    try {
      await requestOtp(normalized);
      navigation.navigate('OtpVerify', { phone: normalized });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send OTP');
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
        <Text className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600">
          CIR Worker
        </Text>
        <Text className="mb-2 text-3xl font-extrabold text-slate-900">
          Sign in
        </Text>
        <Text className="mb-8 text-base text-slate-600">
          Enter your registered phone number. We will send a one-time code.
        </Text>

        <Text className="mb-2 text-sm font-semibold text-slate-700">Phone number</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="+250788123456"
          placeholderTextColor="#94a3b8"
          autoComplete="tel"
          className="mb-2 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg text-slate-900"
        />
        <Text className="mb-6 text-xs text-slate-500">
          Format: +250 + 9 digits (e.g. +250788123456)
        </Text>

        {error ? (
          <View className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <Text className="text-sm font-medium text-red-700">{error}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={handleContinue}
          disabled={loading}
          className="items-center rounded-2xl bg-blue-600 py-4 active:bg-blue-700 disabled:opacity-60"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-lg font-bold text-white">Send OTP</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
