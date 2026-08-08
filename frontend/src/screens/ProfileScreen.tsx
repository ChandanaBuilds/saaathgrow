import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
} from "react-native";

export default function ProfileScreen() {
    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Image
                    source={{
                        uri: "https://i.pravatar.cc/150"
                    }}
                    style={styles.profileImage}
                />

                <Text style={styles.name}>
                    Chandana
                </Text>

                <Text style={styles.phone}>
                    +91 9876543210
                </Text>

                <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                        Verified Driver
                    </Text>
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>
                    chandana@gmail.com
                </Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>City</Text>
                <Text style={styles.value}>
                    Hyderabad
                </Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>State</Text>
                <Text style={styles.value}>
                    Telangana
                </Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Vehicle Type</Text>
                <Text style={styles.value}>
                    Bike
                </Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Vehicle Number</Text>
                <Text style={styles.value}>
                    TS09AB1234
                </Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Verification Status</Text>
                <Text style={styles.pending}>
                    Approved ✅
                </Text>
            </View>

            <TouchableOpacity style={styles.logoutButton}>
                <Text style={styles.logoutText}>
                    Logout
                </Text>
            </TouchableOpacity>

            <View style={{ height: 30 }} />
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
        alignItems: "center",
        marginTop: 40,
        marginBottom: 30,
    },

    profileImage: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 3,
        borderColor: "#1DAB52",
    },

    name: {
        fontSize: 24,
        fontWeight: "800",
        color: "#1DAB52",
        marginTop: 15,
    },

    phone: {
        color: "#666",
        marginTop: 5,
    },

    badge: {
        backgroundColor: "#EDB131",
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 15,
    },

    badgeText: {
        color: "#FFFFFF",
        fontWeight: "700",
    },

    card: {
        backgroundColor: "#FFFFFF",
        padding: 18,
        borderRadius: 14,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#78C4D8",
    },

    label: {
        color: "#888",
        fontSize: 13,
        marginBottom: 5,
    },

    value: {
        color: "#222",
        fontSize: 17,
        fontWeight: "600",
    },

    pending: {
        color: "#1DAB52",
        fontSize: 17,
        fontWeight: "700",
    },

    logoutButton: {
        backgroundColor: "#1DAB52",
        height: 55,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
    },

    logoutText: {
        color: "#FFFDFF",
        fontWeight: "700",
        fontSize: 16,
    },
});