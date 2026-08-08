import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from "react-native";

import axios from "axios";

export default function OtpScreen({ route, navigation }: any) {
    const { mobile } = route.params;

    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(30);

    useEffect(() => {
        if (timer === 0) return;

        const interval = setInterval(() => {
            setTimer((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timer]);

    const handleVerifyOTP = async () => {
        if (otp.length !== 6) {
            Alert.alert(
                "Invalid OTP",
                "Please enter a valid 6 digit OTP"
            );
            return;
        }

        try {
            const response = await axios.post(
                "https://saaathgrow.onrender.com/auth/verify-otp",
                {
                    phone_number: mobile,
                    otp: otp,
                }
            );

            const data = response.data;

            if (!data.success) {
                Alert.alert(
                    "Verification Failed",
                    data.message
                );
                return;
            }

            // New user → Registration
            if (data.is_new_user) {
                navigation.replace(
                    "CreateProfile",
                    { mobile }
                );
                return;
            }

            // Existing user flow
            if (data.status === "approved") {
                navigation.replace("Main");
            }
            else if (
                data.status === "pending_verification"
            ) {
                navigation.replace(
                    "VerificationPending"
                );
            }
            else if (
                data.status === "rejected"
            ) {
                navigation.replace(
                    "ReuploadDocuments"
                );
            }
            else if (data.status === "pending_documents") {
                navigation.replace("DocumentUpload", {
                    userId: data.user.id,
                });
            }
            else if (data.status === "rejected") {
                navigation.replace("DocumentUpload");
            }
            else {
                navigation.replace("Main");
            }


        } catch (error) {
            console.log(error);

            Alert.alert(
                "Server Error",
                "Unable to verify OTP"
            );
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Verify OTP
            </Text>

            <Text style={styles.subtitle}>
                We have sent an OTP to
            </Text>

            <Text style={styles.mobile}>
                +91 {mobile}
            </Text>

            <TextInput
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="Enter OTP"
                placeholderTextColor="#999"
                style={styles.input}
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleVerifyOTP}
            >
                <Text style={styles.buttonText}>
                    Verify & Continue
                </Text>
            </TouchableOpacity>

            {timer > 0 ? (
                <Text style={styles.timer}>
                    Resend OTP in {timer}s
                </Text>
            ) : (
                <TouchableOpacity onPress={() => setTimer(30)}>
                    <Text style={styles.resend}>
                        Resend OTP
                    </Text>
                </TouchableOpacity>
            )}
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
    },

    mobile: {
        textAlign: "center",
        color: "#EDB131",
        fontWeight: "700",
        fontSize: 18,
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
        letterSpacing: 12,
        marginBottom: 25,
        backgroundColor: "#FFFFFF",
    },

    button: {
        backgroundColor: "#1DAB52",
        height: 58,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },

    buttonText: {
        color: "#FFFDFF",
        fontWeight: "700",
        fontSize: 16,
    },

    timer: {
        textAlign: "center",
        marginTop: 25,
        color: "#666",
    },

    resend: {
        textAlign: "center",
        marginTop: 25,
        color: "#EDB131",
        fontWeight: "700",
        fontSize: 16,
    },
});