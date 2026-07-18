import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#011945", // AppColors.primary
    },

    topCircle: {
        position: "absolute",
        top: 98,
        left: -56,
        width: 193,
        height: 193,
    },

    bottomCircle: {
        position: "absolute",
        top: 784,
        left: 305,
        width: 168,
        height: 168,
    },

    centerContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    logoText: {
        fontSize: 80,
        fontWeight: "700",
        color: "#FFFFFF",
        letterSpacing: 2,
        lineHeight: 80,
    },

    tagline: {
        marginTop: 8,
        fontSize: 16,
        fontWeight: "400",
        color: "#E5E5E5",
    },
});

export default styles;