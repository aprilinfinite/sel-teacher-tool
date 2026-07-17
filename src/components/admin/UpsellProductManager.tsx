'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ProductItem } from '@/services/products/productTypes';
import { PRODUCT_TYPE_OPTIONS } from '@/services/products/productTypes';
import DeleteDialog from './DeleteDialog';

type Props = {
  resourceId: number;
  resourceTitle: string;
  resourceSlug?: string;
};

type EditorMode = 'add' | 'edit' | null;

interface ProductFormData {
  title: string;
  slug: string;
  description: string;
  price: string;
  stripePriceId: string;
  status: string;
  sortOrder: string;
}

const EMPTY_FORM: ProductFormData = {
  title: '',
  slug: '',
  description: '',
  price: '',
  stripePriceId: '',
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

export default function UpsellProductManager({ resourceId, resourceTitle, resourceSlug }: Props) {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [duplicateTargetId, setDuplicateTargetId] = useState<number | null>(null);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // File refs
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [currentThumbnail, setCurrentThumbnail] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<{ name: string; url: string } | null>(null);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);
  const [removeFile, setRemoveFile] = useState(false);

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

  useEffect(() => {
    if (resourceId) fetchProducts();
  }, [resourceId, fetchProducts]);

  // Auto-generate slug from title when not manually edited
  useEffect(() => {
    if (!slugManuallyEdited && editorMode === 'add') {
      setFormData((prev) => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [formData.title, slugManuallyEdited, editorMode]);

  const openAddEditor = () => {
    setEditorMode('add');
    setEditingProduct(null);
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
    setFormData({
      title: product.title,
      slug: product.slug,
      description: product.description || '',
      price: product.price !== null ? String(product.price) : '',
      stripePriceId: product.stripePriceId || '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    setStatusType(null);

    const payload = new FormData();
    payload.append('resource_id', String(resourceId));
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

  const handleDuplicate = async (id: number) => {
    setIsDuplicating(true);
    setDuplicateTargetId(id);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'duplicate', resourceId: id }),
      });
      if (!res.ok) throw new Error('Duplicate failed');
      fetchProducts();
    } catch (err) {
      console.error('[Duplicate Product]', err instanceof Error ? err.message : String(err));
    } finally {
      setIsDuplicating(false);
      setDuplicateTargetId(null);
    }
  };

  const deleteTargetProduct = useMemo(
    () => deleteTargetId ? products.find(p => p.id === deleteTargetId) : null,
    [deleteTargetId, products],
  );

  const inputClass = "w-full px-4 py-3 rounded-xl border border-[#e0dcd4] bg-white text-[#3b3b3b] placeholder-[#a8b4a4] focus:outline-none focus:ring-2 focus:ring-[#a8b4a4]";
  const labelClass = "block text-sm font-semibold text-[#3b3b3b] mb-2";

  return (
    <div className="bg-[#f4f0e5] rounded-2xl p-8 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-[#3b3b3b]">Upsell Products</h3>
          <p className="text-sm text-[#a8b4a4]">
            {products.length > 0
              ? `${products.length} Product${products.length !== 1 ? 's' : ''}`
              : 'No upsell products yet'}
          </p>
        </div>
        {editorMode === null && (
          <button
            type="button"
            onClick={openAddEditor}
            className="px-4 py-2 rounded-xl bg-[#a8b4a4] text-[#f4f0e5] text-sm font-semibold hover:bg-[#8b9a8f] transition-colors"
          >
            + Add Product
          </button>
        )}
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div
          className={`mb-4 rounded-2xl px-4 py-3 text-sm ${
            statusType === 'success'
              ? 'bg-[#dff4db] text-[#2f5f2b]'
              : 'bg-[#fde8e8] text-[#8b2a2a]'
          }`}
        >
          {statusMessage}
        </div>
      )}

      {/* Product List */}
      {editorMode === null && (
        <>
          {loading && (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 bg-[#e8e5dc] animate-pulse rounded-xl" />
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-[#d4b896]/30 bg-[#fef8f2] px-4 py-3 text-sm text-[#8b6a2a]">
              <p className="font-medium mb-1">Failed to load products</p>
              <p>{error}</p>
              <button type="button" onClick={fetchProducts} className="mt-2 underline hover:no-underline">
                Try again
              </button>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="text-center py-8">
              <div className="text-3xl mb-3">📦</div>
              <p className="text-[#a8b4a4] text-sm font-medium">No upsell products have been added yet.</p>
              <button
                type="button"
                onClick={openAddEditor}
                className="mt-3 px-4 py-2 rounded-xl bg-[#a8b4a4] text-[#f4f0e5] text-sm font-semibold hover:bg-[#8b9a8f] transition-colors"
              >
                Add First Product
              </button>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="space-y-3">
              {products.map((p) => (
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
                        onClick={() => handleDuplicate(p.id)}
                        disabled={isDuplicating && duplicateTargetId === p.id}
                        className="rounded-lg border border-[#c8d4c0] px-2.5 py-1.5 text-xs font-medium text-[#4a6a3a] hover:bg-[#eef3e9] transition-colors disabled:opacity-50"
                      >
                        {isDuplicating && duplicateTargetId === p.id ? '...' : 'Duplicate'}
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

      {/* Inline Editor */}
      {editorMode !== null && (
        <form onSubmit={handleSubmit} className="space-y-4 border-t border-[#e0dcd4] pt-6">
          <h4 className="text-base font-bold text-[#3b3b3b]">
            {editorMode === 'add' ? 'Add Product' : 'Edit Product'}
          </h4>
          <p className="text-xs text-[#6d6d6d]">
            Resource: <span className="font-semibold">{resourceTitle}</span>
          </p>

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
              <label className={labelClass}>Short Description *</label>
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
            <h5 className="text-sm font-bold text-[#3b3b3b] mb-3">Pricing</h5>
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
            <h5 className="text-sm font-bold text-[#3b3b3b] mb-3">Product Thumbnail</h5>
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
            <h5 className="text-sm font-bold text-[#3b3b3b] mb-3">Product File</h5>
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
