import type { Database } from "@/types/database.types";

export type Artwork = Database['public']['Tables']['artworks']['Row']
export type Collection = Database['public']['Tables']['collections']['Row']
export type ArtworkSection = Database['public']['Tables']['artwork_sections']['Row']
export type ArtworkMedia = Database['public']['Tables']['artwork_media']['Row'] & {
  artwork_id: string | null
}
export type NewsletterSubscriber = Database['public']['Tables']['newsletter_subscribers']['Row']

// Extended type for media with artwork relation
export type ArtworkMediaWithArtwork = ArtworkMedia & {
  artworks: Pick<Artwork, 'id' | 'title' | 'art_type'> | null
}

// Extended type for media with collection relation
export type CollectionMedia = ArtworkMedia & {
  collection_id: string | null
}

export type CollectionMediaWithCollection = CollectionMedia & {
  collections: Pick<Collection, 'id' | 'title' | 'art_type'> | null
}

export type ArtworkWithCollectionSlug = Artwork & {
  collections?: Pick<Collection, 'slug'> | null
}

// For the component props
export interface ArtworkWithRelations extends Artwork {
  sections: ArtworkSection[]
  media: ArtworkMedia[]
  collection: Collection | null
}

export interface CollectionWithRelations extends Collection {
  media: CollectionMedia[]
}

export type ArtType = "drawing" | "painting" | "photography" | "poem" | "watercolor"

export const ART_TYPES: ArtType[] = ["drawing", "painting", "photography", "poem", "watercolor"]

export const ART_TYPE_LABELS: Record<string, string> = {
  drawing: "Drawings",
  painting: "Paintings",
  photography: "Photography",
  poem: "Poetry",
  watercolor: "Watercolor",
}

export const ART_TYPE_ROUTES: Record<ArtType, string> = {
  drawing: "drawings",
  painting: "paintings",
  photography: "photography",
  poem: "poetry",
  watercolor: "watercolor",
}

export const ROUTE_TO_ART_TYPE: Record<string, ArtType> = {
  drawings: "drawing",
  paintings: "painting",
  photography: "photography",
  poetry: "poem",
  watercolor: "watercolor",
}

// A display item on a listing page - either a collection or standalone artwork
export interface ListingItem {
  type: "collection" | "artwork"
  id: string
  title: string
  slug: string
  short_description: string | null
  cover_image_url: string | null
  sort_order: number | null
  artwork_count?: number // for collections
}

// A featured item for the home page - artworks (with collection slug) or collections
export type FeaturedItem = {
  type: "artwork"
  id: string
  title: string
  title_en: string | null
  slug: string
  short_description: string | null
  short_description_en: string | null
  cover_image_url: string | null
  featured_sort_order: number | null
  collection_slug: string | null
} | {
  type: "collection"
  id: string
  title: string
  title_en: string | null
  slug: string
  short_description: string | null
  short_description_en: string | null
  cover_image_url: string | null
  featured_sort_order: number | null
}
