import React from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from "react-native";

const orders = [
    {
        id: "1",
        pickup: "Kukatpally",
        drop: "Madhapur",
        amount: 85,
        distance: "5.2 km",
    },
    {
        id: "2",
        pickup: "Ameerpet",
        drop: "Hitech City",
        amount: 120,
        distance: "8.1 km",
    },
];

export default function OrdersScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>
                Available Orders
            </Text>

            <FlatList
                data={orders}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.location}>
                            📍 Pickup: {item.pickup}
                        </Text>

                        <Text style={styles.location}>
                            🏁 Drop: {item.drop}
                        </Text>

                        <Text style={styles.info}>
                            Distance: {item.distance}
                        </Text>

                        <Text style={styles.amount}>
                            ₹{item.amount}
                        </Text>

                        <TouchableOpacity style={styles.button}>
                            <Text style={styles.buttonText}>
                                Accept Order
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFDFF",
        padding: 20,
    },

    header: {
        fontSize: 28,
        fontWeight: "800",
        color: "#1DAB52",
        marginBottom: 20,
    },

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#78C4D8",
    },

    location: {
        fontSize: 16,
        marginBottom: 8,
    },

    info: {
        color: "#666",
        marginTop: 5,
    },

    amount: {
        fontSize: 24,
        fontWeight: "800",
        color: "#1DAB52",
        marginVertical: 10,
    },

    button: {
        backgroundColor: "#1DAB52",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
    },

    buttonText: {
        color: "#FFFFFF",
        fontWeight: "700",
    },
});