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

const API_URL = "https://saaathgroww.onrender.com";

type DriverTab = "pending" | "approved" | "rejected" | "all";

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

export default function AdminDashboardScreen({ navigation, route }: any) {
    const token = route?.params?.access_token;

    const [admin, setAdmin] = useState<AdminMe | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [pendingDrivers, setPendingDrivers] = useState<AdminUser[]>([]);
    const [approvedDrivers, setApprovedDrivers] = useState<AdminUser[]>([]);
    const [rejectedDrivers, setRejectedDrivers] = useState<AdminUser[]>([]);
    const [activeTab, setActiveTab] = useState<DriverTab>("pending");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const headers = () => ({
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
    });

    const parse = async (response: Response): Promise<ApiResponse> => {
        const raw = await response.text();
        if (!raw) return {};
        try { return JSON.parse(raw); } catch { return { message: raw }; }
    };

    const authError = (status: number) => {
        if (status !== 401) return false;
        Alert.alert("Session Expired", "Please login again.", [
            { text: "OK", onPress: () => navigation.replace("AdminLogin") },
        ]);
        return true;
    };

    const listFrom = (data: ApiResponse) => {
        if (Array.isArray(data.users)) return data.users;
        if (Array.isArray(data.drivers)) return data.drivers;
        if (Array.isArray(data.data)) return data.data;
        return [];
    };

    const get = async (path: string) => {
        const response = await fetch(`${API_URL}${path}`, {
            method: "GET",
            headers: headers(),
        });
        const data = await parse(response);
        console.log(path, response.status, data);
        if (authError(response.status)) throw new Error("SESSION_EXPIRED");
        if (!response.ok) {
            throw new Error(data.detail || data.message || `Request failed: ${response.status}`);
        }
        return data;
    };

    const loadAdmin = async () => {
        const data = await get("/admin/me");
        setAdmin(data.admin || data.user || (data as AdminMe));
    };

    const loadUsers = async () => setUsers(listFrom(await get("/admin/all-users")));
    const loadPending = async () => setPendingDrivers(listFrom(await get("/admin/pending-drivers")));
    const loadApproved = async () => setApprovedDrivers(listFrom(await get("/admin/approved-drivers")));
    const loadRejected = async () => setRejectedDrivers(listFrom(await get("/admin/rejected-drivers")));

    const loadDashboard = useCallback(async () => {
        if (!token) {
            Alert.alert("Authentication Error", "Admin login token is missing.", [
                { text: "OK", onPress: () => navigation.replace("AdminLogin") },
            ]);
            return;
        }
        try {
            setLoading(true);
            await Promise.all([loadAdmin(), loadUsers(), loadPending(), loadApproved(), loadRejected()]);
        } catch (error: any) {
            if (error?.message !== "SESSION_EXPIRED") {
                Alert.alert("Dashboard Error", error?.message || "Unable to load dashboard.");
            }
        } finally { setLoading(false); }
    }, [token]);

    useEffect(() => { loadDashboard(); }, [loadDashboard]);

    const refresh = async () => {
        try {
            setRefreshing(true);
            await Promise.all([loadAdmin(), loadUsers(), loadPending(), loadApproved(), loadRejected()]);
        } catch (error: any) {
            if (error?.message !== "SESSION_EXPIRED") Alert.alert("Refresh Failed", error?.message || "Unable to refresh.");
        } finally { setRefreshing(false); }
    };

    const approveDriver = async (id: number) => {
        try {
            setActionLoading(id);
            const response = await fetch(`${API_URL}/admin/approve-driver/${id}`, {
                method: "POST", headers: headers(),
            });
            const data = await parse(response);
            console.log("APPROVE DRIVER", response.status, data);
            if (authError(response.status)) return;
            if (!response.ok) throw new Error(data.detail || data.message || "Unable to approve driver.");
            Alert.alert("Driver Approved", data.message || "Driver approved successfully.");
            await Promise.all([loadUsers(), loadPending(), loadApproved(), loadRejected()]);
            setActiveTab("approved");
        } catch (error: any) {
            Alert.alert("Approval Failed", error?.message || "Unable to approve driver.");
        } finally { setActionLoading(null); }
    };

    const rejectDriver = async (id: number) => {
        try {
            setActionLoading(id);
            const response = await fetch(`${API_URL}/admin/reject-driver/${id}`, {
                method: "POST", headers: headers(),
            });
            const data = await parse(response);
            console.log("REJECT DRIVER", response.status, data);
            if (authError(response.status)) return;
            if (!response.ok) throw new Error(data.detail || data.message || "Unable to reject driver.");
            Alert.alert("Driver Rejected", data.message || "Driver rejected successfully.");
            await Promise.all([loadUsers(), loadPending(), loadApproved(), loadRejected()]);
            setActiveTab("rejected");
        } catch (error: any) {
            Alert.alert("Rejection Failed", error?.message || "Unable to reject driver.");
        } finally { setActionLoading(null); }
    };

    const viewDriver = async (id: number) => {
        try {
            const data = await get(`/admin/driver/${id}`);
            const responseData: any = data;
            const driver: any = responseData.user || responseData.driver || responseData.data || responseData;
            Alert.alert(driver.full_name || "Driver Details", [
                `Email: ${driver.email || "N/A"}`,
                `Phone: ${driver.phone_number || "N/A"}`,
                `Vehicle: ${driver.vehicle_type || "N/A"}`,
                `Vehicle No: ${driver.vehicle_number || "N/A"}`,
                `City: ${driver.city || "N/A"}`,
                `State: ${driver.state || "N/A"}`,
                `Status: ${driver.status || "N/A"}`,
                `Email Verified: ${driver.email_verified ? "Yes" : "No"}`,
                `Approved: ${driver.is_approved ? "Yes" : "No"}`,
            ].join("\n"));
        } catch (error: any) {
            if (error?.message !== "SESSION_EXPIRED") Alert.alert("Driver Details", error?.message || "Unable to load details.");
        }
    };

    const logout = () => Alert.alert("Logout", "Are you sure you want to logout?", [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: () => navigation.replace("AdminLogin") },
    ]);

    const activeDrivers = activeTab === "pending" ? pendingDrivers
        : activeTab === "approved" ? approvedDrivers
            : activeTab === "rejected" ? rejectedDrivers
                : users;

    const tabTitle = activeTab === "pending" ? "Pending Driver Approvals"
        : activeTab === "approved" ? "Approved Drivers"
            : activeTab === "rejected" ? "Rejected Drivers" : "All Users";

    const tabSubtitle = activeTab === "pending" ? "Review and approve new drivers"
        : activeTab === "approved" ? "Drivers approved by administration"
            : activeTab === "rejected" ? "Drivers rejected by administration"
                : "All registered Saath Groww users";

    if (loading) return (
        <SafeAreaView style={styles.loadingContainer}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7F6" />
            <View style={styles.logo}><Text style={styles.logoText}>SG</Text></View>
            <ActivityIndicator size="large" color="#1DAB52" />
            <Text style={styles.loadingText}>Loading Admin Dashboard...</Text>
        </SafeAreaView>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7F6" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={["#1DAB52"]} />}
            >
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.logoSmall}><Text style={styles.logoText}>SG</Text></View>
                        <View style={styles.headerText}>
                            <Text style={styles.welcome}>Welcome Admin</Text>
                            <Text style={styles.email}>{admin?.email || "admin@saathgroww.com"}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.logout} onPress={logout}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.title}>Admin Dashboard</Text>
                <Text style={styles.subtitle}>Manage Saath Groww users and drivers</Text>

                <View style={styles.statsGrid}>
                    <StatCard icon="👥" value={users.length} label="Total Users" bg="#E8F7EE" onPress={() => setActiveTab("all")} />
                    <StatCard icon="⏳" value={pendingDrivers.length} label="Pending Drivers" bg="#FFF6DD" onPress={() => setActiveTab("pending")} />
                    <StatCard icon="✓" value={approvedDrivers.length} label="Approved Drivers" bg="#E8F7EE" onPress={() => setActiveTab("approved")} />
                    <StatCard icon="!" value={rejectedDrivers.length} label="Rejected Drivers" bg="#FDECEC" onPress={() => setActiveTab("rejected")} />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Driver Management</Text>
                    <Text style={styles.sectionSubtitle}>View, approve and manage driver applications</Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
                        <Tab label={`Pending ${pendingDrivers.length}`} active={activeTab === "pending"} onPress={() => setActiveTab("pending")} />
                        <Tab label={`Approved ${approvedDrivers.length}`} active={activeTab === "approved"} onPress={() => setActiveTab("approved")} />
                        <Tab label={`Rejected ${rejectedDrivers.length}`} active={activeTab === "rejected"} onPress={() => setActiveTab("rejected")} />
                        <Tab label={`All ${users.length}`} active={activeTab === "all"} onPress={() => setActiveTab("all")} />
                    </ScrollView>

                    <View style={styles.listHeader}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.listTitle}>{tabTitle}</Text>
                            <Text style={styles.listSubtitle}>{tabSubtitle}</Text>
                        </View>
                        <View style={styles.badge}><Text style={styles.badgeText}>{activeDrivers.length}</Text></View>
                    </View>

                    {activeDrivers.length === 0 ? (
                        <View style={styles.empty}>
                            <View style={styles.emptyIcon}><Text style={styles.emptyIconText}>{activeTab === "pending" ? "✓" : "—"}</Text></View>
                            <Text style={styles.emptyTitle}>No Records Found</Text>
                            <Text style={styles.emptyText}>There are no records in this section.</Text>
                        </View>
                    ) : activeDrivers.map((driver, index) => (
                        <DriverCard
                            key={driver.id ?? `${activeTab}-${index}`}
                            driver={driver}
                            tab={activeTab}
                            actionLoading={actionLoading}
                            onView={viewDriver}
                            onApprove={approveDriver}
                            onReject={rejectDriver}
                        />
                    ))}
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionRow}>
                        <View>
                            <Text style={styles.sectionTitle}>Recent Users</Text>
                            <Text style={styles.sectionSubtitle}>Registered Saath Groww users</Text>
                        </View>
                        <TouchableOpacity style={styles.viewAll} onPress={() => setActiveTab("all")}>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {users.slice(0, 10).map((user, index) => (
                        <View key={user.id ?? `user-${index}`} style={styles.userRow}>
                            <View style={styles.userAvatar}>
                                <Text style={styles.userAvatarText}>{(user.full_name || "U").charAt(0).toUpperCase()}</Text>
                            </View>
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{user.full_name || "Unnamed User"}</Text>
                                <Text style={styles.userEmail}>{user.email || "No email"}</Text>
                                {user.phone_number ? <Text style={styles.userPhone}>{user.phone_number}</Text> : null}
                            </View>
                            <StatusBadge status={user.status || (user.is_approved ? "approved" : "pending")} approved={!!user.is_approved} />
                        </View>
                    ))}
                    {users.length === 0 && <View style={styles.empty}><Text style={styles.emptyTitle}>No Users Found</Text></View>}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Saath Groww Admin Panel</Text>
                    <Text style={styles.footerVersion}>Version 2.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function StatCard({ icon, value, label, bg, onPress }: { icon: string; value: number; label: string; bg: string; onPress: () => void }) {
    return <TouchableOpacity activeOpacity={0.85} style={styles.statCard} onPress={onPress}>
        <View style={[styles.iconCircle, { backgroundColor: bg }]}><Text style={styles.iconText}>{icon}</Text></View>
        <Text style={styles.statNumber}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>;
}

