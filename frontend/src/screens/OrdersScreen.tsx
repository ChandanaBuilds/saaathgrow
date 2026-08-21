import React, {
    useCallback,
    useState,
} from "react";

import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
    StatusBar,
} from "react-native";

import {
    useFocusEffect,
    useRoute,
} from "@react-navigation/native";

import axios from "axios";


// =========================================================
// API
// =========================================================

const API_URL =
    "https://saaathgrow.onrender.com";


// =========================================================
// TYPES
// =========================================================

interface Order {
    id: number;

    pickup_location:
    string | null;

    drop_location:
    string | null;

    amount:
    number | null;

    distance:
    string | null;

    status:
    string | null;

    driver_id?:
    number | null;
}


// =========================================================
// SCREEN
// =========================================================

export default function OrdersScreen() {

    const route =
        useRoute<any>();


    // =====================================================
    // USER
    // =====================================================

    const user =
        route.params?.user;

    const driverId =
        user?.id;


    // =====================================================
    // STATE
    // =====================================================

    const [orders, setOrders] =
        useState<Order[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [acceptingOrderId, setAcceptingOrderId] =
        useState<number | null>(null);

    const [error, setError] =
        useState("");


    // =====================================================
    // FETCH ORDERS
    // =====================================================

    const fetchOrders = async (
        showLoader = true
    ) => {

        try {

            if (showLoader) {
                setLoading(true);
            }

            setError("");


            console.log(
                "================================"
            );

            console.log(
                "FETCHING AVAILABLE ORDERS"
            );

            console.log(
                "API:",
                `${API_URL}/orders/`
            );

            console.log(
                "================================"
            );


            const response =
                await axios.get<Order[]>(

                    `${API_URL}/orders/`,

                    {
                        timeout: 30000,
                    }

                );


            console.log(
                "ORDERS RESPONSE:",
                response.data
            );


            setOrders(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );


        } catch (error: any) {

            console.log(
                "FETCH ORDERS ERROR:",
                error.response?.data ||
                error.message
            );


            setError(
                error.response?.data?.detail ||
                "Unable to load available orders."
            );

        } finally {

            setLoading(false);

            setRefreshing(false);

        }

    };


    // =====================================================
    // LOAD WHEN SCREEN OPENS
    // =====================================================

    useFocusEffect(

        useCallback(() => {

            fetchOrders();

        }, [])

    );


    // =====================================================
    // PULL TO REFRESH
    // =====================================================

    const handleRefresh = () => {

        setRefreshing(true);

        fetchOrders(false);

    };


    // =====================================================
    // ACCEPT ORDER
    // =====================================================

    const handleAcceptOrder = async (
        order: Order
    ) => {

        if (!driverId) {

            Alert.alert(
                "Login Required",
                "Driver information is missing. Please login again."
            );

            return;
        }


        if (
            order.status &&
            order.status !== "available"
        ) {

            Alert.alert(
                "Order Unavailable",
                "This order is no longer available."
            );

            fetchOrders(false);

            return;
        }


        try {

            setAcceptingOrderId(
                order.id
            );


            console.log(
                "================================"
            );

            console.log(
                "ACCEPTING ORDER"
            );

            console.log(
                "ORDER ID:",
                order.id
            );

            console.log(
                "DRIVER ID:",
                driverId
            );

            console.log(
                "================================"
            );


            const response =
                await axios.post(

                    `${API_URL}/orders/${order.id}/accept`,

                    null,

                    {
                        params: {
                            driver_id:
                                driverId,
                        },

                        timeout: 30000,
                    }

                );


            console.log(
                "ACCEPT ORDER RESPONSE:",
                response.data
            );


            Alert.alert(
                "Order Accepted",
                "The order has been successfully assigned to you.",
                [
                    {
                        text: "OK",
                        onPress: () => {

                            fetchOrders(false);

                        },
                    },
                ]
            );


        } catch (error: any) {

            console.log(
                "ACCEPT ORDER ERROR:",
                error.response?.data ||
                error.message
            );


            const message =
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Unable to accept this order. Please try again.";


            Alert.alert(
                "Unable to Accept",
                message
            );


            fetchOrders(false);

        } finally {

            setAcceptingOrderId(
                null
            );

        }

    };


    // =====================================================
    // ORDER CARD
    // =====================================================

    const renderOrder = ({
        item,
    }: {
        item: Order;
    }) => {

        const isAccepting =
            acceptingOrderId === item.id;


        return (

            <View style={styles.orderCard}>

                {/* =========================================
                                TOP
                ========================================= */}

                <View style={styles.cardTop}>

                    <View>

                        <Text style={styles.orderLabel}>
                            ORDER
                        </Text>

                        <Text style={styles.orderId}>
                            #{item.id}
                        </Text>

                    </View>


                    <View style={styles.availableBadge}>

                        <View
                            style={styles.statusDot}
                        />

                        <Text
                            style={styles.availableText}
                        >
                            Available
                        </Text>

                    </View>

                </View>


                {/* =========================================
                            ROUTE
                ========================================= */}

                <View style={styles.routeContainer}>

                    {/* Pickup */}

                    <View style={styles.routeRow}>

                        <View style={styles.pickupIcon}>

                            <Text style={styles.pickupIconText}>
                                ●
                            </Text>

                        </View>


                        <View style={styles.locationContent}>

                            <Text style={styles.locationLabel}>
                                PICKUP
                            </Text>

                            <Text
                                style={styles.locationText}
                                numberOfLines={2}
                            >
                                {item.pickup_location ||
                                    "Pickup location unavailable"}
                            </Text>

                        </View>

                    </View>


                    {/* Route Line */}

                    <View style={styles.routeLineContainer}>

                        <View style={styles.routeLine} />

                    </View>


                    {/* Drop */}

                    <View style={styles.routeRow}>

                        <View style={styles.dropIcon}>

                            <Text style={styles.dropIconText}>
                                ◆
                            </Text>

                        </View>


                        <View style={styles.locationContent}>

                            <Text style={styles.locationLabel}>
                                DROP
                            </Text>

                            <Text
                                style={styles.locationText}
                                numberOfLines={2}
                            >
                                {item.drop_location ||
                                    "Drop location unavailable"}
                            </Text>

                        </View>

                    </View>

                </View>


                {/* =========================================
                            ORDER DETAILS
                ========================================= */}

                <View style={styles.divider} />


                <View style={styles.detailsRow}>

                    <View style={styles.detailItem}>

                        <Text style={styles.detailIcon}>
                            ₹
                        </Text>

                        <View>

                            <Text style={styles.detailLabel}>
                                EARNINGS
                            </Text>

                            <Text style={styles.detailValue}>
                                ₹{item.amount ?? 0}
                            </Text>

                        </View>

                    </View>


                    <View style={styles.verticalDivider} />


                    <View style={styles.detailItem}>

                        <Text style={styles.detailIcon}>
                            ↗
                        </Text>

                        <View>

                            <Text style={styles.detailLabel}>
                                DISTANCE
                            </Text>

                            <Text style={styles.detailValue}>
                                {item.distance || "--"}
                            </Text>

                        </View>

                    </View>

                </View>


                {/* =========================================
                            ACCEPT BUTTON
                ========================================= */}

                <TouchableOpacity

                    activeOpacity={0.85}

                    style={[
                        styles.acceptButton,

                        isAccepting &&
                        styles.acceptButtonDisabled,
                    ]}

                    onPress={() =>
                        handleAcceptOrder(item)
                    }

                    disabled={
                        isAccepting
                    }

                >

                    {isAccepting ? (

                        <ActivityIndicator
                            color="#FFFFFF"
                            size="small"
                        />

                    ) : (

                        <>

                            <Text style={styles.acceptButtonText}>
                                Accept Order
                            </Text>

                            <Text style={styles.arrow}>
                                →
                            </Text>

                        </>

                    )}

                </TouchableOpacity>

            </View>

        );

    };


    // =====================================================
    // EMPTY STATE
    // =====================================================

    const renderEmpty = () => {

        if (loading) {
            return null;
        }


        return (

            <View style={styles.emptyContainer}>

                <View style={styles.emptyIconCircle}>

                    <Text style={styles.emptyIcon}>
                        ✓
                    </Text>

                </View>


                <Text style={styles.emptyTitle}>
                    No orders available
                </Text>


                <Text style={styles.emptyText}>
                    There are currently no delivery
                    orders available in your area.
                </Text>


                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={() =>
                        fetchOrders()
                    }
                >

                    <Text style={styles.refreshButtonText}>
                        Refresh Orders
                    </Text>

                </TouchableOpacity>

            </View>

        );

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <View style={styles.loadingContainer}>

                <StatusBar
                    backgroundColor="#F7FAF8"
                    barStyle="dark-content"
                />


                <ActivityIndicator
                    size="large"
                    color="#1DAB52"
                />


                <Text style={styles.loadingText}>
                    Finding available orders...
                </Text>

            </View>

        );

    }


    // =====================================================
    // MAIN UI
    // =====================================================

    return (

        <View style={styles.container}>

            <StatusBar
                backgroundColor="#F7FAF8"
                barStyle="dark-content"
            />


            {/* =============================================
                            HEADER
            ============================================= */}

            <View style={styles.header}>

                <View>

                    <Text style={styles.smallHeader}>
                        DRIVER APP
                    </Text>

                    <Text style={styles.headerTitle}>
                        Available Orders
                    </Text>

                    <Text style={styles.headerSubtitle}>
                        Find your next delivery
                    </Text>

                </View>


                <View style={styles.orderCountBadge}>

                    <Text style={styles.orderCount}>
                        {orders.length}
                    </Text>

                    <Text style={styles.orderCountLabel}>
                        LIVE
                    </Text>

                </View>

            </View>


            {/* =============================================
                            ERROR
            ============================================= */}

            {error ? (

                <View style={styles.errorContainer}>

                    <Text style={styles.errorText}>
                        {error}
                    </Text>

                    <TouchableOpacity
                        onPress={() =>
                            fetchOrders()
                        }
                    >

                        <Text style={styles.retryText}>
                            Retry
                        </Text>

                    </TouchableOpacity>

                </View>

            ) : null}


            {/* =============================================
                            ORDERS
            ============================================= */}

            <FlatList

                data={orders}

                keyExtractor={(item) =>
                    String(item.id)
                }

                renderItem={renderOrder}

                ListEmptyComponent={
                    renderEmpty
                }

                contentContainerStyle={
                    orders.length === 0
                        ? styles.emptyList
                        : styles.listContent
                }

                showsVerticalScrollIndicator={false}

                refreshControl={

                    <RefreshControl

                        refreshing={
                            refreshing
                        }

                        onRefresh={
                            handleRefresh
                        }

                        colors={[
                            "#1DAB52"
                        ]}

                        tintColor="#1DAB52"

                    />

                }

            />

        </View>

    );

}


