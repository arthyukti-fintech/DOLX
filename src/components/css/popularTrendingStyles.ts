import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        marginTop: 25,
    },

    header: {
        marginHorizontal: 20,
        marginBottom: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    heading: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F1F2E',
    },

    viewAll: {
        fontSize: 16,
        color: '#A3A3A3',
        textDecorationLine: 'underline',
    },

    card: {
        width: 190,
    },

    image: {
        width: 190,
        height: 225,
        borderRadius: 24,
    },

    heartButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },

    heart: {
        fontSize: 22,
        color: '#E54773',
    },

    title: {
        marginTop: 14,
        fontSize: 17,
        fontWeight: '700',
        color: '#202020',
    },

    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },

    star: {
        fontSize: 16,
        marginRight: 6,
    },

    rating: {
        fontSize: 16,
        color: '#3A3A3A',
    },
});