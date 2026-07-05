import { Text, View } from 'react-native';
import type { TaskStatus } from '../types';
import { STATUS_COLORS, STATUS_LABELS } from '../utils/statusTransitions';

type Props = {
  status: TaskStatus;
  size?: 'sm' | 'md';
};

export function StatusBadge({ status, size = 'md' }: Props) {
  const colors = STATUS_COLORS[status];
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <View className={`rounded-full px-3 py-1 ${colors.bg} border ${colors.border}`}>
      <Text className={`font-semibold ${colors.text} ${textSize}`}>
        {STATUS_LABELS[status]}
      </Text>
    </View>
  );
}
