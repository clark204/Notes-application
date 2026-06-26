import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Slider from "@react-native-community/slider";
import { useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NoteEditorRef } from "./NoteEditor";

const FONT_SIZES = [1, 3, 5, 7];

const BG_COLORS = [
    { label: "None", value: "transparent" },
    { label: "Yellow", value: "#FFF9C4" },
    { label: "Green", value: "#C8E6C9" },
    { label: "Blue", value: "#BBDEFB" },
    { label: "Pink", value: "#F8BBD0" },
    { label: "Orange", value: "#FFE0B2" },
    { label: "Purple", value: "#E1BEE7" },
    { label: "Red", value: "#FFCDD2" },
];

type props = {
    isOpen: boolean;
    editorRef: React.RefObject<NoteEditorRef>;
}

export default function TextEditor({ isOpen, editorRef }: props) {
    const [sizeIndex, setSizeIndex] = useState(1);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [showColors, setShowColors] = useState(false);
    const [selectedColor, setSelectedColor] = useState("transparent");

    if (!isOpen) return null;

    const applyBgColor = (color: string) => {
        setSelectedColor(color);
        setShowColors(false);
        const colorValue = color === "transparent" ? "inherit" : color;
        editorRef.current?.commandDOM(`
        (function() {
            if (!window._savedRange) return;
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(window._savedRange);
            document.execCommand('backColor', false, '${colorValue}');
            window._savedRange = null;
        })();
    `);
    };

    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <Pressable
                    style={[styles.button, isBold && styles.activeButton]}
                    onPress={() => { editorRef.current?.bold(); setIsBold(!isBold); }}
                >
                    <FontAwesome name="bold" size={24} color={isBold ? "#CF5C36" : "black"} />
                </Pressable>
                <Pressable
                    style={[styles.button, isItalic && styles.activeButton]}
                    onPress={() => { editorRef.current?.italic(); setIsItalic(!isItalic); }}
                >
                    <FontAwesome name="italic" size={24} color={isItalic ? "#CF5C36" : "black"} />
                </Pressable>
                <Pressable
                    style={[styles.button, isUnderline && styles.activeButton]}
                    onPress={() => { editorRef.current?.underline(); setIsUnderline(!isUnderline); }}
                >
                    <FontAwesome name="underline" size={24} color={isUnderline ? "#CF5C36" : "black"} />
                </Pressable>
                <Pressable
                    style={[styles.button, showColors && styles.activeButton]}
                    onPress={() => {
                        // save selection BEFORE showing panel
                        editorRef.current?.commandDOM(`
            (function() {
                var sel = window.getSelection();
                if (sel && sel.rangeCount > 0) {
                    window._savedRange = sel.getRangeAt(0).cloneRange();
                }
            })();
        `);
                        setShowColors(!showColors);
                    }}
                >
                    <AntDesign name="bg-colors" size={24} color={selectedColor !== "transparent" ? selectedColor : "black"} />
                </Pressable>
            </View>

            {/* Color palette */}
            {showColors && (
                <View style={{
                    borderTopWidth: 1,
                    borderColor: "#DDD1C7",
                    paddingVertical: 10,
                    paddingHorizontal: 10,
                }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                            {BG_COLORS.map((color) => (
                                <Pressable
                                    key={color.value}
                                    onPress={() => applyBgColor(color.value)}
                                    style={{
                                        alignItems: "center",
                                        gap: 4,
                                    }}
                                >
                                    <View style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 100,
                                        backgroundColor: color.value === "transparent" ? "#fff" : color.value,
                                        borderWidth: selectedColor === color.value ? 2.5 : 1,
                                        borderColor: selectedColor === color.value ? "#CF5C36" : "#ccc",
                                    }} >
                                        {color.value === "transparent" && (
                                            <View style={{
                                                position: "absolute",
                                                top: 13,
                                                left: -2,
                                                right: -2,
                                                height: 1.5,
                                                backgroundColor: "#e74c3c",
                                                transform: [{ rotate: "-45deg" }],
                                            }} />
                                        )}
                                    </View>
                                    <Text style={{ fontSize: 9, color: "#888" }}>{color.label}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            )}

            {/* Font size slider */}
            <View style={{
                padding: 10,
                borderTopWidth: 1,
                borderColor: "#DDD1C7",
            }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 12 }}>T <Text style={{ fontSize: 18 }}>T</Text></Text>
                    <Text style={{ fontSize: 12 }}>T <Text style={{ fontSize: 18 }}>T</Text></Text>
                </View>
                <Slider
                    minimumValue={0}
                    maximumValue={3}
                    step={1}
                    value={sizeIndex}
                    onValueChange={(val) => {
                        setSizeIndex(val);
                        editorRef.current?.setFontSize(FONT_SIZES[val]);
                    }}
                    minimumTrackTintColor="#CF5C36"
                    maximumTrackTintColor="#CF5C36"
                    thumbTintColor="#FF9F1C"
                />
            </View>
        </View>
    );
}

const { width } = Dimensions.get("window");
const buttonWidth = width / 4;

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#F8E6C9",
        paddingVertical: 10,
    },
    buttonContainer: {
        flexDirection: "row",
    },
    button: {
        width: buttonWidth,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 15,
    },
    activeButton: {
        borderTopWidth: 2,
        borderTopColor: "#CF5C36",
        backgroundColor: "#f0d4b8",
    },
});