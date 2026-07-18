import React, { useEffect } from "react";
import {
    View,
    Text,
    Image,
} from "react-native";
import { router } from "expo-router";
import styles from "@/components/css/onboardingScreen";

const SplashScreen = () => {
    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace("/login");
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            {/* Top Left Image */}
            <Image
                source={require("../../assets/images/top_circle.png")}
                style={styles.topCircle}
                resizeMode="contain"
            />

            {/* Bottom Right Image */}
            <Image
                source={require("../../assets/images/bottom_circle.png")}
                style={styles.bottomCircle}
                resizeMode="contain"
            />

            {/* Center Content */}
            <View style={styles.centerContent}>
                <Text style={styles.logoText}>DOLX</Text>

                <Text style={styles.tagline}>
                    Event Hiring Made Simple
                </Text>
            </View>
        </View>
    );
};

export default SplashScreen;