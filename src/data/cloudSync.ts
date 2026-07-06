import { doc, getDoc, writeBatch, Timestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { firestore } from '../firebase';
import { exportData, importData, type BackupData } from '../utils/backup';

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

async function getCloudUpdatedAt(uid: string): Promise<number | null> {
    const snap = await getDoc(metaDoc(uid));
    if (!snap.exists()) return null;
    const updatedAt = snap.data().updatedAt as Timestamp | undefined;
    return updatedAt ? updatedAt.toMillis() : null;
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

async function pullBackup(uid: string): Promise<void> {
    const metaSnap = await getDoc(metaDoc(uid));
    if (!metaSnap.exists()) return;

    const reconstructed: any = { version: metaSnap.data().version ?? 2 };
    for (const table of TABLES) {
        const snap = await getDoc(tableDoc(uid, table));
        reconstructed[table] = snap.exists() ? snap.data().data : [];
    }

    await importData(JSON.stringify(reconstructed));

    const cloudUpdatedAt = await getCloudUpdatedAt(uid);
    setLastSyncedAt(cloudUpdatedAt ?? Date.now());
}

/**
 * Reconciles this device with the cloud backup. Last-write-wins at the whole-database
 * level: if the cloud has changes this device hasn't seen (pushed from another device),
 * pulling would silently discard whatever's local, so we ask instead of guessing.
 */
export async function syncNow(user: User): Promise<void> {
    const cloudUpdatedAt = await getCloudUpdatedAt(user.uid);
    const lastSyncedAt = getLastSyncedAt();

    if (cloudUpdatedAt === null) {
        // Nothing in the cloud yet for this account — bootstrap it from this device.
        await pushBackup(user.uid);
        return;
    }

    if (lastSyncedAt !== null && cloudUpdatedAt <= lastSyncedAt) {
        // Cloud is not newer than what we've already synced — safe to push local changes.
        await pushBackup(user.uid);
        return;
    }

    // Cloud has changes this device hasn't seen.
    const useCloud = confirm(
        'Hay datos más nuevos en la nube (de otro dispositivo). ¿Usar esos datos? (Cancelar para subir los de este dispositivo y sobrescribir la nube)'
    );
    if (useCloud) {
        await pullBackup(user.uid);
    } else {
        await pushBackup(user.uid);
    }
}
