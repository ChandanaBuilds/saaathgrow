import React, {
    useCallback,
    useState,
} from "react";

import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
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

interface WalletData {

    balance:
    number;

    total_earnings:
    number;

    pending_amount:
    number;
}


// =========================================================
// SCREEN
// =========================================================

export default function WalletScreen() {

    const route =
        useRoute<any>();


    // =====================================================
    // USER
    // =====================================================

    const user =
        route.params?.user;

    const userId =
        user?.id;


    // =====================================================
    // STATE
    // =====================================================

    const [wallet, setWallet] =
        useState<WalletData>({
            balance: 0,
            total_earnings: 0,
            pending_amount: 0,
        });

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");


    // =====================================================
    // FETCH WALLET
    // =====================================================

    const fetchWallet = async (
        showLoader = true
    ) => {

        if (!userId) {

            setError(
                "Driver information is missing. Please login again."
            );

            setLoading(false);

            return;
        }


        try {

            if (showLoader) {
                setLoading(true);
            }

            setError("");


            console.log(
                "================================"
            );

            console.log(
                "FETCHING DRIVER WALLET"
            );

            console.log(
                "USER ID:",
                userId
            );

            console.log(
                "API:",
                `${API_URL}/wallet/${userId}`
            );

            console.log(
                "================================"
            );


            const response =
                await axios.get<WalletData>(

                    `${API_URL}/wallet/${userId}`,

                    {
                        timeout: 30000,
                    }

                );


            console.log(
                "WALLET RESPONSE:",
                response.data
            );


            setWallet({

                balance:
                    Number(
                        response.data?.balance
                    ) || 0,

                total_earnings:
                    Number(
                        response.data?.total_earnings
                    ) || 0,

                pending_amount:
                    Number(
                        response.data?.pending_amount
                    ) || 0,

            });


        } catch (error: any) {

            console.log(
                "FETCH WALLET ERROR:",
                error.response?.data ||
                error.message
            );


            setError(

                error.response?.data?.detail ||

                "Unable to load wallet information."

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

            fetchWallet();

        }, [userId])

    );


    // =====================================================
    // REFRESH
    // =====================================================

    const handleRefresh = () => {

        setRefreshing(true);

        fetchWallet(false);

    };


    // =====================================================
    // FORMAT MONEY
    // =====================================================

    const formatMoney = (
        value: number
    ) => {

        return `₹${value.toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2,
            }
        )}`;

    };


    // =====================================================
    // LOADING SCREEN
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
                    Loading your wallet...
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


            <ScrollView

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

                contentContainerStyle={
                    styles.scrollContent
                }

            >

                {/* =========================================
                                HEADER
                ========================================= */}

                <View style={styles.header}>

                    <View>

                        <Text style={styles.headerOverline}>
                            DRIVER WALLET
                        </Text>

                        <Text style={styles.headerTitle}>
                            My Earnings
                        </Text>

                        <Text style={styles.headerSubtitle}>
                            Manage your delivery earnings
                        </Text>

                    </View>


                    <View style={styles.walletIcon}>

                        <Text style={styles.walletIconText}>
                            ₹
                        </Text>

                    </View>

                </View>


                {/* =========================================
                            ERROR MESSAGE
                ========================================= */}

                {error ? (

                    <View style={styles.errorCard}>

                        <View style={styles.errorIcon}>

                            <Text style={styles.errorIconText}>
                                !
                            </Text>

                        </View>


                        <View style={styles.errorContent}>

                            <Text style={styles.errorTitle}>
                                Unable to load wallet
                            </Text>

                            <Text style={styles.errorText}>
                                {error}
                            </Text>

                        </View>


                        <TouchableOpacity
                            onPress={() =>
                                fetchWallet()
                            }
                        >

                            <Text style={styles.retryText}>
                                Retry
                            </Text>

                        </TouchableOpacity>

                    </View>

                ) : null}


                {/* =========================================
                            BALANCE CARD
                ========================================= */}

                <View style={styles.balanceCard}>

                    <View style={styles.balanceTopRow}>

                        <View>

                            <Text style={styles.balanceLabel}>
                                AVAILABLE BALANCE
                            </Text>

                            <Text style={styles.balanceAmount}>
                                {formatMoney(
                                    wallet.balance
                                )}
                            </Text>

                        </View>


                        <View style={styles.balanceIcon}>

                            <Text style={styles.balanceIconText}>
                                ₹
                            </Text>

                        </View>

                    </View>


                    <View style={styles.balanceDivider} />


                    <View style={styles.balanceBottomRow}>

                        <View>

                            <Text style={styles.balanceBottomLabel}>
                                Ready to use
                            </Text>

                            <Text style={styles.balanceBottomText}>
                                Your current wallet balance
                            </Text>

                        </View>


                        <View style={styles.activeBadge}>

                            <View
                                style={styles.activeDot}
                            />

                            <Text style={styles.activeText}>
                                Active
                            </Text>

                        </View>

                    </View>

                </View>


                {/* =========================================
                            EARNINGS SUMMARY
                ========================================= */}

                <Text style={styles.sectionTitle}>
                    Earnings Summary
                </Text>


                <View style={styles.statsGrid}>

                    {/* TOTAL EARNINGS */}

                    <View style={styles.statCard}>

                        <View style={[
                            styles.statIcon,
                            styles.greenIcon,
                        ]}>

                            <Text style={styles.greenIconText}>
                                ₹
                            </Text>

                        </View>


                        <Text style={styles.statLabel}>
                            TOTAL EARNINGS
                        </Text>


                        <Text style={styles.statValue}>
                            {formatMoney(
                                wallet.total_earnings
                            )}
                        </Text>


                        <Text style={styles.statDescription}>
                            Lifetime earnings
                        </Text>

                    </View>


                    {/* PENDING */}

                    <View style={styles.statCard}>

                        <View style={[
                            styles.statIcon,
                            styles.yellowIcon,
                        ]}>

                            <Text style={styles.yellowIconText}>
                                ◷
                            </Text>

                        </View>


                        <Text style={styles.statLabel}>
                            PENDING
                        </Text>


                        <Text style={[
                            styles.statValue,
                            styles.pendingValue,
                        ]}>

                            {formatMoney(
                                wallet.pending_amount
                            )}

                        </Text>


                        <Text style={styles.statDescription}>
                            Processing amount
                        </Text>

                    </View>

                </View>


                {/* =========================================
                        WALLET INFORMATION
                ========================================= */}

                <Text style={styles.sectionTitle}>
                    Wallet Information
                </Text>


                <View style={styles.infoCard}>

                    {/* Available Balance */}

                    <View style={styles.infoRow}>

                        <View style={styles.infoLeft}>

                            <View style={[
                                styles.infoIcon,
                                styles.greenInfoIcon,
                            ]}>

                                <Text style={styles.infoIconText}>
                                    ₹
                                </Text>

                            </View>


                            <View>

                                <Text style={styles.infoTitle}>
                                    Available Balance
                                </Text>

                                <Text style={styles.infoSubtitle}>
                                    Current usable balance
                                </Text>

                            </View>

                        </View>


                        <Text style={styles.infoAmount}>
                            {formatMoney(
                                wallet.balance
                            )}
                        </Text>

                    </View>


                    <View style={styles.infoDivider} />


                    {/* Total Earnings */}

                    <View style={styles.infoRow}>

                        <View style={styles.infoLeft}>

                            <View style={[
                                styles.infoIcon,
                                styles.blueInfoIcon,
                            ]}>

                                <Text style={styles.infoIconText}>
                                    ↗
                                </Text>

                            </View>


                            <View>

                                <Text style={styles.infoTitle}>
                                    Total Earnings
                                </Text>

                                <Text style={styles.infoSubtitle}>
                                    All-time delivery earnings
                                </Text>

                            </View>

                        </View>


                        <Text style={styles.infoAmount}>
                            {formatMoney(
                                wallet.total_earnings
                            )}
                        </Text>

                    </View>


                    <View style={styles.infoDivider} />


                    {/* Pending */}

                    <View style={styles.infoRow}>

                        <View style={styles.infoLeft}>

                            <View style={[
                                styles.infoIcon,
                                styles.yellowInfoIcon,
                            ]}>

                                <Text style={styles.infoIconText}>
                                    ◷
                                </Text>

                            </View>


                            <View>

                                <Text style={styles.infoTitle}>
                                    Pending Amount
                                </Text>

                                <Text style={styles.infoSubtitle}>
                                    Amount currently processing
                                </Text>

                            </View>

                        </View>


                        <Text style={[
                            styles.infoAmount,
                            styles.pendingAmount,
                        ]}>

                            {formatMoney(
                                wallet.pending_amount
                            )}

                        </Text>

                    </View>

                </View>


                {/* =========================================
                            WITHDRAWAL
                ========================================= */}

                <View style={styles.withdrawCard}>

                    <View style={styles.withdrawIcon}>

                        <Text style={styles.withdrawIconText}>
                            ↑
                        </Text>

                    </View>


                    <View style={styles.withdrawContent}>

                        <Text style={styles.withdrawTitle}>
                            Withdraw your earnings
                        </Text>

                        <Text style={styles.withdrawSubtitle}>
                            Transfer your available balance
                            to your registered bank account.
                        </Text>

                    </View>


                    <TouchableOpacity

                        style={[
                            styles.withdrawButton,

                            wallet.balance <= 0 &&
                            styles.withdrawButtonDisabled,
                        ]}

                        disabled={
                            wallet.balance <= 0
                        }

                        onPress={() => {

                            // Withdrawal API can be
                            // connected here later.

                        }}

                    >

                        <Text style={[
                            styles.withdrawText,

                            wallet.balance <= 0 &&
                            styles.withdrawTextDisabled,
                        ]}>

                            Withdraw

                        </Text>

                    </TouchableOpacity>

                </View>


                {/* =========================================
                            SECURITY NOTE
                ========================================= */}

                <View style={styles.securityCard}>

                    <View style={styles.securityIcon}>

                        <Text style={styles.securityIconText}>
                            ✓
                        </Text>

                    </View>


                    <View style={styles.securityContent}>

                        <Text style={styles.securityTitle}>
                            Your earnings are secure
                        </Text>

                        <Text style={styles.securityText}>
                            Wallet information is loaded
                            directly from your account.
                        </Text>

                    </View>

                </View>


                <View style={styles.bottomSpace} />

            </ScrollView>

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


        scrollContent: {

            paddingHorizontal: 16,

            paddingTop: 18,

        },


        // =================================================
        // HEADER
        // =================================================

        header: {

            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "space-between",

            marginBottom: 20,

        },


        headerOverline: {

            fontSize: 10,

            fontWeight: "800",

            color:
                "#1DAB52",

            letterSpacing: 1.5,

            marginBottom: 4,

        },


        headerTitle: {

            fontSize: 28,

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


        walletIcon: {

            width: 50,

            height: 50,

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


        walletIconText: {

            fontSize: 22,

            fontWeight: "800",

            color:
                "#1DAB52",

        },


        // =================================================
        // ERROR
        // =================================================

        errorCard: {

            flexDirection:
                "row",

            alignItems:
                "center",

            backgroundColor:
                "#FFF3F3",

            borderWidth: 1,

            borderColor:
                "#F1CCCC",

            borderRadius: 14,

            padding: 13,

            marginBottom: 16,

        },


        errorIcon: {

            width: 34,

            height: 34,

            borderRadius: 17,

            backgroundColor:
                "#FDE1E1",

            justifyContent:
                "center",

            alignItems:
                "center",

            marginRight: 10,

        },


        errorIconText: {

            color:
                "#D32F2F",

            fontSize: 18,

            fontWeight:
                "800",

        },


        errorContent: {

            flex: 1,

        },


        errorTitle: {

            fontSize: 13,

            fontWeight:
                "800",

            color:
                "#A52222",

        },


        errorText: {

            fontSize: 11,

            color:
                "#9B5B5B",

            marginTop: 2,

        },


        retryText: {

            fontSize: 12,

            fontWeight:
                "800",

            color:
                "#1DAB52",

        },


        // =================================================
        // BALANCE CARD
        // =================================================

        balanceCard: {

            backgroundColor:
                "#1DAB52",

            borderRadius: 22,

            padding: 22,

            marginBottom: 24,

            shadowColor:
                "#1DAB52",

            shadowOpacity:
                0.18,

            shadowRadius:
                12,

            shadowOffset: {

                width: 0,

                height: 6,

            },

            elevation: 5,

        },


        balanceTopRow: {

            flexDirection:
                "row",

            justifyContent:
                "space-between",

            alignItems:
                "flex-start",

        },


        balanceLabel: {

            fontSize: 10,

            fontWeight:
                "800",

            color:
                "#FFFFFF",

            opacity:
                0.75,

            letterSpacing: 1.2,

        },


        balanceAmount: {

            fontSize: 36,

            fontWeight:
                "900",

            color:
                "#FFFFFF",

            marginTop: 7,

        },


        balanceIcon: {

            width: 45,

            height: 45,

            borderRadius: 14,

            backgroundColor:
                "rgba(255,255,255,0.16)",

            justifyContent:
                "center",

            alignItems:
                "center",

        },


        balanceIconText: {

            color:
                "#FFFFFF",

            fontSize: 21,

            fontWeight:
                "800",

        },


        balanceDivider: {

            height: 1,

            backgroundColor:
                "rgba(255,255,255,0.20)",

            marginVertical: 18,

        },


        balanceBottomRow: {

            flexDirection:
                "row",

            justifyContent:
                "space-between",

            alignItems:
                "center",

        },


        balanceBottomLabel: {

            color:
                "#FFFFFF",

            fontSize: 12,

            fontWeight:
                "700",

        },


        balanceBottomText: {

            color:
                "#FFFFFF",

            opacity:
                0.65,

            fontSize: 10,

            marginTop: 3,

        },


        activeBadge: {

            flexDirection:
                "row",

            alignItems:
                "center",

            backgroundColor:
                "rgba(255,255,255,0.14)",

            paddingHorizontal: 10,

            paddingVertical: 6,

            borderRadius: 20,

        },


        activeDot: {

            width: 7,

            height: 7,

            borderRadius: 4,

            backgroundColor:
                "#FFFFFF",

            marginRight: 6,

        },


        activeText: {

            color:
                "#FFFFFF",

            fontSize: 10,

            fontWeight:
                "800",

        },


        // =================================================
        // SECTION
        // =================================================

        sectionTitle: {

            fontSize: 19,

            fontWeight:
                "800",

            color:
                "#17231C",

            marginBottom: 13,

        },


        // =================================================
        // STATS
        // =================================================

        statsGrid: {

            flexDirection:
                "row",

            justifyContent:
                "space-between",

            marginBottom: 25,

        },


        statCard: {

            width:
                "48.5%",

            backgroundColor:
                "#FFFFFF",

            borderRadius: 17,

            padding: 16,

            borderWidth: 1,

            borderColor:
                "#E5ECE7",

            shadowColor:
                "#000",

            shadowOpacity:
                0.035,

            shadowRadius:
                7,

            shadowOffset: {

                width: 0,

                height: 3,

            },

            elevation: 2,

        },


        statIcon: {

            width: 34,

            height: 34,

            borderRadius: 10,

            justifyContent:
                "center",

            alignItems:
                "center",

            marginBottom: 12,

        },


        greenIcon: {

            backgroundColor:
                "#E8F7EE",

        },


        yellowIcon: {

            backgroundColor:
                "#FFF5DC",

        },


        greenIconText: {

            color:
                "#1DAB52",

            fontSize: 17,

            fontWeight:
                "800",

        },


        yellowIconText: {

            color:
                "#D79A14",

            fontSize: 18,

            fontWeight:
                "800",

        },


        statLabel: {

            fontSize: 9,

            fontWeight:
                "800",

            color:
                "#89948D",

            letterSpacing: 0.8,

        },


        statValue: {

            fontSize: 21,

            fontWeight:
                "900",

            color:
                "#1DAB52",

            marginTop: 5,

        },


        pendingValue: {

            color:
                "#D99A16",

        },


        statDescription: {

            fontSize: 10,

            color:
                "#9AA39E",

            marginTop: 4,

        },


        // =================================================
        // INFORMATION CARD
        // =================================================

        infoCard: {

            backgroundColor:
                "#FFFFFF",

            borderRadius: 18,

            paddingHorizontal: 16,

            borderWidth: 1,

            borderColor:
                "#E5ECE7",

            marginBottom: 20,

        },


        infoRow: {

            minHeight: 76,

            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "space-between",

        },


        infoLeft: {

            flexDirection:
                "row",

            alignItems:
                "center",

            flex: 1,

        },


        infoIcon: {

            width: 38,

            height: 38,

            borderRadius: 11,

            justifyContent:
                "center",

            alignItems:
                "center",

            marginRight: 11,

        },


        greenInfoIcon: {

            backgroundColor:
                "#E8F7EE",

        },


        blueInfoIcon: {

            backgroundColor:
                "#E9F5F8",

        },


        yellowInfoIcon: {

            backgroundColor:
                "#FFF5DC",

        },


        infoIconText: {

            fontSize: 17,

            fontWeight:
                "800",

            color:
                "#1DAB52",

        },


        infoTitle: {

            fontSize: 13,

            fontWeight:
                "700",

            color:
                "#27332C",

        },


        infoSubtitle: {

            fontSize: 10,

            color:
                "#8B958F",

            marginTop: 3,

        },


        infoAmount: {

            fontSize: 14,

            fontWeight:
                "800",

            color:
                "#1DAB52",

            marginLeft: 8,

        },


        pendingAmount: {

            color:
                "#D99A16",

        },


        infoDivider: {

            height: 1,

            backgroundColor:
                "#EEF2EF",

        },


        // =================================================
        // WITHDRAW
        // =================================================

        withdrawCard: {

            backgroundColor:
                "#FFFFFF",

            borderRadius: 18,

            padding: 16,

            flexDirection:
                "row",

            alignItems:
                "center",

            borderWidth: 1,

            borderColor:
                "#E5ECE7",

            marginBottom: 16,

        },


        withdrawIcon: {

            width: 42,

            height: 42,

            borderRadius: 13,

            backgroundColor:
                "#FFF5DC",

            justifyContent:
                "center",

            alignItems:
                "center",

            marginRight: 11,

        },


        withdrawIconText: {

            color:
                "#D99A16",

            fontSize: 21,

            fontWeight:
                "800",

        },


        withdrawContent: {

            flex: 1,

        },


        withdrawTitle: {

            fontSize: 13,

            fontWeight:
                "800",

            color:
                "#27332C",

        },


        withdrawSubtitle: {

            fontSize: 10,

            lineHeight: 15,

            color:
                "#89948D",

            marginTop: 3,

        },


        withdrawButton: {

            backgroundColor:
                "#EDB131",

            paddingHorizontal: 13,

            paddingVertical: 10,

            borderRadius: 11,

            marginLeft: 8,

        },


        withdrawButtonDisabled: {

            backgroundColor:
                "#E3E6E4",

        },


        withdrawText: {

            fontSize: 11,

            fontWeight:
                "800",

            color:
                "#1B1B1B",

        },


        withdrawTextDisabled: {

            color:
                "#929895",

        },


        // =================================================
        // SECURITY
        // =================================================

        securityCard: {

            backgroundColor:
                "#EAF8EF",

            borderRadius: 15,

            padding: 14,

            flexDirection:
                "row",

            alignItems:
                "center",

            borderWidth: 1,

            borderColor:
                "#D1EEDB",

        },


        securityIcon: {

            width: 34,

            height: 34,

            borderRadius: 17,

            backgroundColor:
                "#1DAB52",

            justifyContent:
                "center",

            alignItems:
                "center",

            marginRight: 10,

        },


        securityIconText: {

            color:
                "#FFFFFF",

            fontSize: 16,

            fontWeight:
                "800",

        },


        securityContent: {

            flex: 1,

        },


        securityTitle: {

            fontSize: 12,

            fontWeight:
                "800",

            color:
                "#176C3B",

        },


        securityText: {

            fontSize: 10,

            color:
                "#5E7D69",

            marginTop: 3,

            lineHeight: 15,

        },


        // =================================================
        // BOTTOM
        // =================================================

        bottomSpace: {

            height: 35,

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

            fontWeight:
                "600",

            color:
                "#68756E",

        },

    });