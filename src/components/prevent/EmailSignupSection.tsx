'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useDownloadGate } from '@/components/shared/DownloadGate';
import { useSignupSpotlight, getSpotlightMessage } from '@/components/shared/SignupSpotlight';

type Props = {
  /**
   * Identifies how the visitor reached the signup form.
   * Use the standardized values:
   *   "start_here"    — Homepage "Start Here" button
   *   "download_gate" — Download Gate triggered
   *   "website"       — Direct / other
   */
  signupSource?: string;
  /** Optional callback fired after a successful subscription. */
  onSuccess?: () => void;
};

function detectLandingPage(): string {
  if (typeof window === 'undefined') return 'website';
  const path = window.location.pathname;
  if (path.includes('/prevent')) return 'prevent';
  if (path.includes('/respond')) return 'respond';
  if (path.includes('/recover')) return 'recover';
  if (path.includes('/teacher-support')) return 'teacher-support';
  if (path === '/' || path === '') return 'homepage';
  return 'website';
}

function getAccentTheme(pathname: string) {
  if (pathname.includes('/respond')) {
    return {
      sectionBg: '#E8F1FB',
      joinBtnBg: '#5DADE2',
      joinBtnHover: '#4a9bd0',
      joinBtnText: '#FFFFFF',
      downloadBorder: '#5DADE2',
      downloadBg: '#E8F1FB',
      downloadText: '#2E3A47',
      inputFocusBorder: '#5DADE2',
      inputFocusRing: '#BFD7F2',
    };
  }
  if (pathname.includes('/recover')) {
    return {
      sectionBg: '#EDE8F7',
      joinBtnBg: '#8E7CC3',
      joinBtnHover: '#7a68b0',
      joinBtnText: '#FFFFFF',
      downloadBorder: '#8E7CC3',
      downloadBg: '#F7F2FB',
      downloadText: '#2E2A3A',
      inputFocusBorder: '#8E7CC3',
      inputFocusRing: '#CBB9E8',
    };
  }
  if (pathname.includes('/teacher-support')) {
    return {
      sectionBg: '#FFF0E2',
      joinBtnBg: '#FF9D6E',
      joinBtnHover: '#e88a5e',
      joinBtnText: '#FFFFFF',
      downloadBorder: '#FF9D6E',
      downloadBg: '#FFF0E2',
      downloadText: '#4A4A4A',
      inputFocusBorder: '#FF9D6E',
      inputFocusRing: '#FFD5C2',
    };
  }
  // Default (prevent / homepage)
  return {
    sectionBg: '#fbf2d9',
    joinBtnBg: '#a8b8a0',
    joinBtnHover: '#8f9e86',
    joinBtnText: '#FFFFFF',
    downloadBorder: '#f7c948',
    downloadBg: '#fef9ea',
    downloadText: '#5c5030',
    inputFocusBorder: '#a8b8a0',
    inputFocusRing: '#dbe7d4',
  };
}

