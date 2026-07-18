import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

const HERO_HEIGHT = height * 0.5;

export default StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    scroll: {
        flex: 1,
    },

    scrollContent: {
        paddingBottom: 110,
        backgroundColor: '#FFFFFF',
    },

    // ================= Hero =================

    heroContainer: {
        height: HERO_HEIGHT,
        width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
        overflow: 'visible',
        position: 'relative',
    },

    bgImage: {
        position: 'absolute',
        top: -20,
        left: 0,
        width: width,
        height: HERO_HEIGHT + 80,
    },

    overlay: {
        position: 'absolute',
        top: -20,
        left: 0,
        right: 0,
        height: HERO_HEIGHT + 80,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },

    foregroundWrapper: {
        width: width * 0.58,
        height: 220,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 12,
        zIndex: 5,
    },

    foregroundImage: {
        width: '100%',
        height: '100%',
    },

    // ================= Buttons =================

    backButton: {
        position: 'absolute',
        top: 45,
        left: 20,

        width: 42,
        height: 42,
        borderRadius: 21,

        backgroundColor: 'rgba(255,255,255,0.25)',

        justifyContent: 'center',
        alignItems: 'center',

        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.35)',

        zIndex: 10,
    },

    backArrow: {
        color: '#FFFFFF',
        fontSize: 25,
        fontWeight: '600',
        marginTop: -7
    },

    favoriteButton: {
        position: 'absolute',
        top: 55,
        right: 20,

        width: 42,
        height: 42,
        borderRadius: 21,

        backgroundColor: 'rgba(255,255,255,0.25)',

        justifyContent: 'center',
        alignItems: 'center',

        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.35)',

        zIndex: 10,
    },

    favoriteIcon: {
        width: 22,
        height: 22,
        resizeMode: 'contain',
        tintColor: '#FFFFFF',
    },

    // ================= Content =================

    contentContainer: {
        backgroundColor: '#FFFFFF',

        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,

        marginTop: -20,

        paddingTop: 70,
        paddingHorizontal: 24,
        paddingBottom: 30,

        zIndex: 3,
    },

    title: {
        fontSize: 30,
        fontWeight: '700',
        color: '#181818',
        marginBottom: 12,
    },

    shortDescription: {
        fontSize: 15,
        lineHeight: 24,
        color: '#3A3A3A',
        fontWeight: '500',
        marginBottom: 16,
    },

    description: {
        fontSize: 14,
        lineHeight: 24,
        color: '#7A7A7A',
        marginBottom: 24,
    },

    divider: {
        height: 1,
        backgroundColor: '#ECECEC',
        marginBottom: 22,
    },

    serviceCost: {
        fontSize: 15,
        color: '#8E8E8E',
        marginBottom: 8,
    },

    priceRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },

    price: {
        fontSize: 34,
        fontWeight: '700',
        color: '#111111',
    },

    perEvent: {
        fontSize: 15,
        color: '#8E8E8E',
        marginLeft: 6,
        marginBottom: 5,
    },

    // ================= Footer =================

    footer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,

        backgroundColor: '#FFFFFF',

        paddingHorizontal: 20,
        paddingVertical: 18,

        borderTopWidth: 1,
        borderTopColor: '#EFEFEF',
    },

    bookButton: {
        height: 56,
        borderRadius: 14,
        backgroundColor: '#10195C',

        justifyContent: 'center',
        alignItems: 'center',
    },

    bookButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});