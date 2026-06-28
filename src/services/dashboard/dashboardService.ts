import { supabaseAdmin } from '@/lib/supabase-admin';
import { buildDashboard } from './dashboardMapper';
import type { DashboardData } from './dashboardTypes';

const LOG_PREFIX = '[DashboardService]';

export async function getDashboardData(): Promise<DashboardData> {
  // Fetch all resources for stats aggregation
  const { data: resources, error: resError } = await supabaseAdmin
    .from('resources')
    .select('id, title, category, created_at, download_count');

  if (resError) {
    console.error(`${LOG_PREFIX} Failed to fetch resources:`, resError.message);
    throw new Error('Failed to load resource data');
  }

  const resourceList = resources ?? [];

  // Recent resources (last 5 created)
  const recentResources = resourceList
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Top downloads
  const topDownloads = resourceList.slice();

  // Downloads today — try counting downloads from the past 24 hours if a downloads table exists,
  // otherwise fall back to 0 gracefully.
  let downloadsToday = 0;
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { count, error: dlError } = await supabaseAdmin
      .from('downloads')
      .select('*', { count: 'exact', head: true })
      .gte('downloaded_at', todayStart.toISOString());

    if (!dlError && count !== null) {
      downloadsToday = count;
    }
  } catch {
    // Downloads table may not exist — silently fall back to 0
    console.log(`${LOG_PREFIX} No downloads table found, downloadsToday = 0`);
  }

  // Latest subscribers from Supabase email_subscribers table (if it exists)
  let subscribers: Array<{ id: number; email: string; source: string | null; subscribed_at: string }> = [];
  try {
    const { data: subData, error: subError } = await supabaseAdmin
      .from('email_subscribers')
      .select('id, email, source, subscribed_at')
      .order('subscribed_at', { ascending: false })
      .limit(5);

    if (!subError && subData) {
      subscribers = subData;
    }
  } catch {
    console.log(`${LOG_PREFIX} No email_subscribers table found, skipping subscriber data`);
  }

  return buildDashboard(
    resourceList,
    recentResources,
    topDownloads,
    subscribers,
    downloadsToday,
  );
}
