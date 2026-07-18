import { Tabs } from 'expo-router';
import { Image } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    height: 85,
                    paddingTop: 10,
                    paddingBottom: 10,
                    borderTopWidth: 0,
                    elevation: 10,
                    backgroundColor: '#FFFFFF',
                },
                tabBarActiveTintColor: '#10195C',
                tabBarInactiveTintColor: '#8B8B8B',
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ focused }) => (
                        <Image
                            source={require('../../../assets/Icons/house-line.png')}
                            style={{
                                width: 24,
                                height: 24,
                                tintColor: focused ? '#10195C' : '#8B8B8B',
                            }}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="jobs"
                options={{
                    title: 'Jobs',
                    tabBarIcon: ({ focused }) => (
                        <Image
                            source={require('../../../assets/Icons/cloud-arrow-down (1).png')}
                            style={{
                                width: 24,
                                height: 24,
                                tintColor: focused ? '#10195C' : '#8B8B8B',
                            }}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="wallet"
                options={{
                    title: 'Wallet',
                    tabBarIcon: ({ focused }) => (
                        <Image
                            source={require('../../../assets/Icons/cloud-arrow-down (2).png')}
                            style={{
                                width: 24,
                                height: 24,
                                tintColor: focused ? '#10195C' : '#8B8B8B',
                            }}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ focused }) => (
                        <Image
                            source={require('../../../assets/Icons/user-alt-1.png')}
                            style={{
                                width: 24,
                                height: 24,
                                tintColor: focused ? '#10195C' : '#8B8B8B',
                            }}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}