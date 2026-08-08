import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import OtpScreen from "../screens/OtpScreen";
import RegisterScreen from "../screens/RegisterScreen";
import DashboardScreen from "../screens/DashboardScreen";
import CreateProfileScreen from "../screens/CreateProfileScreen";
import HomeScreen from "../screens/HomeScreen";
import MainTabNavigator from "./MainTabNavigator";
import VerificationPendingScreen from "../screens/VerificationPendingScreen";
import DocumentUploadScreen from "../screens/DocumentUploadScreen";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen
                    name="Otp"
                    component={OtpScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Dashboard" component={DashboardScreen} />
                <Stack.Screen
                    name="CreateProfile"
                    component={CreateProfileScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Main"
                    component={MainTabNavigator}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="VerificationPending"
                    component={VerificationPendingScreen}
                />
                <Stack.Screen
                    name="DocumentUpload"
                    component={DocumentUploadScreen}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}