import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type props = {
    noteId: number;
    isPinned: boolean;
    onDelete: () => void;
    onPin: () => void;
    onPress: () => void;
};

export default function NoteDropdown({ isPinned, onDelete, onPin, onPress, children }: props & { children?: React.ReactNode }) {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    return (
        <>
            <Pressable
                style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                onPress={onPress}
                onLongPress={(e) => {
                    const { pageY, pageX } = e.nativeEvent;
                    setPosition({ top: pageY, left: pageX });
                    setVisible(true);
                }}
                delayLongPress={400}
            >
                {children}
            </Pressable>

            <Modal visible={visible} transparent animationType="fade">
                <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
                    <View style={[styles.menu, {
                        top: position.top,
                        left: Math.min(position.left, 220),
                    }]}>
                        <TouchableOpacity style={styles.menuItem} onPress={() => { setVisible(false); onPin(); }}>
                            <FontAwesome name="thumb-tack" size={16} color="#453A49" />
                            <Text style={styles.menuText}>{isPinned ? "Unpin" : "Pin to top"}</Text>
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.menuItem} onPress={() => { setVisible(false); onDelete(); }}>
                            <FontAwesome name="trash" size={16} color="#e74c3c" />
                            <Text style={[styles.menuText, { color: "#e74c3c" }]}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    backdrop: { flex: 1 },
    menu: {
        position: "absolute",
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingVertical: 4,
        minWidth: 180,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10,
    },
    menuItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
    menuText: { fontSize: 15, color: "#333" },
    divider: { height: 0.5, backgroundColor: "#eee", marginHorizontal: 12 },
});