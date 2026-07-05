import { Pressable, Text, View } from 'react-native';
import type { Task } from '../types';
import { categoryLabel, formatDate } from '../utils/formatting';
import { StatusBadge } from './StatusBadge';

type Props = {
  task: Task;
  onPress: () => void;
};

export function TaskCard({ task, onPress }: Props) {
  const { issue } = task;

  return (
    <Pressable
      onPress={onPress}
      className="mb-3 rounded-2xl border border-slate-200 bg-white p-4 active:bg-slate-50"
    >
      <View className="mb-2 flex-row items-start justify-between gap-3">
        <Text className="flex-1 text-base font-bold text-slate-900" numberOfLines={2}>
          {issue.title}
        </Text>
        <StatusBadge status={task.status} size="sm" />
      </View>

      <View className="mb-2 flex-row flex-wrap gap-2">
        <View className="rounded-lg bg-slate-100 px-2 py-1">
          <Text className="text-xs font-medium text-slate-600">{issue.district}</Text>
        </View>
        <View className="rounded-lg bg-blue-50 px-2 py-1">
          <Text className="text-xs font-medium text-blue-700">
            {categoryLabel(issue.category)}
          </Text>
        </View>
      </View>

      <Text className="text-xs text-slate-500">
        Due: {formatDate(task.due_date)}
      </Text>
    </Pressable>
  );
}
