"use server"

import { revalidatePath } from "next/cache"
import { ART_TYPE_ROUTES } from "./types"
import type { ArtType } from "./types"

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

// ========== ARTWORKS ==========

export async function createArtwork(formData: FormData) {
  const supabase = await getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const title = formData.get("title") as string
  const slug = slugify(title)
  const art_type = formData.get("art_type") as ArtType
  const collection_id =
    (formData.get("collection_id") as string) || null
  const short_description =
    (formData.get("short_description") as string) || null
  const description = (formData.get("description") as string) || null
  const creation_date =
    (formData.get("creation_date") as string) || null
  const dimensions = (formData.get("dimensions") as string) || null
  const medium = (formData.get("medium") as string) || null
  const cover_image_url =
    (formData.get("cover_image_url") as string) || null
  const is_published = formData.get("is_published") === "true"
  const is_featured_home = formData.get("is_featured_home") === "true"
  const sort_order = parseInt(
    (formData.get("sort_order") as string) || "0"
  )

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
      is_published,
      is_featured_home,
      sort_order,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath("/")
  revalidatePath(`/${ART_TYPE_ROUTES[art_type]}`)
  revalidatePath("/admin")

  return data
}

export async function updateArtwork(id: string, formData: FormData) {
  const supabase = await getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const title = formData.get("title") as string
  const slug = slugify(title)
  const art_type = formData.get("art_type") as ArtType
  const collection_id =
    (formData.get("collection_id") as string) || null
  const short_description =
    (formData.get("short_description") as string) || null
  const description = (formData.get("description") as string) || null
  const creation_date =
    (formData.get("creation_date") as string) || null
  const dimensions = (formData.get("dimensions") as string) || null
  const medium = (formData.get("medium") as string) || null
  const cover_image_url =
    (formData.get("cover_image_url") as string) || null
  const is_published = formData.get("is_published") === "true"
  const is_featured_home = formData.get("is_featured_home") === "true"
  const sort_order = parseInt(
    (formData.get("sort_order") as string) || "0"
  )

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
      is_published,
      is_featured_home,
      sort_order,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) throw new Error(error.message)

  revalidatePath("/")
  revalidatePath(`/${ART_TYPE_ROUTES[art_type]}`)
  revalidatePath("/admin")
}

export async function deleteArtwork(id: string) {
  const supabase = await getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase.from("artworks").delete().eq("id", id)
  if (error) throw new Error(error.message)

  revalidatePath("/")
  revalidatePath("/admin")
}

// ========== COLLECTIONS ==========

export async function createCollection(formData: FormData) {
  const supabase = await getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const title = formData.get("title") as string
  const slug = slugify(title)
  const art_type = formData.get("art_type") as ArtType
  const short_description =
    (formData.get("short_description") as string) || null
  const description = (formData.get("description") as string) || null
  const cover_image_url =
    (formData.get("cover_image_url") as string) || null
  const is_published = formData.get("is_published") === "true"
  const sort_order = parseInt(
    (formData.get("sort_order") as string) || "0"
  )

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

  revalidatePath(`/${ART_TYPE_ROUTES[art_type]}`)
  revalidatePath("/admin")
  return data
}

export async function updateCollection(id: string, formData: FormData) {
  const supabase = await getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const title = formData.get("title") as string
  const slug = slugify(title)
  const art_type = formData.get("art_type") as ArtType
  const short_description =
    (formData.get("short_description") as string) || null
  const description = (formData.get("description") as string) || null
  const cover_image_url =
    (formData.get("cover_image_url") as string) || null
  const is_published = formData.get("is_published") === "true"
  const sort_order = parseInt(
    (formData.get("sort_order") as string) || "0"
  )

  const { error } = await supabase
    .from("collections")
    .update({
      title,
      slug,
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

  revalidatePath(`/${ART_TYPE_ROUTES[art_type]}`)
  revalidatePath("/admin")
}

export async function deleteCollection(id: string) {
  const supabase = await getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("collections")
    .delete()
    .eq("id", id)
  if (error) throw new Error(error.message)

  revalidatePath("/")
  revalidatePath("/admin")
}

// ========== ARTWORK MEDIA ==========

export async function addArtworkMedia(
  artworkId: string,
  formData: FormData
) {
  const supabase = await getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const media_url = formData.get("media_url") as string
  const media_type = formData.get("media_type") as "image" | "video"
  const caption = (formData.get("caption") as string) || null
  const sort_order = parseInt(
    (formData.get("sort_order") as string) || "0"
  )

  const { error } = await supabase.from("artwork_media").insert({
    artwork_id: artworkId,
    media_url,
    media_type,
    caption,
    sort_order,
  })

  if (error) throw new Error(error.message)
  revalidatePath("/admin")
}

export async function deleteArtworkMedia(id: string) {
  const supabase = await getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("artwork_media")
    .delete()
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin")
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

  const { error } = await supabase.from("artwork_sections").insert({
    artwork_id: artworkId,
    title,
    content,
    sort_order,
  })

  if (error) throw new Error(error.message)
  revalidatePath("/admin")
}

export async function deleteArtworkSection(id: string) {
  const supabase = await getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("artwork_sections")
    .delete()
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin")
}

// ========== NEWSLETTER ==========

export async function subscribeNewsletter(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string

  if (!name || !email) {
    return { error: "Name and email are required." }
  }

  try {
    const supabase = await getSupabaseClient()
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ name, email })
    if (error) {
      if (error.code === "23505") {
        return { error: "This email is already subscribed." }
      }
      return { error: error.message }
    }
    return { success: true }
  } catch {
    return {
      error:
        "Newsletter service is not available yet. Please try again later.",
    }
  }
}