export default function EmailSignupSection({
  signupSource = 'website',
  onSuccess,
}: Props) {
  const pathname = usePathname();
  const accent = getAccentTheme(pathname);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const { hasPendingDownload, clearPendingDownload, pendingResourceTitle } = useDownloadGate();
  const { isActive: spotlightActive, source: spotlightSource, deactivateSpotlight } = useSignupSpotlight();
  // When the download gate triggered the flow, override the source
  const effectiveSource = hasPendingDownload ? 'download_gate' : signupSource;

  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (submitting) return;

      setSubmitting(true);
      setFeedback(null);

      try {
        const landingPage = detectLandingPage();

        const res = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            signupSource: effectiveSource,
            firstResource: pendingResourceTitle,
            landingPage,
          }),
        });

        const data = await res.json();

        if (data.ok) {
          const successMessage = hasPendingDownload
            ? "✓ You're all set! Your download is starting..."
            : "✓ You're all set! Welcome to the community.";

          setFeedback({ ok: true, message: successMessage });
          setName('');
          setEmail('');
          clearPendingDownload();
          onSuccess?.();

          // If spotlight is active, close it after a brief delay
          if (spotlightActive) {
            successTimerRef.current = setTimeout(() => {
              deactivateSpotlight();
            }, 1000);
          }
        } else {
          setFeedback({ ok: false, message: data.message || 'Something went wrong.' });
        }
      } catch {
        setFeedback({ ok: false, message: 'Network error. Please try again.' });
      } finally {
        setSubmitting(false);
      }
    },
    [name, email, effectiveSource, pendingResourceTitle, submitting, clearPendingDownload, onSuccess, spotlightActive, deactivateSpotlight, hasPendingDownload],
  );

  // Determine the contextual spotlight message
  const spotlightMessage =
    spotlightActive && spotlightSource ? getSpotlightMessage(spotlightSource) : null;

  // Elevated styles when spotlight is active
  const sectionClasses = spotlightActive
    ? 'rounded-[24px] md:rounded-[40px] p-5 md:p-8 relative z-50 shadow-[0_20px_80px_-20px_rgba(59,59,59,0.3)] scale-[1.02] transition-[transform,box-shadow] duration-300 ease-out'
    : 'rounded-[24px] md:rounded-[40px] p-5 md:p-8 shadow-sm';

  return (
    <section id="bottom-signup" className={sectionClasses} style={{ backgroundColor: accent.sectionBg }}>
      {/* Spotlight contextual message */}
      {spotlightMessage && (
        <div className="mb-6 rounded-2xl border border-[#a8b8a0]/30 bg-[#eef3e9] px-5 py-4 text-sm text-[#3b4b36]">
          {spotlightMessage}
        </div>
      )}

      {/* Download gate message (shown when no spotlight is active but download is pending) */}
      {!spotlightActive && hasPendingDownload && (
        <div className="mb-6 rounded-2xl border px-5 py-4 text-sm" style={{ borderColor: accent.downloadBorder, backgroundColor: accent.downloadBg, color: accent.downloadText }}>
          Unlock all free downloads by joining our free resource list. You&rsquo;ll only need to do this once on this browser.
        </div>
      )}
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-6 md:gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-[-0.03em] text-[#2f3b31]">
              Get free classroom wellness resources delivered weekly.
            </h2>
            <p className="mt-3 md:mt-4 text-sm text-[#5c6c57]">
              Practical emotional wellness tools, calming classroom activities, and SEL support for educators who need simple resources that actually work.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 md:gap-4 rounded-[24px] md:rounded-[32px] border border-[#e5e1d6] bg-white p-5 md:p-6 shadow-sm sm:flex-row sm:items-end"
          >
            <label className="flex-1">
              <span className="mb-2 block text-sm font-medium text-[#4f5e4f]">Name</span>
              <input
                ref={nameRef}
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                className="w-full rounded-3xl border border-[#d8d2c5] bg-[#faf7f1] px-4 py-3 text-sm text-[#2f3b31] outline-none transition"
                style={{ borderColor: '#d8d2c5' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = accent.inputFocusBorder; e.currentTarget.style.boxShadow = `0 0 0 2px ${accent.inputFocusRing}`; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#d8d2c5'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </label>
            <label className="flex-1">
              <span className="mb-2 block text-sm font-medium text-[#4f5e4f]">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-3xl border border-[#d8d2c5] bg-[#faf7f1] px-4 py-3 text-sm text-[#2f3b31] outline-none transition"
                style={{ borderColor: '#d8d2c5' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = accent.inputFocusBorder; e.currentTarget.style.boxShadow = `0 0 0 2px ${accent.inputFocusRing}`; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#d8d2c5'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </label>
            <button
              type="submit"
              className="w-full sm:w-auto rounded-3xl px-6 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-[#c5c8b8]"
              style={{ backgroundColor: accent.joinBtnBg, color: accent.joinBtnText }}
              onMouseEnter={(e) => { if (!submitting && name && email) e.currentTarget.style.backgroundColor = accent.joinBtnHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = accent.joinBtnBg; }}
              disabled={!name || !email || submitting}
            >
              {submitting ? 'Joining...' : 'Join'}
            </button>
          </form>
        </div>
        {feedback && (
          <p
            className={`mt-5 text-sm ${
              feedback.ok ? 'text-[#3b4b36]' : 'text-[#8b2a2a]'
            }`}
          >
            {feedback.message}
          </p>
        )}
      </div>
    </section>
  );
}
