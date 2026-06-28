import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const featuredParam = req.nextUrl.searchParams.get('featured');

    let query = supabase
      .from('resources')
      .select('*')
      .eq('status', 'published');

    if (featuredParam === 'true') {
      query = query.eq('featured', 1);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}