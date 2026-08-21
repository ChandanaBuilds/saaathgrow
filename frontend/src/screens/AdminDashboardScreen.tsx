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
    useWindowDimensions,
    View,
} from "react-native";

import { CommonActions } from "@react-navigation/native";


// =========================================================
// CONFIG
// =========================================================

const API_URL = "https://saaathgrow.onrender.com";

// IMPORTANT:
// This must match the route name in your navigator.
const ADMIN_LOGIN_ROUTE = "AdminLogin";


// =========================================================
// TYPES
// =========================================================

type DriverTab =
    | "pending"
    | "approved"
    | "rejected"
    | "all";

interface AdminUser {
    id?: number;
    full_name?: string;
    email?: string;
    phone_number?: string;

    city?: string | null;
    state?: string | null;

    vehicle_type?: string | null;
    vehicle_number?: string | null;

    status?: string | null;

    is_approved?: boolean;
    email_verified?: boolean;
}

interface AdminMe {
    id?: number;
    email?: string;
    role?: string;
    full_name?: string;
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

    count?: number;
}


// =========================================================
// MAIN DASHBOARD
// =========================================================

export default function AdminDashboardScreen({
    navigation,
    route,
}: any) {

    const { width } = useWindowDimensions();

    const isMobile = width < 600;
    const isTablet = width >= 600 && width < 1000;
    const isDesktop = width >= 1000;

    const token = route?.params?.access_token;


    // =======================================================
    // STATE
    // =======================================================

    const [admin, setAdmin] =
        useState<AdminMe | null>(null);

    const [users, setUsers] =
        useState<AdminUser[]>([]);

    const [pendingDrivers, setPendingDrivers] =
        useState<AdminUser[]>([]);

    const [approvedDrivers, setApprovedDrivers] =
        useState<AdminUser[]>([]);

    const [rejectedDrivers, setRejectedDrivers] =
        useState<AdminUser[]>([]);

    const [activeTab, setActiveTab] =
        useState<DriverTab>("pending");

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [actionLoading, setActionLoading] =
        useState<number | null>(null);


    // =======================================================
    // HEADERS
    // =======================================================

    const headers = () => ({
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
    });


    // =======================================================
    // PARSE RESPONSE
    // =======================================================

    const parse = async (
        response: Response
    ): Promise<ApiResponse> => {

        const raw = await response.text();

        if (!raw) {
            return {};
        }

        try {
            return JSON.parse(raw);
        } catch {
            return {
                message: raw,
            };
        }
    };


    // =======================================================
    // ROOT NAVIGATION
    // =======================================================

    const getRootNavigation = () => {

        let rootNavigation = navigation;

        let parent = rootNavigation?.getParent?.();

        while (parent) {

            rootNavigation = parent;

            parent = parent?.getParent?.();
        }

        return rootNavigation;
    };


    // =======================================================
    // LOGOUT
    // =======================================================

    // =========================================================
    // LOGOUT
    // =========================================================

    const performLogout = () => {
        console.log("=================================");
        console.log("ADMIN LOGOUT CLICKED");
        console.log("=================================");

        try {
            // Clear any web session data if present
            if (typeof window !== "undefined") {
                try {
                    window.sessionStorage.removeItem("admin_token");
                    window.sessionStorage.removeItem("admin_access_token");
                    window.localStorage.removeItem("admin_token");
                    window.localStorage.removeItem("admin_access_token");
                } catch (storageError) {
                    console.log(
                        "Storage cleanup skipped:",
                        storageError
                    );
                }
            }

            // Completely remove Dashboard from navigation history
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [
                        {
                            name: "AdminLogin",
                        },
                    ],
                })
            );

        } catch (error) {
            console.error(
                "Logout navigation error:",
                error
            );

            // Fallback
            navigation.replace("AdminLogin");
        }
    };


    // =========================================================
    // LOGOUT BUTTON
    // =========================================================

    const logout = () => {
        performLogout();
    };


    // =======================================================
    // AUTH ERROR
    // =======================================================

    const authError = (
        status: number
    ) => {

        if (status !== 401) {
            return false;
        }

        Alert.alert(
            "Session Expired",
            "Your admin session has expired. Please login again.",

            [
                {
                    text: "OK",
                    onPress: performLogout,
                },
            ]
        );

        return true;
    };


    // =======================================================
    // LIST PARSER
    // =======================================================

    const listFrom = (
        data: ApiResponse
    ): AdminUser[] => {

        if (Array.isArray(data.users)) {
            return data.users;
        }

        if (Array.isArray(data.drivers)) {
            return data.drivers;
        }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    };


    // =======================================================
    // GET REQUEST
    // =======================================================

    const get = async (
        path: string
    ) => {

        const response = await fetch(
            `${API_URL}${path}`,
            {
                method: "GET",
                headers: headers(),
            }
        );

        const data = await parse(response);

        console.log(
            `GET ${path}`,
            response.status,
            data
        );

        if (authError(response.status)) {

            throw new Error(
                "SESSION_EXPIRED"
            );
        }

        if (!response.ok) {

            throw new Error(
                data.detail ||
                data.message ||
                `Request failed: ${response.status}`
            );
        }

        return data;
    };


    // =======================================================
    // LOAD ADMIN
    // =======================================================

    const loadAdmin = async () => {

        const data =
            await get("/admin/me");

        setAdmin(
            data.admin ||
            data.user ||
            (data as AdminMe)
        );
    };


    // =======================================================
    // LOAD USERS
    // =======================================================

    const loadUsers = async () => {

        const data =
            await get("/admin/all-users");

        setUsers(
            listFrom(data)
        );
    };


    // =======================================================
    // LOAD PENDING
    // =======================================================

    const loadPending = async () => {

        const data =
            await get("/admin/pending-drivers");

        setPendingDrivers(
            listFrom(data)
        );
    };


    // =======================================================
    // LOAD APPROVED
    // =======================================================

    const loadApproved = async () => {

        const data =
            await get("/admin/approved-drivers");

        setApprovedDrivers(
            listFrom(data)
        );
    };


    // =======================================================
    // LOAD REJECTED
    // =======================================================

    const loadRejected = async () => {

        const data =
            await get("/admin/rejected-drivers");

        setRejectedDrivers(
            listFrom(data)
        );
    };


    // =======================================================
    // LOAD DASHBOARD
    // =======================================================

    const loadDashboard = useCallback(
        async () => {

            if (!token) {

                Alert.alert(
                    "Authentication Error",
                    "Admin login token is missing.",

                    [
                        {
                            text: "OK",
                            onPress: performLogout,
                        },
                    ]
                );

                return;
            }

            try {

                setLoading(true);

                await Promise.all([
                    loadAdmin(),
                    loadUsers(),
                    loadPending(),
                    loadApproved(),
                    loadRejected(),
                ]);

            } catch (error: any) {

                if (
                    error?.message !==
                    "SESSION_EXPIRED"
                ) {

                    Alert.alert(
                        "Dashboard Error",
                        error?.message ||
                        "Unable to load dashboard."
                    );
                }

            } finally {

                setLoading(false);
            }

        },
        [token]
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

    const refresh = async () => {

        try {

            setRefreshing(true);

            await Promise.all([
                loadAdmin(),
                loadUsers(),
                loadPending(),
                loadApproved(),
                loadRejected(),
            ]);

        } catch (error: any) {

            if (
                error?.message !==
                "SESSION_EXPIRED"
            ) {

                Alert.alert(
                    "Refresh Failed",
                    error?.message ||
                    "Unable to refresh dashboard."
                );
            }

        } finally {

            setRefreshing(false);
        }
    };


    // =======================================================
    // APPROVE DRIVER
    // =======================================================

    const approveDriver = async (
        id: number
    ) => {

        try {

            setActionLoading(id);

            const response =
                await fetch(
                    `${API_URL}/admin/approve-driver/${id}`,
                    {
                        method: "POST",
                        headers: headers(),
                    }
                );

            const data =
                await parse(response);

            console.log(
                "APPROVE DRIVER",
                response.status,
                data
            );

            if (
                authError(response.status)
            ) {
                return;
            }

            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    data.message ||
                    "Unable to approve driver."
                );
            }

            Alert.alert(
                "Driver Approved",
                data.message ||
                "Driver approved successfully."
            );

            await Promise.all([
                loadUsers(),
                loadPending(),
                loadApproved(),
                loadRejected(),
            ]);

            setActiveTab("approved");

        } catch (error: any) {

            Alert.alert(
                "Approval Failed",
                error?.message ||
                "Unable to approve driver."
            );

        } finally {

            setActionLoading(null);
        }
    };


    // =======================================================
    // REJECT DRIVER
    // =======================================================

    const rejectDriver = async (
        id: number
    ) => {

        try {

            setActionLoading(id);

            const response =
                await fetch(
                    `${API_URL}/admin/reject-driver/${id}`,
                    {
                        method: "POST",
                        headers: headers(),
                    }
                );

            const data =
                await parse(response);

            console.log(
                "REJECT DRIVER",
                response.status,
                data
            );

            if (
                authError(response.status)
            ) {
                return;
            }

            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    data.message ||
                    "Unable to reject driver."
                );
            }

            Alert.alert(
                "Driver Rejected",
                data.message ||
                "Driver rejected successfully."
            );

            await Promise.all([
                loadUsers(),
                loadPending(),
                loadApproved(),
                loadRejected(),
            ]);

            setActiveTab("rejected");

        } catch (error: any) {

            Alert.alert(
                "Rejection Failed",
                error?.message ||
                "Unable to reject driver."
            );

        } finally {

            setActionLoading(null);
        }
    };


    // =======================================================
    // VIEW DRIVER
    // =======================================================

    const viewDriver = async (
        id: number
    ) => {

        try {

            const data =
                await get(
                    `/admin/driver/${id}`
                );

            const responseData: any =
                data;

            const driver =
                responseData.user ||
                responseData.driver ||
                responseData.data ||
                responseData;

            Alert.alert(
                driver.full_name ||
                "Driver Details",

                [
                    `Email: ${driver.email || "N/A"}`,
                    `Phone: ${driver.phone_number || "N/A"}`,
                    `Vehicle: ${driver.vehicle_type || "N/A"}`,
                    `Vehicle No: ${driver.vehicle_number || "N/A"}`,
                    `City: ${driver.city || "N/A"}`,
                    `State: ${driver.state || "N/A"}`,
                    `Status: ${driver.status || "N/A"}`,
                    `Email Verified: ${driver.email_verified
                        ? "Yes"
                        : "No"
                    }`,
                    `Approved: ${driver.is_approved
                        ? "Yes"
                        : "No"
                    }`,
                ].join("\n")
            );

        } catch (error: any) {

            if (
                error?.message !==
                "SESSION_EXPIRED"
            ) {

                Alert.alert(
                    "Driver Details",
                    error?.message ||
                    "Unable to load details."
                );
            }
        }
    };


    // =======================================================
    // ACTIVE LIST
    // =======================================================

    const activeDrivers =
        activeTab === "pending"
            ? pendingDrivers
            : activeTab === "approved"
                ? approvedDrivers
                : activeTab === "rejected"
                    ? rejectedDrivers
                    : users;


    const tabTitle =
        activeTab === "pending"
            ? "Pending Driver Approvals"
            : activeTab === "approved"
                ? "Approved Drivers"
                : activeTab === "rejected"
                    ? "Rejected Drivers"
                    : "All Users";


    const tabSubtitle =
        activeTab === "pending"
            ? "Review new driver applications"
            : activeTab === "approved"
                ? "Drivers approved by administration"
                : activeTab === "rejected"
                    ? "Drivers rejected by administration"
                    : "All registered Saath Groww users";


    // =======================================================
    // LOADING SCREEN
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
                    Loading Admin Dashboard...
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
                contentContainerStyle={[
                    styles.scrollContent,

                    isMobile &&
                    styles.scrollContentMobile,

                    isDesktop &&
                    styles.scrollContentDesktop,
                ]}

                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={refresh}
                        colors={["#1DAB52"]}
                        tintColor="#1DAB52"
                    />
                }

                showsVerticalScrollIndicator={false}
            >

                {/* ================================================= */}
                {/* HEADER */}
                {/* ================================================= */}

                <View
                    style={[
                        styles.header,

                        isMobile &&
                        styles.headerMobile,
                    ]}
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
                                style={[
                                    styles.welcome,

                                    isMobile &&
                                    styles.welcomeMobile,
                                ]}
                            >
                                Welcome, Admin
                            </Text>

                            <Text
                                style={styles.email}
                                numberOfLines={1}
                            >
                                {admin?.email ||
                                    "admin@saathgroww.com"}
                            </Text>

                        </View>

                    </View>


                    {/* LOGOUT - ALWAYS VISIBLE */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={[
                            styles.logoutButton,

                            isMobile &&
                            styles.logoutButtonMobile,
                        ]}
                        onPress={logout}
                    >

                        <Text
                            style={styles.logoutIcon}
                        >
                            ↪
                        </Text>

                        <Text
                            style={styles.logoutText}
                        >
                            Logout
                        </Text>

                    </TouchableOpacity>

                </View>


                {/* ================================================= */}
                {/* PAGE TITLE */}
                {/* ================================================= */}

                <View
                    style={styles.pageHeading}
                >

                    <Text
                        style={[
                            styles.pageTitle,

                            isMobile &&
                            styles.pageTitleMobile,
                        ]}
                    >
                        Admin Dashboard
                    </Text>

                    <Text
                        style={styles.pageSubtitle}
                    >
                        Manage Saath Groww users, drivers
                        and applications
                    </Text>

                </View>


                {/* ================================================= */}
                {/* OVERVIEW */}
                {/* ================================================= */}

                <View
                    style={styles.overviewHeader}
                >

                    <View>
                        <Text
                            style={styles.overviewTitle}
                        >
                            Overview
                        </Text>

                        <Text
                            style={styles.overviewSubtitle}
                        >
                            Current platform statistics
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={refresh}
                    >
                        <Text
                            style={styles.refreshIcon}
                        >
                            ↻
                        </Text>

                        <Text
                            style={styles.refreshText}
                        >
                            Refresh
                        </Text>
                    </TouchableOpacity>

                </View>


                {/* ================================================= */}
                {/* STATS */}
                {/* ================================================= */}

                <View
                    style={[
                        styles.statsGrid,

                        isMobile &&
                        styles.statsGridMobile,
                    ]}
                >

                    <StatCard
                        icon="U"
                        value={users.length}
                        label="Total Users"
                        description="Registered users"
                        type="users"
                        onPress={() =>
                            setActiveTab("all")
                        }
                        mobile={isMobile}
                    />

                    <StatCard
                        icon="P"
                        value={pendingDrivers.length}
                        label="Pending Drivers"
                        description="Waiting for review"
                        type="pending"
                        onPress={() =>
                            setActiveTab("pending")
                        }
                        mobile={isMobile}
                    />

                    <StatCard
                        icon="A"
                        value={approvedDrivers.length}
                        label="Approved Drivers"
                        description="Active drivers"
                        type="approved"
                        onPress={() =>
                            setActiveTab("approved")
                        }
                        mobile={isMobile}
                    />

                    <StatCard
                        icon="R"
                        value={rejectedDrivers.length}
                        label="Rejected Drivers"
                        description="Rejected applications"
                        type="rejected"
                        onPress={() =>
                            setActiveTab("rejected")
                        }
                        mobile={isMobile}
                    />

                </View>


                {/* ================================================= */}
                {/* DRIVER MANAGEMENT */}
                {/* ================================================= */}

                <View
                    style={styles.section}
                >

                    <View
                        style={styles.sectionHeader}
                    >

                        <View
                            style={{ flex: 1 }}
                        >

                            <Text
                                style={styles.sectionTitle}
                            >
                                Driver Management
                            </Text>

                            <Text
                                style={styles.sectionSubtitle}
                            >
                                Review and manage driver
                                applications
                            </Text>

                        </View>

                        <View
                            style={styles.sectionBadge}
                        >

                            <Text
                                style={styles.sectionBadgeText}
                            >
                                {pendingDrivers.length}
                            </Text>

                            <Text
                                style={styles.sectionBadgeLabel}
                            >
                                pending
                            </Text>

                        </View>

                    </View>


                    {/* TABS */}

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={
                            false
                        }
                        contentContainerStyle={
                            styles.tabsContainer
                        }
                    >

                        <Tab
                            label={`Pending ${pendingDrivers.length}`}
                            active={
                                activeTab === "pending"
                            }
                            onPress={() =>
                                setActiveTab("pending")
                            }
                        />

                        <Tab
                            label={`Approved ${approvedDrivers.length}`}
                            active={
                                activeTab === "approved"
                            }
                            onPress={() =>
                                setActiveTab("approved")
                            }
                        />

                        <Tab
                            label={`Rejected ${rejectedDrivers.length}`}
                            active={
                                activeTab === "rejected"
                            }
                            onPress={() =>
                                setActiveTab("rejected")
                            }
                        />

                        <Tab
                            label={`All Users ${users.length}`}
                            active={
                                activeTab === "all"
                            }
                            onPress={() =>
                                setActiveTab("all")
                            }
                        />

                    </ScrollView>


                    {/* LIST HEADER */}

                    <View
                        style={styles.listHeader}
                    >

                        <View
                            style={{ flex: 1 }}
                        >

                            <Text
                                style={styles.listTitle}
                            >
                                {tabTitle}
                            </Text>

                            <Text
                                style={styles.listSubtitle}
                            >
                                {tabSubtitle}
                            </Text>

                        </View>

                        <View
                            style={styles.countBadge}
                        >
                            <Text
                                style={styles.countBadgeText}
                            >
                                {activeDrivers.length}
                            </Text>
                        </View>

                    </View>


                    {/* DRIVER LIST */}

                    {activeDrivers.length === 0 ? (

                        <EmptyState
                            tab={activeTab}
                        />

                    ) : (

                        activeDrivers.map(
                            (driver, index) => (

                                <DriverCard
                                    key={
                                        driver.id ??
                                        `${activeTab}-${index}`
                                    }

                                    driver={driver}

                                    tab={activeTab}

                                    actionLoading={
                                        actionLoading
                                    }

                                    onView={
                                        viewDriver
                                    }

                                    onApprove={
                                        approveDriver
                                    }

                                    onReject={
                                        rejectDriver
                                    }

                                    mobile={
                                        isMobile
                                    }
                                />

                            )
                        )

                    )}

                </View>


                {/* ================================================= */}
                {/* RECENT USERS */}
                {/* ================================================= */}

                <View
                    style={styles.section}
                >

                    <View
                        style={styles.sectionHeader}
                    >

                        <View
                            style={{ flex: 1 }}
                        >

                            <Text
                                style={styles.sectionTitle}
                            >
                                Recent Users
                            </Text>

                            <Text
                                style={styles.sectionSubtitle}
                            >
                                Recently registered users
                            </Text>

                        </View>

                        <TouchableOpacity
                            style={styles.viewAllButton}
                            onPress={() =>
                                setActiveTab("all")
                            }
                        >

                            <Text
                                style={styles.viewAllText}
                            >
                                View All
                            </Text>

                        </TouchableOpacity>

                    </View>


                    {users.length === 0 ? (

                        <EmptyState
                            tab="all"
                        />

                    ) : (

                        users
                            .slice(0, 10)
                            .map(
                                (user, index) => (

                                    <UserRow
                                        key={
                                            user.id ??
                                            `user-${index}`
                                        }

                                        user={user}

                                        mobile={
                                            isMobile
                                        }
                                    />

                                )
                            )

                    )}

                </View>


                {/* ================================================= */}
                {/* MOBILE LOGOUT */}
                {/* ================================================= */}

                {isMobile && (

                    <TouchableOpacity
                        style={styles.bottomLogout}
                        onPress={logout}
                    >

                        <Text
                            style={styles.bottomLogoutIcon}
                        >
                            ↪
                        </Text>

                        <Text
                            style={styles.bottomLogoutText}
                        >
                            Logout from Admin
                        </Text>

                    </TouchableOpacity>

                )}


                {/* ================================================= */}
                {/* FOOTER */}
                {/* ================================================= */}

                <View
                    style={styles.footer}
                >

                    <View
                        style={styles.footerLogo}
                    >
                        <Text
                            style={styles.footerLogoText}
                        >
                            SG
                        </Text>
                    </View>

                    <Text
                        style={styles.footerTitle}
                    >
                        Saath Groww Admin
                    </Text>

                    <Text
                        style={styles.footerVersion}
                    >
                        Administration Panel • v2.0.0
                    </Text>

                </View>

            </ScrollView>

        </SafeAreaView>
    );
}


