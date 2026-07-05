import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { CommentsThread } from '../components/CommentsThread';
import { ProgressUpdateComposer } from '../components/ProgressUpdateComposer';
import { StatusActionButtons } from '../components/StatusActionButtons';
import { StatusBadge } from '../components/StatusBadge';
import { StepChecklist } from '../components/StepChecklist';
import { api } from '../api/client';
import { useTasks } from '../context/TaskContext';
import type { RootStackParamList, Task } from '../types';
import { categoryLabel, formatDate, googleMapsUrl } from '../utils/formatting';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetail'>;

export function TaskDetailScreen({ route, navigation }: Props) {
  const { taskId } = route.params;
  const {
    getTaskById,
    updateLocalTask,
    updateStatus,
    toggleStep,
    addStep,
    addProgressUpdate,
    addComment,
  } = useTasks();

  const [task, setTask] = useState<Task | undefined>(getTaskById(taskId));
  const [loading, setLoading] = useState(!task);
  const [statusLoading, setStatusLoading] = useState(false);

  const loadTask = useCallback(async () => {
    try {
      const fresh = await api.getTask(taskId);
      setTask(fresh);
      updateLocalTask(fresh);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not load task');
    } finally {
      setLoading(false);
    }
  }, [taskId, updateLocalTask]);

  useFocusEffect(
    useCallback(() => {
      loadTask();
    }, [loadTask]),
  );

  useEffect(() => {
    if (task) {
      navigation.setOptions({ title: task.issue.title.slice(0, 30) });
    }
  }, [task, navigation]);

  if (loading || !task) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const mapsUrl = googleMapsUrl(task.issue.latitude, task.issue.longitude);
  const isReadOnly = task.status === 'done' || task.status === 'review';

  const handleStatusChange = async (status: Task['status']) => {
    setStatusLoading(true);
    try {
      const updated = await updateStatus(taskId, status);
      setTask(updated);
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="pb-10">
      <View className="border-b border-slate-200 bg-white p-4">
        <View className="mb-3 flex-row items-start justify-between gap-3">
          <Text className="flex-1 text-xl font-extrabold text-slate-900">
            {task.issue.title}
          </Text>
          <StatusBadge status={task.status} />
        </View>

        <View className="mb-3 flex-row flex-wrap gap-2">
          <View className="rounded-lg bg-slate-100 px-2 py-1">
            <Text className="text-xs font-medium text-slate-600">
              {task.issue.district}
            </Text>
          </View>
          <View className="rounded-lg bg-blue-50 px-2 py-1">
            <Text className="text-xs font-medium text-blue-700">
              {categoryLabel(task.issue.category)}
            </Text>
          </View>
          <View className="rounded-lg bg-amber-50 px-2 py-1">
            <Text className="text-xs font-medium text-amber-700">
              Due {formatDate(task.due_date)}
            </Text>
          </View>
        </View>

        <Text className="text-sm leading-6 text-slate-700">
          {task.issue.description}
        </Text>

        {task.admin_notes ? (
          <View className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <Text className="mb-1 text-xs font-bold uppercase text-amber-800">
              Admin notes
            </Text>
            <Text className="text-sm text-amber-900">{task.admin_notes}</Text>
          </View>
        ) : null}

        {mapsUrl && (
          <Pressable
            onPress={() => Linking.openURL(mapsUrl)}
            className="mt-4 items-center rounded-xl border-2 border-green-300 bg-green-50 py-3 active:bg-green-100"
          >
            <Text className="font-bold text-green-700">Open in Google Maps</Text>
          </Pressable>
        )}
      </View>

      {task.issue.photos.length > 0 && (
        <View className="border-b border-slate-200 bg-white p-4">
          <Text className="mb-2 text-sm font-bold text-slate-700">Issue photos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {task.issue.photos.map((uri, i) => (
              <Image
                key={i}
                source={{ uri }}
                className="mr-3 h-40 w-56 rounded-xl"
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        </View>
      )}

      <View className="mt-2 border-b border-slate-200 bg-white p-4">
        <Text className="mb-3 text-base font-bold text-slate-900">Checklist</Text>
        <StepChecklist
          steps={task.steps}
          disabled={isReadOnly}
          onToggle={async (stepId) => {
            const updated = await toggleStep(taskId, stepId);
            setTask(updated);
          }}
          onAddStep={async (title) => {
            const updated = await addStep(taskId, title);
            setTask(updated);
          }}
        />
      </View>

      <View className="mt-2 border-b border-slate-200 bg-white p-4">
        <Text className="mb-3 text-base font-bold text-slate-900">
          Progress updates
        </Text>
        <ProgressUpdateComposer
          updates={task.updates}
          disabled={isReadOnly}
          onSubmit={async (body, photoUri) => {
            const updated = await addProgressUpdate(taskId, body, photoUri);
            setTask(updated);
          }}
        />
      </View>

      {!isReadOnly && (
        <View className="mt-2 border-b border-slate-200 bg-white p-4">
          <Text className="mb-3 text-base font-bold text-slate-900">
            Change status
          </Text>
          <StatusActionButtons
            currentStatus={task.status}
            hasUpdates={task.updates.length > 0}
            loading={statusLoading}
            onChangeStatus={handleStatusChange}
          />
        </View>
      )}

      <View className="mt-2 bg-white p-4">
        <Text className="mb-3 text-base font-bold text-slate-900">
          Internal comments
        </Text>
        <CommentsThread
          comments={task.comments}
          onSubmit={async (body, type) => {
            const updated = await addComment(taskId, body, type);
            setTask(updated);
          }}
        />
      </View>
    </ScrollView>
  );
}