function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
    return <TouchableOpacity onPress={onPress} style={[styles.tab, active && styles.tabActive]}>
        <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>;
}

function DriverCard({ driver, tab, actionLoading, onView, onApprove, onReject }: {
    driver: AdminUser; tab: DriverTab; actionLoading: number | null;
    onView: (id: number) => void; onApprove: (id: number) => void; onReject: (id: number) => void;
}) {
    const hasId = driver.id !== undefined;
    return <View style={styles.driverCard}>
        <View style={styles.driverTop}>
            <View style={styles.driverAvatar}><Text style={styles.avatarText}>{(driver.full_name || "D").charAt(0).toUpperCase()}</Text></View>
            <View style={styles.driverInfo}>
                <View style={styles.nameRow}>
                    <Text style={styles.driverName}>{driver.full_name || "Unnamed Driver"}</Text>
                    <StatusBadge status={driver.status || (driver.is_approved ? "approved" : "pending")} approved={!!driver.is_approved} />
                </View>
                <Text style={styles.driverEmail}>{driver.email || "No email"}</Text>
                {driver.phone_number ? <Text style={styles.driverPhone}>{driver.phone_number}</Text> : null}
            </View>
        </View>
        <View style={styles.detailsRow}>
            <Detail label="Vehicle" value={driver.vehicle_type || "Not provided"} />
            <Detail label="Vehicle No." value={driver.vehicle_number || "Not provided"} />
        </View>
        <View style={styles.detailsRow}>
            <Detail label="Location" value={[driver.city, driver.state].filter(Boolean).join(", ") || "Not provided"} />
            <Detail label="Email" value={driver.email_verified ? "Verified" : "Not verified"} />
        </View>
        {hasId && <View style={styles.actions}>
            <TouchableOpacity style={styles.viewButton} disabled={actionLoading !== null} onPress={() => onView(driver.id!)}>
                <Text style={styles.viewText}>View Details</Text>
            </TouchableOpacity>
            {tab === "pending" && <>
                <TouchableOpacity style={styles.rejectButton} disabled={actionLoading !== null} onPress={() => onReject(driver.id!)}>
                    <Text style={styles.rejectText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.approveButton} disabled={actionLoading !== null} onPress={() => onApprove(driver.id!)}>
                    {actionLoading === driver.id ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.approveText}>Approve</Text>}
                </TouchableOpacity>
            </>}
        </View>}
    </View>;
}

