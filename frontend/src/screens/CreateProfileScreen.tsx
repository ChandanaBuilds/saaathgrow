import React, { useEffect, useState } from "react";

import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from "react-native";

import { useRoute, useNavigation } from "@react-navigation/native";


export default function CreateProfileScreen() {

    const navigation = useNavigation<any>();
    const route = useRoute<any>();


    // =====================================================
    // USER DATA FROM LOGIN
    // =====================================================

    const user = route.params?.user;

    const userId =
        route.params?.userId ||
        user?.id;

    const registeredEmail =
        route.params?.email ||
        user?.email ||
        "";

    const registeredName =
        route.params?.fullName ||
        user?.full_name ||
        "";

    const registeredPhone =
        route.params?.phoneNumber ||
        user?.phone_number ||
        "";


    // =====================================================
    // FORM STATE
    // =====================================================

    const [fullName, setFullName] =
        useState(registeredName);

    const [email, setEmail] =
        useState(registeredEmail);

    const [mobile, setMobile] =
        useState(registeredPhone);

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
    // VALIDATION
    // =====================================================

    const isValidPhone = (
        phone: string
    ) => {

        return /^[6-9]\d{9}$/.test(
            phone.trim()
        );

    };


    const isValidVehicleNumber = (
        number: string
    ) => {

        return /^[A-Za-z0-9 -]{4,15}$/.test(
            number.trim()
        );

    };


    // =====================================================
    // CONTINUE
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
        // VALIDATION
        // =================================================

        if (!cleanName) {

            setErrorMessage(
                "Please enter your full name."
            );

            return;
        }


        if (!cleanEmail) {

            setErrorMessage(
                "Your email address is required."
            );

            return;
        }


        if (!cleanMobile) {

            setErrorMessage(
                "Please enter your mobile number."
            );

            return;
        }


        if (!isValidPhone(cleanMobile)) {

            setErrorMessage(
                "Please enter a valid 10-digit mobile number."
            );

            return;
        }


        if (!cleanAddress) {

            setErrorMessage(
                "Please enter your address."
            );

            return;
        }


        if (!cleanCity) {

            setErrorMessage(
                "Please enter your city."
            );

            return;
        }


        if (!cleanState) {

            setErrorMessage(
                "Please enter your state."
            );

            return;
        }


        if (
            cleanPincode.length !== 6 ||
            !/^\d{6}$/.test(cleanPincode)
        ) {

            setErrorMessage(
                "Please enter a valid 6-digit pincode."
            );

            return;
        }


        if (!cleanVehicleType) {

            setErrorMessage(
                "Please enter your vehicle type."
            );

            return;
        }


        if (!cleanVehicleNumber) {

            setErrorMessage(
                "Please enter your vehicle number."
            );

            return;
        }


        if (
            !isValidVehicleNumber(
                cleanVehicleNumber
            )
        ) {

            setErrorMessage(
                "Please enter a valid vehicle number."
            );

            return;
        }


        // =================================================
        // CONTINUE TO DOCUMENT UPLOAD
        // =================================================

        try {

            setLoading(true);

            setErrorMessage("");


            console.log(
                "PROFILE DETAILS:",
                {
                    userId,
                    fullName: cleanName,
                    email: cleanEmail,
                    mobile: cleanMobile,
                    address: cleanAddress,
                    city: cleanCity,
                    state: cleanState,
                    pincode: cleanPincode,
                    referralCode,
                    vehicleType: cleanVehicleType,
                    vehicleNumber: cleanVehicleNumber,
                }
            );


            /*
             * IMPORTANT
             *
             * We are moving to the document upload
             * screen here.
             *
             * Once your backend profile-update API
             * is ready, save these details here before
             * navigating.
             */


            setTimeout(() => {

                navigation.replace(
                    "DocumentUpload",
                    {
                        userId: userId,

                        profile: {
                            fullName: cleanName,
                            email: cleanEmail,
                            mobile: cleanMobile,
                            address: cleanAddress,
                            city: cleanCity,
                            state: cleanState,
                            pincode: cleanPincode,
                            referralCode,
                            vehicleType: cleanVehicleType,
                            vehicleNumber: cleanVehicleNumber,
                        },
                    }
                );

            }, 300);


        } catch (error) {

            console.log(
                "PROFILE ERROR:",
                error
            );

            setErrorMessage(
                "Unable to continue. Please try again."
            );

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // ERROR MESSAGE
    // =====================================================

    const [
        errorMessage,
        setErrorMessage
    ] = useState("");


    // =====================================================
    // INPUT HELPER
    // =====================================================

    const clearError = () => {

        if (errorMessage) {
            setErrorMessage("");
        }

    };


    // =====================================================
    // UI
    // =====================================================

    return (

        <View style={styles.screen}>

            <ScrollView
                style={styles.container}
                contentContainerStyle={
                    styles.contentContainer
                }
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >

                {/* =================================================
                    PROGRESS
                ================================================= */}

                <View style={styles.progressContainer}>

                    <View style={styles.progressStepActive}>
                        <Text style={styles.progressNumber}>
                            1
                        </Text>
                    </View>

                    <View style={styles.progressLine} />

                    <View style={styles.progressStep}>
                        <Text style={styles.progressNumberInactive}>
                            2
                        </Text>
                    </View>

                    <View style={styles.progressLine} />

                    <View style={styles.progressStep}>
                        <Text style={styles.progressNumberInactive}>
                            3
                        </Text>
                    </View>

                </View>


                <View style={styles.progressLabels}>

                    <Text style={styles.progressLabelActive}>
                        Profile
                    </Text>

                    <Text style={styles.progressLabel}>
                        Documents
                    </Text>

                    <Text style={styles.progressLabel}>
                        Verification
                    </Text>

                </View>


                {/* =================================================
                    HEADER
                ================================================= */}

                <View style={styles.header}>

                    <View style={styles.iconCircle}>

                        <Text style={styles.icon}>
                            👤
                        </Text>

                    </View>


                    <Text style={styles.title}>
                        Create Your Profile
                    </Text>


                    <Text style={styles.subtitle}>
                        Tell us a little about yourself
                        to complete your delivery partner profile.
                    </Text>

                </View>


                {/* =================================================
                    ERROR
                ================================================= */}

                {errorMessage ? (

                    <View style={styles.errorBox}>

                        <Text style={styles.errorIcon}>
                            !
                        </Text>

                        <Text style={styles.errorText}>
                            {errorMessage}
                        </Text>

                    </View>

                ) : null}


                {/* =================================================
                    PERSONAL DETAILS
                ================================================= */}

                <View style={styles.sectionHeader}>

                    <View style={styles.sectionIcon}>
                        <Text>👤</Text>
                    </View>

                    <View>

                        <Text style={styles.sectionTitle}>
                            Personal Details
                        </Text>

                        <Text style={styles.sectionSubtitle}>
                            Your basic information
                        </Text>

                    </View>

                </View>


                <Text style={styles.fieldLabel}>
                    Full Name
                </Text>

                <TextInput
                    placeholder="Enter your full name"
                    placeholderTextColor="#9A9A9A"
                    value={fullName}
                    onChangeText={(value) => {
                        setFullName(value);
                        clearError();
                    }}
                    style={styles.input}
                    autoCapitalize="words"
                />


                <Text style={styles.fieldLabel}>
                    Email Address
                </Text>

                <TextInput
                    placeholder="Your registered email"
                    placeholderTextColor="#9A9A9A"
                    value={email}
                    editable={false}
                    style={[
                        styles.input,
                        styles.disabledInput,
                    ]}
                    keyboardType="email-address"
                />


                <Text style={styles.fieldLabel}>
                    Mobile Number
                </Text>

                <TextInput
                    placeholder="Enter 10-digit mobile number"
                    placeholderTextColor="#9A9A9A"
                    value={mobile}
                    onChangeText={(value) => {
                        setMobile(value);
                        clearError();
                    }}
                    style={styles.input}
                    keyboardType="number-pad"
                    maxLength={10}
                />


                {/* =================================================
                    ADDRESS
                ================================================= */}

                <View style={styles.sectionHeader}>

                    <View style={styles.sectionIcon}>
                        <Text>📍</Text>
                    </View>

                    <View>

                        <Text style={styles.sectionTitle}>
                            Address Details
                        </Text>

                        <Text style={styles.sectionSubtitle}>
                            Where you are based
                        </Text>

                    </View>

                </View>


                <Text style={styles.fieldLabel}>
                    Address
                </Text>

                <TextInput
                    placeholder="Enter your complete address"
                    placeholderTextColor="#9A9A9A"
                    value={address}
                    onChangeText={(value) => {
                        setAddress(value);
                        clearError();
                    }}
                    style={[
                        styles.input,
                        styles.multilineInput,
                    ]}
                    multiline
                    textAlignVertical="top"
                />


                <View style={styles.row}>

                    <View style={styles.halfInputContainer}>

                        <Text style={styles.fieldLabel}>
                            City
                        </Text>

                        <TextInput
                            placeholder="City"
                            placeholderTextColor="#9A9A9A"
                            value={city}
                            onChangeText={(value) => {
                                setCity(value);
                                clearError();
                            }}
                            style={styles.input}
                            autoCapitalize="words"
                        />

                    </View>


                    <View style={styles.halfInputContainer}>

                        <Text style={styles.fieldLabel}>
                            Pincode
                        </Text>

                        <TextInput
                            placeholder="Pincode"
                            placeholderTextColor="#9A9A9A"
                            value={pincode}
                            onChangeText={(value) => {
                                setPincode(value);
                                clearError();
                            }}
                            style={styles.input}
                            keyboardType="number-pad"
                            maxLength={6}
                        />

                    </View>

                </View>


                <Text style={styles.fieldLabel}>
                    State
                </Text>

                <TextInput
                    placeholder="Enter your state"
                    placeholderTextColor="#9A9A9A"
                    value={state}
                    onChangeText={(value) => {
                        setStateValue(value);
                        clearError();
                    }}
                    style={styles.input}
                    autoCapitalize="words"
                />


                {/* =================================================
                    VEHICLE DETAILS
                ================================================= */}

                <View style={styles.sectionHeader}>

                    <View style={styles.sectionIcon}>
                        <Text>🏍️</Text>
                    </View>

                    <View>

                        <Text style={styles.sectionTitle}>
                            Vehicle Details
                        </Text>

                        <Text style={styles.sectionSubtitle}>
                            Information about your vehicle
                        </Text>

                    </View>

                </View>


                <Text style={styles.fieldLabel}>
                    Vehicle Type
                </Text>

                <TextInput
                    placeholder="e.g. Bike, Scooter, EV"
                    placeholderTextColor="#9A9A9A"
                    value={vehicleType}
                    onChangeText={(value) => {
                        setVehicleType(value);
                        clearError();
                    }}
                    style={styles.input}
                    autoCapitalize="words"
                />


                <Text style={styles.fieldLabel}>
                    Vehicle Number
                </Text>

                <TextInput
                    placeholder="e.g. TS09AB1234"
                    placeholderTextColor="#9A9A9A"
                    value={vehicleNumber}
                    onChangeText={(value) => {
                        setVehicleNumber(value);
                        clearError();
                    }}
                    style={styles.input}
                    autoCapitalize="characters"
                />


                {/* =================================================
                    REFERRAL
                ================================================= */}

                <Text style={styles.fieldLabel}>
                    Referral Code
                    <Text style={styles.optional}>
                        {"  "}Optional
                    </Text>
                </Text>

                <TextInput
                    placeholder="Enter referral code if you have one"
                    placeholderTextColor="#9A9A9A"
                    value={referralCode}
                    onChangeText={setReferralCode}
                    style={styles.input}
                    autoCapitalize="characters"
                />


                {/* =================================================
                    INFO BOX
                ================================================= */}

                <View style={styles.infoBox}>

                    <Text style={styles.infoIcon}>
                        ✓
                    </Text>

                    <Text style={styles.infoText}>
                        Make sure your details match the
                        information on your official documents.
                    </Text>

                </View>


                {/* =================================================
                    CONTINUE
                ================================================= */}

                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        loading &&
                        styles.buttonDisabled,
                    ]}
                    onPress={handleContinue}
                    disabled={loading}
                    activeOpacity={0.85}
                >

                    {loading ? (

                        <ActivityIndicator
                            color="#FFFFFF"
                        />

                    ) : (

                        <>

                            <Text style={styles.continueText}>
                                Continue
                            </Text>

                            <Text style={styles.arrow}>
                                →
                            </Text>

                        </>

                    )}

                </TouchableOpacity>


                <Text style={styles.bottomText}>
                    Next: Upload your verification documents
                </Text>


                <View style={styles.bottomSpace} />

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
        backgroundColor: "#F7FBF8",
    },

    container: {
        flex: 1,
    },

    contentContainer: {
        paddingHorizontal: 20,
        paddingTop: 25,
        paddingBottom: 50,
    },


    // =====================================================
    // PROGRESS
    // =====================================================

    progressContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 5,
    },

    progressStepActive: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "#1DAB52",
        justifyContent: "center",
        alignItems: "center",
    },

    progressStep: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "#E6EEE9",
        justifyContent: "center",
        alignItems: "center",
    },

    progressNumber: {
        color: "#FFFFFF",
        fontWeight: "800",
    },

    progressNumberInactive: {
        color: "#89968E",
        fontWeight: "700",
    },

    progressLine: {
        height: 2,
        width: 65,
        backgroundColor: "#DCE7E0",
    },

    progressLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 25,
        marginTop: 7,
        marginBottom: 25,
    },

    progressLabelActive: {
        fontSize: 11,
        fontWeight: "700",
        color: "#1DAB52",
    },

    progressLabel: {
        fontSize: 11,
        color: "#89968E",
    },


    // =====================================================
    // HEADER
    // =====================================================

    header: {
        alignItems: "center",
        marginBottom: 25,
    },

    iconCircle: {
        width: 62,
        height: 62,
        borderRadius: 31,
        backgroundColor: "#E8F8EF",
        borderWidth: 1,
        borderColor: "#B9E8CB",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },

    icon: {
        fontSize: 27,
    },

    title: {
        fontSize: 28,
        fontWeight: "800",
        color: "#17221B",
        textAlign: "center",
    },

    subtitle: {
        fontSize: 13,
        color: "#6E7972",
        textAlign: "center",
        lineHeight: 20,
        marginTop: 7,
        paddingHorizontal: 20,
    },


    // =====================================================
    // ERROR
    // =====================================================

    errorBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF1F1",
        borderWidth: 1,
        borderColor: "#F2C5C5",
        borderRadius: 12,
        padding: 12,
        marginBottom: 18,
    },

    errorIcon: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: "#D93025",
        color: "#FFFFFF",
        textAlign: "center",
        lineHeight: 22,
        fontWeight: "800",
        marginRight: 9,
    },

    errorText: {
        flex: 1,
        color: "#C62828",
        fontSize: 13,
        lineHeight: 18,
    },


    // =====================================================
    // SECTION
    // =====================================================

    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 15,
        marginBottom: 15,
    },

    sectionIcon: {
        width: 38,
        height: 38,
        borderRadius: 11,
        backgroundColor: "#E8F8EF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 11,
    },

    sectionTitle: {
        fontSize: 17,
        fontWeight: "800",
        color: "#202923",
    },

    sectionSubtitle: {
        fontSize: 11,
        color: "#8A938D",
        marginTop: 2,
    },


    // =====================================================
    // INPUT
    // =====================================================

    fieldLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: "#39433D",
        marginBottom: 7,
    },

    optional: {
        color: "#9AA39E",
        fontWeight: "500",
    },

    input: {
        height: 54,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#D9E4DD",
        borderRadius: 13,
        paddingHorizontal: 15,
        fontSize: 15,
        color: "#202522",
        marginBottom: 15,
    },

    disabledInput: {
        backgroundColor: "#F0F4F1",
        color: "#7D8780",
        borderColor: "#E1E7E3",
    },

    multilineInput: {
        height: 90,
        paddingTop: 14,
    },

    row: {
        flexDirection: "row",
        gap: 12,
    },

    halfInputContainer: {
        flex: 1,
    },


    // =====================================================
    // INFO
    // =====================================================

    infoBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EEF8F2",
        borderRadius: 12,
        padding: 13,
        marginTop: 5,
        marginBottom: 20,
    },

    infoIcon: {
        width: 23,
        height: 23,
        borderRadius: 12,
        backgroundColor: "#1DAB52",
        color: "#FFFFFF",
        textAlign: "center",
        lineHeight: 23,
        fontWeight: "800",
        marginRight: 9,
    },

    infoText: {
        flex: 1,
        color: "#506058",
        fontSize: 12,
        lineHeight: 18,
    },


    // =====================================================
    // BUTTON
    // =====================================================

    continueButton: {
        height: 58,
        backgroundColor: "#1DAB52",
        borderRadius: 15,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        elevation: 3,
        shadowOpacity: 0.08,
        shadowRadius: 5,
        shadowOffset: {
            width: 0,
            height: 3,
        },
    },

    buttonDisabled: {
        opacity: 0.65,
    },

    continueText: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "800",
    },

    arrow: {
        color: "#FFFFFF",
        fontSize: 24,
        marginLeft: 12,
        marginTop: -2,
    },

    bottomText: {
        textAlign: "center",
        color: "#89948D",
        fontSize: 12,
        marginTop: 12,
    },

    bottomSpace: {
        height: 20,
    },

});