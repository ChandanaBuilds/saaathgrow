import { useEffect } from "react";
import { View, Text } from "react-native";

export default function SplashScreen({ navigation }: any) {
    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace("Login");
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Text style={{ fontSize: 24, fontWeight: "bold" }}>
                Saath Groww Delivery
            </Text>
        </View>
    );
}