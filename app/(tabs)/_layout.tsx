import { Tabs } from 'expo-router';
import { Home, Inbox, Trophy } from 'lucide-react-native';
import { Image, View, Text } from 'react-native';

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
        name="activity"
        options={{
          title: '',  // Remove the text label
          tabBarIcon: ({ focused }) => {
            try {
              return (
                <View style={{
                  width: 50,  // Slightly reduced size
                  height: 50,  // Slightly reduced size
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 0,  // Centered vertically - removed the lift
                  backgroundColor: focused ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                  borderRadius: 25,
                }}>
                  <Image 
                    source={require('../../assets/b2-appicon.png')}
                    style={{ 
                      width: 40,  // Properly sized within container
                      height: 40,
                    }}
                    resizeMode="contain"
                    onError={() => console.log('Activity icon failed to load')}
                  />
                </View>
              );
            } catch (error) {
              // Fallback if image doesn't exist
              return (
                <View style={{
                  width: 50,
                  height: 50,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 0,
                  backgroundColor: focused ? '#00D4FF' : '#888',
                  borderRadius: 25,
                }}>
                  <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>B</Text>
                </View>
              );
            }
          },
        }}
      />
      
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ color, size }) => <Trophy size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              overflow: 'hidden',
              borderWidth: focused ? 2 : 0,
              borderColor: '#00D4FF',
            }}>
              <Image 
                source={{ uri: 'https://i.pravatar.cc/100' }}
                style={{ width: '100%', height: '100%' }}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
