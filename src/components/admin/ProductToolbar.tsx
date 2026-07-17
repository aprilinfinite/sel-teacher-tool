type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
};

const SORT_OPTIONS = [
  { value: 'sort_order_asc', label: 'Sort Order ↑' },
  { value: 'sort_order_desc', label: 'Sort Order ↓' },
  { value: 'title_asc', label: 'Title A–Z' },
  { value: 'title_desc', label: 'Title Z–A' },
  { value: 'price_asc', label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
];

export default function ProductToolbar({ search, onSearchChange, sort, onSortChange }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a8b4a4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input type="text" value={search} onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products…" className="w-full rounded-xl border border-[#e0dcd4] bg-white py-2.5 pl-10 pr-4 text-sm text-[#3b3b3b] outline-none focus:border-[#a8b4a0] focus:ring-2 focus:ring-[#dbe7d4]" />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2">
        <select value={sort} onChange={(e) => onSortChange(e.target.value)}
          className="flex-1 sm:flex-none rounded-xl border border-[#e0dcd4] bg-white px-3 py-2 text-xs text-[#3b3b3b] outline-none focus:border-[#a8b4a0]">
          {SORT_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
        </select>
      </div>
    </div>
  );
}
