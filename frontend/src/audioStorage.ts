const DB_NAME = 'fade_audio';
const STORE = 'tracks';

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(STORE);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export async function saveAudioBlob(key: string, blob: Blob): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(blob, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export async function deleteAudioBlob(key: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export async function loadAllAudioBlobs(): Promise<Record<string, string>> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readonly');
        const store = tx.objectStore(STORE);
        const keysReq = store.getAllKeys();
        const valsReq = store.getAll();
        tx.oncomplete = () => {
            const result: Record<string, string> = {};
            (keysReq.result as string[]).forEach((key, i) => {
                result[key] = URL.createObjectURL(valsReq.result[i] as Blob);
            });
            resolve(result);
        };
        tx.onerror = () => reject(tx.error);
    });
}
