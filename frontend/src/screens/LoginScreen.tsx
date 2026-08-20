import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Alert,
    Image
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";



export default function LoginScreen() {
    const [mobile, setMobile] = useState("");
    const navigation = useNavigation<any>();

    const handleSendOTP = async () => {
        console.log("=================================");
        console.log("SEND OTP BUTTON CLICKED");
        console.log("Mobile:", mobile);
        console.log("=================================");

        if (mobile.length !== 10) {
            Alert.alert(
                "Invalid Number",
                "Please enter a valid 10 digit mobile number."
            );
            return;
        }

        try {
            console.log("Calling backend...");

            const response = await axios.post(
                "https://saaathgrow.onrender.com/auth/send-otp",
                {
                    phone_number: mobile,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    timeout: 30000,
                }
            );

            console.log("STATUS:", response.status);
            console.log("DATA:", response.data);

            if (response.data.success === false) {
                Alert.alert(
                    "OTP Failed",
                    response.data.message || "Unable to send OTP"
                );
                return;
            }

            Alert.alert(
                "Success",
                "OTP sent successfully"
            );

            navigation.navigate("Otp", {
                mobile: mobile,
            });

        } catch (error: any) {
            console.log("========== OTP ERROR ==========");
            console.log("MESSAGE:", error.message);
            console.log("CODE:", error.code);
            console.log("STATUS:", error.response?.status);
            console.log("DATA:", error.response?.data);
            console.log("===============================");

            Alert.alert(
                "OTP Error",
                error.response?.data?.message ||
                error.message ||
                "Failed to send OTP"
            );
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar
                backgroundColor="#FFFDFF"
                barStyle="dark-content"
            />

            <Image
                source={require("../../assets/logo.jpeg")}
                style={styles.logo}
            />

            {/* App Name */}
            <Text style={styles.appName}>Saath Groww</Text>

            {/* Tagline */}
            <Text style={styles.tagline}>
                Groww together, earn together
            </Text>

            {/* Section Title */}
            <Text style={styles.heading}>
                Sign in or Register
            </Text>

            <Text style={styles.subHeading}>
                Enter your mobile number to continue
            </Text>

            {/* Mobile Input */}
            <View style={styles.inputContainer}>
                <Text style={styles.countryCode}>+91</Text>

                <TextInput
                    placeholder="Mobile Number"
                    placeholderTextColor="#999"
                    value={mobile}
                    onChangeText={setMobile}
                    keyboardType="number-pad"
                    maxLength={10}
                    style={styles.input}
                />
            </View>

            {/* Send OTP Button */}
            <TouchableOpacity
                style={styles.button}
                onPress={handleSendOTP}
            >
                <Text style={styles.buttonText}>
                    Send OTP
                </Text>
            </TouchableOpacity>

            {/* Footer Text */}
            <Text style={styles.footerText}>
                New to Saath Groww?
            </Text>

            <Text style={styles.footerSubText}>
                Your account will be created automatically
                after OTP verification.
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
        marginBottom: 25,
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
        marginBottom: 40,
    },

    heading: {
        fontSize: 26,
        fontWeight: "700",
        color: "#222",
        textAlign: "center",
    },

    subHeading: {
        fontSize: 15,
        color: "#777",
        textAlign: "center",
        marginTop: 10,
        marginBottom: 35,
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

    countryCode: {
        fontSize: 16,
        fontWeight: "600",
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

    buttonText: {
        color: "#FFFDFF",
        fontSize: 17,
        fontWeight: "700",
    },

    footerText: {
        textAlign: "center",
        marginTop: 35,
        fontSize: 15,
        color: "#1DAB52",
        fontWeight: "600",
    },

    footerSubText: {
        textAlign: "center",
        marginTop: 6,
        fontSize: 13,
        color: "#777",
        lineHeight: 20,
    },
});