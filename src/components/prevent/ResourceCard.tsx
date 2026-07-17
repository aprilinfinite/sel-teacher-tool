'use client';

import { useRef } from 'react';
import { usePathname } from 'next/navigation';
import type { Resource as DbResource } from '@/lib/types';
import { useDownloadGate } from '@/components/shared/DownloadGate';

function hasValue(val: string | number | null | undefined): boolean {
  if (val === null || val === undefined) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  return true;
}

function getAccentTheme(pathname: string) {
  if (pathname.includes('/respond')) {
    return {
      featuredBg: 'rgba(93, 173, 226, 0.2)',
      featuredText: '#2E3A47',
      formatBg: '#BFD7F2',
      formatText: '#2E3A47',
      buttonBg: '#5DADE2',
      buttonText: '#FFFFFF',
      buttonHover: '#4a9bd0',
      ctaBorder: '#BFD7F2',
      ctaBg: '#E8F1FB',
      ctaText: '#2E3A47',
      ctaHoverBg: '#BFD7F2',
    };
  }
  if (pathname.includes('/recover')) {
    return {
      featuredBg: 'rgba(142, 124, 195, 0.2)',
      featuredText: '#2E2A3A',
      formatBg: '#EDE8F7',
      formatText: '#2E2A3A',
      buttonBg: '#8E7CC3',
      buttonText: '#FFFFFF',
      buttonHover: '#7a68b0',
      ctaBorder: '#CBB9E8',
      ctaBg: '#F7F2FB',
      ctaText: '#2E2A3A',
      ctaHoverBg: '#EDE8F7',
    };
  }
  if (pathname.includes('/teacher-support')) {
    return {
      featuredBg: 'rgba(255, 157, 110, 0.2)',
      featuredText: '#4A4A4A',
      formatBg: '#FFF0E2',
      formatText: '#4A4A4A',
      buttonBg: '#FF9D6E',
      buttonText: '#FFFFFF',
      buttonHover: '#e88a5e',
      ctaBorder: '#FFD5C2',
      ctaBg: '#FFF0E2',
      ctaText: '#4A4A4A',
      ctaHoverBg: '#FFE8D8',
    };
  }
  // Default (prevent)
  return {
    featuredBg: 'rgba(247, 201, 72, 0.2)',
    featuredText: '#a9812c',
    formatBg: '#f1f3e9',
    formatText: '#5d6c57',
    buttonBg: '#f7c948',
    buttonText: '#3a3f3c',
    buttonHover: '#e5b83c',
    ctaBorder: '#f1d98c',
    ctaBg: '#fff9f0',
    ctaText: '#3a3f3c',
    ctaHoverBg: '#fff4db',
  };
}

type ResourceCardProps = {
  resource: DbResource;
  onOpenPremiumHub: (resource: DbResource) => void;
};

