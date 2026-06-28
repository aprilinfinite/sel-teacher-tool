import { NextRequest, NextResponse } from 'next/server';
import { getResources } from '@/services/resources/resourceService';
import type { ResourceQueryParams } from '@/services/resources/resourceTypes';
import { DEFAULT_QUERY } from '@/services/resources/resourceTypes';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const params: ResourceQueryParams = {
      search: url.searchParams.get('search') || DEFAULT_QUERY.search,
      category: url.searchParams.get('category') || DEFAULT_QUERY.category,
      gradeLevel: url.searchParams.get('gradeLevel') || DEFAULT_QUERY.gradeLevel,
      resourceFormat: url.searchParams.get('resourceFormat') || DEFAULT_QUERY.resourceFormat,
      featured: url.searchParams.get('featured') || DEFAULT_QUERY.featured,
      sort: url.searchParams.get('sort') || DEFAULT_QUERY.sort,
      page: parseInt(url.searchParams.get('page') || String(DEFAULT_QUERY.page), 10) || DEFAULT_QUERY.page,
      pageSize: parseInt(url.searchParams.get('pageSize') || String(DEFAULT_QUERY.pageSize), 10) || DEFAULT_QUERY.pageSize,
    };

    // Clamp pagination to safe bounds
    params.page = Math.max(1, params.page);
    params.pageSize = Math.min(100, Math.max(1, params.pageSize));

    const result = await getResources(params);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[AdminResourcesAPI] Error:', err instanceof Error ? err.message : String(err));
    return NextResponse.json(
      { error: 'Failed to load resources' },
      { status: 500 },
    );
  }
}
