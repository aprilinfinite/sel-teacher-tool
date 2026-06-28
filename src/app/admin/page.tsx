'use client';

import { useDashboard } from '@/components/admin/DashboardProvider';
import StatCard, { StatCardSkeleton } from '@/components/admin/StatCard';
import RecentList from '@/components/admin/RecentList';
import type { RecentResource, RecentDownload } from '@/services/dashboard/dashboardTypes';

export default function AdminDashboard() {
  const { data, loading, error, refresh } = useDashboard();

  const stats = data
    ? [
        { label: 'Total Resources', value: data.stats.totalResources, icon: '📁', color: 'bg-[#a8b4a4]' },
        { label: 'Total Categories', value: data.stats.totalCategories, icon: '📂', color: 'bg-[#d4b896]' },
        { label: 'Total Downloads', value: data.stats.totalDownloads, icon: '⬇️', color: 'bg-[#a89968]' },
        { label: 'Downloads Today', value: data.stats.downloadsToday, icon: '📥', color: 'bg-[#8b9a8f]' },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#3b3b3b] mb-2">Dashboard</h1>
        <div className="flex items-center gap-4">
          <p className="text-[#a8b4a4]">Welcome to your admin dashboard</p>
          <button
            type="button"
            onClick={refresh}
            className="text-xs font-medium text-[#a8b4a4] hover:text-[#5c6c57] transition-colors"
            title="Refresh dashboard"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-[#d4b896]/30 bg-[#fef8f2] p-6 text-sm text-[#8b6a2a]">
          <p className="font-semibold mb-1">Unable to load dashboard data</p>
          <p>{error}</p>
          <button type="button" onClick={refresh} className="mt-3 underline hover:no-underline">
            Try again
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? [1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)
          : stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentList<RecentResource>
          title="Recent Resources"
          items={data?.recentResources ?? null}
          loading={loading}
          error={error}
          emptyMessage="No resources yet."
          renderItem={(r) => (
            <div key={r.id} className="flex items-center justify-between p-3 bg-[#f1f6ed] rounded-lg">
              <div>
                <p className="font-medium text-[#3b3b3b]">{r.title}</p>
                <p className="text-sm text-[#a8b4a4]">{r.category}</p>
              </div>
              <span className="text-[#a8b4a4]">→</span>
            </div>
          )}
        />

        <RecentList<RecentDownload>
          title="Top Downloads"
          items={data?.recentDownloads ?? null}
          loading={loading}
          error={error}
          emptyMessage="No downloads tracked yet."
          renderItem={(d) => (
            <div key={d.id} className="flex items-center justify-between p-3 bg-[#f1f6ed] rounded-lg">
              <p className="font-medium text-[#3b3b3b]">{d.title}</p>
              <span className="text-sm font-semibold text-[#a8b4a4]">{d.count} ⬇</span>
            </div>
          )}
        />
      </div>
    </div>
  );
}
