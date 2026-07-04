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

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      console.error('Error fetching resources:', error);

      return NextResponse.json(
        {
          error: 'Failed to fetch resources',
        },
        {
          status: 500,
        }
      );
    }

    // Return the array directly.
    // The frontend expects an array, not an object.
    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error('Unexpected error fetching resources:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      {
        status: 500,
      }
    );
  }
}