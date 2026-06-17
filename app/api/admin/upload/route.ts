import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getAuthUser } from '@/lib/auth';

// Configure Cloudinary if credentials exist
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// 1. POST - Upload image
export async function POST(req: NextRequest) {
  try {
    // Auth guard (double check signature)
    const admin = getAuthUser(req);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Fallback if Cloudinary is not configured
    if (!isCloudinaryConfigured) {
      const mockImages = [
        '/images/products/tote_pink_leopard_1.jpg',
        '/images/products/mini_heart_1.jpg',
        '/images/products/tote_mauve_check_1.jpg',
        '/images/products/shoulder_striped_1.jpg',
        '/images/products/tote_pink_polka_1.jpg',
        '/images/products/organizer_indigo_1.jpg',
      ];
      const randomMockImage = mockImages[Math.floor(Math.random() * mockImages.length)];

      return NextResponse.json({
        url: randomMockImage,
        publicId: `mock_${Date.now()}`,
        warning: 'Cloudinary credentials are not configured. Falling back to local mock image.',
      });
    }

    // Convert file to base64 buffer for Cloudinary SDK
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileBase64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
      folder: 'amuraa',
    });

    return NextResponse.json({
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
    });
  } catch (error: any) {
    console.error('Image Upload Error:', error);
    return NextResponse.json(
      { error: error.message || 'Image upload failed' },
      { status: 500 }
    );
  }
}

// 2. DELETE - Destroy image
export async function DELETE(req: NextRequest) {
  try {
    // Auth guard
    const admin = getAuthUser(req);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { publicId } = await req.json();

    if (!publicId) {
      return NextResponse.json({ error: 'publicId is required' }, { status: 400 });
    }

    // Mock bypass
    if (publicId.startsWith('mock_')) {
      return NextResponse.json({ success: true, message: 'Mock image delete complete' });
    }

    if (!isCloudinaryConfigured) {
      return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 });
    }

    const deleteResponse = await cloudinary.uploader.destroy(publicId);

    if (deleteResponse.result === 'ok') {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: `Cloudinary delete failed: ${deleteResponse.result}` },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Image Delete Error:', error);
    return NextResponse.json(
      { error: error.message || 'Image delete failed' },
      { status: 500 }
    );
  }
}
