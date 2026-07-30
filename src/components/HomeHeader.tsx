import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';


const HomeHeader: React.FC = () => {
    return (
        <View style={styles.row}>
            <View style={styles.left}>
                <Text style={styles.welcome}>Welcome, Rahul</Text>

                <View style={styles.locationRow}>
                    <Text style={styles.locationPin}>📍</Text>
                    <Text
                        style={styles.locationText}
                        numberOfLines={1}
                    >
                        Navrang Circle, Rajajinagar 2n...
                    </Text>
                </View>
            </View>

            <View style={styles.icons}>
                <TouchableOpacity
                    style={styles.iconButton}
                    activeOpacity={0.7}
                >
                    <Image
                        source={require('../../assets/Icons/bellIcon.png')}
                        style={styles.iconImage}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.iconButton}
                    activeOpacity={0.7}
                >
                    <Image
                        source={require('../../assets/Icons/heartIcon.png')}
                        style={styles.heartIconImage}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 16,
        marginTop: 20,
    },
    left: {
        flex: 1,
    },
    welcome: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationPin: {
        fontSize: 12,
        marginRight: 4,
    },
    locationText: {
        fontSize: 12,
        color: '#A0AEC0',
        flex: 1,
    },
    icons: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 2,
    },
    iconButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconImage: {
        width: 14.36,
        height: 15,
    },
    heartIconImage: {
        height: 14,
        width: 17,
    }
});

export default HomeHeader;