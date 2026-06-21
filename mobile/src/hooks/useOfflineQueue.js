import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import api from '../api/client';

const QUEUE_KEY = 'fp_offline_queue';
const OfflineQueueContext = createContext(null);

export function OfflineQueueProvider({ children }) {
  const queueRef = useRef([]);
  const flushingRef = useRef(false);
  const [pendingCount, setPendingCount] = useState(0);

  const persist = useCallback(() => {
    AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queueRef.current)).catch(() => {});
    setPendingCount(queueRef.current.length);
  }, []);

  const flush = useCallback(async () => {
    if (flushingRef.current) return;
    flushingRef.current = true;
    try {
      while (queueRef.current.length > 0) {
        const item = queueRef.current[0];
        try {
          await api.post(item.endpoint, item.payload);
          queueRef.current = queueRef.current.slice(1);
          persist();
        } catch (err) {
          if (!err.response) {
            // Genuine network failure — stop and keep the rest queued in
            // order, retry on the next reconnect event.
            break;
          }
          // The server actively rejected this one (e.g. duplicate check-in
          // conflict) — retrying won't help, so drop it rather than block
          // every queued item behind it forever.
          queueRef.current = queueRef.current.slice(1);
          persist();
        }
      }
    } finally {
      flushingRef.current = false;
    }
  }, [persist]);

  useEffect(() => {
    AsyncStorage.getItem(QUEUE_KEY)
      .then((raw) => {
        if (raw) queueRef.current = JSON.parse(raw);
        setPendingCount(queueRef.current.length);
        return NetInfo.fetch();
      })
      .then((state) => {
        if (state.isConnected) flush();
      })
      .catch(() => {});

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) flush();
    });
    return unsubscribe;
  }, [flush]);

  // Use in place of api.post(endpoint, payload) for writes that must survive
  // a dropped connection — logs activity and attendance check-in/out.
  const submit = useCallback(async (endpoint, payload) => {
    try {
      const { data } = await api.post(endpoint, payload);
      return { queued: false, data };
    } catch (err) {
      if (!err.response) {
        // No response at all = network failure, not a validation error — queue it.
        queueRef.current = [...queueRef.current, { id: `${Date.now()}-${Math.random()}`, endpoint, payload, timestamp: Date.now() }];
        persist();
        return { queued: true };
      }
      throw err;
    }
  }, [persist]);

  return (
    <OfflineQueueContext.Provider value={{ submit, pendingCount, flush }}>
      {children}
    </OfflineQueueContext.Provider>
  );
}

export function useOfflineQueue() {
  return useContext(OfflineQueueContext);
}
