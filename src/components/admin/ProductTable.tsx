import type { ProductItem } from '@/services/products/productTypes';

const STATUS_BADGE: Record<string, string> = {
  draft: 'inline-flex items-center rounded-full bg-[#e8e5dc] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-[#6d6d6d]',
  published: 'inline-flex items-center rounded-full bg-[#dff4db] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-[#2f5f2b]',
  archived: 'inline-flex items-center rounded-full bg-[#faf3d8] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-[#8b7a2a]',
};

type Props = {
  products: ProductItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onEdit: (product: ProductItem) => void;
  onDelete: (id: number) => void;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatPrice(price: number | null): string {
  if (price === null || price === 0) return '—';
  return `$${price.toFixed(2)}`;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-14 bg-[#e8e5dc] animate-pulse rounded-lg" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-10">
      <p className="text-[#a8b4a4] text-lg">No products yet.</p>
      <p className="text-[#a8b4a4] text-sm mt-1">Add your first premium product to get started.</p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-[#d4b896]/30 bg-[#fef8f2] px-4 py-3 text-sm text-[#8b6a2a]">
      <p className="font-medium mb-1">Failed to load products</p>
      <p>{message}</p>
      <button type="button" onClick={onRetry} className="mt-2 underline hover:no-underline">
        Try again
      </button>
    </div>
  );
}

function MobileProductCard({ p, onEdit, onDelete }: {
  p: ProductItem;
  onEdit: (product: ProductItem) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#e6e0d0] p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {p.thumbnailPath && (
              <img src={p.thumbnailPath} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
            )}
            <span className="font-medium text-[#3b3b3b] text-sm leading-snug">{p.title}</span>
          </div>
          <p className="text-xs text-[#6d6d6d] mt-1">{formatPrice(p.price)}</p>
        </div>
        <span className={STATUS_BADGE[p.status]}>{p.status}</span>
      </div>
      <div className="flex items-center justify-between text-xs text-[#6d6d6d]">
        <span>Sort: {p.sortOrder}</span>
        <span>{formatDate(p.createdAt)}</span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#efe9db]">
        <button type="button" onClick={() => onEdit(p)}
          className="rounded-lg border border-[#d8d2c3] px-2.5 py-1.5 text-xs font-medium text-[#5c6c57] hover:bg-[#f4f0e5] transition-colors">Edit</button>
        <button type="button" onClick={() => onDelete(p.id)}
          className="rounded-lg border border-[#d4b8b8] px-2.5 py-1.5 text-xs font-medium text-[#8b5a5a] hover:bg-[#faf0f0] transition-colors">Delete</button>
      </div>
    </div>
  );
}

export default function ProductTable({ products, loading, error, onRetry, onEdit, onDelete }: Props) {
  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (products.length === 0) return <EmptyState />;

  return (
    <>
      {/* Mobile Card View */}
      <div className="space-y-3 md:hidden">
        {products.map((p) => (
          <MobileProductCard key={p.id} p={p} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-[#e6e0d0] bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f4f0e5] text-[#5c6c57] uppercase tracking-[0.1em] text-xs">
            <tr>
              <th className="px-5 py-4 font-semibold">Thumbnail</th>
              <th className="px-5 py-4 font-semibold">Title</th>
              <th className="px-5 py-4 font-semibold">Price</th>
              <th className="px-5 py-4 font-semibold">Stripe Price ID</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold hidden sm:table-cell">Sort Order</th>
              <th className="px-5 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#efe9db]">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-[#f9f7f2] transition-colors">
                <td className="px-5 py-4">
                  {p.thumbnailPath ? (
                    <img src={p.thumbnailPath} alt="" className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-[#e8e5dc] flex items-center justify-center text-[#a8b4a4] text-xs">—</div>
                  )}
                </td>
                <td className="px-5 py-4">
                  <span className="font-medium text-[#3b3b3b]">{p.title}</span>
                </td>
                <td className="px-5 py-4 text-[#6d6d6d]">{formatPrice(p.price)}</td>
                <td className="px-5 py-4">
                  <code className="text-xs text-[#6d6d6d] bg-[#f4f0e5] px-2 py-0.5 rounded">
                    {p.stripePriceId || '—'}
                  </code>
                </td>
                <td className="px-5 py-4">
                  <span className={STATUS_BADGE[p.status]}>{p.status}</span>
                </td>
                <td className="px-5 py-4 text-[#6d6d6d] hidden sm:table-cell">{p.sortOrder}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => onEdit(p)}
                      className="rounded-lg border border-[#d8d2c3] px-3 py-1 text-sm font-medium text-[#5c6c57] hover:bg-[#f4f0e5] hover:border-[#a8b4a4] transition-colors">Edit</button>
                    <button type="button" onClick={() => onDelete(p.id)}
                      className="rounded-lg border border-[#d4b8b8] px-3 py-1 text-sm font-medium text-[#8b5a5a] hover:bg-[#faf0f0] hover:border-[#c49090] transition-colors">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
