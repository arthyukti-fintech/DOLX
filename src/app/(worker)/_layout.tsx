import { Tabs } from 'expo-router';
import { RoleGate } from '../../components/RoleGate';
import { Icon } from '../../components/ui';
import { colors, fonts } from '../../theme';

export default function WorkerTabLayout() {
  return (
    <RoleGate role="worker">
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
          name="jobs"
          options={{
            title: 'Jobs',
            tabBarIcon: ({ color, size }) => (
              <Icon name="category" size={size} color={color as string} />
            ),
          }}
        />
        <Tabs.Screen
          name="applications"
          options={{
            title: 'My Applications',
            tabBarIcon: ({ color, size }) => (
              <Icon name="document" size={size} color={color as string} />
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
    </RoleGate>
  );
}
