import React, { useState } from "react";

import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    Platform,
} from "react-native";

import * as DocumentPicker from "expo-document-picker";

// =========================================================
// API
// =========================================================

const API_URL =
    "https://saaathgrow.onrender.com";


// =========================================================
// SCREEN
// =========================================================

export default function DocumentUploadScreen({
    navigation,
    route,
}: any) {

    // =====================================================
    // USER
    // =====================================================

    const userId =
        route?.params?.userId;

    // =====================================================
    // DOCUMENT STATE
    // =====================================================

    const [aadhaar, setAadhaar] =
        useState<any>(null);

    const [pan, setPan] =
        useState<any>(null);

    const [drivingLicense, setDrivingLicense] =
        useState<any>(null);

    // =====================================================
    // UI STATE
    // =====================================================

    const [loading, setLoading] =
        useState(false);

    const [errorMessage, setErrorMessage] =
        useState("");

    console.log(
        "DOCUMENT SCREEN USER ID:",
        userId
    );


    // =====================================================
    // PICK DOCUMENT
    // =====================================================

    const pickDocument = async (
        setter: React.Dispatch<
            React.SetStateAction<any>
        >
    ) => {

        try {

            setErrorMessage("");

            const result =
                await DocumentPicker.getDocumentAsync({

                    type: [
                        "image/*",
                        "application/pdf",
                    ],

                    copyToCacheDirectory: true,

                    multiple: false,
                });


            // ------------------------------------------------
            // USER CANCELLED
            // ------------------------------------------------

            if (result.canceled) {
                return;
            }


            // ------------------------------------------------
            // GET FILE
            // ------------------------------------------------

            const file =
                result.assets[0];


            console.log(
                "SELECTED FILE:",
                file
            );


            setter(file);

        } catch (error) {

            console.log(
                "DOCUMENT PICK ERROR:",
                error
            );


            setErrorMessage(
                "Unable to select the document. Please try again."
            );
        }
    };


    // =====================================================
    // APPEND FILE TO FORMDATA
    // =====================================================

    const appendFile = async (
        formData: FormData,
        fieldName: string,
        file: any
    ) => {

        if (!file) {
            return;
        }


        // =================================================
        // WEB
        // =================================================

        if (Platform.OS === "web") {

            try {

                const response =
                    await fetch(file.uri);

                const blob =
                    await response.blob();


                const webFile =
                    new File(
                        [
                            blob
                        ],
                        file.name ||
                        `${fieldName}.pdf`,
                        {
                            type:
                                file.mimeType ||
                                blob.type ||
                                "application/octet-stream",
                        }
                    );


                formData.append(
                    fieldName,
                    webFile
                );


                console.log(
                    "WEB FILE APPENDED:",
                    fieldName,
                    webFile.name
                );


            } catch (error) {

                console.log(
                    "WEB FILE ERROR:",
                    fieldName,
                    error
                );

                throw error;
            }


            return;
        }


        // =================================================
        // ANDROID / IOS
        // =================================================

        formData.append(
            fieldName,
            {
                uri: file.uri,

                name:
                    file.name ||
                    `${fieldName}.pdf`,

                type:
                    file.mimeType ||
                    "application/octet-stream",

            } as any
        );


        console.log(
            "MOBILE FILE APPENDED:",
            fieldName,
            file.name
        );
    };


    // =====================================================
    // VALIDATE DOCUMENTS
    // =====================================================

    const validateDocuments = () => {

        // -------------------------------------------------
        // USER
        // -------------------------------------------------

        if (!userId) {

            return (
                "User information is missing. Please login again."
            );
        }


        // -------------------------------------------------
        // AADHAAR
        // -------------------------------------------------

        if (!aadhaar) {

            return (
                "Please upload your Aadhaar Card."
            );
        }


        // -------------------------------------------------
        // PAN
        // -------------------------------------------------

        if (!pan) {

            return (
                "Please upload your PAN Card."
            );
        }


        // -------------------------------------------------
        // DRIVING LICENSE
        // -------------------------------------------------

        if (!drivingLicense) {

            return (
                "Please upload your Driving License."
            );
        }


        return "";
    };


    // =====================================================
    // HANDLE CONTINUE
    // =====================================================

    const handleContinue = async () => {

        setErrorMessage("");


        // =================================================
        // VALIDATION
        // =================================================

        const validationError =
            validateDocuments();


        if (validationError) {

            setErrorMessage(
                validationError
            );

            return;
        }


        // =================================================
        // START LOADING
        // =================================================

        try {

            setLoading(true);


            console.log(
                "================================"
            );

            console.log(
                "UPLOADING DOCUMENTS"
            );

            console.log(
                "USER ID:",
                userId
            );

            console.log(
                "AADHAAR:",
                aadhaar?.name
            );

            console.log(
                "PAN:",
                pan?.name
            );

            console.log(
                "DRIVING LICENSE:",
                drivingLicense?.name
            );

            console.log(
                "PLATFORM:",
                Platform.OS
            );

            console.log(
                "================================"
            );


            // =================================================
            // CREATE FORMDATA
            // =================================================

            const formData =
                new FormData();


            // =================================================
            // USER ID
            // =================================================

            formData.append(
                "user_id",
                String(userId)
            );


            // =================================================
            // AADHAAR
            // =================================================

            await appendFile(
                formData,
                "aadhaar",
                aadhaar
            );


            // =================================================
            // PAN CARD
            // =================================================

            await appendFile(
                formData,
                "pan_card",
                pan
            );


            // =================================================
            // DRIVING LICENSE
            // =================================================

            await appendFile(
                formData,
                "driving_license",
                drivingLicense
            );


            // =================================================
            // API URL
            // =================================================

            const uploadUrl =
                `${API_URL}/auth/upload-documents`;


            console.log(
                "SENDING REQUEST TO:",
                uploadUrl
            );


            // =================================================
            // SEND REQUEST
            // =================================================
            //
            // IMPORTANT:
            //
            // Do NOT manually set:
            //
            // Content-Type: multipart/form-data
            //
            // Fetch automatically creates the
            // correct multipart boundary.
            //
            // =================================================

            const response =
                await fetch(
                    uploadUrl,
                    {
                        method: "POST",

                        body: formData,
                    }
                );


            // =================================================
            // HTTP STATUS
            // =================================================

            console.log(
                "UPLOAD HTTP STATUS:",
                response.status
            );


            // =================================================
            // READ RESPONSE
            // =================================================

            let data: any = null;


            try {

                data =
                    await response.json();

            } catch (error) {

                console.log(
                    "RESPONSE JSON ERROR:",
                    error
                );

                data = null;
            }


            console.log(
                "UPLOAD RESPONSE:",
                data
            );


            // =================================================
            // SUCCESS
            // =================================================

            if (
                response.ok &&
                data?.success
            ) {

                console.log(
                    "DOCUMENT UPLOAD SUCCESS"
                );


                setErrorMessage("");


                navigation.replace(
                    "VerificationPending",
                    {
                        userId: userId,
                    }
                );


                return;
            }


            // =================================================
            // SERVER ERROR
            // =================================================

            const serverMessage =
                data?.message ||
                data?.detail ||
                "Unable to upload documents. Please try again.";


            console.log(
                "UPLOAD SERVER ERROR:",
                serverMessage
            );


            setErrorMessage(
                serverMessage
            );


        } catch (error: any) {

            console.log(
                "UPLOAD ERROR:",
                error
            );


            setErrorMessage(
                "Unable to upload documents. Please check your internet connection and try again."
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

                {/* =========================================
                    ICON
                ========================================= */}

                <View
                    style={[
                        styles.documentIcon,

                        file &&
                        styles.documentIconUploaded,
                    ]}
                >

                    <Text
                        style={
                            styles.documentIconText
                        }
                    >

                        {file
                            ? "✓"
                            : icon}

                    </Text>

                </View>


                {/* =========================================
                    DOCUMENT INFORMATION
                ========================================= */}

                <View
                    style={
                        styles.documentInfo
                    }
                >

                    <Text
                        style={
                            styles.documentTitle
                        }
                    >

                        {title}

                    </Text>


                    <Text
                        style={
                            styles.documentSubtitle
                        }

                        numberOfLines={1}
                    >

                        {file
                            ? file.name
                            : subtitle}

                    </Text>

                </View>


                {/* =========================================
                    ACTION
                ========================================= */}

                <View
                    style={
                        styles.uploadAction
                    }
                >

                    <Text
                        style={
                            styles.uploadActionText
                        }
                    >

                        {file
                            ? "Change"
                            : "Upload"}

                    </Text>

                </View>

            </TouchableOpacity>
        );
    };


    // =====================================================
    // UI
    // =====================================================

    return (

        <View
            style={
                styles.screen
            }
        >

            <ScrollView

                style={
                    styles.container
                }

                contentContainerStyle={
                    styles.contentContainer
                }

                showsVerticalScrollIndicator={
                    false
                }
            >

                {/* =========================================
                    PROGRESS
                ========================================= */}

                <View
                    style={
                        styles.progressContainer
                    }
                >

                    {/* PROFILE DONE */}

                    <View
                        style={
                            styles.progressStepDone
                        }
                    >

                        <Text
                            style={
                                styles.progressDoneText
                            }
                        >

                            ✓

                        </Text>

                    </View>


                    {/* ACTIVE LINE */}

                    <View
                        style={[
                            styles.progressLine,

                            styles.progressLineActive,
                        ]}
                    />


                    {/* DOCUMENTS ACTIVE */}

                    <View
                        style={
                            styles.progressStepActive
                        }
                    >

                        <Text
                            style={
                                styles.progressNumber
                            }
                        >

                            2

                        </Text>

                    </View>


                    {/* INACTIVE LINE */}

                    <View
                        style={
                            styles.progressLine
                        }
                    />


                    {/* VERIFICATION */}

                    <View
                        style={
                            styles.progressStep
                        }
                    >

                        <Text
                            style={
                                styles.progressNumberInactive
                            }
                        >

                            3

                        </Text>

                    </View>

                </View>


                {/* =========================================
                    PROGRESS LABELS
                ========================================= */}

                <View
                    style={
                        styles.progressLabels
                    }
                >

                    <Text
                        style={
                            styles.progressLabelDone
                        }
                    >

                        Profile

                    </Text>


                    <Text
                        style={
                            styles.progressLabelActive
                        }
                    >

                        Documents

                    </Text>


                    <Text
                        style={
                            styles.progressLabel
                        }
                    >

                        Verification

                    </Text>

                </View>


                {/* =========================================
                    HEADER
                ========================================= */}

                <View
                    style={
                        styles.header
                    }
                >

                    <View
                        style={
                            styles.iconCircle
                        }
                    >

                        <Text
                            style={
                                styles.headerIcon
                            }
                        >

                            📄

                        </Text>

                    </View>


                    <Text
                        style={
                            styles.title
                        }
                    >

                        Upload Documents

                    </Text>


                    <Text
                        style={
                            styles.subtitle
                        }
                    >

                        Upload clear and readable
                        copies of your documents for
                        identity verification.

                    </Text>

                </View>


                {/* =========================================
                    ERROR MESSAGE
                ========================================= */}

                {errorMessage ? (

                    <View
                        style={
                            styles.errorBox
                        }
                    >

                        <Text
                            style={
                                styles.errorIcon
                            }
                        >

                            !

                        </Text>


                        <Text
                            style={
                                styles.errorText
                            }
                        >

                            {errorMessage}

                        </Text>

                    </View>

                ) : null}


                {/* =========================================
                    REQUIRED DOCUMENTS
                ========================================= */}

                <Text
                    style={
                        styles.sectionTitle
                    }
                >

                    Required Documents

                </Text>


                <Text
                    style={
                        styles.sectionSubtitle
                    }
                >

                    Please upload all three documents
                    for verification.

                </Text>


                {/* =========================================
                    AADHAAR
                ========================================= */}

                <DocumentCard

                    icon="🪪"

                    title="Aadhaar Card"

                    subtitle="Upload your Aadhaar Card"

                    file={aadhaar}

                    onPress={() =>
                        pickDocument(
                            setAadhaar
                        )
                    }

                />


                {/* =========================================
                    PAN
                ========================================= */}

                <DocumentCard

                    icon="💳"

                    title="PAN Card"

                    subtitle="Upload your PAN Card"

                    file={pan}

                    onPress={() =>
                        pickDocument(
                            setPan
                        )
                    }

                />


                {/* =========================================
                    DRIVING LICENSE
                ========================================= */}

                <DocumentCard

                    icon="🚗"

                    title="Driving License"

                    subtitle="Upload your Driving License"

                    file={drivingLicense}

                    onPress={() =>
                        pickDocument(
                            setDrivingLicense
                        )
                    }

                />


                {/* =========================================
                    INFORMATION
                ========================================= */}

                <View
                    style={
                        styles.infoBox
                    }
                >

                    <View
                        style={
                            styles.infoIcon
                        }
                    >

                        <Text
                            style={
                                styles.infoIconText
                            }
                        >

                            i

                        </Text>

                    </View>


                    <Text
                        style={
                            styles.infoText
                        }
                    >

                        Accepted formats: JPG, PNG and
                        PDF. Please make sure all
                        documents are clear and readable.

                    </Text>

                </View>


                {/* =========================================
                    CONTINUE BUTTON
                ========================================= */}

                <TouchableOpacity

                    style={[
                        styles.submitButton,

                        loading &&
                        styles.buttonDisabled,
                    ]}

                    onPress={
                        handleContinue
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

                            <Text
                                style={
                                    styles.submitText
                                }
                            >

                                Continue

                            </Text>


                            <Text
                                style={
                                    styles.arrow
                                }
                            >

                                →

                            </Text>

                        </>

                    )}

                </TouchableOpacity>


                {/* =========================================
                    SECURITY MESSAGE
                ========================================= */}

                <Text
                    style={
                        styles.bottomText
                    }
                >

                    Your documents will be securely
                    reviewed by the Saath Groww team.

                </Text>


                <View
                    style={
                        styles.bottomSpace
                    }
                />

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
    // SECTION
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
    // INFORMATION BOX
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
    // BUTTON
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


    // =====================================================
    // BOTTOM TEXT
    // =====================================================

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