// =========================================================
// STYLES
// =========================================================

const styles =
    StyleSheet.create({

        // =================================================
        // CONTAINER
        // =================================================

        container: {

            flex: 1,

            backgroundColor:
                "#F7FAF8",

        },


        // =================================================
        // HEADER
        // =================================================

        header: {

            paddingHorizontal: 20,

            paddingTop: 20,

            paddingBottom: 18,

            flexDirection:
                "row",

            justifyContent:
                "space-between",

            alignItems:
                "center",

        },


        smallHeader: {

            fontSize: 11,

            fontWeight: "800",

            color:
                "#1DAB52",

            letterSpacing: 1.5,

            marginBottom: 4,

        },


        headerTitle: {

            fontSize: 27,

            fontWeight: "800",

            color:
                "#17231C",

        },


        headerSubtitle: {

            fontSize: 13,

            color:
                "#7B857F",

            marginTop: 4,

        },


        orderCountBadge: {

            minWidth: 52,

            height: 52,

            borderRadius: 16,

            backgroundColor:
                "#E8F7EE",

            justifyContent:
                "center",

            alignItems:
                "center",

            borderWidth: 1,

            borderColor:
                "#C9EBD6",

        },


        orderCount: {

            fontSize: 18,

            fontWeight: "800",

            color:
                "#1DAB52",

        },


        orderCountLabel: {

            fontSize: 8,

            fontWeight: "800",

            color:
                "#6C7971",

            letterSpacing: 0.8,

        },


        // =================================================
        // LIST
        // =================================================

        listContent: {

            paddingHorizontal: 16,

            paddingBottom: 30,

        },


        emptyList: {

            flexGrow: 1,

            paddingHorizontal: 20,

        },


        // =================================================
        // ORDER CARD
        // =================================================

        orderCard: {

            backgroundColor:
                "#FFFFFF",

            borderRadius: 20,

            padding: 18,

            marginBottom: 15,

            borderWidth: 1,

            borderColor:
                "#E4ECE7",

            shadowColor:
                "#000",

            shadowOpacity:
                0.05,

            shadowRadius:
                10,

            shadowOffset: {

                width: 0,

                height: 4,

            },

            elevation: 3,

        },


        // =================================================
        // CARD TOP
        // =================================================

        cardTop: {

            flexDirection:
                "row",

            justifyContent:
                "space-between",

            alignItems:
                "center",

            marginBottom: 18,

        },


        orderLabel: {

            fontSize: 9,

            fontWeight: "800",

            color:
                "#8A948E",

            letterSpacing: 1.2,

        },


        orderId: {

            fontSize: 17,

            fontWeight: "800",

            color:
                "#17231C",

            marginTop: 2,

        },


        availableBadge: {

            flexDirection:
                "row",

            alignItems:
                "center",

            paddingHorizontal: 10,

            paddingVertical: 7,

            borderRadius: 20,

            backgroundColor:
                "#EAF8EF",

        },


        statusDot: {

            width: 7,

            height: 7,

            borderRadius: 4,

            backgroundColor:
                "#1DAB52",

            marginRight: 6,

        },


        availableText: {

            fontSize: 11,

            fontWeight: "700",

            color:
                "#168642",

        },


        // =================================================
        // ROUTE
        // =================================================

        routeContainer: {

            marginBottom: 4,

        },


        routeRow: {

            flexDirection:
                "row",

            alignItems:
                "center",

        },


        pickupIcon: {

            width: 34,

            height: 34,

            borderRadius: 17,

            backgroundColor:
                "#E8F7EE",

            justifyContent:
                "center",

            alignItems:
                "center",

        },


        pickupIconText: {

            color:
                "#1DAB52",

            fontSize: 15,

        },


        dropIcon: {

            width: 34,

            height: 34,

            borderRadius: 17,

            backgroundColor:
                "#FFF5DD",

            justifyContent:
                "center",

            alignItems:
                "center",

        },


        dropIconText: {

            color:
                "#EDB131",

            fontSize: 12,

        },


        locationContent: {

            flex: 1,

            marginLeft: 12,

        },


        locationLabel: {

            fontSize: 9,

            fontWeight: "800",

            color:
                "#8B958F",

            letterSpacing: 1,

            marginBottom: 3,

        },


        locationText: {

            fontSize: 15,

            fontWeight: "700",

            color:
                "#27332C",

            lineHeight: 20,

        },


        routeLineContainer: {

            height: 24,

            marginLeft: 16.5,

            justifyContent:
                "center",

        },


        routeLine: {

            width: 1,

            height: 18,

            borderLeftWidth: 1,

            borderStyle:
                "dashed",

            borderColor:
                "#B9C8BF",

        },


        // =================================================
        // DIVIDER
        // =================================================

        divider: {

            height: 1,

            backgroundColor:
                "#EDF1EE",

            marginTop: 18,

            marginBottom: 16,

        },


        // =================================================
        // DETAILS
        // =================================================

        detailsRow: {

            flexDirection:
                "row",

            alignItems:
                "center",

            marginBottom: 17,

        },


        detailItem: {

            flex: 1,

            flexDirection:
                "row",

            alignItems:
                "center",

        },


        detailIcon: {

            width: 34,

            height: 34,

            borderRadius: 10,

            backgroundColor:
                "#F1F7F3",

            textAlign:
                "center",

            textAlignVertical:
                "center",

            fontSize: 17,

            fontWeight: "800",

            color:
                "#1DAB52",

            marginRight: 9,

        },


        detailLabel: {

            fontSize: 8,

            fontWeight: "800",

            color:
                "#8B958F",

            letterSpacing: 0.8,

            marginBottom: 2,

        },


        detailValue: {

            fontSize: 15,

            fontWeight: "800",

            color:
                "#27332C",

        },


        verticalDivider: {

            width: 1,

            height: 32,

            backgroundColor:
                "#E7ECE9",

            marginHorizontal: 12,

        },


        // =================================================
        // ACCEPT BUTTON
        // =================================================

        acceptButton: {

            height: 52,

            borderRadius: 14,

            backgroundColor:
                "#1DAB52",

            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "center",

            elevation: 3,

            shadowColor:
                "#1DAB52",

            shadowOpacity:
                0.18,

            shadowRadius:
                7,

            shadowOffset: {

                width: 0,

                height: 4,

            },

        },


        acceptButtonDisabled: {

            opacity: 0.7,

        },


        acceptButtonText: {

            color:
                "#FFFFFF",

            fontSize: 15,

            fontWeight: "800",

        },


        arrow: {

            color:
                "#FFFFFF",

            fontSize: 20,

            fontWeight: "700",

            marginLeft: 10,

        },


        // =================================================
        // LOADING
        // =================================================

        loadingContainer: {

            flex: 1,

            backgroundColor:
                "#F7FAF8",

            justifyContent:
                "center",

            alignItems:
                "center",

        },


        loadingText: {

            marginTop: 14,

            fontSize: 14,

            color:
                "#68756E",

            fontWeight:
                "600",

        },


        // =================================================
        // EMPTY
        // =================================================

        emptyContainer: {

            flex: 1,

            justifyContent:
                "center",

            alignItems:
                "center",

            paddingHorizontal: 25,

        },


        emptyIconCircle: {

            width: 72,

            height: 72,

            borderRadius: 36,

            backgroundColor:
                "#E8F7EE",

            justifyContent:
                "center",

            alignItems:
                "center",

            marginBottom: 18,

        },


        emptyIcon: {

            fontSize: 30,

            color:
                "#1DAB52",

            fontWeight:
                "800",

        },


        emptyTitle: {

            fontSize: 20,

            fontWeight:
                "800",

            color:
                "#17231C",

            marginBottom: 8,

        },


        emptyText: {

            fontSize: 14,

            color:
                "#7B857F",

            textAlign:
                "center",

            lineHeight: 21,

            maxWidth: 300,

        },


        refreshButton: {

            marginTop: 20,

            backgroundColor:
                "#1DAB52",

            paddingHorizontal: 22,

            paddingVertical: 12,

            borderRadius: 12,

        },


        refreshButtonText: {

            color:
                "#FFFFFF",

            fontSize: 14,

            fontWeight:
                "800",

        },


        // =================================================
        // ERROR
        // =================================================

        errorContainer: {

            marginHorizontal: 16,

            marginBottom: 10,

            padding: 13,

            borderRadius: 12,

            backgroundColor:
                "#FFF1F1",

            borderWidth: 1,

            borderColor:
                "#F2CACA",

            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "space-between",

        },


        errorText: {

            flex: 1,

            fontSize: 12,

            color:
                "#C62828",

            marginRight: 10,

        },


        retryText: {

            fontSize: 13,

            fontWeight:
                "800",

            color:
                "#1DAB52",

        },

    });