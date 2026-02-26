import type {
  ArtType,
  Artwork,
  ArtworkWithRelations,
  Collection,
  ListingItem,
  NewsletterSubscriber,
} from "./types"
import {
  placeholderArtworks,
  placeholderCollections,
  placeholderMedia,
  placeholderSections,
} from "./placeholder-data"

function localizedField<T extends Record<string, any>>(
  row: T,
  locale: string,
  base: string
) {
  if (locale === "en") {
    const enKey = `${base}_en`
    const enValue = row?.[enKey]
    if (typeof enValue === "string" && enValue.trim() !== "") return enValue
  }
  return row?.[base]
}

// Helper: Try supabase, fallback to placeholder
async function trySupabase() {
  try {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ) {
      return null
    }
    const { createClient } = await import("./supabase/server")
    return await createClient()
  } catch {
    return null
  }
}

// ========== PUBLIC DATA FETCHING ==========

export async function getHomeFeaturedArtworks(
  artType: ArtType
): Promise<Artwork[]> {
  const supabase = await trySupabase()
  if (supabase) {
    const { data } = await supabase
      .from("artworks")
      .select("*")
      .eq("art_type", artType)
      .eq("is_published", true)
      .eq("is_featured_home", true)
      .order("sort_order")
      .limit(8)
    if (data && data.length > 0) return data
  }
  return placeholderArtworks.filter(
    (a) => a.art_type === artType && a.is_published && a.is_featured_home
  )
}

export async function getListingItems(
  artType: ArtType,
  locale: string
): Promise<ListingItem[]> {
  const supabase = await trySupabase()
  const items: ListingItem[] = []

  if (supabase) {
    // Get collections
    const { data: collections } = await supabase
      .from("collections")
      .select("*")
      .eq("art_type", artType)
      .eq("is_published", true)
      .order("sort_order")
    if (collections) {
      for (const c of collections) {
        const { count } = await supabase
          .from("artworks")
          .select("*", { count: "exact", head: true })
          .eq("collection_id", c.id)
          .eq("is_published", true)
        items.push({
          type: "collection",
          id: c.id,
          title: localizedField(c, locale, "title"),
          slug: c.slug,
          short_description: localizedField(c, locale, "short_description"),
          cover_image_url: c.cover_image_url,
          sort_order: c.sort_order,
          artwork_count: count || 0,
        })
      }
    }
    // Get standalone artworks
    const { data: artworks } = await supabase
      .from("artworks")
      .select("*")
      .eq("art_type", artType)
      .is("collection_id", null)
      .eq("is_published", true)
      .order("sort_order")
    if (artworks) {
      for (const a of artworks) {
        items.push({
          type: "artwork",
          id: a.id,
          title: localizedField(a, locale, "title"),
          slug: a.slug,
          short_description: localizedField(a, locale, "short_description"),
          cover_image_url: a.cover_image_url,
          sort_order: a.sort_order,
        })
      }
    }
    if (items.length > 0) return items
  }

  // Fallback to placeholder
  const collections = placeholderCollections.filter(
    (c) => c.art_type === artType && c.is_published
  )
  for (const c of collections) {
    items.push({
      type: "collection",
      id: c.id,
      title: localizedField(c as any, locale, "title"),
      slug: c.slug,
      short_description: localizedField(c as any, locale, "short_description"),
      cover_image_url: c.cover_image_url,
      sort_order: c.sort_order,
      artwork_count: placeholderArtworks.filter(
        (a) => a.collection_id === c.id
      ).length,
    })
  }
  const standaloneArtworks = placeholderArtworks.filter(
    (a) => a.art_type === artType && !a.collection_id && a.is_published
  )
  for (const a of standaloneArtworks) {
    items.push({
      type: "artwork",
      id: a.id,
      title: localizedField(a as any, locale, "title"),
      slug: a.slug,
      short_description: localizedField(a as any, locale, "short_description"),
      cover_image_url: a.cover_image_url,
      sort_order: a.sort_order,
    })
  }
  return items
}

