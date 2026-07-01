'use client';

import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

function LoginPageContent() {
  return (
    <main className="min-h-screen bg-[#f1f6ed] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#96a57f] text-lg font-semibold text-white shadow-sm">
            S
          </div>
        </div>

        {/* Card */}
        <div className="rounded-[28px] border border-[#e6e0d0] bg-white p-8 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#3b3b3b]">Admin Login</h1>
            <p className="mt-2 text-sm text-[#a8b4a4]">Sign in to continue.</p>
          </div>

          <LoginForm />
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#f1f6ed] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#96a57f] text-lg font-semibold text-white shadow-sm">
              S
            </div>
          </div>
          <div className="rounded-[28px] border border-[#e6e0d0] bg-white p-8 shadow-sm">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-[#3b3b3b]">Admin Login</h1>
              <p className="mt-2 text-sm text-[#a8b4a4]">Sign in to continue.</p>
            </div>
            <div className="space-y-5 animate-pulse">
              <div className="h-10 rounded-xl bg-[#f1f6ed]" />
              <div className="h-10 rounded-xl bg-[#f1f6ed]" />
              <div className="h-12 rounded-xl bg-[#f1f6ed]" />
            </div>
          </div>
        </div>
      </main>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
