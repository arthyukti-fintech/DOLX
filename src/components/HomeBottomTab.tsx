import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const TABS = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'explore', icon: '⊞', label: 'Explore' },
    { id: 'saved', icon: '❤️', label: 'Saved' },
    { id: 'profile', icon: '👤', label: 'Profile' },
];

const HomeBottomTab: React.FC = () => {
    const [active, setActive] = useState('home');

    return (
        <View style={styles.container}>
            {TABS.map((tab) => (
                <TouchableOpacity
                    key={tab.id}
                    style={styles.tab}
                    activeOpacity={0.7}
                    onPress={() => setActive(tab.id)}
                >
                    <Text style={[styles.icon, active === tab.id && styles.iconActive]}>
                        {tab.icon}
                    </Text>
                    <Text style={[styles.label, active === tab.id && styles.labelActive]}>
                        {tab.label}
                    </Text>
                    {active === tab.id && <View style={styles.activeDot} />}
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingBottom: 8,
        paddingTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 10,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        gap: 3,
    },
    icon: {
        fontSize: 20,
        opacity: 0.4,
    },
    iconActive: {
        opacity: 1,
    },
    label: {
        fontSize: 11,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    labelActive: {
        color: '#1C2340',
        fontWeight: '700',
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#1C2340',
        marginTop: 1,
    },
});

export default HomeBottomTab;