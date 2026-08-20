import React, { useState } from "react";

import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Image,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";

import axios from "axios";

import { useNavigation } from "@react-navigation/native";


// =====================================================
// BACKEND URL
// =====================================================

const API_URL = "https://saaathgrow.onrender.com";


// =====================================================
// REGISTER SCREEN
// =====================================================

export default function RegisterScreen() {

    const navigation = useNavigation<any>();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    const [loading, setLoading] = useState(false);


    // =====================================================
    // EMAIL VALIDATION
    // =====================================================

    const isValidEmail = (emailAddress: string) => {

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return emailRegex.test(
            emailAddress.trim()
        );
    };


    // =====================================================
    // PHONE VALIDATION
    // =====================================================

    const isValidPhone = (phoneNumber: string) => {

        return /^[6-9]\d{9}$/.test(
            phoneNumber.trim()
        );
    };


    // =====================================================
    // REGISTER
    // =====================================================

    const handleRegister = async () => {

        const cleanName = fullName.trim();

        const cleanEmail =
            email.trim().toLowerCase();

        const cleanPhone =
            phone.trim();


        // =================================================
        // VALIDATE NAME
        // =================================================

        if (!cleanName) {

            Alert.alert(
                "Name Required",
                "Please enter your full name."
            );

            return;
        }


        // =================================================
        // VALIDATE EMAIL
        // =================================================

        if (!cleanEmail) {

            Alert.alert(
                "Gmail Required",
                "Please enter your Gmail address."
            );

            return;
        }


        if (!isValidEmail(cleanEmail)) {

            Alert.alert(
                "Invalid Gmail",
                "Please enter a valid Gmail address."
            );

            return;
        }


        // =================================================
        // VALIDATE PHONE
        // =================================================

        if (!cleanPhone) {

            Alert.alert(
                "Phone Number Required",
                "Please enter your phone number."
            );

            return;
        }


        if (!isValidPhone(cleanPhone)) {

            Alert.alert(
                "Invalid Phone Number",
                "Please enter a valid 10 digit Indian mobile number."
            );

            return;
        }


        // =================================================
        // START LOADING
        // =================================================

        setLoading(true);


        try {

            // =================================================
            // REQUEST LOG
            // =================================================

            console.log(
                "===================================="
            );

            console.log(
                "REGISTER REQUEST:"
            );

            console.log({
                full_name: cleanName,
                email: cleanEmail,
                phone_number: cleanPhone,
            });

            console.log(
                "===================================="
            );


            // =================================================
            // REGISTER API
            // =================================================

            const response = await axios.post(

                `${API_URL}/auth/register`,

                {
                    full_name: cleanName,

                    email: cleanEmail,

                    phone_number: cleanPhone,
                },

                {
                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    timeout: 30000,
                }
            );


            // =================================================
            // RESPONSE
            // =================================================

            const data = response.data;


            console.log(
                "===================================="
            );

            console.log(
                "REGISTER RESPONSE:",
                data
            );

            console.log(
                "===================================="
            );


            // =================================================
            // REGISTRATION FAILED
            // =================================================

            if (
                !data ||
                data.success !== true
            ) {

                Alert.alert(

                    "Registration Failed",

                    data?.message ||
                    "Unable to register. Please try again."
                );

                return;
            }


            // =================================================
            // REGISTRATION SUCCESS
            // =================================================

            console.log(
                "Registration successful."
            );

            console.log(
                "OTP sent to:",
                cleanEmail
            );


            // =================================================
            // IMPORTANT
            //
            // DO NOT SHOW AN ALERT HERE.
            //
            // DIRECTLY OPEN OTP SCREEN.
            // =================================================

            navigation.navigate(
                "EmailOTP",
                {
                    email: cleanEmail,

                    purpose: "registration",

                    fullName: cleanName,

                    phoneNumber: cleanPhone,

                    userId: data.user_id,
                }
            );


        } catch (error: any) {

            // =================================================
            // ERROR LOG
            // =================================================

            console.log(
                "===================================="
            );

            console.log(
                "REGISTER ERROR:"
            );

            console.log(
                error?.response?.data ||
                error?.message ||
                error
            );

            console.log(
                "===================================="
            );


            // =================================================
            // BACKEND ERROR MESSAGE
            // =================================================

            let message =
                "Unable to connect to the server. Please try again.";


            if (
                error?.response?.data?.message
            ) {

                message =
                    error.response.data.message;

            } else if (
                error?.response?.data?.detail
            ) {

                if (
                    Array.isArray(
                        error.response.data.detail
                    )
                ) {

                    message =
                        error.response.data.detail
                            .map(
                                (item: any) =>
                                    item?.msg ||
                                    "Invalid request"
                            )
                            .join("\n");

                } else {

                    message =
                        String(
                            error.response.data.detail
                        );
                }

            } else if (
                error?.message
            ) {

                message =
                    error.message;
            }


            // =================================================
            // SHOW ERROR
            // =================================================

            Alert.alert(
                "Registration Error",
                message
            );

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // UI
    // =====================================================

    return (

        <KeyboardAvoidingView

            style={styles.keyboardContainer}

            behavior={
                Platform.OS === "ios"
                    ? "padding"
                    : undefined
            }
        >

            <ScrollView

                contentContainerStyle={
                    styles.scrollContainer
                }

                keyboardShouldPersistTaps="handled"

                showsVerticalScrollIndicator={false}
            >

                <View style={styles.container}>

                    <StatusBar
                        backgroundColor="#FFFDFF"
                        barStyle="dark-content"
                    />


                    {/* =================================================
                        LOGO
                    ================================================= */}

                    <Image

                        source={
                            require("../../assets/logo.jpeg")
                        }

                        style={styles.logo}

                        resizeMode="contain"
                    />


                    {/* =================================================
                        COMPANY NAME
                    ================================================= */}

                    <Text style={styles.appName}>
                        Saath Groww
                    </Text>


                    <Text style={styles.tagline}>
                        Groww together, earn together
                    </Text>


                    {/* =================================================
                        TITLE
                    ================================================= */}

                    <Text style={styles.title}>
                        Create Your Account
                    </Text>


                    <Text style={styles.subtitle}>
                        Register as a Saath Groww delivery partner
                    </Text>


                    {/* =================================================
                        FULL NAME
                    ================================================= */}

                    <TextInput

                        placeholder="Full Name"

                        placeholderTextColor="#999"

                        value={fullName}

                        onChangeText={setFullName}

                        style={styles.input}

                        autoCapitalize="words"

                        editable={!loading}
                    />


                    {/* =================================================
                        GMAIL
                    ================================================= */}

                    <TextInput

                        placeholder="Gmail Address"

                        placeholderTextColor="#999"

                        value={email}

                        onChangeText={setEmail}

                        style={styles.input}

                        keyboardType="email-address"

                        autoCapitalize="none"

                        autoCorrect={false}

                        editable={!loading}
                    />


                    {/* =================================================
                        PHONE
                    ================================================= */}

                    <TextInput

                        placeholder="Phone Number"

                        placeholderTextColor="#999"

                        value={phone}

                        onChangeText={setPhone}

                        style={styles.input}

                        keyboardType="number-pad"

                        maxLength={10}

                        editable={!loading}
                    />


                    {/* =================================================
                        REGISTER BUTTON
                    ================================================= */}

                    <TouchableOpacity

                        style={[
                            styles.button,

                            loading &&
                            styles.buttonDisabled,
                        ]}

                        onPress={handleRegister}

                        disabled={loading}

                        activeOpacity={0.8}
                    >

                        {loading ? (

                            <View
                                style={
                                    styles.loadingContainer
                                }
                            >

                                <ActivityIndicator
                                    color="#FFFFFF"
                                    size="small"
                                />

                                <Text
                                    style={
                                        styles.loadingText
                                    }
                                >
                                    Registering...
                                </Text>

                            </View>

                        ) : (

                            <Text
                                style={
                                    styles.buttonText
                                }
                            >
                                Register
                            </Text>

                        )}

                    </TouchableOpacity>


                    {/* =================================================
                        LOGIN
                    ================================================= */}

                    <View
                        style={
                            styles.loginContainer
                        }
                    >

                        <Text
                            style={
                                styles.loginText
                            }
                        >
                            Already have an account?
                        </Text>


                        <TouchableOpacity

                            onPress={() =>
                                navigation.replace(
                                    "Login"
                                )
                            }

                            disabled={loading}
                        >

                            <Text
                                style={
                                    styles.loginLink
                                }
                            >
                                Login
                            </Text>

                        </TouchableOpacity>

                    </View>

                </View>

            </ScrollView>

        </KeyboardAvoidingView>
    );
}


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

    keyboardContainer: {
        flex: 1,

        backgroundColor: "#FFFDFF",
    },


    scrollContainer: {
        flexGrow: 1,

        justifyContent: "center",
    },


    container: {
        flex: 1,

        backgroundColor: "#FFFDFF",

        paddingHorizontal: 25,

        paddingVertical: 30,

        justifyContent: "center",
    },


    logo: {
        width: 100,

        height: 100,

        alignSelf: "center",

        marginBottom: 12,
    },


    appName: {
        fontSize: 30,

        fontWeight: "800",

        color: "#1DAB52",

        textAlign: "center",
    },


    tagline: {
        fontSize: 14,

        color: "#78C4D8",

        textAlign: "center",

        marginTop: 5,

        marginBottom: 28,
    },


    title: {
        fontSize: 26,

        fontWeight: "800",

        color: "#222",

        textAlign: "center",
    },


    subtitle: {
        fontSize: 14,

        color: "#777",

        textAlign: "center",

        marginTop: 8,

        marginBottom: 25,
    },


    input: {
        height: 56,

        backgroundColor: "#FFFFFF",

        borderWidth: 1.5,

        borderColor: "#78C4D8",

        borderRadius: 14,

        paddingHorizontal: 16,

        fontSize: 16,

        color: "#222",

        marginBottom: 15,
    },


    button: {
        height: 58,

        backgroundColor: "#1DAB52",

        borderRadius: 14,

        justifyContent: "center",

        alignItems: "center",

        marginTop: 8,

        elevation: 3,
    },


    buttonDisabled: {
        opacity: 0.7,
    },


    buttonText: {
        color: "#FFFFFF",

        fontSize: 17,

        fontWeight: "700",
    },


    loadingContainer: {
        flexDirection: "row",

        alignItems: "center",

        justifyContent: "center",
    },


    loadingText: {
        color: "#FFFFFF",

        fontSize: 16,

        fontWeight: "700",

        marginLeft: 10,
    },


    loginContainer: {
        flexDirection: "row",

        justifyContent: "center",

        alignItems: "center",

        marginTop: 25,
    },


    loginText: {
        color: "#666",

        fontSize: 14,
    },


    loginLink: {
        color: "#1DAB52",

        fontSize: 14,

        fontWeight: "800",

        marginLeft: 5,
    },

});