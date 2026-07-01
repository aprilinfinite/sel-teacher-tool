'use client';

import { useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthProvider';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await login(email, password);

      if (result.ok) {
        // Use redirect parameter if present, otherwise go to /admin
        const redirectTo = searchParams.get('redirect') || '/admin';
        router.push(redirectTo);
      } else {
        setError(result.error ?? 'Unable to sign in. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl border border-[#d4b896]/30 bg-[#fef8f2] px-4 py-3 text-sm text-[#8b6a2a]">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#4f5e4f]">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className="w-full rounded-xl border border-[#d8d2c5] bg-[#faf7f1] px-4 py-3 text-sm text-[#2f3b31] outline-none transition focus:border-[#a8b4a4] focus:ring-2 focus:ring-[#dbe7d4]"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#4f5e4f]">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          className="w-full rounded-xl border border-[#d8d2c5] bg-[#faf7f1] px-4 py-3 text-sm text-[#2f3b31] outline-none transition focus:border-[#a8b4a4] focus:ring-2 focus:ring-[#dbe7d4]"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-[#a8b4a4] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#8b9a8f] disabled:cursor-not-allowed disabled:bg-[#c5c8b8]"
      >
        {submitting ? 'Signing in...' : 'Sign In'}
      </button>

      <div className="text-center">
        <button
          type="button"
          disabled
          className="text-sm text-[#a8b4a4] cursor-not-allowed"
        >
          Forgot Password
        </button>
      </div>
    </form>
  );
}
