"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { ART_TYPE_ROUTES } from "./types"
import type { ArtType } from "./types"
import { routing } from "@/i18n/routing";
import { cleanupArtworkMedia, cleanupSingleFile } from "./cleanup";

const artTypeRoutes = ['drawings', 'paintings', 'photography', 'poems'];

async function getSupabaseClient() {
  const { createClient } = await import("./supabase/server")
  return createClient()
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

interface RevalidateOptions {
  artType: string;           // Always required, never changes
  collectionSlug?: string;    // Optional - if artwork is in a collection
  slug?: string;              // The artwork slug
  oldCollectionSlug?: string; // For when artwork moves between collections
  oldSlug?: string;          // For when slug changes (title edit)
}

async function revalidateAllLocales({
  artType,
  collectionSlug,
  slug,
  oldCollectionSlug,
  oldSlug
}: RevalidateOptions) {
  
  for (const locale of routing.locales) {
    // === ALWAYS REVALIDATE ===
    // Homepage (might show featured artworks)
    revalidatePath(`/${locale}`);
    
    // Bio page (unlikely to change, but safe)
    revalidatePath(`/${locale}/bio`);
    
    // Admin pages
    revalidatePath(`/${locale}/admin`);
    revalidatePath(`/${locale}/admin/artworks`);
    revalidatePath(`/${locale}/admin/collections`);
    
    // === ART TYPE INDEX PAGE ===
    // Always revalidate the art type page (shows all artworks of this type)
    revalidatePath(`/${locale}/${artType}`);
    
    // === CURRENT PATHS ===
    if (collectionSlug) {
      // Artwork is in a collection: /[locale]/[artType]/[collectionSlug]/[slug]
      revalidatePath(`/${locale}/${artType}/${collectionSlug}`);
      revalidatePath(`/${locale}/${artType}/${collectionSlug}/${slug}`);
    } else {
      // Artwork is standalone: /[locale]/[artType]/[slug]
      revalidatePath(`/${locale}/${artType}/${slug}`);
    }
    
    // === OLD PATHS (if something changed) ===
    if (oldCollectionSlug || oldSlug) {
      if (oldCollectionSlug) {
        // Artwork moved from a collection
        revalidatePath(`/${locale}/${artType}/${oldCollectionSlug}`);
        if (oldSlug) {
          revalidatePath(`/${locale}/${artType}/${oldCollectionSlug}/${oldSlug}`);
        }
      } else if (oldSlug && oldSlug !== slug) {
        // Slug changed but collection stayed the same
        if (collectionSlug) {
          revalidatePath(`/${locale}/${artType}/${collectionSlug}/${oldSlug}`);
        } else {
          revalidatePath(`/${locale}/${artType}/${oldSlug}`);
        }
      }
    }
  }
  
  // Revalidate tags
  revalidateTag('artworks', 'max');
  revalidateTag('collections', 'max');
}

// ========== ARTWORKS ==========

export async function createArtwork(formData: FormData) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  console.log("Creating artwork...", formData)
  const title = formData.get("title") as string
  const slug = slugify(title)
  const art_type = formData.get("art_type") as ArtType
  const collection_id = (formData.get("collection_id") as string) || null
  const short_description = (formData.get("short_description") as string) || null
  const description = (formData.get("description") as string) || null
  const creation_date = (formData.get("creation_date") as string) || null
  const dimensions = (formData.get("dimensions") as string) || null
  const medium = (formData.get("medium") as string) || null
  const cover_image_url = (formData.get("cover_image_url") as string) || null
  const sale_url = (formData.get("sale_url") as string) || null
  const is_published = formData.has('is_published')
  const is_featured_home = formData.has('is_featured_home')
  const sort_order = parseInt((formData.get("sort_order") as string) || "0")

  let collectionSlug: string | undefined;
  if (collection_id) {
    const { data: collection } = await supabase
      .from("collections")
      .select("slug")
      .eq("id", collection_id)
      .single();
    collectionSlug = collection?.slug;
  }

 const { data, error } = await supabase
    .from("artworks")
    .insert({
      title,
      slug,
      art_type,
      collection_id,
      short_description,
      description,
      creation_date,
      dimensions,
      medium,
      cover_image_url,
      sale_url,
      is_published,
      is_featured_home,
      sort_order,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  // Revalidate all locales
  await revalidateAllLocales({
    artType: data.art_type,
    collectionSlug: collectionSlug, // undefined if no collection
    slug: data.slug
  })

  return { success: true, data }
}

export async function updateArtwork(id: string, formData: FormData) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Get old data to know what changed
  const { data: oldArtwork } = await supabase
    .from("artworks")
    .select(`
      art_type, 
      slug, 
      collection_id,
      collections!left(slug)
    `)
    .eq("id", id)
    .single()

  const title = formData.get("title") as string
  const slug = slugify(title)
  const art_type = formData.get("art_type") as ArtType // Assuming this doesn't change
  const collection_id = (formData.get("collection_id") as string) || null
  const short_description = (formData.get("short_description") as string) || null
  const description = (formData.get("description") as string) || null
  const creation_date = (formData.get("creation_date") as string) || null
  const dimensions = (formData.get("dimensions") as string) || null
  const medium = (formData.get("medium") as string) || null
  const cover_image_url = (formData.get("cover_image_url") as string) || null
  const sale_url = (formData.get("sale_url") as string) || null
  const is_published = formData.has('is_published')
  const is_featured_home = formData.has('is_featured_home')
  const sort_order = parseInt((formData.get("sort_order") as string) || "0")
  
  // Get new collection slug if artwork is in a collection
  let newCollectionSlug: string | undefined;
  if (collection_id) {
    const { data: collection } = await supabase
      .from("collections")
      .select("slug")
      .eq("id", collection_id)
      .single();
    newCollectionSlug = collection?.slug;
  }

  // Get old collection slug
  const oldCollectionSlug = oldArtwork?.collections?.slug;

  const { error } = await supabase
    .from("artworks")
    .update({
      title,
      slug,
      art_type,
      collection_id,
      short_description,
      description,
      creation_date,
      dimensions,
      medium,
      cover_image_url,
      sale_url,
      is_published,
      is_featured_home,
      sort_order,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) throw new Error(error.message)

  // Revalidate all affected paths
  await revalidateAllLocales({
    artType: art_type,
    collectionSlug: newCollectionSlug,
    slug,
    oldCollectionSlug,
    oldSlug: oldArtwork?.slug !== slug ? oldArtwork?.slug : undefined
  })

  return { success: true }
}

export async function deleteArtwork(id: string) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Get data before deleting
  // Get artwork data including all media URLs before deleting
  const { data: artwork, error: artworkError } = await supabase
    .from("artworks")
    .select(`
      art_type,
      slug,
      cover_image_url,
      media:artwork_media(media_url),
      collections(slug)
    `)
    .eq("id", id)
    .single()

  if (artworkError) throw new Error(artworkError.message)

  // Collect all media URLs for cleanup
  const mediaUrls = []
  if (artwork?.cover_image_url) mediaUrls.push(artwork.cover_image_url)
  if (artwork?.media) mediaUrls.push(...artwork.media.map(m => m.media_url))

  // Delete from database first (so if R2 delete fails, DB is still clean)
  const { error } = await supabase
    .from("artworks")
    .delete()
    .eq("id", id)

  if (error) throw new Error(error.message)

  // Clean up R2 files (don't throw if this fails, just log)
  try {
    await cleanupArtworkMedia(mediaUrls)
  } catch (r2Error) {
    console.error('Failed to delete R2 files for artwork:', id, r2Error)
  }

  if (artwork) {
    await revalidateAllLocales({
      artType: artwork.art_type,
      collectionSlug: artwork.collections?.slug,
      slug: artwork.slug
    })
  }

  return { success: true }
}
// ========== COLLECTIONS ==========

export async function createCollection(formData: FormData) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const title = formData.get("title") as string
  const slug = slugify(title)
  const art_type = formData.get("art_type") as ArtType
  const short_description = (formData.get("short_description") as string) || null
  const description = (formData.get("description") as string) || null
  const cover_image_url = (formData.get("cover_image_url") as string) || null
  const is_published = formData.has('is_published')
  const sort_order = parseInt((formData.get("sort_order") as string) || "0")

  const { data, error } = await supabase
    .from("collections")
    .insert({
      title,
      slug,
      art_type,
      short_description,
      description,
      cover_image_url,
      is_published,
      sort_order,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  await revalidateAllLocales({
    artType: data.art_type,
    slug: '', // or use a dummy value that won't match real paths
    collectionSlug: data.slug
  });
  
  // Option 2: Create a separate revalidateCollection function that calls the same core logic
  // But for simplicity, using empty string works since we only revalidate
  // /[locale]/[artType]/[collectionSlug] paths, not item paths

  return { success: true, data }
}

export async function updateCollection(id: string, formData: FormData) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Get old data
  const { data: oldCollection } = await supabase
    .from("collections")
    .select("art_type, slug")
    .eq("id", id)
    .single()

  const title = formData.get("title") as string
  const newSlug = slugify(title)
  const art_type = formData.get("art_type") as ArtType // Assuming doesn't change
  const short_description = (formData.get("short_description") as string) || null
  const description = (formData.get("description") as string) || null
  const cover_image_url = (formData.get("cover_image_url") as string) || null
  const is_published = formData.has('is_published')
  const sort_order = parseInt((formData.get("sort_order") as string) || "0")

  const { error } = await supabase
    .from("collections")
    .update({
      title,
      slug: newSlug,
      art_type,
      short_description,
      description,
      cover_image_url,
      is_published,
      sort_order,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) throw new Error(error.message)

  // Revalidate affected paths
  await revalidateAllLocales({
    artType: art_type,
    slug: '', // No artwork slug needed
    collectionSlug: newSlug,
    oldCollectionSlug: oldCollection?.slug !== newSlug ? oldCollection?.slug : undefined
  });

  return { success: true }
}

export async function deleteCollection(id: string) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Get collection info and delete in one go
  const { data: collection, error } = await supabase
    .from("collections")
    .delete()
    .eq("id", id)
    .select(`
      art_type,
      slug
    `)
    .single()

  if (error) throw new Error(error.message)

  if (collection) {
    await revalidateAllLocales({
    artType: collection.art_type,
    slug: '', // No artwork slug needed
    collectionSlug: collection.slug
  });
  }

  return { success: true }
}

// ========== ARTWORK MEDIA & SECTIONS ==========

export async function addArtworkMedia(artworkId: string | null, formData: FormData) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const media_url = formData.get("media_url") as string
  const media_type = formData.get("media_type") as "image" | "video"
  const caption = (formData.get("caption") as string) || null
  const sort_order = parseInt((formData.get("sort_order") as string) || "0")

  try {
    // Get artwork info for revalidation
    let artwork = null
    if (artworkId) {
      const { data: artworkData } = await supabase
        .from("artworks")
        .select("art_type, slug, collections(slug)")
        .eq("id", artworkId)
        .single()
      
      artwork = artworkData
    }

    const { error } = await supabase
      .from("artwork_media")
      .insert({
        artwork_id: artworkId,
        media_url,
        media_type,
        caption,
        sort_order,
      })

    if (error) throw new Error(error.message)

    if (artwork) {
        await revalidateAllLocales({
        artType: artwork.art_type,
        collectionSlug: artwork.collections?.slug,
        slug: artwork.slug
      });
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to add artwork media:', error)
    throw error
  }
}

export async function updateArtworkMediaCaption(id: string, caption: string | null) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: media, error: fetchError } = await supabase
    .from("artwork_media")
    .select("artwork_id")
    .eq("id", id)
    .maybeSingle()

  if (fetchError) throw new Error(fetchError.message)

  const { error: updateError } = await supabase
    .from("artwork_media")
    .update({ caption })
    .eq("id", id)

  if (updateError) throw new Error(updateError.message)

  // Revalidate based on whether it was linked to an artwork
  if (media?.artwork_id) {
    const { data: artwork, error: artworkError } = await supabase
      .from("artworks")
      .select(
        `
          art_type,
          slug,
          collections!left(slug)
        `
      )
      .eq("id", media.artwork_id)
      .single()

    if (artworkError) {
      console.error("Failed to fetch artwork for revalidation:", artworkError)
    } else if (artwork) {
      await revalidateAllLocales({
        artType: artwork.art_type,
        collectionSlug: artwork.collections?.slug,
        slug: artwork.slug,
      })
    }
  } else {
    for (const locale of routing.locales) {
      revalidatePath(`/${locale}/admin/media`)
    }
  }

  return { success: true }
}

