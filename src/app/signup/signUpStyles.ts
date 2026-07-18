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

    /* ── Heading ── */
    heading: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 6,
        marginTop: 20
    },
    subheading: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 28,
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
        fontSize: 16,
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: '#111827',
    },
    eyeIcon: {
        fontSize: 16,
        color: '#9CA3AF',
    },

    /* ── Create Account button ── */
    createButton: {
        backgroundColor: '#1C2340',
        borderRadius: 12,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 6,
        marginBottom: 24,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.3,
    },

    /* ── OR divider ── */
    orRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
    },
    orLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    orText: {
        fontSize: 12,
        color: '#9CA3AF',
    },

    /* ── Social icons ── */
    socialRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 24,
    },
    socialButton: {
        width: 52,
        height: 52,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },

    /* ── Login link ── */
    loginRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    loginText: {
        fontSize: 13,
        color: '#6B7280',
    },
    loginLink: {
        fontSize: 13,
        color: '#1C2340',
        fontWeight: '600',
    },

    /* ── Terms ── */
    termsText: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 18,
    },
    termsLink: {
        color: '#1C2340',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});

export default styles;