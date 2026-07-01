import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        marginTop: 18,
    },

    backButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 1,
        borderColor: "#BDBDBD",
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
    },

    backIcon: {
        width: 18,
        height: 18,
        resizeMode: "contain",
        tintColor: "#4A4A4A",
    },

    rightButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",

        backgroundColor: "#FFFFFF",

        borderWidth: 1,
        borderColor: "#D9D9D9",

        borderRadius: 18,

        paddingHorizontal: 16,
        paddingVertical: 10,
    },

    rightIcon: {
        width: 14,
        height: 14,
        resizeMode: "contain",
        marginRight: 6,
    },

    rightText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#1F1F1F",
    },

    emptyView: {
        width: 42,
    },
});