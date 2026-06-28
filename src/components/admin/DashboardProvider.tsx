'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { DashboardData } from '@/services/dashboard/dashboardTypes';

type State = {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

const DashboardContext = createContext<State | null>(null);

export function useDashboard(): State {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within <DashboardProvider />');
  return ctx;
}

export default function DashboardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      const json = (await res.json()) as DashboardData;
      setData(json);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Unable to load dashboard data. ${msg}`);
      console.error('[DashboardProvider]', msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return (
    <DashboardContext.Provider value={{ data, loading, error, refresh }}>
      {children}
    </DashboardContext.Provider>
  );
}
