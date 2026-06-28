'use client';

type Props = {
  title: string;
  deleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function DeleteDialog({ title, deleting, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3b3b3b]/30">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-[#3b3b3b]">Delete Resource</h3>
        <p className="mt-2 text-sm text-[#6d6d6d]">
          Are you sure you want to delete <span className="font-semibold text-[#3b3b3b]">{title}</span>?
        </p>
        <p className="mt-1 text-xs text-[#a8b4a4]">
          This will permanently delete the resource and any associated files. This action cannot be undone.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-lg border border-[#d8d2c3] px-4 py-2 text-sm font-medium text-[#5c6c57] hover:bg-[#f4f0e5] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="rounded-lg bg-[#d4a8a8] px-4 py-2 text-sm font-medium text-white hover:bg-[#c49090] transition-colors disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
