import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";

export default function AdminLoginScreen({ navigation }: any) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email.trim()) {
            Alert.alert("Required", "Please enter admin email.");
            return;
        }

        if (!password.trim()) {
            Alert.alert("Required", "Please enter admin password.");
            return;
        }

        try {
            setLoading(true);

            // We will connect this to your FastAPI endpoint
            const response = await fetch(
                "https://saaathgroww.onrender.com/admin/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        email: email.trim(),
                        password: password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.detail ||
                    data?.message ||
                    "Invalid admin credentials."
                );
            }

            console.log("ADMIN LOGIN RESPONSE:", data);

            Alert.alert(
                "Login Successful",
                "Welcome to Saath Groww Admin Panel."
            );

            // Dashboard will be connected here
            // navigation.replace("AdminDashboard");

        } catch (error: any) {
            console.log("ADMIN LOGIN ERROR:", error);

            Alert.alert(
                "Login Failed",
                error?.message || "Unable to login."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={
                Platform.OS === "ios" ? "padding" : undefined
            }
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.card}>

                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>SG</Text>
                    </View>

                    <Text style={styles.title}>
                        Admin Login
                    </Text>

                    <Text style={styles.subtitle}>
                        Saath Groww Administration
                    </Text>

                    {/* Email */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>
                            Admin Email
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Enter admin email"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    {/* Password */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>
                            Password
                        </Text>

                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Enter admin password"
                                placeholderTextColor="#999"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                            />

                            <TouchableOpacity
                                onPress={() =>
                                    setShowPassword(!showPassword)
                                }
                            >
                                <Text style={styles.showText}>
                                    {showPassword ? "Hide" : "Show"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={[
                            styles.loginButton,
                            loading && styles.disabledButton,
                        ]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.loginButtonText}>
                                Login as Admin
                            </Text>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.securityText}>
                        🔒 Authorized administrators only
                    </Text>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F7F6",
    },

    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 24,
    },

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 24,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: {
            width: 0,
            height: 4,
        },
    },

    logoContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "#1DAB52",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        marginBottom: 18,
    },

    logoText: {
        color: "#FFFFFF",
        fontSize: 25,
        fontWeight: "bold",
    },

    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#1DAB52",
        textAlign: "center",
    },

    subtitle: {
        fontSize: 15,
        color: "#777",
        textAlign: "center",
        marginTop: 6,
        marginBottom: 30,
    },

    inputContainer: {
        marginBottom: 20,
    },

    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },

    input: {
        height: 52,
        borderWidth: 1,
        borderColor: "#D8D8D8",
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 15,
        color: "#222",
        backgroundColor: "#FAFAFA",
    },

    passwordContainer: {
        height: 52,
        borderWidth: 1,
        borderColor: "#D8D8D8",
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 15,
        paddingRight: 12,
        backgroundColor: "#FAFAFA",
    },

    passwordInput: {
        flex: 1,
        fontSize: 15,
        color: "#222",
    },

    showText: {
        color: "#1DAB52",
        fontWeight: "600",
    },

    loginButton: {
        height: 54,
        backgroundColor: "#1DAB52",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 8,
    },

    disabledButton: {
        opacity: 0.7,
    },

    loginButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },

    securityText: {
        textAlign: "center",
        marginTop: 20,
        fontSize: 12,
        color: "#888",
    },
});