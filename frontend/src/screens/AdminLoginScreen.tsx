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


/*
=========================================================
BACKEND URL
=========================================================
*/

const API_URL =
    "https://saaathgrow.onrender.com";


export default function AdminLoginScreen({
    navigation,
}: any) {

    const [email, setEmail] = useState("");

    const [password, setPassword] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [showPassword, setShowPassword] =
        useState(false);


    /*
    =====================================================
    ADMIN LOGIN
    =====================================================
    */

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

            const API_URL =
                "https://saaathgrow.onrender.com";

            const loginUrl =
                `${API_URL}/admin/login`;

            console.log("=================================");
            console.log("ADMIN LOGIN REQUEST");
            console.log("URL:", loginUrl);
            console.log("EMAIL:", email.trim());
            console.log("=================================");

            const response = await fetch(
                loginUrl,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },

                    body: JSON.stringify({
                        email: email.trim(),
                        password: password,
                    }),
                }
            );

            console.log(
                "ADMIN LOGIN STATUS:",
                response.status
            );

            const responseText =
                await response.text();

            console.log(
                "ADMIN LOGIN RAW RESPONSE:",
                responseText
            );

            let data: any = {};

            try {
                data = responseText
                    ? JSON.parse(responseText)
                    : {};
            } catch {
                data = {
                    message: responseText
                };
            }

            if (!response.ok) {

                throw new Error(
                    data?.detail ||
                    data?.message ||
                    `Login failed with status ${response.status}`
                );
            }

            console.log(
                "ADMIN LOGIN SUCCESS:",
                data
            );
            console.log(
                "ADMIN LOGIN SUCCESS:",
                data
            );

            navigation.replace(
                "AdminDashboard",
                {
                    access_token:
                        data.access_token,
                }
            );
            /*
             * Later we will do:
             *
             * navigation.replace("AdminDashboard");
             *
             * after creating the admin dashboard.
             */

        } catch (error: any) {

            console.log(
                "================================="
            );

            console.log(
                "ADMIN LOGIN ERROR:",
                error
            );

            console.log(
                "ERROR MESSAGE:",
                error?.message
            );

            console.log(
                "================================="
            );

            Alert.alert(
                "Login Failed",
                error?.message ||
                "Unable to connect to the server."
            );

        } finally {

            setLoading(false);

        }
    };


    /*
    =====================================================
    UI
    =====================================================
    */

    return (

        <KeyboardAvoidingView

            style={styles.container}

            behavior={
                Platform.OS === "ios"
                    ? "padding"
                    : undefined
            }

        >

            <ScrollView

                contentContainerStyle={
                    styles.scrollContainer
                }

                keyboardShouldPersistTaps="handled"

            >

                <View style={styles.card}>


                    {/* =================================
                        LOGO
                    ================================= */}

                    <View
                        style={
                            styles.logoContainer
                        }
                    >

                        <Text
                            style={
                                styles.logoText
                            }
                        >
                            SG
                        </Text>

                    </View>


                    {/* =================================
                        TITLE
                    ================================= */}

                    <Text
                        style={styles.title}
                    >
                        Admin Login
                    </Text>


                    <Text
                        style={styles.subtitle}
                    >
                        Saath Groww Administration
                    </Text>


                    {/* =================================
                        EMAIL
                    ================================= */}

                    <View
                        style={
                            styles.inputContainer
                        }
                    >

                        <Text
                            style={styles.label}
                        >
                            Admin Email
                        </Text>


                        <TextInput

                            style={styles.input}

                            placeholder="Enter admin email"

                            placeholderTextColor="#999"

                            value={email}

                            onChangeText={
                                setEmail
                            }

                            keyboardType="email-address"

                            autoCapitalize="none"

                            autoCorrect={false}

                            editable={!loading}

                        />

                    </View>


                    {/* =================================
                        PASSWORD
                    ================================= */}

                    <View
                        style={
                            styles.inputContainer
                        }
                    >

                        <Text
                            style={styles.label}
                        >
                            Password
                        </Text>


                        <View
                            style={
                                styles.passwordContainer
                            }
                        >

                            <TextInput

                                style={
                                    styles.passwordInput
                                }

                                placeholder=
                                "Enter admin password"

                                placeholderTextColor=
                                "#999"

                                value={
                                    password
                                }

                                onChangeText={
                                    setPassword
                                }

                                secureTextEntry={
                                    !showPassword
                                }

                                autoCapitalize="none"

                                autoCorrect={false}

                                editable={!loading}

                            />


                            <TouchableOpacity

                                onPress={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }

                                disabled={loading}

                            >

                                <Text
                                    style={
                                        styles.showText
                                    }
                                >

                                    {
                                        showPassword
                                            ? "Hide"
                                            : "Show"
                                    }

                                </Text>

                            </TouchableOpacity>

                        </View>

                    </View>


                    {/* =================================
                        LOGIN BUTTON
                    ================================= */}

                    <TouchableOpacity

                        style={[

                            styles.loginButton,

                            loading &&
                            styles.disabledButton,

                        ]}

                        onPress={
                            handleLogin
                        }

                        disabled={
                            loading
                        }

                    >

                        {loading ? (

                            <ActivityIndicator
                                color="#FFFFFF"
                            />

                        ) : (

                            <Text
                                style={
                                    styles.loginButtonText
                                }
                            >
                                Login as Admin
                            </Text>

                        )}

                    </TouchableOpacity>


                    {/* =================================
                        SECURITY MESSAGE
                    ================================= */}

                    <Text
                        style={
                            styles.securityText
                        }
                    >
                        🔒 Authorized administrators only
                    </Text>


                </View>

            </ScrollView>

        </KeyboardAvoidingView>

    );

}


