'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { ResourceItem, ResourceQueryParams, PaginationMeta } from '@/services/resources/resourceTypes';
import { DEFAULT_QUERY } from '@/services/resources/resourceTypes';

type State = {
  resources: ResourceItem[];
  pagination: PaginationMeta;
  query: ResourceQueryParams;
  loading: boolean;
  error: string | null;
  setQuery: (patch: Partial<ResourceQueryParams>) => void;
  refresh: () => void;
  selectedResource: ResourceItem | null;
  editing: boolean;
  startEdit: (id: number) => Promise<void>;
  cancelEdit: () => void;
  deletingId: number | null;
  isDeleting: boolean;
  deleteResource: (id: number) => Promise<void>;
  updatingStatusId: number | null;
  isUpdatingStatus: boolean;
  updateStatus: (id: number, status: string) => Promise<void>;
  updatingFeaturedId: number | null;
  isUpdatingFeatured: boolean;
  updateFeatured: (id: number, featured: boolean) => Promise<void>;
  onFeaturedChange: (id: number, featured: boolean) => void;
};

const ResourceContext = createContext<State | null>(null);

export function useResources(): State {
  const ctx = useContext(ResourceContext);
  if (!ctx) throw new Error('useResources must be used within <ResourceProvider />');
  return ctx;
}

function buildQueryString(params: ResourceQueryParams): string {
  const sp = new URLSearchParams();
  if (params.search) sp.set('search', params.search);
  if (params.category) sp.set('category', params.category);
  if (params.gradeLevel) sp.set('gradeLevel', params.gradeLevel);
  if (params.resourceFormat) sp.set('resourceFormat', params.resourceFormat);
  if (params.featured) sp.set('featured', params.featured);
  if (params.sort) sp.set('sort', params.sort);
  sp.set('page', String(params.page));
  sp.set('pageSize', String(params.pageSize));
  return sp.toString();
}

export default function ResourceProvider({ children }: { children: ReactNode }) {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1, pageSize: 10, totalCount: 0, totalPages: 1,
  });
  const [query, setQueryState] = useState<ResourceQueryParams>(DEFAULT_QUERY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);
  const [editing, setEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [updatingFeaturedId, setUpdatingFeaturedId] = useState<number | null>(null);
  const [isUpdatingFeatured, setIsUpdatingFeatured] = useState(false);
  const fetchIdRef = useRef(0);

  const fetchResources = useCallback(async (q: ResourceQueryParams) => {
    const id = ++fetchIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const qs = buildQueryString(q);
      const res = await fetch(`/api/admin/resources?${qs}`);
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      const json = await res.json();
      if (id !== fetchIdRef.current) return; // stale response
      setResources(json.items ?? []);
      setPagination(json.pagination ?? { page: 1, pageSize: 10, totalCount: 0, totalPages: 1 });
    } catch (err) {
      if (id !== fetchIdRef.current) return;
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Unable to load resources. ${msg}`);
      console.error('[ResourceProvider]', msg);
    } finally {
      if (id === fetchIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources(query);
  }, [query, fetchResources]);

  const setQuery = useCallback((patch: Partial<ResourceQueryParams>) => {
    setQueryState((prev) => {
      const next = { ...prev, ...patch };
      // Reset to page 1 when filters change
      if (!('page' in patch)) next.page = 1;
      return next;
    });
  }, []);

  const refresh = useCallback(() => {
    fetchResources(query);
  }, [query, fetchResources]);

  const startEdit = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/admin/resources/${id}`);
      if (!res.ok) throw new Error('Failed to load resource');
      const resource = await res.json() as ResourceItem;
      setSelectedResource(resource);
      setEditing(true);
    } catch (err) {
      console.error('[ResourceProvider] startEdit:', err instanceof Error ? err.message : String(err));
    }
  }, []);

  const cancelEdit = useCallback(() => {
    setSelectedResource(null);
    setEditing(false);
  }, []);

  const deleteResource = useCallback(async (id: number) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/resources/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setDeletingId(null);
      setIsDeleting(false);
      refresh();
    } catch (err) {
      console.error('[ResourceProvider] deleteResource:', err instanceof Error ? err.message : String(err));
      setIsDeleting(false);
      throw err;
    }
  }, [refresh]);

  const updateStatus = useCallback(async (id: number, status: string) => {
    setUpdatingStatusId(id);
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/resources/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Status update failed');
      setUpdatingStatusId(null);
      setIsUpdatingStatus(false);
      refresh();
    } catch (err) {
      console.error('[ResourceProvider] updateStatus:', err instanceof Error ? err.message : String(err));
      setIsUpdatingStatus(false);
    }
  }, [refresh]);

  const updateFeatured = useCallback(async (id: number, featured: boolean) => {
    setUpdatingFeaturedId(id);
    setIsUpdatingFeatured(true);
    try {
      const res = await fetch(`/api/admin/resources/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured }),
      });
      if (!res.ok) throw new Error('Featured update failed');
      setUpdatingFeaturedId(null);
      setIsUpdatingFeatured(false);
      refresh();
    } catch (err) {
      console.error('[ResourceProvider] updateFeatured:', err instanceof Error ? err.message : String(err));
      setIsUpdatingFeatured(false);
    }
  }, [refresh]);

  const onFeaturedChange = useCallback((id: number, featured: boolean) => {
    updateFeatured(id, featured);
  }, [updateFeatured]);

  return (
    <ResourceContext.Provider value={{ resources, pagination, query, loading, error, setQuery, refresh, selectedResource, editing, startEdit, cancelEdit, deletingId, isDeleting, deleteResource, updatingStatusId, isUpdatingStatus, updateStatus, updatingFeaturedId, isUpdatingFeatured, updateFeatured, onFeaturedChange }}>
      {children}
    </ResourceContext.Provider>
  );
}
