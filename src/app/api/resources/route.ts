import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  console.log('========== /api/resources ==========');

  try {
    // Log environment (without exposing secrets)
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log(
      'Anon Key Exists:',
      !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const featuredParam = req.nextUrl.searchParams.get('featured');
    console.log('Featured Param:', featuredParam);

    // Test basic connection
    console.log('Testing database connection...');

    const test = await supabase
      .from('resources')
      .select('id, title, status')
      .limit(10);

    console.log('=== TEST QUERY ===');
    console.log('Test Data:', test.data);
    console.log('Test Error:', test.error);
    console.log('Test Count:', test.data?.length ?? 0);

    let query = supabase
      .from('resources')
      .select('*')
      .eq('status', 'published');

    if (featuredParam === 'true') {
      console.log('Applying featured filter...');
      query = query.eq('featured', 1);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    console.log('=== FINAL QUERY ===');
    console.log('Data:', data);
    console.log('Count:', data?.length ?? 0);
    console.log('Error:', error);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      count: data?.length ?? 0,
      data,
    });
  } catch (error: any) {
    console.error('========== API ERROR ==========');
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
        error,
      },
      { status: 500 }
    );
  }
}