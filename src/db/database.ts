import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("notes.db");

export const initDB = () => {
    db.execSync(`
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            content TEXT,
            reminder TEXT,
            synced INTEGER DEFAULT 0,
            pinned INTEGER DEFAULT 0,
            remote_id TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        );
    `);
    try { db.execSync(`ALTER TABLE notes ADD COLUMN pinned INTEGER DEFAULT 0;`); } catch {}
    try { db.execSync(`ALTER TABLE notes ADD COLUMN synced INTEGER DEFAULT 0;`); } catch {}
    try { db.execSync(`ALTER TABLE notes ADD COLUMN remote_id TEXT;`); } catch {}
};

export const saveNote = (title: string, content: string, reminder: string | null) => {
    db.runSync(
        `INSERT INTO notes (title, content, reminder, synced, pinned) VALUES (?, ?, ?, 0, 0);`,
        [title, content, reminder]
    );
};

export const saveNoteWithPinned = (
    title: string,
    content: string,
    reminder: string | null,
    pinned: number,
    remoteId: string
) => {
    db.runSync(
        `INSERT INTO notes (title, content, reminder, synced, pinned, remote_id) VALUES (?, ?, ?, 1, ?, ?);`,
        [title, content, reminder, pinned, remoteId]
    );
};

export const updateNote = (id: number, title: string, content: string, reminder: string | null) => {
    db.runSync(
        `UPDATE notes SET title = ?, content = ?, reminder = ?, synced = 0 WHERE id = ?;`,
        [title, content, reminder, id]
    );
};

export const getNotes = () => {
    return db.getAllSync(`SELECT * FROM notes ORDER BY pinned DESC, id DESC;`);
};

export const getAllNotes = () => {
    return db.getAllSync(`SELECT * FROM notes;`);
};

export const getUnsyncedNotes = () => {
    return db.getAllSync(`SELECT * FROM notes WHERE synced = 0;`);
};

export const getNoteById = (id: number) => {
    return db.getFirstSync(`SELECT * FROM notes WHERE id = ?;`, [id]);
};

export const markAsSynced = (id: number) => {
    db.runSync(`UPDATE notes SET synced = 1 WHERE id = ?;`, [id]);
};

export const markAsSyncedWithRemoteId = (id: number, remoteId: string) => {
    db.runSync(`UPDATE notes SET synced = 1, remote_id = ? WHERE id = ?;`, [remoteId, id]);
};

export const deleteNotes = (ids: number[]) => {
    db.execSync(`DELETE FROM notes WHERE id IN (${ids.join(",")});`);
};

export const pinNotes = (ids: number[], pinned: boolean) => {
    db.execSync(
        `UPDATE notes SET pinned = ${pinned ? 1 : 0}, synced = 0 WHERE id IN (${ids.join(",")});`
    );
};

export default db;