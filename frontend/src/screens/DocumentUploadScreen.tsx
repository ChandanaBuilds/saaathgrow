import React, { useState } from "react";

import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
} from "react-native";

import * as DocumentPicker from "expo-document-picker";

import axios from "axios";


const API_URL =
    "https://saaathgrow.onrender.com";




export default function DocumentUploadScreen({
    navigation,
    route,
}: any) {

    const userId =
        route?.params?.userId;

    console.log("DOCUMENT SCREEN USER ID:", userId);

    const profile =
        route?.params?.profile;


    const [aadhaar, setAadhaar] =
        useState<any>(null);

    const [pan, setPan] =
        useState<any>(null);

    const [license, setLicense] =
        useState<any>(null);

    const [loading, setLoading] =
        useState(false);

    const [errorMessage, setErrorMessage] =
        useState("");


    // =====================================================
    // PICK DOCUMENT
    // =====================================================

    const pickDocument = async (
        setter: any
    ) => {

        try {

            const result =
                await DocumentPicker.getDocumentAsync({

                    type: [
                        "image/*",
                        "application/pdf",
                    ],

                    copyToCacheDirectory: true,

                });


            if (!result.canceled) {

                setter(
                    result.assets[0]
                );

                setErrorMessage("");

            }

        } catch (error) {

            console.log(
                "DOCUMENT PICK ERROR:",
                error
            );

        }

    };


    // =====================================================
    // SUBMIT DOCUMENTS
    // =====================================================

    const handleSubmitDocuments = async () => {

        setErrorMessage("");


        // -------------------------------------------------
        // REQUIRED DOCUMENTS
        // -------------------------------------------------

        if (!aadhaar) {

            setErrorMessage(
                "Please upload your Aadhaar Card."
            );

            return;
        }


        if (!pan) {

            setErrorMessage(
                "Please upload your PAN Card."
            );

            return;
        }


        if (!license) {

            setErrorMessage(
                "Please upload your Driving License."
            );

            return;
        }


        try {

            setLoading(true);


            const formData =
                new FormData();


            formData.append(
                "user_id",
                String(userId)
            );


            // =================================================
            // AADHAAR
            // =================================================

            formData.append(
                "aadhaar_front",
                {
                    uri: aadhaar.uri,
                    name:
                        aadhaar.name ||
                        "aadhaar.jpg",
                    type:
                        aadhaar.mimeType ||
                        "image/jpeg",
                } as any
            );


            // =================================================
            // PAN
            // =================================================

            formData.append(
                "pan_card",
                {
                    uri: pan.uri,
                    name:
                        pan.name ||
                        "pan.jpg",
                    type:
                        pan.mimeType ||
                        "image/jpeg",
                } as any
            );


            // =================================================
            // LICENSE
            // =================================================

            formData.append(
                "driving_license_front",
                {
                    uri: license.uri,
                    name:
                        license.name ||
                        "license.jpg",
                    type:
                        license.mimeType ||
                        "image/jpeg",
                } as any
            );


            console.log(
                "UPLOADING DOCUMENTS FOR USER:",
                userId
            );


            const response =
                await axios.post(

                    `${API_URL}/auth/upload-documents`,

                    formData,

                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data",
                        },

                        timeout: 60000,
                    }

                );


            console.log(
                "DOCUMENT UPLOAD RESPONSE:",
                response.data
            );


            if (
                response.data.success
            ) {

                navigation.replace(
                    "VerificationPending",
                    {
                        userId: userId,
                    }
                );

            } else {

                setErrorMessage(
                    response.data.message ||
                    "Unable to upload documents."
                );

            }


        } catch (error: any) {

            console.log(
                "UPLOAD ERROR:",
                error
            );


            console.log(
                "STATUS:",
                error.response?.status
            );


            console.log(
                "DATA:",
                error.response?.data
            );


            setErrorMessage(

                error.response?.data?.message ||

                "Unable to upload documents. Please try again."

            );


        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // DOCUMENT CARD
    // =====================================================

    const DocumentCard = ({
        icon,
        title,
        subtitle,
        file,
        onPress,
    }: any) => {

        return (

            <TouchableOpacity
                style={[
                    styles.documentCard,
                    file &&
                    styles.documentCardUploaded,
                ]}
                onPress={onPress}
                activeOpacity={0.8}
            >

                <View
                    style={[
                        styles.documentIcon,
                        file &&
                        styles.documentIconUploaded,
                    ]}
                >

                    <Text style={styles.documentIconText}>
                        {file ? "✓" : icon}
                    </Text>

                </View>


                <View style={styles.documentInfo}>

                    <Text style={styles.documentTitle}>
                        {title}
                    </Text>


                    <Text
                        style={styles.documentSubtitle}
                        numberOfLines={1}
                    >
                        {file
                            ? file.name
                            : subtitle
                        }
                    </Text>

                </View>


                <View style={styles.uploadAction}>

                    <Text style={styles.uploadActionText}>
                        {file ? "Change" : "Upload"}
                    </Text>

                </View>

            </TouchableOpacity>

        );

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
            >

                {/* =================================================
                    PROGRESS
                ================================================= */}

                <View style={styles.progressContainer}>

                    <View style={styles.progressStepDone}>

                        <Text style={styles.progressDoneText}>
                            ✓
                        </Text>

                    </View>

                    <View
                        style={[
                            styles.progressLine,
                            styles.progressLineActive,
                        ]}
                    />

                    <View style={styles.progressStepActive}>

                        <Text style={styles.progressNumber}>
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

                    <Text style={styles.progressLabelDone}>
                        Profile
                    </Text>

                    <Text style={styles.progressLabelActive}>
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

                        <Text style={styles.headerIcon}>
                            📄
                        </Text>

                    </View>


                    <Text style={styles.title}>
                        Upload Documents
                    </Text>


                    <Text style={styles.subtitle}>
                        Upload clear copies of your documents
                        for identity and verification.
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
                    DOCUMENTS
                ================================================= */}

                <Text style={styles.sectionTitle}>
                    Required Documents
                </Text>


                <Text style={styles.sectionSubtitle}>
                    Please upload all three documents
                </Text>


                <DocumentCard

                    icon="🪪"

                    title="Aadhaar Card"

                    subtitle="Upload Aadhaar card"

                    file={aadhaar}

                    onPress={() =>
                        pickDocument(
                            setAadhaar
                        )
                    }

                />


                <DocumentCard

                    icon="💳"

                    title="PAN Card"

                    subtitle="Upload PAN card"

                    file={pan}

                    onPress={() =>
                        pickDocument(
                            setPan
                        )
                    }

                />


                <DocumentCard

                    icon="🚗"

                    title="Driving License"

                    subtitle="Upload driving license"

                    file={license}

                    onPress={() =>
                        pickDocument(
                            setLicense
                        )
                    }

                />


                {/* =================================================
                    INFO
                ================================================= */}

                <View style={styles.infoBox}>

                    <View style={styles.infoIcon}>

                        <Text style={styles.infoIconText}>
                            i
                        </Text>

                    </View>


                    <Text style={styles.infoText}>
                        Upload clear and readable documents.
                        Accepted formats are JPG, PNG and PDF.
                    </Text>

                </View>


                {/* =================================================
                    SUBMIT
                ================================================= */}

                <TouchableOpacity

                    style={[
                        styles.submitButton,

                        loading &&
                        styles.buttonDisabled,
                    ]}

                    onPress={
                        handleSubmitDocuments
                    }

                    disabled={loading}

                    activeOpacity={0.85}

                >

                    {loading ? (

                        <ActivityIndicator
                            color="#FFFFFF"
                        />

                    ) : (

                        <>

                            <Text style={styles.submitText}>
                                continue
                            </Text>

                            <Text style={styles.arrow}>
                                →
                            </Text>

                        </>

                    )}

                </TouchableOpacity>


                <Text style={styles.bottomText}>
                    Your documents will be securely reviewed
                    by the Saath Groww team.
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
    },

    progressStepDone: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "#1DAB52",
        justifyContent: "center",
        alignItems: "center",
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

    progressDoneText: {
        color: "#FFFFFF",
        fontWeight: "900",
        fontSize: 17,
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

    progressLineActive: {
        backgroundColor: "#1DAB52",
    },

    progressLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        marginTop: 7,
        marginBottom: 25,
    },

    progressLabelDone: {
        fontSize: 11,
        color: "#1DAB52",
        fontWeight: "600",
    },

    progressLabelActive: {
        fontSize: 11,
        color: "#1DAB52",
        fontWeight: "700",
    },

    progressLabel: {
        fontSize: 11,
        color: "#89948D",
    },


    // =====================================================
    // HEADER
    // =====================================================

    header: {
        alignItems: "center",
        marginBottom: 25,
    },

    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#E8F8EF",
        borderWidth: 1,
        borderColor: "#B9E8CB",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },

    headerIcon: {
        fontSize: 28,
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
        paddingHorizontal: 15,
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
    // DOCUMENT SECTION
    // =====================================================

    sectionTitle: {
        fontSize: 19,
        fontWeight: "800",
        color: "#202923",
    },

    sectionSubtitle: {
        color: "#89948D",
        fontSize: 12,
        marginTop: 4,
        marginBottom: 15,
    },


    // =====================================================
    // DOCUMENT CARD
    // =====================================================

    documentCard: {
        minHeight: 82,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#DCE6DF",
        borderRadius: 15,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 13,
        marginBottom: 13,
    },

    documentCardUploaded: {
        borderColor: "#9DD9B2",
        backgroundColor: "#F5FCF7",
    },

    documentIcon: {
        width: 48,
        height: 48,
        borderRadius: 13,
        backgroundColor: "#EDF4EF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },

    documentIconUploaded: {
        backgroundColor: "#DDF5E5",
    },

    documentIconText: {
        fontSize: 21,
    },

    documentInfo: {
        flex: 1,
        paddingRight: 8,
    },

    documentTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: "#253029",
    },

    documentSubtitle: {
        fontSize: 11,
        color: "#8A948D",
        marginTop: 4,
    },

    uploadAction: {
        paddingHorizontal: 11,
        paddingVertical: 7,
        borderRadius: 8,
        backgroundColor: "#E8F8EF",
    },

    uploadActionText: {
        color: "#1DAB52",
        fontSize: 11,
        fontWeight: "800",
    },


    // =====================================================
    // INFO
    // =====================================================

    infoBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F0F7F3",
        borderRadius: 12,
        padding: 13,
        marginTop: 5,
        marginBottom: 20,
    },

    infoIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#78C4D8",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 9,
    },

    infoIconText: {
        color: "#FFFFFF",
        fontWeight: "900",
        fontSize: 14,
    },

    infoText: {
        flex: 1,
        color: "#5E6A63",
        fontSize: 12,
        lineHeight: 18,
    },


    // =====================================================
    // SUBMIT
    // =====================================================

    submitButton: {
        height: 58,
        backgroundColor: "#1DAB52",
        borderRadius: 15,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        elevation: 3,
    },

    buttonDisabled: {
        opacity: 0.65,
    },

    submitText: {
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
        fontSize: 11,
        lineHeight: 17,
        marginTop: 12,
        paddingHorizontal: 25,
    },

    bottomSpace: {
        height: 20,
    },

});