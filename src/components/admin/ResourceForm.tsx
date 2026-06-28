'use client';

import { useEffect, useState } from 'react';
import type { ResourceItem } from '@/services/resources/resourceTypes';

interface ResourceFormData {
  title: string;
  description: string;
  category: string;
  gradeLevel: string[];
  topicTag: string;
  timeNeeded: string;
  selSkill: string;
  learnerNeed: string;
  situation: string;
  resourceFormat: string;
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  featured: boolean;
  thumbnailFile: File | null;
  pdfFile: File | null;
}

const EMPTY: ResourceFormData = {
  title: '', description: '', category: 'Prevent', gradeLevel: [],
  topicTag: '', timeNeeded: '', selSkill: '', learnerNeed: '', situation: '',
  resourceFormat: '', seoTitle: '', seoDescription: '', focusKeyword: '',
  featured: false, thumbnailFile: null, pdfFile: null,
};

function resourceToFormData(r: ResourceItem): ResourceFormData {
  return {
    title: r.title, description: '', category: r.category,
    gradeLevel: (r.gradeLevel || '').split(',').map(s => s.trim()).filter(Boolean),
    topicTag: '', timeNeeded: '', selSkill: '', learnerNeed: '', situation: '',
    resourceFormat: r.resourceFormat || '', seoTitle: '', seoDescription: '', focusKeyword: '',
    featured: r.featured, thumbnailFile: null, pdfFile: null,
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

  useEffect(() => {
    if (editing && resource) {
      setFormData(resourceToFormData(resource));
    } else {
      setFormData(EMPTY);
    }
  }, [editing, resource]);
    
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: 'thumbnailFile' | 'pdfFile'
  ) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      [fileType]: file,
    }));
  };

  const handleGradeLevelChange = (level: string) => {
    setFormData((prev) => ({
      ...prev,
      gradeLevel: prev.gradeLevel.includes(level)
        ? prev.gradeLevel.filter((g) => g !== level)
        : [...prev.gradeLevel, level],
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Prevent',
      gradeLevel: [],
      topicTag: '',
      timeNeeded: '',
      selSkill: '',
      learnerNeed: '',
      situation: '',
      resourceFormat: '',
      seoTitle: '',
      seoDescription: '',
      focusKeyword: '',
      featured: false,
      thumbnailFile: null,
      pdfFile: null,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    setStatusType(null);

    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('description', formData.description);
    payload.append('category', formData.category);
    payload.append('gradeLevel', JSON.stringify(formData.gradeLevel));
    payload.append('topicTag', formData.topicTag);
    payload.append('timeNeeded', formData.timeNeeded);
    payload.append('selSkill', formData.selSkill);
    payload.append('learnerNeed', formData.learnerNeed);
    payload.append('situation', formData.situation);
    payload.append('resourceFormat', formData.resourceFormat);
    payload.append('seoTitle', formData.seoTitle);
    payload.append('seoDescription', formData.seoDescription);
    payload.append('focusKeyword', formData.focusKeyword);
    payload.append('featured', String(formData.featured));

    if (formData.thumbnailFile) {
      payload.append('thumbnail', formData.thumbnailFile);
    }
    if (formData.pdfFile) {
      payload.append('pdf', formData.pdfFile);
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

      setStatusMessage('Resource saved successfully.');
      setStatusType('success');
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

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#f4f0e5] rounded-2xl p-8 shadow-sm max-w-4xl"
    >
      {/* Basic Information */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#3b3b3b] mb-6">
          Basic Information
        </h2>

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
              placeholder="Resource title"
              className="w-full px-4 py-3 rounded-xl border border-[#e0dcd4] bg-white text-[#3b3b3b] placeholder-[#a8b4a4] focus:outline-none focus:ring-2 focus:ring-[#a8b4a4]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-[#3b3b3b] mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Detailed description of the resource"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-[#e0dcd4] bg-white text-[#3b3b3b] placeholder-[#a8b4a4] focus:outline-none focus:ring-2 focus:ring-[#a8b4a4]"
            />
          </div>

          {/* Category & Grade Level */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#3b3b3b] mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-[#e0dcd4] bg-white text-[#3b3b3b] focus:outline-none focus:ring-2 focus:ring-[#a8b4a4]"
              >
                <option value="Prevent">Prevent</option>
                <option value="Respond">Respond</option>
                <option value="Recover">Recover</option>
                <option value="Teacher Support">Teacher Support</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#3b3b3b] mb-2">
                Grade Level
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['K-2', '3-5', '6-8', '9-10', '11-12', 'All Grades'].map((level) => (
                  <label key={level} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.gradeLevel.includes(level)}
                      onChange={() => handleGradeLevelChange(level)}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                    <span className="text-sm text-[#3b3b3b]">{level}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Topic Tag & Time Needed */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#3b3b3b] mb-2">
                Topic Tag
              </label>
              <input
                type="text"
                name="topicTag"
                value={formData.topicTag}
                onChange={handleInputChange}
                placeholder="e.g., Mindfulness, Communication"
                className="w-full px-4 py-3 rounded-xl border border-[#e0dcd4] bg-white text-[#3b3b3b] placeholder-[#a8b4a4] focus:outline-none focus:ring-2 focus:ring-[#a8b4a4]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#3b3b3b] mb-2">
                Time Needed
              </label>
              <input
                type="text"
                name="timeNeeded"
                value={formData.timeNeeded}
                onChange={handleInputChange}
                placeholder="e.g., 15 minutes"
                className="w-full px-4 py-3 rounded-xl border border-[#e0dcd4] bg-white text-[#3b3b3b] placeholder-[#a8b4a4] focus:outline-none focus:ring-2 focus:ring-[#a8b4a4]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Resource Details */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#3b3b3b] mb-6">
          Resource Details
        </h2>

        <div className="space-y-4">
          {/* SEL Skill & Learner Need */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#3b3b3b] mb-2">
                SEL Skill
              </label>
              <input
                type="text"
                name="selSkill"
                value={formData.selSkill}
                onChange={handleInputChange}
                placeholder="e.g., Self-Awareness, Empathy"
                className="w-full px-4 py-3 rounded-xl border border-[#e0dcd4] bg-white text-[#3b3b3b] placeholder-[#a8b4a4] focus:outline-none focus:ring-2 focus:ring-[#a8b4a4]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#3b3b3b] mb-2">
                Learner Need
              </label>
              <input
                type="text"
                name="learnerNeed"
                value={formData.learnerNeed}
                onChange={handleInputChange}
                placeholder="e.g., Building Confidence"
                className="w-full px-4 py-3 rounded-xl border border-[#e0dcd4] bg-white text-[#3b3b3b] placeholder-[#a8b4a4] focus:outline-none focus:ring-2 focus:ring-[#a8b4a4]"
              />
            </div>
          </div>

          {/* Situation & Resource Format */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#3b3b3b] mb-2">
                Situation
              </label>
              <input
                type="text"
                name="situation"
                value={formData.situation}
                onChange={handleInputChange}
                placeholder="e.g., Classroom, Individual"
                className="w-full px-4 py-3 rounded-xl border border-[#e0dcd4] bg-white text-[#3b3b3b] placeholder-[#a8b4a4] focus:outline-none focus:ring-2 focus:ring-[#a8b4a4]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#3b3b3b] mb-2">
                Resource Format
              </label>
              <select
                name="resourceFormat"
                value={formData.resourceFormat}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-[#e0dcd4] bg-white text-[#3b3b3b] focus:outline-none focus:ring-2 focus:ring-[#a8b4a4]"
              >
                <option value="">Select format</option>
                <option value="Lesson Plan">Lesson Plan</option>
                <option value="Activity">Activity</option>
                <option value="Template">Template</option>
                <option value="Guide">Guide</option>
                <option value="Worksheet">Worksheet</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Information */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#3b3b3b] mb-6">
          SEO Information
        </h2>

        <div className="space-y-4">
          {/* SEO Title */}
          <div>
            <label className="block text-sm font-semibold text-[#3b3b3b] mb-2">
              SEO Title
            </label>
            <input
              type="text"
              name="seoTitle"
              value={formData.seoTitle}
              onChange={handleInputChange}
              placeholder="SEO page title (50-60 characters)"
              maxLength={60}
              className="w-full px-4 py-3 rounded-xl border border-[#e0dcd4] bg-white text-[#3b3b3b] placeholder-[#a8b4a4] focus:outline-none focus:ring-2 focus:ring-[#a8b4a4]"
            />
            <p className="text-xs text-[#a8b4a4] mt-1">
              {formData.seoTitle.length}/60 characters
            </p>
          </div>

          {/* SEO Description */}
          <div>
            <label className="block text-sm font-semibold text-[#3b3b3b] mb-2">
              SEO Description
            </label>
            <textarea
              name="seoDescription"
              value={formData.seoDescription}
              onChange={handleInputChange}
              placeholder="Meta description (150-160 characters)"
              rows={2}
              maxLength={160}
              className="w-full px-4 py-3 rounded-xl border border-[#e0dcd4] bg-white text-[#3b3b3b] placeholder-[#a8b4a4] focus:outline-none focus:ring-2 focus:ring-[#a8b4a4]"
            />
            <p className="text-xs text-[#a8b4a4] mt-1">
              {formData.seoDescription.length}/160 characters
            </p>
          </div>

          {/* Focus Keyword */}
          <div>
            <label className="block text-sm font-semibold text-[#3b3b3b] mb-2">
              Focus Keyword
            </label>
            <input
              type="text"
              name="focusKeyword"
              value={formData.focusKeyword}
              onChange={handleInputChange}
              placeholder="Primary SEO keyword"
              className="w-full px-4 py-3 rounded-xl border border-[#e0dcd4] bg-white text-[#3b3b3b] placeholder-[#a8b4a4] focus:outline-none focus:ring-2 focus:ring-[#a8b4a4]"
            />
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

      {/* Featured & Actions */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <input
            type="checkbox"
            name="featured"
            id="featured"
            checked={formData.featured}
            onChange={handleInputChange}
            className="w-5 h-5 rounded cursor-pointer"
          />
          <label
            htmlFor="featured"
            className="text-sm font-semibold text-[#3b3b3b] cursor-pointer"
          >
            Featured Resource
          </label>
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
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-3 rounded-xl font-semibold text-[#f4f0e5] transition-colors disabled:cursor-not-allowed disabled:opacity-70 bg-[#a8b4a4] hover:bg-[#8b9a8f]"
        >
          {isSaving ? 'Saving...' : 'Save Resource'}
        </button>
        <button
          type="button"
          onClick={() => { if (editing && onCancel) { onCancel(); } else { resetForm(); } }}
          disabled={isSaving}
          className="px-6 py-3 bg-[#e0dcd4] text-[#3b3b3b] rounded-xl font-semibold hover:bg-[#d0ccc4] transition-colors disabled:cursor-not-allowed disabled:opacity-70"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
