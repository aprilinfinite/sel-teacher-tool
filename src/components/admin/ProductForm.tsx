'use client';

import { useEffect, useState } from 'react';
import type { ProductItem } from '@/services/products/productTypes';

interface ProductFormData {
  title: string;
  slug: string;
  description: string;
  price: string;
  purchaseUrl: string;
  status: string;
  sortOrder: string;
  thumbnailFile: File | null;
  pdfFile: File | null;
}

const EMPTY: ProductFormData = {
  title: '', slug: '', description: '', price: '', purchaseUrl: '',
  status: 'draft', sortOrder: '0',
  thumbnailFile: null, pdfFile: null,
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function productToFormData(p: ProductItem): ProductFormData {
  return {
    title: p.title,
    slug: p.slug,
    description: p.description || '',
    price: p.price !== null ? String(p.price) : '',
    purchaseUrl: p.purchaseUrl || '',
    status: p.status,
    sortOrder: String(p.sortOrder ?? 0),
    thumbnailFile: null,
    pdfFile: null,
  };
}

type Props = {
  resourceId: number;
  resourceTitle: string;
  resourceSlug?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  editing?: boolean;
  product?: ProductItem | null;
};

export default function ProductForm({ resourceId, resourceTitle, resourceSlug, onSuccess, onCancel, editing, product }: Props) {
  const [formData, setFormData] = useState<ProductFormData>(EMPTY);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  useEffect(() => {
    if (editing && product) {
      setFormData(productToFormData(product));
      setSlugManuallyEdited(true);
    } else {
      setFormData(EMPTY);
      setSlugManuallyEdited(false);
    }
  }, [editing, product]);

  // Auto-generate slug from title when not manually edited
  useEffect(() => {
    if (!slugManuallyEdited && !editing) {
      setFormData((prev) => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [formData.title, slugManuallyEdited, editing]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: 'thumbnailFile' | 'pdfFile',
  ) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, [fileType]: file }));
  };

  const resetForm = () => {
    setFormData(EMPTY);
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
    payload.append('purchase_url', formData.purchaseUrl);
    payload.append('status', formData.status);
    payload.append('sort_order', formData.sortOrder);

    if (formData.thumbnailFile) {
      payload.append('thumbnail', formData.thumbnailFile);
    }
    if (formData.pdfFile) {
      payload.append('pdf', formData.pdfFile);
    }

    try {
      const url = editing && product
        ? `/api/admin/products/${product.id}`
        : '/api/admin/products';
      const method = editing && product ? 'PUT' : 'POST';

      const response = await fetch(url, { method, body: payload });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Unable to save product.');
      }

      setStatusMessage('Product saved successfully.');
      setStatusType('success');
      resetForm();
      onSuccess?.();
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : 'Failed to save product.',
      );
      setStatusType('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#f4f0e5] rounded-2xl p-8 shadow-sm max-w-4xl"
    >
      {/* Resource Info */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#3b3b3b] mb-6">
          {editing ? 'Edit Product' : 'Add Product'}
        </h2>
        <p className="text-sm text-[#6d6d6d] mb-6">
          Resource: <span className="font-semibold text-[#3b3b3b]">{resourceTitle}</span>
        </p>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-[#3b3b3b] mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Product title"
              className="w-full px-4 py-3 rounded-xl border border-[#e0dcd4] bg-white text-[#3b3b3b] placeholder-[#a8b4a4] focus:outline-none focus:ring-2 focus:ring-[#a8b4a4]"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-semibold text-[#3b3b3b] mb-2">
              Slug
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={(e) => {
                setSlugManuallyEdited(true);
                handleInputChange(e);
              }}
              placeholder="product-slug"
              className="w-full px-4 py-3 rounded-xl border border-[#e0dcd4] bg-white text-[#3b3b3b] placeholder-[#a8b4a4] focus:outline-none focus:ring-2 focus:ring-[#a8b4a4]"
            />
            <p className="text-xs text-[#a8b4a4] mt-1">
              Auto-generated from title. Edit to customize.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-[#3b3b3b] mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Product description"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-[#e0dcd4] bg-white text-[#3b3b3b] placeholder-[#a8b4a4] focus:outline-none focus:ring-2 focus:ring-[#a8b4a4]"
            />
          </div>

          {/* Price & Purchase URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#3b3b3b] mb-2">
                Price
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-3 rounded-xl border border-[#e0dcd4] bg-white text-[#3b3b3b] placeholder-[#a8b4a4] focus:outline-none focus:ring-2 focus:ring-[#a8b4a4]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#3b3b3b] mb-2">
                Purchase URL
              </label>
              <input
                type="url"
                name="purchaseUrl"
                value={formData.purchaseUrl}
                onChange={handleInputChange}
                placeholder="https://..."
                className="w-full px-4 py-3 rounded-xl border border-[#e0dcd4] bg-white text-[#3b3b3b] placeholder-[#a8b4a4] focus:outline-none focus:ring-2 focus:ring-[#a8b4a4]"
              />
            </div>
          </div>

          {/* Status & Sort Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#3b3b3b] mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-[#e0dcd4] bg-white text-[#3b3b3b] focus:outline-none focus:ring-2 focus:ring-[#a8b4a4]"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#3b3b3b] mb-2">
                Sort Order
              </label>
              <input
                type="number"
                name="sortOrder"
                value={formData.sortOrder}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 rounded-xl border border-[#e0dcd4] bg-white text-[#3b3b3b] placeholder-[#a8b4a4] focus:outline-none focus:ring-2 focus:ring-[#a8b4a4]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Uploads */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#3b3b3b] mb-6">Uploads</h2>

        <div className="space-y-4">
          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-semibold text-[#3b3b3b] mb-2">
              Thumbnail Image
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="w-full px-4 py-6 border-2 border-dashed border-[#d7cfa8] rounded-xl cursor-pointer hover:bg-[#f1f6ed] transition-colors">
                <div className="text-center">
                  <span className="text-2xl">🖼️</span>
                  <p className="text-sm text-[#a8b4a4] mt-2">
                    {formData.thumbnailFile
                      ? formData.thumbnailFile.name
                      : 'Click to upload or drag image'}
                  </p>
                  <p className="text-xs text-[#a8b4a4] mt-1">PNG, JPG up to 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'thumbnailFile')}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* PDF Upload */}
          <div>
            <label className="block text-sm font-semibold text-[#3b3b3b] mb-2">
              PDF File
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="w-full px-4 py-6 border-2 border-dashed border-[#d7cfa8] rounded-xl cursor-pointer hover:bg-[#f1f6ed] transition-colors">
                <div className="text-center">
                  <span className="text-2xl">📄</span>
                  <p className="text-sm text-[#a8b4a4] mt-2">
                    {formData.pdfFile
                      ? formData.pdfFile.name
                      : 'Click to upload PDF'}
                  </p>
                  <p className="text-xs text-[#a8b4a4] mt-1">PDF up to 25MB</p>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, 'pdfFile')}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`mb-6 rounded-2xl px-4 py-3 text-sm ${
            statusType === 'success'
              ? 'bg-[#dff4db] text-[#2f5f2b]'
              : 'bg-[#fde8e8] text-[#8b2a2a]'
          }`}
        >
          {statusMessage}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-[#f4f0e5] transition-colors disabled:cursor-not-allowed disabled:opacity-70 bg-[#a8b4a4] hover:bg-[#8b9a8f]"
        >
          {isSaving ? 'Saving...' : 'Save Product'}
        </button>
        <button
          type="button"
          onClick={() => { if (editing && onCancel) { onCancel(); } else { resetForm(); } }}
          disabled={isSaving}
          className="w-full sm:w-auto px-6 py-3 bg-[#e0dcd4] text-[#3b3b3b] rounded-xl font-semibold hover:bg-[#d0ccc4] transition-colors disabled:cursor-not-allowed disabled:opacity-70"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
