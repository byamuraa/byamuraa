import { NextRequest, NextResponse } from 'next/server';
import { getReviews, createReview } from '@/lib/dataService';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 }
      );
    }

    const reviews = await getReviews(productId);
    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error('Fetch reviews error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, rating, comment, reviewerName } = body;

    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { error: 'productId, rating, and comment are required' },
        { status: 400 }
      );
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return NextResponse.json(
        { error: 'Rating must be a number between 1 and 5' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    const finalReviewerName = authUser 
      ? (authUser.email ? authUser.email.split('@')[0] : 'Customer')
      : (reviewerName || 'Anonymous Guest');

    const newReview = await createReview({
      user: authUser ? authUser.id : null,
      reviewerName: finalReviewerName,
      product: productId,
      rating: numericRating,
      comment,
    });

    return NextResponse.json({ success: true, review: newReview });
  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
