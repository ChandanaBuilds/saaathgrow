import React, {
    useEffect,
} from "react";

import {
    View,
    Text,
    StyleSheet,
    Image,
    StatusBar,
} from "react-native";

import AsyncStorage from
    "@react-native-async-storage/async-storage";


// =========================================================
// SPLASH SCREEN
// =========================================================

export default function SplashScreen({
    navigation,
}: any) {

    useEffect(() => {

        checkLogin();

    }, []);


    // =====================================================
    // CHECK LOGIN
    // =====================================================

    const checkLogin = async () => {

        try {

            console.log(
                "================================="
            );

            console.log(
                "SPLASH: CHECKING LOGIN"
            );

            console.log(
                "================================="
            );


            // Give splash screen some time
            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        1500
                    )
            );


            // =============================================
            // GET LOGIN STATUS
            // =============================================

            const isLoggedIn =
                await AsyncStorage.getItem(
                    "isLoggedIn"
                );


            const authUser =
                await AsyncStorage.getItem(
                    "authUser"
                );


            const user =
                await AsyncStorage.getItem(
                    "user"
                );


            const driver =
                await AsyncStorage.getItem(
                    "driver"
                );


            console.log(
                "SPLASH LOGIN STATUS:",
                isLoggedIn
            );

            console.log(
                "SPLASH AUTH USER:",
                authUser
            );

            console.log(
                "SPLASH USER:",
                user
            );

            console.log(
                "SPLASH DRIVER:",
                driver
            );


            // =============================================
            // NOT LOGGED IN
            // =============================================

            if (
                isLoggedIn !== "true"
            ) {

                console.log(
                    "NO ACTIVE SESSION"
                );

                console.log(
                    "GOING TO LOGIN"
                );


                navigation.replace(
                    "Login"
                );

                return;
            }


            // =============================================
            // FIND DRIVER DATA
            // =============================================

            let driverData: any = null;


            if (driver) {

                try {

                    driverData =
                        JSON.parse(driver);

                } catch {

                    driverData = null;

                }

            }


            if (!driverData && authUser) {

                try {

                    driverData =
                        JSON.parse(authUser);

                } catch {

                    driverData = null;

                }

            }


            if (!driverData && user) {

                try {

                    driverData =
                        JSON.parse(user);

                } catch {

                    driverData = null;

                }

            }


            // =============================================
            // LOGGED IN + DRIVER FOUND
            // =============================================

            if (
                isLoggedIn === "true" &&
                driverData
            ) {

                console.log(
                    "RESTORING DRIVER SESSION:",
                    driverData
                );


                navigation.replace(
                    "DriverApp",
                    {
                        user:
                            driverData,
                    }
                );

                return;
            }


            // =============================================
            // LOGIN FLAG EXISTS BUT USER DATA MISSING
            // =============================================

            console.log(
                "LOGIN FLAG EXISTS BUT USER DATA IS MISSING"
            );


            // Clear invalid session

            await AsyncStorage.multiRemove([
                "authUser",
                "isLoggedIn",
                "user",
                "userId",
                "email",
                "token",
                "access_token",
                "refresh_token",
                "driver",
                "driverId",
                "driverSession",
                "driver_session",
                "loggedInUser",
                "loginUser",
                "currentUser",
            ]);


            navigation.replace(
                "Login"
            );


        } catch (error) {

            console.log(
                "SPLASH SESSION ERROR:",
                error
            );


            // If anything goes wrong,
            // start from Login.

            await AsyncStorage.multiRemove([
                "authUser",
                "isLoggedIn",
                "user",
                "userId",
                "email",
                "token",
                "access_token",
                "refresh_token",
                "driver",
                "driverId",
                "driverSession",
                "driver_session",
                "loggedInUser",
                "loginUser",
                "currentUser",
            ]);


            navigation.replace(
                "Login"
            );
        }

    };


    // =====================================================
    // UI
    // =====================================================

    return (

        <View style={styles.container}>

            <StatusBar
                backgroundColor="#FFFDFF"
                barStyle="dark-content"
            />


            <Image
                source={
                    require("../../assets/logo.jpeg")
                }
                style={styles.logo}
                resizeMode="contain"
            />


            <Text style={styles.appName}>
                Saath Groww
            </Text>


            <Text style={styles.tagline}>
                Groww together, earn together
            </Text>

        </View>
    );
}


// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#FFFDFF",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
    },


    logo: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },


    appName: {
        fontSize: 34,
        fontWeight: "800",
        color: "#1DAB52",
    },


    tagline: {
        marginTop: 8,
        fontSize: 15,
        color: "#78C4D8",
    },

});