import { doc, getDoc, writeBatch, Timestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { firestore } from '../firebase';
import { db } from './db';
import { exportData, type BackupData } from '../utils/backup';

const LAST_SYNCED_KEY = 'gymPwa_lastSyncedAt';

// One doc per table (not one giant blob) so we stay far under Firestore's 1MiB/doc limit
// as workout history grows over years.
const TABLES = ['exercises', 'templates', 'workoutSessions', 'workoutExerciseEntries', 'setEntries', 'prs'] as const;

function requireFirestore() {
    if (!firestore) throw new Error('Firebase not configured');
    return firestore;
}

function tableDoc(uid: string, table: string) {
    return doc(requireFirestore(), 'users', uid, 'backup', table);
}

function metaDoc(uid: string) {
    return doc(requireFirestore(), 'users', uid, 'backup', 'meta');
}

export function getLastSyncedAt(): number | null {
    const stored = localStorage.getItem(LAST_SYNCED_KEY);
    return stored ? Number(stored) : null;
}

function setLastSyncedAt(timestamp: number) {
    localStorage.setItem(LAST_SYNCED_KEY, String(timestamp));
}

async function pushBackup(uid: string): Promise<void> {
    const json = await exportData();
    const data: BackupData = JSON.parse(json);

    const batch = writeBatch(requireFirestore());
    for (const table of TABLES) {
        batch.set(tableDoc(uid, table), { data: data[table] });
    }
    batch.set(metaDoc(uid), { updatedAt: Timestamp.now(), version: data.version });
    await batch.commit();

    setLastSyncedAt(Date.now());
}

/**
 * Additive pull: bring in only the cloud records this device doesn't already have,
 * and NEVER overwrite a record that's here. This is the core safety property —
 * nothing you've entered locally can be reverted, zeroed, or deleted by a sync.
 */
async function pullAdditive(uid: string): Promise<void> {
    const metaSnap = await getDoc(metaDoc(uid));
    if (!metaSnap.exists()) return;

    // Read all cloud tables up front; don't hold a Dexie transaction open across network I/O.
    const cloudByTable: Record<string, any[]> = {};
    for (const table of TABLES) {
        const snap = await getDoc(tableDoc(uid, table));
        cloudByTable[table] = snap.exists() ? (snap.data().data ?? []) : [];
    }

    await db.transaction('rw', [db.exercises, db.templates, db.workoutSessions, db.workoutExerciseEntries, db.setEntries, db.prs], async () => {
        for (const table of TABLES) {
            const rows = cloudByTable[table];
            if (!rows?.length) continue;
            const t: any = (db as any)[table];
            const localIds = new Set(await t.toCollection().primaryKeys());
            const missing = rows.filter(r => r && r.id != null && !localIds.has(r.id));
            if (missing.length) await t.bulkAdd(missing);
        }
    });
}

/**
 * Reconciles this device with the cloud backup without ever losing local data: first
 * pull anything the cloud has that we don't (additively — never overwriting what's
 * here), then upload the merged local state (now a superset of the cloud). Because
 * neither step can reduce local data, this is safe to run automatically and needs no
 * conflict prompt.
 */
export async function syncNow(user: User): Promise<void> {
    await pullAdditive(user.uid);
    await pushBackup(user.uid);
}
