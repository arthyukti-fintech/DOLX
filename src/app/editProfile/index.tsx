import React, { useState } from 'react';
import {
    SafeAreaView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image,
    ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import styles from './completeProfileStyles';
import AppBackButton from '@/components/comman/AppHeader';

const CompleteProfileScreen: React.FC = () => {
    const [role, setRole] = useState('');
    const [aadhar, setAadhar] = useState('');
    const [currentLocation, setCurrentLocation] = useState('');
    const [cityArea, setCityArea] = useState('');
    const [profileImage, setProfileImage] = useState<string | null>(null);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >

                <AppBackButton />

                {/* Avatar */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarWrapper}>
                        {profileImage ? (
                            <Image
                                source={{ uri: profileImage }}
                                style={styles.avatarImage}
                            />
                        ) : (
                            <View style={styles.avatarPlaceholder} />
                        )}
                        <TouchableOpacity style={styles.avatarEditButton} activeOpacity={0.8}>
                            <Text style={styles.avatarEditIcon}>📷</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.fullNameText}>Full Name</Text>
                </View>

                {/* Inputs */}
                <View style={styles.inputWrapper}>
                    <Image
                        source={require('../../../assets/images/userIcon.png')} // your image path
                        style={styles.inputIcon}
                        resizeMode="contain"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Your Role"
                        placeholderTextColor="#9CA3AF"
                        value={role}
                        onChangeText={setRole}
                    />
                </View>

                <View style={styles.inputWrapper}>
                    <Image
                        source={require('../../../assets/images/userIcon.png')} // your image path
                        style={styles.inputIcon}
                        resizeMode="contain"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Enter Your Aadhar Number"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="number-pad"
                        value={aadhar}
                        onChangeText={setAadhar}
                        maxLength={12}
                    />
                </View>

                <View style={styles.inputWrapper}>
                    <Image
                        source={require('../../../assets/images/userIcon.png')} // your image path
                        style={styles.inputIcon}
                        resizeMode="contain"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Your Current Location"
                        placeholderTextColor="#9CA3AF"
                        value={currentLocation}
                        onChangeText={setCurrentLocation}
                    />
                </View>

                <View style={styles.inputWrapper}>
                    <Image
                        source={require('../../../assets/images/userIcon.png')} // your image path
                        style={styles.inputIcon}
                        resizeMode="contain"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Your Location (City + Area)"
                        placeholderTextColor="#9CA3AF"
                        value={cityArea}
                        onChangeText={setCityArea}
                    />
                </View>
            </ScrollView>

            {/* Complete Button — pinned to bottom */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={styles.completeButton}
                    activeOpacity={0.85}
                    onPress={() => router.push('/selectSkills')}
                >
                    <Text style={styles.completeButtonText}>Complete</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default CompleteProfileScreen;