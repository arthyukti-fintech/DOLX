import React from "react";
import { View, Image } from "react-native";
import styles from "./AuthHeaderStyles";
const IMAGES = {
    topLeft: require("../../../assets/images/loginFrame1.png"),
    topMiddle: require("../../../assets/images/loginFrame2.png"),
    topRight: require("../../../assets/images/loginFrame3.png"),
    middleLeft: require("../../../assets/images/loginFrame4.png"),
    middleRight: require("../../../assets/images/loginFrame5.png"),
    bottomLeft: require("../../../assets/images/loginFrame6.png"),
    bottomMiddle: require("../../../assets/images/loginFrame1.png"),
    bottomRight: require("../../../assets/images/loginFrame2.png"),
};

const AuthMosaic = () => {
    return (
        <View style={styles.mosaicContainer}>
            <View style={styles.mosaicRotated}>
                <View style={[styles.mosaicColumn, styles.mosaicColumnLeft]}>
                    <Image source={IMAGES.topLeft} style={styles.mosaicImgTall} />
                    <Image source={IMAGES.middleLeft} style={styles.mosaicImgWide} />
                    <Image source={IMAGES.bottomLeft} style={styles.mosaicImgSquare} />
                </View>

                <View style={[styles.mosaicColumn, styles.mosaicColumnCenter]}>
                    <Image source={IMAGES.topMiddle} style={styles.mosaicImgSquare} />
                    <Image source={IMAGES.bottomMiddle} style={styles.mosaicImgTall} />
                </View>

                <View style={[styles.mosaicColumn, styles.mosaicColumnRight]}>
                    <Image source={IMAGES.topRight} style={styles.mosaicImgTall} />
                    <Image source={IMAGES.middleRight} style={styles.mosaicImgSquare} />
                    <Image source={IMAGES.bottomRight} style={styles.mosaicImgSquare} />
                </View>
            </View>

            <View style={styles.mosaicOverlay} />
        </View>
    );
};

export default AuthMosaic;