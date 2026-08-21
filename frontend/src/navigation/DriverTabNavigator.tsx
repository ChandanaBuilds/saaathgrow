import React from "react";

import {
    View,
    Text,
    StyleSheet,
} from "react-native";

import {
    createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

import DashboardScreen
    from "../screens/DashboardScreen";

import OrdersScreen
    from "../screens/OrdersScreen";

import WalletScreen
    from "../screens/WalletScreen";

import ProfileScreen
    from "../screens/ProfileScreen";


// =========================================================
// TAB NAVIGATOR
// =========================================================

const Tab =
    createBottomTabNavigator();


// =========================================================
// TAB ICON
// =========================================================

function TabIcon({
    icon,
    label,
    focused,
}: {
    icon: string;
    label: string;
    focused: boolean;
}) {

    return (
        <View style={styles.tabItem}>

            <View
                style={[
                    styles.iconContainer,

                    focused &&
                    styles.activeIconContainer,
                ]}
            >

                <Text
                    style={[
                        styles.icon,

                        focused &&
                        styles.activeIcon,
                    ]}
                >
                    {icon}
                </Text>

            </View>

            <Text
                style={[
                    styles.label,

                    focused &&
                    styles.activeLabel,
                ]}
            >
                {label}
            </Text>

        </View>
    );
}


// =========================================================
// DRIVER TAB NAVIGATOR
// =========================================================

export default function DriverTabNavigator({
    route,
}: any) {

    const user =
        route?.params?.user;


    return (

        <Tab.Navigator

            initialRouteName="DriverHome"

            screenOptions={{

                headerShown: false,

                tabBarShowLabel: false,

                tabBarStyle: styles.tabBar,

                tabBarHideOnKeyboard: true,

            }}
        >

            {/* =================================================
                            HOME
            ================================================= */}

            <Tab.Screen

                name="DriverHome"

                component={DashboardScreen}

                initialParams={{
                    user,
                }}

                options={{

                    tabBarIcon: ({
                        focused,
                    }) => (

                        <TabIcon

                            icon="⌂"

                            label="Home"

                            focused={focused}

                        />

                    ),

                }}

            />


            {/* =================================================
                            ORDERS
            ================================================= */}

            <Tab.Screen

                name="DriverOrders"

                component={OrdersScreen}

                initialParams={{
                    user,
                }}

                options={{

                    tabBarIcon: ({
                        focused,
                    }) => (

                        <TabIcon

                            icon="▣"

                            label="Orders"

                            focused={focused}

                        />

                    ),

                }}

            />


            {/* =================================================
                            WALLET
            ================================================= */}

            <Tab.Screen

                name="DriverWallet"

                component={WalletScreen}

                initialParams={{
                    user,
                }}

                options={{

                    tabBarIcon: ({
                        focused,
                    }) => (

                        <TabIcon

                            icon="₹"

                            label="Wallet"

                            focused={focused}

                        />

                    ),

                }}

            />


            {/* =================================================
                            PROFILE
            ================================================= */}

            <Tab.Screen

                name="DriverProfile"

                component={ProfileScreen}

                initialParams={{
                    user,
                }}

                options={{

                    tabBarIcon: ({
                        focused,
                    }) => (

                        <TabIcon

                            icon="●"

                            label="Profile"

                            focused={focused}

                        />

                    ),

                }}

            />

        </Tab.Navigator>
    );
}


// =========================================================
// STYLES
// =========================================================

const styles =
    StyleSheet.create({

        tabBar: {

            height: 76,

            paddingTop: 7,

            paddingBottom: 7,

            backgroundColor: "#FFFFFF",

            borderTopWidth: 1,

            borderTopColor: "#E9ECEA",

            elevation: 12,

            shadowColor: "#000",

            shadowOpacity: 0.08,

            shadowRadius: 10,

            shadowOffset: {
                width: 0,
                height: -3,
            },

        },


        tabItem: {

            width: 70,

            height: 62,

            justifyContent:
                "center",

            alignItems:
                "center",

        },


        iconContainer: {

            width: 34,

            height: 34,

            borderRadius: 17,

            justifyContent:
                "center",

            alignItems:
                "center",

            marginBottom: 2,

        },


        activeIconContainer: {

            backgroundColor:
                "#E8F7EE",

        },


        icon: {

            fontSize: 20,

            color: "#8C9490",

            fontWeight: "700",

        },


        activeIcon: {

            color: "#1DAB52",

        },


        label: {

            fontSize: 10,

            color: "#8C9490",

            fontWeight: "600",

        },


        activeLabel: {

            color: "#1DAB52",

            fontWeight: "800",

        },

    });