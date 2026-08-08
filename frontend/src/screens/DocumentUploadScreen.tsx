import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import axios from "axios";

export default function DocumentUploadScreen({
    navigation,
    route,
}: any) {
    const userId = route?.params?.userId;
    const [aadhaar, setAadhaar] = useState<any>(null);

    const [pan, setPan] = useState<any>(null);
    const [license, setLicense] = useState<any>(null);
    const pickDocument = async (setter: any) => {
        const result = await DocumentPicker.getDocumentAsync({
            type: "*/*",
        });

        if (!result.canceled) {
            setter(result.assets[0]);
        }
    };

    const handleSubmitDocuments = async () => {
        try {
            const formData = new FormData();

            formData.append("user_id", String(userId));

            if (aadhaar) {
                formData.append(
                    "aadhaar_front",
                    {
                        uri: aadhaar.uri,
                        name: aadhaar.name,
                        type: aadhaar.mimeType || "image/jpeg",
                    } as any
                );
            }

            if (pan) {
                formData.append(
                    "pan_card",
                    {
                        uri: pan.uri,
                        name: pan.name,
                        type: pan.mimeType || "image/jpeg",
                    } as any
                );
            }

            if (license) {
                formData.append(
                    "driving_license_front",
                    {
                        uri: license.uri,
                        name: license.name,
                        type: license.mimeType || "image/jpeg",
                    } as any
                );
            }

            const response = await axios.post(
                "https://saaathgrow.onrender.com/auth/upload-documents",
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                }
            );

            if (response.data.success) {
                navigation.replace(
                    "VerificationPending"
                );
            }

        } catch (error: any) {
            console.log("UPLOAD ERROR:", error);

            if (error.response) {
                console.log("Status:", error.response.status);
                console.log("Data:", error.response.data);
            }

            Alert.alert(
                "Upload Error",
                JSON.stringify(error.response?.data || error.message)
            );
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Upload Documents
            </Text>

            <Text style={styles.subtitle}>
                Upload your required documents for verification
            </Text>

            <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => pickDocument(setAadhaar)}
            >
                <Text>
                    {aadhaar ? aadhaar.name : "Upload Aadhaar Card"}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => pickDocument(setPan)}
            >
                <Text>
                    {pan ? pan.name : "Upload PAN Card"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => pickDocument(setLicense)}
            >
                <Text>
                    {license ? license.name : "Upload Driving License"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitDocuments}
            >
                <Text style={styles.submitText}>
                    Submit Documents
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
        backgroundColor: "#FFFDFF",
    },

    title: {
        fontSize: 28,
        fontWeight: "800",
        color: "#1DAB52",
        textAlign: "center",
    },

    subtitle: {
        textAlign: "center",
        marginVertical: 20,
        color: "#666",
    },

    uploadButton: {
        borderWidth: 1,
        borderColor: "#78C4D8",
        padding: 18,
        borderRadius: 12,
        marginBottom: 15,
        backgroundColor: "#FFFFFF",
    },

    submitButton: {
        backgroundColor: "#1DAB52",
        padding: 18,
        borderRadius: 12,
        marginTop: 20,
        alignItems: "center",
    },

    submitText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 16,
    },
});