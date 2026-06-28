'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

export type SpotlightSource = 'start_here' | 'download_gate' | 'join_the_list';

type SignupSpotlightContextValue = {
  isActive: boolean;
  source: SpotlightSource | null;
  activateSpotlight: (source: SpotlightSource) => void;
  deactivateSpotlight: () => void;
};

const SpotlightContext = createContext<SignupSpotlightContextValue | null>(null);

export function useSignupSpotlight(): SignupSpotlightContextValue {
  const ctx = useContext(SpotlightContext);
  if (!ctx) throw new Error('useSignupSpotlight must be used within <SignupSpotlight />');
  return ctx;
}

const CONTEXTUAL_MESSAGES: Record<SpotlightSource, string> = {
  start_here:
    'Welcome! Join our free teacher community to unlock downloads and stay updated with new SEL resources.',
  download_gate:
    "Unlock all free downloads by joining our free resource list. You'll only need to do this once on this browser.",
  join_the_list:
    'Join our free teacher community to unlock downloads and receive future SEL resources.',
};

export function getSpotlightMessage(source: SpotlightSource): string {
  return CONTEXTUAL_MESSAGES[source];
}

// Lock body scroll without scrollbar-gap layout shift
function lockBodyScroll() {
  const w = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = 'hidden';
  if (w > 0) document.body.style.paddingRight = `${w}px`;
}

function unlockBodyScroll() {
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}

export default function SignupSpotlight({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [source, setSource] = useState<SpotlightSource | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<Element | null>(null);
  const signupRef = useRef<HTMLElement | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const scrollAndFocus = useCallback(() => {
    const el = document.getElementById('bottom-signup');
    if (el) {
      signupRef.current = el;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        const inp = el.querySelector<HTMLInputElement>('input[type="text"]');
        if (inp) inp.focus();
      }, 500);
    }
  }, []);

  const activateSpotlight = useCallback(
    (newSource: SpotlightSource) => {
      triggerRef.current = document.activeElement;
      setSource(newSource);
      setIsActive(true);
      requestAnimationFrame(() => scrollAndFocus());
    },
    [scrollAndFocus],
  );

  const deactivateSpotlight = useCallback(() => {
    setIsActive(false);
    setSource(null);
    setTimeout(() => {
      if (triggerRef.current instanceof HTMLElement) triggerRef.current.focus();
      triggerRef.current = null;
    }, 100);
  }, []);

  useEffect(() => {
    if (!isActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') deactivateSpotlight();
    };
    document.addEventListener('keydown', handleKeyDown);
    lockBodyScroll();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      unlockBodyScroll();
    };
  }, [isActive, deactivateSpotlight]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (signupRef.current && signupRef.current.contains(e.target as Node)) return;
      deactivateSpotlight();
    },
    [deactivateSpotlight],
  );

  const ctxValue = useMemo<SignupSpotlightContextValue>(
    () => ({ isActive, source, activateSpotlight, deactivateSpotlight }),
    [isActive, source, activateSpotlight, deactivateSpotlight],
  );

  return (
    <SpotlightContext.Provider value={ctxValue}>
      {children}
      {mounted && isActive && source && createPortal(
        <div
          className="fixed inset-0 z-40 flex items-start justify-center"
          onClick={handleOverlayClick}
          role="dialog" aria-modal="true" aria-label="Signup spotlight"
        >
          <div className="fixed inset-0 bg-[#3b3b3b]/30" />
          <button
            type="button" onClick={deactivateSpotlight}
            aria-label="Close spotlight"
            className="fixed top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#5c6c57] shadow-md transition hover:bg-white hover:text-[#2f3b31]"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4l10 10M14 4l-10 10" />
            </svg>
          </button>
        </div>,
        document.body,
      )}
    </SpotlightContext.Provider>
  );
}
