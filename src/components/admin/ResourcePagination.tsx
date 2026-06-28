import type { PaginationMeta } from '@/services/resources/resourceTypes';

type Props = {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
};

export default function ResourcePagination({ pagination, onPageChange }: Props) {
  const { page, totalPages, totalCount } = pagination;

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-4 text-sm text-[#5c6c57]">
      <span className="text-[#a8b4a4]">{totalCount} total</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-[#e0dcd4] bg-white px-3 py-1.5 text-xs font-medium text-[#3b3b3b] hover:bg-[#f4f0e5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← Prev
        </button>
        <span className="text-xs font-medium">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-lg border border-[#e0dcd4] bg-white px-3 py-1.5 text-xs font-medium text-[#3b3b3b] hover:bg-[#f4f0e5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
