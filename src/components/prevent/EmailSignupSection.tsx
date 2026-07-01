'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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

export default function EmailSignupSection({
  signupSource = 'website',
  onSuccess,
}: Props) {
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
    ? 'rounded-[24px] md:rounded-[40px] bg-[#fbf2d9] p-5 md:p-8 relative z-50 shadow-[0_20px_80px_-20px_rgba(59,59,59,0.3)] scale-[1.02] transition-[transform,box-shadow] duration-300 ease-out'
    : 'rounded-[24px] md:rounded-[40px] bg-[#fbf2d9] p-5 md:p-8 shadow-sm';

  return (
    <section id="bottom-signup" className={sectionClasses}>
      {/* Spotlight contextual message */}
      {spotlightMessage && (
        <div className="mb-6 rounded-2xl border border-[#a8b8a0]/30 bg-[#eef3e9] px-5 py-4 text-sm text-[#3b4b36]">
          {spotlightMessage}
        </div>
      )}

      {/* Download gate message (shown when no spotlight is active but download is pending) */}
      {!spotlightActive && hasPendingDownload && (
        <div className="mb-6 rounded-2xl border border-[#f7c948]/30 bg-[#fef9ea] px-5 py-4 text-sm text-[#5c5030]">
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
                className="w-full rounded-3xl border border-[#d8d2c5] bg-[#faf7f1] px-4 py-3 text-sm text-[#2f3b31] outline-none focus:border-[#a8b8a0] focus:ring-2 focus:ring-[#dbe7d4]"
              />
            </label>
            <label className="flex-1">
              <span className="mb-2 block text-sm font-medium text-[#4f5e4f]">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-3xl border border-[#d8d2c5] bg-[#faf7f1] px-4 py-3 text-sm text-[#2f3b31] outline-none focus:border-[#a8b8a0] focus:ring-2 focus:ring-[#dbe7d4]"
              />
            </label>
            <button
              type="submit"
              className="w-full sm:w-auto rounded-3xl bg-[#a8b8a0] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#8f9e86] disabled:cursor-not-allowed disabled:bg-[#c5c8b8]"
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

