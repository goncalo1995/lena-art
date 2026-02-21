// lib/cleanup.ts
import { deleteFileFromR2, deleteFilesFromR2 } from '@/lib/r2-client';

/**
 * Clean up media files when artwork is deleted
 */
export async function cleanupArtworkMedia(mediaUrls: string[]) {
  if (!mediaUrls.length) return;
  
  // Extract keys from URLs
  const keys = mediaUrls.map(url => {
    // Assuming URL format: https://your-r2-domain.com/bucket-name/path/to/file.jpg
    const urlObj = new URL(url);
    return urlObj.pathname.split('/').slice(2).join('/'); // Adjust based on your URL structure
  });
  
  await deleteFilesFromR2(keys);
}

/**
 * Clean up single file
 */
export async function cleanupSingleFile(url: string) {
  if (!url) return;
  
  try {
    const urlObj = new URL(url);
    // URL format: https://pub-f07c1a625b1d42f4966b622eed2489fe.r2.dev/uploads/filename.jpg
    const pathParts = urlObj.pathname.split('/')
    const key = pathParts.slice(1).join('/') // Remove the leading slash
    
    await deleteFileFromR2(key);
  } catch (error) {
    console.error('Failed to extract key or delete from R2:', error)
    throw error
  }
}