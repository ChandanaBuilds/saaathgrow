import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from "react-native";

export default function HomeScreen() {
    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.greeting}>
                    Good Morning 👋
                </Text>

                <Text style={styles.name}>
                    Chandana
                </Text>
            </View>

            {/* Wallet Card */}
            <View style={styles.walletCard}>
                <Text style={styles.walletLabel}>
                    Wallet Balance
                </Text>

                <Text style={styles.walletAmount}>
                    ₹12,450
                </Text>

                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionText}>
                            Add Money
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionText}>
                            Withdraw
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Refer Banner */}
            <View style={styles.banner}>
                <Text style={styles.bannerTitle}>
                    Invite Friends & Earn ₹100
                </Text>

                <Text style={styles.bannerSubtitle}>
                    Share your referral code and earn rewards.
                </Text>
            </View>

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>
                Quick Actions
            </Text>

            <View style={styles.quickRow}>
                <TouchableOpacity style={styles.quickCard}>
                    <Text style={styles.quickIcon}>💰</Text>
                    <Text style={styles.quickText}>Wallet</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickCard}>
                    <Text style={styles.quickIcon}>📦</Text>
                    <Text style={styles.quickText}>Orders</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickCard}>
                    <Text style={styles.quickIcon}>🎁</Text>
                    <Text style={styles.quickText}>Rewards</Text>
                </TouchableOpacity>
            </View>

            {/* Recent Activity */}
            <Text style={styles.sectionTitle}>
                Recent Activity
            </Text>

            <View style={styles.activityCard}>
                <Text>Order #1234</Text>
                <Text>₹250</Text>
            </View>

            <View style={styles.activityCard}>
                <Text>Referral Bonus</Text>
                <Text>₹50</Text>
            </View>
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
        marginBottom: 30,
    },

    greeting: {
        color: "#666",
        fontSize: 16,
    },

    name: {
        fontSize: 30,
        fontWeight: "800",
        color: "#1DAB52",
    },

    walletCard: {
        backgroundColor: "#1DAB52",
        borderRadius: 20,
        padding: 25,
    },

    walletLabel: {
        color: "#FFFFFF",
        opacity: 0.8,
    },

    walletAmount: {
        color: "#FFFFFF",
        fontSize: 34,
        fontWeight: "800",
        marginVertical: 10,
    },

    buttonRow: {
        flexDirection: "row",
        gap: 10,
    },

    actionButton: {
        backgroundColor: "#EDB131",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
    },

    actionText: {
        fontWeight: "700",
    },

    banner: {
        backgroundColor: "#78C4D8",
        padding: 20,
        borderRadius: 16,
        marginTop: 25,
    },

    bannerTitle: {
        fontWeight: "700",
        fontSize: 18,
    },

    bannerSubtitle: {
        marginTop: 5,
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        marginTop: 25,
        marginBottom: 15,
    },

    quickRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    quickCard: {
        width: "30%",
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
        elevation: 2,
    },

    quickIcon: {
        fontSize: 28,
    },

    quickText: {
        marginTop: 10,
        fontWeight: "600",
    },

    activityCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 18,
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
    },
});