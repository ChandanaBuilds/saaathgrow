
import React, {
    useEffect,
    useState,
} from "react";

import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from "react-native";

import axios from "axios";


const API_URL =
    "https://saaathgrow.onrender.com";


export default function EmailOTPScreen({
    route,
    navigation,
}: any) {

    const {
        email,
        purpose,
    } = route.params;


    const [otp, setOtp] = useState("");

    const [timer, setTimer] = useState(60);

    const [loading, setLoading] = useState(false);


    // =====================================================
    // TIMER
    // =====================================================

    useEffect(() => {

        if (timer <= 0) {
            return;
        }


        const interval =
            setInterval(() => {

                setTimer(
                    previous =>
                        previous - 1
                );

            }, 1000);


        return () =>
            clearInterval(interval);

    }, [timer]);


    // =====================================================
    // VERIFY OTP
    // =====================================================

    const handleVerify = async () => {

        const cleanOtp =
            otp.trim();


        if (cleanOtp.length !== 6) {

            Alert.alert(
                "Invalid OTP",
                "Please enter the 6 digit OTP sent to your email."
            );

            return;
        }


        try {

            setLoading(true);


            let response;


            // =================================================
            // REGISTRATION OTP
            // =================================================

            if (
                purpose ===
                "registration"
            ) {

                response =
                    await axios.post(

                        `${API_URL} /auth/verify - registration - otp`,

                        null,

                        {
                            params: {
                                email,
                                otp: cleanOtp,
                            },

                            timeout: 30000,
                        }
                    );

            }


            // =================================================
            // LOGIN OTP
            // =================================================

            else {

                response =
                    await axios.post(

                        `${API_URL} /auth/login / verify - otp`,

                        null,

                        {
                            params: {
                                email,
                                otp: cleanOtp,
                            },

                            timeout: 30000,
                        }
                    );
            }


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
                    "Invalid OTP."
                );

                return;
            }


            // =================================================
            // NEW USER
            // =================================================

            if (
                purpose ===
                "registration"
            ) {

                Alert.alert(
                    "Email Verified",
                    "Your email has been verified successfully.",
                    [
                        {
                            text: "Continue",

                            onPress: () => {

                                navigation.replace(
                                    "DocumentUpload",
                                    {
                                        userId:
                                            data.user.id,
                                    }
                                );

                            },
                        },
                    ]
                );

                return;
            }


            // =================================================
            // EXISTING USER LOGIN
            // =================================================

            const user =
                data.user;


            const status =
                data.status;


            // -------------------------------------------------
            // APPROVED
            // -------------------------------------------------

            if (
                status ===
                "approved"
            ) {

                navigation.replace(
                    "Main",
                    {
                        userId:
                            user.id,
                    }
                );

                return;
            }


            // -------------------------------------------------
            // PENDING DOCUMENTS
            // -------------------------------------------------

            if (
                status ===
                "pending_documents"
            ) {

                navigation.replace(
                    "DocumentUpload",
                    {
                        userId:
                            user.id,
                    }
                );

                return;
            }


            // -------------------------------------------------
            // PENDING VERIFICATION
            // -------------------------------------------------

            if (
                status ===
                "pending_verification"
            ) {

                navigation.replace(
                    "VerificationPending",
                    {
                        userId:
                            user.id,
                    }
                );

                return;
            }


            // -------------------------------------------------
            // REJECTED
            // -------------------------------------------------

            if (
                status ===
                "rejected"
            ) {

                navigation.replace(
                    "DocumentUpload",
                    {
                        userId:
                            user.id,

                        reupload: true,
                    }
                );

                return;
            }


            // -------------------------------------------------
            // FALLBACK
            // -------------------------------------------------

            navigation.replace(
                "Main",
                {
                    userId:
                        user.id,
                }
            );

        } catch (error: any) {

            console.log(
                "EMAIL OTP ERROR:",
                error.response?.data ||
                error.message
            );


            Alert.alert(
                "Verification Error",
                error.response?.data?.message ||
                "Unable to verify OTP. Please try again."
            );

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // RESEND OTP
    // =====================================================

    const handleResend = async () => {

        if (timer > 0) {
            return;
        }


        try {

            setLoading(true);


            let response;


            // =================================================
            // REGISTRATION RESEND
            // =================================================

            if (
                purpose ===
                "registration"
            ) {

                response =
                    await axios.post(

                        `${API_URL} /auth/register / resend - otp`,

                        null,

                        {
                            params: {
                                email,
                            },

                            timeout: 30000,
                        }
                    );

            }


            // =================================================
            // LOGIN RESEND
            // =================================================

            else {

                response =
                    await axios.post(

                        `${API_URL} /auth/login / send - otp`,

                        null,

                        {
                            params: {
                                email,
                            },

                            timeout: 30000,
                        }
                    );
            }


            const data =
                response.data;


            if (!data.success) {

                Alert.alert(
                    "Unable to Resend",
                    data.message ||
                    "Please try again."
                );

                return;
            }


            setOtp("");

            setTimer(60);


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


            Alert.alert(
                "Error",
                error.response?.data?.message ||
                "Unable to resend OTP."
            );

        } finally {

            setLoading(false);
        }
    };


    return (

        <View style={styles.container}>

            {/* =================================================
                TITLE
            ================================================= */}

            <Text style={styles.title}>
                Verify Your Email
            </Text>


            <Text style={styles.subtitle}>
                We sent a 6 digit verification code to
            </Text>


            <Text style={styles.email}>
                {email}
            </Text>


            {/* =================================================
                OTP INPUT
            ================================================= */}

            <TextInput
                value={otp}

                onChangeText={setOtp}

                keyboardType="number-pad"

                maxLength={6}

                placeholder="Enter OTP"

                placeholderTextColor="#999"

                style={styles.input}

                textContentType="oneTimeCode"

                autoComplete="sms-otp"
            />


            {/* =================================================
                VERIFY BUTTON
            ================================================= */}

            <TouchableOpacity
                style={[
                    styles.button,

                    loading &&
                    styles.buttonDisabled
                ]}

                onPress={handleVerify}

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

            {timer > 0 ? (

                <Text style={styles.timer}>
                    Resend OTP in {timer}s
                </Text>

            ) : (

                <TouchableOpacity
                    onPress={handleResend}
                    disabled={loading}
                >

                    <Text style={styles.resend}>
                        Resend OTP
                    </Text>

                </TouchableOpacity>
            )}


            {/* =================================================
                CHANGE EMAIL
            ================================================= */}

            <TouchableOpacity
                style={styles.changeEmail}
                onPress={() =>
                    navigation.goBack()
                }
                disabled={loading}
            >

                <Text style={styles.changeEmailText}>
                    Change Email
                </Text>

            </TouchableOpacity>

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


    title: {
        fontSize: 30,

        fontWeight: "800",

        color: "#1DAB52",

        textAlign: "center",
    },


    subtitle: {
        textAlign: "center",

        color: "#666",

        marginTop: 15,

        fontSize: 15,

        lineHeight: 22,
    },


    email: {
        textAlign: "center",

        color: "#EDB131",

        fontWeight: "700",

        fontSize: 17,

        marginTop: 8,

        marginBottom: 40,
    },


    input: {
        borderWidth: 1.5,

        borderColor: "#78C4D8",

        borderRadius: 14,

        padding: 18,

        textAlign: "center",

        fontSize: 24,

        letterSpacing: 8,

        marginBottom: 25,

        backgroundColor: "#FFFFFF",

        color: "#222",
    },


    button: {
        backgroundColor: "#1DAB52",

        height: 58,

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

        fontWeight: "700",

        fontSize: 16,
    },


    timer: {
        textAlign: "center",

        marginTop: 25,

        color: "#666",

        fontSize: 14,
    },


    resend: {
        textAlign: "center",

        marginTop: 25,

        color: "#EDB131",

        fontWeight: "700",

        fontSize: 16,
    },


    changeEmail: {
        marginTop: 25,

        alignItems: "center",
    },


    changeEmailText: {
        color: "#1DAB52",

        fontSize: 14,

        fontWeight: "600",
    },

});
