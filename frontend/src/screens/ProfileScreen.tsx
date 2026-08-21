import React, { useState } from "react";

import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
    useNavigation,
    useRoute,
    CommonActions,
} from "@react-navigation/native";


// =========================================================
// PROFILE SCREEN
// =========================================================

export default function ProfileScreen() {

    const navigation = useNavigation<any>();

    const route = useRoute<any>();

    const [loggingOut, setLoggingOut] = useState(false);


    // =====================================================
    // USER DATA
    // =====================================================

    const user =
        route.params?.user || {};


    const fullName =
        user?.full_name ||
        user?.name ||
        "Driver";


    const email =
        user?.email ||
        "Not available";


    const phone =
        user?.phone_number ||
        "Not available";


    const city =
        user?.city ||
        "Not available";


    const state =
        user?.state ||
        "Not available";


    const vehicleType =
        user?.vehicle_type ||
        "Not available";


    const vehicleNumber =
        user?.vehicle_number ||
        "Not available";


    const isApproved =
        user?.is_approved === true;


    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = async () => {

        if (loggingOut) {
            return;
        }


        try {

            setLoggingOut(true);


            console.log(
                "================================"
            );

            console.log(
                "LOGOUT STARTED"
            );

            console.log(
                "================================"
            );


            // =================================================
            // CLEAR ALL LOGIN / DRIVER SESSION DATA
            // =================================================

            await AsyncStorage.multiRemove([
                "isLoggedIn",
                "authUser",
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


            console.log(
                "SESSION DATA CLEARED"
            );


            // =================================================
            // VERIFY SESSION WAS REMOVED
            // =================================================

            const loginStatus =
                await AsyncStorage.getItem(
                    "isLoggedIn"
                );


            const savedDriver =
                await AsyncStorage.getItem(
                    "driver"
                );


            const savedUser =
                await AsyncStorage.getItem(
                    "user"
                );


            console.log(
                "isLoggedIn AFTER LOGOUT:",
                loginStatus
            );

            console.log(
                "driver AFTER LOGOUT:",
                savedDriver
            );

            console.log(
                "user AFTER LOGOUT:",
                savedUser
            );


            // =================================================
            // GET DRIVER TAB NAVIGATOR
            // =================================================

            const tabNavigator =
                navigation.getParent();


            // =================================================
            // GET ROOT STACK NAVIGATOR
            //
            // Profile
            //   ↓
            // DriverTabNavigator
            //   ↓
            // App Stack
            // =================================================

            const rootNavigator =
                tabNavigator?.getParent();


            console.log(
                "TAB NAVIGATOR FOUND:",
                !!tabNavigator
            );

            console.log(
                "ROOT NAVIGATOR FOUND:",
                !!rootNavigator
            );


            // =================================================
            // RESET ROOT NAVIGATION TO LOGIN
            // =================================================

            if (rootNavigator) {

                rootNavigator.dispatch(
                    CommonActions.reset({
                        index: 0,

                        routes: [
                            {
                                name: "Login",
                            },
                        ],
                    })
                );

            } else {

                // =================================================
                // FALLBACK
                // =================================================

                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,

                        routes: [
                            {
                                name: "Login",
                            },
                        ],
                    })
                );

            }


            console.log(
                "================================"
            );

            console.log(
                "LOGOUT SUCCESS"
            );

            console.log(
                "REDIRECTED TO LOGIN"
            );

            console.log(
                "================================"
            );


        } catch (error) {

            console.log(
                "LOGOUT ERROR:",
                error
            );

            setLoggingOut(false);

        }

    };


    // =====================================================
    // UI
    // =====================================================

    return (

        <View style={styles.screen}>

            <StatusBar
                backgroundColor="#F6F9F7"
                barStyle="dark-content"
            />


            <ScrollView
                style={styles.container}
                contentContainerStyle={
                    styles.contentContainer
                }
                showsVerticalScrollIndicator={false}
            >

                {/* =================================================
                        PROFILE HEADER
                ================================================= */}

                <View style={styles.profileHeader}>

                    <View style={styles.imageWrapper}>

                        <Image
                            source={{
                                uri:
                                    "https://i.pravatar.cc/300",
                            }}
                            style={styles.profileImage}
                        />

                        <View
                            style={styles.onlineDot}
                        />

                    </View>


                    <Text style={styles.name}>
                        {fullName}
                    </Text>


                    <Text style={styles.phone}>
                        {phone}
                    </Text>


                    <View style={styles.badge}>

                        <View
                            style={styles.badgeDot}
                        />

                        <Text
                            style={styles.badgeText}
                        >
                            {isApproved
                                ? "Verified Driver"
                                : "Verification Pending"}
                        </Text>

                    </View>

                </View>


                {/* =================================================
                        PERSONAL INFORMATION
                ================================================= */}

                <Text style={styles.sectionTitle}>
                    Personal Information
                </Text>


                <View style={styles.card}>

                    <View style={styles.iconBox}>
                        <Text style={styles.icon}>
                            ✉
                        </Text>
                    </View>


                    <View style={styles.infoContent}>

                        <Text style={styles.label}>
                            EMAIL ADDRESS
                        </Text>

                        <Text style={styles.value}>
                            {email}
                        </Text>

                    </View>

                </View>


                <View style={styles.card}>

                    <View style={styles.iconBox}>
                        <Text style={styles.icon}>
                            📍
                        </Text>
                    </View>


                    <View style={styles.infoContent}>

                        <Text style={styles.label}>
                            LOCATION
                        </Text>

                        <Text style={styles.value}>

                            {city}

                            {city !== "Not available" &&
                                state !== "Not available"
                                ? `, ${state}`
                                : ""}

                        </Text>

                    </View>

                </View>


                {/* =================================================
                        VEHICLE INFORMATION
                ================================================= */}

                <Text style={styles.sectionTitle}>
                    Vehicle Information
                </Text>


                <View style={styles.card}>

                    <View style={styles.iconBox}>
                        <Text style={styles.icon}>
                            🛵
                        </Text>
                    </View>


                    <View style={styles.infoContent}>

                        <Text style={styles.label}>
                            VEHICLE TYPE
                        </Text>

                        <Text style={styles.value}>
                            {vehicleType}
                        </Text>

                    </View>

                </View>


                <View style={styles.card}>

                    <View style={styles.iconBox}>
                        <Text style={styles.icon}>
                            🔢
                        </Text>
                    </View>


                    <View style={styles.infoContent}>

                        <Text style={styles.label}>
                            VEHICLE NUMBER
                        </Text>

                        <Text style={styles.value}>
                            {vehicleNumber}
                        </Text>

                    </View>

                </View>


                {/* =================================================
                        ACCOUNT VERIFICATION
                ================================================= */}

                <Text style={styles.sectionTitle}>
                    Account Verification
                </Text>


                <View
                    style={[
                        styles.verificationCard,

                        isApproved
                            ? styles.approvedCard
                            : styles.pendingCard,
                    ]}
                >

                    <View
                        style={[
                            styles.checkCircle,

                            isApproved
                                ? styles.approvedCircle
                                : styles.pendingCircle,
                        ]}
                    >

                        <Text style={styles.checkText}>

                            {isApproved
                                ? "✓"
                                : "!"}

                        </Text>

                    </View>


                    <View
                        style={
                            styles.verificationContent
                        }
                    >

                        <Text
                            style={[
                                styles.verificationTitle,

                                isApproved
                                    ? styles.approvedText
                                    : styles.pendingText,
                            ]}
                        >

                            {isApproved
                                ? "Account Approved"
                                : "Verification Pending"}

                        </Text>


                        <Text
                            style={
                                styles.verificationDescription
                            }
                        >

                            {isApproved
                                ? "Your driver account has been verified and is ready for deliveries."
                                : "Your documents are currently being reviewed."}

                        </Text>

                    </View>

                </View>


                {/* =================================================
                        LOGOUT BUTTON
                ================================================= */}

                <TouchableOpacity
                    style={[
                        styles.logoutButton,

                        loggingOut &&
                        styles.logoutDisabled,
                    ]}
                    onPress={handleLogout}
                    disabled={loggingOut}
                    activeOpacity={0.7}
                >

                    {loggingOut ? (

                        <ActivityIndicator
                            size="small"
                            color="#D93636"
                        />

                    ) : (

                        <>

                            <View
                                style={styles.logoutIcon}
                            >

                                <Text
                                    style={
                                        styles.logoutIconText
                                    }
                                >
                                    ↪
                                </Text>

                            </View>


                            <Text
                                style={styles.logoutText}
                            >
                                Logout
                            </Text>

                        </>

                    )}

                </TouchableOpacity>


                {/* =================================================
                        FOOTER
                ================================================= */}

                <Text style={styles.footer}>
                    Saath Groww • Driver Partner
                </Text>


                <View
                    style={styles.bottomSpace}
                />

            </ScrollView>

        </View>

    );
}


// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({

    screen: {
        flex: 1,
        backgroundColor: "#F6F9F7",
    },


    container: {
        flex: 1,
    },


    contentContainer: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },


    // =====================================================
    // PROFILE HEADER
    // =====================================================

    profileHeader: {

        backgroundColor: "#FFFFFF",

        borderRadius: 22,

        alignItems: "center",

        paddingVertical: 24,

        paddingHorizontal: 20,

        marginBottom: 26,

        elevation: 3,

        shadowColor: "#000",

        shadowOpacity: 0.06,

        shadowRadius: 10,

        shadowOffset: {
            width: 0,
            height: 4,
        },

    },


    imageWrapper: {
        position: "relative",
    },


    profileImage: {

        width: 100,

        height: 100,

        borderRadius: 50,

        borderWidth: 3,

        borderColor: "#1DAB52",

    },


    onlineDot: {

        position: "absolute",

        right: 3,

        bottom: 5,

        width: 20,

        height: 20,

        borderRadius: 10,

        backgroundColor: "#1DAB52",

        borderWidth: 3,

        borderColor: "#FFFFFF",

    },


    name: {

        fontSize: 24,

        fontWeight: "800",

        color: "#222222",

        marginTop: 12,

    },


    phone: {

        fontSize: 14,

        color: "#777777",

        marginTop: 4,

    },


    badge: {

        flexDirection: "row",

        alignItems: "center",

        backgroundColor: "#E8F8EF",

        paddingHorizontal: 14,

        paddingVertical: 7,

        borderRadius: 20,

        marginTop: 12,

    },


    badgeDot: {

        width: 7,

        height: 7,

        borderRadius: 4,

        backgroundColor: "#1DAB52",

        marginRight: 7,

    },


    badgeText: {

        color: "#168A43",

        fontSize: 12,

        fontWeight: "800",

    },


    // =====================================================
    // SECTION
    // =====================================================

    sectionTitle: {

        fontSize: 17,

        fontWeight: "800",

        color: "#242424",

        marginBottom: 11,

        marginTop: 2,

    },


    // =====================================================
    // INFORMATION CARD
    // =====================================================

    card: {

        backgroundColor: "#FFFFFF",

        borderRadius: 16,

        padding: 15,

        marginBottom: 12,

        flexDirection: "row",

        alignItems: "center",

        elevation: 2,

        shadowColor: "#000",

        shadowOpacity: 0.04,

        shadowRadius: 7,

        shadowOffset: {
            width: 0,
            height: 3,
        },

    },


    iconBox: {

        width: 44,

        height: 44,

        borderRadius: 14,

        backgroundColor: "#E8F8EF",

        justifyContent: "center",

        alignItems: "center",

        marginRight: 13,

    },


    icon: {
        fontSize: 19,
    },


    infoContent: {
        flex: 1,
    },


    label: {

        fontSize: 9,

        fontWeight: "800",

        color: "#999999",

        letterSpacing: 0.5,

        marginBottom: 4,

    },


    value: {

        fontSize: 15,

        fontWeight: "700",

        color: "#222222",

    },


    // =====================================================
    // VERIFICATION
    // =====================================================

    verificationCard: {

        borderRadius: 18,

        padding: 17,

        flexDirection: "row",

        alignItems: "center",

        marginBottom: 22,

    },


    approvedCard: {
        backgroundColor: "#E8F8EF",
    },


    pendingCard: {
        backgroundColor: "#FFF7DF",
    },


    checkCircle: {

        width: 46,

        height: 46,

        borderRadius: 23,

        justifyContent: "center",

        alignItems: "center",

        marginRight: 13,

    },


    approvedCircle: {
        backgroundColor: "#1DAB52",
    },


    pendingCircle: {
        backgroundColor: "#EDB131",
    },


    checkText: {

        color: "#FFFFFF",

        fontSize: 24,

        fontWeight: "800",

    },


    verificationContent: {
        flex: 1,
    },


    verificationTitle: {

        fontSize: 15,

        fontWeight: "800",

        marginBottom: 4,

    },


    approvedText: {
        color: "#168A43",
    },


    pendingText: {
        color: "#A16C00",
    },


    verificationDescription: {

        fontSize: 11,

        color: "#6E8177",

        lineHeight: 17,

    },


    // =====================================================
    // LOGOUT
    // =====================================================

    logoutButton: {

        height: 56,

        borderRadius: 15,

        borderWidth: 1,

        borderColor: "#F1BABA",

        backgroundColor: "#FFF5F5",

        flexDirection: "row",

        justifyContent: "center",

        alignItems: "center",

    },


    logoutDisabled: {
        opacity: 0.6,
    },


    logoutIcon: {

        width: 30,

        height: 30,

        borderRadius: 15,

        backgroundColor: "#FFE4E4",

        justifyContent: "center",

        alignItems: "center",

        marginRight: 8,

    },


    logoutIconText: {

        fontSize: 18,

        color: "#D93636",

        fontWeight: "800",

    },


    logoutText: {

        color: "#D93636",

        fontSize: 15,

        fontWeight: "800",

    },


    // =====================================================
    // FOOTER
    // =====================================================

    footer: {

        textAlign: "center",

        color: "#AAAAAA",

        fontSize: 11,

        marginTop: 20,

    },


    bottomSpace: {
        height: 30,
    },

});