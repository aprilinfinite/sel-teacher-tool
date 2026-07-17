'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import ProductTable from '@/components/admin/ProductTable';
import ProductToolbar from '@/components/admin/ProductToolbar';
import DeleteDialog from '@/components/admin/DeleteDialog';
import type { ProductItem } from '@/services/products/productTypes';

type ViewState = 'list' | 'add' | 'edit';

export default function ResourceProductsPage() {
  const router = useRouter();
  const params = useParams<{ resourceId: string }>();
  const resourceId = parseInt(params.resourceId, 10);

  const [resourceTitle, setResourceTitle] = useState<string>('');
  const [resourceSlug, setResourceSlug] = useState<string>('');
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewState>('list');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('sort_order_asc');

  const fetchProducts = useCallback(async () => {
    if (!resourceId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/resource/${resourceId}`);
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json();
      setProducts(data as ProductItem[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [resourceId]);

  const fetchResourceInfo = useCallback(async () => {
    if (!resourceId) return;
    try {
      const res = await fetch(`/api/admin/resources/${resourceId}`);
      if (!res.ok) return;
      const data = await res.json();
      setResourceTitle(data.title ?? '');
      setResourceSlug(data.slug ?? '');
    } catch {
      // Silently fail — title is cosmetic
    }
  }, [resourceId]);

  useEffect(() => {
    if (!resourceId) return;
    fetchResourceInfo();
    fetchProducts();
  }, [resourceId, fetchResourceInfo, fetchProducts]);

  const handleFormSuccess = () => {
    setView('list');
    setSelectedProduct(null);
    fetchProducts();
  };

  const handleCancel = () => {
    setView('list');
    setSelectedProduct(null);
  };

  const handleEdit = (product: ProductItem) => {
    setSelectedProduct(product);
    setView('edit');
  };

  const deleteTargetProduct = useMemo(
    () => deleteTargetId ? products.find(p => p.id === deleteTargetId) : null,
    [deleteTargetId, products],
  );

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${deleteTargetId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setDeleteTargetId(null);
      setIsDeleting(false);
      fetchProducts();
    } catch {
      setIsDeleting(false);
    }
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)),
      );
    }

    const [col, dir] = sort.split('_');
    result.sort((a, b) => {
      let cmp = 0;
      if (col === 'sort_order') cmp = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      else if (col === 'price') cmp = (a.price ?? 0) - (b.price ?? 0);
      else cmp = a.title.localeCompare(b.title);
      return dir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [products, search, sort]);

  if (view === 'add' || view === 'edit') {
    return (
      <div>
        <button
          onClick={handleCancel}
          className="mb-6 text-[#a8b4a4] hover:text-[#8b9a8f] font-medium flex items-center gap-2"
        >
          ← Back to Products
        </button>
        <ProductForm
          resourceId={resourceId}
          resourceTitle={resourceTitle}
          resourceSlug={resourceSlug}
          onSuccess={handleFormSuccess}
          onCancel={handleCancel}
          editing={view === 'edit'}
          product={selectedProduct}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => router.push('/admin/resources')}
          className="mb-2 text-[#a8b4a4] hover:text-[#8b9a8f] font-medium flex items-center gap-2 text-sm"
        >
          ← Back to Resources
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-[#3b3b3b]">
          {resourceTitle || 'Products'}
        </h1>
        <p className="text-sm md:text-base text-[#a8b4a4]">
          Manage premium products for this resource
          {products.length > 0 && ` · ${products.length} product${products.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setView('add')}
          className="w-full sm:w-auto bg-[#a8b4a4] text-[#f4f0e5] px-6 py-3 rounded-xl font-medium hover:bg-[#8b9a8f] transition-colors text-center"
        >
          + Add Product
        </button>
      </div>

      <ProductToolbar
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
      />

      <ProductTable
        products={filteredProducts}
        loading={loading}
        error={error}
        onRetry={fetchProducts}
        onEdit={handleEdit}
        onDelete={(id) => setDeleteTargetId(id)}
      />

      {deleteTargetProduct && (
        <DeleteDialog
          title={deleteTargetProduct.title}
          deleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTargetId(null)}
          itemType="Product"
        />
      )}
    </div>
  );
}
