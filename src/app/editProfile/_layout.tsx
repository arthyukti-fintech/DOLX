
import GradientBackground from "@/components/comman/GradientBackground";
import { Stack } from "expo-router";

export default function EditProfileScreen() {
    return (
        <GradientBackground colors={['#FFFFFF', '#FFFFFF', '#E8F6EC']} style={{ padding: 0 }}>
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: "transparent" },
                }}
            />
        </GradientBackground>
    );
}