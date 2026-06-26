import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type MenuItem = {
    icon: string;
    label: string;
    onPress: () => void;
    danger?: boolean;
};

type props = {
    items: MenuItem[];
};

export default function DropdownMenu({ items }: props) {
    const [visible, setVisible] = useState(false);

    return (
        <>
            <Pressable style={styles.trigger} onPress={() => setVisible(true)}>
                <FontAwesome name="ellipsis-v" size={24} />
            </Pressable>

            <Modal visible={visible} transparent animationType="fade">
                {/* tap outside to close */}
                <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
                    <View style={styles.menu}>
                        {items.map((item, index) => (
                            <View key={index}>
                                {index > 0 && <View style={styles.divider} />}
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => {
                                        setVisible(false);
                                        item.onPress();
                                    }}
                                >
                                    <FontAwesome
                                        name={item.icon as any}
                                        size={16}
                                        color={item.danger ? "#e74c3c" : "#333"}
                                    />
                                    <Text style={[styles.menuText, item.danger && { color: "#e74c3c" }]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    trigger: {
        width: 30,
        height: 30,
        alignItems: "center",
        justifyContent: "center",
    },
    backdrop: {
        flex: 1,
        paddingTop: 80,
        paddingRight: 16,
        alignItems: "flex-end",
    },
    menu: {
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingVertical: 4,
        minWidth: 180,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 8,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    menuText: {
        fontSize: 15,
        color: "#333",
    },
    divider: {
        height: 0.5,
        backgroundColor: "#eee",
        marginHorizontal: 12,
    },
});