export async function deleteArtworkMedia(id: string) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  
  try {
    // First, get the media info to get the URL
    const { data: media, error: fetchError } = await supabase
      .from("artwork_media")
      .select("artwork_id, media_url")
      .eq("id", id)
      .maybeSingle()

    if (fetchError) throw new Error(fetchError.message)
    
    if (!media) {
      console.error('Media not found')
      return { success: true }
    }

    // Store info before delete
    const { artwork_id, media_url } = media

    // Safety: block deletion if the same URL is still referenced elsewhere.
    // Otherwise we'd delete the R2 object and leave broken DB references.
    const [{ data: otherRefs, error: otherRefsError }, { data: coverRefs, error: coverRefsError }] =
      await Promise.all([
        supabase
          .from("artwork_media")
          .select("id")
          .eq("media_url", media_url)
          .neq("id", id)
          .limit(1),
        supabase
          .from("artworks")
          .select("id")
          .eq("cover_image_url", media_url)
          .limit(1),
      ])

    if (otherRefsError) throw new Error(otherRefsError.message)
    if (coverRefsError) throw new Error(coverRefsError.message)

    const isReferencedElsewhere = (otherRefs?.length || 0) > 0 || (coverRefs?.length || 0) > 0
    if (isReferencedElsewhere) {
      return {
        success: false,
        error: "inUse",
      }
    }

    // Delete from Supabase first (so if R2 fails, DB is clean)
    const { error: deleteError } = await supabase
      .from("artwork_media")
      .delete()
      .eq("id", id)

    if (deleteError) throw new Error(deleteError.message)

    // Then delete from R2 (don't throw if this fails, just log)
    try {
      await cleanupSingleFile(media_url)
    } catch (r2Error) {
      console.error('Failed to delete from R2, but DB record is removed:', r2Error)
    }

    // Revalidate based on whether it was linked to an artwork
    if (artwork_id) {
      // Get artwork details for revalidation
      const { data: artwork, error: artworkError } = await supabase
        .from("artworks")
        .select(`
          art_type,
          slug,
          collections!left(slug)
        `)
        .eq("id", artwork_id)
        .single()

      if (artworkError) {
        console.error('Failed to fetch artwork for revalidation:', artworkError)
      } else if (artwork) {
        await revalidateAllLocales({
          artType: artwork.art_type,
          collectionSlug: artwork.collections?.slug,
          slug: artwork.slug
        })
      }
    } else {
      // Revalidate media library page
      const { routing } = await import('@/i18n/routing')
      for (const locale of routing.locales) {
        revalidatePath(`/${locale}/admin/media`)
      }
    }

    console.log('Successfully deleted media:', id)
    return { success: true }

  } catch (error) {
    console.error('Failed to delete media:', error)
    throw error
  }
}


