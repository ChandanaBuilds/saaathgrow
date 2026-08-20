
import React, { useState } from "react";

import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from "react-native";

import axios from "axios";


const API_URL =
    "https://saaathgrow.onrender.com";


export default function CreateProfileScreen({
    navigation,
}: any) {

    // =====================================================
    // FORM STATE
    // =====================================================

    const [fullName, setFullName] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [mobile, setMobile] =
        useState("");

    const [address, setAddress] =
        useState("");

    const [city, setCity] =
        useState("");

    const [state, setStateValue] =
        useState("");

    const [pincode, setPincode] =
        useState("");

    const [referralCode, setReferralCode] =
        useState("");

    const [vehicleType, setVehicleType] =
        useState("");

    const [vehicleNumber, setVehicleNumber] =
        useState("");

    const [loading, setLoading] =
        useState(false);


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
    // PHONE VALIDATION
    // =====================================================

    const isValidPhone = (
        phone: string
    ) => {

        return /^[6-9]\d{9}$/.test(
            phone.trim()
        );
    };


    // =====================================================
    // VEHICLE NUMBER VALIDATION
    // =====================================================

    const isValidVehicleNumber = (
        number: string
    ) => {

        return /^[A-Za-z0-9 -]{4,15}$/.test(
            number.trim()
        );
    };


    // =====================================================
    // HANDLE REGISTRATION
    // =====================================================

    const handleContinue = async () => {

        const cleanName =
            fullName.trim();

        const cleanEmail =
            email.trim().toLowerCase();

        const cleanMobile =
            mobile.trim();

        const cleanAddress =
            address.trim();

        const cleanCity =
            city.trim();

        const cleanState =
            state.trim();

        const cleanPincode =
            pincode.trim();

        const cleanVehicleType =
            vehicleType.trim();

        const cleanVehicleNumber =
            vehicleNumber
                .trim()
                .toUpperCase();


        // =================================================
        // REQUIRED FIELD VALIDATION
        // =================================================

        if (!cleanName) {

            Alert.alert(
                "Name Required",
                "Please enter your full name."
            );

            return;
        }


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


        if (!cleanMobile) {

            Alert.alert(
                "Mobile Number Required",
                "Please enter your mobile number."
            );

            return;
        }


        if (!isValidPhone(cleanMobile)) {

            Alert.alert(
                "Invalid Mobile Number",
                "Please enter a valid 10 digit Indian mobile number."
            );

            return;
        }


        if (!cleanAddress) {

            Alert.alert(
                "Address Required",
                "Please enter your address."
            );

            return;
        }


        if (!cleanCity) {

            Alert.alert(
                "City Required",
                "Please enter your city."
            );

            return;
        }


        if (!cleanState) {

            Alert.alert(
                "State Required",
                "Please enter your state."
            );

            return;
        }


        if (
            cleanPincode.length !== 6 ||
            !/^\d{6}$/.test(cleanPincode)
        ) {

            Alert.alert(
                "Invalid Pincode",
                "Please enter a valid 6 digit pincode."
            );

            return;
        }


        if (!cleanVehicleType) {

            Alert.alert(
                "Vehicle Type Required",
                "Please enter your vehicle type."
            );

            return;
        }


        if (!cleanVehicleNumber) {

            Alert.alert(
                "Vehicle Number Required",
                "Please enter your vehicle number."
            );

            return;
        }


        if (
            !isValidVehicleNumber(
                cleanVehicleNumber
            )
        ) {

            Alert.alert(
                "Invalid Vehicle Number",
                "Please enter a valid vehicle number."
            );

            return;
        }


        // =================================================
        // SEND REGISTRATION REQUEST
        // =================================================

        try {

            setLoading(true);


            console.log(
                "REGISTERING USER:",
                {
                    phone_number:
                        cleanMobile,

                    full_name:
                        cleanName,

                    email:
                        cleanEmail,

                    city:
                        cleanCity,

                    state:
                        cleanState,

                    pincode:
                        cleanPincode,

                    vehicle_type:
                        cleanVehicleType,

                    vehicle_number:
                        cleanVehicleNumber,
                }
            );


            const response =
                await axios.post(

                    `${API_URL}/auth/register`,

                    {
                        phone_number:
                            cleanMobile,

                        full_name:
                            cleanName,

                        email:
                            cleanEmail,

                        city:
                            cleanCity,

                        state:
                            cleanState,

                        pincode:
                            cleanPincode,

                        vehicle_type:
                            cleanVehicleType,

                        vehicle_number:
                            cleanVehicleNumber,
                    },

                    {
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
                "REGISTER RESPONSE:",
                data
            );


            // =================================================
            // REGISTRATION FAILED
            // =================================================

            if (!data.success) {

                Alert.alert(
                    "Registration Failed",
                    data.message ||
                    "Unable to register."
                );

                return;
            }


            // =================================================
            // REGISTRATION SUCCESS
            // =================================================

            Alert.alert(
                "Registration Successful",
                "A verification OTP has been sent to your Gmail.",
                [
                    {
                        text: "Continue",

                        onPress: () => {

                            navigation.replace(
                                "EmailOTP",
                                {
                                    email:
                                        data.email,

                                    purpose:
                                        "registration",
                                }
                            );

                        },
                    },
                ]
            );


        } catch (error: any) {

            console.log(
                "REGISTRATION ERROR:",
                error.response?.data ||
                error.message
            );


            const serverMessage =
                error.response?.data?.message;


            Alert.alert(
                "Registration Error",
                serverMessage ||
                "Unable to connect to the server. Please try again."
            );

        } finally {

            setLoading(false);
        }
    };


    return (

        <ScrollView
            style={styles.container}

            contentContainerStyle={
                styles.contentContainer
            }

            showsVerticalScrollIndicator={false}
        >

            {/* =================================================
                HEADER
            ================================================= */}

            <View style={styles.header}>

                <Text style={styles.title}>
                    Create Profile
                </Text>

                <Text style={styles.subtitle}>
                    Join Saath Groww as a delivery partner
                </Text>

            </View>


            {/* =================================================
                PERSONAL DETAILS
            ================================================= */}

            <Text style={styles.sectionTitle}>
                Personal Details
            </Text>


            <TextInput
                placeholder="Full Name *"

                placeholderTextColor="#999"

                value={fullName}

                onChangeText={setFullName}

                style={styles.input}

                autoCapitalize="words"
            />


            <TextInput
                placeholder="Gmail Address *"

                placeholderTextColor="#999"

                value={email}

                onChangeText={setEmail}

                style={styles.input}

                keyboardType="email-address"

                autoCapitalize="none"

                autoCorrect={false}
            />


            <TextInput
                placeholder="Mobile Number *"

                placeholderTextColor="#999"

                value={mobile}

                onChangeText={setMobile}

                style={styles.input}

                keyboardType="number-pad"

                maxLength={10}
            />


            {/* =================================================
                ADDRESS
            ================================================= */}

            <Text style={styles.sectionTitle}>
                Address Details
            </Text>


            <TextInput
                placeholder="Address Line 1 *"

                placeholderTextColor="#999"

                value={address}

                onChangeText={setAddress}

                style={[
                    styles.input,
                    styles.multilineInput,
                ]}

                multiline

                textAlignVertical="top"
            />


            <TextInput
                placeholder="City *"

                placeholderTextColor="#999"

                value={city}

                onChangeText={setCity}

                style={styles.input}

                autoCapitalize="words"
            />


            <TextInput
                placeholder="State *"

                placeholderTextColor="#999"

                value={state}

                onChangeText={setStateValue}

                style={styles.input}

                autoCapitalize="words"
            />


            <TextInput
                placeholder="Pincode *"

                placeholderTextColor="#999"

                value={pincode}

                onChangeText={setPincode}

                keyboardType="number-pad"

                maxLength={6}

                style={styles.input}
            />


            {/* =================================================
                VEHICLE DETAILS
            ================================================= */}

            <Text style={styles.sectionTitle}>
                Vehicle Details
            </Text>


            <TextInput
                placeholder="Vehicle Type *"

                placeholderTextColor="#999"

                value={vehicleType}

                onChangeText={setVehicleType}

                style={styles.input}

                autoCapitalize="words"
            />


            <TextInput
                placeholder="Vehicle Number *"

                placeholderTextColor="#999"

                value={vehicleNumber}

                onChangeText={setVehicleNumber}

                style={styles.input}

                autoCapitalize="characters"
            />


            {/* =================================================
                REFERRAL
            ================================================= */}

            <TextInput
                placeholder="Referral Code (Optional)"

                placeholderTextColor="#999"

                value={referralCode}

                onChangeText={setReferralCode}

                style={styles.input}

                autoCapitalize="characters"
            />


            {/* =================================================
                CONTINUE BUTTON
            ================================================= */}

            <TouchableOpacity

                style={[
                    styles.button,

                    loading &&
                    styles.buttonDisabled,
                ]}

                onPress={handleContinue}

                disabled={loading}
            >

                {loading ? (

                    <ActivityIndicator
                        color="#FFFFFF"
                    />

                ) : (

                    <Text style={styles.buttonText}>
                        Register & Continue
                    </Text>

                )}

            </TouchableOpacity>


            {/* =================================================
                LOGIN
            ================================================= */}

            <TouchableOpacity
                style={styles.loginLinkContainer}

                onPress={() =>
                    navigation.replace("Login")
                }

                disabled={loading}
            >

                <Text style={styles.loginText}>
                    Already have an account?
                </Text>

                <Text style={styles.loginLink}>
                    Login
                </Text>

            </TouchableOpacity>


            <View
                style={{
                    height: 40,
                }}
            />

        </ScrollView>
    );
}


// ===========================================================
// STYLES
// ===========================================================

const styles = StyleSheet.create({

    container: {
        flex: 1,

        backgroundColor: "#FFFDFF",

        paddingHorizontal: 20,
    },


    contentContainer: {
        paddingBottom: 40,
    },


    header: {
        marginTop: 55,

        marginBottom: 25,

        alignItems: "center",
    },


    title: {
        fontSize: 30,

        fontWeight: "800",

        color: "#1DAB52",
    },


    subtitle: {
        marginTop: 8,

        fontSize: 14,

        color: "#666",

        textAlign: "center",
    },


    sectionTitle: {
        fontSize: 18,

        fontWeight: "700",

        color: "#222",

        marginTop: 15,

        marginBottom: 12,
    },


    input: {
        backgroundColor: "#FFFFFF",

        borderWidth: 1,

        borderColor: "#E1E1E1",

        borderRadius: 14,

        paddingHorizontal: 16,

        height: 56,

        marginBottom: 15,

        fontSize: 16,

        color: "#222",
    },


    multilineInput: {
        height: 90,

        paddingTop: 15,
    },


    button: {
        marginTop: 15,

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

        fontSize: 17,
    },


    loginLinkContainer: {
        flexDirection: "row",

        justifyContent: "center",

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
