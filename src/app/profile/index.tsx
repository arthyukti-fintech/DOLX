import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import styles from './profileStyles';

const profileImage = require('../../../assets/images/Ellipse 93.png');

const menuItems = [
    {
        id: '1',
        title: 'My Jobs / Bookings',
        icon: require('../../../assets/Icons/Group 117.png'),
    },
    {
        id: '2',
        title: 'Notifications',
        icon: require('../../../assets/Icons/Group 117.png'),
    },
    {
        id: '3',
        title: 'Privacy Policy',
        icon: require('../../../assets/Icons/Group 117.png'),
    },
    {
        id: '4',
        title: 'Terms & Conditions',
        icon: require('../../../assets/Icons/Group 117.png'),
    },
    {
        id: '5',
        title: 'Help & Support',
        icon: require('../../../assets/Icons/Group 117.png'),
    },
];

const ProfileScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Image
                        source={require('../../../assets/Icons/Group 117.png')}
                        style={styles.backIcon}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.editButton}
                >
                    <Image
                        source={require('../../../assets/Icons/Group 117.png')}
                        style={styles.editIcon}
                    />

                    <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Profile */}
                <View style={styles.profileSection}>
                    <Image
                        source={profileImage}
                        style={styles.profileImage}
                    />

                    <Text style={styles.name}>
                        Rahul Sharma
                    </Text>

                    <Text style={styles.email}>
                        rahulsharma123@gmail.com
                    </Text>
                </View>

                {/* Personal Info */}
                <View style={styles.personalSection}>
                    <Text style={styles.personalTitle}>
                        Personal Info
                    </Text>

                    <View style={styles.menuCard}>
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={item.id}
                                activeOpacity={0.8}
                                style={[
                                    styles.menuItem,
                                    index === menuItems.length - 1 && {
                                        borderBottomWidth: 0,
                                    },
                                ]}
                            >
                                <View style={styles.leftSection}>
                                    <View style={styles.iconContainer}>
                                        <Image
                                            source={item.icon}
                                            style={styles.menuIcon}
                                        />
                                    </View>

                                    <Text style={styles.menuTitle}>
                                        {item.title}
                                    </Text>
                                </View>

                                <Image
                                    source={require('../../../assets/Icons/Group 117.png')}
                                    style={styles.arrow}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Logout */}
            <TouchableOpacity
                activeOpacity={0.85}
                style={styles.logoutButton}
            >
                <Image
                    source={require('../../../assets/Icons/Group 117.png')}
                    style={styles.logoutIcon}
                />

                <Text style={styles.logoutText}>
                    Log Out
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default ProfileScreen;