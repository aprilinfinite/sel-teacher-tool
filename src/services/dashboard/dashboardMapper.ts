import type { DashboardData, DashboardStats, RecentResource, RecentDownload, LatestSubscriber } from './dashboardTypes';

type RawResource = { id: number; title: string; category: string; created_at: string; download_count: number };
type RawSubscriber = { id: number; email: string; source: string | null; subscribed_at: string };

export function mapStats(
  totalResources: number,
  categories: string[],
  totalDownloads: number,
  downloadsToday: number,
): DashboardStats {
  return {
    totalResources,
    totalCategories: new Set(categories.filter(Boolean)).size,
    totalDownloads,
    downloadsToday,
  };
}

export function mapRecentResources(raw: RawResource[]): RecentResource[] {
  return raw.map((r) => ({ id: r.id, title: r.title, category: r.category, created_at: r.created_at }));
}

export function mapRecentDownloads(raw: RawResource[]): RecentDownload[] {
  return raw
    .sort((a, b) => (b.download_count ?? 0) - (a.download_count ?? 0))
    .slice(0, 5)
    .map((r) => ({ id: r.id, title: r.title, count: r.download_count ?? 0 }));
}

export function mapLatestSubscribers(raw: RawSubscriber[]): LatestSubscriber[] {
  return raw.map((s) => ({ id: s.id, email: s.email, source: s.source, subscribed_at: s.subscribed_at }));
}

export function buildDashboard(
  resources: RawResource[],
  recentResourcesRaw: RawResource[],
  topDownloads: RawResource[],
  subscribers: RawSubscriber[],
  downloadsToday: number,
): DashboardData {
  const categories = resources.map((r) => r.category);
  const totalDownloads = resources.reduce((sum, r) => sum + (r.download_count ?? 0), 0);

  return {
    stats: mapStats(resources.length, categories, totalDownloads, downloadsToday),
    recentResources: mapRecentResources(recentResourcesRaw),
    recentDownloads: mapRecentDownloads(topDownloads),
    latestSubscribers: mapLatestSubscribers(subscribers),
  };
}
