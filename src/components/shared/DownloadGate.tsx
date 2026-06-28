'use client';

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useSignupSpotlight } from './SignupSpotlight';

const STORAGE_KEY = 'sel_download_access';

// Context

type DownloadContextValue = {
  requestDownload: (url: string, resourceTitle?: string) => void;
  hasPendingDownload: boolean;
  clearPendingDownload: () => void;
  pendingResourceTitle: string | null;
};

const DownloadContext = createContext<DownloadContextValue | null>(null);

export function useDownloadGate(): DownloadContextValue {
  const ctx = useContext(DownloadContext);
  if (!ctx) throw new Error('useDownloadGate must be used within <DownloadGate />');
  return ctx;
}

// Provider

export default function DownloadGate({ children }: { children: ReactNode }) {
  const [hasPendingDownload, setHasPendingDownload] = useState(false);
  const pendingUrlRef = useRef<string | null>(null);
  const pendingTitleRef = useRef<string | null>(null);
  const { activateSpotlight } = useSignupSpotlight();

  const isUnlocked = (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === 'true';
  };

  const triggerDownload = useCallback((url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  }, []);

  const requestDownload = useCallback(
    (url: string, resourceTitle?: string) => {
      if (isUnlocked()) {
        triggerDownload(url);
        return;
      }
      pendingUrlRef.current = url;
      pendingTitleRef.current = resourceTitle || null;
      setHasPendingDownload(true);

      activateSpotlight('download_gate');
    },
    [triggerDownload, activateSpotlight],
  );

  const clearPendingDownload = useCallback(() => {
    const url = pendingUrlRef.current;
    pendingUrlRef.current = null;
    pendingTitleRef.current = null;
    setHasPendingDownload(false);

    if (url) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, 'true');
      }
      triggerDownload(url);
    }
  }, [triggerDownload]);

  const pendingResourceTitle = pendingTitleRef.current;

  return (
    <DownloadContext.Provider
      value={{ requestDownload, hasPendingDownload, clearPendingDownload, pendingResourceTitle }}
    >
      {children}
    </DownloadContext.Provider>
  );
}
