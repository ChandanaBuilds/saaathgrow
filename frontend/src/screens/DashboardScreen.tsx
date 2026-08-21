import React, { useCallback, useEffect, useState } from "react";

import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";


// =========================================================
// API
// =========================================================

const API_URL = "https://saaathgrow.onrender.com";


// =========================================================
// TYPES
// =========================================================

interface Driver {
    id?: number;
    full_name?: string;
    email?: string;
    phone_number?: string;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    vehicle_type?: string | null;
    vehicle_number?: string | null;
    is_approved?: boolean;
    email_verified?: boolean;
    status?: string | null;
}

interface Order {
    id: number;
    pickup_location?: string | null;
    drop_location?: string | null;
    amount?: number | null;
    distance?: string | null;
    status?: string | null;
    driver_id?: number | null;
}

interface Wallet {
    balance: number;
    total_earnings: number;
    pending_amount: number;
}


// =========================================================
// RESPONSE TYPES
// =========================================================

interface ApiResponse {
    success?: boolean;
    message?: string;
    detail?: string;

    user?: Driver;
    driver?: Driver;

    balance?: number;
    total_earnings?: number;
    pending_amount?: number;
}


// =========================================================
// DASHBOARD
// =========================================================

export default function DashboardScreen({
    navigation,
    route,
}: any) {

    // -------------------------------------------------------
    // DRIVER DATA
    // -------------------------------------------------------

    const routeUser = route?.params?.user;

    const routeUserId =
        route?.params?.userId ??
        routeUser?.id;


    const [driver, setDriver] =
        useState<Driver | null>(
            routeUser || null
        );


    // -------------------------------------------------------
    // DATA
    // -------------------------------------------------------

    const [wallet, setWallet] =
        useState<Wallet>({
            balance: 0,
            total_earnings: 0,
            pending_amount: 0,
        });


    const [orders, setOrders] =
        useState<Order[]>([]);


    // -------------------------------------------------------
    // STATES
    // -------------------------------------------------------

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [acceptingOrderId, setAcceptingOrderId] =
        useState<number | null>(null);


    // =======================================================
    // GET USER ID
    // =======================================================

    const getUserId = (): number | null => {

        if (routeUserId !== undefined &&
            routeUserId !== null) {

            return Number(routeUserId);
        }

        if (driver?.id !== undefined &&
            driver?.id !== null) {

            return Number(driver.id);
        }

        return null;
    };


    // =======================================================
    // API REQUEST
    // =======================================================

    const apiRequest = async (
        path: string,
        options: RequestInit = {}
    ) => {

        const response = await fetch(
            `${API_URL}${path}`,
            {
                ...options,

                headers: {
                    Accept: "application/json",

                    "Content-Type":
                        "application/json",

                    ...(options.headers || {}),
                },
            }
        );


        const raw =
            await response.text();


        let data: any = {};


        try {

            data =
                raw
                    ? JSON.parse(raw)
                    : {};

        } catch {

            data = {
                message: raw,
            };

        }


        if (!response.ok) {

            throw new Error(
                data?.detail ||
                data?.message ||
                `Request failed: ${response.status}`
            );
        }


        return data;
    };


    // =======================================================
    // LOAD WALLET
    // =======================================================

    const loadWallet = async (
        userId: number
    ) => {

        const data =
            await apiRequest(
                `/wallet/${userId}`
            );


        setWallet({

            balance:
                Number(
                    data?.balance ?? 0
                ),

            total_earnings:
                Number(
                    data?.total_earnings ?? 0
                ),

            pending_amount:
                Number(
                    data?.pending_amount ?? 0
                ),
        });
    };


    // =======================================================
    // LOAD ORDERS
    // =======================================================

    const loadOrders = async () => {

        const data =
            await apiRequest(
                "/orders/"
            );


        if (Array.isArray(data)) {

            setOrders(data);

            return;
        }


        if (
            Array.isArray(data?.orders)
        ) {

            setOrders(
                data.orders
            );

            return;
        }


        if (
            Array.isArray(data?.data)
        ) {

            setOrders(
                data.data
            );

            return;
        }


        setOrders([]);
    };


    // =======================================================
    // LOAD DASHBOARD
    // =======================================================

    const loadDashboard =
        useCallback(
            async () => {

                try {

                    setLoading(true);


                    const userId =
                        getUserId();


                    // -----------------------------------------------
                    // WALLET
                    // -----------------------------------------------

                    if (userId) {

                        await loadWallet(
                            userId
                        );
                    }


                    // -----------------------------------------------
                    // AVAILABLE ORDERS
                    // -----------------------------------------------

                    await loadOrders();


                } catch (error: any) {

                    console.log(
                        "DASHBOARD ERROR:",
                        error
                    );


                    Alert.alert(
                        "Unable to Load Dashboard",
                        error?.message ||
                        "Something went wrong."
                    );


                } finally {

                    setLoading(false);
                }

            },
            [
                driver?.id,
                routeUserId,
            ]
        );


    // =======================================================
    // INITIAL LOAD
    // =======================================================

    useEffect(() => {

        loadDashboard();

    }, [loadDashboard]);


    // =======================================================
    // REFRESH
    // =======================================================

    const onRefresh =
        async () => {

            try {

                setRefreshing(true);

                await loadDashboard();

            } finally {

                setRefreshing(false);
            }
        };


    // =======================================================
    // ACCEPT ORDER
    // =======================================================

    const acceptOrder =
        async (
            orderId: number
        ) => {

            const userId =
                getUserId();


            if (!userId) {

                Alert.alert(
                    "Driver Information Missing",
                    "Unable to identify the logged-in driver."
                );

                return;
            }


            Alert.alert(
                "Accept Delivery",
                "Do you want to accept this delivery?",
                [
                    {
                        text: "Cancel",
                        style: "cancel",
                    },

                    {
                        text: "Accept",

                        onPress:
                            async () => {

                                try {

                                    setAcceptingOrderId(
                                        orderId
                                    );


                                    const data =
                                        await apiRequest(
                                            `/orders/${orderId}/accept?driver_id=${userId}`,
                                            {
                                                method: "POST",
                                            }
                                        );


                                    Alert.alert(
                                        "Delivery Accepted",
                                        data?.message ||
                                        "Order accepted successfully."
                                    );


                                    // ---------------------------------------
                                    // Refresh orders
                                    // ---------------------------------------

                                    await loadOrders();


                                    // ---------------------------------------
                                    // Refresh wallet
                                    // ---------------------------------------

                                    await loadWallet(
                                        userId
                                    );


                                } catch (
                                error: any
                                ) {

                                    Alert.alert(
                                        "Unable to Accept",
                                        error?.message ||
                                        "Could not accept this delivery."
                                    );


                                } finally {

                                    setAcceptingOrderId(
                                        null
                                    );
                                }
                            },
                    },
                ]
            );
        };



    // =======================================================
    // FORMAT MONEY
    // =======================================================

    const money =
        (value: number) => {

            return `₹${Number(
                value || 0
            ).toLocaleString("en-IN")}`;
        };


    // =======================================================
    // LOADING
    // =======================================================

    if (loading) {

        return (

            <SafeAreaView
                style={styles.loadingContainer}
            >

                <StatusBar
                    barStyle="dark-content"
                    backgroundColor="#F5F7F6"
                />


                <View
                    style={styles.loadingLogo}
                >

                    <Text
                        style={styles.loadingLogoText}
                    >
                        SG
                    </Text>

                </View>


                <ActivityIndicator
                    size="large"
                    color="#1DAB52"
                />


                <Text
                    style={styles.loadingText}
                >
                    Loading your dashboard...
                </Text>

            </SafeAreaView>
        );
    }


    // =======================================================
    // DASHBOARD
    // =======================================================

    return (

        <SafeAreaView
            style={styles.container}
        >

            <StatusBar
                barStyle="dark-content"
                backgroundColor="#F5F7F6"
            />


            <ScrollView

                showsVerticalScrollIndicator={false}

                contentContainerStyle={
                    styles.scrollContent
                }

                refreshControl={

                    <RefreshControl

                        refreshing={refreshing}

                        onRefresh={onRefresh}

                        colors={[
                            "#1DAB52",
                        ]}

                        tintColor="#1DAB52"

                    />

                }
            >

                {/* =================================================
                    HEADER
        ================================================= */}

                <View
                    style={styles.header}
                >

                    <View
                        style={styles.headerLeft}
                    >

                        <View
                            style={styles.logo}
                        >

                            <Text
                                style={styles.logoText}
                            >
                                SG
                            </Text>

                        </View>


                        <View
                            style={styles.headerInfo}
                        >

                            <Text
                                style={styles.smallText}
                            >
                                Welcome back
                            </Text>


                            <Text
                                style={styles.driverName}
                                numberOfLines={1}
                            >
                                {driver?.full_name ||
                                    "Driver"}
                            </Text>

                        </View>

                    </View>



                </View>


                {/* =================================================
                    VERIFIED STATUS
        ================================================= */}

                <View
                    style={styles.verifiedCard}
                >

                    <View
                        style={styles.verifiedIcon}
                    >

                        <Text
                            style={styles.verifiedIconText}
                        >
                            ✓
                        </Text>

                    </View>


                    <View
                        style={styles.verifiedInfo}
                    >

                        <Text
                            style={styles.verifiedTitle}
                        >
                            Driver Verified
                        </Text>

                        <Text
                            style={styles.verifiedSubtitle}
                        >
                            Your account is approved and ready
                            to receive deliveries.
                        </Text>

                    </View>

                </View>


                {/* =================================================
                    EARNINGS CARD
        ================================================= */}

                <View
                    style={styles.earningsCard}
                >

                    <View
                        style={styles.earningsHeader}
                    >

                        <View>

                            <Text
                                style={styles.earningsLabel}
                            >
                                AVAILABLE BALANCE
                            </Text>


                            <Text
                                style={styles.balance}
                            >
                                {money(wallet.balance)}
                            </Text>

                        </View>


                        <View
                            style={styles.walletIcon}
                        >

                            <Text
                                style={styles.walletIconText}
                            >
                                ₹
                            </Text>

                        </View>

                    </View>


                    <View
                        style={styles.earningsDivider}
                    />


                    <View
                        style={styles.earningsBottom}
                    >

                        <View>

                            <Text
                                style={styles.earningsSmallLabel}
                            >
                                Total Earnings
                            </Text>

                            <Text
                                style={styles.earningsValue}
                            >
                                {money(
                                    wallet.total_earnings
                                )}
                            </Text>

                        </View>


                        <View
                            style={styles.earningsBottomRight}
                        >

                            <Text
                                style={styles.earningsSmallLabel}
                            >
                                Pending
                            </Text>

                            <Text
                                style={styles.pendingValue}
                            >
                                {money(
                                    wallet.pending_amount
                                )}
                            </Text>

                        </View>

                    </View>

                </View>


                {/* =================================================
                    QUICK STATS
        ================================================= */}

                <View
                    style={styles.statsRow}
                >

                    <View
                        style={styles.statCard}
                    >

                        <View
                            style={[
                                styles.statIcon,
                                {
                                    backgroundColor:
                                        "#E8F7EE",
                                },
                            ]}
                        >

                            <Text
                                style={styles.statIconText}
                            >
                                📦
                            </Text>

                        </View>


                        <Text
                            style={styles.statNumber}
                        >
                            {orders.length}
                        </Text>


                        <Text
                            style={styles.statLabel}
                        >
                            Available
                        </Text>

                    </View>


                    <View
                        style={styles.statCard}
                    >

                        <View
                            style={[
                                styles.statIcon,
                                {
                                    backgroundColor:
                                        "#FFF6DD",
                                },
                            ]}
                        >

                            <Text
                                style={styles.statIconText}
                            >
                                🚚
                            </Text>

                        </View>


                        <Text
                            style={styles.statNumber}
                        >
                            0
                        </Text>


                        <Text
                            style={styles.statLabel}
                        >
                            Active
                        </Text>

                    </View>


                    <View
                        style={styles.statCard}
                    >

                        <View
                            style={[
                                styles.statIcon,
                                {
                                    backgroundColor:
                                        "#EAF3FF",
                                },
                            ]}
                        >

                            <Text
                                style={styles.statIconText}
                            >
                                ✓
                            </Text>

                        </View>


                        <Text
                            style={styles.statNumber}
                        >
                            {wallet.total_earnings > 0
                                ? "✓"
                                : "0"}
                        </Text>


                        <Text
                            style={styles.statLabel}
                        >
                            Earnings
                        </Text>

                    </View>

                </View>


                {/* =================================================
                    AVAILABLE DELIVERIES
        ================================================= */}

                <View
                    style={styles.section}
                >

                    <View
                        style={styles.sectionHeader}
                    >

                        <View>

                            <Text
                                style={styles.sectionTitle}
                            >
                                Available Deliveries
                            </Text>


                            <Text
                                style={styles.sectionSubtitle}
                            >
                                Pick a delivery that works for you
                            </Text>

                        </View>


                        <View
                            style={styles.countBadge}
                        >

                            <Text
                                style={styles.countBadgeText}
                            >
                                {orders.length}
                            </Text>

                        </View>

                    </View>


                    {/* =================================================
                        NO ORDERS
          ================================================= */}

                    {orders.length === 0 ? (

                        <View
                            style={styles.emptyCard}
                        >

                            <View
                                style={styles.emptyIcon}
                            >

                                <Text
                                    style={styles.emptyIconText}
                                >
                                    ✓
                                </Text>

                            </View>


                            <Text
                                style={styles.emptyTitle}
                            >
                                No deliveries available
                            </Text>


                            <Text
                                style={styles.emptySubtitle}
                            >
                                New delivery requests will appear
                                here automatically.
                            </Text>


                            <TouchableOpacity
                                style={styles.refreshButton}
                                onPress={onRefresh}
                            >

                                <Text
                                    style={styles.refreshButtonText}
                                >
                                    Refresh
                                </Text>

                            </TouchableOpacity>

                        </View>

                    ) : (

                        orders.map(
                            (order) => (

                                <View
                                    key={order.id}
                                    style={styles.orderCard}
                                >

                                    {/* -------------------------------------
                                ORDER HEADER
                  ------------------------------------- */}

                                    <View
                                        style={styles.orderHeader}
                                    >

                                        <View
                                            style={styles.orderIcon}
                                        >

                                            <Text
                                                style={
                                                    styles.orderIconText
                                                }
                                            >
                                                📦
                                            </Text>

                                        </View>


                                        <View
                                            style={styles.orderHeaderInfo}
                                        >

                                            <Text
                                                style={styles.orderTitle}
                                            >
                                                Delivery #{order.id}
                                            </Text>


                                            <Text
                                                style={styles.orderStatus}
                                            >
                                                Available
                                            </Text>

                                        </View>


                                        <Text
                                            style={styles.orderAmount}
                                        >
                                            {money(
                                                Number(
                                                    order.amount || 0
                                                )
                                            )}
                                        </Text>

                                    </View>


                                    {/* -------------------------------------
                            ROUTE
                  ------------------------------------- */}

                                    <View
                                        style={styles.routeContainer}
                                    >

                                        <View
                                            style={styles.routeLine}
                                        />

                                        <View
                                            style={styles.locationRow}
                                        >

                                            <View
                                                style={styles.pickupDot}
                                            />

                                            <View
                                                style={styles.locationInfo}
                                            >

                                                <Text
                                                    style={
                                                        styles.locationLabel
                                                    }
                                                >
                                                    PICKUP
                                                </Text>


                                                <Text
                                                    style={
                                                        styles.locationText
                                                    }
                                                    numberOfLines={2}
                                                >
                                                    {order.pickup_location ||
                                                        "Location not provided"}
                                                </Text>

                                            </View>

                                        </View>


                                        <View
                                            style={styles.locationRow}
                                        >

                                            <View
                                                style={styles.dropDot}
                                            />

                                            <View
                                                style={styles.locationInfo}
                                            >

                                                <Text
                                                    style={
                                                        styles.locationLabel
                                                    }
                                                >
                                                    DROP
                                                </Text>


                                                <Text
                                                    style={
                                                        styles.locationText
                                                    }
                                                    numberOfLines={2}
                                                >
                                                    {order.drop_location ||
                                                        "Location not provided"}
                                                </Text>

                                            </View>

                                        </View>

                                    </View>


                                    {/* -------------------------------------
                            ORDER DETAILS
                  ------------------------------------- */}

                                    <View
                                        style={styles.orderDetails}
                                    >

                                        <View
                                            style={styles.orderDetail}
                                        >

                                            <Text
                                                style={
                                                    styles.orderDetailLabel
                                                }
                                            >
                                                Distance
                                            </Text>


                                            <Text
                                                style={
                                                    styles.orderDetailValue
                                                }
                                            >
                                                {order.distance ||
                                                    "Not provided"}
                                            </Text>

                                        </View>


                                        <View
                                            style={styles.orderDetail}
                                        >

                                            <Text
                                                style={
                                                    styles.orderDetailLabel
                                                }
                                            >
                                                Payment
                                            </Text>


                                            <Text
                                                style={
                                                    styles.orderDetailValue
                                                }
                                            >
                                                {money(
                                                    Number(
                                                        order.amount || 0
                                                    )
                                                )}
                                            </Text>

                                        </View>

                                    </View>


                                    {/* -------------------------------------
                            ACCEPT
                  ------------------------------------- */}

                                    <TouchableOpacity

                                        style={styles.acceptButton}

                                        disabled={
                                            acceptingOrderId ===
                                            order.id
                                        }

                                        onPress={() =>
                                            acceptOrder(
                                                order.id
                                            )
                                        }

                                        activeOpacity={0.85}
                                    >

                                        {acceptingOrderId ===
                                            order.id ? (

                                            <ActivityIndicator
                                                color="#FFFFFF"
                                                size="small"
                                            />

                                        ) : (

                                            <Text
                                                style={
                                                    styles.acceptButtonText
                                                }
                                            >
                                                Accept Delivery
                                            </Text>

                                        )}

                                    </TouchableOpacity>

                                </View>

                            )
                        )

                    )}

                </View>


                {/* =================================================
                    VEHICLE
        ================================================= */}

                <View
                    style={styles.section}
                >

                    <Text
                        style={styles.sectionTitle}
                    >
                        Your Vehicle
                    </Text>


                    <View
                        style={styles.vehicleCard}
                    >

                        <View
                            style={styles.vehicleIcon}
                        >

                            <Text
                                style={styles.vehicleIconText}
                            >
                                🚗
                            </Text>

                        </View>


                        <View
                            style={styles.vehicleInfo}
                        >

                            <Text
                                style={styles.vehicleType}
                            >
                                {driver?.vehicle_type ||
                                    "Vehicle not provided"}
                            </Text>


                            <Text
                                style={styles.vehicleNumber}
                            >
                                {driver?.vehicle_number ||
                                    "Vehicle number not provided"}
                            </Text>


                            {driver?.city ||
                                driver?.state ? (

                                <Text
                                    style={styles.vehicleLocation}
                                >
                                    {[

                                        driver?.city,

                                        driver?.state,

                                    ]
                                        .filter(Boolean)
                                        .join(", ")}
                                </Text>

                            ) : null}

                        </View>


                        <View
                            style={styles.approvedSmall}
                        >

                            <Text
                                style={
                                    styles.approvedSmallText
                                }
                            >
                                VERIFIED
                            </Text>

                        </View>

                    </View>

                </View>


                {/* =================================================
                    PROFILE
        ================================================= */}

                <View
                    style={styles.profileCard}
                >

                    <View
                        style={styles.profileAvatar}
                    >

                        <Text
                            style={styles.profileAvatarText}
                        >
                            {(driver?.full_name ||
                                "D")
                                .charAt(0)
                                .toUpperCase()}
                        </Text>

                    </View>


                    <View
                        style={styles.profileInfo}
                    >

                        <Text
                            style={styles.profileName}
                        >
                            {driver?.full_name ||
                                "Driver"}
                        </Text>


                        <Text
                            style={styles.profileEmail}
                        >
                            {driver?.email ||
                                "No email"}
                        </Text>


                        <Text
                            style={styles.profilePhone}
                        >
                            {driver?.phone_number ||
                                "No phone number"}
                        </Text>

                    </View>

                </View>


                {/* =================================================
                    FOOTER
        ================================================= */}

                <View
                    style={styles.footer}
                >

                    <Text
                        style={styles.footerTitle}
                    >
                        Saath Groww
                    </Text>


                    <Text
                        style={styles.footerText}
                    >
                        Driver Partner App
                    </Text>

                </View>

            </ScrollView>

        </SafeAreaView>
    );
}


