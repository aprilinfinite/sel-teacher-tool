'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BundleItem, BundleFormData } from '@/services/bundles/bundleTypes';
import type { ProductItem } from '@/services/products/productTypes';
import type { ResourceItem } from '@/services/resources/resourceTypes';
import { validateBundle } from '@/services/bundles/bundleValidation';
import { analyzeBundleHealth } from '@/services/bundles/bundleHealth';
import { calculateBundlePricing } from '@/services/bundles/bundlePricing';

type Props = {
  resourceId?: number | null;
  resourceTitle?: string;
  onSuccess: () => void;
  onCancel: () => void;
};

const STATUS_OPTIONS = ['Draft', 'Published', 'Inactive'] as const;

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-[#e0dcd4] bg-white text-[#3b3b3b] placeholder-[#a8b4a4] focus:outline-none focus:ring-2 focus:ring-[#a8b4a4]';
const labelClass = 'block text-sm font-semibold text-[#3b3b3b] mb-2';
const sectionTitleClass =
  'text-lg font-bold text-[#3b3b3b] mb-4 pb-2 border-b border-[#e0dcd4]';

export default function BundleForm({ resourceId: initialResourceId, resourceTitle: initialResourceTitle, onSuccess, onCancel }: Props) {
  const [bundle, setBundle] = useState<BundleItem | null>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Published' | 'Inactive'>('Draft');
  const [price, setPrice] = useState('');
  const [purchaseUrl, setPurchaseUrl] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

  // Thumbnail
  const [thumbnailPath, setThumbnailPath] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  // Resource selection
  const [selectedResourceId, setSelectedResourceId] = useState<number | null>(initialResourceId ?? null);
  const [selectedResourceTitle, setSelectedResourceTitle] = useState(initialResourceTitle ?? '');

  // Product search/filter
  const [productSearch, setProductSearch] = useState('');
  const [showAllProducts, setShowAllProducts] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch all resources for the dropdown
  const fetchResources = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/resources?pageSize=100');
      if (!res.ok) throw new Error('Failed to load resources');
      const json = await res.json();
      setResources(json.items ?? []);
    } catch (err) {
      console.error('[BundleForm] fetchResources:', err instanceof Error ? err.message : String(err));
    }
  }, []);

  // Fetch all products
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json();
      setProducts(data as ProductItem[]);
    } catch (err) {
      console.error('[BundleForm] fetchProducts:', err instanceof Error ? err.message : String(err));
    }
  }, []);

  // Fetch bundle by resource ID (for editing)
  const fetchBundleByResource = useCallback(async (resId: number) => {
    try {
      const res = await fetch(`/api/bundles/resource/${resId}`);
      if (!res.ok) throw new Error('Failed to load bundle');
      const data = await res.json();
      if (data) {
        setBundle(data as BundleItem);
        // Only populate form fields on initial load (when user hasn't entered data yet).
        // We detect this by checking if the user has already entered a title.
        // If title is empty, it means the form hasn't been touched, so we populate.
        setTitle((prev) => prev || data.title);
        setStatus(data.status);
        setPrice((prev) => prev || (data.price !== null ? String(data.price) : ''));
        setPurchaseUrl((prev) => prev || (data.purchaseUrl ?? ''));
        // Load thumbnail path from existing bundle
        if (data.thumbnailPath) {
          setThumbnailPath(data.thumbnailPath);
        }
        // Always load linked product IDs from the junction table
        if (data.productIds && Array.isArray(data.productIds)) {
          setSelectedProductIds(data.productIds);
        }
      }
    } catch (err) {
      console.error('[BundleForm] fetchBundleByResource:', err instanceof Error ? err.message : String(err));
    }
  }, []);



  // Initial load
  useEffect(() => {
    Promise.all([fetchResources(), fetchProducts()]).finally(() => setLoading(false));
  }, [fetchResources, fetchProducts]);

  // When resource changes, update the resource title and check for existing bundle.
  // IMPORTANT: Only populate fields if an existing bundle is found AND the user
  // has not already entered data. This prevents overwriting user input.
  useEffect(() => {
    if (!selectedResourceId) {
      setBundle(null);
      return;
    }

    // Update resource title
    const resource = resources.find((r) => r.id === selectedResourceId);
    if (resource) {
      setSelectedResourceTitle(resource.title);
    }

    // Check for existing bundle
    fetchBundleByResource(selectedResourceId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResourceId]);

  // Handle resource selection change
  const handleResourceChange = async (resId: number) => {
    setSelectedResourceId(resId);
    setBundle(null);
    // Reset thumbnail state when switching resources
    setThumbnailPath(null);
    setThumbnailFile(null);
    setThumbnailPreview(null);

    // Check if this resource already has a bundle
    try {
      const res = await fetch(`/api/bundles/resource/${resId}`);
      if (!res.ok) throw new Error('Failed to check bundle');
      const data = await res.json();
      if (data) {
        // Resource already has a bundle — load it for editing.
        // Only populate fields that the user hasn't already entered.
        // Use functional updates to preserve existing user input.
        setBundle(data as BundleItem);
        setTitle((prev) => prev || data.title);
        setStatus(data.status);
        setPrice((prev) => prev || (data.price !== null ? String(data.price) : ''));
        setPurchaseUrl((prev) => prev || (data.purchaseUrl ?? ''));
        // Load thumbnail path from existing bundle
        if (data.thumbnailPath) {
          setThumbnailPath(data.thumbnailPath);
        }
        // Load linked product IDs from the junction table
        if (data.productIds && Array.isArray(data.productIds)) {
          setSelectedProductIds(data.productIds);
        }
      }
      // If no bundle exists, do NOT clear user-entered fields — they stay intact
    } catch (err) {
      console.error('[BundleForm] handleResourceChange:', err instanceof Error ? err.message : String(err));
    }
  };





  // Filter products: by resource (default) or all products
  const filteredByResource = useMemo(() => {
    if (!selectedResourceId || showAllProducts) return products;
    return products.filter((p) => p.resourceId === selectedResourceId);
  }, [products, selectedResourceId, showAllProducts]);

  // Further filter by search
  const filteredProducts = useMemo(() => {
    if (!productSearch) return filteredByResource;
    const q = productSearch.toLowerCase();
    return filteredByResource.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)),
    );
  }, [filteredByResource, productSearch]);

  // Selected products data
  const selectedProducts = useMemo(() => {
    return products.filter((p) => selectedProductIds.includes(p.id));
  }, [products, selectedProductIds]);

  // Bundle health analysis
  const health = useMemo(() => {
    return analyzeBundleHealth(
      selectedProducts.map((p) => ({
        title: p.title,
        sortOrder: p.sortOrder,
        price: p.price,
        purchaseUrl: p.purchaseUrl,
      })),
    );
  }, [selectedProducts]);

  // Pricing summary
  const pricing = useMemo(() => {
    return calculateBundlePricing(
      selectedProducts.map((p) => ({
        title: p.title,
        sortOrder: p.sortOrder,
        price: p.price,
        purchaseUrl: p.purchaseUrl,
      })),
      price ? parseFloat(price) : null,
    );
  }, [selectedProducts, price]);

  // Toggle product selection
  const toggleProduct = (productId: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  // Select all / deselect all
  const selectAll = () => setSelectedProductIds(filteredProducts.map((p) => p.id));
  const deselectAll = () => setSelectedProductIds([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    // Validate
    const validation = validateBundle({ title, price, purchaseUrl, status });
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    if (!selectedResourceId) {
      setErrors({ resourceId: 'Please select a parent resource.' });
      return;
    }
    setErrors({});

    setSaving(true);
    setStatusMessage(null);
    setStatusType(null);

    try {
      // Step 1: Save the bundle first (without thumbnail)
      const res = await fetch('/api/admin/bundles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bundleId: bundle?.id ?? null,
          resourceId: selectedResourceId,
          title,
          price,
          purchaseUrl,
          status,
          productIds: selectedProductIds,
          thumbnailPath: thumbnailFile ? null : thumbnailPath,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save bundle');
      }

      const saveData = await res.json();
      const savedBundleId = saveData.bundle?.id;

      // Step 2: Upload thumbnail if a new file was selected (now we have a bundle ID)
      let thumbnailUploadFailed = false;
      if (thumbnailFile && savedBundleId) {
        setUploadingThumbnail(true);
        const thumbFormData = new FormData();
        thumbFormData.append('thumbnail', thumbnailFile);
        thumbFormData.append('bundleId', savedBundleId);
        const uploadRes = await fetch('/api/upload/bundle-thumbnail', {
          method: 'POST',
          body: thumbFormData,
        });
        const uploadBody = await uploadRes.json();

        if (uploadRes.ok) {
          const finalThumbnailPath = uploadBody.thumbnailPath;
          setUploadingThumbnail(false);

          // Step 3: Update the bundle with the thumbnail path
          const updateRes = await fetch('/api/admin/bundles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bundleId: savedBundleId,
              resourceId: selectedResourceId,
              title,
              price,
              purchaseUrl,
              status,
              productIds: selectedProductIds,
              thumbnailPath: finalThumbnailPath,
            }),
          });

          if (!updateRes.ok) {
            thumbnailUploadFailed = true;
          }
        } else {
          thumbnailUploadFailed = true;
        }
        setUploadingThumbnail(false);
      }

      if (thumbnailUploadFailed) {
        setStatusMessage(
          bundle
            ? '✓ Bundle updated, but thumbnail upload failed. You can add or replace it later by editing the bundle.'
            : '✓ Bundle created, but thumbnail upload failed. You can add or replace it later by editing the bundle.',
        );
        setStatusType('success');
      } else {
        setStatusMessage(bundle ? '✓ Bundle updated' : '✓ Bundle created');
        setStatusType('success');
      }
      onSuccess();
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Failed to save bundle');
      setStatusType('error');
    } finally {
      setSaving(false);
      setUploadingThumbnail(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-[#e8e5dc] animate-pulse rounded-lg" />
        <div className="h-64 bg-[#e8e5dc] animate-pulse rounded-2xl" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* ===== STEP 1: BUNDLE DETAILS ===== */}
      <div className="bg-[#f4f0e5] rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-[#3b3b3b] mb-6">
          {bundle ? 'Edit Bundle' : 'New Bundle'}
        </h2>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className={labelClass}>Bundle Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete SEL Classroom Kit"
              className={`${inputClass} ${errors.title ? 'border-red-400' : ''}`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className={labelClass}>Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'Draft' | 'Published' | 'Inactive')}
              className={inputClass}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className={labelClass}>Bundle Price (Optional)</label>
            <p className="text-xs text-[#a8b4a4] mb-2">
              Set a bundle price. Leave empty for unpriced bundles.
            </p>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a8b4a4] font-medium">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className={`${inputClass} pl-8 ${errors.price ? 'border-red-400' : ''}`}
              />
            </div>
            {errors.price && (
              <p className="mt-1 text-xs text-red-500">{errors.price}</p>
            )}
          </div>

          {/* Purchase URL */}
          <div>
            <label className={labelClass}>Purchase URL (Optional)</label>
            <p className="text-xs text-[#a8b4a4] mb-2">
              Link to where this bundle can be purchased.
            </p>
            <input
              type="url"
              value={purchaseUrl}
              onChange={(e) => setPurchaseUrl(e.target.value)}
              placeholder="https://..."
              className={`${inputClass} ${errors.purchaseUrl ? 'border-red-400' : ''}`}
            />
            {errors.purchaseUrl && (
              <p className="mt-1 text-xs text-red-500">{errors.purchaseUrl}</p>
            )}
          </div>

          {/* Bundle Thumbnail */}
          <div>
            <label className={labelClass}>Bundle Thumbnail</label>
            <p className="text-xs text-[#a8b4a4] mb-2">
              Upload a thumbnail image for this bundle. Recommended: 800×600px.
            </p>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    if (file) {
                      setThumbnailFile(file);
                      setThumbnailPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full text-sm text-[#6d6d6d] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#e8e5dc] file:text-[#3b3b3b] hover:file:bg-[#d8d5cc] cursor-pointer"
                />
              </div>
              {(thumbnailPreview || bundle?.thumbnailPath) && (
                <div className="shrink-0">
                  <img
                    src={thumbnailPreview || bundle?.thumbnailPath || ''}
                    alt="Thumbnail preview"
                    className="w-20 h-20 rounded-xl object-cover border border-[#e0dcd4]"
                  />
                </div>
              )}
            </div>
            {(thumbnailPreview || bundle?.thumbnailPath) && (
              <button
                type="button"
                onClick={() => {
                  setThumbnailFile(null);
                  setThumbnailPreview(null);
                  setThumbnailPath(null);
                }}
                className="mt-2 text-xs text-[#8b5a5a] hover:text-[#6b3a3a] font-medium underline"
              >
                Remove thumbnail
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== STEP 2: SELECT PARENT RESOURCE ===== */}
      <div className="bg-[#f4f0e5] rounded-2xl p-8 shadow-sm">
        <h3 className={sectionTitleClass}>Parent Resource</h3>
        <p className="text-sm text-[#a8b4a4] mb-4">
          Choose the parent resource for this bundle. Each resource can only have one bundle.
        </p>

        <div>
          <label className={labelClass}>Select Resource *</label>
          <select
            value={selectedResourceId ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              if (val) handleResourceChange(parseInt(val, 10));
            }}
            className={`${inputClass} ${errors.resourceId ? 'border-red-400' : ''}`}
          >
            <option value="">— Select a resource —</option>
            {resources.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title} ({r.category})
              </option>
            ))}
          </select>
          {errors.resourceId && (
            <p className="mt-1 text-xs text-red-500">{errors.resourceId}</p>
          )}
        </div>

        {selectedResourceId && (
          <div className="mt-4 p-4 rounded-xl bg-white border border-[#e0dcd4]">
            <p className="text-sm text-[#3b3b3b]">
              <span className="font-semibold">Selected Resource:</span>{' '}
              {selectedResourceTitle}
            </p>
            {bundle && (
              <p className="text-xs text-[#a8b4a4] mt-1">
                This resource already has a bundle. Editing existing bundle.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ===== STEP 3: SELECT UPSELL PRODUCTS ===== */}
      <div className="bg-[#f4f0e5] rounded-2xl p-8 shadow-sm">
        <h3 className={sectionTitleClass}>Upsell Products</h3>
        <p className="text-sm text-[#a8b4a4] mb-4">
          {selectedResourceId
            ? `Select upsell products to include in this bundle.`
            : 'Select a parent resource first to see its products.'}
        </p>

        {selectedResourceId && (
          <>
            {/* Search and Show All toggle */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#e0dcd4] bg-white text-[#3b3b3b] placeholder-[#a8b4a4] focus:outline-none focus:ring-2 focus:ring-[#a8b4a4] text-sm"
              />
              <label className="flex items-center gap-2 text-sm text-[#5c6c57] cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={showAllProducts}
                  onChange={(e) => setShowAllProducts(e.target.checked)}
                  className="w-4 h-4 rounded cursor-pointer accent-[#8b9a8f]"
                />
                Show products from all resources
              </label>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">📦</div>
                <p className="text-[#a8b4a4] font-medium">
                  {products.length === 0
                    ? 'No upsell products found. Create upsell products first.'
                    : showAllProducts
                      ? 'No products match your search.'
                      : `No upsell products found for "${selectedResourceTitle}". Create products for this resource first, or enable "Show products from all resources".`}
                </p>
              </div>
            ) : (
              <>
                {/* Select All / Deselect All / Count */}
                <div className="flex items-center gap-3 mb-4">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-xs font-medium text-[#5c6c57] hover:text-[#3b3b3b] transition-colors underline"
                  >
                    Select All
                  </button>
                  <span className="text-[#d8d2c3]">|</span>
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="text-xs font-medium text-[#5c6c57] hover:text-[#3b3b3b] transition-colors underline"
                  >
                    Deselect All
                  </button>
                  <span className="text-xs text-[#a8b4a4] ml-auto">
                    {selectedProductIds.length} of {filteredProducts.length} selected
                  </span>
                </div>

                {/* Product List */}
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {filteredProducts.map((product) => {
                    const isSelected = selectedProductIds.includes(product.id);
                    return (
                      <label
                        key={product.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-[#a8b4a4] bg-white'
                            : 'border-[#e0dcd4] bg-white hover:border-[#c8d4c0]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleProduct(product.id)}
                          className="w-5 h-5 rounded cursor-pointer accent-[#8b9a8f]"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#3b3b3b] truncate">
                            {product.title}
                          </p>
                          <p className="text-xs text-[#a8b4a4]">
                            {product.price !== null ? `$${product.price.toFixed(2)}` : 'No price'}
                            {product.purchaseUrl ? ' · Has URL' : ' · No URL'}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${
                            product.status === 'published'
                              ? 'bg-[#dff4db] text-[#2f5f2b]'
                              : product.status === 'draft'
                                ? 'bg-[#e8e5dc] text-[#6d6d6d]'
                                : 'bg-[#faf3d8] text-[#8b7a2a]'
                          }`}
                        >
                          {product.status}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {!selectedResourceId && (
          <div className="text-center py-8 bg-white rounded-xl border border-[#e0dcd4]">
            <div className="text-3xl mb-2">👆</div>
            <p className="text-[#a8b4a4] font-medium">
              Select a parent resource above to see its products.
            </p>
          </div>
        )}
      </div>

      {/* ===== BUNDLE CONTENTS PREVIEW ===== */}
      {selectedProductIds.length > 0 && (
        <div className="bg-[#f4f0e5] rounded-2xl p-8 shadow-sm">
          <h3 className={sectionTitleClass}>
            Bundle Contents{' '}
            <span className="text-sm font-normal text-[#a8b4a4]">
              ({selectedProductIds.length} Product{selectedProductIds.length !== 1 ? 's' : ''})
            </span>
          </h3>
          <div className="space-y-2">
            {selectedProducts.map((product, idx) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#e0dcd4]"
              >
                <span className="w-6 h-6 rounded-full bg-[#a8b4a4] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#3b3b3b]">{product.title}</p>
                  <p className="text-xs text-[#a8b4a4]">
                    {product.price !== null ? `$${product.price.toFixed(2)}` : 'No price'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleProduct(product.id)}
                  className="text-xs text-[#8b5a5a] hover:text-[#6b3a3a] font-medium underline shrink-0"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== BUNDLE HEALTH ===== */}
      {selectedProductIds.length > 0 && (
        <div className="bg-[#f4f0e5] rounded-2xl p-8 shadow-sm">
          <h3 className={sectionTitleClass}>Bundle Health</h3>
          {health.healthy ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#dff4db]">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold text-[#2f5f2b]">Bundle is healthy</p>
                <p className="text-sm text-[#4a7a45]">
                  All {selectedProductIds.length} selected product(s) have prices and purchase URLs.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[#fef8f2] border border-[#f7c948]/30">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-semibold text-[#8b7a2a]">Health warnings detected</p>
                  <p className="text-sm text-[#a9812c]">
                    Review the warnings below before publishing.
                  </p>
                </div>
              </div>
              <ul className="space-y-2">
                {health.warnings.map((warning, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-white border border-[#f7c948]/20"
                  >
                    <p className="text-sm font-medium text-[#8b7a2a]">{warning.message}</p>
                    <p className="text-xs text-[#a9812c] mt-1">
                      Products: {warning.productTitles.join(', ')}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ===== BUNDLE SUMMARY CARD ===== */}
      {selectedProductIds.length > 0 && (
        <div className="bg-[#f4f0e5] rounded-2xl p-8 shadow-sm">
          <h3 className={sectionTitleClass}>Bundle Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-[#e0dcd4]">
              <p className="text-xs text-[#a8b4a4] font-medium uppercase tracking-wider">Bundle Title</p>
              <p className="text-sm font-semibold text-[#3b3b3b] mt-1">
                {title || '—'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#e0dcd4]">
              <p className="text-xs text-[#a8b4a4] font-medium uppercase tracking-wider">Parent Resource</p>
              <p className="text-sm font-semibold text-[#3b3b3b] mt-1">
                {selectedResourceTitle || '—'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#e0dcd4]">
              <p className="text-xs text-[#a8b4a4] font-medium uppercase tracking-wider">Products Selected</p>
              <p className="text-sm font-semibold text-[#3b3b3b] mt-1">
                {selectedProductIds.length} Product{selectedProductIds.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#e0dcd4]">
              <p className="text-xs text-[#a8b4a4] font-medium uppercase tracking-wider">Total Product Value</p>
              <p className="text-lg font-bold text-[#3b3b3b] mt-1">
                {pricing.display.totalProductValue}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#e0dcd4]">
              <p className="text-xs text-[#a8b4a4] font-medium uppercase tracking-wider">Bundle Price</p>
              <p className="text-lg font-bold text-[#3b3b3b] mt-1">
                {pricing.display.bundlePrice}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#e0dcd4]">
              <p className="text-xs text-[#a8b4a4] font-medium uppercase tracking-wider">Customer Savings</p>
              <p
                className={`text-lg font-bold mt-1 ${
                  pricing.savings !== null && pricing.savings > 0
                    ? 'text-[#2f5f2b]'
                    : pricing.savings !== null && pricing.savings < 0
                      ? 'text-[#8b5a5a]'
                      : 'text-[#a8b4a4]'
                }`}
              >
                {pricing.display.savings}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#e0dcd4]">
              <p className="text-xs text-[#a8b4a4] font-medium uppercase tracking-wider">Status</p>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider mt-1 ${
                  status === 'Published'
                    ? 'bg-[#dff4db] text-[#2f5f2b]'
                    : status === 'Draft'
                      ? 'bg-[#e8e5dc] text-[#6d6d6d]'
                      : 'bg-[#faf3d8] text-[#8b7a2a]'
                }`}
              >
                {status}
              </span>
            </div>
          </div>
        </div>
      )}

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

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-[#f4f0e5] transition-colors disabled:cursor-not-allowed disabled:opacity-70 bg-[#a8b4a4] hover:bg-[#8b9a8f]"
        >
          {saving ? 'Saving...' : bundle ? 'Update Bundle' : 'Create Bundle'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="w-full sm:w-auto px-6 py-3 bg-[#e0dcd4] text-[#3b3b3b] rounded-xl font-semibold hover:bg-[#d0ccc4] transition-colors disabled:cursor-not-allowed disabled:opacity-70"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
