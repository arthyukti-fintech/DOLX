import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 12,
        marginHorizontal: 16,
        marginBottom: 12,
    },

    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    creditBackground: {
        backgroundColor: '#DDF5E2',
    },

    debitBackground: {
        backgroundColor: '#FBE0E0',
    },

    icon: {
        width: 18,
        height: 18,
        resizeMode: 'contain',
    },

    content: {
        flex: 1,
        justifyContent: 'center',
    },

    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1D1D1D',
        marginBottom: 6,
    },

    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },

    infoIcon: {
        width: 11,
        height: 11,
        resizeMode: 'contain',
        tintColor: '#555555',
        marginRight: 4,
    },

    infoText: {
        fontSize: 10,
        color: '#666666',
        marginRight: 10,
    },

    amount: {
        fontSize: 15,
        fontWeight: '700',
        marginLeft: 12,
    },
});