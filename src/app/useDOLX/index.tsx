import React from 'react';
import {
    Image,
    SafeAreaView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { router } from 'expo-router';
import styles from './useDOLXstyles';

const IMAGES = {
    col1_img1: { uri: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=250&fit=crop' },
    col1_img2: { uri: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&h=180&fit=crop' },
    col1_img3: { uri: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=200&h=200&fit=crop' },
    col1_img4: { uri: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=160&fit=crop' },
    col2_img1: { uri: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=200&h=180&fit=crop' },
    col2_img2: { uri: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=200&h=200&fit=crop' },
    col2_img3: { uri: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=200&h=200&fit=crop' },
    col3_img1: { uri: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=200&h=190&fit=crop' },
    col3_img2: { uri: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=200&h=170&fit=crop' },
    col3_img3: { uri: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200&h=200&fit=crop' },
    col3_img4: { uri: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=200&h=180&fit=crop' },
};

const RoleSelectScreen: React.FC = () => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#0D0D1A" />

            {/* ── Mosaic ── */}
            <View style={styles.mosaicContainer}>
                <View style={styles.mosaicRotated}>
                    <View style={styles.mosaicColumnLeft}>
                        <Image source={IMAGES.col1_img1} style={styles.mosaicImg1} resizeMode="cover" />
                        <Image source={IMAGES.col1_img2} style={styles.mosaicImg2} resizeMode="cover" />
                        <Image source={IMAGES.col1_img3} style={styles.mosaicImg3} resizeMode="cover" />
                        <Image source={IMAGES.col1_img4} style={styles.mosaicImg4} resizeMode="cover" />
                    </View>
                    <View style={styles.mosaicColumnCenter}>
                        <Image source={IMAGES.col2_img1} style={styles.mosaicImg5} resizeMode="cover" />
                        <Image source={IMAGES.col2_img2} style={styles.mosaicImg6} resizeMode="cover" />
                        <Image source={IMAGES.col2_img3} style={styles.mosaicImg7} resizeMode="cover" />
                    </View>
                    <View style={styles.mosaicColumnRight}>
                        <Image source={IMAGES.col3_img1} style={styles.mosaicImg8} resizeMode="cover" />
                        <Image source={IMAGES.col3_img2} style={styles.mosaicImg9} resizeMode="cover" />
                        <Image source={IMAGES.col3_img3} style={styles.mosaicImg10} resizeMode="cover" />
                        <Image source={IMAGES.col3_img4} style={styles.mosaicImg11} resizeMode="cover" />
                    </View>
                </View>
                <View style={styles.mosaicOverlay} pointerEvents="none" />
            </View>

            {/* ── Card ── */}
            <View style={styles.card}>
                <Text style={styles.heading}>How Will You Use DOLX?</Text>
                <Text style={styles.subheading}>Choose your role to get started</Text>

                {/* Event Organizer */}
                <TouchableOpacity
                    style={styles.roleButton}
                    activeOpacity={0.7}
                    onPress={() => router.push('/signup')}
                >
                    <View style={styles.roleIcon}>
                        <Text style={styles.roleIconEmoji}>🗂</Text>
                    </View>
                    <View style={styles.roleTextWrapper}>
                        <Text style={styles.roleTitle}>Event Organizer</Text>
                        <Text style={styles.roleSubtitle}>Hire workers for your events</Text>
                    </View>
                </TouchableOpacity>

                {/* Worker */}
                <TouchableOpacity
                    style={styles.roleButton}
                    activeOpacity={0.7}
                    onPress={() => router.push('/signup')}
                >
                    <View style={styles.roleIcon}>
                        <Text style={styles.roleIconEmoji}>💼</Text>
                    </View>
                    <View style={styles.roleTextWrapper}>
                        <Text style={styles.roleTitle}>Worker</Text>
                        <Text style={styles.roleSubtitle}>Find gigs and earn money</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default RoleSelectScreen;