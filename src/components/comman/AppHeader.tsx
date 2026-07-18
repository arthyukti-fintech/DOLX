import React from "react";
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  ImageSourcePropType,
  StyleProp,
  ViewStyle,
} from "react-native";
import { router } from "expo-router";

import styles from "./AppHeaderStyles";

interface AppBackButtonProps {
  onBackPress?: () => void;

  onRightPress?: () => void;

  rightIcon?: ImageSourcePropType;

  rightText?: string;

  showRightButton?: boolean;

  style?: StyleProp<ViewStyle>;
}

const AppBackButton: React.FC<AppBackButtonProps> = ({
  onBackPress,
  onRightPress,
  rightIcon,
  rightText = "",
  showRightButton = false,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Back Button */}

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.backButton}
        onPress={onBackPress ?? (() => router.back())}
      >
        <Image
          source={require("../../../assets/Icons/backIcon.png")}
          style={styles.backIcon}
        />
      </TouchableOpacity>

      {/* Right Button */}

      {showRightButton ? (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.rightButton}
          onPress={onRightPress}
        >
          {rightIcon && (
            <Image
              source={rightIcon}
              style={styles.rightIcon}
            />
          )}

          <Text style={styles.rightText}>
            {rightText}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.emptyView} />
      )}
    </View>
  );
};

export default AppBackButton;