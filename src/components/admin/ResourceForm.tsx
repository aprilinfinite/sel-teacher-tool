'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import type { ResourceItem } from '@/services/resources/resourceTypes';
import { RESOURCE_TYPE_OPTIONS } from '@/services/resources/resourceTypes';

interface ResourceFormData {
  title: string;
  slug: string;
  category: string;
  status: string;
  featured: boolean;
  displayOrder: number;
  shortDescription: string;
  resourceDescription: string;
  tags: string;
  gradeLevel: string[];
  timeNeeded: string;
  materialsNeeded: string;
  resourceType: string;
}

const GRADE_OPTIONS = [
  'Pre-K',
  'Kindergarten',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Middle School',
  'High School',
];

const DURATION_OPTIONS = [
  '5 Minutes',
  '10 Minutes',
  '15 Minutes',
  '30 Minutes',
  'Flexible',
];

const EMPTY: ResourceFormData = {
  title: '',
  slug: '',
  category: 'Prevent',
  status: 'draft',
  featured: false,
  displayOrder: 0,
  shortDescription: '',
  resourceDescription: '',
  tags: '',
  gradeLevel: [],
  timeNeeded: '',
  materialsNeeded: '',
  resourceType: '',
};

function resourceToFormData(r: ResourceItem): ResourceFormData {
  return {
    title: r.title,
    slug: r.slug,
    category: r.category,
    status: r.status,
    featured: r.featured,
    displayOrder: r.displayOrder,
    shortDescription: r.shortDescription ?? '',
    resourceDescription: r.resourceDescription ?? '',
    tags: r.tags ?? '',
    gradeLevel: r.gradeLevel ? r.gradeLevel.split(', ').filter(Boolean) : [],
    timeNeeded: r.timeNeeded ?? '',
    materialsNeeded: r.materialsNeeded ?? '',
    resourceType: r.resourceType ?? '',
  };
}

type Props = {
  onSuccess?: () => void;
  onCancel?: () => void;
  editing?: boolean;
  resource?: ResourceItem | null;
};

