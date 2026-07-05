import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import type { TaskStatus } from '../types';
import {
  STATUS_COLORS,
  STATUS_LABELS,
  getAvailableTransitions,
  requiresProgressUpdateForReview,
} from '../utils/statusTransitions';

type Props = {
  currentStatus: TaskStatus;
  hasUpdates: boolean;
  onChangeStatus: (status: TaskStatus) => Promise<void>;
  loading?: boolean;
};

export function StatusActionButtons({
  currentStatus,
  hasUpdates,
  onChangeStatus,
  loading,
}: Props) {
  const transitions = getAvailableTransitions(currentStatus);

  if (transitions.length === 0) {
    return (
      <Text className="text-sm text-slate-500">
        No status changes available — waiting for admin review.
      </Text>
    );
  }

  const handlePress = async (target: TaskStatus) => {
    if (
      requiresProgressUpdateForReview(currentStatus, target) &&
      !hasUpdates
    ) {
      Alert.alert(
        'Progress update required',
        'Post at least one progress update before submitting for review.',
      );
      return;
    }

    try {
      await onChangeStatus(target);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Status change failed');
    }
  };

  return (
    <View className="gap-2">
      {transitions.map((status) => {
        const colors = STATUS_COLORS[status];
        return (
          <Pressable
            key={status}
            onPress={() => handlePress(status)}
            disabled={loading}
            className={`items-center rounded-xl border-2 py-4 active:opacity-80 ${colors.bg} ${colors.border} disabled:opacity-50`}
          >
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Text className={`text-base font-bold ${colors.text}`}>
                → {STATUS_LABELS[status]}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