export async function getCollectionBySlug(
  slug: string,
  artType: ArtType,
  locale: string
): Promise<{ collection: Collection; artworks: Artwork[] } | null> {
  const supabase = await trySupabase()
  if (supabase) {
    const { data: collection } = await supabase
      .from("collections")
      .select("*")
      .eq("slug", slug)
      .eq("art_type", artType)
      .eq("is_published", true)
      .single()
    if (collection) {
      const { data: artworks } = await supabase
        .from("artworks")
        .select("*")
        .eq("collection_id", collection.id)
        .eq("is_published", true)
        .order("sort_order")

      const localizedCollection = {
        ...collection,
        title: localizedField(collection as any, locale, "title"),
        short_description: localizedField(collection as any, locale, "short_description"),
        description: localizedField(collection as any, locale, "description"),
      } as Collection

      const localizedArtworks = (artworks || []).map((a) =>
        ({
          ...a,
          title: localizedField(a as any, locale, "title"),
          short_description: localizedField(a as any, locale, "short_description"),
        })
      ) as Artwork[]

      return { collection: localizedCollection, artworks: localizedArtworks }
    }
  }
  // Fallback
  const collection = placeholderCollections.find(
    (c) => c.slug === slug && c.art_type === artType && c.is_published
  )
  if (!collection) return null
  const artworks = placeholderArtworks.filter(
    (a) => a.collection_id === collection.id && a.is_published
  )

  const localizedCollection = {
    ...collection,
    title: localizedField(collection as any, locale, "title"),
    short_description: localizedField(collection as any, locale, "short_description"),
    description: localizedField(collection as any, locale, "description"),
  } as Collection

  const localizedArtworks = artworks.map((a) =>
    ({
      ...a,
      title: localizedField(a as any, locale, "title"),
      short_description: localizedField(a as any, locale, "short_description"),
    })
  ) as Artwork[]

  return { collection: localizedCollection, artworks: localizedArtworks }
}

export async function getArtworkBySlug(
  slug: string,
  artType: ArtType,
  locale: string
): Promise<ArtworkWithRelations | null> {
  const supabase = await trySupabase()
  if (supabase) {
    const { data: artwork } = await supabase
      .from("artworks")
      .select("*")
      .eq("slug", slug)
      .eq("art_type", artType)
      .eq("is_published", true)
      .single()
    if (artwork) {
      const [{ data: media }, { data: sections }, collectionResult] =
        await Promise.all([
          supabase
            .from("artwork_media")
            .select("*")
            .eq("artwork_id", artwork.id)
            .order("sort_order"),
          supabase
            .from("artwork_sections")
            .select("*")
            .eq("artwork_id", artwork.id)
            .order("sort_order"),
          artwork.collection_id
            ? supabase
                .from("collections")
                .select("*")
                .eq("id", artwork.collection_id)
                .single()
            : Promise.resolve({ data: null }),
        ])

      const localizedArtwork = {
        ...artwork,
        title: localizedField(artwork as any, locale, "title"),
        short_description: localizedField(artwork as any, locale, "short_description"),
        description: localizedField(artwork as any, locale, "description"),
        medium: localizedField(artwork as any, locale, "medium"),
      }

      const localizedCollection = collectionResult.data
        ? ({
            ...collectionResult.data,
            title: localizedField(collectionResult.data as any, locale, "title"),
            short_description: localizedField(collectionResult.data as any, locale, "short_description"),
            description: localizedField(collectionResult.data as any, locale, "description"),
          } as Collection)
        : null

      return {
        ...(localizedArtwork as any),
        collection: localizedCollection,
        media: media || [],
        sections: sections || [],
      }
    }
  }
  // Fallback
  const artwork = placeholderArtworks.find(
    (a) => a.slug === slug && a.art_type === artType && a.is_published
  )
  if (!artwork) return null
  const collection = artwork.collection_id
    ? placeholderCollections.find((c) => c.id === artwork.collection_id) || null
    : null
  const media = placeholderMedia.filter((m) => m.artwork_id === artwork.id)
  const sections = placeholderSections.filter(
    (s) => s.artwork_id === artwork.id
  )

  const localizedArtwork = {
    ...artwork,
    title: localizedField(artwork as any, locale, "title"),
    short_description: localizedField(artwork as any, locale, "short_description"),
    description: localizedField(artwork as any, locale, "description"),
    medium: localizedField(artwork as any, locale, "medium"),
  }

  const localizedCollection = collection
    ? ({
        ...collection,
        title: localizedField(collection as any, locale, "title"),
        short_description: localizedField(collection as any, locale, "short_description"),
        description: localizedField(collection as any, locale, "description"),
      } as Collection)
    : null

  return { ...(localizedArtwork as any), collection: localizedCollection, media, sections }
}