export async function updateArtworkImage(artworkId: string, oldImageUrl: string | null, newImageUrl: string) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  try {
    // Update the artwork's cover_image_url
    const { error: updateError } = await supabase
      .from("artworks")
      .update({ cover_image_url: newImageUrl })
      .eq("id", artworkId)

    if (updateError) throw new Error(updateError.message)

    // If there was an old image, check if it's used elsewhere and clean up if not
    if (oldImageUrl) {
      const { data: existingUses } = await supabase
        .from("artwork_media")
        .select("id")
        .eq("media_url", oldImageUrl)
        .limit(1)

      const { data: artworksWithOldImage } = await supabase
        .from("artworks")
        .select("id")
        .eq("cover_image_url", oldImageUrl)
        .limit(1)

      // If the old image is not used in artwork_media or as any artwork cover, delete it
      if (!existingUses?.length && !artworksWithOldImage?.length) {
        const { error: deleteError } = await supabase
          .from("artwork_media")
          .delete()
          .eq("media_url", oldImageUrl)
          .is("artwork_id", null) // Only delete from general media library

        if (deleteError) {
          console.error("Failed to cleanup unused media:", deleteError)
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to update artwork image:', error)
    throw error
  }
}

export async function refreshMediaPage() {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/admin/media`, 'page')
  }
}

// ========== ARTWORK SECTIONS ==========

export async function addArtworkSection(
  artworkId: string,
  formData: FormData
) {
  const supabase = await getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const title = (formData.get("title") as string) || null
  const content = formData.get("content") as string
  const sort_order = parseInt(
    (formData.get("sort_order") as string) || "0"
  )

  // Get artwork info for revalidation
  const { data: artwork } = await supabase
    .from("artworks")
    .select("art_type, slug, collections(slug)")
    .eq("id", artworkId)
    .single()

  const { error } = await supabase.from("artwork_sections").insert({
    artwork_id: artworkId,
    title,
    content,
    sort_order,
  })

  if (error) throw new Error(error.message)

  if (artwork) {
    await revalidateAllLocales({
      artType: artwork.art_type,
      collectionSlug: artwork.collections?.slug,
      slug: artwork.slug
    });
  }

  return { success: true }
}

export async function deleteArtworkSection(id: string) {
  const supabase = await getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Get artwork info before deleting
  const { data: section } = await supabase
    .from("artwork_sections")
    .select("artwork_id")
    .eq("id", id)
    .single()

  if (section) {
    // const { data: artwork } = await supabase
    //   .from("artworks")
    //   .select("art_type, slug, collections(slug)")
    //   .eq("id", section.artwork_id)
    //   .single()

    // const { error } = await supabase
    //   .from("artwork_sections")
    //   .delete()
    //   .eq("id", id)
      
    const { data: section, error } = await supabase
    .from("artwork_sections")
    .delete()
    .eq("id", id)
    .select(`
      artwork_id,
      artworks!inner (
        art_type,
        slug,
        collections (slug)
      )
    `)
    .single()
    if (error) throw new Error(error.message)

    if (section?.artworks) {
      await revalidateAllLocales({
        artType: section.artworks.art_type,
        collectionSlug: section.artworks.collections?.slug,
        slug: section.artworks.slug
      });
    }
  }
  
  return { success: true }
}

// ========== NEWSLETTER ==========

export async function subscribeNewsletter(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string

  if (!name || !email) {
    return { error: "missingFields" }
  }

  try {
    const supabase = await getSupabaseClient()
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ name, email })

    if (error) {
      if (error.code === "23505") {
        return { error: "emailInUse" }
      }
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error subscribing to newsletter:", error)
    return {
      error: "Newsletter service is not available yet. Please try again later.",
    }
  }
}

