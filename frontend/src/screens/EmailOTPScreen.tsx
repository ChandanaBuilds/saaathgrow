import React, { useEffect, useState } from "react";

import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
} from "react-native";

import axios from "axios";

import {
    useNavigation,
    useRoute,
} from "@react-navigation/native";


const API_URL =
    "https://saaathgrow.onrender.com";


export default function EmailOTPScreen() {

    const navigation = useNavigation<any>();

    const route = useRoute<any>();


    // =====================================================
    // DATA FROM PREVIOUS SCREEN
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

    const [message, setMessage] =
        useState("");

    const [messageType, setMessageType] =
        useState<"success" | "error" | "">("");


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


        return () => {
            clearInterval(timer);
        };

    }, [countdown]);


    // =====================================================
    // SHOW MESSAGE
    // =====================================================

    const showMessage = (
        text: string,
        type: "success" | "error"
    ) => {

        setMessage(text);
        setMessageType(type);

    };


    // =====================================================
    // VERIFY OTP
    // =====================================================

    const handleVerifyOTP = async () => {

        const cleanOTP =
            otp.trim();


        // -------------------------------------------------
        // CLEAR PREVIOUS MESSAGE
        // -------------------------------------------------

        setMessage("");
        setMessageType("");


        // -------------------------------------------------
        // VALIDATE OTP
        // -------------------------------------------------

        if (!cleanOTP) {

            showMessage(
                "Please enter the OTP sent to your email.",
                "error"
            );

            return;
        }


        if (!/^\d{6}$/.test(cleanOTP)) {

            showMessage(
                "Please enter the 6-digit OTP.",
                "error"
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
                    purpose,
                }
            );


            // =================================================
            // REGISTRATION OTP
            // =================================================

            if (purpose === "registration") {

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
                    "REGISTRATION OTP RESPONSE:",
                    data
                );


                // -------------------------------------------------
                // REGISTRATION FAILED
                // -------------------------------------------------

                if (!data.success) {

                    showMessage(
                        data.message ||
                        "Invalid OTP. Please try again.",
                        "error"
                    );

                    return;
                }


                // -------------------------------------------------
                // REGISTRATION SUCCESS
                // -------------------------------------------------

                showMessage(
                    "Your email has been successfully registered. Please login to continue.",
                    "success"
                );


                console.log(
                    "EMAIL REGISTRATION SUCCESS"
                );

                console.log(
                    "USER MUST LOGIN BEFORE CREATING PROFILE"
                );


                // -------------------------------------------------
                // MOVE TO LOGIN
                //
                // We wait 1.5 seconds so the user can
                // see the success message.
                // -------------------------------------------------

                setTimeout(() => {

                    navigation.replace(
                        "Login"
                    );

                }, 1500);


                return;
            }


            // =================================================
            // LOGIN OTP
            // =================================================

            if (purpose === "login") {

                const response =
                    await axios.post(

                        `${API_URL}/auth/login/verify-otp`,

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
                    "LOGIN OTP RESPONSE:",
                    data
                );


                // -------------------------------------------------
                // LOGIN FAILED
                // -------------------------------------------------

                if (!data.success) {

                    showMessage(
                        data.message ||
                        "Invalid OTP. Please try again.",
                        "error"
                    );

                    return;
                }


                console.log(
                    "LOGIN SUCCESS:",
                    data.user
                );


                // =================================================
                // CHECK PROFILE STATUS
                // =================================================

                const userStatus =
                    data.status ||
                    data.user?.status;


                console.log(
                    "USER STATUS:",
                    userStatus
                );


                // -------------------------------------------------
                // PROFILE NOT COMPLETED
                // -------------------------------------------------

                if (
                    userStatus ===
                    "pending_profile"
                ) {

                    showMessage(
                        "Login successful. Please complete your profile.",
                        "success"
                    );


                    console.log(
                        "PROFILE NOT COMPLETED"
                    );

                    console.log(
                        "MOVING TO CREATE PROFILE"
                    );


                    setTimeout(() => {

                        navigation.replace(
                            "CreateProfile",
                            {
                                userId:
                                    data.user?.id,

                                email:
                                    data.user?.email ||
                                    email,

                                fullName:
                                    data.user?.full_name ||
                                    "",

                                phoneNumber:
                                    data.user?.phone_number ||
                                    "",

                                user:
                                    data.user,
                            }
                        );

                    }, 1000);


                    return;
                }


                // =================================================
                // PROFILE COMPLETED
                // =================================================

                showMessage(
                    "Login successful. Redirecting to dashboard...",
                    "success"
                );


                console.log(
                    "PROFILE COMPLETED"
                );

                console.log(
                    "MOVING TO DASHBOARD"
                );


                setTimeout(() => {

                    navigation.replace(
                        "Dashboard",
                        {
                            user:
                                data.user,

                            userId:
                                data.user?.id,

                            email:
                                data.user?.email ||
                                email,
                        }
                    );

                }, 1000);


                return;
            }


            // =================================================
            // UNKNOWN PURPOSE
            // =================================================

            showMessage(
                "Invalid verification request. Please try again.",
                "error"
            );


        } catch (error: any) {

            console.log(
                "VERIFY OTP ERROR:",
                error.response?.data ||
                error.message
            );


            const serverMessage =
                error.response?.data?.message;


            showMessage(
                serverMessage ||
                "Unable to verify OTP. Please try again.",
                "error"
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


        setMessage("");
        setMessageType("");


        try {

            setResendLoading(true);


            console.log(
                "RESEND OTP REQUEST:",
                {
                    email,
                    purpose,
                }
            );


            // =================================================
            // REGISTRATION RESEND
            // =================================================

            if (purpose === "registration") {

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
                    "REGISTRATION RESEND RESPONSE:",
                    data
                );


                if (!data.success) {

                    showMessage(
                        data.message ||
                        "Unable to resend OTP.",
                        "error"
                    );

                    return;
                }


                setCountdown(30);

                setOtp("");


                showMessage(
                    "A new OTP has been sent to your email.",
                    "success"
                );


                return;
            }


            // =================================================
            // LOGIN RESEND
            // =================================================

            if (purpose === "login") {

                const response =
                    await axios.post(

                        `${API_URL}/auth/login/send-otp`,

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
                    "LOGIN RESEND RESPONSE:",
                    data
                );


                if (!data.success) {

                    showMessage(
                        data.message ||
                        "Unable to resend OTP.",
                        "error"
                    );

                    return;
                }


                setCountdown(30);

                setOtp("");


                showMessage(
                    "A new login OTP has been sent to your email.",
                    "success"
                );


                return;
            }


            showMessage(
                "Unable to resend OTP.",
                "error"
            );


        } catch (error: any) {

            console.log(
                "RESEND OTP ERROR:",
                error.response?.data ||
                error.message
            );


            showMessage(
                error.response?.data?.message ||
                "Unable to resend OTP. Please try again.",
                "error"
            );


        } finally {

            setResendLoading(false);

        }

    };


    // =====================================================
    // CHANGE EMAIL
    // =====================================================

    const handleChangeEmail = () => {

        if (loading) {
            return;
        }

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


                    // Clear error when user
                    // starts typing again

                    if (
                        messageType ===
                        "error"
                    ) {

                        setMessage("");

                        setMessageType("");

                    }

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
                MESSAGE
            ================================================= */}

            {message ? (

                <View
                    style={[
                        styles.messageContainer,

                        messageType === "error"
                            ? styles.errorMessageContainer
                            : styles.successMessageContainer,
                    ]}
                >

                    <Text
                        style={[
                            styles.messageText,

                            messageType === "error"
                                ? styles.errorMessageText
                                : styles.successMessageText,
                        ]}
                    >
                        {message}
                    </Text>

                </View>

            ) : null}


            {/* =================================================
                RESEND OTP
            ================================================= */}

            <TouchableOpacity

                onPress={handleResendOTP}

                disabled={
                    countdown > 0 ||
                    resendLoading ||
                    loading
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
    // OTP INPUT
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
    // VERIFY BUTTON
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
    // MESSAGE
    // -------------------------------------------------------

    messageContainer: {

        marginTop: 12,

        paddingHorizontal: 14,

        paddingVertical: 10,

        borderRadius: 10,

    },


    errorMessageContainer: {

        backgroundColor: "#FDECEC",

        borderWidth: 1,

        borderColor: "#F5B5B5",

    },


    successMessageContainer: {

        backgroundColor: "#E8F8EF",

        borderWidth: 1,

        borderColor: "#9DDBB5",

    },


    messageText: {

        fontSize: 14,

        textAlign: "center",

        fontWeight: "600",

        lineHeight: 20,

    },


    errorMessageText: {

        color: "#D32F2F",

    },


    successMessageText: {

        color: "#1DAB52",

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