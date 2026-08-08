import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from "react-native";

export default function WalletScreen() {
    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            {/* Balance Card */}
            <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>
                    Available Balance
                </Text>

                <Text style={styles.balanceAmount}>
                    ₹12,450
                </Text>

                <TouchableOpacity style={styles.withdrawButton}>
                    <Text style={styles.withdrawText}>
                        Withdraw Amount
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statTitle}>
                        Today
                    </Text>

                    <Text style={styles.statValue}>
                        ₹850
                    </Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statTitle}>
                        This Week
                    </Text>

                    <Text style={styles.statValue}>
                        ₹4,250
                    </Text>
                </View>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statTitle}>
                        Pending
                    </Text>

                    <Text style={styles.pendingValue}>
                        ₹1,200
                    </Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statTitle}>
                        Total Earnings
                    </Text>

                    <Text style={styles.statValue}>
                        ₹52,340
                    </Text>
                </View>
            </View>

            {/* Transaction History */}
            <Text style={styles.sectionTitle}>
                Recent Transactions
            </Text>

            <View style={styles.transactionCard}>
                <View>
                    <Text style={styles.transactionTitle}>
                        Order #1234
                    </Text>

                    <Text style={styles.transactionDate}>
                        Today • 10:30 AM
                    </Text>
                </View>

                <Text style={styles.credit}>
                    + ₹85
                </Text>
            </View>

            <View style={styles.transactionCard}>
                <View>
                    <Text style={styles.transactionTitle}>
                        Order #1235
                    </Text>

                    <Text style={styles.transactionDate}>
                        Today • 01:45 PM
                    </Text>
                </View>

                <Text style={styles.credit}>
                    + ₹120
                </Text>
            </View>

            <View style={styles.transactionCard}>
                <View>
                    <Text style={styles.transactionTitle}>
                        Withdrawal
                    </Text>

                    <Text style={styles.transactionDate}>
                        Yesterday • 07:00 PM
                    </Text>
                </View>

                <Text style={styles.debit}>
                    - ₹500
                </Text>
            </View>

            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFDFF",
        padding: 20,
    },

    balanceCard: {
        backgroundColor: "#1DAB52",
        borderRadius: 20,
        padding: 25,
    },

    balanceLabel: {
        color: "#FFFFFF",
        opacity: 0.8,
        fontSize: 15,
    },

    balanceAmount: {
        color: "#FFFFFF",
        fontSize: 38,
        fontWeight: "800",
        marginVertical: 15,
    },

    withdrawButton: {
        backgroundColor: "#EDB131",
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
    },

    withdrawText: {
        fontWeight: "700",
        color: "#000",
    },

    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },

    statCard: {
        width: "48%",
        backgroundColor: "#FFFFFF",
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#78C4D8",
    },

    statTitle: {
        color: "#777",
        marginBottom: 10,
    },

    statValue: {
        fontSize: 22,
        fontWeight: "800",
        color: "#1DAB52",
    },

    pendingValue: {
        fontSize: 22,
        fontWeight: "800",
        color: "#EDB131",
    },

    sectionTitle: {
        marginTop: 30,
        marginBottom: 15,
        fontSize: 22,
        fontWeight: "700",
    },

    transactionCard: {
        backgroundColor: "#FFFFFF",
        padding: 18,
        borderRadius: 14,
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#EAEAEA",
    },

    transactionTitle: {
        fontWeight: "700",
        fontSize: 16,
    },

    transactionDate: {
        color: "#777",
        marginTop: 4,
    },

    credit: {
        color: "#1DAB52",
        fontWeight: "800",
        fontSize: 18,
    },

    debit: {
        color: "#E53935",
        fontWeight: "800",
        fontSize: 18,
    },
});