import { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBadge } from '../components/StatusBadge';
import { useTasks } from '../context/TaskContext';
import type { RootStackParamList, Task, TaskStatus } from '../types';
import { formatDate } from '../utils/formatting';

type Props = NativeStackScreenProps<RootStackParamList, 'Kanban'>;

const COLUMNS: { key: TaskStatus; label: string; color: string }[] = [
  { key: 'todo', label: 'To Do', color: 'border-gray-300' },
  { key: 'in_progress', label: 'In Progress', color: 'border-blue-300' },
  { key: 'review', label: 'Review', color: 'border-purple-300' },
];

export function KanbanScreen({ navigation }: Props) {
  const { tasks, isLoading, refreshTasks } = useTasks();

  useFocusEffect(
    useCallback(() => {
      refreshTasks();
    }, [refreshTasks]),
  );

  const byStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status);

  return (
    <View className="flex-1 bg-slate-100">
      {isLoading && tasks.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-3 p-4"
        >
          {COLUMNS.map((col) => (
            <View
              key={col.key}
              className={`w-72 rounded-2xl border-2 ${col.color} bg-white p-3`}
            >
              <Text className="mb-3 text-sm font-bold uppercase text-slate-600">
                {col.label} ({byStatus(col.key).length})
              </Text>
              {byStatus(col.key).map((task) => (
                <Pressable
                  key={task.id}
                  onPress={() =>
                    navigation.navigate('TaskDetail', { taskId: task.id })
                  }
                  className="mb-2 rounded-xl border border-slate-200 bg-slate-50 p-3 active:bg-slate-100"
                >
                  <Text
                    className="mb-2 text-sm font-bold text-slate-900"
                    numberOfLines={2}
                  >
                    {task.issue.title}
                  </Text>
                  <StatusBadge status={task.status} size="sm" />
                  <Text className="mt-2 text-xs text-slate-500">
                    {task.issue.district} · {formatDate(task.due_date)}
                  </Text>
                </Pressable>
              ))}
              {byStatus(col.key).length === 0 && (
                <Text className="py-4 text-center text-xs text-slate-400">
                  Empty
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
