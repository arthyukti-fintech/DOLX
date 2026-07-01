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
import styles from '../profile/profileStyles';
import AppBackButton from '@/components/comman/AppHeader';

const profileImage = require('../../../assets/images/Ellipse 93.png');

const menuItems = [
    {
        id: '1',
        title: 'My Jobs / Bookings',
        icon: require('../../../assets/Icons/jobsAndInfo.png'),
        route: '/myBookings',
    },
    {
        id: '2',
        title: 'Notifications',
        icon: require('../../../assets/Icons/bell.png'),
        route: '/notifications',
    },
    {
        id: '3',
        title: 'Privacy Policy',
        icon: require('../../../assets/Icons/privacy.png'),
        route: '/privacyPolicy',
    },
    {
        id: '4',
        title: 'Terms & Conditions',
        icon: require('../../../assets/Icons/tandc.png'),
        route: '/termsAndConditions',
    },
    {
        id: '5',
        title: 'Help & Support',
        icon: require('../../../assets/Icons/helpAndSupport.png'),
        route: '/helpSupport',
    },
];

const ProfileScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>

                <AppBackButton
                    showRightButton
                    rightText="Edit"
                    rightIcon={require("../../../assets/Icons/editIcon.png")}
                    onRightPress={() => console.log("Edit")}
                />

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
                                onPress={() => router.push(item.route as any)}
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
                                    source={require('../../../assets/Icons/chevron-right.png')}
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
                    source={require('../../../assets/Icons/logoutIcon.png')}
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