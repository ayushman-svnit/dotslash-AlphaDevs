import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface CitizenReportPayload {
  id?: number;
  user_id: string;
  lat: number;
  lng: number;
  species_id: string;
  heading_deg?: number;
  speed_kmh?: number;
  timestamp?: string;
}

interface EcoSyncDB extends DBSchema {
  reports: {
    key: number;
    value: CitizenReportPayload;
    indexes: { 'by-timestamp': string };
  };
}

let dbPromise: Promise<IDBPDatabase<EcoSyncDB>> | null = null;

const getDB = () => {
  if (!dbPromise && typeof window !== 'undefined') {
    dbPromise = openDB<EcoSyncDB>('eco-safe-db', 1, {
      upgrade(db) {
        const store = db.createObjectStore('reports', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('by-timestamp', 'timestamp');
      },
    });
  }
  return dbPromise;
};

export const saveReportOffline = async (report: CitizenReportPayload) => {
  const db = await getDB();
  if (!db) return;
  report.timestamp = new Date().toISOString();
  await db.add('reports', report);
};

export const syncOfflineReports = async () => {
  const db = await getDB();
  if (!db) return;

  const tx = db.transaction('reports', 'readwrite');
  const store = tx.objectStore('reports');
  const allReports = await store.getAll();

  if (allReports.length === 0) return;

  console.log(`Syncing ${allReports.length} offline reports to backend...`);

  // Try to send each report
  const promises = allReports.map(async (report) => {
    try {
      const resp = await fetch('http://localhost:8000/api/v1/report/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });

      if (resp.ok) {
        // Delete from local DB if successfully synced
        const txDelete = db.transaction('reports', 'readwrite');
        await txDelete.objectStore('reports').delete(report.id as number);
        await txDelete.done;
      }
    } catch (err) {
      console.error('Failed to sync report', report.id, err);
    }
  });

  await Promise.all(promises);
};

// Auto-sync when online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Back online! Syncing offline reports...');
    syncOfflineReports();
  });
}
