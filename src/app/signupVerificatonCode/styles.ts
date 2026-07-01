import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 20,
        // paddingTop: 60,
        paddingBottom: 30,
    },

    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
    },

    backArrow: {
        fontSize: 22,
        color: "#000",
    },

    title: {
        marginTop: 20,
        fontSize: 36,
        fontWeight: "600",
        color: "#000",
        lineHeight: 44,
    },

    subtitle: {
        marginTop: 8,
        fontSize: 14,
        color: "#666",
    },

    otpContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 24,
    },

    otpInput: {
        width: 48,
        height: 56,
        borderWidth: 1,
        borderColor: "#D9D9D9",
        borderRadius: 10,
        textAlign: "center",
        fontSize: 20,
        color: "#000",
    },

    continueButton: {
        marginTop: 30,
        height: 52,
        borderRadius: 12,
        backgroundColor: "#081B4B",
        justifyContent: "center",
        alignItems: "center",
    },

    continueText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "600",
    },

    timerText: {
        marginTop: 20,
        fontSize: 14,
        color: "#000",
        textDecorationLine: "underline",
    },

    flexSpacer: {
        flex: 1,
    },

    termsText: {
        textAlign: "center",
        fontSize: 13,
        color: "#666",
        lineHeight: 20,
    },

    linkText: {
        color: "#000",
        fontWeight: "600",
    },
});

export default styles;