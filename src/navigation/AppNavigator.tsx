import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { AppTabParamList, EmergencyStackParamList, LearnStackParamList } from './types';

// Home
import HomeScreen from '../screens/home/HomeScreen';
// Emergency
import EmergencyHomeScreen from '../screens/emergency/EmergencyHomeScreen';
import EmergencyInputScreen from '../screens/emergency/EmergencyInputScreen';
import EmergencyResultScreen from '../screens/emergency/EmergencyResultScreen';
// Learn
import LearnHomeScreen from '../screens/learn/LearnHomeScreen';
import TopicScreen from '../screens/learn/TopicScreen';
import LessonScreen from '../screens/learn/LessonScreen';
import LessonCompleteScreen from '../screens/learn/LessonCompleteScreen';
// Profile
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';

type ProfileStackParamList = {
  ProfileMain: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();
const EmStack = createNativeStackNavigator<EmergencyStackParamList>();
const LearnStack = createNativeStackNavigator<LearnStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
  );
}

function EmergencyNavigator() {
  return (
    <EmStack.Navigator screenOptions={{ headerShown: false }}>
      <EmStack.Screen name="EmergencyHome" component={EmergencyHomeScreen} />
      <EmStack.Screen name="EmergencyInput" component={EmergencyInputScreen} />
      <EmStack.Screen name="EmergencyResult" component={EmergencyResultScreen} />
    </EmStack.Navigator>
  );
}

function LearnNavigator() {
  return (
    <LearnStack.Navigator screenOptions={{ headerShown: false }}>
      <LearnStack.Screen name="LearnHome" component={LearnHomeScreen} />
      <LearnStack.Screen name="Topic" component={TopicScreen} />
      <LearnStack.Screen name="Lesson" component={LessonScreen} />
      <LearnStack.Screen name="LessonComplete" component={LessonCompleteScreen} />
    </LearnStack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e2e8f0',
          paddingBottom: 4,
          height: 60,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, [string, string]> = {
            HomeTab: ['home', 'home-outline'],
            EmergencyTab: ['alert-circle', 'alert-circle-outline'],
            LearnTab: ['book', 'book-outline'],
            ProfileTab: ['person', 'person-outline'],
          };
          const [active, inactive] = icons[route.name] ?? ['apps', 'apps-outline'];
          const iconName = focused ? active : inactive;
          return (
            <Ionicons
              name={iconName as any}
              size={size}
              color={route.name === 'EmergencyTab' ? Colors.emergency : color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="EmergencyTab" component={EmergencyNavigator} options={{ tabBarLabel: 'Emergency' }} />
      <Tab.Screen name="LearnTab" component={LearnNavigator} options={{ tabBarLabel: 'Learn' }} />
      <Tab.Screen name="ProfileTab" component={ProfileNavigator} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}
