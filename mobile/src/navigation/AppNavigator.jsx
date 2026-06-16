import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import DashboardScreen from '../screens/DashboardScreen';
import LogActivityScreen from '../screens/LogActivityScreen';
import LogsScreen from '../screens/LogsScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import VisitCheckinScreen from '../screens/VisitCheckinScreen';
import LoginScreen from '../screens/LoginScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS = {
  Dashboard: '📊', Logs: '📋', 'Log Activity': '✏️',
  Projects: '🗂️', 'Check In': '📍',
};

function TabIcon({ name }) {
  return <Text style={{ fontSize: 18 }}>{TAB_ICONS[name] || '●'}</Text>;
}

function MainTabs() {
  return (
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
    </Tab.Navigator>
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