// =========================================================
// STYLES
// =========================================================

const styles =
    StyleSheet.create({

        container: {
            flex: 1,
            backgroundColor: "#F5F7F6",
        },

        loadingContainer: {
            flex: 1,
            backgroundColor: "#F5F7F6",
            justifyContent: "center",
            alignItems: "center",
        },

        loadingLogo: {
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: "#1DAB52",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 20,
        },

        loadingLogoText: {
            color: "#FFFFFF",
            fontSize: 20,
            fontWeight: "900",
        },

        loadingText: {
            marginTop: 14,
            color: "#777",
            fontSize: 14,
        },

        scrollContent: {
            padding: 18,
            paddingBottom: 40,
        },

        // =====================================================
        // HEADER
        // =====================================================

        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
        },

        headerLeft: {
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
        },

        logo: {
            width: 48,
            height: 48,
            borderRadius: 15,
            backgroundColor: "#1DAB52",
            justifyContent: "center",
            alignItems: "center",
        },

        logoText: {
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: "900",
        },

        headerInfo: {
            marginLeft: 11,
            flex: 1,
        },

        smallText: {
            fontSize: 11,
            color: "#8A8A8A",
        },

        driverName: {
            marginTop: 2,
            fontSize: 18,
            fontWeight: "800",
            color: "#222222",
        },

        logoutButton: {
            paddingHorizontal: 13,
            paddingVertical: 9,
            borderRadius: 10,
            backgroundColor: "#FFFFFF",
            borderWidth: 1,
            borderColor: "#E2E5E3",
        },

        logoutText: {
            color: "#D64545",
            fontSize: 12,
            fontWeight: "800",
        },

        // =====================================================
        // VERIFIED
        // =====================================================

        verifiedCard: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#E8F7EE",
            borderRadius: 16,
            padding: 15,
            marginBottom: 16,
        },

        verifiedIcon: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#1DAB52",
            justifyContent: "center",
            alignItems: "center",
        },

        verifiedIconText: {
            color: "#FFFFFF",
            fontSize: 20,
            fontWeight: "900",
        },

        verifiedInfo: {
            flex: 1,
            marginLeft: 12,
        },

        verifiedTitle: {
            color: "#137A3B",
            fontSize: 14,
            fontWeight: "800",
        },

        verifiedSubtitle: {
            marginTop: 3,
            color: "#4F8063",
            fontSize: 11,
            lineHeight: 16,
        },

        // =====================================================
        // EARNINGS
        // =====================================================

        earningsCard: {
            backgroundColor: "#1DAB52",
            borderRadius: 22,
            padding: 20,
            marginBottom: 16,
        },

        earningsHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },

        earningsLabel: {
            color: "#CFF4DC",
            fontSize: 10,
            fontWeight: "800",
            letterSpacing: 0.8,
        },

        balance: {
            marginTop: 6,
            color: "#FFFFFF",
            fontSize: 34,
            fontWeight: "900",
        },

        walletIcon: {
            width: 48,
            height: 48,
            borderRadius: 15,
            backgroundColor: "rgba(255,255,255,0.18)",
            justifyContent: "center",
            alignItems: "center",
        },

        walletIconText: {
            color: "#FFFFFF",
            fontSize: 24,
            fontWeight: "900",
        },

        earningsDivider: {
            height: 1,
            backgroundColor: "rgba(255,255,255,0.2)",
            marginVertical: 18,
        },

        earningsBottom: {
            flexDirection: "row",
            justifyContent: "space-between",
        },

        earningsBottomRight: {
            alignItems: "flex-end",
        },

        earningsSmallLabel: {
            color: "#CFF4DC",
            fontSize: 10,
        },

        earningsValue: {
            marginTop: 3,
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: "800",
        },

        pendingValue: {
            marginTop: 3,
            color: "#FFF4C7",
            fontSize: 16,
            fontWeight: "800",
        },

        // =====================================================
        // STATS
        // =====================================================

        statsRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 24,
        },

        statCard: {
            width: "31.5%",
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: 12,
            alignItems: "center",
            elevation: 2,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 6,
            shadowOffset: {
                width: 0,
                height: 2,
            },
        },

        statIcon: {
            width: 36,
            height: 36,
            borderRadius: 18,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 7,
        },

        statIconText: {
            fontSize: 16,
        },

        statNumber: {
            fontSize: 18,
            fontWeight: "900",
            color: "#222",
        },

        statLabel: {
            marginTop: 3,
            color: "#888",
            fontSize: 9,
            fontWeight: "600",
        },

        // =====================================================
        // SECTION
        // =====================================================

        section: {
            marginBottom: 24,
        },

        sectionHeader: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 13,
        },

        sectionTitle: {
            color: "#222",
            fontSize: 18,
            fontWeight: "900",
        },

        sectionSubtitle: {
            marginTop: 4,
            color: "#888",
            fontSize: 11,
        },

        countBadge: {
            minWidth: 32,
            height: 32,
            paddingHorizontal: 9,
            borderRadius: 16,
            backgroundColor: "#E8F7EE",
            justifyContent: "center",
            alignItems: "center",
        },

        countBadgeText: {
            color: "#1DAB52",
            fontSize: 12,
            fontWeight: "900",
        },

        // =====================================================
        // EMPTY
        // =====================================================

        emptyCard: {
            backgroundColor: "#FFFFFF",
            borderRadius: 18,
            padding: 28,
            alignItems: "center",
        },

        emptyIcon: {
            width: 58,
            height: 58,
            borderRadius: 29,
            backgroundColor: "#E8F7EE",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 12,
        },

        emptyIconText: {
            color: "#1DAB52",
            fontSize: 25,
            fontWeight: "900",
        },

        emptyTitle: {
            color: "#333",
            fontSize: 15,
            fontWeight: "800",
        },

        emptySubtitle: {
            marginTop: 6,
            color: "#888",
            fontSize: 11,
            textAlign: "center",
            lineHeight: 17,
        },

        refreshButton: {
            marginTop: 15,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 10,
            backgroundColor: "#1DAB52",
        },

        refreshButtonText: {
            color: "#FFFFFF",
            fontSize: 12,
            fontWeight: "800",
        },

        // =====================================================
        // ORDER
        // =====================================================

        orderCard: {
            backgroundColor: "#FFFFFF",
            borderRadius: 18,
            padding: 16,
            marginBottom: 13,
            elevation: 2,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 7,
            shadowOffset: {
                width: 0,
                height: 2,
            },
        },

        orderHeader: {
            flexDirection: "row",
            alignItems: "center",
        },

        orderIcon: {
            width: 42,
            height: 42,
            borderRadius: 13,
            backgroundColor: "#E8F7EE",
            justifyContent: "center",
            alignItems: "center",
        },

        orderIconText: {
            fontSize: 19,
        },

        orderHeaderInfo: {
            flex: 1,
            marginLeft: 10,
        },

        orderTitle: {
            color: "#222",
            fontSize: 14,
            fontWeight: "800",
        },

        orderStatus: {
            marginTop: 3,
            color: "#1DAB52",
            fontSize: 10,
            fontWeight: "700",
        },

        orderAmount: {
            color: "#1DAB52",
            fontSize: 17,
            fontWeight: "900",
        },

        routeContainer: {
            marginTop: 15,
            paddingLeft: 3,
        },

        routeLine: {
            position: "absolute",
            left: 10,
            top: 13,
            bottom: 13,
            width: 2,
            backgroundColor: "#DDE8E1",
        },

        locationRow: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 13,
        },

        pickupDot: {
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: "#1DAB52",
            borderWidth: 4,
            borderColor: "#DFF5E8",
        },

        dropDot: {
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: "#D64545",
            borderWidth: 4,
            borderColor: "#FCE7E7",
        },

        locationInfo: {
            flex: 1,
            marginLeft: 10,
        },

        locationLabel: {
            color: "#999",
            fontSize: 8,
            fontWeight: "800",
        },

        locationText: {
            marginTop: 2,
            color: "#333",
            fontSize: 12,
            fontWeight: "600",
        },

        orderDetails: {
            flexDirection: "row",
            borderTopWidth: 1,
            borderTopColor: "#EEEEEE",
            paddingTop: 12,
            marginTop: 2,
            marginBottom: 14,
        },

        orderDetail: {
            flex: 1,
        },

        orderDetailLabel: {
            color: "#999",
            fontSize: 9,
        },

        orderDetailValue: {
            marginTop: 3,
            color: "#333",
            fontSize: 12,
            fontWeight: "700",
        },

        acceptButton: {
            height: 44,
            borderRadius: 11,
            backgroundColor: "#1DAB52",
            justifyContent: "center",
            alignItems: "center",
        },

        acceptButtonText: {
            color: "#FFFFFF",
            fontSize: 13,
            fontWeight: "800",
        },

        // =====================================================
        // VEHICLE
        // =====================================================

        vehicleCard: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: 15,
            marginTop: 12,
        },

        vehicleIcon: {
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: "#F1F4F2",
            justifyContent: "center",
            alignItems: "center",
        },

        vehicleIconText: {
            fontSize: 22,
        },

        vehicleInfo: {
            flex: 1,
            marginLeft: 11,
        },

        vehicleType: {
            color: "#333",
            fontSize: 14,
            fontWeight: "800",
        },

        vehicleNumber: {
            marginTop: 3,
            color: "#666",
            fontSize: 11,
            fontWeight: "600",
        },

        vehicleLocation: {
            marginTop: 3,
            color: "#999",
            fontSize: 10,
        },

        approvedSmall: {
            paddingHorizontal: 7,
            paddingVertical: 5,
            borderRadius: 7,
            backgroundColor: "#E8F7EE",
        },

        approvedSmallText: {
            color: "#1DAB52",
            fontSize: 8,
            fontWeight: "900",
        },

        // =====================================================
        // PROFILE
        // =====================================================

        profileCard: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#FFFFFF",
            borderRadius: 17,
            padding: 15,
            marginBottom: 22,
        },

        profileAvatar: {
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: "#1DAB52",
            justifyContent: "center",
            alignItems: "center",
        },

        profileAvatarText: {
            color: "#FFFFFF",
            fontSize: 19,
            fontWeight: "900",
        },

        profileInfo: {
            flex: 1,
            marginLeft: 12,
        },

        profileName: {
            color: "#222",
            fontSize: 14,
            fontWeight: "800",
        },

        profileEmail: {
            marginTop: 3,
            color: "#777",
            fontSize: 10,
        },

        profilePhone: {
            marginTop: 2,
            color: "#777",
            fontSize: 10,
        },

        // =====================================================
        // FOOTER
        // =====================================================

        footer: {
            alignItems: "center",
            paddingVertical: 10,
        },

        footerTitle: {
            color: "#777",
            fontSize: 12,
            fontWeight: "800",
        },

        footerText: {
            marginTop: 3,
            color: "#AAAAAA",
            fontSize: 10,
        },

    });