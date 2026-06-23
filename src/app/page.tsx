'use client';

import { useState } from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = ["Prevent", "Respond", "Recover", "Teacher Support"];

export default function Home() {
  const [activeTab, setActiveTab] = useState("Prevent");
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-[#f8f7f4]">
      <div className="mx-auto max-w-[1280px] px-6 pt-8 pb-20">
        <section className="hero-layout grid grid-cols-2 gap-12 items-start pt-4">
          <div className="hero-left min-w-0 max-w-[700px]">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#e5e2da] bg-[#e8ede4] px-4 py-2 text-sm font-medium text-[#3b3b3b] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#a8b8a0]" />
              Free Resources for Educators
            </div>

            <div className="max-w-[650px]">
              <h1 className="text-[70px] font-extrabold leading-[0.9] tracking-[-0.03em] text-[#3b3b3b] sm:text-[70px] lg:text-[70px] xl:text-[70px]">
                Real <span className="relative inline-flex">
                  <span className="absolute inset-x-0 bottom-3 top-1/2 -translate-y-1/2 bg-[#e2ead9] rounded-full" />
                  <span className="relative">support</span>
                </span>
                <br />for real<br />classroom<br />moments.
              </h1>
              <p className="mt-7 max-w-[650px] text-[20px] leading-[1.0] text-[#8a8a8a]">
                Printable SEL tools organized around what teachers actually face: before, during, and after hard moments.
              </p>
            </div>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <button className="inline-flex min-w-[200px] items-center justify-center rounded-full bg-[#a8b8a0] px-6 py-4 text-base font-semibold text-white shadow-[0_18px_45px_-24px_rgba(0,0,0,0.25)] transition-transform duration-200 hover:-translate-y-0.5">
                Start Here →
              </button>
              <button className="inline-flex min-w-[200px] items-center justify-center rounded-full border border-[#e5e2da] bg-white px-6 py-4 text-base font-semibold text-[#3b3b3b] shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
                Browse Supports
              </button>
            </div>

            <div className="mt-6 inline-flex items-center gap-1.5 rounded-[20px] border border-[#e5e2da] bg-white/50 px-3 py-2.5 shadow-sm">
              <span className="text-2xl font-bold text-[#3b3b3b]">50+</span>
              <div className="space-y-0.5 text-sm leading-tight text-[#8a8a8a]">
                <p className="font-semibold text-[#3b3b3b]">Free Resources</p>
                <p>and growing</p>
              </div>
            </div>
          </div>

          <div className="hero-right flex justify-center lg:justify-end lg:self-start">
            <div className="w-full max-w-[420px] rounded-[32px] border border-[#e5e2da] bg-white shadow-[0_40px_90px_-35px_rgba(59,59,59,0.15)]">
              <div className="rounded-t-[32px] bg-[#a8b8a0] px-5 py-4 text-white">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold uppercase tracking-[0.24em]">SEL Teacher Tools</span>
                  <span className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em]">
                    Free Downloads Available
                  </span>
                </div>
              </div>

              <div className="px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8a8a8a]">
                  WHAT DO YOU NEED RIGHT NOW?
                </p>

                <div className="mt-5 flex flex-col gap-3">
                  <Link href="/prevent" className="group w-full rounded-[24px] border border-[#e5e2da] bg-white px-5 py-4 text-left shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl leading-none">🌱</span>
                        <div>
                          <p className="font-semibold text-[#3b3b3b]">Prevent</p>
                          <p className="text-sm text-[#8a8a8a]">Build calm before things escalate</p>
                        </div>
                      </div>
                      <span className="text-[#8a8a8a]">→</span>
                    </div>
                  </Link>
                  <button type="button" className="group w-full rounded-[24px] border border-[#e5e2da] bg-white px-5 py-4 text-left shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl leading-none">🫧</span>
                        <div>
                          <p className="font-semibold text-[#3b3b3b]">Respond</p>
                          <p className="text-sm text-[#8a8a8a]">De-escalate in the moment</p>
                        </div>
                      </div>
                      <span className="text-[#8a8a8a]">→</span>
                    </div>
                  </button>
                  <button type="button" className="group w-full rounded-[24px] border border-[#e5e2da] bg-white px-5 py-4 text-left shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl leading-none">🔄</span>
                        <div>
                          <p className="font-semibold text-[#3b3b3b]">Recover</p>
                          <p className="text-sm text-[#8a8a8a]">Repair after a hard moment</p>
                        </div>
                      </div>
                      <span className="text-[#8a8a8a]">→</span>
                    </div>
                  </button>
                  <button type="button" className="group w-full rounded-[24px] border border-[#e5e2da] bg-white px-5 py-4 text-left shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl leading-none">💛</span>
                        <div>
                          <p className="font-semibold text-[#3b3b3b]">Teacher Support</p>
                          <p className="text-sm text-[#8a8a8a]">Take care of yourself, too</p>
                        </div>
                      </div>
                      <span className="text-[#8a8a8a]">→</span>
                    </div>
                  </button>
                  <button type="button" className="mt-4 w-full rounded-[28px] border border-[#e5e2da] bg-[#f6f5f2] px-5 py-4 text-left shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[#3b3b3b]">✨ Not sure where to start?</p>
                        <p className="text-sm text-[#8a8a8a]">Take the guided path →</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
