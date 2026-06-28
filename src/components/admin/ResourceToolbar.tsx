import type { ResourceQueryParams } from '@/services/resources/resourceTypes';
import { SORT_OPTIONS } from '@/services/resources/resourceTypes';

type Props = { query: ResourceQueryParams; onQueryChange: (p: Partial<ResourceQueryParams>) => void; onRefresh: () => void };

const CATEGORIES = ['Prevent', 'Respond', 'Recover', 'Teacher Support'];
const GRADES = ['K-2', '3-5', '6-8', '9-10', '11-12', 'All Grades'];
const FORMATS = ['PDF', 'Worksheet', 'Activity', 'Visual', 'Guide'];

export default function ResourceToolbar({ query, onQueryChange, onRefresh }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a8b4a4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input type="text" value={query.search} onChange={(e) => onQueryChange({ search: e.target.value })}
            placeholder="Search resources…" className="w-full rounded-xl border border-[#e0dcd4] bg-white py-2.5 pl-10 pr-4 text-sm text-[#3b3b3b] outline-none focus:border-[#a8b4a0] focus:ring-2 focus:ring-[#dbe7d4]" />
        </div>
        <button type="button" onClick={onRefresh} title="Refresh"
          className="shrink-0 rounded-xl border border-[#e0dcd4] bg-white px-4 py-2.5 text-sm text-[#a8b4a4] hover:text-[#5c6c57] transition-colors">↻</button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <select value={query.category} onChange={(e) => onQueryChange({ category: e.target.value })}
          className="rounded-xl border border-[#e0dcd4] bg-white px-3 py-2 text-xs text-[#3b3b3b] outline-none focus:border-[#a8b4a0]">
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
        </select>
        <select value={query.gradeLevel} onChange={(e) => onQueryChange({ gradeLevel: e.target.value })}
          className="rounded-xl border border-[#e0dcd4] bg-white px-3 py-2 text-xs text-[#3b3b3b] outline-none focus:border-[#a8b4a0]">
          <option value="">All Grades</option>
          {GRADES.map((g) => (<option key={g} value={g}>{g}</option>))}
        </select>
        <select value={query.resourceFormat} onChange={(e) => onQueryChange({ resourceFormat: e.target.value })}
          className="rounded-xl border border-[#e0dcd4] bg-white px-3 py-2 text-xs text-[#3b3b3b] outline-none focus:border-[#a8b4a0]">
          <option value="">All Formats</option>
          {FORMATS.map((f) => (<option key={f} value={f}>{f}</option>))}
        </select>
        <select value={query.featured} onChange={(e) => onQueryChange({ featured: e.target.value })}
          className="rounded-xl border border-[#e0dcd4] bg-white px-3 py-2 text-xs text-[#3b3b3b] outline-none focus:border-[#a8b4a0]">
          <option value="">All Resources</option>
          <option value="true">★ Featured</option>
          <option value="false">Non-Featured</option>
        </select>
        <div className="ml-auto">
          <select value={query.sort} onChange={(e) => onQueryChange({ sort: e.target.value })}
            className="rounded-xl border border-[#e0dcd4] bg-white px-3 py-2 text-xs text-[#3b3b3b] outline-none focus:border-[#a8b4a0]">
            {SORT_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
          </select>
        </div>
      </div>
    </div>
  );
}