export default function ResourceForm({ onSuccess, onCancel, editing, resource }: Props) {
  const [formData, setFormData] = useState<ResourceFormData>(EMPTY);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [currentThumbnail, setCurrentThumbnail] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<{ name: string; url: string } | null>(null);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);
  const [removeFile, setRemoveFile] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const pendingNavigation = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (editing && resource) {
      setFormData(resourceToFormData(resource));
      setCurrentThumbnail(resource.thumbnailPath);
      setThumbnailPreview(resource.thumbnailPath);
      if (resource.filePath) {
        const fileName = resource.filePath.split('/').pop() || 'resource.pdf';
        setCurrentFile({ name: fileName, url: resource.filePath });
      }
    } else {
      setFormData(EMPTY);
      setThumbnailPreview(null);
      setCurrentThumbnail(null);
      setCurrentFile(null);
      setRemoveThumbnail(false);
      setRemoveFile(false);
    }
    setIsDirty(false);
  }, [editing, resource]);

  // Unsaved changes warning
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const markDirty = useCallback(() => {
    if (!isDirty) setIsDirty(true);
  }, [isDirty]);

  const resourceId = editing && resource ? resource.id : null;

  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    markDirty();
  };

  const handleGradeToggle = (grade: string) => {
    setFormData((prev) => ({
      ...prev,
      gradeLevel: prev.gradeLevel.includes(grade)
        ? prev.gradeLevel.filter((g) => g !== grade)
        : [...prev.gradeLevel, grade],
    }));
    markDirty();
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
      markDirty();
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailPreview(null);
    setRemoveThumbnail(true);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
    markDirty();
  };

  const handleRemoveFile = () => {
    setCurrentFile(null);
    setRemoveFile(true);
    if (pdfInputRef.current) {
      pdfInputRef.current.value = '';
    }
    markDirty();
  };

  const resetForm = () => {
    setFormData(EMPTY);
    setThumbnailPreview(null);
    setCurrentThumbnail(null);
    setCurrentFile(null);
    setRemoveThumbnail(false);
    setRemoveFile(false);
    setIsDirty(false);
  };

  const handleCancelClick = () => {
    if (isDirty) {
      setShowLeaveWarning(true);
      pendingNavigation.current = () => {
        setShowLeaveWarning(false);
        setIsDirty(false);
        if (editing && onCancel) { onCancel(); } else { resetForm(); }
      };
    } else {
      if (editing && onCancel) { onCancel(); } else { resetForm(); }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setStatusMessage(null);
    setStatusType(null);

    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('slug', formData.slug);
    payload.append('category', formData.category);
    payload.append('status', formData.status);
    payload.append('featured', String(formData.featured));
    payload.append('display_order', String(formData.displayOrder));
    payload.append('short_description', formData.shortDescription);
    payload.append('resource_description', formData.resourceDescription);
    payload.append('tags', formData.tags);
    payload.append('gradeLevel', JSON.stringify(formData.gradeLevel));
    payload.append('time_needed', formData.timeNeeded);
    payload.append('materials_needed', formData.materialsNeeded);
    payload.append('resource_type', formData.resourceType);

    // Handle thumbnail removal
    if (removeThumbnail) {
      payload.append('remove_thumbnail', 'true');
    }

    // Handle file removal
    if (removeFile) {
      payload.append('remove_file', 'true');
    }

    // Append thumbnail file if selected
    const thumbnailFile = thumbnailInputRef.current?.files?.[0];
    if (thumbnailFile) {
      payload.append('thumbnail', thumbnailFile);
    }

    // Append PDF file if selected
    const pdfFile = pdfInputRef.current?.files?.[0];
    if (pdfFile) {
      payload.append('pdf', pdfFile);
    }

    const adminToken = typeof window !== 'undefined'
      ? localStorage.getItem('adminToken') || localStorage.getItem('token') || null
      : null;

    try {
      const url = editing && resource
        ? `/api/admin/resources/${resource.id}`
        : '/api/upload/resource';
      const method = editing && resource ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined,
        body: payload,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Unable to save resource.');
      }

      setStatusMessage(editing ? '✓ Resource updated' : '✓ Resource created');
      setStatusType('success');

      setIsDirty(false);
      resetForm();
      onSuccess?.();
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : 'Failed to save resource.'
      );
      setStatusType('error');
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-[#e0dcd4] bg-white text-[#3b3b3b] placeholder-[#a8b4a4] focus:outline-none focus:ring-2 focus:ring-[#a8b4a4]";
  const labelClass = "block text-sm font-semibold text-[#3b3b3b] mb-2";
  const sectionTitleClass = "text-lg font-bold text-[#3b3b3b] mb-4 pb-2 border-b border-[#e0dcd4]";

  return (
    <>
      {/* Unsaved Changes Warning */}
      {showLeaveWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3b3b3b]/30">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-[#3b3b3b]">You have unsaved changes.</h3>
            <p className="mt-2 text-sm text-[#6d6d6d]">
              Are you sure you want to leave? Your changes will not be saved.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLeaveWarning(false)}
                className="rounded-lg border border-[#d8d2c3] px-4 py-2.5 text-sm font-medium text-[#5c6c57] hover:bg-[#f4f0e5] transition-colors"
              >
                Stay Editing
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLeaveWarning(false);
                  setIsDirty(false);
                  pendingNavigation.current?.();
                }}
                className="rounded-lg bg-[#d4a8a8] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#c49090] transition-colors"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
        {/* ===== RESOURCE INFORMATION ===== */}
        <div className="bg-[#f4f0e5] rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-[#3b3b3b] mb-6">
            {editing ? 'Edit Resource' : 'New Resource'}
          </h2>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className={labelClass}>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Resource title"
                className={inputClass}
              />
            </div>

            {/* Slug (editable for existing resources) */}
            <div>
              <label className={labelClass}>Slug</label>
              <p className="text-xs text-[#a8b4a4] mb-2">Auto-generated from title. Can be edited manually.</p>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="resource-slug"
                className={inputClass}
              />
            </div>

            {/* Category, Status, Display Order */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={inputClass}
                >
                  <option value="Prevent">Prevent</option>
                  <option value="Respond">Respond</option>
                  <option value="Recover">Recover</option>
                  <option value="Teacher Support">Teacher Support</option>
                </select>
              </div>

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
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleInputChange}
                  placeholder="0"
                  min={0}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Featured */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="featured"
                id="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="w-5 h-5 rounded cursor-pointer"
              />
              <label htmlFor="featured" className="text-sm font-semibold text-[#3b3b3b] cursor-pointer">
                Featured Resource
              </label>
            </div>
          </div>
        </div>

        {/* ===== DESCRIPTIONS ===== */}
        <div className="bg-[#f4f0e5] rounded-2xl p-8 shadow-sm">
          <h3 className={sectionTitleClass}>Descriptions</h3>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Short Description *</label>
              <p className="text-xs text-[#a8b4a4] mb-2">Used for resource cards. Keep it to 1–2 sentences.</p>
              <textarea
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                rows={3}
                placeholder="Brief description for resource cards..."
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Resource Description *</label>
              <p className="text-xs text-[#a8b4a4] mb-2">Long-form description shown on the resource page.</p>
              <textarea
                name="resourceDescription"
                value={formData.resourceDescription}
                onChange={handleInputChange}
                rows={6}
                placeholder="Detailed description of the resource..."
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* ===== UPLOADS ===== */}
        <div className="bg-[#f4f0e5] rounded-2xl p-8 shadow-sm">
          <h3 className={sectionTitleClass}>Uploads</h3>
          <div className="space-y-6">
            {/* Thumbnail */}
            <div>
              <label className={labelClass}>Thumbnail Image</label>
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
              {/* Thumbnail Preview */}
              {(thumbnailPreview || currentThumbnail) && (
                <div className="mt-4">
                  <p className="text-xs text-[#a8b4a4] mb-2">Preview:</p>
                  <div className="w-40 h-40 rounded-xl border border-[#e0dcd4] overflow-hidden bg-white">
                    <img
                      src={thumbnailPreview || currentThumbnail || ''}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Free Resource PDF */}
            <div>
              <label className={labelClass}>Free Resource PDF</label>
              <p className="text-xs text-[#a8b4a4] mb-2">Accepted: PDF. Only one file per resource.</p>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept=".pdf"
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
              {/* Current File Info */}
              {currentFile && !removeFile && (
                <div className="mt-4 p-4 rounded-xl border border-[#e0dcd4] bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#3b3b3b]">{currentFile.name}</p>
                      <p className="text-xs text-[#a8b4a4]">Current file</p>
                    </div>
                    <a
                      href={currentFile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-[#a8b4a4] text-[#f4f0e5] text-sm font-semibold hover:bg-[#8b9a8f] transition-colors"
                    >
                      Download
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== CLASSIFICATION ===== */}
        <div className="bg-[#f4f0e5] rounded-2xl p-8 shadow-sm">
          <h3 className={sectionTitleClass}>Classification</h3>
          <div className="space-y-4">
            {/* Resource Type */}
            <div>
              <label className={labelClass}>Resource Type *</label>
              <select
                name="resourceType"
                value={formData.resourceType}
                onChange={handleInputChange}
                className={inputClass}
              >
                <option value="">Select resource type...</option>
                {RESOURCE_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className={labelClass}>Tags</label>
              <p className="text-xs text-[#a8b4a4] mb-2">Comma-separated. Examples: Morning Routine, SEL, Calming, Reflection</p>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="e.g. SEL, Calming, Visual Supports"
                className={inputClass}
              />
            </div>

            {/* Grade Level */}
            <div>
              <label className={labelClass}>Grade Level (Optional)</label>
              <p className="text-xs text-[#a8b4a4] mb-2">Select all that apply.</p>
              <div className="flex flex-wrap gap-2">
                {GRADE_OPTIONS.map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => handleGradeToggle(grade)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      formData.gradeLevel.includes(grade)
                        ? 'bg-[#a8b4a4] text-[#f4f0e5]'
                        : 'bg-white border border-[#e0dcd4] text-[#3b3b3b] hover:border-[#a8b4a4]'
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated Duration */}
            <div>
              <label className={labelClass}>Estimated Duration (Optional)</label>
              <select
                name="timeNeeded"
                value={formData.timeNeeded}
                onChange={handleInputChange}
                className={inputClass}
              >
                <option value="">Select duration...</option>
                {DURATION_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Materials Needed */}
            <div>
              <label className={labelClass}>Materials Needed (Optional)</label>
              <p className="text-xs text-[#a8b4a4] mb-2">One per line. Example: Printer, Scissors, Laminator, Markers</p>
              <textarea
                name="materialsNeeded"
                value={formData.materialsNeeded}
                onChange={handleInputChange}
                rows={3}
                placeholder="Printer&#10;Scissors&#10;Laminator&#10;Markers"
                className={inputClass}
              />
            </div>
          </div>
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-[#f4f0e5] transition-colors disabled:cursor-not-allowed disabled:opacity-70 bg-[#a8b4a4] hover:bg-[#8b9a8f]"
          >
            {isSaving ? 'Saving...' : 'Save Resource'}
          </button>
          <button
            type="button"
            onClick={handleCancelClick}
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-3 bg-[#e0dcd4] text-[#3b3b3b] rounded-xl font-semibold hover:bg-[#d0ccc4] transition-colors disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}
