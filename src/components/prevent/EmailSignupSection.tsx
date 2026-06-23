'use client';

import { useState } from 'react';

export default function EmailSignupSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="bottom-signup" className="rounded-[40px] bg-[#fbf2d9] p-8 shadow-sm">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#2f3b31] sm:text-4xl">
              Get free classroom wellness resources delivered weekly.
            </h2>
            <p className="mt-4 text-sm text-[#5c6c57]">
              Practical emotional wellness tools, calming classroom activities, and SEL support for educators who need simple resources that actually work.
            </p>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
            className="flex flex-col gap-4 rounded-[32px] border border-[#e5e1d6] bg-white p-6 shadow-sm sm:flex-row sm:items-end"
          >
            <label className="flex-1">
              <span className="mb-2 block text-sm font-medium text-[#4f5e4f]">Name</span>
              <input
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
              className="rounded-3xl bg-[#a8b8a0] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#8f9e86] disabled:cursor-not-allowed disabled:bg-[#c5c8b8]"
              disabled={!name || !email}
            >
              Join
            </button>
          </form>
        </div>
        {submitted && (
          <p className="mt-5 text-sm text-[#3b4b36]">
            Thanks for joining the list! We will share new resources soon.
          </p>
        )}
      </div>
    </section>
  );
}