export async function getArtworkInCollection(
  collectionSlug: string,
  itemSlug: string,
  artType: ArtType,
  locale: string
): Promise<{
  artwork: ArtworkWithRelations
  collection: Collection
} | null> {
  const supabase = await trySupabase()
  if (supabase) {
    const { data: collection } = await supabase
      .from("collections")
      .select("*")
      .eq("slug", collectionSlug)
      .eq("art_type", artType)
      .single()
    if (!collection) return null
    const { data: artwork } = await supabase
      .from("artworks")
      .select("*")
      .eq("slug", itemSlug)
      .eq("collection_id", collection.id)
      .eq("is_published", true)
      .single()
    if (!artwork) return null
    const [{ data: media }, { data: sections }] = await Promise.all([
      supabase
        .from("artwork_media")
        .select("*")
        .eq("artwork_id", artwork.id)
        .order("sort_order"),
      supabase
        .from("artwork_sections")
        .select("*")
        .eq("artwork_id", artwork.id)
        .order("sort_order"),
    ])
    const localizedCollection = {
      ...collection,
      title: localizedField(collection as any, locale, "title"),
      short_description: localizedField(collection as any, locale, "short_description"),
      description: localizedField(collection as any, locale, "description"),
    } as Collection

    const localizedArtwork = {
      ...artwork,
      title: localizedField(artwork as any, locale, "title"),
      short_description: localizedField(artwork as any, locale, "short_description"),
      description: localizedField(artwork as any, locale, "description"),
      medium: localizedField(artwork as any, locale, "medium"),
    }

    return {
      artwork: {
        ...(localizedArtwork as any),
        collection: localizedCollection,
        media: media || [],
        sections: sections || [],
      },
      collection: localizedCollection,
    }
  }
  // Fallback
  const collection = placeholderCollections.find(
    (c) => c.slug === collectionSlug && c.art_type === artType
  )
  if (!collection) return null
  const artwork = placeholderArtworks.find(
    (a) => a.slug === itemSlug && a.collection_id === collection.id
  )
  if (!artwork) return null
  const media = placeholderMedia.filter((m) => m.artwork_id === artwork.id)
  const sections = placeholderSections.filter(
    (s) => s.artwork_id === artwork.id
  )

  const localizedCollection = {
    ...collection,
    title: localizedField(collection as any, locale, "title"),
    short_description: localizedField(collection as any, locale, "short_description"),
    description: localizedField(collection as any, locale, "description"),
  } as Collection

  const localizedArtwork = {
    ...artwork,
    title: localizedField(artwork as any, locale, "title"),
    short_description: localizedField(artwork as any, locale, "short_description"),
    description: localizedField(artwork as any, locale, "description"),
    medium: localizedField(artwork as any, locale, "medium"),
  }

  return {
    artwork: { ...(localizedArtwork as any), collection: localizedCollection, media, sections },
    collection: localizedCollection,
  }
}

// ========== ADMIN DATA FETCHING ==========

export async function getSubscribersCount(): Promise<number> {
  const supabase = await trySupabase()
  if (supabase) {
    const { count } = await supabase
      .from("newsletter_subscribers")
      .select("*", { count: "exact", head: true })
    if (count !== null) return count
  }
  return 0
}

export async function getSubscribers(limit?: number): Promise<NewsletterSubscriber[]> {
  const supabase = await trySupabase()
  if (supabase) {
    const { data } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("subscribed_at", { ascending: false })
      .limit(limit || 10)
    if (data && data.length > 0) return data
  }
  return []
}

export async function getAllArtworks(): Promise<Artwork[]> {
  const supabase = await trySupabase()
  if (supabase) {
    const { data } = await supabase
      .from("artworks")
      .select("*")
      .order("created_at", { ascending: false })
    if (data && data.length > 0) return data
  }
  return placeholderArtworks
}

export async function getAllCollections(): Promise<Collection[]> {
  const supabase = await trySupabase()
  if (supabase) {
    const { data } = await supabase
      .from("collections")
      .select("*")
      .order("created_at", { ascending: false })
    if (data && data.length > 0) return data
  }
  return placeholderCollections
}

export async function getArtworkById(
  id: string
): Promise<ArtworkWithRelations | null> {
  const supabase = await trySupabase()
  if (supabase) {
    const { data: artwork } = await supabase
      .from("artworks")
      .select("*, collections(*)")
      .eq("id", id)
      .single()
    if (artwork) {
      const [{ data: media }, { data: sections }] = await Promise.all([
        supabase
          .from("artwork_media")
          .select("*")
          .eq("artwork_id", artwork.id)
          .order("sort_order"),
        supabase
          .from("artwork_sections")
          .select("*")
          .eq("artwork_id", artwork.id)
          .order("sort_order"),
      ])
      return {
        ...artwork,
        media: media || [],
        sections: sections || [],
        collection: artwork.collections || null,
      }
    }
  }
  const artwork = placeholderArtworks.find((a) => a.id === id)
  if (!artwork) return null
  return {
    ...artwork,
    media: placeholderMedia.filter((m) => m.artwork_id === id),
    sections: placeholderSections.filter((s) => s.artwork_id === id),
    collection: placeholderCollections.find((c) => c.id === artwork.collection_id) || null,
  }
}

export async function getCollectionById(
  id: string
): Promise<Collection | null> {
  const supabase = await trySupabase()
  if (supabase) {
    const { data } = await supabase
      .from("collections")
      .select("*")
      .eq("id", id)
      .single()
    if (data) return data
  }
  return placeholderCollections.find((c) => c.id === id) || null
}
