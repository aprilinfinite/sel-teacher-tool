'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

function getAccentTheme(pathname: string) {
  if (pathname.includes('/respond')) {
    return {
      topicBg: '#E8F1FB',
      topicHoverBg: '#BFD7F2',
      startBorder: '#BFD7F2',
      startBg: '#E8F1FB',
      startBtnBg: '#BFD7F2',
      startBtnHoverBg: '#A6C4E3',
      signupBorder: '#BFD7F2',
      signupBg: '#E8F1FB',
      signupIconBg: 'rgba(93, 173, 226, 0.15)',
      signupBtnBg: '#5DADE2',
      signupBtnHover: '#4a9bd0',
      signupBtnText: '#FFFFFF',
    };
  }
  if (pathname.includes('/recover')) {
    return {
      topicBg: '#F7F2FB',
      topicHoverBg: '#EDE8F7',
      startBorder: '#CBB9E8',
      startBg: '#F7F2FB',
      startBtnBg: '#EDE8F7',
      startBtnHoverBg: '#CBB9E8',
      signupBorder: '#CBB9E8',
      signupBg: '#F7F2FB',
      signupIconBg: 'rgba(142, 124, 195, 0.15)',
      signupBtnBg: '#8E7CC3',
      signupBtnHover: '#7a68b0',
      signupBtnText: '#FFFFFF',
    };
  }
  if (pathname.includes('/teacher-support')) {
    return {
      topicBg: '#FFF0E2',
      topicHoverBg: '#FFE8D8',
      startBorder: '#FFD5C2',
      startBg: '#FFF0E2',
      startBtnBg: '#FFE8D8',
      startBtnHoverBg: '#FFD5C2',
      signupBorder: '#FFD5C2',
      signupBg: '#FFF0E2',
      signupIconBg: 'rgba(255, 157, 110, 0.15)',
      signupBtnBg: '#FF9D6E',
      signupBtnHover: '#e88a5e',
      signupBtnText: '#FFFFFF',
    };
  }
  // Default (prevent)
  return {
    topicBg: '#f8f3ea',
    topicHoverBg: '#fff4db',
    startBorder: '#f1d8a0',
    startBg: '#fff9f0',
    startBtnBg: '#fff4dd',
    startBtnHoverBg: '#fff4dd',
    signupBorder: '#f3dfb0',
    signupBg: '#fff3dd',
    signupIconBg: 'rgba(247, 201, 72, 0.15)',
    signupBtnBg: '#f7c948',
    signupBtnHover: '#e5b33c',
    signupBtnText: '#3a3f3c',
  };
}

export default function PreventSidebar() {
  const pathname = usePathname();
  const accent = getAccentTheme(pathname);
  const { activateSpotlight } = useSignupSpotlight();

  return (
    <div className="space-y-4">
      <section className="rounded-[24px] border border-[#e6e0d0] bg-white p-4 md:p-5 shadow-sm">
        <h2 className="mb-4 text-xs md:text-sm font-semibold uppercase tracking-[0.24em] text-[#5c6c57]">Featured Topics</h2>
        <div className="space-y-2 md:space-y-3">
          {featuredTopics.map((topic) => (
            <Link
              key={topic}
              href="#"
              className="flex items-center justify-between rounded-full px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm font-medium transition"
              style={{ backgroundColor: accent.topicBg, color: '#3e4a3c' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = accent.topicHoverBg}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = accent.topicBg}
            >
              <span>{topic}</span>
              <span className="text-[#a9812c]">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border p-4 md:p-5 shadow-sm" style={{ borderColor: accent.startBorder, backgroundColor: accent.startBg }}>
        <h2 className="text-xs md:text-sm font-semibold uppercase tracking-[0.24em] text-[#5c6c57]">Not sure where to start?</h2>
        <p className="mt-2 md:mt-3 text-xs md:text-sm leading-5 md:leading-6 text-[#4f4a3f]">
          Use these quick supports to find the right next step for your classroom.
        </p>
        <div className="mt-3 md:mt-4 space-y-2 md:space-y-3">
          {recommendations.map((item) => (
            <button
              key={item.id}
              type="button"
              className="flex w-full items-center justify-between rounded-[24px] px-3 md:px-4 py-3 md:py-4 text-left text-xs md:text-sm font-medium transition bg-white"
              style={{ color: '#3b4b36' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = accent.startBtnBg}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              <div>
                <p className="font-semibold text-[#3e4a3c]">{item.title}</p>
                <p className="mt-1 text-xs md:text-sm text-[#4f4a3f]">{item.subtitle}</p>
              </div>
              <span className="shrink-0 ml-2 text-[#a9812c]">→</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border p-4 md:p-5 shadow-sm" style={{ borderColor: accent.signupBorder, backgroundColor: accent.signupBg }}>
        <div className="flex items-start justify-between gap-3 md:gap-4">
          <div>
            <h2 className="text-xs md:text-sm font-semibold uppercase tracking-[0.24em] text-[#4f6547]">Get new resources first</h2>
            <p className="mt-2 md:mt-3 text-xs md:text-sm leading-5 md:leading-6 text-[#4f5e4f]">
              Free tools delivered to your inbox when they're added.
            </p>
          </div>
          <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-2xl shrink-0" style={{ backgroundColor: accent.signupIconBg }}>
            ✉️
          </div>
        </div>
        <button
          type="button"
          onClick={() => activateSpotlight('join_the_list')}
          className="mt-4 md:mt-5 inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 md:py-3 text-xs md:text-sm font-semibold transition"
          style={{ backgroundColor: accent.signupBtnBg, color: accent.signupBtnText }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = accent.signupBtnHover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = accent.signupBtnBg}
        >
          Join The List
        </button>
      </section>
    </div>
  );
}
