import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#F3F3F3',
        borderRadius: 16,
        padding: 14,
        marginHorizontal: 20,
        marginBottom: 14,
        alignItems: 'flex-start',
    },

    image: {
        width: 120,
        height: 120,
        borderRadius: 10,
    },

    content: {
        flex: 1,
        marginLeft: 14,
    },

    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    title: {
        flex: 1,
        fontSize: 19,
        fontWeight: '700',
        color: '#1F1F1F',
        marginRight: 8,
    },

    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    star: {
        fontSize: 14,
        marginRight: 3,
    },

    rating: {
        fontSize: 15,
        fontWeight: '500',
        color: '#202020',
    },

    description: {
        marginTop: 6,
        fontSize: 12,
        color: '#767676',
        lineHeight: 18,
    },

    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },

    infoIcon: {
        width: 14,
        height: 14,
        resizeMode: 'contain',
        tintColor: '#5F5F5F',
        marginRight: 6,
    },

    infoText: {
        fontSize: 12,
        color: '#565656',
    },

    confirmedBadge: {
        marginTop: 12,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#151A5C',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 18,
    },

    pendingBadge: {
        marginTop: 12,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3A700',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 18,
    },

    completedBadge: {
        marginTop: 12,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2FA84F',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 18,
    },

    statusIcon: {
        width: 14,
        height: 14,
        resizeMode: 'contain',
        tintColor: '#FFFFFF',
        marginRight: 5,
    },

    statusText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
});