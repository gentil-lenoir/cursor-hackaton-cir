import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { InternalComment } from '../types';
import { formatDateTime } from '../utils/formatting';

type Props = {
  comments: InternalComment[];
  onSubmit: (body: string, type: InternalComment['type']) => Promise<void>;
};

export function CommentsThread({ comments, onSubmit }: Props) {
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const sorted = [...comments].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  const send = async (type: InternalComment['type']) => {
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(body, type);
      setBody('');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not send comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View>
      {sorted.length === 0 ? (
        <Text className="mb-3 text-sm text-slate-500">No internal comments yet.</Text>
      ) : (
        sorted.map((comment) => (
          <View
            key={comment.id}
            className={`mb-2 rounded-xl p-3 ${
              comment.author === 'worker'
                ? 'ml-4 bg-blue-50'
                : 'mr-4 bg-amber-50'
            }`}
          >
            <View className="mb-1 flex-row items-center gap-2">
              <Text className="text-xs font-bold capitalize text-slate-600">
                {comment.author}
              </Text>
              {comment.type === 'clarification_request' && (
                <View className="rounded bg-orange-200 px-2 py-0.5">
                  <Text className="text-xs font-bold text-orange-800">Clarification</Text>
                </View>
              )}
            </View>
            <Text className="text-sm text-slate-800">{comment.body}</Text>
            <Text className="mt-1 text-xs text-slate-400">
              {formatDateTime(comment.created_at)}
            </Text>
          </View>
        ))
      )}

      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder="Message admin..."
        placeholderTextColor="#94a3b8"
        multiline
        className="mb-2 min-h-[80px] rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900"
      />

      <View className="flex-row gap-2">
        <Pressable
          onPress={() => send('comment')}
          disabled={submitting || !body.trim()}
          className="flex-1 items-center rounded-xl bg-slate-700 py-3 active:bg-slate-800 disabled:opacity-50"
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className="font-semibold text-white">Send</Text>
          )}
        </Pressable>
        <Pressable
          onPress={() => send('clarification_request')}
          disabled={submitting || !body.trim()}
          className="flex-1 items-center rounded-xl border-2 border-orange-400 bg-orange-50 py-3 active:bg-orange-100 disabled:opacity-50"
        >
          <Text className="font-semibold text-orange-700">Request Clarification</Text>
        </Pressable>
      </View>
    </View>
  );
}