function Detail({ label, value }: { label: string; value: string }) {
    return <View style={styles.detail}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue} numberOfLines={2}>{value}</Text></View>;
}

function StatusBadge({ status, approved }: { status: string; approved: boolean }) {
    const normalized = status.toLowerCase();
    const isApproved = approved || normalized === "approved";
    const isRejected = normalized === "rejected";
    const label = isApproved ? "Approved" : isRejected ? "Rejected" : normalized.replace(/_/g, " ");
    return <View style={[styles.statusBadge, isApproved ? styles.approvedBadge : isRejected ? styles.rejectedBadge : styles.pendingBadge]}>
        <Text style={[styles.statusText, isApproved ? styles.approvedText : isRejected ? styles.rejectedText : styles.pendingText]}>{label}</Text>
    </View>;
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F5F7F6" },
    loadingContainer: { flex: 1, backgroundColor: "#F5F7F6", justifyContent: "center", alignItems: "center" },
    logo: { width: 62, height: 62, borderRadius: 31, backgroundColor: "#1DAB52", justifyContent: "center", alignItems: "center", marginBottom: 18 },
    logoSmall: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#1DAB52", justifyContent: "center", alignItems: "center" },
    logoText: { color: "#FFF", fontSize: 17, fontWeight: "900" },
    loadingText: { marginTop: 14, fontSize: 14, color: "#666" },
    scrollContent: { padding: 20, paddingBottom: 50 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 25 },
    headerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
    headerText: { marginLeft: 10, flex: 1 },
    welcome: { fontSize: 20, fontWeight: "800", color: "#1DAB52" },
    email: { marginTop: 3, fontSize: 11, color: "#777" },
    logout: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E1E1E1" },
    logoutText: { color: "#D64545", fontSize: 12, fontWeight: "700" },
    title: { fontSize: 28, fontWeight: "800", color: "#222" },
    subtitle: { marginTop: 5, marginBottom: 20, fontSize: 13, color: "#777" },
    statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 25 },
    statCard: { width: "48%", backgroundColor: "#FFF", borderRadius: 16, padding: 16, marginBottom: 14, elevation: 3, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
    iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", marginBottom: 10 },
    iconText: { fontSize: 19, fontWeight: "800", color: "#333" },
    statNumber: { fontSize: 25, fontWeight: "800", color: "#222" },
    statLabel: { marginTop: 3, fontSize: 12, color: "#777" },
    section: { marginBottom: 26 },
    sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 13 },
    sectionTitle: { fontSize: 19, fontWeight: "800", color: "#222" },
    sectionSubtitle: { marginTop: 4, fontSize: 12, color: "#888" },
    viewAll: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 8, backgroundColor: "#E8F7EE" },
    viewAllText: { color: "#1DAB52", fontSize: 11, fontWeight: "800" },
    tabs: { paddingBottom: 5, paddingRight: 8 },
    tab: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E2E5E3", marginRight: 8 },
    tabActive: { backgroundColor: "#1DAB52", borderColor: "#1DAB52" },
    tabText: { color: "#666", fontSize: 12, fontWeight: "700" },
    tabTextActive: { color: "#FFF" },
    listHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 17, marginBottom: 13 },
    listTitle: { fontSize: 17, fontWeight: "800", color: "#222" },
    listSubtitle: { marginTop: 3, fontSize: 11, color: "#888" },
    badge: { minWidth: 32, height: 32, paddingHorizontal: 8, borderRadius: 16, backgroundColor: "#1DAB52", justifyContent: "center", alignItems: "center" },
    badgeText: { color: "#FFF", fontSize: 12, fontWeight: "800" },
    empty: { backgroundColor: "#FFF", borderRadius: 16, padding: 30, alignItems: "center" },
    emptyIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#E8F7EE", justifyContent: "center", alignItems: "center", marginBottom: 12 },
    emptyIconText: { color: "#1DAB52", fontSize: 25, fontWeight: "900" },
    emptyTitle: { fontSize: 16, fontWeight: "700", color: "#333", textAlign: "center" },
    emptyText: { marginTop: 6, textAlign: "center", fontSize: 12, color: "#888" },
    driverCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 17, marginBottom: 13, elevation: 3, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
    driverTop: { flexDirection: "row", alignItems: "center" },
    driverAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#1DAB52", justifyContent: "center", alignItems: "center" },
    avatarText: { color: "#FFF", fontSize: 19, fontWeight: "800" },
    driverInfo: { flex: 1, marginLeft: 12 },
    nameRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    driverName: { flex: 1, fontSize: 15, fontWeight: "800", color: "#222", marginRight: 7 },
    driverEmail: { marginTop: 3, fontSize: 11, color: "#777" },
    driverPhone: { marginTop: 3, fontSize: 11, color: "#777" },
    detailsRow: { flexDirection: "row", marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#EEE" },
    detail: { flex: 1, paddingRight: 8 },
    detailLabel: { fontSize: 10, color: "#999", marginBottom: 4 },
    detailValue: { fontSize: 12, fontWeight: "600", color: "#333" },
    actions: { flexDirection: "row", marginTop: 16 },
    viewButton: { flex: 1, height: 42, borderRadius: 10, backgroundColor: "#F1F4F2", justifyContent: "center", alignItems: "center", marginRight: 5 },
    viewText: { color: "#555", fontSize: 12, fontWeight: "700" },
    rejectButton: { flex: 1, height: 42, borderRadius: 10, borderWidth: 1, borderColor: "#D64545", justifyContent: "center", alignItems: "center", marginHorizontal: 5 },
    rejectText: { color: "#D64545", fontSize: 13, fontWeight: "700" },
    approveButton: { flex: 1, height: 42, borderRadius: 10, backgroundColor: "#1DAB52", justifyContent: "center", alignItems: "center", marginLeft: 5 },
    approveText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
    statusBadge: { alignSelf: "center", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 },
    approvedBadge: { backgroundColor: "#E8F7EE" },
    pendingBadge: { backgroundColor: "#FFF6DD" },
    rejectedBadge: { backgroundColor: "#FDECEC" },
    statusText: { fontSize: 9, fontWeight: "800", textTransform: "capitalize" },
    approvedText: { color: "#1DAB52" },
    pendingText: { color: "#B27B00" },
    rejectedText: { color: "#D64545" },
    userRow: { backgroundColor: "#FFF", borderRadius: 14, padding: 13, marginBottom: 9, flexDirection: "row", alignItems: "center" },
    userAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#E8F7EE", justifyContent: "center", alignItems: "center" },
    userAvatarText: { color: "#1DAB52", fontSize: 16, fontWeight: "800" },
    userInfo: { flex: 1, marginLeft: 11, marginRight: 7 },
    userName: { fontSize: 13, fontWeight: "700", color: "#333" },
    userEmail: { marginTop: 3, fontSize: 10, color: "#888" },
    userPhone: { marginTop: 2, fontSize: 10, color: "#888" },
    footer: { alignItems: "center", paddingVertical: 20 },
    footerText: { fontSize: 13, fontWeight: "700", color: "#777" },
    footerVersion: { marginTop: 4, fontSize: 11, color: "#AAA" },
});
