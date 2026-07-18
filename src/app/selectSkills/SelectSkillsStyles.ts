import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    content: {
        flexGrow: 1,
        padding: 20,
    },

    backButton: {
        marginTop: 40,
        width: 40,
    },

    title: {
        fontSize: 26,
        fontWeight: '700',
        color: '#000',
        marginTop: 20,
    },

    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 6,
    },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#D9D9D9',
        borderRadius: 14,
        paddingHorizontal: 12,
        height: 52,
        backgroundColor: '#FFF',
    },

    searchIcon: {
        marginRight: 8,
    },

    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#000',
    },

    skillsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 20,
    },

    skillChip: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#D9D9D9',
        backgroundColor: '#FFF',
        marginRight: 10,
        marginBottom: 10,
    },

    selectedChip: {
        backgroundColor: '#0D1540',
        borderColor: '#0D1540',
    },

    skillText: {
        color: '#000',
        fontWeight: '500',
    },

    selectedText: {
        color: '#FFF',
    },

    footer: {
        marginTop: 'auto',
        paddingTop: 30,
    },

    termsText: {
        textAlign: 'center',
        fontSize: 12,
        color: '#666',
        lineHeight: 18,
    },

    continueButton: {
        marginTop: 16,
        height: 54,
        borderRadius: 14,
        backgroundColor: '#0D1540',
        justifyContent: 'center',
        alignItems: 'center',
    },

    continueText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});