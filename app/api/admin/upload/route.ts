import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadImage, deleteImage } from '@/lib/supabase/uploadImage';

// 1. POST - Upload image to Supabase Storage
export async function POST(req: NextRequest) {
  try {
    // Auth guard: Check if authenticated user is the admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.email !== 'byamuraa@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const result = await uploadImage(file);

    return NextResponse.json({
      url: result.url,
      publicId: result.path, // Mapping 'path' to 'publicId' to maintain compatibility with front-end
    });
  } catch (error: any) {
    console.error('Supabase Image Upload Error:', error);
    return NextResponse.json(
      { error: error.message || 'Image upload failed' },
      { status: 500 }
    );
  }
}

// 2. DELETE - Destroy image in Supabase Storage
export async function DELETE(req: NextRequest) {
  try {
    // Auth guard
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.email !== 'byamuraa@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { publicId } = await req.json();

    if (!publicId) {
      return NextResponse.json({ error: 'publicId (image path) is required' }, { status: 400 });
    }

    // Handle mock or legacy image bypass if any exist
    if (publicId.startsWith('mock_') || publicId.startsWith('legacy_')) {
      return NextResponse.json({ success: true, message: 'Mock image delete complete' });
    }

    const success = await deleteImage(publicId);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete image from storage' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Supabase Image Delete Error:', error);
    return NextResponse.json(
      { error: error.message || 'Image delete failed' },
      { status: 500 }
    );
  }
}
