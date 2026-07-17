import type { ResourceItem } from '@/services/resources/resourceTypes';

const STATUS_BADGE: Record<string, string> = {
  draft: 'inline-flex items-center rounded-full bg-[#e8e5dc] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-[#6d6d6d]',
  published: 'inline-flex items-center rounded-full bg-[#dff4db] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-[#2f5f2b]',
  archived: 'inline-flex items-center rounded-full bg-[#faf3d8] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-[#8b7a2a]',
};

type Props = {
  resources: ResourceItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onDuplicate?: (id: number) => void;
  onStatusChange?: (id: number, status: string) => void;
  onFeaturedChange?: (id: number, featured: boolean) => void;
  onManageProducts?: (id: number) => void;
  onManageBundle?: (id: number) => void;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-14 bg-[#e8e5dc] animate-pulse rounded-lg" />
      ))}
    </div>
  );
}

function EmptyState({ category }: { category?: string }) {
  const categoryName = category || 'this category';
  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-4">📂</div>
      <p className="text-[#a8b4a4] text-lg font-medium">
        No resources have been created for {categoryName} yet.
      </p>
      <p className="text-[#a8b4a4] text-sm mt-1">
        Create your first resource to get started.
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-[#d4b896]/30 bg-[#fef8f2] px-4 py-3 text-sm text-[#8b6a2a]">
      <p className="font-medium mb-1">Failed to load resources</p>
      <p>{message}</p>
      <button type="button" onClick={onRetry} className="mt-2 underline hover:no-underline">
        Try again
      </button>
    </div>
  );
}

function MobileResourceCard({ r, onEdit, onDelete, onDuplicate, onStatusChange, onFeaturedChange, onManageProducts, onManageBundle }: {
  r: ResourceItem;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onDuplicate?: (id: number) => void;
  onStatusChange?: (id: number, status: string) => void;
  onFeaturedChange?: (id: number, featured: boolean) => void;
  onManageProducts?: (id: number) => void;
  onManageBundle?: (id: number) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#e6e0d0] p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-[#3b3b3b] text-sm leading-snug">{r.title}</span>
            {r.featured && (
              <span className="inline-flex items-center rounded-full bg-[#f7c948]/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-[#a9812c]">★</span>
            )}
          </div>
          <p className="text-xs text-[#6d6d6d] mt-1">{r.category}{r.resourceFormat ? ` · ${r.resourceFormat}` : ''}</p>
        </div>
        <span className={STATUS_BADGE[r.status]}>{r.status}</span>
      </div>
      <div className="flex items-center justify-between text-xs text-[#6d6d6d]">
        <span>⬇ {r.downloadCount}</span>
        <span>Order: {r.displayOrder}</span>
        <span>{formatDate(r.createdAt)}</span>
        <span>{r.featured ? '★ Featured' : '—'}</span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#efe9db]">
        {onEdit && (
          <button type="button" onClick={() => onEdit(r.id)}
            className="rounded-lg border border-[#d8d2c3] px-2.5 py-1.5 text-xs font-medium text-[#5c6c57] hover:bg-[#f4f0e5] transition-colors">Edit</button>
        )}
        {onDuplicate && (
          <button type="button" onClick={() => onDuplicate(r.id)}
            className="rounded-lg border border-[#c8d4c0] px-2.5 py-1.5 text-xs font-medium text-[#4a6a3a] hover:bg-[#eef3e9] transition-colors">Duplicate</button>
        )}
        {r.status === 'draft' && onStatusChange && (
          <button type="button" onClick={() => onStatusChange(r.id, 'published')}
            className="rounded-lg border border-[#a8b8a0] px-2.5 py-1.5 text-xs font-medium text-[#4a6a3a] hover:bg-[#eef3e9] transition-colors">Publish</button>
        )}
        {r.status === 'published' && (
          <>
            {onFeaturedChange && !r.featured && (
              <button type="button" onClick={() => onFeaturedChange(r.id, true)}
                className="rounded-lg border border-[#f7c948] px-2.5 py-1.5 text-xs font-medium text-[#8b7a2a] hover:bg-[#fff9e8] transition-colors">★ Feature</button>
            )}
            {onFeaturedChange && r.featured && (
              <button type="button" onClick={() => onFeaturedChange(r.id, false)}
                className="rounded-lg border border-[#d8d2c3] px-2.5 py-1.5 text-xs font-medium text-[#6d6d6d] hover:bg-[#f4f0e5] transition-colors">Unfeature</button>
            )}
            {onStatusChange && (
              <button type="button" onClick={() => onStatusChange(r.id, 'archived')}
                className="rounded-lg border border-[#d4c896] px-2.5 py-1.5 text-xs font-medium text-[#8b7a2a] hover:bg-[#faf6e8] transition-colors">Archive</button>
            )}
          </>
        )}
        {r.status === 'archived' && onStatusChange && (
          <button type="button" onClick={() => onStatusChange(r.id, 'published')}
            className="rounded-lg border border-[#a8b8a0] px-2.5 py-1.5 text-xs font-medium text-[#4a6a3a] hover:bg-[#eef3e9] transition-colors">Publish</button>
        )}
        {onManageBundle && (
          <button type="button" onClick={() => onManageBundle(r.id)}
            className="rounded-lg border border-[#a8b4a4] px-2.5 py-1.5 text-xs font-medium text-[#5c6c57] hover:bg-[#f4f0e5] hover:border-[#8b9a8f] transition-colors">Bundle</button>
        )}
        {onDelete && (
          <button type="button" onClick={() => onDelete(r.id)}
            className="rounded-lg border border-[#d4b8b8] px-2.5 py-1.5 text-xs font-medium text-[#8b5a5a] hover:bg-[#faf0f0] transition-colors">Delete</button>
        )}
      </div>
    </div>
  );
}

