export interface DashboardStats {
  totalResources: number;
  totalCategories: number;
  totalDownloads: number;
  downloadsToday: number;
}

export interface RecentResource {
  id: number;
  title: string;
  category: string;
  created_at: string;
}

export interface RecentDownload {
  id: number;
  title: string;
  count: number;
}

export interface LatestSubscriber {
  id: number;
  email: string;
  source: string | null;
  subscribed_at: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentResources: RecentResource[];
  recentDownloads: RecentDownload[];
  latestSubscribers: LatestSubscriber[];
}
