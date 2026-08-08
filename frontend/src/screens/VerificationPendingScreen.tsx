import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";

export default function VerificationPendingScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>⏳</Text>
            </View>

            <Text style={styles.title}>
                Verification Pending
            </Text>

            <Text style={styles.description}>
                Your documents have been submitted successfully.
            </Text>

            <Text style={styles.description}>
                Our team is reviewing your application.
            </Text>

            <Text style={styles.description}>
                Verification usually takes 24 to 48 hours.
            </Text>

            <View style={styles.statusCard}>
                <Text style={styles.statusTitle}>
                    Current Status
                </Text>

                <Text style={styles.status}>
                    Pending Verification
                </Text>
            </View>

            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>
                    Contact Support
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFDFF",
        justifyContent: "center",
        paddingHorizontal: 30,
    },

    iconContainer: {
        alignItems: "center",
        marginBottom: 25,
    },

    icon: {
        fontSize: 80,
    },

    title: {
        fontSize: 28,
        fontWeight: "800",
        color: "#1DAB52",
        textAlign: "center",
        marginBottom: 20,
    },

    description: {
        textAlign: "center",
        color: "#666",
        fontSize: 16,
        marginBottom: 10,
        lineHeight: 24,
    },

    statusCard: {
        marginTop: 35,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: "#78C4D8",
    },

    statusTitle: {
        color: "#666",
        fontSize: 14,
        marginBottom: 10,
    },

    status: {
        color: "#EDB131",
        fontWeight: "700",
        fontSize: 18,
    },

    button: {
        marginTop: 40,
        backgroundColor: "#1DAB52",
        height: 56,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },

    buttonText: {
        color: "#FFFDFF",
        fontWeight: "700",
        fontSize: 16,
    },
});