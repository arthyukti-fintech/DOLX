import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
    },

    /* Header */

    header: {
        marginTop: 18,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    backButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 1,
        borderColor: '#9E9E9E',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },

    backIcon: {
        width: 18,
        height: 18,
        resizeMode: 'contain',
    },

    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D5D5D5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
    },

    editIcon: {
        width: 14,
        height: 14,
        resizeMode: 'contain',
        marginRight: 5,
    },

    editText: {
        fontSize: 13,
        color: '#4A4A4A',
        fontWeight: '500',
    },

    /* Profile */

    profileSection: {
        alignItems: 'center',
        marginTop: 18,
        marginBottom: 30,
    },

    profileImage: {
        width: 140,
        height: 140,
        borderRadius: 46,
    },

    name: {
        marginTop: 18,
        fontSize: 30,
        fontWeight: '700',
        color: '#171717',
    },

    email: {
        marginTop: 6,
        fontSize: 13,
        color: '#777777',
    },

    /* Personal Info */

    personalSection: {
        backgroundColor: '#09124E',
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        paddingTop: 18,
        flex: 1,
    },

    personalTitle: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '700',
        marginLeft: 18,
        marginBottom: 16,
    },

    menuCard: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingVertical: 10,
        marginTop:2
        // height:100
    },

    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        paddingVertical: 16,
        // borderBottomWidth: 1,
        borderBottomColor: '#F2F2F2',
        height: 65
    },

    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    iconContainer: {
        width: 46,
        height: 46,
        borderRadius: 21,
        backgroundColor: '#F1F1F1',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },

    menuIcon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },

    menuTitle: {
        fontSize: 16,
        color: '#1B1B1B',
        fontWeight: '500',
    },

    arrow: {
        width: 18,
        height: 18,
        resizeMode: 'contain',
        tintColor: '#7A7A7A',
    },

    /* Logout */

    logoutButton: {
        position: 'absolute',
        bottom: 10,
        left: 16,
        right: 16,
        height: 52,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#D9D9D9',
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },

    logoutIcon: {
        width: 18,
        height: 18,
        resizeMode: 'contain',
        marginRight: 8,
        tintColor: '#5A5A5A',
    },

    logoutText: {
        fontSize: 18,
        color: '#4D4D4D',
        fontWeight: '500',
    },
});