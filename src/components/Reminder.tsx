import { colors } from "@/styles/global";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type props = {
    setShowReminder(val: boolean): void;
    onSave(date: Date): void
}

export default function Reminder({ setShowReminder, onSave }: props) {
    const [date, setDate] = useState(new Date());
    const [showDate, setShowDate] = useState(false);
    const [showTime, setShowTime] = useState(false);

    const formatDate = (d: Date) =>
        d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

    const formatTime = (d: Date) =>
        d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

    return (
        <View style={styles.overlay}>
            {/* Date Picker */}
            {showDate && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="calendar"
                    onValueChange={(_event, selected) => {
                        setShowDate(false);
                        if (selected) setDate(selected);
                    }}
                    onDismiss={() => setShowDate(false)}
                />
            )}

            {/* Time Picker */}
            {showTime && (
                <DateTimePicker
                    value={date}
                    mode="time"
                    display="clock"
                    onValueChange={(_event, selected) => {
                        setShowTime(false);
                        if (selected) setDate(selected);
                    }}
                    onDismiss={() => setShowTime(false)}
                />
            )}

            {/* Header */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <Pressable style={styles.button} onPress={() => setShowReminder(false)}>
                        <FontAwesome name="chevron-left" size={24} />
                    </Pressable>
                    <Text style={{ fontSize: 18 }}>Set Reminder</Text>
                </View>
                <Pressable style={styles.button} onPress={() => {
                    onSave(date);
                    setShowReminder(false);
                }}>
                    <FontAwesome name="check" size={24} color="#E0CA3C" />
                </Pressable>
            </View>

            {/* Date Button */}
            <Pressable style={styles.dtButton} onPress={() => setShowDate(true)}>
                <Text style={{ fontSize: 16 }}>Date</Text>
                <Text style={{ fontSize: 12, color: colors.mutedText }}>{formatDate(date)}</Text>
            </Pressable>

            {/* Time Button */}
            <Pressable style={styles.dtButton} onPress={() => setShowTime(true)}>
                <Text style={{ fontSize: 16 }}>Time</Text>
                <Text style={{ fontSize: 12, color: colors.mutedText }}>{formatTime(date)}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.background,
        paddingVertical: 40,
        zIndex: 20,
        gap: 5,
    },
    button: {
        height: 40,
        width: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    dtButton: {
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
});