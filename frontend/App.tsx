import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import SplashScreen from "./src/screens/SplashScreen";
import LoginScreen from "./src/screens/LoginScreen";
import OtpScreen from "./src/screens/OtpScreen";
import CreateProfileScreen from "./src/screens/CreateProfileScreen";
import DocumentUploadScreen from "./src/screens/DocumentUploadScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import HomeScreen from "./src/screens/HomeScreen";
import OrdersScreen from "./src/screens/OrdersScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Splash */}
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
        />

        {/* Authentication */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />

        <Stack.Screen
          name="Otp"
          component={OtpScreen}
        />

        {/* Registration */}
        <Stack.Screen
          name="CreateProfile"
          component={CreateProfileScreen}
        />

        <Stack.Screen
          name="DocumentUpload"
          component={DocumentUploadScreen}
        />

        {/* Main App */}
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
          name="Profile"
          component={ProfileScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}