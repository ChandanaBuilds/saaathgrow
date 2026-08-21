import React, {
    useCallback,
    useEffect,
    useState,
} from "react";

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


// =========================================================
// API
// =========================================================

const API_URL =
    "https://saaathgroww.onrender.com";


// =========================================================
// TYPES
// =========================================================

interface AdminUser {

    id?: number;

    full_name?: string;

    email?: string;

    phone_number?: string;

    city?: string | null;

    state?: string | null;

    vehicle_type?: string | null;

    vehicle_number?: string | null;

    status?: string;

    is_approved?: boolean;

    email_verified?: boolean;
}


interface AdminMe {

    email?: string;

    role?: string;
}


interface ApiResponse {

    success?: boolean;

    message?: string;

    detail?: string;

    admin?: AdminMe;

    user?: AdminMe;

    users?: AdminUser[];

    drivers?: AdminUser[];

    data?: AdminUser[];

}


// =========================================================
// COMPONENT
// =========================================================

export default function AdminDashboardScreen({

    navigation,

    route,

}: any) {


    // =====================================================
    // TOKEN
    // =====================================================

    const token =
        route?.params?.access_token;


    // =====================================================
    // STATE
    // =====================================================

    const [admin, setAdmin] =
        useState<AdminMe | null>(null);

    const [users, setUsers] =
        useState<AdminUser[]>([]);

    const [pendingDrivers, setPendingDrivers] =
        useState<AdminUser[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [actionLoading, setActionLoading] =
        useState<number | null>(null);


    // =====================================================
    // AUTH HEADERS
    // =====================================================

    const getAuthHeaders = () => {

        return {

            Accept:
                "application/json",

            Authorization:
                `Bearer ${token}`,

        };

    };


    // =====================================================
    // RESPONSE PARSER
    // =====================================================

    const parseResponse =
        async (
            response: Response
        ): Promise<ApiResponse> => {

            const text =
                await response.text();

            if (!text) {

                return {};
            }

            try {

                return JSON.parse(text);

            } catch {

                return {
                    message: text,
                };
            }
        };


    // =====================================================
    // HANDLE AUTH ERROR
    // =====================================================

    const handleUnauthorized =
        (status: number) => {

            if (status === 401) {

                Alert.alert(
                    "Session Expired",
                    "Your admin session has expired. Please login again.",
                    [
                        {
                            text: "OK",

                            onPress: () => {

                                navigation.replace(
                                    "AdminLogin"
                                );

                            },
                        },
                    ]
                );

                return true;
            }

            return false;
        };


    // =====================================================
    // LOAD ADMIN PROFILE
    // =====================================================

    const loadAdminProfile =
        async () => {

            console.log(
                "ADMIN PROFILE REQUEST"
            );

            console.log(
                "URL:",
                `${API_URL}/admin/me`
            );


            const response =
                await fetch(

                    `${API_URL}/admin/me`,

                    {

                        method: "GET",

                        headers:
                            getAuthHeaders(),

                    }

                );


            console.log(
                "ADMIN PROFILE STATUS:",
                response.status
            );


            const data =
                await parseResponse(
                    response
                );


            console.log(
                "ADMIN PROFILE RESPONSE:",
                data
            );


            if (
                handleUnauthorized(
                    response.status
                )
            ) {

                throw new Error(
                    "Admin session expired."
                );
            }


            if (!response.ok) {

                throw new Error(

                    data?.detail ||

                    data?.message ||

                    `Admin profile request failed: ${response.status}`

                );

            }


            if (data?.admin) {

                setAdmin(
                    data.admin
                );

            } else if (data?.user) {

                setAdmin(
                    data.user
                );

            } else {

                setAdmin(
                    data as AdminMe
                );

            }

        };


    // =====================================================
    // LOAD ALL USERS
    // =====================================================

    const loadUsers =
        async () => {

            console.log(
                "USERS REQUEST"
            );

            console.log(
                "URL:",
                `${API_URL}/admin/all-users`
            );


            const response =
                await fetch(

                    `${API_URL}/admin/all-users`,

                    {

                        method: "GET",

                        headers:
                            getAuthHeaders(),

                    }

                );


            console.log(
                "USERS STATUS:",
                response.status
            );


            const data =
                await parseResponse(
                    response
                );


            console.log(
                "USERS RESPONSE:",
                data
            );


            if (
                handleUnauthorized(
                    response.status
                )
            ) {

                throw new Error(
                    "Admin session expired."
                );
            }


            if (!response.ok) {

                throw new Error(

                    data?.detail ||

                    data?.message ||

                    `Users request failed: ${response.status}`

                );

            }


            if (
                Array.isArray(data)
            ) {

                setUsers(
                    data as AdminUser[]
                );

            } else if (
                Array.isArray(data?.users)
            ) {

                setUsers(
                    data.users
                );

            } else if (
                Array.isArray(data?.data)
            ) {

                setUsers(
                    data.data
                );

            } else {

                setUsers([]);
            }

        };


    // =====================================================
    // LOAD PENDING DRIVERS
    // =====================================================

    const loadPendingDrivers =
        async () => {

            console.log(
                "PENDING DRIVERS REQUEST"
            );

            console.log(
                "URL:",
                `${API_URL}/admin/pending-drivers`
            );


            const response =
                await fetch(

                    `${API_URL}/admin/pending-drivers`,

                    {

                        method: "GET",

                        headers:
                            getAuthHeaders(),

                    }

                );


            console.log(
                "PENDING DRIVERS STATUS:",
                response.status
            );


            const data =
                await parseResponse(
                    response
                );


            console.log(
                "PENDING DRIVERS RESPONSE:",
                data
            );


            if (
                handleUnauthorized(
                    response.status
                )
            ) {

                throw new Error(
                    "Admin session expired."
                );
            }


            if (!response.ok) {

                throw new Error(

                    data?.detail ||

                    data?.message ||

                    `Pending drivers request failed: ${response.status}`

                );

            }


            if (
                Array.isArray(data)
            ) {

                setPendingDrivers(
                    data as AdminUser[]
                );

            } else if (
                Array.isArray(data?.users)
            ) {

                setPendingDrivers(
                    data.users
                );

            } else if (
                Array.isArray(data?.drivers)
            ) {

                setPendingDrivers(
                    data.drivers
                );

            } else if (
                Array.isArray(data?.data)
            ) {

                setPendingDrivers(
                    data.data
                );

            } else {

                setPendingDrivers([]);
            }

        };


    // =====================================================
    // LOAD DASHBOARD
    // =====================================================

    const loadDashboard =
        useCallback(
            async () => {

                if (!token) {

                    Alert.alert(
                        "Authentication Error",
                        "Admin login token is missing.",
                        [
                            {
                                text: "OK",

                                onPress: () => {

                                    navigation.replace(
                                        "AdminLogin"
                                    );

                                },
                            },
                        ]
                    );

                    return;
                }


                try {

                    setLoading(true);


                    await Promise.all([

                        loadAdminProfile(),

                        loadUsers(),

                        loadPendingDrivers(),

                    ]);


                    console.log(
                        "ADMIN DASHBOARD LOADED"
                    );


                } catch (error: any) {

                    console.log(
                        "ADMIN DASHBOARD ERROR:",
                        error
                    );


                    if (
                        error?.message ===
                        "Admin session expired."
                    ) {

                        return;
                    }


                    Alert.alert(

                        "Dashboard Error",

                        error?.message ||

                        "Unable to load admin dashboard."

                    );

                } finally {

                    setLoading(false);

                }

            },

            [token]

        );


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadDashboard();

    }, [loadDashboard]);


    // =====================================================
    // REFRESH
    // =====================================================

    const handleRefresh =
        async () => {

            try {

                setRefreshing(true);


                await Promise.all([

                    loadAdminProfile(),

                    loadUsers(),

                    loadPendingDrivers(),

                ]);

            } catch (error: any) {

                console.log(
                    "REFRESH ERROR:",
                    error
                );


                Alert.alert(

                    "Refresh Failed",

                    error?.message ||

                    "Unable to refresh dashboard."

                );

            } finally {

                setRefreshing(false);

            }

        };


    // =====================================================
    // APPROVE DRIVER
    // =====================================================

    const approveDriver =
        async (
            userId: number
        ) => {

            try {

                setActionLoading(
                    userId
                );


                const response =
                    await fetch(

                        `${API_URL}/admin/approve-driver/${userId}`,

                        {

                            method: "POST",

                            headers:
                                getAuthHeaders(),

                        }

                    );


                const data =
                    await parseResponse(
                        response
                    );


                console.log(
                    "APPROVE DRIVER:",
                    data
                );


                if (!response.ok) {

                    throw new Error(

                        data?.detail ||

                        data?.message ||

                        "Unable to approve driver."

                    );

                }


                Alert.alert(

                    "Success",

                    data?.message ||

                    "Driver approved successfully."

                );


                await Promise.all([

                    loadPendingDrivers(),

                    loadUsers(),

                ]);


            } catch (error: any) {

                console.log(
                    "APPROVE DRIVER ERROR:",
                    error
                );


                Alert.alert(

                    "Approval Failed",

                    error?.message ||

                    "Unable to approve driver."

                );

            } finally {

                setActionLoading(
                    null
                );

            }

        };


    // =====================================================
    // REJECT DRIVER
    // =====================================================

    const rejectDriver =
        async (
            userId: number
        ) => {

            try {

                setActionLoading(
                    userId
                );


                const response =
                    await fetch(

                        `${API_URL}/admin/reject-driver/${userId}`,

                        {

                            method: "POST",

                            headers:
                                getAuthHeaders(),

                        }

                    );


                const data =
                    await parseResponse(
                        response
                    );


                console.log(
                    "REJECT DRIVER:",
                    data
                );


                if (!response.ok) {

                    throw new Error(

                        data?.detail ||

                        data?.message ||

                        "Unable to reject driver."

                    );

                }


                Alert.alert(

                    "Driver Rejected",

                    data?.message ||

                    "Driver rejected successfully."

                );


                await Promise.all([

                    loadPendingDrivers(),

                    loadUsers(),

                ]);


            } catch (error: any) {

                console.log(
                    "REJECT DRIVER ERROR:",
                    error
                );


                Alert.alert(

                    "Rejection Failed",

                    error?.message ||

                    "Unable to reject driver."

                );

            } finally {

                setActionLoading(
                    null
                );

            }

        };


    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout =
        () => {

            Alert.alert(

                "Logout",

                "Are you sure you want to logout?",

                [

                    {
                        text: "Cancel",

                        style: "cancel",
                    },

                    {
                        text: "Logout",

                        style: "destructive",

                        onPress: () => {

                            navigation.replace(
                                "AdminLogin"
                            );

                        },
                    },

                ]

            );

        };


    // =====================================================
    // CALCULATIONS
    // =====================================================

    const totalUsers =
        users.length;


    const approvedDrivers =
        users.filter(

            user =>

                user.is_approved === true ||

                user.status === "approved"

        ).length;


    const pendingCount =
        pendingDrivers.length;


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <SafeAreaView
                style={
                    styles.loadingContainer
                }
            >

                <StatusBar
                    barStyle="dark-content"
                    backgroundColor="#F5F7F6"
                />


                <ActivityIndicator
                    size="large"
                    color="#1DAB52"
                />


                <Text
                    style={
                        styles.loadingText
                    }
                >
                    Loading Admin Dashboard...
                </Text>

            </SafeAreaView>

        );

    }


    // =====================================================
    // DASHBOARD
    // =====================================================

    return (

        <SafeAreaView
            style={styles.container}
        >

            <StatusBar
                barStyle="dark-content"
                backgroundColor="#F5F7F6"
            />


            <ScrollView

                contentContainerStyle={
                    styles.scrollContent
                }

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

                    />

                }

            >


                {/* =================================================
                            HEADER
                ================================================= */}

                <View
                    style={styles.header}
                >

                    <View>

                        <Text
                            style={
                                styles.welcome
                            }
                        >
                            Welcome Admin
                        </Text>


                        <Text
                            style={
                                styles.adminEmail
                            }
                        >
                            {admin?.email ||
                                "admin@saathgroww.com"}
                        </Text>

                    </View>


                    <TouchableOpacity

                        style={
                            styles.logoutButton
                        }

                        onPress={
                            handleLogout
                        }

                    >

                        <Text
                            style={
                                styles.logoutText
                            }
                        >
                            Logout
                        </Text>

                    </TouchableOpacity>

                </View>


                {/* =================================================
                            TITLE
                ================================================= */}

                <View
                    style={
                        styles.titleSection
                    }
                >

                    <Text
                        style={styles.title}
                    >
                        Admin Dashboard
                    </Text>


                    <Text
                        style={
                            styles.subtitle
                        }
                    >
                        Manage Saath Groww operations
                    </Text>

                </View>


                {/* =================================================
                            STAT CARDS
                ================================================= */}

                <View
                    style={
                        styles.statsGrid
                    }
                >

                    <View
                        style={
                            styles.statCard
                        }
                    >

                        <View
                            style={[
                                styles.iconCircle,
                                {
                                    backgroundColor:
                                        "#E8F7EE",
                                },
                            ]}
                        >

                            <Text
                                style={
                                    styles.iconText
                                }
                            >
                                👥
                            </Text>

                        </View>


                        <Text
                            style={
                                styles.statNumber
                            }
                        >
                            {totalUsers}
                        </Text>


                        <Text
                            style={
                                styles.statLabel
                            }
                        >
                            Total Users
                        </Text>

                    </View>


                    <View
                        style={
                            styles.statCard
                        }
                    >

                        <View
                            style={[
                                styles.iconCircle,
                                {
                                    backgroundColor:
                                        "#FFF6DD",
                                },
                            ]}
                        >

                            <Text
                                style={
                                    styles.iconText
                                }
                            >
                                🚚
                            </Text>

                        </View>


                        <Text
                            style={
                                styles.statNumber
                            }
                        >
                            {pendingCount}
                        </Text>


                        <Text
                            style={
                                styles.statLabel
                            }
                        >
                            Pending Drivers
                        </Text>

                    </View>


                    <View
                        style={
                            styles.statCard
                        }
                    >

                        <View
                            style={[
                                styles.iconCircle,
                                {
                                    backgroundColor:
                                        "#E8F7EE",
                                },
                            ]}
                        >

                            <Text
                                style={
                                    styles.iconText
                                }
                            >
                                ✅
                            </Text>

                        </View>


                        <Text
                            style={
                                styles.statNumber
                            }
                        >
                            {approvedDrivers}
                        </Text>


                        <Text
                            style={
                                styles.statLabel
                            }
                        >
                            Approved Drivers
                        </Text>

                    </View>


                    <View
                        style={
                            styles.statCard
                        }
                    >

                        <View
                            style={[
                                styles.iconCircle,
                                {
                                    backgroundColor:
                                        "#E8F4F8",
                                },
                            ]}
                        >

                            <Text
                                style={
                                    styles.iconText
                                }
                            >
                                📦
                            </Text>

                        </View>


                        <Text
                            style={
                                styles.statNumber
                            }
                        >
                            —
                        </Text>


                        <Text
                            style={
                                styles.statLabel
                            }
                        >
                            Orders
                        </Text>

                    </View>

                </View>


                {/* =================================================
                            PENDING DRIVERS
                ================================================= */}

                <View
                    style={
                        styles.section
                    }
                >

                    <View
                        style={
                            styles.sectionHeader
                        }
                    >

                        <View>

                            <Text
                                style={
                                    styles.sectionTitle
                                }
                            >
                                Pending Driver Approvals
                            </Text>


                            <Text
                                style={
                                    styles.sectionSubtitle
                                }
                            >
                                Review and approve new drivers
                            </Text>

                        </View>


                        <View
                            style={
                                styles.countBadge
                            }
                        >

                            <Text
                                style={
                                    styles.countBadgeText
                                }
                            >
                                {pendingCount}
                            </Text>

                        </View>

                    </View>


                    {pendingDrivers.length === 0 ? (

                        <View
                            style={
                                styles.emptyCard
                            }
                        >

                            <Text
                                style={
                                    styles.emptyIcon
                                }
                            >
                                ✓
                            </Text>


                            <Text
                                style={
                                    styles.emptyTitle
                                }
                            >
                                No Pending Drivers
                            </Text>


                            <Text
                                style={
                                    styles.emptyText
                                }
                            >
                                All driver applications
                                have been reviewed.
                            </Text>

                        </View>

                    ) : (

                        pendingDrivers.map(
                            (
                                driver,
                                index
                            ) => (

                                <View
                                    key={
                                        driver.id ??
                                        `driver-${index}`
                                    }
                                    style={
                                        styles.driverCard
                                    }
                                >

                                    <View
                                        style={
                                            styles.driverTop
                                        }
                                    >

                                        <View
                                            style={
                                                styles.driverAvatar
                                            }
                                        >

                                            <Text
                                                style={
                                                    styles.avatarText
                                                }
                                            >
                                                {(
                                                    driver.full_name ||
                                                    "D"
                                                )
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </Text>

                                        </View>


                                        <View
                                            style={
                                                styles.driverInfo
                                            }
                                        >

                                            <Text
                                                style={
                                                    styles.driverName
                                                }
                                            >
                                                {
                                                    driver.full_name ||
                                                    "Unnamed Driver"
                                                }
                                            </Text>


                                            <Text
                                                style={
                                                    styles.driverEmail
                                                }
                                            >
                                                {
                                                    driver.email ||
                                                    "No email"
                                                }
                                            </Text>


                                            {
                                                driver.phone_number
                                                    ? (

                                                        <Text
                                                            style={
                                                                styles.driverPhone
                                                            }
                                                        >
                                                            {
                                                                driver.phone_number
                                                            }
                                                        </Text>

                                                    )
                                                    : null
                                            }

                                        </View>

                                    </View>


                                    <View
                                        style={
                                            styles.driverDetails
                                        }
                                    >

                                        {
                                            driver.vehicle_type
                                                ? (

                                                    <View
                                                        style={
                                                            styles.detailItem
                                                        }
                                                    >

                                                        <Text
                                                            style={
                                                                styles.detailLabel
                                                            }
                                                        >
                                                            Vehicle
                                                        </Text>


                                                        <Text
                                                            style={
                                                                styles.detailValue
                                                            }
                                                        >
                                                            {
                                                                driver.vehicle_type
                                                            }
                                                        </Text>

                                                    </View>

                                                )
                                                : null
                                        }


                                        {
                                            driver.vehicle_number
                                                ? (

                                                    <View
                                                        style={
                                                            styles.detailItem
                                                        }
                                                    >

                                                        <Text
                                                            style={
                                                                styles.detailLabel
                                                            }
                                                        >
                                                            Vehicle No.
                                                        </Text>


                                                        <Text
                                                            style={
                                                                styles.detailValue
                                                            }
                                                        >
                                                            {
                                                                driver.vehicle_number
                                                            }
                                                        </Text>

                                                    </View>

                                                )
                                                : null
                                        }

                                    </View>


                                    <View
                                        style={
                                            styles.actionRow
                                        }
                                    >

                                        <TouchableOpacity

                                            style={
                                                styles.rejectButton
                                            }

                                            disabled={
                                                actionLoading !== null
                                            }

                                            onPress={() => {

                                                if (
                                                    driver.id !==
                                                    undefined
                                                ) {

                                                    rejectDriver(
                                                        driver.id
                                                    );

                                                }

                                            }}

                                        >

                                            <Text
                                                style={
                                                    styles.rejectText
                                                }
                                            >
                                                Reject
                                            </Text>

                                        </TouchableOpacity>


                                        <TouchableOpacity

                                            style={
                                                styles.approveButton
                                            }

                                            disabled={
                                                actionLoading !== null
                                            }

                                            onPress={() => {

                                                if (
                                                    driver.id !==
                                                    undefined
                                                ) {

                                                    approveDriver(
                                                        driver.id
                                                    );

                                                }

                                            }}

                                        >

                                            {
                                                actionLoading ===
                                                    driver.id
                                                    ? (

                                                        <ActivityIndicator
                                                            color="#FFFFFF"
                                                            size="small"
                                                        />

                                                    )
                                                    : (

                                                        <Text
                                                            style={
                                                                styles.approveText
                                                            }
                                                        >
                                                            Approve
                                                        </Text>

                                                    )
                                            }

                                        </TouchableOpacity>

                                    </View>

                                </View>

                            )
                        )

                    )}

                </View>


                {/* =================================================
                            USERS
                ================================================= */}

                <View
                    style={
                        styles.section
                    }
                >

                    <View
                        style={
                            styles.sectionHeader
                        }
                    >

                        <View>

                            <Text
                                style={
                                    styles.sectionTitle
                                }
                            >
                                Recent Users
                            </Text>


                            <Text
                                style={
                                    styles.sectionSubtitle
                                }
                            >
                                Registered Saath Groww users
                            </Text>

                        </View>

                    </View>


                    {
                        users.length === 0
                            ? (

                                <View
                                    style={
                                        styles.emptyCard
                                    }
                                >

                                    <Text
                                        style={
                                            styles.emptyTitle
                                        }
                                    >
                                        No Users Found
                                    </Text>

                                </View>

                            )
                            : (

                                users
                                    .slice(0, 10)
                                    .map(
                                        (
                                            user,
                                            index
                                        ) => (

                                            <View
                                                key={
                                                    user.id ??
                                                    `user-${index}`
                                                }
                                                style={
                                                    styles.userRow
                                                }
                                            >

                                                <View
                                                    style={
                                                        styles.userAvatar
                                                    }
                                                >

                                                    <Text
                                                        style={
                                                            styles.userAvatarText
                                                        }
                                                    >
                                                        {(
                                                            user.full_name ||
                                                            "U"
                                                        )
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </Text>

                                                </View>


                                                <View
                                                    style={
                                                        styles.userInfo
                                                    }
                                                >

                                                    <Text
                                                        style={
                                                            styles.userName
                                                        }
                                                    >
                                                        {
                                                            user.full_name ||
                                                            "Unnamed User"
                                                        }
                                                    </Text>


                                                    <Text
                                                        style={
                                                            styles.userEmail
                                                        }
                                                    >
                                                        {
                                                            user.email ||
                                                            "No email"
                                                        }
                                                    </Text>

                                                </View>


                                                <View
                                                    style={[
                                                        styles.statusBadge,

                                                        user.is_approved
                                                            ? styles.approvedBadge
                                                            : styles.pendingBadge,

                                                    ]}
                                                >

                                                    <Text
                                                        style={[
                                                            styles.statusText,

                                                            user.is_approved
                                                                ? styles.approvedText
                                                                : styles.pendingText,

                                                        ]}
                                                    >
                                                        {
                                                            user.is_approved
                                                                ? "Approved"
                                                                : user.status ||
                                                                "Pending"
                                                        }
                                                    </Text>

                                                </View>

                                            </View>

                                        )
                                    )

                            )
                    }

                </View>


                {/* =================================================
                            FOOTER
                ================================================= */}

                <View
                    style={
                        styles.footer
                    }
                >

                    <Text
                        style={
                            styles.footerText
                        }
                    >
                        Saath Groww Admin Panel
                    </Text>


                    <Text
                        style={
                            styles.footerVersion
                        }
                    >
                        Version 1.0.0
                    </Text>

                </View>

            </ScrollView>

        </SafeAreaView>

    );

}


// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({

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

    loadingText: {
        marginTop: 15,
        fontSize: 15,
        color: "#666",
    },

    scrollContent: {
        padding: 20,
        paddingBottom: 50,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 25,
    },

    welcome: {
        fontSize: 24,
        fontWeight: "800",
        color: "#1DAB52",
    },

    adminEmail: {
        marginTop: 5,
        fontSize: 13,
        color: "#777",
    },

    logoutButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E1E1E1",
    },

    logoutText: {
        color: "#D64545",
        fontSize: 13,
        fontWeight: "700",
    },

    titleSection: {
        marginBottom: 20,
    },

    title: {
        fontSize: 28,
        fontWeight: "800",
        color: "#222",
    },

    subtitle: {
        marginTop: 5,
        fontSize: 14,
        color: "#777",
    },

    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 25,
    },

    statCard: {
        width: "48%",
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 18,
        marginBottom: 14,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 3,
        },
    },

    iconCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },

    iconText: {
        fontSize: 20,
    },

    statNumber: {
        fontSize: 27,
        fontWeight: "800",
        color: "#222",
    },

    statLabel: {
        marginTop: 3,
        fontSize: 13,
        color: "#777",
    },

    section: {
        marginBottom: 25,
    },

    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
    },

    sectionTitle: {
        fontSize: 19,
        fontWeight: "800",
        color: "#222",
    },

    sectionSubtitle: {
        marginTop: 4,
        fontSize: 12,
        color: "#888",
    },

    countBadge: {
        minWidth: 32,
        height: 32,
        paddingHorizontal: 8,
        borderRadius: 16,
        backgroundColor: "#1DAB52",
        justifyContent: "center",
        alignItems: "center",
    },

    countBadgeText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "800",
    },

    emptyCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 30,
        alignItems: "center",
    },

    emptyIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#E8F7EE",
        color: "#1DAB52",
        textAlign: "center",
        textAlignVertical: "center",
        fontSize: 28,
        fontWeight: "800",
        marginBottom: 12,
    },

    emptyTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#333",
    },

    emptyText: {
        marginTop: 6,
        textAlign: "center",
        fontSize: 13,
        color: "#888",
    },

    driverCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 18,
        marginBottom: 14,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 3,
        },
    },

    driverTop: {
        flexDirection: "row",
        alignItems: "center",
    },

    driverAvatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: "#1DAB52",
        justifyContent: "center",
        alignItems: "center",
    },

    avatarText: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "800",
    },

    driverInfo: {
        flex: 1,
        marginLeft: 13,
    },

    driverName: {
        fontSize: 16,
        fontWeight: "800",
        color: "#222",
    },

    driverEmail: {
        marginTop: 3,
        fontSize: 12,
        color: "#777",
    },

    driverPhone: {
        marginTop: 3,
        fontSize: 12,
        color: "#777",
    },

    driverDetails: {
        flexDirection: "row",
        marginTop: 17,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: "#EEEEEE",
    },

    detailItem: {
        flex: 1,
    },

    detailLabel: {
        fontSize: 11,
        color: "#999",
        marginBottom: 4,
    },

    detailValue: {
        fontSize: 13,
        fontWeight: "600",
        color: "#333",
    },

    actionRow: {
        flexDirection: "row",
        marginTop: 18,
    },

    rejectButton: {
        flex: 1,
        height: 45,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#D64545",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 5,
    },

    rejectText: {
        color: "#D64545",
        fontSize: 14,
        fontWeight: "700",
    },

    approveButton: {
        flex: 1,
        height: 45,
        borderRadius: 10,
        backgroundColor: "#1DAB52",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 5,
    },

    approveText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
    },

    userRow: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
    },

    userAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#E8F7EE",
        justifyContent: "center",
        alignItems: "center",
    },

    userAvatarText: {
        color: "#1DAB52",
        fontSize: 17,
        fontWeight: "800",
    },

    userInfo: {
        flex: 1,
        marginLeft: 12,
    },

    userName: {
        fontSize: 14,
        fontWeight: "700",
        color: "#333",
    },

    userEmail: {
        marginTop: 3,
        fontSize: 11,
        color: "#888",
    },

    statusBadge: {
        paddingHorizontal: 9,
        paddingVertical: 6,
        borderRadius: 8,
    },

    approvedBadge: {
        backgroundColor: "#E8F7EE",
    },

    pendingBadge: {
        backgroundColor: "#FFF6DD",
    },

    statusText: {
        fontSize: 10,
        fontWeight: "700",
    },

    approvedText: {
        color: "#1DAB52",
    },

    pendingText: {
        color: "#B27B00",
    },

    footer: {
        alignItems: "center",
        paddingVertical: 20,
    },

    footerText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#777",
    },

    footerVersion: {
        marginTop: 4,
        fontSize: 11,
        color: "#AAA",
    },

});