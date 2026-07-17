"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  // Only the active nav link color changes per category
  const getActiveLinkColor = () => {
    if (isActive('/prevent')) return 'text-[#3b4b36]';
    if (isActive('/respond')) return 'text-[#2E3A47]';
    if (isActive('/recover')) return 'text-[#2E2A3A]';
    if (isActive('/teacher-support')) return 'text-[#4A4A4A]';
    return 'text-[#3b4b36]';
  };

  return (
    <header className="sticky top-3 md:top-6 z-50 mb-6 px-3 md:px-0">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between rounded-full border border-[#d7cfa8] bg-[#f4f0e5] px-4 md:px-6 py-2 text-sm text-[#5c6c57] shadow-sm backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2 md:gap-3 no-underline shrink-0">
          <div className="grid h-8 w-8 md:h-10 md:w-10 place-items-center rounded-2xl bg-[#96a57f] text-xs md:text-sm font-semibold text-white">S</div>
          <span className="text-sm md:text-base font-semibold text-[#3d4f3c] hidden sm:inline">SEL Teacher Tools</span>
        </Link>

        <nav className="flex items-center gap-3 md:gap-8 text-xs md:text-sm text-[#5c6c57] py-0 overflow-x-auto no-scrollbar">
          <Link href="/" className={`font-medium no-underline whitespace-nowrap ${pathname === '/' ? `${getActiveLinkColor()} font-semibold` : 'text-[#6a7a68]'} hover:no-underline hover:text-[#3b4b36]`}>Home</Link>
          <Link href="/prevent" className={`font-medium no-underline whitespace-nowrap ${pathname === '/prevent' ? `${getActiveLinkColor()} font-semibold` : 'text-[#6a7a68]'} hover:no-underline hover:text-[#3b4b36]`}>Prevent</Link>
          <Link href="/respond" className={`font-medium no-underline whitespace-nowrap ${pathname === '/respond' ? `${getActiveLinkColor()} font-semibold` : 'text-[#6a7a68]'} hover:no-underline hover:text-[#3b4b36]`}>Respond</Link>
          <Link href="/recover" className={`font-medium no-underline whitespace-nowrap ${pathname === '/recover' ? `${getActiveLinkColor()} font-semibold` : 'text-[#6a7a68]'} hover:no-underline hover:text-[#3b4b36]`}>Recover</Link>
          <a href="#" className="flex items-center gap-1 font-medium no-underline whitespace-nowrap text-[#6a7a68] hover:no-underline hover:text-[#3b4b36]">
            Learn the Signs
            <span className="text-xs">▾</span>
          </a>
          <Link href="/teacher-support" className={`font-medium no-underline whitespace-nowrap ${pathname === '/teacher-support' ? `${getActiveLinkColor()} font-semibold` : 'text-[#6a7a68]'} hover:no-underline hover:text-[#3b4b36]`}>Teacher Support</Link>
        </nav>
      </div>
    </header>
  );
}
