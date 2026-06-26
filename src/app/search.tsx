import { getNotes } from "@/db/database";
import { colors } from "@/styles/global";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Note = {
    id: number;
    title: string;
    content: string;
    reminder: string | null;
    created_at: string;
    synced: number;
};

export default function Search() {
    const [query, setQuery] = useState("");
    const [notes, setNotes] = useState<Note[]>([]);
    const [results, setResults] = useState<Note[]>([]);

    useEffect(() => {
        const data = getNotes() as Note[];
        setNotes(data);
    }, []);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }
        const q = query.toLowerCase();
        const filtered = notes.filter(
            (n) =>
                n.title?.toLowerCase().includes(q) ||
                stripHTML(n.content).toLowerCase().includes(q)
        );
        setResults(filtered);
    }, [query, notes]);

    const stripHTML = (html: string) =>
        html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric",
        });

    const highlight = (text: string, query: string) => {
        if (!query.trim()) return <Text>{text}</Text>;
        const parts = text.split(new RegExp(`(${query})`, "gi"));
        return (
            <Text>
                {parts.map((part, i) =>
                    part.toLowerCase() === query.toLowerCase() ? (
                        <Text key={i} style={styles.highlight}>{part}</Text>
                    ) : (
                        <Text key={i}>{part}</Text>
                    )
                )}
            </Text>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            {/* Search bar */}
            <View style={styles.searchBar}>
                <Pressable onPress={() => router.back()}>
                    <FontAwesome name="chevron-left" size={20} color="#555" />
                </Pressable>
                <TextInput
                    style={styles.input}
                    placeholder="Search notes..."
                    placeholderTextColor="#aaa"
                    value={query}
                    onChangeText={setQuery}
                    autoFocus
                />
                {query.length > 0 && (
                    <Pressable onPress={() => setQuery("")}>
                        <FontAwesome name="times-circle" size={18} color="#aaa" />
                    </Pressable>
                )}
            </View>

            {/* Results */}
            <FlatList
                data={results}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                    <Pressable style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1 }]}>
                        <Text style={styles.cardTitle} numberOfLines={1}>
                            {highlight(item.title || "Untitled", query)}
                        </Text>
                        <Text style={styles.cardPreview} numberOfLines={2}>
                            {highlight(stripHTML(item.content), query)}
                        </Text>
                        <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
                    </Pressable>
                )}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        {query.trim() ? (
                            <>
                                <FontAwesome name="search" size={40} color="#ccc" />
                                <Text style={styles.emptyTitle}>No results for "{query}"</Text>
                            </>
                        ) : (
                            <>
                                <FontAwesome name="search" size={40} color="#ccc" />
                                <Text style={styles.emptyTitle}>Search your notes</Text>
                                <Text style={styles.emptySubtitle}>Type to find notes by title or content</Text>
                            </>
                        )}
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
    input: {
        flex: 1,
        fontSize: 18,
        color: "#333",
    },
    list: {
        padding: 16,
        gap: 12,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        gap: 6,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#1a1a1a",
    },
    cardPreview: {
        fontSize: 14,
        color: "#888",
        lineHeight: 20,
    },
    cardDate: {
        fontSize: 12,
        color: "#bbb",
    },
    highlight: {
        backgroundColor: "#FFF9C4",
        color: "#CF5C36",
        fontWeight: "700",
    },
    empty: {
        alignItems: "center",
        paddingTop: 80,
        gap: 12,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#ccc",
    },
    emptySubtitle: {
        fontSize: 14,
        color: "#ccc",
    },
});