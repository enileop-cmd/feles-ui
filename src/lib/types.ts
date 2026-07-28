// ═══════════════════════════════════════════════════════════════
// Felix Lens (Felen) — TypeScript Database Types
// Auto-corresponds to the SQL schema in supabase/migrations/
// ═══════════════════════════════════════════════════════════════

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// ─── ROW TYPES ──────────────────────────────────────────────────

export interface Governorate {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export interface District {
  id: string;
  governorate_id: string | null;
  name_ar: string;
  name_en: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export interface Tag {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string | null;
  created_at: string;
}

export interface HeritageCategory {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  desc_ar: string | null;
  desc_en: string | null;
  color: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface Place {
  id: string;
  governorate_id: string | null;
  district_id: string | null;
  name_ar: string;
  name_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  lat: number | null;
  lng: number | null;
  place_type: string | null;
  serpapi_place_id: string | null;
  google_maps_url: string | null;
  google_rating: number | null;
  google_photo_url: string | null;
  serpapi_data: Json | null;
  serpapi_fetched_at: string | null;
  created_at: string;
  updated_at: string;
}

export type PhotoAspect = "portrait" | "landscape" | "square";
export type PhotoStatus = "draft" | "published" | "archived";

export interface Photo {
  id: string;
  title_ar: string;
  title_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  photographer: string | null;
  source: string | null;
  additional_details_ar: string | null;
  additional_details_en: string | null;
  year: number | null;
  date_taken: string | null;
  governorate_id: string | null;
  district_id: string | null;
  district_name: string | null;
  neighborhood_name: string | null;
  place_id: string | null;
  lat: number | null;
  lng: number | null;
  category_id: string | null;
  storage_path: string | null;
  storage_thumb_path: string | null;
  file_size_kb: number | null;
  width_px: number | null;
  height_px: number | null;
  aspect: PhotoAspect | null;
  status: PhotoStatus;
  featured: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // computed fts column — not usually needed on frontend
  fts?: string;
}

export type CommentStatus = "pending" | "approved" | "rejected";

export interface Comment {
  id: string;
  photo_id: string;
  user_id: string | null;
  guest_name: string | null;
  body: string;
  status: CommentStatus;
  created_at: string;
  updated_at: string;
}

export type UserRole = "user" | "editor" | "admin";

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  created_at: string;
}

export interface Favorite {
  user_id: string;
  photo_id: string;
  created_at: string;
}

export interface Collection {
  id: string;
  user_id: string;
  slug: string | null;
  title_ar: string | null;
  title_en: string | null;
  is_public: boolean;
  created_at: string;
}

export interface CollectionPhoto {
  collection_id: string;
  photo_id: string;
  sort_order: number;
}

export interface TimelineDecade {
  id: string;
  decade: number;
  label_ar: string;
  label_en: string | null;
  desc_ar: string | null;
  desc_en: string | null;
  sort_order: number;
}

// ─── JOIN / RPC TYPES ───────────────────────────────────────────

export interface PhotoWithRelations extends Photo {
  governorates: Governorate | null;
  districts: District | null;
  heritage_categories: HeritageCategory | null;
  places: Place | null;
  photo_tags: { tags: Tag }[];
}

export interface PhotoDetail {
  photo: Photo;
  governorate: Governorate | null;
  district: District | null;
  category: HeritageCategory | null;
  place: Place | null;
  tags: Tag[];
  comments: (Comment & { profile: Pick<Profile, "display_name" | "avatar_url"> | null })[];
  comment_count: number;
  favorite_count: number;
}

export interface MapMarker {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  lat: number;
  lng: number;
  photo_count: number;
}

export interface TimelineData {
  decade: number;
  label_ar: string;
  label_en: string | null;
  desc_ar: string | null;
  desc_en: string | null;
  photos: (Pick<Photo, "id" | "title_ar" | "title_en" | "year" | "storage_path" | "storage_thumb_path" | "aspect"> & {
    governorate: Governorate | null;
  })[];
  photo_count: number;
}

export interface ArchiveStats {
  total_photos: number;
  total_governorates: number;
  total_categories: number;
  total_comments: number;
  pending_comments: number;
  featured_count: number;
}

// ─── SUPABASE DATABASE SCHEMA (for createClient<Database>) ──────

export interface Database {
  public: {
    Tables: {
      governorates:        { Row: Governorate; Insert: Omit<Governorate, "id" | "created_at">; Update: Partial<Omit<Governorate, "id">>; };
      districts:           { Row: District;    Insert: Omit<District,    "id" | "created_at">; Update: Partial<Omit<District,    "id">>; };
      tags:                { Row: Tag;         Insert: Omit<Tag,         "id" | "created_at">; Update: Partial<Omit<Tag,         "id">>; };
      heritage_categories: { Row: HeritageCategory; Insert: Omit<HeritageCategory, "id" | "created_at">; Update: Partial<Omit<HeritageCategory, "id">>; };
      places:              { Row: Place;       Insert: Omit<Place,       "id" | "created_at" | "updated_at">; Update: Partial<Omit<Place, "id">>; };
      photos:              { Row: Photo;       Insert: Omit<Photo,       "id" | "created_at" | "updated_at" | "fts">; Update: Partial<Omit<Photo, "id" | "fts">>; };
      photo_tags:          { Row: { photo_id: string; tag_id: string }; Insert: { photo_id: string; tag_id: string }; Update: never; };
      profiles:            { Row: Profile;     Insert: Omit<Profile,     "created_at">; Update: Partial<Omit<Profile, "id">>; };
      comments:            { Row: Comment;     Insert: Omit<Comment,     "id" | "created_at" | "updated_at">; Update: Partial<Omit<Comment, "id">>; };
      favorites:           { Row: Favorite;    Insert: Omit<Favorite,    "created_at">; Update: never; };
      collections:         { Row: Collection;  Insert: Omit<Collection,  "id" | "created_at">; Update: Partial<Omit<Collection, "id">>; };
      collection_photos:   { Row: CollectionPhoto; Insert: CollectionPhoto; Update: Partial<CollectionPhoto>; };
      timeline_decades:    { Row: TimelineDecade; Insert: Omit<TimelineDecade, "id">; Update: Partial<Omit<TimelineDecade, "id">>; };
    };
    Views: Record<string, never>;
    Functions: {
      get_photo_detail:    { Args: { p_id: string };  Returns: PhotoDetail };
      get_map_markers:     { Args: Record<string, never>; Returns: MapMarker[] };
      get_timeline_data:   { Args: Record<string, never>; Returns: TimelineData[] };
      get_archive_stats:   { Args: Record<string, never>; Returns: ArchiveStats };
      toggle_favorite:     { Args: { p_photo_id: string }; Returns: { favorited: boolean } };
      is_admin:            { Args: Record<string, never>; Returns: boolean };
      is_editor:           { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      photo_aspect: PhotoAspect;
      photo_status: PhotoStatus;
      comment_status: CommentStatus;
      user_role: UserRole;
    };
  };
}
