import React from 'react';
import {
    View,
    Image,
    StyleSheet,
    Dimensions,
} from 'react-native';

// const { width } = Dimensions.get('window');

const Footer = () => {
    return (
        <View style={styles.container}>
            <Image
                source={require('../../assets/images/DOLX.png')} // Your footer image
                style={styles.footerImage}
                resizeMode="cover"
            />
        </View>
    );
};

export default Footer;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        // backgroundColor: '#fff',
        marginTop: 60
    },

    footerImage: {
        width: 360,
        height: 99, // Adjust according to your image
    },
});