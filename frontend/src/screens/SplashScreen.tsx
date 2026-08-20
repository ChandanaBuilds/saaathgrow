import React, { useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    StatusBar,
} from "react-native";

export default function SplashScreen({ navigation }: any) {

    useEffect(() => {

        const timer = setTimeout(() => {
            navigation.replace("Login");
        }, 2000);

        return () => clearTimeout(timer);

    }, [navigation]);

    return (
        <View style={styles.container}>

            <StatusBar
                backgroundColor="#FFFDFF"
                barStyle="dark-content"
            />

            <Image
                source={require("../../assets/logo.jpeg")}
                style={styles.logo}
                resizeMode="contain"
            />

            <Text style={styles.appName}>
                Saath Groww
            </Text>

            <Text style={styles.tagline}>
                Groww together, earn together
            </Text>

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#FFFDFF",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
    },

    logo: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },

    appName: {
        fontSize: 34,
        fontWeight: "800",
        color: "#1DAB52",
    },

    tagline: {
        marginTop: 8,
        fontSize: 15,
        color: "#78C4D8",
    },

});