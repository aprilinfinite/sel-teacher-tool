'use client';

export default function AdminHeader() {
  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 bg-[#f4f0e5] border-b border-[#e0dcd4] h-16 md:h-20 flex items-center px-6 z-40">
      <div className="flex items-center justify-between w-full">
        <h2 className="text-xl md:text-2xl font-semibold text-[#3b3b3b]">
          SEL Teacher Tools Admin
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#a8b4a4]">Admin User</span>
          <div className="w-10 h-10 rounded-full bg-[#a8b4a4] flex items-center justify-center text-[#3b3b3b] font-bold">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
