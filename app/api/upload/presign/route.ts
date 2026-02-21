// app/api/upload/presign/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSignedUploadUrl } from '@/lib/r2-client';
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

    // Check if user is admin
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

    const { fileName, fileType } = await request.json();

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'Missing fileName or fileType' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${randomUUID()}.${fileExtension}`;
    const key = `uploads/${uniqueFileName}`;

    // Generate presigned URL
    const presignedUrl = await generateSignedUploadUrl(key, fileType);

    // Check if CLOUDFLARE_R2_PUBLIC_URL is set
    if (!process.env.CLOUDFLARE_R2_PUBLIC_URL) {
      console.error('CLOUDFLARE_R2_PUBLIC_URL environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error: CLOUDFLARE_R2_PUBLIC_URL not set' },
        { status: 500 }
      );
    }

    // Generate public URL - ensure no double slashes
    const baseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL?.replace(/\/$/, ''); // Remove trailing slash
    const publicUrl = `${baseUrl}/${key}`;

    console.log('Generated public URL:', publicUrl); // Debug log

    return NextResponse.json({ 
      success: true, 
      presignedUrl,
      publicUrl,
      key
    });

  } catch (error) {
    console.error('Presign error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}