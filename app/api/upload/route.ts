// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadBufferToR2 } from '@/lib/r2-client';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin (using your UUIDs)
    const adminUUIDs = [
      '39f591cd-5dae-40af-a8a9-79ff2395413e',
      '47a1c1a6-4e91-4468-a914-66d77ee5d1c6'
    ];
    
    if (!adminUUIDs.includes(user.id)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large (max 10MB)' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${randomUUID()}.${fileExtension}`;
    const key = `uploads/${fileName}`;

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to R2 using your existing client
    await uploadBufferToR2(key, buffer, file.type);

    // Generate public URL - adjust based on your CLOUDFLARE_R2_PUBLIC_URL format
    // Your CLOUDFLARE_R2_PUBLIC_URL might be something like: https://pub-xxxxx.r2.dev
    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;

    // Determine media type
    const mediaType = file.type.startsWith('video/') ? 'video' : 'image';

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      key,
      type: mediaType
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}