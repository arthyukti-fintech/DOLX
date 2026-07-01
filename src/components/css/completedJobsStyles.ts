import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        // padding: 16,
        // backgroundColor: '#F5F5F5',
    },

    card: {
        flexDirection: 'row',
        backgroundColor: '#F3F3F3',
        borderRadius: 20,
        padding: 14,
        marginBottom: 18,
        alignItems: 'center',
        height: 200
    },

    image: {
        width: 100,
        height: 150,
        borderRadius: 18,
    },

    content: {
        flex: 1,
        marginLeft: 15,
    },

    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    title: {
        fontSize: 18,
        fontWeight: '500',
        color: '#1A1A1A',
        flex: 1,
    },

    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    star: {
        fontSize: 12,
        marginRight: 4,
    },

    rating: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1A1A1A',
    },

    description: {
        marginTop: 8,
        fontSize: 12,
        color: '#666',
    },

    infoRow: {
        flexDirection: 'row',
        marginTop: 18,
        alignItems: 'center',
    },

    info: {
        fontSize: 12,
        color: '#4D4D4D',
        marginRight: 18,
    },

    statusContainer: {
        marginTop: 18,
        alignSelf: 'flex-start',
        backgroundColor: '#2EB84A',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },

    check: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
        marginRight: 8,
    },

    statusText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});