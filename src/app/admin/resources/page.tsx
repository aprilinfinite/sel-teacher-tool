'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ResourceForm from '@/components/admin/ResourceForm';
import ResourceProvider, { useResources } from '@/components/admin/ResourceProvider';
import ResourceTable from '@/components/admin/ResourceTable';
import ResourceToolbar from '@/components/admin/ResourceToolbar';
import ResourcePagination from '@/components/admin/ResourcePagination';
import DeleteDialog from '@/components/admin/DeleteDialog';
import type { ProductItem } from '@/services/products/productTypes';
import type { BundleItem } from '@/services/bundles/bundleTypes';

// ─── Types ───────────────────────────────────────────────────────
type BundleWithResource = BundleItem & { resourceTitle?: string };

// ─── Section Header ──────────────────────────────────────────────
function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-xl font-bold text-[#3b3b3b]">{title}</h2>
      {count !== undefined && (
        <span className="text-xs text-[#a8b4a4] font-medium bg-[#f4f0e5] px-2.5 py-1 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
}

// ─── Section Divider ─────────────────────────────────────────────
function SectionDivider() {
  return <hr className="border-t border-[#e6e0d0] my-8" />;
}

// ─── Upsell Product Section ──────────────────────────────────────
function UpsellProductSection() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json();
      setProducts(data as ProductItem[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filtered = useMemo(() => {
    if (!search) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)),
    );
  }, [products, search]);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      fetchProducts();
    } catch (err) {
      console.error('[UpsellProductSection] status change:', err);
    }
  };

  const handleEdit = useCallback((product: ProductItem) => {
    // Navigate to the resource's products page where the UpsellProductManager editor is available
    router.push(`/admin/resources/${product.resourceId}/products`);
  }, [router]);

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      fetchProducts();
    } catch (err) {
      console.error('[UpsellProductSection] delete:', err);
    }
  };


  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-[#e8e5dc] animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-[#d4b896]/30 bg-[#fef8f2] px-4 py-3 text-sm text-[#8b6a2a]">
        <p className="font-medium mb-1">Failed to load upsell products</p>
        <p>{error}</p>
        <button type="button" onClick={fetchProducts} className="mt-2 underline hover:no-underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="Upsell Products" count={products.length} />

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search upsell products..."
          className="w-full sm:w-72 px-4 py-2.5 rounded-xl border border-[#e0dcd4] bg-white text-[#3b3b3b] placeholder-[#a8b4a4] focus:outline-none focus:ring-2 focus:ring-[#a8b4a4] text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8 bg-[#f9f7f2] rounded-2xl">
          <div className="text-3xl mb-2">📦</div>
          <p className="text-[#a8b4a4] font-medium">
            {products.length === 0 ? 'No upsell products yet.' : 'No products match your search.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#e6e0d0] bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f4f0e5] text-[#5c6c57] uppercase tracking-[0.1em] text-xs">
              <tr>
                <th className="px-5 py-4 font-semibold">Title</th>
                <th className="px-5 py-4 font-semibold hidden sm:table-cell">Price</th>
                <th className="px-5 py-4 font-semibold hidden md:table-cell">Status</th>
                <th className="px-5 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efe9db]">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-[#f9f7f2] transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-medium text-[#3b3b3b]">{p.title}</span>
                  </td>
                  <td className="px-5 py-4 text-[#6d6d6d] hidden sm:table-cell">
                    {p.price !== null ? `$${p.price.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                        p.status === 'published'
                          ? 'bg-[#dff4db] text-[#2f5f2b]'
                          : p.status === 'draft'
                            ? 'bg-[#e8e5dc] text-[#6d6d6d]'
                            : 'bg-[#faf3d8] text-[#8b7a2a]'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(p)}
                        className="rounded-lg border border-[#d8d2c3] px-3 py-1 text-sm font-medium text-[#5c6c57] hover:bg-[#f4f0e5] transition-colors"
                      >
                        Edit
                      </button>
                      {p.status === 'draft' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(p.id, 'published')}
                          className="rounded-lg border border-[#a8b8a0] px-3 py-1 text-sm font-medium text-[#4a6a3a] hover:bg-[#eef3e9] transition-colors"
                        >
                          Publish
                        </button>
                      )}
                      {p.status === 'published' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(p.id, 'draft')}
                          className="rounded-lg border border-[#d8d2c3] px-3 py-1 text-sm font-medium text-[#6d6d6d] hover:bg-[#f4f0e5] transition-colors"
                        >
                          Draft
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="rounded-lg border border-[#d4b8b8] px-3 py-1 text-sm font-medium text-[#8b5a5a] hover:bg-[#faf0f0] transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Bundle Section ──────────────────────────────────────────────
type BundleRow = BundleWithResource & {
  productCount: number;
  totalProductValue: number;
  savings: number | null;
};

function BundleSection({ onEditBundle }: { onEditBundle: (bundleId: string) => void }) {
  const [bundles, setBundles] = useState<BundleWithResource[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bundlesRes, productsRes] = await Promise.all([
        fetch('/api/admin/bundles'),
        fetch('/api/products'),
      ]);
      if (!bundlesRes.ok) throw new Error('Failed to load bundles');
      if (!productsRes.ok) throw new Error('Failed to load products');
      const bundlesData = await bundlesRes.json();
      const productsData = await productsRes.json();
      setBundles(bundlesData as BundleWithResource[]);
      setProducts(productsData as ProductItem[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Compute enhanced bundle rows with product count, value, and savings
  const bundleRows: BundleRow[] = useMemo(() => {
    return bundles.map((b) => {
      const resourceProducts = products.filter((p) => p.resourceId === b.resourceId);
      const pricedProducts = resourceProducts.filter((p) => p.price !== null && p.price > 0);
      const totalProductValue = pricedProducts.reduce((sum, p) => sum + (p.price ?? 0), 0);
      const savings =
        b.price !== null && totalProductValue > 0
          ? totalProductValue - b.price
          : null;

      return {
        ...b,
        productCount: resourceProducts.length,
        totalProductValue,
        savings,
      };
    });
  }, [bundles, products]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/bundles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      fetchData();
    } catch (err) {
      console.error('[BundleSection] status change:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/bundles/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      fetchData();
    } catch (err) {
      console.error('[BundleSection] delete:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-[#e8e5dc] animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-[#d4b896]/30 bg-[#fef8f2] px-4 py-3 text-sm text-[#8b6a2a]">
        <p className="font-medium mb-1">Failed to load bundles</p>
        <p>{error}</p>
        <button type="button" onClick={fetchData} className="mt-2 underline hover:no-underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="Bundles" count={bundles.length} />

      {bundles.length === 0 ? (
        <div className="text-center py-8 bg-[#f9f7f2] rounded-2xl">
          <div className="text-3xl mb-2">🎁</div>
          <p className="text-[#a8b4a4] font-medium">No bundles created yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#e6e0d0] bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f4f0e5] text-[#5c6c57] uppercase tracking-[0.1em] text-xs">
              <tr>
                <th className="px-5 py-4 font-semibold">Bundle Name</th>
                <th className="px-5 py-4 font-semibold hidden sm:table-cell">Parent Resource</th>
                <th className="px-5 py-4 font-semibold hidden md:table-cell">Products</th>
                <th className="px-5 py-4 font-semibold hidden lg:table-cell">Product Value</th>
                <th className="px-5 py-4 font-semibold hidden lg:table-cell">Bundle Price</th>
                <th className="px-5 py-4 font-semibold hidden xl:table-cell">Savings</th>
                <th className="px-5 py-4 font-semibold hidden xl:table-cell">Status</th>
                <th className="px-5 py-4 font-semibold hidden xl:table-cell">Updated</th>
                <th className="px-5 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efe9db]">
              {bundleRows.map((b) => (
                <tr key={b.id} className="hover:bg-[#f9f7f2] transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-medium text-[#3b3b3b]">{b.title}</span>
                  </td>
                  <td className="px-5 py-4 text-[#6d6d6d] hidden sm:table-cell">
                    {b.resourceTitle || `Resource #${b.resourceId}`}
                  </td>
                  <td className="px-5 py-4 text-[#6d6d6d] hidden md:table-cell">
                    {b.productCount}
                  </td>
                  <td className="px-5 py-4 text-[#6d6d6d] hidden lg:table-cell">
                    ${b.totalProductValue.toFixed(2)}
                  </td>
                  <td className="px-5 py-4 text-[#6d6d6d] hidden lg:table-cell">
                    {b.price !== null ? `$${b.price.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-5 py-4 hidden xl:table-cell">
                    {b.savings !== null ? (
                      <span className={b.savings > 0 ? 'text-[#2f5f2b]' : 'text-[#8b5a5a]'}>
                        {b.savings > 0 ? `-$${b.savings.toFixed(2)}` : `+$${Math.abs(b.savings).toFixed(2)}`}
                      </span>
                    ) : (
                      <span className="text-[#a8b4a4]">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 hidden xl:table-cell">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                        b.status === 'Published'
                          ? 'bg-[#dff4db] text-[#2f5f2b]'
                          : b.status === 'Draft'
                            ? 'bg-[#e8e5dc] text-[#6d6d6d]'
                            : 'bg-[#faf3d8] text-[#8b7a2a]'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[#6d6d6d] hidden xl:table-cell">
                    {new Date(b.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEditBundle(b.id)}
                        className="rounded-lg border border-[#d8d2c3] px-3 py-1 text-sm font-medium text-[#5c6c57] hover:bg-[#f4f0e5] transition-colors"
                      >
                        Edit
                      </button>
                      {b.status === 'Draft' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(b.id, 'Published')}
                          className="rounded-lg border border-[#a8b8a0] px-3 py-1 text-sm font-medium text-[#4a6a3a] hover:bg-[#eef3e9] transition-colors"
                        >
                          Publish
                        </button>
                      )}
                      {b.status === 'Published' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(b.id, 'Draft')}
                          className="rounded-lg border border-[#d8d2c3] px-3 py-1 text-sm font-medium text-[#6d6d6d] hover:bg-[#f4f0e5] transition-colors"
                        >
                          Draft
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(b.id)}
                        className="rounded-lg border border-[#d4b8b8] px-3 py-1 text-sm font-medium text-[#8b5a5a] hover:bg-[#faf0f0] transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main Resource List Section ──────────────────────────────────
function ResourceListSection() {
  const router = useRouter();
  const { resources, pagination, query, loading, error, setQuery, refresh, selectedResource, editing, startEdit, cancelEdit, isDeleting, deleteResource, updateStatus, updateFeatured } = useResources();
  const [showForm, setShowForm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  const handleFormSuccess = () => { setShowForm(false); cancelEdit(); refresh(); };
  const handleCancel = () => { setShowForm(false); cancelEdit(); };

  const deleteTargetResource = useMemo(
    () => deleteTargetId ? resources.find(r => r.id === deleteTargetId) : null,
    [deleteTargetId, resources],
  );

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setDeleteErrorMessage(null);
    try {
      await deleteResource(deleteTargetId);
      setDeleteTargetId(null);
      setSuccessMessage('✓ Resource deleted');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete resource';
      setDeleteErrorMessage(message);
    }
  };

  const handleDuplicate = useCallback(async (id: number) => {
    try {
      const res = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'duplicate', resourceId: id }),
      });
      if (!res.ok) throw new Error('Duplicate failed');
      setSuccessMessage('✓ Resource duplicated');
      setTimeout(() => setSuccessMessage(null), 3000);
      refresh();
    } catch (err) {
      console.error('[Duplicate]', err instanceof Error ? err.message : String(err));
    }
  }, [refresh]);

  const handleManageProducts = useCallback(async (resourceId: number) => {
    router.push(`/admin/resources/${resourceId}/products`);
  }, [router]);

  const handleManageBundle = useCallback(async (resourceId: number) => {
    router.push(`/admin/resources/${resourceId}/bundles`);
  }, [router]);

  const handleEditBundle = useCallback(async (bundleId: string) => {
    try {
      const res = await fetch(`/api/admin/bundles`);
      if (!res.ok) return;
      const bundles = await res.json();
      const bundle = bundles.find((b: BundleWithResource) => b.id === bundleId);
      if (bundle) {
        router.push(`/admin/resources/${bundle.resourceId}/bundles`);
      }
    } catch {
      // Silently fail
    }
  }, [router]);

  if (showForm || editing) {
    return (
      <div>
        <button
          onClick={handleCancel}
          className="mb-6 text-[#a8b4a4] hover:text-[#8b9a8f] font-medium flex items-center gap-2"
        >
          ← Back to Content Library
        </button>
        <ResourceForm
          onSuccess={handleFormSuccess}
          onCancel={handleCancel}
          editing={editing}
          resource={selectedResource}
        />
      </div>
    );
  }

  return (
    <>
      {/* Success Notification */}
      {successMessage && (
        <div className="mb-4 rounded-2xl bg-[#dff4db] px-4 py-3 text-sm text-[#2f5f2b]">
          {successMessage}
        </div>
      )}

      {/* Delete Error Notification */}
      {deleteErrorMessage && (
        <div className="mb-4 rounded-2xl bg-[#fde8e8] px-4 py-3 text-sm text-[#8b2a2a]">
          {deleteErrorMessage}
        </div>
      )}

      {/* ===== PRIMARY ACTION BUTTONS ===== */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#a8b4a4] text-[#f4f0e5] px-6 py-3 rounded-xl font-medium hover:bg-[#8b9a8f] transition-colors text-center"
        >
          + Add New Resource
        </button>
        <button
          onClick={() => router.push('/admin/upsell-products')}
          className="bg-[#a8b4a4] text-[#f4f0e5] px-6 py-3 rounded-xl font-medium hover:bg-[#8b9a8f] transition-colors text-center"
        >
          + Add New Upsell
        </button>
        <button
          onClick={() => router.push('/admin/bundles/new')}
          className="bg-[#a8b4a4] text-[#f4f0e5] px-6 py-3 rounded-xl font-medium hover:bg-[#8b9a8f] transition-colors text-center"
        >
          + Add New Bundle
        </button>
      </div>

      {/* ===== SECTION 1: PARENT RESOURCES ===== */}
      <SectionHeader title="Parent Resources" count={resources.length} />

      <ResourceToolbar query={query} onQueryChange={setQuery} onRefresh={refresh} />

      <ResourceTable
        resources={resources}
        loading={loading}
        error={error}
        onRetry={refresh}
        onEdit={(id) => startEdit(id)}
        onDelete={(id) => setDeleteTargetId(id)}
        onDuplicate={handleDuplicate}
        onStatusChange={(id, status) => updateStatus(id, status)}
        onFeaturedChange={(id, featured) => updateFeatured(id, featured)}
        onManageProducts={handleManageProducts}
        onManageBundle={handleManageBundle}
      />

      <ResourcePagination
        pagination={pagination}
        onPageChange={(page) => setQuery({ page })}
      />

      {deleteTargetResource && (
        <DeleteDialog
          title={deleteTargetResource.title}
          deleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => { setDeleteTargetId(null); setDeleteErrorMessage(null); }}
        />
      )}

      <SectionDivider />

      {/* ===== SECTION 2: UPSELL PRODUCTS ===== */}
      <UpsellProductSection />

      <SectionDivider />

      {/* ===== SECTION 3: BUNDLES ===== */}
      <BundleSection onEditBundle={handleEditBundle} />
    </>
  );
}

// ─── Page ────────────────────────────────────────────────────────
export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#3b3b3b]">Content Library</h1>
        <p className="text-sm md:text-base text-[#a8b4a4]">Manage resources, upsell products, and bundles</p>
      </div>

      <ResourceProvider>
        <ResourceListSection />
      </ResourceProvider>
    </div>
  );
}
