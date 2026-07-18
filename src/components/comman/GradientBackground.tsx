import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, ViewStyle } from 'react-native';

interface GradientBackgroundProps {
    children: React.ReactNode;
    style?: ViewStyle;
    colors?: readonly [string, string, ...string[]];
}

const DEFAULT_COLORS = ["#e2fce9ff", "#F3FCF5", "#def8e5ff"] as const;

const GradientBackground: React.FC<GradientBackgroundProps> = ({
    children,
    style,
    colors = DEFAULT_COLORS,
}) => {
    return (
        <LinearGradient colors={colors} style={[styles.container, style]}>
            {children}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 10,
        paddingBottom: 10,
    },
});

export default GradientBackground;