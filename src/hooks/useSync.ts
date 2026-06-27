import db, {
    getUnsyncedNotes,
    markAsSynced,
    markAsSyncedWithRemoteId,
    saveNoteWithPinned
} from "@/db/database";
import { supabase } from "@/lib/supabase";
import * as Network from "expo-network";
import { useEffect } from "react";

export const useSync = (onSyncComplete?: () => void) => {

    const pushNotes = async (userId: string) => {
        const unsynced = getUnsyncedNotes() as {
            id: number;
            title: string;
            content: string;
            reminder: string | null;
            created_at: string;
            pinned: number;
            remote_id: string | null;
        }[];

        for (const note of unsynced) {
            if (note.remote_id) {
                const { error } = await supabase
                    .from("notes")
                    .update({
                        title: note.title,
                        content: note.content,
                        reminder: note.reminder,
                        pinned: note.pinned,
                    })
                    .eq("id", note.remote_id);

                if (!error) markAsSynced(note.id);
                continue;
            }

            const { data, error } = await supabase
                .from("notes")
                .insert({
                    title: note.title,
                    content: note.content,
                    reminder: note.reminder,
                    created_at: note.created_at,
                    user_id: userId,
                    pinned: note.pinned,
                })
                .select()
                .single();

            if (!error && data) {
                markAsSyncedWithRemoteId(note.id, data.id);
            }
        }
    };

    const pullNotes = async (userId: string) => {
        const { data, error } = await supabase
            .from("notes")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error || !data) return;

        // delete synced notes and re-insert fresh from Supabase
        db.execSync(`DELETE FROM notes WHERE synced = 1;`);

        for (const note of data) {
            saveNoteWithPinned(
                note.title,
                note.content,
                note.reminder,
                note.pinned ?? 0,
                note.id
            );
        }
    };

    const deleteRemoteNote = async (remoteId: string) => {
        await supabase.from("notes").delete().eq("id", remoteId);
    };

    const sync = async () => {
        const state = await Network.getNetworkStateAsync();
        if (!state.isConnected || !state.isInternetReachable) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await pushNotes(user.id);
        await pullNotes(user.id);

        onSyncComplete?.();
    };

    useEffect(() => {
        sync();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "SIGNED_IN" && session?.user) {
                const state = await Network.getNetworkStateAsync();
                if (!state.isConnected || !state.isInternetReachable) return;
                await pushNotes(session.user.id);
                await pullNotes(session.user.id);
                onSyncComplete?.();
            }
        });

        let lastConnected = false;
        const interval = setInterval(async () => {
            const state = await Network.getNetworkStateAsync();
            const isConnected = !!(state.isConnected && state.isInternetReachable);
            if (isConnected && !lastConnected) sync();
            lastConnected = isConnected;
        }, 5000);

        return () => {
            subscription.unsubscribe();
            clearInterval(interval);
        };
    }, []);

    return { sync, deleteRemoteNote };
};