// =========================================================
// STAT CARD
// =========================================================

function StatCard({
    icon,
    value,
    label,
    description,
    type,
    onPress,
    mobile,
}: {
    icon: string;
    value: number;
    label: string;
    description: string;
    type:
    | "users"
    | "pending"
    | "approved"
    | "rejected";
    onPress: () => void;
    mobile: boolean;
}) {

    const background =
        type === "users"
            ? "#EAF7EF"
            : type === "pending"
                ? "#FFF7E1"
                : type === "approved"
                    ? "#EAF7EF"
                    : "#FDEDED";


    const iconColor =
        type === "users"
            ? "#1DAB52"
            : type === "pending"
                ? "#B27B00"
                : type === "approved"
                    ? "#1DAB52"
                    : "#D64545";


    return (
        <TouchableOpacity
            activeOpacity={0.88}
            onPress={onPress}
            style={[
                styles.statCard,

                mobile &&
                styles.statCardMobile,
            ]}
        >

            <View
                style={[
                    styles.statIcon,
                    {
                        backgroundColor:
                            background,
                    },
                ]}
            >

                <Text
                    style={[
                        styles.statIconText,
                        {
                            color: iconColor,
                        },
                    ]}
                >
                    {icon}
                </Text>

            </View>

            <Text
                style={styles.statNumber}
            >
                {value}
            </Text>

            <Text
                style={styles.statLabel}
            >
                {label}
            </Text>

            <Text
                style={styles.statDescription}
            >
                {description}
            </Text>

            <Text
                style={[
                    styles.statArrow,
                    {
                        color: iconColor,
                    },
                ]}
            >
                →
            </Text>

        </TouchableOpacity>
    );
}


