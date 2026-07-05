import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { KanbanScreen } from '../screens/KanbanScreen';
import { OtpVerifyScreen } from '../screens/OtpVerifyScreen';
import { PhoneLoginScreen } from '../screens/PhoneLoginScreen';
import { TaskDetailScreen } from '../screens/TaskDetailScreen';
import { TaskListScreen } from '../screens/TaskListScreen';
import type { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer key={isAuthenticated ? 'worker-app' : 'worker-auth'}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#0f172a',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#f8fafc' },
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen
              name="PhoneLogin"
              component={PhoneLoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="OtpVerify"
              component={OtpVerifyScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="TaskList"
              component={TaskListScreen}
              options={{ title: 'My Tasks' }}
            />
            <Stack.Screen
              name="TaskDetail"
              component={TaskDetailScreen}
              options={{ title: 'Task Detail' }}
            />
            <Stack.Screen
              name="Kanban"
              component={KanbanScreen}
              options={{ title: 'Task Board' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
