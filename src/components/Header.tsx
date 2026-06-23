"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className={`sticky top-6 z-50 mb-6 ${pathname === '/prevent' ? 'bg-[#f1f6ed]' : ''}`}>
      <div className="mx-auto flex max-w-[1280px] items-center justify-between rounded-full border border-[#d7cfa8] bg-[#f4f0e5] px-6 py-2 text-sm text-[#5c6c57] shadow-sm backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#96a57f] text-sm font-semibold text-white">S</div>
          <span className="text-base font-semibold text-[#3d4f3c]">SEL Teacher Tools</span>
        </Link>

        <nav className="flex items-center gap-8 text-sm text-[#5c6c57] py-0">
          <Link href="/" className={`font-medium no-underline ${pathname === '/' ? 'text-[#3b4b36] font-semibold' : 'text-[#6a7a68]'} hover:no-underline hover:text-[#3b4b36]`}>Home</Link>
          <Link href="/prevent" className={`font-medium no-underline ${pathname === '/prevent' ? 'text-[#3b4b36] font-semibold' : 'text-[#6a7a68]'} hover:no-underline hover:text-[#3b4b36]`}>Prevent</Link>
          <a href="#" className="font-medium no-underline text-[#6a7a68] hover:no-underline hover:text-[#3b4b36]">Respond</a>
          <a href="#" className="font-medium no-underline text-[#6a7a68] hover:no-underline hover:text-[#3b4b36]">Recover</a>
          <a href="#" className="flex items-center gap-1 font-medium no-underline text-[#6a7a68] hover:no-underline hover:text-[#3b4b36]">
            Learn the Signs
            <span className="text-xs">▾</span>
          </a>
          <a href="#" className="font-semibold no-underline text-[#3b4b36] hover:no-underline hover:text-[#2e392b]">Teacher Support</a>
        </nav>
      </div>
    </header>
  );
}
