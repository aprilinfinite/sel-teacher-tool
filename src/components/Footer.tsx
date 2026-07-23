'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Global website footer with a "Continue Exploring" call-to-action,
 * navigation columns, and a minimal bottom bar.
 *
 * Hidden on admin pages (pathname starts with /admin).
 */
export default function Footer() {
  const pathname = usePathname();

  // Don't render on admin pages
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="mt-16 md:mt-24" role="contentinfo">
      <div className="bg-[#eef3e9]">
        {/* Section 1: Continue Exploring CTA */}
        <ExploreCtaSection />

        {/* Section 2: Main Footer Navigation */}
        <div className="mx-auto max-w-[1280px] px-12 md:px-16 pb-16 md:pb-20">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[3fr_1fr_1fr_1fr_1fr] lg:gap-12">
            {/* Column 1: Brand — wider on desktop */}
            <div>
              <Link href="/" className="inline-flex items-center gap-2.5 no-underline">
                <div className="grid h-9 w-9 place-items-center rounded-2xl bg-[#96a57f] text-sm font-semibold text-white">
                  S
                </div>
                <span className="text-base font-semibold text-[#3d4f3c]">
                  SEL Teacher Tools
                </span>
              </Link>
              <p className="mt-4 text-sm leading-6 text-[#5c6c57] max-w-xs">
                Helping educators build emotionally safe, supportive, and engaging
                classrooms through practical social-emotional learning resources.
              </p>
            </div>

            {/* Column 2: Explore */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6a7a68]">
                Explore
              </h3>
              <nav aria-label="Explore" className="mt-4 flex flex-col gap-2.5">
                <FooterLink href="/">Home</FooterLink>
                <FooterLink href="/prevent">Prevent</FooterLink>
                <FooterLink href="/respond">Respond</FooterLink>
                <FooterLink href="/recover">Recover</FooterLink>
                <FooterLink href="/teacher-support">Teacher Support</FooterLink>
              </nav>
            </div>

            {/* Column 3: Resources */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6a7a68]">
                Resources
              </h3>
              <nav aria-label="Resources" className="mt-4 flex flex-col gap-2.5">
                <FooterLink href="/prevent">Free Resources</FooterLink>
                <FooterLink href="/purchase/success">Premium Resources</FooterLink>
                <FooterLink href="/purchase/success">Bundles</FooterLink>
              </nav>
            </div>

            {/* Column 4: Support */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6a7a68]">
                Support
              </h3>
              <nav aria-label="Support" className="mt-4 flex flex-col gap-2.5">
                <FooterLink href="/teacher-support">Contact</FooterLink>
              </nav>
            </div>

            {/* Column 5: Legal */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6a7a68]">
                Legal
              </h3>
              <nav aria-label="Legal" className="mt-4 flex flex-col gap-2.5">
                <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
                <FooterLink href="/terms-of-use">Terms of Use</FooterLink>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Bottom Bar */}
      <div className="border-t border-[#e5e2da] bg-[#eef3e9]">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-2 px-12 md:px-16 py-5 text-xs text-[#6a7a68] sm:flex-row">
          <p>&copy; 2026 SEL Teacher Tools</p>
          <p>
            Made with <span aria-label="love">❤️</span> for educators
          </p>
        </div>
      </div>
    </footer>
  );
}

// --- Sub-components ---

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm text-[#5c6c57] no-underline transition hover:text-[#3b4b36] focus:outline-none focus:ring-2 focus:ring-[#96a57f]/40 focus:ring-offset-2 focus:ring-offset-[#eef3e9] rounded-sm"
    >
      {children}
    </Link>
  );
}

function ExploreCtaSection() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 md:px-6 pt-10 md:pt-14 pb-8 md:pb-10">
      <div className="rounded-[24px] md:rounded-[32px] border border-[#e5e2da] bg-white p-8 md:p-10 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="md:w-[55%]">
            <h2 className="text-xl md:text-2xl font-semibold tracking-[-0.03em] text-[#2f3b31]">
              Continue Your SEL Journey
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#5c6c57]">
              Explore free classroom resources, premium bundles, and practical SEL
              tools designed for educators.
            </p>
          </div>

          <Link
            href="/prevent"
            className="inline-flex items-center rounded-3xl bg-[#96a57f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#7d8e6a] focus:outline-none focus:ring-2 focus:ring-[#96a57f]/40 focus:ring-offset-2"
          >
            Browse Resources
          </Link>
        </div>
      </div>
    </div>
  );
}
