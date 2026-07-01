'use client';

import type { Resource as DbResource } from '@/lib/types';
import { useDownloadGate } from '@/components/shared/DownloadGate';

function hasValue(val: string | number | null | undefined): boolean {
  if (val === null || val === undefined) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  return true;
}

export default function ResourceCard({ resource }: { resource: DbResource }) {
  const hasThumbnail = hasValue(resource.thumbnail_path);
  const hasFile = hasValue(resource.file_path);
  const isFeatured = resource.featured === 1;
  const { requestDownload } = useDownloadGate();
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
                  <div className="h-8 w-8 rounded-2xl bg-[#f2f0e6]" />
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
            <span className="inline-flex items-center gap-1 rounded-full bg-[#f7c948]/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a9812c]">★ Featured</span>
          )}
          {hasValue(resource.resource_format) && (
            <span className="rounded-full bg-[#f1f3e9] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5d6c57]">{resource.resource_format}</span>
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
            <button type="button" onClick={() => requestDownload(resource.file_path!, resource.title)} className="inline-flex w-full items-center justify-center rounded-full bg-[#f7c948] px-5 py-3 text-sm font-semibold text-[#3a3f3c] transition hover:bg-[#e5b83c]">Download</button>
          ) : (
            <button type="button" disabled className="inline-flex w-full items-center justify-center rounded-full bg-[#f0f0f0] px-5 py-3 text-sm font-semibold text-[#9b9b9b] cursor-not-allowed">Coming Soon</button>
          )}
        </div>
      </div>
    </article>
  );
}
