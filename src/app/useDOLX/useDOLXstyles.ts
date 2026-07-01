import { Dimensions, StyleSheet } from 'react-native';

const { height } = Dimensions.get('window');
const MOSAIC_HEIGHT = height * 0.60;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },

    /* ── Mosaic ── */
    mosaicContainer: {
        height: MOSAIC_HEIGHT,
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    mosaicRotated: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 8,
        transform: [{ rotate: '12deg' }],
        marginTop: -30,
        marginLeft: -30,
        marginRight: -10,
    },
    mosaicColumnLeft: {
        flex: 1,
        gap: 8,
        marginTop: 0,
    },
    mosaicColumnCenter: {
        flex: 1,
        gap: 8,
        marginTop: 40,
    },
    mosaicColumnRight: {
        flex: 1,
        gap: 8,
        marginTop: 15,
    },
    mosaicImg1: { width: '100%', height: 150, borderRadius: 14 },
    mosaicImg2: { width: '100%', height: 120, borderRadius: 14 },
    mosaicImg3: { width: '100%', height: 130, borderRadius: 14 },
    mosaicImg4: { width: '100%', height: 110, borderRadius: 14 },
    mosaicImg5: { width: '100%', height: 130, borderRadius: 14 },
    mosaicImg6: { width: '100%', height: 150, borderRadius: 14 },
    mosaicImg7: { width: '100%', height: 130, borderRadius: 14 },
    mosaicImg8: { width: '100%', height: 140, borderRadius: 14 },
    mosaicImg9: { width: '100%', height: 120, borderRadius: 14 },
    mosaicImg10: { width: '100%', height: 130, borderRadius: 14 },
    mosaicImg11: { width: '100%', height: 120, borderRadius: 14 },
    mosaicOverlay: {
        ...StyleSheet.absoluteFill,
    },

    /* ── Card ── */
    card: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -32,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 40,
    },
    heading: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 6,
    },
    subheading: {
        fontSize: 13,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 28,
    },

    /* ── Role buttons ── */
    roleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 14,
        padding: 16,
        marginBottom: 14,
        backgroundColor: '#EBEBEC',
    },
    roleIcon: {
        width: 46,
        height: 46,
        borderRadius: 10,
        backgroundColor: '#1C2340',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    roleIconEmoji: {
        fontSize: 20,
    },
    roleTextWrapper: {
        flex: 1,
    },
    roleTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 3,
    },
    roleSubtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
});

export default styles;