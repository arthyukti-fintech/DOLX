import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Keyboard,
} from "react-native";
import { router } from "expo-router";
import AppHeader from "@/components/comman/AppHeader";
import styles from "./styles";

export default function OtpScreen() {
    const [seconds, setSeconds] = useState(30);

    const inputs = useRef<(TextInput | null)[]>([]);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);

    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleOtpChange = (value: string, index: number) => {
        const updatedOtp = [...otp];
        updatedOtp[index] = value;
        setOtp(updatedOtp);

        if (value && index < 5) {
            inputs.current[index + 1]?.focus();
        }

        if (!value && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleContinue = () => {
        // const enteredOtp = otp.join("");

        // console.log("OTP:", enteredOtp);

        // Keyboard.dismiss();

        router.push("/editProfile");
    };

    return (
        <View style={styles.container}>
            {/* Back Button */}

            <AppHeader />

            {/* Title */}
            <Text style={styles.title}>
                Enter Verification Code
            </Text>

            <Text style={styles.subtitle}>
                We've sent a 6-digit code
            </Text>

            {/* OTP Inputs */}
            <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(ref) => {
                            inputs.current[index] = ref;
                        }}
                        style={styles.otpInput}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={digit}
                        onChangeText={(value) =>
                            handleOtpChange(value, index)
                        }
                    />
                ))}
            </View>

            {/* Continue Button */}
            <TouchableOpacity
                style={styles.continueButton}
                onPress={handleContinue}
            >
                <Text style={styles.continueText}>
                    Continue
                </Text>
            </TouchableOpacity>

            {/* Timer */}
            <TouchableOpacity>
                <Text style={styles.timerText}>
                    {seconds > 0
                        ? `Resend OTP in ${seconds}s`
                        : "Resend OTP"}
                </Text>
            </TouchableOpacity>

            <View style={styles.flexSpacer} />

            {/* Terms */}
            <Text style={styles.termsText}>
                By "Create Account", you agree to the{" "}
                <Text style={styles.linkText}>
                    Terms of Use
                </Text>{" "}
                and{" "}
                <Text style={styles.linkText}>
                    Privacy Policy
                </Text>
                .
            </Text>
        </View>
    );
}