/*
=========================================================
STYLES
=========================================================
*/

const styles = StyleSheet.create({

    container: {

        flex: 1,

        backgroundColor:
            "#F5F7F6",

    },


    scrollContainer: {

        flexGrow: 1,

        justifyContent:
            "center",

        padding: 24,

    },


    card: {

        backgroundColor:
            "#FFFFFF",

        borderRadius: 20,

        padding: 24,

        elevation: 5,

        shadowColor:
            "#000000",

        shadowOpacity:
            0.08,

        shadowRadius:
            10,

        shadowOffset: {

            width: 0,

            height: 4,

        },

    },


    logoContainer: {

        width: 70,

        height: 70,

        borderRadius: 35,

        backgroundColor:
            "#1DAB52",

        justifyContent:
            "center",

        alignItems:
            "center",

        alignSelf:
            "center",

        marginBottom: 18,

    },


    logoText: {

        color:
            "#FFFFFF",

        fontSize: 25,

        fontWeight:
            "bold",

    },


    title: {

        fontSize: 28,

        fontWeight:
            "700",

        color:
            "#1DAB52",

        textAlign:
            "center",

    },


    subtitle: {

        fontSize: 15,

        color:
            "#777777",

        textAlign:
            "center",

        marginTop: 6,

        marginBottom: 30,

    },


    inputContainer: {

        marginBottom: 20,

    },


    label: {

        fontSize: 14,

        fontWeight:
            "600",

        color:
            "#333333",

        marginBottom: 8,

    },


    input: {

        height: 52,

        borderWidth: 1,

        borderColor:
            "#D8D8D8",

        borderRadius: 10,

        paddingHorizontal: 15,

        fontSize: 15,

        color:
            "#222222",

        backgroundColor:
            "#FAFAFA",

    },


    passwordContainer: {

        height: 52,

        borderWidth: 1,

        borderColor:
            "#D8D8D8",

        borderRadius: 10,

        flexDirection:
            "row",

        alignItems:
            "center",

        paddingLeft: 15,

        paddingRight: 12,

        backgroundColor:
            "#FAFAFA",

    },


    passwordInput: {

        flex: 1,

        fontSize: 15,

        color:
            "#222222",

    },


    showText: {

        color:
            "#1DAB52",

        fontWeight:
            "600",

    },


    loginButton: {

        height: 54,

        backgroundColor:
            "#1DAB52",

        borderRadius: 12,

        justifyContent:
            "center",

        alignItems:
            "center",

        marginTop: 8,

    },


    disabledButton: {

        opacity: 0.7,

    },


    loginButtonText: {

        color:
            "#FFFFFF",

        fontSize: 16,

        fontWeight:
            "700",

    },


    securityText: {

        textAlign:
            "center",

        marginTop: 20,

        fontSize: 12,

        color:
            "#888888",

    },

});