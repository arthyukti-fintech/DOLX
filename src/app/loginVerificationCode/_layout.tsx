
import GradientBackground from "@/components/comman/GradientBackground";
import { Stack } from "expo-router";

export default function LoginVerificationScreen() {
    return (
        <GradientBackground colors={['#FFFFFF', '#FFFFFF', '#E8F6EC']} >
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: "transparent" },
                }}
            />
        </GradientBackground>
    );
}