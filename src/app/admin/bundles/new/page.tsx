'use client';

import { useRouter } from 'next/navigation';
import BundleForm from '@/components/admin/BundleForm';

export default function NewBundlePage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/admin/resources');
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
          Create a new bundle by selecting a parent resource and choosing upsell products.
        </p>
      </div>

      <BundleForm
        resourceId={null}
        resourceTitle=""
        onSuccess={handleSuccess}
        onCancel={() => router.push('/admin/resources')}
      />
    </div>
  );
}