// =========================================================
// TAB
// =========================================================

function Tab({
    label,
    active,
    onPress,
}: {
    label: string;
    active: boolean;
    onPress: () => void;
}) {

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPress}
            style={[
                styles.tab,

                active &&
                styles.tabActive,
            ]}
        >

            <Text
                style={[
                    styles.tabText,

                    active &&
                    styles.tabTextActive,
                ]}
            >
                {label}
            </Text>

        </TouchableOpacity>
    );
}


// =========================================================
// EMPTY STATE
// =========================================================

function EmptyState({
    tab,
}: {
    tab: DriverTab;
}) {

    const message =
        tab === "pending"
            ? "There are no driver applications waiting for review."
            : tab === "approved"
                ? "No approved drivers found."
                : tab === "rejected"
                    ? "No rejected drivers found."
                    : "No users registered yet.";


    return (
        <View
            style={styles.empty}
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
                Nothing Here
            </Text>

            <Text
                style={styles.emptyText}
            >
                {message}
            </Text>

        </View>
    );
}


// =========================================================
// DRIVER CARD
// =========================================================

function DriverCard({
    driver,
    tab,
    actionLoading,
    onView,
    onApprove,
    onReject,
    mobile,
}: {
    driver: AdminUser;
    tab: DriverTab;
    actionLoading: number | null;

    onView: (
        id: number
    ) => void;

    onApprove: (
        id: number
    ) => void;

    onReject: (
        id: number
    ) => void;

    mobile: boolean;
}) {

    const hasId =
        driver.id !== undefined;


    const status =
        driver.status ||
        (
            driver.is_approved
                ? "approved"
                : "pending"
        );


    return (
        <View
            style={[
                styles.driverCard,

                mobile &&
                styles.driverCardMobile,
            ]}
        >

            {/* DRIVER HEADER */}

            <View
                style={styles.driverHeader}
            >

                <View
                    style={styles.driverAvatar}
                >

                    <Text
                        style={styles.driverAvatarText}
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
                    style={styles.driverMainInfo}
                >

                    <View
                        style={[
                            styles.driverNameRow,

                            mobile &&
                            styles.driverNameRowMobile,
                        ]}
                    >

                        <Text
                            style={styles.driverName}
                            numberOfLines={1}
                        >
                            {driver.full_name ||
                                "Unnamed Driver"}
                        </Text>

                        <StatusBadge
                            status={status}
                            approved={
                                !!driver.is_approved
                            }
                        />

                    </View>

                    <Text
                        style={styles.driverEmail}
                        numberOfLines={1}
                    >
                        {driver.email ||
                            "No email"}
                    </Text>

                    {driver.phone_number ? (

                        <Text
                            style={styles.driverPhone}
                        >
                            {driver.phone_number}
                        </Text>

                    ) : null}

                </View>

            </View>


            {/* DETAILS */}

            <View
                style={[
                    styles.detailsGrid,

                    mobile &&
                    styles.detailsGridMobile,
                ]}
            >

                <Detail
                    label="Vehicle"
                    value={
                        driver.vehicle_type ||
                        "Not provided"
                    }
                />

                <Detail
                    label="Vehicle Number"
                    value={
                        driver.vehicle_number ||
                        "Not provided"
                    }
                />

                <Detail
                    label="Location"
                    value={
                        [
                            driver.city,
                            driver.state,
                        ]
                            .filter(Boolean)
                            .join(", ") ||
                        "Not provided"
                    }
                />

                <Detail
                    label="Email"
                    value={
                        driver.email_verified
                            ? "Verified"
                            : "Not verified"
                    }
                />

            </View>


            {/* ACTIONS */}

            {hasId && (

                <View
                    style={[
                        styles.actions,

                        mobile &&
                        styles.actionsMobile,
                    ]}
                >

                    <TouchableOpacity
                        activeOpacity={0.8}
                        disabled={
                            actionLoading !== null
                        }
                        style={[
                            styles.viewButton,

                            mobile &&
                            styles.mobileActionButton,
                        ]}
                        onPress={() =>
                            onView(driver.id!)
                        }
                    >

                        <Text
                            style={styles.viewButtonText}
                        >
                            View Details
                        </Text>

                    </TouchableOpacity>


                    {tab === "pending" && (

                        <>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                disabled={
                                    actionLoading !== null
                                }
                                style={[
                                    styles.rejectButton,

                                    mobile &&
                                    styles.mobileActionButton,
                                ]}
                                onPress={() =>
                                    onReject(driver.id!)
                                }
                            >

                                <Text
                                    style={styles.rejectButtonText}
                                >
                                    Reject
                                </Text>

                            </TouchableOpacity>


                            <TouchableOpacity
                                activeOpacity={0.8}
                                disabled={
                                    actionLoading !== null
                                }
                                style={[
                                    styles.approveButton,

                                    mobile &&
                                    styles.mobileActionButton,
                                ]}
                                onPress={() =>
                                    onApprove(driver.id!)
                                }
                            >

                                {actionLoading ===
                                    driver.id ? (

                                    <ActivityIndicator
                                        color="#FFFFFF"
                                        size="small"
                                    />

                                ) : (

                                    <Text
                                        style={styles.approveButtonText}
                                    >
                                        Approve
                                    </Text>

                                )}

                            </TouchableOpacity>

                        </>

                    )}

                </View>

            )}

        </View>
    );
}


