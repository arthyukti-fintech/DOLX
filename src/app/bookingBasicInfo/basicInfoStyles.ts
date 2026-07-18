import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    // ================= Header =================

    header: {
        flexDirection: 'row',
        // alignItems: 'center',
        // justifyContent: 'space-between',
        // paddingHorizontal: 20,
        // paddingTop: 15,
        // paddingBottom: 18,
    },

    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F1F2E',
    },

    // ================= Scroll =================

    scrollContainer: {
        paddingHorizontal: 20,
        paddingBottom: 120,
    },

    // ================= Input Group =================

    inputGroup: {
        marginBottom: 18,
    },

    label: {
        fontSize: 13,
        fontWeight: '500',
        color: '#444444',
        marginBottom: 8,
    },

    // ================= Text Input =================

    input: {
        height: 52,
        borderWidth: 1,
        borderColor: '#E4E4E4',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 14,
        color: '#222222',
        backgroundColor: '#FFFFFF',
    },

    // ================= Dropdown =================

    dropdown: {
        height: 52,
        borderWidth: 1,
        borderColor: '#E4E4E4',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        paddingHorizontal: 16,
    },

    dropdownText: {
        fontSize: 14,
        color: '#222222',
    },

    placeholder: {
        color: '#B8B8B8',
    },

    dropdownIcon: {
        width: 18,
        height: 18,
        resizeMode: 'contain',
        tintColor: '#8F8F8F',
    },

    // ================= Description =================

    descriptionInput: {
        minHeight: 120,
        borderWidth: 1,
        borderColor: '#E4E4E4',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingTop: 14,
        fontSize: 14,
        color: '#222222',
        backgroundColor: '#FFFFFF',
    },

    // ================= Footer =================

    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,

        backgroundColor: '#FFFFFF',

        paddingHorizontal: 20,
        paddingVertical: 16,

        borderTopWidth: 1,
        borderTopColor: '#EFEFEF',
    },

    continueButton: {
        backgroundColor: '#10195C',
        height: 56,
        borderRadius: 14,

        justifyContent: 'center',
        alignItems: 'center',

        shadowColor: '#10195C',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 5,
    },

    continueText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});