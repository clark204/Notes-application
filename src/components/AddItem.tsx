import { saveNote, updateNote } from "@/db/database";
import { colors } from "@/styles/global";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Animated, Keyboard, KeyboardEvent, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NoteEditor, { NoteEditorRef } from "./NoteEditor";
import NoteTool from "./NoteTool";
import Reminder from "./Reminder";
import TextEditor from "./TextEditor";

type Note = {
    id: number,
    title: string,
    content: string,
    reminder: string | null
}

export default function AddItem({ onClose, note }: { onClose(): void, note?: Note }) {
    const [title, setTitle] = useState(note?.title || "");
    const [content, setContent] = useState(note?.content || "");
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [textEditor, setTextEditor] = useState(false);
    const [showReminder, setShowReminder] = useState(false);
    const [reminderDate, setReminderDate] = useState<Date | null>(note?.reminder ? new Date(note.reminder) : null);

    const editorRef = useRef<NoteEditorRef>(null) as RefObject<NoteEditorRef>;
    const slideAnim = useRef(new Animated.Value(800)).current;

    useEffect(() => {
        const showSub = Keyboard.addListener("keyboardDidShow", (e: KeyboardEvent) => {
            setKeyboardHeight(e.endCoordinates.height);
            setKeyboardVisible(true);
        });

        const hideSub = Keyboard.addListener("keyboardDidHide", () => {
            setKeyboardHeight(0);
            setKeyboardVisible(false);
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);
    const opacity = slideAnim.interpolate({
        inputRange: [0, 800],
        outputRange: [1, 0],
    });

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();

        if (note?.content) {
            setTimeout(() => {
                editorRef.current?.loadContent(note.content);
            }, 400);
        }
    }, []);

    const handleClose = () => {
        Animated.timing(slideAnim, {
            toValue: 800,
            duration: 300,
            useNativeDriver: true,
        }).start(() => onClose());
    };

    const handleSave = async () => {
        const html = await editorRef.current?.getHTML() ?? "";
        if (!title && !html) {
            return null;
        }
        if (note?.id) {
            updateNote(note.id, title, html, reminderDate ? reminderDate.toISOString() : null);
        } else {
            saveNote(title, html, reminderDate ? reminderDate.toISOString() : null);
        }
        handleClose();
    };

    const addCheckbox = () => {
        editorRef.current?.addCheckbox();
    };

    return (
        <Animated.View style={[styles.overlay, { transform: [{ translateY: slideAnim }], opacity, paddingBottom: keyboardVisible ? keyboardHeight : 0 }]}>
            <SafeAreaView edges={['bottom']} style={{ flex: 1, position: "relative" }}>
                <View style={styles.header}>
                    <Pressable
                        onPress={handleClose}
                        style={({ pressed }) => [styles.button, pressed ? styles.onPressedButton : ""]}
                    >
                        {({ pressed }) => (
                            <FontAwesome name="chevron-left" size={24} color={pressed ? "#EFC88B" : "#000"} />
                        )}
                    </Pressable>
                    <Pressable
                        onPress={handleSave}
                        style={({ pressed }) => [styles.button, pressed ? styles.onPressedButton : ""]}
                    >
                        <FontAwesome name="check" size={24} color="#E0CA3C" />
                    </Pressable>
                </View>

                <View style={{ marginBottom: 10, paddingHorizontal: 20 }}>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Title"
                        style={styles.inputTitle}
                    />
                    <Text style={{ color: colors.mutedText }}>
                        {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                        })}{" "}
                        | {content
                            .replace(/<[^>]*>/g, "")
                            .replace(/&nbsp;/g, "")
                            .replace(/&#8203;/g, "")
                            .replace(/\u200B/g, "")
                            .replace(/\u00A0/g, "")
                            .replace(/\s+/g, " ")
                            .trim()
                            .length
                        } characters
                    </Text>
                </View>

                <NoteEditor
                    ref={editorRef}
                    onChange={(html) => setContent(html)}
                />

                <TextEditor isOpen={textEditor} editorRef={editorRef} />

                {showReminder && <Reminder setShowReminder={setShowReminder} onSave={(date) => {
                    setReminderDate(date);
                    setShowReminder(false);
                }} />}

                <NoteTool
                    onAddCheckBox={addCheckbox}
                    textEditor={textEditor}
                    setTextEditor={setTextEditor}
                    showReminder={showReminder}
                    setShowReminder={setShowReminder}
                />
            </SafeAreaView>

        </Animated.View>
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
        zIndex: 10,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    onPressedButton: {
        backgroundColor: "#EEE5E9",
    },
    button: {
        height: 40,
        width: 40,
        borderRadius: 100,
        justifyContent: "center",
        alignItems: "center",
    },
    inputTitle: {
        fontSize: 28,
        fontWeight: "600",
        color: "#707070",
    },
});