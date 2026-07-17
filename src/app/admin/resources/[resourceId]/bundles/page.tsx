'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BundleForm from '@/components/admin/BundleForm';

export default function ResourceBundlePage() {
  const router = useRouter();
  const params = useParams<{ resourceId: string }>();
  const resourceId = parseInt(params.resourceId, 10);

  const [resourceTitle, setResourceTitle] = useState<string>('');

  const fetchResourceInfo = useCallback(async () => {
    if (!resourceId) return;
    try {
      const res = await fetch(`/api/admin/resources/${resourceId}`);
      if (!res.ok) return;
      const data = await res.json();
      setResourceTitle(data.title ?? '');
    } catch {
      // Silently fail — title is cosmetic
    }
  }, [resourceId]);

  useEffect(() => {
    if (!resourceId) return;
    fetchResourceInfo();
  }, [resourceId, fetchResourceInfo]);

  const handleSuccess = () => {
    // Stay on the page — the form will show the updated state
    fetchResourceInfo();
  };

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => router.push('/admin/resources')}
          className="mb-2 text-[#a8b4a4] hover:text-[#8b9a8f] font-medium flex items-center gap-2 text-sm"
        >
          ← Back to Content Library
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-[#3b3b3b]">
          Bundle Builder
        </h1>
        <p className="text-sm md:text-base text-[#a8b4a4]">
          Create and manage bundles for{' '}
          <span className="font-semibold text-[#3b3b3b]">
            {resourceTitle || 'this resource'}
          </span>
        </p>
      </div>

      <BundleForm
        resourceId={resourceId}
        resourceTitle={resourceTitle}
        onSuccess={handleSuccess}
        onCancel={() => router.push('/admin/resources')}
      />
    </div>
  );
}
