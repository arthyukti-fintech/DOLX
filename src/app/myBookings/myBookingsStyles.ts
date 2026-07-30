import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    darkSection: {
        backgroundColor: '#011945',
        paddingHorizontal: 20,
        paddingTop: 36,
        paddingBottom: 20,
        height: 220
    },

    headingContainer: {
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    heading: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F1F1F',
    },

    viewAll: {
        fontSize: 14,
        color: '#8B8B8B',
        textDecorationLine: 'underline',
    },

    list: {
        flex: 1,
    },

    listContent: {
        paddingBottom: 30,
    },
});