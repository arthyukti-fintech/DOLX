import { Tabs } from 'expo-router';
import { Icon } from '../../components/ui';
import { colors, fonts } from '../../theme';

export default function OrganizerTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.primary,
          borderTopWidth: 0,
          height: 85,
          paddingTop: 10,
          paddingBottom: 10,
          elevation: 10,
        },
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 11 },
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: 'rgba(249,244,244,0.55)',
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'My Events',
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="create-event"
        options={{
          title: 'Create Event',
          tabBarIcon: ({ color, size }) => (
            <Icon name="briefcase" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, size }) => (
            <Icon name="wallet" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" size={size} color={color as string} />
          ),
        }}
      />
    </Tabs>
  );
}