export default function ResourceCard({ resource, onOpenPremiumHub }: ResourceCardProps) {
  const pathname = usePathname();
  const accent = getAccentTheme(pathname);
  const hasThumbnail = hasValue(resource.thumbnail_path);
  const hasFile = hasValue(resource.file_path);
  const isFeatured = resource.featured === 1;
  const { requestDownload } = useDownloadGate();
  const ctaRef = useRef<HTMLButtonElement>(null);

  const hasMetaRow =
    hasValue(resource.grade_level) ||
    hasValue(resource.time_needed) ||
    hasValue(resource.sel_skill) ||
    hasValue(resource.learner_need) ||
    hasValue(resource.situation) ||
    hasValue(resource.topic_tag);

  return (
    <article className="flex flex-col rounded-[24px] border border-[#e6e0d0] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="overflow-hidden rounded-t-[24px] bg-[#eef3e9]">
        <div className="p-2">
          <div className="mx-auto overflow-hidden rounded-[20px] border border-[#e5e1d6] bg-white shadow-inner" style={{ height: '180px' }}>
            {hasThumbnail ? (
              <img src={resource.thumbnail_path!} alt={resource.thumbnail_alt || resource.title} className="h-full w-full object-cover max-w-full" />
            ) : (
              <div className="flex h-full w-full flex-col justify-center p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="h-8 w-8 rounded-2xl bg-[#d8d1c1]" />
                  <div className="h-3 w-16 rounded-full bg-[#d8d1c1]" />
                </div>
                <div className="mb-3 h-3 rounded-full bg-[#d8d1c1]" />
                <div className="mb-2 h-3 w-3/4 rounded-full bg-[#e4dccd]" />
                <div className="mb-2 h-3 w-2/3 rounded-full bg-[#e4dccd]" />
                <div className="h-3 w-5/6 rounded-full bg-[#e4dccd]" />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          {isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ backgroundColor: accent.featuredBg, color: accent.featuredText }}>★ Featured</span>
          )}
          {hasValue(resource.resource_format) && (
            <span className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ backgroundColor: accent.formatBg, color: accent.formatText }}>{resource.resource_format}</span>
          )}

        </div>
        <div>
          <h3 className="text-xl font-semibold leading-snug text-[#2f3b31]">{resource.title}</h3>
          {hasValue(resource.description) && <p className="mt-2 text-sm leading-6 text-[#6d6d6d]">{resource.description}</p>}
        </div>
        {hasMetaRow && (
          <dl className="flex flex-col gap-1.5 border-t border-[#f0ece3] pt-3">
            {hasValue(resource.grade_level) && (
              <div className="flex flex-wrap items-baseline gap-1">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a9a88]">Grade</dt>
                <dd className="text-sm text-[#4f5e4f]">{resource.grade_level}</dd>
              </div>
            )}
            {hasValue(resource.time_needed) && (
              <div className="flex flex-wrap items-baseline gap-1">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a9a88]">Time</dt>
                <dd className="text-sm text-[#4f5e4f]">{resource.time_needed}</dd>
              </div>
            )}
            {hasValue(resource.sel_skill) && (
              <div className="flex flex-wrap items-baseline gap-1">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a9a88]">SEL Skill</dt>
                <dd className="text-sm text-[#4f5e4f]">{resource.sel_skill}</dd>
              </div>
            )}
            {hasValue(resource.learner_need) && (
              <div className="flex flex-wrap items-baseline gap-1">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a9a88]">Learner Need</dt>
                <dd className="text-sm text-[#4f5e4f]">{resource.learner_need}</dd>
              </div>
            )}
            {hasValue(resource.situation) && (
              <div className="flex flex-wrap items-baseline gap-1">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a9a88]">Situation</dt>
                <dd className="text-sm text-[#4f5e4f]">{resource.situation}</dd>
              </div>
            )}
            {hasValue(resource.topic_tag) && (
              <div className="flex flex-wrap items-baseline gap-1">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a9a88]">Topic</dt>
                <dd className="text-sm text-[#4f5e4f]">{resource.topic_tag}</dd>
              </div>
            )}
          </dl>
        )}
        <div className="mt-auto pt-2">
          {hasFile ? (
            <button type="button" onClick={() => requestDownload(resource.file_path!, resource.title)} className="inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition" style={{ backgroundColor: accent.buttonBg, color: accent.buttonText }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = accent.buttonHover} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = accent.buttonBg}>Download</button>
          ) : (
            <button type="button" disabled className="inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold cursor-not-allowed bg-[#f0f0f0] text-[#9b9b9b]">Coming Soon</button>
          )}
        </div>

        {/* Divider + CTA to open Premium Resource Hub */}
        <div className="border-t border-[#f0ece3] pt-4">
          <button
            ref={ctaRef}
            type="button"
            onClick={() => onOpenPremiumHub(resource)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition"
            style={{
              borderColor: accent.ctaBorder,
              backgroundColor: accent.ctaBg,
              color: accent.ctaText,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = accent.ctaHoverBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = accent.ctaBg;
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Explore Premium Resources
          </button>
        </div>
      </div>
    </article>
  );
}
