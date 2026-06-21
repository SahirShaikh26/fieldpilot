import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import { useOfflineQueue } from '../hooks/useOfflineQueue';

import DashboardScreen from '../screens/DashboardScreen';
import LogActivityScreen from '../screens/LogActivityScreen';
import LogsScreen from '../screens/LogsScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import VisitCheckinScreen from '../screens/VisitCheckinScreen';
import ImportScreen from '../screens/ImportScreen';
import LoginScreen from '../screens/LoginScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS = {
  Dashboard: '📊', Logs: '📋', 'Log Activity': '✏️',
  Projects: '🗂️', 'Check In': '📍', Import: '📥',
};

function TabIcon({ name }) {
  return <Text style={{ fontSize: 18 }}>{TAB_ICONS[name] || '●'}</Text>;
}

function SyncBanner() {
  const { pendingCount } = useOfflineQueue();
  if (!pendingCount) return null;
  return (
    <View style={{ backgroundColor: '#fef9c3', paddingVertical: 6, alignItems: 'center' }}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: '#854d0e' }}>
        ⏳ {pendingCount} item{pendingCount === 1 ? '' : 's'} pending sync — will upload when back online
      </Text>
    </View>
  );
}

function MainTabs() {
  return (
    <View style={{ flex: 1 }}>
      <SyncBanner />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: () => <TabIcon name={route.name} />,
          tabBarActiveTintColor: '#2563eb',
          tabBarInactiveTintColor: '#94a3b8',
          headerStyle: { backgroundColor: '#1e3a5f' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Log Activity" component={LogActivityScreen} />
        <Tab.Screen name="Logs" component={LogsScreen} />
        <Tab.Screen name="Projects" component={ProjectsScreen} />
        <Tab.Screen name="Check In" component={VisitCheckinScreen} />
        <Tab.Screen name="Import" component={ImportScreen} />
      </Tab.Navigator>
    </View>
  );
}

export default function AppNavigator({ isLoggedIn }) {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
