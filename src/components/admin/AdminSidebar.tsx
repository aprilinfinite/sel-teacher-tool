'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_MENU_ITEMS } from '@/constants/adminMenu';
import { useState } from 'react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-[#a8b4a4] text-[#f4f0e5] p-2 rounded-lg"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-[#3b3b3b] text-[#f4f0e5] pt-20 md:pt-6 overflow-y-auto transition-transform md:translate-x-0 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo/Title */}
        <div className="px-6 py-4 border-b border-[#a8b4a4] mb-6">
          <h1 className="text-xl font-bold text-[#a8b4a4]">SEL Admin</h1>
        </div>

        {/* Menu Items */}
        <nav className="space-y-2 px-4">
          {ADMIN_MENU_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-[#a8b4a4] text-[#3b3b3b] font-semibold'
                  : 'text-[#f4f0e5] hover:bg-[#555555]'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer Note */}
        <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-[#a8b4a4] text-sm text-[#a8b4a4]">
          <p>Admin Only</p>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
        />
      )}
    </>
  );
}
