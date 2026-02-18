export type ArtType = "drawing" | "painting" | "photography" | "poem"

export const ART_TYPES: ArtType[] = ["drawing", "painting", "photography", "poem"]

export const ART_TYPE_LABELS: Record<ArtType, string> = {
  drawing: "Drawings",
  painting: "Paintings",
  photography: "Photography",
  poem: "Poems",
}

export const ART_TYPE_SINGULAR: Record<ArtType, string> = {
  drawing: "Drawing",
  painting: "Painting",
  photography: "Photography",
  poem: "Poem",
}

export const ART_TYPE_ROUTES: Record<ArtType, string> = {
  drawing: "drawings",
  painting: "paintings",
  photography: "photography",
  poem: "poems",
}

export const ROUTE_TO_ART_TYPE: Record<string, ArtType> = {
  drawings: "drawing",
  paintings: "painting",
  photography: "photography",
  poems: "poem",
}

export interface Collection {
  id: string
  title: string
  slug: string
  art_type: ArtType
  short_description: string | null
  description: string | null
  cover_image_url: string | null
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
  user_id: string
}

export interface Artwork {
  id: string
  title: string
  slug: string
  art_type: ArtType
  collection_id: string | null
  short_description: string | null
  description: string | null
  creation_date: string | null
  dimensions: string | null
  medium: string | null
  cover_image_url: string | null
  sort_order: number
  is_published: boolean
  is_featured_home: boolean
  created_at: string
  updated_at: string
  user_id: string
}

export interface ArtworkMedia {
  id: string
  artwork_id: string
  media_url: string
  media_type: "image" | "video"
  caption: string | null
  sort_order: number
}

export interface ArtworkSection {
  id: string
  artwork_id: string
  title: string | null
  content: string
  sort_order: number
}

export interface NewsletterSubscriber {
  id: string
  name: string
  email: string
  subscribed_at: string
}

// Extended artwork with relations
export interface ArtworkWithRelations extends Artwork {
  collection?: Collection | null
  media?: ArtworkMedia[]
  sections?: ArtworkSection[]
}

// A display item on a listing page - either a collection or standalone artwork
export interface ListingItem {
  type: "collection" | "artwork"
  id: string
  title: string
  slug: string
  short_description: string | null
  cover_image_url: string | null
  sort_order: number
  artwork_count?: number // for collections
}
