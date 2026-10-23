/**
 * FleetOS Offline Sync Engine
 * Uses localStorage/IndexedDB fallback for offline actions (check-in, trip updates, fuel entries, GPS pings)
 * Automatically syncs when connectivity returns.
 */

const STORAGE_KEY = 'fleetos_offline_action_queue';

export const getOfflineQueue = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const enqueueOfflineAction = (actionType, payload) => {
  const queue = getOfflineQueue();
  const event = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: actionType,
    payload,
    timestamp: new Date().toISOString(),
    status: 'QUEUED',
  };
  queue.push(event);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  return event;
};

export const clearQueue = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const syncOfflineQueue = async (apiClient) => {
  const queue = getOfflineQueue();
  if (!queue.length) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;
  const remaining = [];

  for (const item of queue) {
    try {
      if (item.type === 'CHECK_IN') {
        await apiClient.post('/attendance/check-in', item.payload);
      } else if (item.type === 'CHECK_OUT') {
        await apiClient.post('/attendance/check-out', item.payload);
      } else if (item.type === 'START_TRIP') {
        await apiClient.patch(`/trips/${item.payload.tripId}/start`);
      } else if (item.type === 'COMPLETE_TRIP') {
        await apiClient.patch(`/trips/${item.payload.tripId}/complete`, item.payload);
      } else if (item.type === 'GPS_TELEMETRY') {
        await apiClient.post('/tracking/telemetry', item.payload);
      } else if (item.type === 'FUEL_RECORD') {
        await apiClient.post('/fuel', item.payload);
      }
      synced++;
    } catch (err) {
      console.warn(`[Sync] Failed to sync item ${item.id}:`, err.message);
      failed++;
      remaining.push(item);
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
  return { synced, failed, pending: remaining.length };
};
