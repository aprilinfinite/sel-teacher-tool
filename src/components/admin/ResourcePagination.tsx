import type { PaginationMeta } from '@/services/resources/resourceTypes';

type Props = {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
};

export default function ResourcePagination({ pagination, onPageChange }: Props) {
  const { page, totalPages, totalCount } = pagination;

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 text-sm text-[#5c6c57]">
      <span className="text-[#a8b4a4] text-xs sm:text-sm">{totalCount} total</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-[#e0dcd4] bg-white px-4 py-2 text-xs font-medium text-[#3b3b3b] hover:bg-[#f4f0e5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          ← Prev
        </button>
        <span className="text-xs font-medium min-w-[44px] text-center">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-lg border border-[#e0dcd4] bg-white px-4 py-2 text-xs font-medium text-[#3b3b3b] hover:bg-[#f4f0e5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
