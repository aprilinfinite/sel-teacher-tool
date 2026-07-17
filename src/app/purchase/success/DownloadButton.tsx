'use client';

import { useState, useCallback } from 'react';

type Props = {
  sessionId: string;
  isBundle: boolean;
};

type DownloadItem = {
  title: string;
  downloadUrl: string;
};

type DownloadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; items: DownloadItem[]; bundleTitle?: string }
  | { status: 'error'; message: string };

/**
 * Client component that handles the download flow.
 *
 * On click:
 * 1. Calls the appropriate download API (product or bundle)
 * 2. Receives signed URLs
 * 3. Triggers download(s)
 * 4. Shows download links
 */
export function DownloadButton({ sessionId, isBundle }: Props) {
  const [state, setState] = useState<DownloadState>({ status: 'idle' });

  const handleDownload = useCallback(async () => {
    setState({ status: 'loading' });

    try {
      const endpoint = isBundle ? '/api/download/bundle' : '/api/download/product';
      const res = await fetch(`${endpoint}?session_id=${encodeURIComponent(sessionId)}`);

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Download failed' }));
        setState({ status: 'error', message: body.error || 'Download failed' });
        return;
      }

      const data = await res.json();

      if (isBundle) {
        // Bundle response: { bundleTitle, downloads: [{ title, downloadUrl }], expiresIn }
        const items: DownloadItem[] = data.downloads || [];
        if (items.length === 0) {
          setState({ status: 'error', message: 'No downloadable files found' });
          return;
        }

        setState({
          status: 'ready',
          items,
          bundleTitle: data.bundleTitle,
        });

        // Trigger all downloads
        items.forEach((item) => {
          const a = document.createElement('a');
          a.href = item.downloadUrl;
          a.download = item.title;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.click();
        });
      } else {
        // Product response: { downloadUrl, title, expiresIn }
        if (!data.downloadUrl) {
          setState({ status: 'error', message: 'No download URL returned' });
          return;
        }

        setState({
          status: 'ready',
          items: [{ title: data.title, downloadUrl: data.downloadUrl }],
        });

        // Trigger download
        const a = document.createElement('a');
        a.href = data.downloadUrl;
        a.download = data.title;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.click();
      }
    } catch (err) {
      console.error('[DownloadButton] Error:', err instanceof Error ? err.message : String(err));
      setState({ status: 'error', message: 'Failed to process download' });
    }
  }, [sessionId, isBundle]);

  // --- Error State ---
  if (state.status === 'error') {
    return (
      <div className="space-y-3">
        <div className="rounded-[20px] border border-[#fde8e8] bg-[#fde8e8] p-4 text-center">
          <p className="text-sm font-medium text-[#8b2a2a]">{state.message}</p>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex w-full items-center justify-center rounded-full bg-[#a8b8a0] px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-[#97a78f]"
        >
          Try Again
        </button>
      </div>
    );
  }

  // --- Ready State (show download links) ---
  if (state.status === 'ready') {
    return (
      <div className="space-y-3">
        {isBundle ? (
          <div className="rounded-[20px] border border-[#e6e0d0] bg-[#f8f7f4] p-4">
            <p className="text-sm font-semibold text-[#2f3b31] mb-2">
              {state.bundleTitle || 'Bundle'} — Downloads
            </p>
            <div className="space-y-2">
              {state.items.map((item, idx) => (
                <a
                  key={idx}
                  href={item.downloadUrl}
                  download={item.title}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-[#e6e0d0] bg-white p-3 text-sm font-medium text-[#2f3b31] transition hover:bg-[#eef3e9] hover:border-[#a8b8a0]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef3e9] text-xs">
                    📄
                  </span>
                  <span className="flex-1">Download PDF {idx + 1}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        ) : (
          <a
            href={state.items[0]?.downloadUrl || '#'}
            download={state.items[0]?.title}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#a8b8a0] px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-[#97a78f]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download {state.items[0]?.title || 'Product'}
          </a>
        )}
      </div>
    );
  }

  // --- Idle / Loading State ---
  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={state.status === 'loading'}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#a8b8a0] px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-[#97a78f] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {state.status === 'loading' ? (
        <>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Preparing Download...
        </>
      ) : (
        <>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {isBundle ? 'Download Bundle' : 'Download Product'}
        </>
      )}
    </button>
  );
}
