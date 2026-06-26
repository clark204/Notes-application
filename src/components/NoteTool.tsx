import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";

type props = {
    onAddCheckBox () : void,
    setTextEditor (val: boolean) : void,
    textEditor : boolean,
    showReminder: boolean,
    setShowReminder (val: boolean) : void
}

export default function NoteTool({onAddCheckBox, setTextEditor, textEditor, showReminder, setShowReminder} : props) {
    return (
        <View style={styles.container}>
            <Pressable onPress={() => setTextEditor(!textEditor)} style={({ pressed }) => [styles.button, { opacity: pressed ? 0.5 : 1 }]}>
                {({ pressed }) => (
                    <Text style={styles.boldT}>T</Text>
                )}
            </Pressable>
            <Pressable onPress={onAddCheckBox} style={({ pressed }) => [styles.button, { opacity: pressed ? 0.5 : 1 }]}>
                <FontAwesome name="check-circle-o" size={26} />
            </Pressable>
            <Pressable onPress={() => setShowReminder(!showReminder)} style={({ pressed }) => [styles.button, { opacity: pressed ? 0.5 : 1 }]}>
                <FontAwesome name="clock-o" size={26} />
            </Pressable>
        </View>
    );
}

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
        borderTopWidth: 1,
    },
    boldT: {
        fontSize: 24,
        fontWeight: "bold",
    },
    button : {
        width: width / 3,
        paddingVertical: 10,
        alignItems: "center"
    }
});1