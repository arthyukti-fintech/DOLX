import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet } from 'react-native';

const HomeBanner: React.FC = () => {
    return (
        <View style={styles.wrapper}>
            <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&fit=crop' }}
                style={styles.banner}
                imageStyle={styles.bannerImage}
            >
                <View style={styles.overlay}>
                    <Text style={styles.title}>Premium{'\n'}Events{'\n'}For You</Text>
                    <TouchableOpacity style={styles.bookButton} activeOpacity={0.8}>
                        <Text style={styles.bookText}>Book Now →</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        paddingHorizontal: 20,
        marginTop: -10,
        marginBottom: 20,
        backgroundColor: '#F5F6FA',
        paddingTop: 20,
    },
    banner: {
        height: 160,
        borderRadius: 16,
        overflow: 'hidden',
    },
    bannerImage: {
        borderRadius: 16,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(20, 25, 55, 0.45)',
        borderRadius: 16,
        padding: 20,
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
        lineHeight: 28,
    },
    bookButton: {
        backgroundColor: '#E67E22',
        alignSelf: 'flex-start',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
    },
    bookText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
});

export default HomeBanner;