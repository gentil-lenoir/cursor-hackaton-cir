import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { TaskStep } from '../types';

type Props = {
  steps: TaskStep[];
  onToggle: (stepId: string) => Promise<void>;
  onAddStep: (title: string) => Promise<void>;
  disabled?: boolean;
};

export function StepChecklist({ steps, onToggle, onAddStep, disabled }: Props) {
  const [newStep, setNewStep] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const sorted = [...steps].sort((a, b) => a.order - b.order);

  const handleToggle = async (stepId: string) => {
    if (disabled) return;
    setLoadingId(stepId);
    try {
      await onToggle(stepId);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not update step');
    } finally {
      setLoadingId(null);
    }
  };

  const handleAdd = async () => {
    if (!newStep.trim()) return;
    setAdding(true);
    try {
      await onAddStep(newStep);
      setNewStep('');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not add step');
    } finally {
      setAdding(false);
    }
  };

  return (
    <View>
      {sorted.map((step) => (
        <Pressable
          key={step.id}
          onPress={() => handleToggle(step.id)}
          disabled={disabled || loadingId === step.id}
          className="mb-2 flex-row items-center rounded-xl border border-slate-200 bg-white px-3 py-3 active:bg-slate-50"
        >
          <View
            className={`mr-3 h-6 w-6 items-center justify-center rounded-md border-2 ${
              step.is_completed
                ? 'border-green-500 bg-green-500'
                : 'border-slate-300 bg-white'
            }`}
          >
            {loadingId === step.id ? (
              <ActivityIndicator size="small" color="#64748b" />
            ) : step.is_completed ? (
              <Text className="text-xs font-bold text-white">✓</Text>
            ) : null}
          </View>
          <View className="flex-1">
            <Text
              className={`text-sm ${
                step.is_completed
                  ? 'text-slate-400 line-through'
                  : 'text-slate-800'
              }`}
            >
              {step.title}
            </Text>
            <Text className="mt-0.5 text-xs text-slate-400">
              Added by {step.added_by}
            </Text>
          </View>
        </Pressable>
      ))}

      {!disabled && (
        <View className="mt-2 flex-row gap-2">
          <TextInput
            value={newStep}
            onChangeText={setNewStep}
            placeholder="Add a step..."
            placeholderTextColor="#94a3b8"
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900"
          />
          <Pressable
            onPress={handleAdd}
            disabled={adding || !newStep.trim()}
            className="items-center justify-center rounded-xl bg-blue-600 px-4 py-3 active:bg-blue-700 disabled:opacity-50"
          >
            {adding ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="font-semibold text-white">Add</Text>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}
