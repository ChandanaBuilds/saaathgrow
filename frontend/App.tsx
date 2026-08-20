
import React from "react";

import {
  NavigationContainer,
} from "@react-navigation/native";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";


// =========================================================
// SCREENS
// =========================================================

import SplashScreen
  from "./src/screens/SplashScreen";

import LoginScreen
  from "./src/screens/LoginScreen";

import OtpScreen
  from "./src/screens/OtpScreen";

import EmailOTPScreen
  from "./src/screens/EmailOTPScreen";

import CreateProfileScreen
  from "./src/screens/CreateProfileScreen";

import DocumentUploadScreen
  from "./src/screens/DocumentUploadScreen";

import VerificationPendingScreen
  from "./src/screens/VerificationPendingScreen";

import DashboardScreen
  from "./src/screens/DashboardScreen";

import HomeScreen
  from "./src/screens/HomeScreen";

import OrdersScreen
  from "./src/screens/OrdersScreen";

import ProfileScreen
  from "./src/screens/ProfileScreen";

import WalletScreen
  from "./src/screens/WalletScreen";


const Stack =
  createNativeStackNavigator();


export default function App() {

  return (

    <NavigationContainer>

      <Stack.Navigator

        initialRouteName="Splash"

        screenOptions={{
          headerShown: false,
        }}
      >

        {/* =================================================
                    SPLASH
                ================================================= */}

        <Stack.Screen
          name="Splash"
          component={SplashScreen}
        />


        {/* =================================================
                    AUTHENTICATION
                ================================================= */}

        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />


        {/* Old phone OTP screen.
                    Kept temporarily so existing imports
                    do not break. */}

        <Stack.Screen
          name="Otp"
          component={OtpScreen}
        />


        {/* New email OTP */}

        <Stack.Screen
          name="EmailOTP"
          component={EmailOTPScreen}
        />


        {/* =================================================
                    REGISTRATION
                ================================================= */}

        <Stack.Screen
          name="CreateProfile"
          component={CreateProfileScreen}
        />


        <Stack.Screen
          name="DocumentUpload"
          component={DocumentUploadScreen}
        />


        <Stack.Screen
          name="VerificationPending"
          component={
            VerificationPendingScreen
          }
        />


        {/* =================================================
                    MAIN APPLICATION
                ================================================= */}

        <Stack.Screen
          name="Main"
          component={HomeScreen}
        />


        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
        />


        <Stack.Screen
          name="Orders"
          component={OrdersScreen}
        />


        <Stack.Screen
          name="Wallet"
          component={WalletScreen}
        />


        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
        />

      </Stack.Navigator>

    </NavigationContainer>
  );
}
