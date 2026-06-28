'use client';

import Link from 'next/link';
import { useSignupSpotlight } from '@/components/shared/SignupSpotlight';

type Recommendation = {
  id: string;
  title: string;
  subtitle: string;
};

const featuredTopics = [
  'Anxiety',
  'Neurodivergence',
  'Emotional Regulation',
  'Trauma',
  'Classroom Belonging',
];

const recommendations: Recommendation[] = [
  {
    id: 'q1',
    title: 'Classroom Support Quiz',
    subtitle: 'Answer a few questions and get the best next steps for your room.',
  },
  {
    id: 'q2',
    title: 'SEL Needs Finder',
    subtitle: 'Quick support ideas based on the challenge you are seeing today.',
  },
];

export default function PreventSidebar() {
  const { activateSpotlight } = useSignupSpotlight();

  return (
    <div className="space-y-4">
      <section className="rounded-[24px] border border-[#e6e0d0] bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-[#5c6c57]">Featured Topics</h2>
        <div className="space-y-3">
          {featuredTopics.map((topic) => (
            <Link
              key={topic}
              href="#"
              className="flex items-center justify-between rounded-full bg-[#f8f3ea] px-4 py-3 text-sm font-medium text-[#3e4a3c] transition hover:bg-[#fff4db]"
            >
              <span>{topic}</span>
              <span className="text-[#a9812c]">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-[#f1d8a0] bg-[#fff9f0] p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-[#5c6c57]">Not sure where to start?</h2>
        <p className="mt-3 text-sm leading-6 text-[#4f4a3f]">
          Use these quick supports to find the right next step for your classroom.
        </p>
        <div className="mt-4 space-y-3">
          {recommendations.map((item) => (
            <button
              key={item.id}
              type="button"
              className="flex w-full items-center justify-between rounded-[24px] bg-white px-4 py-4 text-left text-sm font-medium text-[#3b4b36] transition hover:bg-[#fff4dd]"
            >
              <div>
                <p className="font-semibold text-[#3a3f3c]">{item.title}</p>
                <p className="mt-1 text-sm text-[#6d6d6d]">{item.subtitle}</p>
              </div>
              <span className="text-[#a9812c]">→</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-[#f3dfb0] bg-[#fff3dd] p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f6547]">Get new resources first</h2>
            <p className="mt-3 text-sm leading-6 text-[#4f5e4f]">
              Free tools delivered to your inbox when they're added.
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f7c948]/15 text-[#4f6547]">
            ✉️
          </div>
        </div>
        <button
          type="button"
          onClick={() => activateSpotlight('join_the_list')}
          className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#f7c948] px-5 py-3 text-sm font-semibold text-[#3a3f3c] transition hover:bg-[#e5b33c]"
        >
          Join The List
        </button>
      </section>
    </div>
  );
}
