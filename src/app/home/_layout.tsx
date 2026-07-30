
import GradientBackground from "@/components/comman/GradientBackground";
import { Stack } from "expo-router";

export default function HomeScreen() {
    return (
        <GradientBackground colors={['#FFFFFF', '#FFFFFF', '#FFFFFF']} style={{ padding: 0 }}>
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: "transparent" },
                }}
            />
        </GradientBackground>
    );
}