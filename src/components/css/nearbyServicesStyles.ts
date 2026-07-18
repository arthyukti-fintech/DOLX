import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        marginTop: 20,
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
    },

    heading: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E1E1E',
    },

    arrowContainer: {
        flexDirection: 'row',
    },

    arrowButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        borderWidth: 1,
        borderColor: '#D9D9D9',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        backgroundColor: '#FFF',
    },

    arrow: {
        fontSize: 20,
        color: '#777',
        fontWeight: '600',
    },

    card: {
        width: 290,
        backgroundColor: '#F3F3F3',
        borderRadius: 22,
        overflow: 'hidden',
    },

    image: {
        width: '100%',
        height: 170,
    },

    content: {
        padding: 16,
    },

    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F1F1F',
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
        fontSize: 13,
        fontWeight: '600',
    },

    description: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },

    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
    },

    locationIcon: {
        marginRight: 6,
    },

    location: {
        fontSize: 14,
        color: '#555',
    },

    button: {
        marginTop: 18,
        backgroundColor: '#10195C',
        alignSelf: 'flex-start',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 25,
    },

    buttonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 12,
    },
});