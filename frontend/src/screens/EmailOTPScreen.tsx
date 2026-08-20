import React, { useEffect, useState } from "react";

import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Alert,
    ActivityIndicator,
} from "react-native";

import axios from "axios";

import { useNavigation, useRoute } from "@react-navigation/native";


const API_URL =
    "https://saaathgrow.onrender.com";


export default function EmailOTPScreen() {

    const navigation = useNavigation<any>();

    const route = useRoute<any>();


    // =====================================================
    // DATA FROM REGISTER SCREEN
    // =====================================================

    const email =
        route.params?.email || "";

    const purpose =
        route.params?.purpose || "registration";


    // =====================================================
    // STATE
    // =====================================================

    const [otp, setOtp] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [resendLoading, setResendLoading] =
        useState(false);

    const [countdown, setCountdown] =
        useState(30);


    // =====================================================
    // COUNTDOWN
    // =====================================================

    useEffect(() => {

        if (countdown <= 0) {
            return;
        }

        const timer =
            setInterval(() => {

                setCountdown(
                    previous => previous - 1
                );

            }, 1000);


        return () =>
            clearInterval(timer);

    }, [countdown]);


    // =====================================================
    // VERIFY OTP
    // =====================================================

    const handleVerifyOTP = async () => {

        const cleanOTP =
            otp.trim();


        // -------------------------------------------------
        // OTP VALIDATION
        // -------------------------------------------------

        if (!cleanOTP) {

            Alert.alert(
                "OTP Required",
                "Please enter the OTP sent to your email."
            );

            return;
        }


        if (!/^\d{6}$/.test(cleanOTP)) {

            Alert.alert(
                "Invalid OTP",
                "Please enter the 6-digit OTP."
            );

            return;
        }


        try {

            setLoading(true);


            console.log(
                "VERIFY OTP REQUEST:",
                {
                    email,
                    otp: cleanOTP,
                }
            );


            // =================================================
            // REGISTRATION OTP
            // =================================================

            const response =
                await axios.post(

                    `${API_URL}/auth/verify-registration-otp`,

                    null,

                    {
                        params: {
                            email: email,
                            otp: cleanOTP,
                        },

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        timeout: 30000,
                    }
                );


            const data =
                response.data;


            console.log(
                "EMAIL OTP RESPONSE:",
                data
            );


            // =================================================
            // FAILED
            // =================================================

            if (!data.success) {

                Alert.alert(
                    "Verification Failed",
                    data.message ||
                    "Invalid OTP. Please try again."
                );

                return;
            }


            // =================================================
            // SUCCESS
            // =================================================

            /*
             * IMPORTANT:
             *
             * Do NOT navigate immediately.
             *
             * First show the success message.
             */

            Alert.alert(

                "Email Successfully Registered",

                "Your email has been successfully verified and registered.",

                [
                    {
                        text: "Continue",

                        onPress: () => {

                            console.log(
                                "Moving to Create Profile"
                            );


                            // =================================================
                            // MOVE TO CREATE PROFILE
                            // =================================================

                            navigation.replace(
                                "CreateProfile",
                                {
                                    email: email,

                                    user: data.user,
                                }
                            );

                        },
                    },
                ]

            );


        } catch (error: any) {

            console.log(
                "VERIFY OTP ERROR:",
                error.response?.data ||
                error.message
            );


            const message =
                error.response?.data?.message ||
                "Unable to verify OTP. Please try again.";


            Alert.alert(
                "Verification Error",
                message
            );


        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // RESEND OTP
    // =====================================================

    const handleResendOTP = async () => {

        if (countdown > 0) {
            return;
        }


        try {

            setResendLoading(true);


            console.log(
                "RESEND OTP REQUEST:",
                email
            );


            const response =
                await axios.post(

                    `${API_URL}/auth/register/resend-otp`,

                    null,

                    {
                        params: {
                            email: email,
                        },

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        timeout: 30000,
                    }
                );


            const data =
                response.data;


            console.log(
                "RESEND OTP RESPONSE:",
                data
            );


            if (!data.success) {

                Alert.alert(
                    "Unable to Resend",
                    data.message ||
                    "Unable to resend OTP."
                );

                return;
            }


            // Reset countdown

            setCountdown(30);

            setOtp("");


            Alert.alert(
                "OTP Sent",
                "A new OTP has been sent to your email."
            );


        } catch (error: any) {

            console.log(
                "RESEND OTP ERROR:",
                error.response?.data ||
                error.message
            );


            const message =
                error.response?.data?.message ||
                "Unable to resend OTP. Please try again.";


            Alert.alert(
                "Resend Failed",
                message
            );


        } finally {

            setResendLoading(false);

        }

    };


    // =====================================================
    // CHANGE EMAIL
    // =====================================================

    const handleChangeEmail = () => {

        navigation.goBack();

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


            {/* =================================================
                ICON
            ================================================= */}

            <View style={styles.iconContainer}>

                <View style={styles.iconCircle}>

                    <Text style={styles.icon}>
                        ✉
                    </Text>

                </View>

            </View>


            {/* =================================================
                TITLE
            ================================================= */}

            <Text style={styles.title}>
                Verify Your Email
            </Text>


            <Text style={styles.subtitle}>
                We sent a 6 digit verification code
            </Text>


            {/* =================================================
                EMAIL
            ================================================= */}

            <Text style={styles.email}>
                {email}
            </Text>


            {/* =================================================
                OTP INPUT
            ================================================= */}

            <TextInput

                style={styles.otpInput}

                value={otp}

                onChangeText={(value) => {

                    const numbersOnly =
                        value.replace(
                            /[^0-9]/g,
                            ""
                        );

                    setOtp(
                        numbersOnly.slice(0, 6)
                    );

                }}

                placeholder="Enter OTP"

                placeholderTextColor="#999"

                keyboardType="number-pad"

                maxLength={6}

                textAlign="center"

                autoFocus

                editable={!loading}

            />


            {/* =================================================
                VERIFY BUTTON
            ================================================= */}

            <TouchableOpacity

                style={[
                    styles.button,

                    loading &&
                    styles.buttonDisabled,
                ]}

                onPress={handleVerifyOTP}

                disabled={loading}

            >

                {loading ? (

                    <ActivityIndicator
                        color="#FFFFFF"
                    />

                ) : (

                    <Text style={styles.buttonText}>
                        Verify & Continue
                    </Text>

                )}

            </TouchableOpacity>


            {/* =================================================
                RESEND
            ================================================= */}

            <TouchableOpacity

                onPress={handleResendOTP}

                disabled={
                    countdown > 0 ||
                    resendLoading
                }

                style={styles.resendButton}

            >

                {resendLoading ? (

                    <ActivityIndicator
                        size="small"
                        color="#1DAB52"
                    />

                ) : (

                    <Text
                        style={[
                            styles.resendText,

                            countdown > 0 &&
                            styles.resendDisabled,
                        ]}
                    >

                        {countdown > 0
                            ? `Resend OTP in ${countdown}s`
                            : "Resend OTP"
                        }

                    </Text>

                )}

            </TouchableOpacity>


            {/* =================================================
                CHANGE EMAIL
            ================================================= */}

            <TouchableOpacity

                onPress={handleChangeEmail}

                disabled={loading}

                style={styles.changeEmailButton}

            >

                <Text style={styles.changeEmailText}>
                    Change Email
                </Text>

            </TouchableOpacity>

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

        paddingHorizontal: 25,

    },


    // -------------------------------------------------------
    // ICON
    // -------------------------------------------------------

    iconContainer: {

        alignItems: "center",

        marginBottom: 20,

    },


    iconCircle: {

        width: 75,

        height: 75,

        borderRadius: 40,

        backgroundColor: "#E8F8EF",

        borderWidth: 2,

        borderColor: "#1DAB52",

        justifyContent: "center",

        alignItems: "center",

    },


    icon: {

        fontSize: 34,

    },


    // -------------------------------------------------------
    // TITLE
    // -------------------------------------------------------

    title: {

        fontSize: 27,

        fontWeight: "800",

        color: "#1DAB52",

        textAlign: "center",

        marginBottom: 10,

    },


    subtitle: {

        fontSize: 14,

        color: "#777",

        textAlign: "center",

    },


    email: {

        fontSize: 14,

        fontWeight: "700",

        color: "#EDB131",

        textAlign: "center",

        marginTop: 8,

        marginBottom: 25,

    },


    // -------------------------------------------------------
    // OTP
    // -------------------------------------------------------

    otpInput: {

        height: 58,

        backgroundColor: "#FFFFFF",

        borderWidth: 1.5,

        borderColor: "#78C4D8",

        borderRadius: 14,

        paddingHorizontal: 16,

        fontSize: 22,

        letterSpacing: 8,

        color: "#222",

        marginBottom: 18,

    },


    // -------------------------------------------------------
    // BUTTON
    // -------------------------------------------------------

    button: {

        height: 58,

        backgroundColor: "#1DAB52",

        borderRadius: 14,

        justifyContent: "center",

        alignItems: "center",

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


    // -------------------------------------------------------
    // RESEND
    // -------------------------------------------------------

    resendButton: {

        alignItems: "center",

        marginTop: 20,

        minHeight: 25,

    },


    resendText: {

        color: "#1DAB52",

        fontSize: 14,

        fontWeight: "700",

    },


    resendDisabled: {

        color: "#999",

        fontWeight: "400",

    },


    // -------------------------------------------------------
    // CHANGE EMAIL
    // -------------------------------------------------------

    changeEmailButton: {

        alignItems: "center",

        marginTop: 15,

    },


    changeEmailText: {

        color: "#1DAB52",

        fontSize: 14,

        fontWeight: "600",

    },

});