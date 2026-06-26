import AddItem from '@/components/AddItem';
import DropdownMenu from '@/components/DropdownMenu';
import NoteDropdown from '@/components/NoteDropDown';
import { deleteNotes, getNotes, initDB, pinNotes } from '@/db/database';
import { useSync } from '@/hooks/useSync';
import { supabase } from '@/lib/supabase';
import { colors } from '@/styles/global';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

type Note = {
  id: number;
  title: string;
  content: string;
  reminder: string | null;
  created_at: string;
  synced: number;
  pinned: number;
};

export default function Index() {
  const [showAdd, setShowAdd] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { initDB(); }, []);

  useFocusEffect(
    useCallback(() => {
      const data = getNotes() as Note[];
      setNotes(data);
    }, [])
  );

  const refreshNotes = () => {
    const data = getNotes() as Note[];
    setNotes(data);
  };

  const { sync } = useSync(refreshNotes);

  const stripHTML = (html: string) =>
    html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const pinnedNotes = notes.filter(n => n.pinned === 1);
  const unpinnedNotes = notes.filter(n => n.pinned === 0);

  const renderNote = (item: Note) => (
    <NoteDropdown
      key={item.id}
      noteId={item.id}
      isPinned={item.pinned === 1}
      onPress={() => { setSelectedNote(item); setShowAdd(true); }}
      onDelete={() => { deleteNotes([item.id]); refreshNotes(); }}
      onPin={() => { pinNotes([item.id], item.pinned !== 1); refreshNotes(); }}
    >
      <View style={styles.card}>
        {item.pinned === 1 && (
          <View style={styles.pinBadge}>
            <FontAwesome name="thumb-tack" size={10} color="#453A49" />
            <Text style={styles.pinText}>Pinned</Text>
          </View>
        )}
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title || "Untitled"}
          </Text>
          {item.reminder && (
            <View style={styles.reminderBadge}>
              <FontAwesome name="clock-o" size={10} color="#CF5C36" />
              <Text style={styles.reminderText}>{formatDate(item.reminder)}</Text>
            </View>
          )}
        </View>
        <Text style={styles.cardPreview} numberOfLines={2}>
          {stripHTML(item.content) || "No content"}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
          {!item.synced && (
            <View style={styles.unsyncedBadge}>
              <FontAwesome name="cloud-upload" size={10} color="#aaa" />
              <Text style={styles.unsyncedText}>Not synced</Text>
            </View>
          )}
        </View>
      </View>
    </NoteDropdown>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Notes</Text>
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
          <Pressable onPress={() => router.push('/search')} style={styles.button}>
            <FontAwesome name='search' size={24} />
          </Pressable>
          <DropdownMenu items={[
            user
              ? { icon: "sign-out", label: "Sign out", onPress: async () => { await supabase.auth.signOut(); setUser(null); } }
              : { icon: "user", label: "Sign in", onPress: () => router.push("/auth") },
            { icon: "cloud", label: "Sync now", onPress: () => sync() },
          ]} />
        </View>
      </View>

      {/* Notes List */}
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {/* Pinned section */}
        {pinnedNotes.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>📌 Pinned</Text>
            {pinnedNotes.map(renderNote)}
            <Text style={styles.sectionLabel}>Others</Text>
          </>
        )}

        {/* Unpinned / empty */}
        {unpinnedNotes.length === 0 && pinnedNotes.length === 0 ? (
          <View style={styles.empty}>
            <FontAwesome name="sticky-note-o" size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>No notes yet</Text>
            <Text style={styles.emptySubtitle}>Tap + to create your first note</Text>
          </View>
        ) : (
          unpinnedNotes.map(renderNote)
        )}
      </ScrollView>

      {/* Floating Button */}
      <Pressable
        onPress={() => setShowAdd(true)}
        style={({ pressed }) => [
          styles.floatingButton,
          { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] }
        ]}
      >
        <FontAwesome name="plus" size={26} color="#fff" />
      </Pressable>

      {/* Add Note Overlay */}
      {showAdd && (
        <AddItem
          onClose={() => { setShowAdd(false); refreshNotes(); setSelectedNote(null); }}
          note={selectedNote ?? undefined}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  title: { fontWeight: "800", fontSize: 44, color: "#2C2C2C", letterSpacing: 1 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#aaa",
    paddingHorizontal: 4,
    paddingVertical: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  list: { paddingHorizontal: 16, paddingBottom: 120, gap: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  pinBadge: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  pinText: { fontSize: 11, color: "#453A49", fontWeight: "600" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  cardTitle: { fontSize: 17, fontWeight: "700", color: "#1a1a1a", flex: 1 },
  reminderBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#FFF0EB", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  reminderText: { fontSize: 10, color: "#CF5C36", fontWeight: "600" },
  cardPreview: { fontSize: 14, color: "#888", lineHeight: 20 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  cardDate: { fontSize: 12, color: "#bbb" },
  unsyncedBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  unsyncedText: { fontSize: 11, color: "#bbb" },
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 100, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: "#ccc" },
  emptySubtitle: { fontSize: 14, color: "#ccc" },
  floatingButton: {
    position: "absolute",
    backgroundColor: "#453A49",
    borderRadius: 20,
    height: 64, width: 64,
    justifyContent: "center", alignItems: "center",
    bottom: 80, right: 24,
    shadowColor: "#453A49",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  button: { width: 30, height: 30, alignItems: "center", justifyContent: "center" },
});