// =========================================================
// DETAIL
// =========================================================

function Detail({
    label,
    value,
}: {
    label: string;
    value: string;
}) {

    return (
        <View
            style={styles.detail}
        >

            <Text
                style={styles.detailLabel}
            >
                {label}
            </Text>

            <Text
                style={styles.detailValue}
                numberOfLines={2}
            >
                {value}
            </Text>

        </View>
    );
}


// =========================================================
// STATUS BADGE
// =========================================================

function StatusBadge({
    status,
    approved,
}: {
    status: string;
    approved: boolean;
}) {

    const normalized =
        status.toLowerCase();


    const isApproved =
        approved ||
        normalized === "approved";


    const isRejected =
        normalized === "rejected";


    const label =
        isApproved
            ? "Approved"
            : isRejected
                ? "Rejected"
                : normalized.replace(
                    /_/g,
                    " "
                );


    return (
        <View
            style={[
                styles.statusBadge,

                isApproved
                    ? styles.approvedBadge
                    : isRejected
                        ? styles.rejectedBadge
                        : styles.pendingBadge,
            ]}
        >

            <Text
                style={[
                    styles.statusText,

                    isApproved
                        ? styles.approvedText
                        : isRejected
                            ? styles.rejectedText
                            : styles.pendingText,
                ]}
            >
                {label}
            </Text>

        </View>
    );
}


