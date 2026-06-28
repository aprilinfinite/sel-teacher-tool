'use client';

import { useEffect, useMemo, useState } from 'react';
import ResourceCard from './ResourceCard';
import type { Resource as DbResource } from '@/lib/types';

export default function ResourceList() {
  const [resources, setResources] = useState<DbResource[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch('/api/resources')
      .then(async (res) => {
        if (!res.ok) throw new Error('Network response not ok');
        const data = (await res.json()) as DbResource[];
        if (mounted) { setResources(data); setError(null); }
      })
      .catch((err) => {
        if (mounted) { console.error('Failed to load resources', err); setError('Unable to load resources.'); setResources([]); }
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const preventResources = useMemo(
    () => (resources || []).filter((r) => (r.category || '').toLowerCase() === 'prevent'),
    [resources],
  );

  const uniqueGrades = useMemo(() => {
    const gs = new Set<string>();
    preventResources.forEach((r) => { if (r.grade_level) gs.add(r.grade_level); });
    return Array.from(gs).sort();
  }, [preventResources]);

  const filtered = useMemo(() => {
    let list = preventResources;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((r) => r.title.toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q));
    }
    if (gradeFilter) list = list.filter((r) => r.grade_level === gradeFilter);
    return list;
  }, [preventResources, search, gradeFilter]);

  if (loading) return <div className="col-span-full text-[#6d6d6d]">Loading resources...</div>;
  if (error) return <div className="col-span-full text-[#8b2a2a]">{error}</div>;

  const emptyAll = preventResources.length === 0;

  return (
    <>
      {!emptyAll && (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div className="relative min-w-0 flex-1 sm:max-w-xs">
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search resources\u2026" className="w-full rounded-full border border-[#d8d2c5] bg-white px-4 py-2.5 pl-10 text-sm text-[#2f3b31] outline-none transition focus:border-[#a8b8a0] focus:ring-2 focus:ring-[#dbe7d4]" />
              <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a9a88]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" /></svg>
            </div>
            <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} className="rounded-full border border-[#d8d2c5] bg-white px-4 py-2.5 text-sm text-[#2f3b31] outline-none transition focus:border-[#a8b8a0] focus:ring-2 focus:ring-[#dbe7d4]">
              <option value="">All Grade Levels</option>
              {uniqueGrades.map((g) => (<option key={g} value={g}>{g}</option>))}
            </select>
          </div>
        </div>
      )}

      {emptyAll ? (
        <div className="col-span-full rounded-[24px] border border-[#e6e0d0] bg-white p-8 shadow-sm">
          <p className="text-[#6d6d6d]">No resources available yet. Check back soon or add new resources in the admin dashboard.</p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-[#6d6d6d]">Showing {filtered.length} {filtered.length === 1 ? 'Resource' : 'Resources'}</p>
          {filtered.length === 0 ? (
            <div className="col-span-full rounded-[24px] border border-[#e6e0d0] bg-white p-8 shadow-sm">
              <p className="text-[#6d6d6d]">No resources match your filters. Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {filtered.map((resource) => (<ResourceCard key={resource.id} resource={resource} />))}
            </div>
          )}
        </>
      )}
    </>
  );
}