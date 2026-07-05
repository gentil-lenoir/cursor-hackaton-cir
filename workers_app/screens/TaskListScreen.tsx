import { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { TaskCard } from '../components/TaskCard';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskList'>;

export function TaskListScreen({ navigation }: Props) {
  const { worker, logout } = useAuth();
  const { tasks, isLoading, error, refreshTasks } = useTasks();

  useFocusEffect(
    useCallback(() => {
      refreshTasks();
    }, [refreshTasks]),
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => navigation.navigate('Kanban')}
            className="rounded-lg bg-slate-100 px-3 py-2"
          >
            <Text className="text-xs font-bold text-slate-700">Board</Text>
          </Pressable>
          <Pressable onPress={logout} className="rounded-lg bg-red-50 px-3 py-2">
            <Text className="text-xs font-bold text-red-600">Logout</Text>
          </Pressable>
        </View>
      ),
    });
  }, [navigation, logout]);

  const activeTasks = tasks.filter((t) => t.status !== 'done');

  return (
    <View className="flex-1 bg-slate-50">
      <View className="border-b border-slate-200 bg-white px-4 pb-4 pt-2">
        <Text className="text-xs font-bold uppercase tracking-widest text-blue-600">
          Assigned Tasks
        </Text>
        <Text className="text-xl font-extrabold text-slate-900">
          Hello, {worker?.name?.split(' ')[0] ?? 'Worker'}
        </Text>
        <Text className="text-sm text-slate-500">
          {activeTasks.length} open task{activeTasks.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {error ? (
        <View className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <Text className="text-sm text-red-700">{error}</Text>
        </View>
      ) : null}

      {isLoading && tasks.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={activeTasks}
          keyExtractor={(item) => item.id}
          contentContainerClassName="p-4 pb-8"
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refreshTasks} />
          }
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-base text-slate-500">No assigned tasks.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
            />
          )}
        />
      )}
    </View>
  );
}