export default function ResourceTable({
  resources,
  loading,
  error,
  onRetry,
  onEdit,
  onDelete,
  onDuplicate,
  onStatusChange,
  onFeaturedChange,
  onManageProducts,
  onManageBundle,
}: Props) {
  
  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (resources.length === 0) return <EmptyState />;

  return (
    <>
      {/* Mobile Card View */}
      <div className="space-y-3 md:hidden">
        {resources.map((r) => (
          <MobileResourceCard
            key={r.id}
            r={r}
            onEdit={onEdit}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onStatusChange={onStatusChange}
            onFeaturedChange={onFeaturedChange}
            onManageBundle={onManageBundle}
          />
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-[#e6e0d0] bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f4f0e5] text-[#5c6c57] uppercase tracking-[0.1em] text-xs">
            <tr>
              <th className="px-5 py-4 font-semibold">Title</th>
              <th className="px-5 py-4 font-semibold hidden md:table-cell">Category</th>
              <th className="px-5 py-4 font-semibold hidden lg:table-cell">Status</th>
              <th className="px-5 py-4 font-semibold hidden sm:table-cell">Featured</th>
              <th className="px-5 py-4 font-semibold hidden sm:table-cell">Order</th>
              <th className="px-5 py-4 font-semibold hidden lg:table-cell">Products</th>
              <th className="px-5 py-4 font-semibold hidden lg:table-cell">Created</th>
              {onEdit && <th className="px-5 py-4 font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#efe9db]">
            {resources.map((r) => (
              <tr key={r.id} className="hover:bg-[#f9f7f2] transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {/* Thumbnail placeholder */}
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-[#eef3e9] flex items-center justify-center text-xs text-[#a8b4a4]">
                      📄
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#3b3b3b]">{r.title}</span>
                        {r.featured && (
                          <span className="inline-flex items-center rounded-full bg-[#f7c948]/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-[#a9812c]">
                            ★
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-[#6d6d6d] hidden md:table-cell">{r.category}</td>
                <td className="px-5 py-4 hidden lg:table-cell">
                  <span className={STATUS_BADGE[r.status]}>
                    {r.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-[#6d6d6d] hidden sm:table-cell">
                  {r.featured ? '★ Featured' : '—'}
                </td>
                <td className="px-5 py-4 text-[#6d6d6d] hidden sm:table-cell">
                  {r.displayOrder}
                </td>
                <td className="px-5 py-4 text-[#6d6d6d] hidden lg:table-cell">
                  {r.productCount}
                </td>
                <td className="px-5 py-4 text-[#6d6d6d] hidden lg:table-cell">
                  {formatDate(r.createdAt)}
                </td>
                {onEdit && (
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => onEdit(r.id)}
                        className="rounded-lg border border-[#d8d2c3] px-3 py-1 text-sm font-medium text-[#5c6c57] hover:bg-[#f4f0e5] hover:border-[#a8b4a4] transition-colors">Edit</button>
                      {onDuplicate && (
                        <button type="button" onClick={() => onDuplicate(r.id)}
                          className="rounded-lg border border-[#c8d4c0] px-3 py-1 text-sm font-medium text-[#4a6a3a] hover:bg-[#eef3e9] hover:border-[#8b9a8f] transition-colors">Duplicate</button>
                      )}
                      {onManageProducts && (
                        <button type="button" onClick={() => onManageProducts(r.id)}
                          className="rounded-lg border border-[#a8b8a0] px-3 py-1 text-sm font-medium text-[#4a6a3a] hover:bg-[#eef3e9] hover:border-[#8b9a8f] transition-colors">Manage Products</button>
                      )}
                      {onManageBundle && (
                        <button type="button" onClick={() => onManageBundle(r.id)}
                          className="rounded-lg border border-[#a8b4a4] px-3 py-1 text-sm font-medium text-[#5c6c57] hover:bg-[#f4f0e5] hover:border-[#8b9a8f] transition-colors">Bundle</button>
                      )}
                      {r.status === 'draft' && onStatusChange && (
                        <button type="button" onClick={() => onStatusChange(r.id, 'published')}
                          className="rounded-lg border border-[#a8b8a0] px-3 py-1 text-sm font-medium text-[#4a6a3a] hover:bg-[#eef3e9] hover:border-[#8b9a8f] transition-colors">Publish</button>
                      )}
                      {r.status === 'published' && (
                        <>
                          {onFeaturedChange && !r.featured && (
                            <button type="button" onClick={() => onFeaturedChange(r.id, true)}
                              className="rounded-lg border border-[#f7c948] px-3 py-1 text-sm font-medium text-[#8b7a2a] hover:bg-[#fff9e8] hover:border-[#e5b83c] transition-colors">★ Feature</button>
                          )}
                          {onFeaturedChange && r.featured && (
                            <button type="button" onClick={() => onFeaturedChange(r.id, false)}
                              className="rounded-lg border border-[#d8d2c3] px-3 py-1 text-sm font-medium text-[#6d6d6d] hover:bg-[#f4f0e5] hover:border-[#a8b4a4] transition-colors">Unfeature</button>
                          )}
                          {onStatusChange && (
                            <button type="button" onClick={() => onStatusChange(r.id, 'archived')}
                              className="rounded-lg border border-[#d4c896] px-3 py-1 text-sm font-medium text-[#8b7a2a] hover:bg-[#faf6e8] hover:border-[#c4b870] transition-colors">Archive</button>
                          )}
                        </>
                      )}
                      {r.status === 'archived' && onStatusChange && (
                        <button type="button" onClick={() => onStatusChange(r.id, 'published')}
                          className="rounded-lg border border-[#a8b8a0] px-3 py-1 text-sm font-medium text-[#4a6a3a] hover:bg-[#eef3e9] hover:border-[#8b9a8f] transition-colors">Publish</button>
                      )}
                      {onDelete && (
                        <button type="button" onClick={() => onDelete(r.id)}
                          className="rounded-lg border border-[#d4b8b8] px-3 py-1 text-sm font-medium text-[#8b5a5a] hover:bg-[#faf0f0] hover:border-[#c49090] transition-colors">Delete</button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
