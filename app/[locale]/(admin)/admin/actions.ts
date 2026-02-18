// app/admin/actions.ts
'use server';

import { cookies } from 'next/headers';
import { revalidatePath, revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

// Helper to revalidate all relevant paths
async function revalidateContent(artType?: string, slug?: string) {
  // Revalidate main paths
  revalidatePath('/');
  revalidatePath('/bio');
  
  // Revalidate art type pages
  const artTypes = ['drawings', 'paintings', 'photography', 'poems'];
  if (artType) {
    revalidatePath(`/${artType}`);
    if (slug) {
      revalidatePath(`/${artType}/${slug}`);
    }
  } else {
    // If no specific type, revalidate all
    artTypes.forEach(type => {
      revalidatePath(`/${type}`);
    });
  }
  
  // If using tags (more efficient)
  revalidateTag('artworks', 'max');
  revalidateTag('collections', 'max');
}

export async function createArtwork(formData: FormData) {
  const supabase = await createClient();
  
  // Verify admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== process.env.ADMIN_UUID) {
    throw new Error('Unauthorized');
  }
  
  // Insert artwork
  const { data, error } = await supabase
    .from('artworks')
    .insert({
      title: formData.get('title'),
      art_type: formData.get('artType'), // drawings, paintings, etc.
      slug: formData.get('slug'),
      is_published: formData.get('is_published') === 'true',
      user_id: user.id
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Revalidate paths
  await revalidateContent(data.art_type, data.slug);
  
  return { success: true, data };
}

export async function updateArtwork(id: string, formData: FormData) {
  const supabase = await createClient();
  
  // Get old data to know what changed
  const { data: oldArtwork } = await supabase
    .from('artworks')
    .select('art_type, slug, is_published')
    .eq('id', id)
    .single();
  
  // Update artwork
  const { data, error } = await supabase
    .from('artworks')
    .update({
      title: formData.get('title'),
      art_type: formData.get('artType'),
      slug: formData.get('slug'),
      is_published: formData.get('is_published') === 'true',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  // Revalidate old and new paths if slug or type changed
  if (oldArtwork) {
    revalidatePath(`/${oldArtwork.art_type}`);
    revalidatePath(`/${oldArtwork.art_type}/${oldArtwork.slug}`);
  }
  
  await revalidateContent(data.art_type, data.slug);
  
  return { success: true, data };
}

export async function deleteArtwork(id: string) {
  const supabase = await createClient();
  
  // Get data before deleting
  const { data: artwork } = await supabase
    .from('artworks')
    .select('art_type, slug')
    .eq('id', id)
    .single();
  
  // Delete
  const { error } = await supabase
    .from('artworks')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  
  // Revalidate paths
  if (artwork) {
    revalidatePath(`/${artwork.art_type}`);
    revalidatePath(`/${artwork.art_type}/${artwork.slug}`);
  }
  
  return { success: true };
}