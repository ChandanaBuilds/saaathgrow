import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from "react-native";
import axios from "axios";

export default function CreateProfileScreen({
    navigation,
    route,
}: any) {
    const { mobile } = route.params;
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [state, setStateValue] = useState("");
    const [pincode, setPincode] = useState("");
    const [referralCode, setReferralCode] = useState("");
    const [vehicleType, setVehicleType] = useState("");
    const [vehicleNumber, setVehicleNumber] = useState("");

    const handleContinue = async () => {
        if (
            !fullName ||
            !email ||
            !city ||
            !state ||
            !pincode
        ) {
            Alert.alert(
                "Error",
                "Please fill all required fields"
            );
            return;
        }

        try {
            const response = await axios.post(
                "https://saaathgrow.onrender.com/auth/register",
                {
                    phone_number: mobile,
                    full_name: fullName,
                    email: email,
                    city: city,
                    state: state,
                    pincode: pincode,
                    vehicle_type: "Bike",
                    vehicle_number: "TS09AB1234",
                }
            );

            if (!response.data.success) {
                Alert.alert(
                    "Error",
                    response.data.message
                );
                return;
            }

            navigation.replace(
                "DocumentUpload",
                {
                    userId: response.data.user_id,
                }
            );
        } catch (error) {
            console.log(error);

            Alert.alert(
                "Error",
                "Failed to register user"
            );
        }
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Create Profile</Text>
                <Text style={styles.subtitle}>
                    Tell us about yourself
                </Text>
            </View>

            {/* Profile Image */}
            <View style={styles.profileContainer}>
                <View style={styles.profileCircle}>
                    <Text style={styles.profileIcon}>👤</Text>
                </View>

                <TouchableOpacity style={styles.uploadButton}>
                    <Text style={styles.uploadText}>
                        Add Profile Photo (Optional)
                    </Text>
                </TouchableOpacity>
            </View>

            <TextInput
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
                style={styles.input}
            />

            <TextInput
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
            />

            <TextInput
                placeholder="Address Line 1"
                value={address}
                onChangeText={setAddress}
                style={styles.input}
            />

            <TextInput
                placeholder="City"
                value={city}
                onChangeText={setCity}
                style={styles.input}
            />

            <TextInput
                placeholder="State"
                value={state}
                onChangeText={setStateValue}
                style={styles.input}
            />

            <TextInput
                placeholder="Pincode"
                value={pincode}
                onChangeText={setPincode}
                keyboardType="numeric"
                maxLength={6}
                style={styles.input}
            />
            <TextInput
                placeholder="Vehicle Type"
                value={vehicleType}
                onChangeText={setVehicleType}
                style={styles.input}
            />
            <TextInput
                placeholder="Vehicle Number"
                value={vehicleNumber}
                onChangeText={setVehicleNumber}
                style={styles.input}
            />

            <TextInput
                placeholder="Referral Code (Optional)"
                value={referralCode}
                onChangeText={setReferralCode}
                style={styles.input}
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleContinue}
            >
                <Text style={styles.buttonText}>
                    Continue
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFDFF",
        paddingHorizontal: 20,
    },

    header: {
        marginTop: 60,
        alignItems: "center",
        marginBottom: 25,
    },

    title: {
        fontSize: 30,
        fontWeight: "800",
        color: "#1DAB52",
    },

    subtitle: {
        marginTop: 8,
        fontSize: 15,
        color: "#666",
    },

    profileContainer: {
        alignItems: "center",
        marginBottom: 30,
    },

    profileCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#78C4D820",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#78C4D8",
    },

    profileIcon: {
        fontSize: 40,
    },

    uploadButton: {
        marginTop: 15,
        borderWidth: 1,
        borderColor: "#1DAB52",
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },

    uploadText: {
        color: "#1DAB52",
        fontWeight: "600",
    },

    input: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#EAEAEA",
        borderRadius: 14,
        paddingHorizontal: 16,
        height: 56,
        marginBottom: 15,
        fontSize: 16,
        fontWeight: "600",
        color: "#222222",
    },

    button: {
        marginTop: 20,
        backgroundColor: "#1DAB52",
        height: 58,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },

    buttonText: {
        color: "#FFFDFF",
        fontWeight: "700",
        fontSize: 17,
    },
});