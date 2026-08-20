
import React, { useState } from "react";

import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Alert,
    Image,
    ActivityIndicator,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import axios from "axios";


const API_URL =
    "https://saaathgrow.onrender.com";


export default function LoginScreen() {

    const navigation = useNavigation<any>();

    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(false);


    // =====================================================
    // EMAIL VALIDATION
    // =====================================================

    const isValidEmail = (
        emailAddress: string
    ) => {

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return emailRegex.test(
            emailAddress.trim()
        );
    };


    // =====================================================
    // EXISTING USER LOGIN
    // =====================================================

    const handleLogin = async () => {

        const cleanEmail =
            email.trim().toLowerCase();


        // Empty email
        if (!cleanEmail) {

            Alert.alert(
                "Email Required",
                "Please enter your Gmail address."
            );

            return;
        }


        // Invalid email
        if (!isValidEmail(cleanEmail)) {

            Alert.alert(
                "Invalid Gmail",
                "Please enter a valid Gmail address."
            );

            return;
        }


        try {

            setLoading(true);


            const response = await axios.post(

                `${API_URL}/auth/login/send-otp`,

                null,

                {
                    params: {
                        email: cleanEmail,
                    },

                    timeout: 30000,
                }
            );


            const data =
                response.data;


            console.log(
                "LOGIN OTP RESPONSE:",
                data
            );


            if (!data.success) {

                Alert.alert(
                    "Login Failed",
                    data.message ||
                    "Unable to send OTP."
                );

                return;
            }


            Alert.alert(
                "OTP Sent",
                "A login OTP has been sent to your email."
            );


            navigation.navigate(
                "EmailOTP",
                {
                    email: cleanEmail,

                    purpose: "login",
                }
            );


        } catch (error: any) {

            console.log(
                "LOGIN ERROR:",
                error.response?.data ||
                error.message
            );


            Alert.alert(
                "Login Error",
                error.response?.data?.message ||
                "Unable to connect to the server. Please try again."
            );

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // REGISTER
    // =====================================================

    const handleRegister = () => {

        navigation.navigate(
            "CreateProfile"
        );
    };


    return (

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
                APP NAME
            ================================================= */}

            <Text style={styles.appName}>
                Saath Groww
            </Text>


            <Text style={styles.tagline}>
                Groww together, earn together
            </Text>


            {/* =================================================
                LOGIN TITLE
            ================================================= */}

            <Text style={styles.heading}>
                Welcome Back
            </Text>


            <Text style={styles.subHeading}>
                Login using your registered Gmail address
            </Text>


            {/* =================================================
                EMAIL INPUT
            ================================================= */}

            <View style={styles.inputContainer}>

                <Text style={styles.emailIcon}>
                    ✉
                </Text>


                <TextInput
                    placeholder="Enter Gmail address"

                    placeholderTextColor="#999"

                    value={email}

                    onChangeText={setEmail}

                    keyboardType="email-address"

                    autoCapitalize="none"

                    autoCorrect={false}

                    style={styles.input}
                />

            </View>


            {/* =================================================
                LOGIN BUTTON
            ================================================= */}

            <TouchableOpacity
                style={[
                    styles.button,

                    loading &&
                    styles.buttonDisabled
                ]}

                onPress={handleLogin}

                disabled={loading}
            >

                {loading ? (

                    <ActivityIndicator
                        color="#FFFFFF"
                    />

                ) : (

                    <Text style={styles.buttonText}>
                        Continue with Email
                    </Text>
                )}

            </TouchableOpacity>


            {/* =================================================
                REGISTER SECTION
            ================================================= */}

            <View style={styles.registerContainer}>

                <Text style={styles.registerText}>
                    New to Saath Groww?
                </Text>


                <TouchableOpacity
                    onPress={handleRegister}
                    disabled={loading}
                >

                    <Text style={styles.registerLink}>
                        Register
                    </Text>

                </TouchableOpacity>

            </View>


            {/* =================================================
                FOOTER
            ================================================= */}

            <Text style={styles.footerText}>
                Secure login with email verification
            </Text>

        </View>
    );
}


const styles = StyleSheet.create({

    container: {
        flex: 1,

        backgroundColor: "#FFFDFF",

        paddingHorizontal: 25,

        justifyContent: "center",
    },


    logo: {
        width: 110,

        height: 110,

        resizeMode: "contain",

        alignSelf: "center",

        marginBottom: 20,
    },


    appName: {
        fontSize: 34,

        fontWeight: "800",

        color: "#1DAB52",

        textAlign: "center",
    },


    tagline: {
        fontSize: 15,

        color: "#78C4D8",

        textAlign: "center",

        marginTop: 6,

        marginBottom: 35,
    },


    heading: {
        fontSize: 27,

        fontWeight: "700",

        color: "#222",

        textAlign: "center",
    },


    subHeading: {
        fontSize: 14,

        color: "#777",

        textAlign: "center",

        marginTop: 10,

        marginBottom: 30,
    },


    inputContainer: {
        flexDirection: "row",

        alignItems: "center",

        borderWidth: 1.5,

        borderColor: "#78C4D8",

        borderRadius: 14,

        paddingHorizontal: 15,

        height: 58,

        backgroundColor: "#FFFFFF",

        marginBottom: 20,
    },


    emailIcon: {
        fontSize: 20,

        color: "#1DAB52",

        marginRight: 10,
    },


    input: {
        flex: 1,

        fontSize: 16,

        color: "#222",
    },


    button: {
        backgroundColor: "#1DAB52",

        height: 58,

        borderRadius: 14,

        justifyContent: "center",

        alignItems: "center",

        elevation: 3,

        shadowColor: "#1DAB52",

        shadowOpacity: 0.25,

        shadowRadius: 8,

        shadowOffset: {
            width: 0,

            height: 4,
        },
    },


    buttonDisabled: {
        opacity: 0.7,
    },


    buttonText: {
        color: "#FFFDFF",

        fontSize: 17,

        fontWeight: "700",
    },


    registerContainer: {
        flexDirection: "row",

        justifyContent: "center",

        alignItems: "center",

        marginTop: 30,
    },


    registerText: {
        color: "#666",

        fontSize: 15,
    },


    registerLink: {
        color: "#1DAB52",

        fontSize: 15,

        fontWeight: "800",

        marginLeft: 6,
    },


    footerText: {
        textAlign: "center",

        marginTop: 35,

        fontSize: 12,

        color: "#999",
    },

});