// =========================================================
// USER ROW
// =========================================================

function UserRow({
    user,
    mobile,
}: {
    user: AdminUser;
    mobile: boolean;
}) {

    const status =
        user.status ||
        (
            user.is_approved
                ? "approved"
                : "pending"
        );


    return (
        <View
            style={[
                styles.userRow,

                mobile &&
                styles.userRowMobile,
            ]}
        >

            <View
                style={styles.userAvatar}
            >

                <Text
                    style={styles.userAvatarText}
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
                style={styles.userInfo}
            >

                <Text
                    style={styles.userName}
                    numberOfLines={1}
                >
                    {user.full_name ||
                        "Unnamed User"}
                </Text>

                <Text
                    style={styles.userEmail}
                    numberOfLines={1}
                >
                    {user.email ||
                        "No email"}
                </Text>

                {user.phone_number ? (

                    <Text
                        style={styles.userPhone}
                    >
                        {user.phone_number}
                    </Text>

                ) : null}

            </View>


            <StatusBadge
                status={status}
                approved={
                    !!user.is_approved
                }
            />

        </View>
    );
}


// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({

    // =======================================================
    // MAIN
    // =======================================================

    container: {
        flex: 1,
        backgroundColor: "#F4F7F5",
    },

    scrollContent: {
        width: "100%",
        maxWidth: 1400,
        alignSelf: "center",
        padding: 28,
        paddingBottom: 70,
    },

    scrollContentMobile: {
        padding: 16,
        paddingBottom: 40,
    },

    scrollContentDesktop: {
        paddingHorizontal: 50,
    },


    // =======================================================
    // LOADING
    // =======================================================

    loadingContainer: {
        flex: 1,
        backgroundColor: "#F4F7F5",
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
        marginBottom: 18,
    },

    loadingLogoText: {
        color: "#FFFFFF",
        fontSize: 19,
        fontWeight: "900",
    },

    loadingText: {
        marginTop: 14,
        color: "#6E766F",
        fontSize: 14,
    },


    // =======================================================
    // HEADER
    // =======================================================

    header: {
        width: "100%",
        minHeight: 68,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 30,
    },

    headerMobile: {
        minHeight: 62,
        marginBottom: 24,
    },

    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        minWidth: 0,
    },

    logo: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#1DAB52",
        justifyContent: "center",
        alignItems: "center",
    },

    logoText: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "900",
    },

    headerInfo: {
        marginLeft: 13,
        flex: 1,
        minWidth: 0,
    },

    welcome: {
        color: "#172019",
        fontSize: 20,
        fontWeight: "800",
    },

    welcomeMobile: {
        fontSize: 17,
    },

    email: {
        marginTop: 3,
        color: "#7B847D",
        fontSize: 11,
    },


    // =======================================================
    // LOGOUT
    // =======================================================

    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",

        minWidth: 108,
        height: 42,

        paddingHorizontal: 15,

        borderRadius: 11,

        backgroundColor: "#FFFFFF",

        borderWidth: 1,
        borderColor: "#E0E5E1",

        elevation: 2,

        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 5,
        shadowOffset: {
            width: 0,
            height: 2,
        },

        marginLeft: 10,
    },

    logoutButtonMobile: {
        minWidth: 88,
        height: 40,
        paddingHorizontal: 11,
    },

    logoutIcon: {
        color: "#D64545",
        fontSize: 18,
        fontWeight: "800",
        marginRight: 5,
    },

    logoutText: {
        color: "#D64545",
        fontSize: 12,
        fontWeight: "800",
    },


    // =======================================================
    // PAGE HEADING
    // =======================================================

    pageHeading: {
        marginBottom: 30,
    },

    pageTitle: {
        color: "#18201A",
        fontSize: 34,
        fontWeight: "900",
    },

    pageTitleMobile: {
        fontSize: 27,
    },

    pageSubtitle: {
        marginTop: 7,
        color: "#7A827C",
        fontSize: 14,
    },


    // =======================================================
    // OVERVIEW
    // =======================================================

    overviewHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
    },

    overviewTitle: {
        color: "#202721",
        fontSize: 19,
        fontWeight: "800",
    },

    overviewSubtitle: {
        marginTop: 3,
        color: "#8A918B",
        fontSize: 11,
    },

    refreshButton: {
        flexDirection: "row",
        alignItems: "center",

        paddingHorizontal: 12,
        height: 38,

        borderRadius: 9,

        backgroundColor: "#FFFFFF",

        borderWidth: 1,
        borderColor: "#E1E6E2",
    },

    refreshIcon: {
        color: "#1DAB52",
        fontSize: 18,
        marginRight: 5,
    },

    refreshText: {
        color: "#1DAB52",
        fontSize: 11,
        fontWeight: "800",
    },


    // =======================================================
    // STATS
    // =======================================================

    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 34,
    },

    statsGridMobile: {
        marginBottom: 28,
    },

    statCard: {
        width: "24%",
        minHeight: 175,

        backgroundColor: "#FFFFFF",

        borderRadius: 17,

        padding: 19,

        marginBottom: 12,

        borderWidth: 1,
        borderColor: "#E8ECE9",

        elevation: 2,

        shadowColor: "#000",
        shadowOpacity: 0.035,
        shadowRadius: 7,
        shadowOffset: {
            width: 0,
            height: 3,
        },

        position: "relative",
    },

    statCardMobile: {
        width: "48.5%",
        minHeight: 145,
        padding: 15,
    },

    statIcon: {
        width: 39,
        height: 39,
        borderRadius: 11,

        justifyContent: "center",
        alignItems: "center",

        marginBottom: 13,
    },

    statIconText: {
        fontSize: 15,
        fontWeight: "900",
    },

    statNumber: {
        color: "#1D241F",
        fontSize: 29,
        fontWeight: "900",
    },

    statLabel: {
        marginTop: 3,
        color: "#343B36",
        fontSize: 13,
        fontWeight: "800",
    },

    statDescription: {
        marginTop: 4,
        color: "#929993",
        fontSize: 10,
    },

    statArrow: {
        position: "absolute",
        right: 17,
        top: 20,
        fontSize: 18,
        fontWeight: "800",
    },


    // =======================================================
    // SECTION
    // =======================================================

    section: {
        marginBottom: 34,
    },

    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 15,
    },

    sectionTitle: {
        color: "#202721",
        fontSize: 20,
        fontWeight: "900",
    },

    sectionSubtitle: {
        marginTop: 4,
        color: "#89918B",
        fontSize: 11,
    },

    sectionBadge: {
        flexDirection: "row",
        alignItems: "center",

        backgroundColor: "#EAF7EF",

        paddingHorizontal: 10,
        paddingVertical: 7,

        borderRadius: 9,
    },

    sectionBadgeText: {
        color: "#1DAB52",
        fontSize: 12,
        fontWeight: "900",
        marginRight: 4,
    },

    sectionBadgeLabel: {
        color: "#5F7666",
        fontSize: 10,
    },


    // =======================================================
    // TABS
    // =======================================================

    tabsContainer: {
        paddingBottom: 7,
        paddingRight: 10,
    },

    tab: {
        paddingHorizontal: 15,
        height: 39,

        justifyContent: "center",

        borderRadius: 9,

        backgroundColor: "#FFFFFF",

        borderWidth: 1,
        borderColor: "#E0E5E1",

        marginRight: 7,
    },

    tabActive: {
        backgroundColor: "#1DAB52",
        borderColor: "#1DAB52",
    },

    tabText: {
        color: "#68716A",
        fontSize: 11,
        fontWeight: "800",
    },

    tabTextActive: {
        color: "#FFFFFF",
    },


    // =======================================================
    // LIST HEADER
    // =======================================================

    listHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        marginTop: 19,
        marginBottom: 12,
    },

    listTitle: {
        color: "#232A25",
        fontSize: 17,
        fontWeight: "900",
    },

    listSubtitle: {
        marginTop: 3,
        color: "#8C948E",
        fontSize: 10,
    },

    countBadge: {
        width: 34,
        height: 34,
        borderRadius: 17,

        backgroundColor: "#1DAB52",

        alignItems: "center",
        justifyContent: "center",
    },

    countBadgeText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "900",
    },


    // =======================================================
    // EMPTY
    // =======================================================

    empty: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,

        paddingHorizontal: 25,
        paddingVertical: 35,

        alignItems: "center",

        borderWidth: 1,
        borderColor: "#E7EBE8",
    },

    emptyIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,

        backgroundColor: "#EAF7EF",

        alignItems: "center",
        justifyContent: "center",

        marginBottom: 12,
    },

    emptyIconText: {
        color: "#1DAB52",
        fontSize: 21,
        fontWeight: "900",
    },

    emptyTitle: {
        color: "#313832",
        fontSize: 15,
        fontWeight: "800",
    },

    emptyText: {
        maxWidth: 420,

        marginTop: 6,

        color: "#8A928C",
        fontSize: 11,

        textAlign: "center",
        lineHeight: 17,
    },


    // =======================================================
    // DRIVER CARD
    // =======================================================

    driverCard: {
        backgroundColor: "#FFFFFF",

        borderRadius: 16,

        padding: 17,

        marginBottom: 11,

        borderWidth: 1,
        borderColor: "#E7EBE8",

        elevation: 2,

        shadowColor: "#000",
        shadowOpacity: 0.035,
        shadowRadius: 7,
        shadowOffset: {
            width: 0,
            height: 3,
        },
    },

    driverCardMobile: {
        padding: 14,
    },

    driverHeader: {
        flexDirection: "row",
        alignItems: "center",
    },

    driverAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,

        backgroundColor: "#1DAB52",

        justifyContent: "center",
        alignItems: "center",
    },

    driverAvatarText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "900",
    },

    driverMainInfo: {
        flex: 1,
        minWidth: 0,
        marginLeft: 12,
    },

    driverNameRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    driverNameRowMobile: {
        alignItems: "flex-start",
    },

    driverName: {
        flex: 1,

        color: "#242B26",
        fontSize: 14,
        fontWeight: "900",

        marginRight: 7,
    },

    driverEmail: {
        marginTop: 4,
        color: "#777F79",
        fontSize: 10,
    },

    driverPhone: {
        marginTop: 3,
        color: "#8B928D",
        fontSize: 10,
    },


    // =======================================================
    // DETAILS
    // =======================================================

    detailsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",

        marginTop: 15,

        paddingTop: 13,

        borderTopWidth: 1,
        borderTopColor: "#EEF1EF",
    },

    detailsGridMobile: {
        marginTop: 13,
        paddingTop: 11,
    },

    detail: {
        width: "25%",
        paddingRight: 10,
        marginBottom: 7,
    },

    detailLabel: {
        color: "#9AA19C",
        fontSize: 9,
        fontWeight: "700",

        marginBottom: 4,
    },

    detailValue: {
        color: "#39413B",
        fontSize: 11,
        fontWeight: "700",
    },


    // =======================================================
    // ACTIONS
    // =======================================================

    actions: {
        flexDirection: "row",
        marginTop: 10,
    },

    actionsMobile: {
        marginTop: 7,
    },

    viewButton: {
        flex: 1,

        height: 40,

        borderRadius: 9,

        backgroundColor: "#F1F4F2",

        alignItems: "center",
        justifyContent: "center",

        marginRight: 5,
    },

    mobileActionButton: {
        minHeight: 42,
    },

    viewButtonText: {
        color: "#59615B",
        fontSize: 11,
        fontWeight: "800",
    },

    rejectButton: {
        flex: 1,

        height: 40,

        borderRadius: 9,

        borderWidth: 1,
        borderColor: "#D64545",

        alignItems: "center",
        justifyContent: "center",

        marginHorizontal: 5,
    },

    rejectButtonText: {
        color: "#D64545",
        fontSize: 11,
        fontWeight: "800",
    },

    approveButton: {
        flex: 1,

        height: 40,

        borderRadius: 9,

        backgroundColor: "#1DAB52",

        alignItems: "center",
        justifyContent: "center",

        marginLeft: 5,
    },

    approveButtonText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "900",
    },


    // =======================================================
    // STATUS
    // =======================================================

    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 5,

        borderRadius: 7,
    },

    approvedBadge: {
        backgroundColor: "#EAF7EF",
    },

    pendingBadge: {
        backgroundColor: "#FFF6DC",
    },

    rejectedBadge: {
        backgroundColor: "#FDECEC",
    },

    statusText: {
        fontSize: 8,
        fontWeight: "900",
        textTransform: "capitalize",
    },

    approvedText: {
        color: "#1DAB52",
    },

    pendingText: {
        color: "#B27B00",
    },

    rejectedText: {
        color: "#D64545",
    },


    // =======================================================
    // RECENT USERS
    // =======================================================

    viewAllButton: {
        paddingHorizontal: 11,
        paddingVertical: 7,

        borderRadius: 8,

        backgroundColor: "#EAF7EF",
    },

    viewAllText: {
        color: "#1DAB52",
        fontSize: 10,
        fontWeight: "900",
    },

    userRow: {
        flexDirection: "row",
        alignItems: "center",

        backgroundColor: "#FFFFFF",

        borderRadius: 13,

        padding: 12,

        marginBottom: 8,

        borderWidth: 1,
        borderColor: "#E8ECE9",
    },

    userRowMobile: {
        padding: 11,
    },

    userAvatar: {
        width: 42,
        height: 42,
        borderRadius: 21,

        backgroundColor: "#EAF7EF",

        alignItems: "center",
        justifyContent: "center",
    },

    userAvatarText: {
        color: "#1DAB52",
        fontSize: 15,
        fontWeight: "900",
    },

    userInfo: {
        flex: 1,
        minWidth: 0,

        marginLeft: 11,
        marginRight: 8,
    },

    userName: {
        color: "#343B36",
        fontSize: 12,
        fontWeight: "800",
    },

    userEmail: {
        marginTop: 3,
        color: "#858D87",
        fontSize: 9,
    },

    userPhone: {
        marginTop: 2,
        color: "#959C97",
        fontSize: 9,
    },


    // =======================================================
    // MOBILE LOGOUT
    // =======================================================

    bottomLogout: {
        height: 48,

        borderRadius: 11,

        backgroundColor: "#FFFFFF",

        borderWidth: 1,
        borderColor: "#F0D7D7",

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",

        marginBottom: 20,
    },

    bottomLogoutIcon: {
        color: "#D64545",
        fontSize: 19,
        fontWeight: "900",
        marginRight: 7,
    },

    bottomLogoutText: {
        color: "#D64545",
        fontSize: 12,
        fontWeight: "900",
    },


    // =======================================================
    // FOOTER
    // =======================================================

    footer: {
        alignItems: "center",

        paddingTop: 18,
        paddingBottom: 15,
    },

    footerLogo: {
        width: 34,
        height: 34,
        borderRadius: 17,

        backgroundColor: "#1DAB52",

        alignItems: "center",
        justifyContent: "center",

        marginBottom: 8,
    },

    footerLogoText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "900",
    },

    footerTitle: {
        color: "#626A64",
        fontSize: 11,
        fontWeight: "800",
    },

    footerVersion: {
        marginTop: 3,
        color: "#A0A6A1",
        fontSize: 9,
    },

});