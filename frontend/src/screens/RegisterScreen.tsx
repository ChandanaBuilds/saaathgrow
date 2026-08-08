import { useEffect } from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    StatusBar,
} from "react-native";

export default function SplashScreen({ navigation }: any) {
    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace("Login");
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

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

            <Text style={styles.title}>
                Saath Groww
            </Text>

            <Text style={styles.subtitle}>
                Delivery Partner App
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
    },

    logo: {
        width: 150,
        height: 150,
        marginBottom: 25,
    },

    title: {
        fontSize: 32,
        fontWeight: "800",
        color: "#1DAB52",
    },

    subtitle: {
        marginTop: 10,
        fontSize: 16,
        color: "#78C4D8",
    },
});