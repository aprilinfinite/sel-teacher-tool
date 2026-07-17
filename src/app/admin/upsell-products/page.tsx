'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import DeleteDialog from '@/components/admin/DeleteDialog';
import type { ProductItem } from '@/services/products/productTypes';
import { PRODUCT_TYPE_OPTIONS } from '@/services/products/productTypes';
import type { ResourceItem } from '@/services/resources/resourceTypes';

type EditorMode = 'add' | 'edit' | null;

interface ProductFormData {
  title: string;
  slug: string;
  description: string;
  price: string;
  status: string;
  sortOrder: string;
}

const EMPTY_FORM: ProductFormData = {
  title: '',
  slug: '',
  description: '',
  price: '',
  status: 'draft',
  sortOrder: '0',
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatPrice(price: number | null): string {
  if (price === null || price === 0) return '—';
  return `$${price.toFixed(2)}`;
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'inline-flex items-center rounded-full bg-[#e8e5dc] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-[#6d6d6d]',
  published: 'inline-flex items-center rounded-full bg-[#dff4db] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-[#2f5f2b]',
  archived: 'inline-flex items-center rounded-full bg-[#faf3d8] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-[#8b7a2a]',
};

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-[#e0dcd4] bg-white text-[#3b3b3b] placeholder-[#a8b4a4] focus:outline-none focus:ring-2 focus:ring-[#a8b4a4]';
const labelClass = 'block text-sm font-semibold text-[#3b3b3b] mb-2';

export default function UpsellProductsPage() {
  const router = useRouter();

  // Product list state
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Editor state
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // File state
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [currentThumbnail, setCurrentThumbnail] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<{ name: string; url: string } | null>(null);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);
  const [removeFile, setRemoveFile] = useState(false);

  // Delete state
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Data Fetching ──────────────────────────────────────────────

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

  const fetchResources = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/resources?pageSize=100');
      if (!res.ok) throw new Error('Failed to load resources');
      const json = await res.json();
      setResources(json.items ?? []);
    } catch (err) {
      console.error('[UpsellProductsPage] fetchResources:', err instanceof Error ? err.message : String(err));
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchResources()]);
  }, [fetchProducts, fetchResources]);

  // Auto-generate slug from title when not manually edited
  useEffect(() => {
    if (!slugManuallyEdited && editorMode === 'add') {
      setFormData((prev) => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [formData.title, slugManuallyEdited, editorMode]);

  // ─── Editor Helpers ─────────────────────────────────────────────

  const openAddEditor = () => {
    setEditorMode('add');
    setEditingProduct(null);
    setSelectedResourceId(null);
    setFormData(EMPTY_FORM);
    setSlugManuallyEdited(false);
    setThumbnailPreview(null);
    setCurrentThumbnail(null);
    setCurrentFile(null);
    setRemoveThumbnail(false);
    setRemoveFile(false);
    setStatusMessage(null);
    setStatusType(null);
  };

  const openEditEditor = (product: ProductItem) => {
    setEditorMode('edit');
    setEditingProduct(product);
    setSelectedResourceId(product.resourceId);
    setFormData({
      title: product.title,
      slug: product.slug,
      description: product.description || '',
      price: product.price !== null ? String(product.price) : '',
      status: product.status,
      sortOrder: String(product.sortOrder ?? 0),
    });
    setSlugManuallyEdited(true);
    setThumbnailPreview(product.thumbnailPath);
    setCurrentThumbnail(product.thumbnailPath);
    if (product.filePath) {
      const fileName = product.filePath.split('/').pop() || 'product-file';
      setCurrentFile({ name: fileName, url: product.filePath });
    } else {
      setCurrentFile(null);
    }
    setRemoveThumbnail(false);
    setRemoveFile(false);
    setStatusMessage(null);
    setStatusType(null);
  };

  const closeEditor = () => {
    setEditorMode(null);
    setEditingProduct(null);
    setSelectedResourceId(null);
    setFormData(EMPTY_FORM);
    setThumbnailPreview(null);
    setCurrentThumbnail(null);
    setCurrentFile(null);
    setRemoveThumbnail(false);
    setRemoveFile(false);
    setStatusMessage(null);
    setStatusType(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setThumbnailPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
      setRemoveThumbnail(false);
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailPreview(null);
    setRemoveThumbnail(true);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  };

  const handleRemoveFile = () => {
    setCurrentFile(null);
    setRemoveFile(true);
    if (pdfInputRef.current) {
      pdfInputRef.current.value = '';
    }
  };

  // ─── Submit ─────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    setStatusType(null);

    if (!selectedResourceId) {
      setStatusMessage('Please select a parent resource.');
      setStatusType('error');
      setIsSaving(false);
      return;
    }

    const payload = new FormData();
    payload.append('resource_id', String(selectedResourceId));
    payload.append('title', formData.title);
    payload.append('slug', formData.slug);
    payload.append('description', formData.description);
    payload.append('price', formData.price);
    payload.append('status', formData.status);
    payload.append('sort_order', formData.sortOrder);

    if (removeThumbnail) payload.append('remove_thumbnail', 'true');
    if (removeFile) payload.append('remove_file', 'true');

    const thumbnailFile = thumbnailInputRef.current?.files?.[0];
    if (thumbnailFile) payload.append('thumbnail', thumbnailFile);

    const pdfFile = pdfInputRef.current?.files?.[0];
    if (pdfFile) payload.append('pdf', pdfFile);

    try {
      const url = editorMode === 'edit' && editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      const method = editorMode === 'edit' && editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, { method, body: payload });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Unable to save product.');
      }

      setStatusMessage(editorMode === 'edit' ? '✓ Product updated' : '✓ Product created');
      setStatusType('success');
      closeEditor();
      fetchProducts();
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : 'Failed to save product.',
      );
      setStatusType('error');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Delete ─────────────────────────────────────────────────────

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

  const deleteTargetProduct = useMemo(
    () => (deleteTargetId ? products.find((p) => p.id === deleteTargetId) : null),
    [deleteTargetId, products],
  );

  // ─── Filtering ──────────────────────────────────────────────────

  const filteredProducts = useMemo(() => {
    if (!search) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)),
    );
  }, [products, search]);

  // ─── Render ─────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push('/admin/resources')}
          className="mb-2 text-[#a8b4a4] hover:text-[#8b9a8f] font-medium flex items-center gap-2 text-sm"
        >
          ← Back to Content Library
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-[#3b3b3b]">
          Upsell Products
        </h1>
        <p className="text-sm md:text-base text-[#a8b4a4]">
          Manage all upsell products across resources
          {products.length > 0 && ` · ${products.length} product${products.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            statusType === 'success'
              ? 'bg-[#dff4db] text-[#2f5f2b]'
              : 'bg-[#fde8e8] text-[#8b2a2a]'
          }`}
        >
          {statusMessage}
        </div>
      )}

      {/* List View */}
      {editorMode === null && (
        <>
          {/* Search + Add Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a8b4a4]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-xl border border-[#e0dcd4] bg-white py-2.5 pl-10 pr-4 text-sm text-[#3b3b3b] outline-none focus:border-[#a8b4a0] focus:ring-2 focus:ring-[#dbe7d4]"
              />
            </div>
            <button
              type="button"
              onClick={openAddEditor}
              className="w-full sm:w-auto bg-[#a8b4a4] text-[#f4f0e5] px-6 py-3 rounded-xl font-medium hover:bg-[#8b9a8f] transition-colors text-center"
            >
              + Add Product
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-[#e8e5dc] animate-pulse rounded-xl" />
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-[#d4b896]/30 bg-[#fef8f2] px-4 py-3 text-sm text-[#8b6a2a]">
              <p className="font-medium mb-1">Failed to load products</p>
              <p>{error}</p>
              <button type="button" onClick={fetchProducts} className="mt-2 underline hover:no-underline">
                Try again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filteredProducts.length === 0 && (
            <div className="text-center py-12 bg-[#f9f7f2] rounded-2xl">
              <div className="text-4xl mb-3">📦</div>
              <p className="text-[#a8b4a4] font-medium">
                {products.length === 0
                  ? 'No upsell products yet. Add your first one!'
                  : 'No products match your search.'}
              </p>
            </div>
          )}

          {/* Product List */}
          {!loading && !error && filteredProducts.length > 0 && (
            <div className="space-y-3">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-xl border border-[#e6e0d0] p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    {/* Thumbnail */}
                    <div className="w-12 h-12 shrink-0 rounded-lg bg-[#eef3e9] flex items-center justify-center overflow-hidden">
                      {p.thumbnailPath ? (
                        <img src={p.thumbnailPath} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-[#a8b4a4]">📄</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-[#3b3b3b] text-sm">{p.title}</span>
                        <span className={STATUS_BADGE[p.status]}>{p.status}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[#6d6d6d]">
                        <span>{formatPrice(p.price)}</span>
                        <span>Order: {p.sortOrder}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditEditor(p)}
                        className="rounded-lg border border-[#d8d2c3] px-2.5 py-1.5 text-xs font-medium text-[#5c6c57] hover:bg-[#f4f0e5] transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(p.id)}
                        className="rounded-lg border border-[#d4b8b8] px-2.5 py-1.5 text-xs font-medium text-[#8b5a5a] hover:bg-[#faf0f0] transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Editor View */}
      {editorMode !== null && (
        <form onSubmit={handleSubmit} className="bg-[#f4f0e5] rounded-2xl p-8 shadow-sm max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#3b3b3b]">
                {editorMode === 'add' ? 'Add Product' : 'Edit Product'}
              </h2>
              {editorMode === 'edit' && editingProduct && (
                <p className="text-sm text-[#6d6d6d] mt-1">
                  Resource: <span className="font-semibold text-[#3b3b3b]">
                    {resources.find((r) => r.id === editingProduct.resourceId)?.title || `Resource #${editingProduct.resourceId}`}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Resource Selection (only for new products) */}
          {editorMode === 'add' && (
            <div>
              <label className={labelClass}>Parent Resource *</label>
              <select
                value={selectedResourceId ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedResourceId(val ? parseInt(val, 10) : null);
                }}
                className={inputClass}
              >
                <option value="">— Select a resource —</option>
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.category})
                  </option>
                ))}
              </select>
              {!selectedResourceId && (
                <p className="mt-1 text-xs text-[#a8b4a4]">
                  Select the parent resource this upsell product belongs to.
                </p>
              )}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Product Name *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Product name"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Slug</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={(e) => {
                  setSlugManuallyEdited(true);
                  handleInputChange(e);
                }}
                placeholder="product-slug"
                className={inputClass}
              />
              <p className="text-xs text-[#a8b4a4] mt-1">
                Auto-generated from title. Edit to customize.
              </p>
            </div>

            <div>
              <label className={labelClass}>Short Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Brief description of the product"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={inputClass}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Inactive</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Display Order</label>
                <input
                  type="number"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={handleInputChange}
                  placeholder="0"
                  min={0}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="border-t border-[#e0dcd4] pt-4">
            <h3 className="text-lg font-bold text-[#3b3b3b] mb-4">Pricing</h3>
            <div>
              <label className={labelClass}>Price *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a8b4a4] font-medium">$</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-[#e0dcd4] bg-white text-[#3b3b3b] placeholder-[#a8b4a4] focus:outline-none focus:ring-2 focus:ring-[#a8b4a4]"
                />
              </div>
            </div>
          </div>

          {/* Product Thumbnail */}
          <div className="border-t border-[#e0dcd4] pt-4">
            <h3 className="text-lg font-bold text-[#3b3b3b] mb-4">Product Thumbnail</h3>
            <div>
              <label className={labelClass}>Upload Image</label>
              <p className="text-xs text-[#a8b4a4] mb-2">Accepted: JPG, PNG, WEBP</p>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleThumbnailChange}
                    className="w-full text-sm text-[#3b3b3b] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#a8b4a4] file:text-[#f4f0e5] hover:file:bg-[#8b9a8f]"
                  />
                </div>
                {(thumbnailPreview || currentThumbnail) && (
                  <button
                    type="button"
                    onClick={handleRemoveThumbnail}
                    className="shrink-0 px-3 py-2 rounded-xl border border-[#d4b8b8] text-sm font-medium text-[#8b5a5a] hover:bg-[#faf0f0] transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              {(thumbnailPreview || currentThumbnail) && (
                <div className="mt-3">
                  <p className="text-xs text-[#a8b4a4] mb-2">Preview:</p>
                  <div className="w-24 h-24 rounded-xl border border-[#e0dcd4] overflow-hidden bg-white">
                    <img
                      src={thumbnailPreview || currentThumbnail || ''}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product File */}
          <div className="border-t border-[#e0dcd4] pt-4">
            <h3 className="text-lg font-bold text-[#3b3b3b] mb-4">Product File</h3>
            <div>
              <label className={labelClass}>Upload File</label>
              <p className="text-xs text-[#a8b4a4] mb-2">Accepted: PDF, ZIP, PPTX</p>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept=".pdf,.zip,.pptx"
                    onChange={() => setRemoveFile(false)}
                    className="w-full text-sm text-[#3b3b3b] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#a8b4a4] file:text-[#f4f0e5] hover:file:bg-[#8b9a8f]"
                  />
                </div>
                {currentFile && (
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="shrink-0 px-3 py-2 rounded-xl border border-[#d4b8b8] text-sm font-medium text-[#8b5a5a] hover:bg-[#faf0f0] transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              {currentFile && !removeFile && (
                <div className="mt-3 p-3 rounded-xl border border-[#e0dcd4] bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#3b3b3b]">{currentFile.name}</p>
                      <p className="text-xs text-[#a8b4a4]">Current file</p>
                    </div>
                    <a
                      href={currentFile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-[#a8b4a4] text-[#f4f0e5] text-xs font-semibold hover:bg-[#8b9a8f] transition-colors"
                    >
                      Download
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Editor Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-[#f4f0e5] transition-colors disabled:cursor-not-allowed disabled:opacity-70 bg-[#a8b4a4] hover:bg-[#8b9a8f]"
            >
              {isSaving ? 'Saving...' : 'Save Product'}
            </button>
            <button
              type="button"
              onClick={closeEditor}
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-3 bg-[#e0dcd4] text-[#3b3b3b] rounded-xl font-semibold hover:bg-[#d0ccc4] transition-colors disabled:cursor-not-allowed disabled:opacity-70"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Delete Confirmation */}
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
