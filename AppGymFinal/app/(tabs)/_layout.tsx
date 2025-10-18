import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
        <Tabs.Screen
        name="Alimentacion"
        options={{
          title: 'Alimentacion',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="nutrition-outline" color={color} />,
        }}
      />
        <Tabs.Screen
        name="Social"
        options={{
          title: 'Social',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="people-outline" color={color} />,
        }}
      />
        <Tabs.Screen
        name="Rango"
        options={{
          title: 'Rango',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="trophy" color={color} />,
        }}
      />
      <Tabs.Screen
        name="Gym"
        options={{
          title: 'Gym',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="barbell" color={color} />,
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="person-outline" color={color} />,
        }}
      />

    </Tabs>
  );
}
