'use client';

import { useState, useMemo } from 'react';
import ResourceForm from '@/components/admin/ResourceForm';
import ResourceProvider, { useResources } from '@/components/admin/ResourceProvider';
import ResourceTable from '@/components/admin/ResourceTable';
import ResourceToolbar from '@/components/admin/ResourceToolbar';
import ResourcePagination from '@/components/admin/ResourcePagination';
import DeleteDialog from '@/components/admin/DeleteDialog';

function ResourceListSection() {
  const { resources, pagination, query, loading, error, setQuery, refresh, selectedResource, editing, startEdit, cancelEdit, isDeleting, deleteResource, updateStatus, updateFeatured } = useResources();
  const [showForm, setShowForm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const handleFormSuccess = () => { setShowForm(false); cancelEdit(); refresh(); };
  const handleCancel = () => { setShowForm(false); cancelEdit(); };

  const deleteTargetResource = useMemo(
    () => deleteTargetId ? resources.find(r => r.id === deleteTargetId) : null,
    [deleteTargetId, resources],
  );

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteResource(deleteTargetId);
      setDeleteTargetId(null);
    } catch {
      // Error stays in dialog — user can retry
    }
  };

  if (showForm || editing) {
    return (
      <div>
        <button
          onClick={handleCancel}
          className="mb-6 text-[#a8b4a4] hover:text-[#8b9a8f] font-medium flex items-center gap-2"
        >
          ← Back to Resources
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
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto bg-[#a8b4a4] text-[#f4f0e5] px-6 py-3 rounded-xl font-medium hover:bg-[#8b9a8f] transition-colors text-center"
        >
          + Add New Resource
        </button>
      </div>

      <ResourceToolbar query={query} onQueryChange={setQuery} onRefresh={refresh} />

      <ResourceTable
        resources={resources}
        loading={loading}
        error={error}
        onRetry={refresh}
        onEdit={(id) => startEdit(id)}
        onDelete={(id) => setDeleteTargetId(id)}
        onStatusChange={(id, status) => updateStatus(id, status)}
        onFeaturedChange={(id, featured) => updateFeatured(id, featured)}
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
          onCancel={() => setDeleteTargetId(null)}
        />
      )}
    </>
  );
}

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#3b3b3b]">Resources</h1>
        <p className="text-sm md:text-base text-[#a8b4a4]">Manage all resources across categories</p>
      </div>

      <ResourceProvider>
        <ResourceListSection />
      </ResourceProvider>
    </div>
  );
}
