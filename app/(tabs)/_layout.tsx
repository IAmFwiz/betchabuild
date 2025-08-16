// app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import { Home, Inbox, User } from 'lucide-react-native';
import { Image, View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#00D4FF',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopColor: '#222',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color, size }) => <Inbox size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              overflow: 'hidden',
              borderWidth: focused ? 2 : 0,
              borderColor: '#00D4FF',
            }}>
              <Image 
                source={{ uri: 'https://via.placeholder.com/100' }}
                style={{ width: '100%', height: '100%' }}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
