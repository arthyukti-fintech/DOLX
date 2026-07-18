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
import styles from './signUpStyles';
import AppBackButton from '@/components/comman/AppHeader';

const SignUpScreen: React.FC = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >

                <AppBackButton />

                {/* Heading */}
                <Text style={styles.heading}>Create Account</Text>
                <Text style={styles.subheading}>Lorem Ipsum has been the industry's</Text>

                {/* Full Name */}
                <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>👤</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        placeholderTextColor="#9CA3AF"
                        value={fullName}
                        onChangeText={setFullName}
                    />
                </View>

                {/* Email */}
                <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>✉️</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                {/* Mobile Number */}
                <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>📞</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Mobile Number"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="phone-pad"
                        value={mobile}
                        onChangeText={setMobile}
                        maxLength={10}
                    />
                </View>

                {/* Password */}
                <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>🔑</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.eyeIcon}>{showPassword ? '👁' : '🙈'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Create Account Button */}
                <TouchableOpacity
                    style={styles.createButton}
                    activeOpacity={0.85}
                    onPress={() => router.push('/signupVerificatonCode')}
                >
                    <Text style={styles.createButtonText}>Create Account</Text>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.orRow}>
                    <View style={styles.orLine} />
                    <Text style={styles.orText}>or register with</Text>
                    <View style={styles.orLine} />
                </View>

                {/* Social Icons */}
                <View style={styles.socialRow}>
                    <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                        <Image
                            source={require('../../../assets/images/google.png')}
                            style={{ width: 22, height: 22 }}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                        <Image
                            source={require('../../../assets/images/facebook.png')}
                            style={{ width: 22, height: 22 }}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                        <Image
                            source={require('../../../assets/images/apple.png')}
                            style={{ width: 22, height: 22 }}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </View>

                {/* Login link */}
                <View style={styles.loginRow}>
                    <Text style={styles.loginText}>Already have an account? </Text>
                    <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/login')}>
                        <Text style={styles.loginLink}>Login Account</Text>
                    </TouchableOpacity>
                </View>

                {/* Terms */}
                <Text style={styles.termsText}>
                    By "Create Account", you agree to the{' '}
                    <Text style={styles.termsLink}>Terms of Use</Text>
                    {' '}and{' '}
                    <Text style={styles.termsLink}>Privacy Policy.</Text>
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SignUpScreen;