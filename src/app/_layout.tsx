import { Drawer } from "expo-router/drawer";
import { Dimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const screenWidth = Dimensions.get("window").width;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerActiveTintColor: "#0b381d",
          drawerInactiveTintColor: "#202020",
          drawerActiveBackgroundColor: "#e6ecf1",
          drawerStyle: {
            backgroundColor: "#ffffff",
            width: screenWidth * 0.75,
          },
          drawerLabelStyle: {
            fontSize: 16,
          },
          overlayColor: "transparent",
          drawerType: "front",
        }}
      >
        <Drawer.Screen name="login" options={{ title: "login" }} />
        <Drawer.Screen name="loginVerificationCode" options={{ title: "loginVerificationCode" }} />
        <Drawer.Screen name="useDOLX" options={{ title: "useDOLX" }} />
        <Drawer.Screen name="signup" options={{ title: "signup" }} />
        <Drawer.Screen name="signupVerificatonCode" options={{ title: "signupVsignupVerificatonCodeerificationCode" }} />
        <Drawer.Screen name="editProfile" options={{ title: "editProfile" }} />
        <Drawer.Screen name="selectSkills" options={{ title: "selectSkills" }} />
        <Drawer.Screen name="home" options={{ title: "home" }} />
        <Drawer.Screen name="myBookings" options={{ title: "myBookings" }} />
        <Drawer.Screen name="eventPlannerScreen" options={{ title: "eventPlannerScreen" }} />
        <Drawer.Screen name="bookingBasicInfo" options={{ title: "bookingBasicInfo" }} />

        {/* signupVerificationCode */}
      </Drawer>
    </GestureHandlerRootView>
  );
}