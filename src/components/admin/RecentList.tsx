import type { ReactNode } from 'react';

type Props<T> = {
  title: string;
  items: T[] | null;
  loading: boolean;
  error: string | null;
  emptyMessage: string;
  renderItem: (item: T, index: number) => ReactNode;
};

export default function RecentList<T>({ title, items, loading, error, emptyMessage, renderItem }: Props<T>) {
  return (
    <div className="bg-[#f4f0e5] rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-[#3b3b3b] mb-4">{title}</h2>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-[#e8e5dc] animate-pulse rounded-lg" />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl border border-[#d4b896]/30 bg-[#fef8f2] px-4 py-3 text-sm text-[#8b6a2a]">
          {error}
        </div>
      )}

      {!loading && !error && items && items.length === 0 && (
        <p className="text-sm text-[#a8b4a4]">{emptyMessage}</p>
      )}

      {!loading && !error && items && items.length > 0 && (
        <div className="space-y-3">{items.map((item, i) => renderItem(item, i))}</div>
      )}
    </div>
  );
}
