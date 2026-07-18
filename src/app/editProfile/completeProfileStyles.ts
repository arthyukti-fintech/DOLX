import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 32,
    },

    /* ── Back button ── */
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#A8A8A8',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        marginTop: 8,
    },
    backArrow: {
        fontSize: 20,
        color: '#4A4A4A',
        lineHeight: 24,
    },

    /* ── Avatar ── */
    avatarSection: {
        alignItems: 'center',
        marginBottom: 36,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 14,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#D1D5DB',
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarEditButton: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#6B7280',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarEditIcon: {
        fontSize: 14,
    },
    fullNameText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },

    /* ── Inputs ── */
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        height: 52,
        paddingHorizontal: 14,
        marginBottom: 14,
        backgroundColor: '#FFFFFF',
    },
    inputIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: '#111827',
    },

    /* ── Bottom bar ── */
    bottomBar: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        paddingTop: 12,
        backgroundColor: '#FFFFFF',
    },
    completeButton: {
        backgroundColor: '#1C2340',
        borderRadius: 12,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
    },
    completeButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
});

export default styles;