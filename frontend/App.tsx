import React from "react";

import {
  NavigationContainer,
} from "@react-navigation/native";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

// =========================================================
// AUTH / REGISTRATION SCREENS
// =========================================================

import SplashScreen
  from "./src/screens/SplashScreen";

import LoginScreen
  from "./src/screens/LoginScreen";

import RegisterScreen
  from "./src/screens/RegisterScreen";

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


// =========================================================
// OTHER SCREENS
// =========================================================

import HomeScreen
  from "./src/screens/HomeScreen";

import AdminDashboardScreen
  from "./src/screens/AdminDashboardScreen";

import AdminLoginScreen
  from "./src/screens/AdminLoginScreen";


// =========================================================
// DRIVER NAVIGATION
// =========================================================

import DriverTabNavigator
  from "./src/navigation/DriverTabNavigator";


// =========================================================
// NAVIGATION
// =========================================================

const Stack =
  createNativeStackNavigator();


// =========================================================
// APP
// =========================================================

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
                        USER LOGIN
        ================================================= */}

        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />


        {/* =================================================
                        USER REGISTRATION
        ================================================= */}

        <Stack.Screen
          name="Register"
          component={RegisterScreen}
        />

        <Stack.Screen
          name="Otp"
          component={OtpScreen}
        />

        <Stack.Screen
          name="EmailOTP"
          component={EmailOTPScreen}
        />


        {/* =================================================
                        PROFILE CREATION
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
          component={VerificationPendingScreen}
        />


        {/* =================================================
                        DRIVER APPLICATION
                        
                        Contains:
                        
                        Home
                        Orders
                        Wallet
                        Profile
        ================================================= */}

        <Stack.Screen
          name="DriverApp"
          component={DriverTabNavigator}
          options={{
            headerShown: false,
          }}
        />


        {/* =================================================
                        NORMAL HOME
        ================================================= */}

        <Stack.Screen
          name="Main"
          component={HomeScreen}
        />


        {/* =================================================
                        ADMIN LOGIN
        ================================================= */}

        <Stack.Screen
          name="AdminLogin"
          component={AdminLoginScreen}
          options={{
            headerShown: false,
          }}
        />


        {/* =================================================
                        ADMIN DASHBOARD
        ================================================= */}

        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboardScreen}
          options={{
            headerShown: false,
          }}
        />

      </Stack.Navigator>

    </NavigationContainer>
  );
}