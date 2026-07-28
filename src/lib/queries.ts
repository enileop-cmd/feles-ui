// ═══════════════════════════════════════════════════════════════
// Felix Lens — TanStack Query hooks for all Supabase queries
// ═══════════════════════════════════════════════════════════════
import { useQuery, useMutation, useQueryClient, infiniteQueryOptions } from "@tanstack/react-query";
import { supabase } from "./supabase";
import type {
  Photo,
  PhotoWithRelations,
  PhotoDetail,
  MapMarker,
  TimelineData,
  ArchiveStats,
  Comment,
  Governorate,
  HeritageCategory,
  Tag,
} from "./types";

// ─── QUERY KEYS ─────────────────────────────────────────────────
export const QK = {
  photos: (filters?: object) => ["photos", filters] as const,
  photo:  (id: string)       => ["photo", id] as const,
  mapMarkers:    ()           => ["map-markers"] as const,
  timeline:      ()           => ["timeline"] as const,
  stats:         ()           => ["archive-stats"] as const,
  comments:      (photoId: string) => ["comments", photoId] as const,
  favorites:     (userId?: string) => ["favorites", userId] as const,
  governorates:  ()           => ["governorates"] as const,
  categories:    ()           => ["heritage-categories"] as const,
  tags:          ()           => ["tags"] as const,
} as const;

// ─── PHOTO HOOKS ────────────────────────────────────────────────

export interface PhotoFilters {
  governorateId?: string | null;
  categoryId?: string | null;
  tagId?: string | null;
  year?: number | null;
  yearRange?: [number, number] | null;
  search?: string | null;
  featured?: boolean;
  page?: number;
  perPage?: number;
}

export function usePhotos(filters: PhotoFilters = {}) {
  const { governorateId, categoryId, tagId, yearRange, search, featured, page = 0, perPage = 24 } = filters;

  return useQuery({
    queryKey: QK.photos(filters),
    queryFn: async () => {
      let query;
      if (search) {
        query = supabase
          .rpc("search_photos_with_tags", { search_term: search })
          .select("*, governorates(*), heritage_categories(*), photo_tags(tags(*))")
          .eq("status", "published");
      } else {
        query = supabase
          .from("photos")
          .select("*, governorates(*), heritage_categories(*), photo_tags(tags(*))")
          .eq("status", "published");
      }

      if (!search) {
        query = query.order("created_at", { ascending: false });
      }
      query = query.range(page * perPage, page * perPage + perPage - 1);

      if (governorateId) query = query.eq("governorate_id", governorateId);
      if (categoryId)    query = query.eq("category_id", categoryId);
      if (featured)      query = query.eq("featured", true);
      if (yearRange)     query = query.gte("year", yearRange[0]).lte("year", yearRange[1]);

      // Tag filter requires a subquery via photo_tags
      if (tagId) {
        const { data: photoIds } = await supabase
          .from("photo_tags")
          .select("photo_id")
          .eq("tag_id", tagId);
        const ids = (photoIds ?? []).map((r) => r.photo_id);
        if (ids.length === 0) return [] as PhotoWithRelations[];
        query = query.in("id", ids);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as PhotoWithRelations[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useFeaturedPhotos(limit = 8) {
  return useQuery({
    queryKey: QK.photos({ featured: true, perPage: limit }),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("photos")
        .select("*, governorates(*), heritage_categories(*)")
        .eq("status", "published")
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as PhotoWithRelations[];
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function usePhotoDetail(id: string | undefined) {
  return useQuery({
    queryKey: QK.photo(id ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_photo_detail", { p_id: id! });
      if (error) throw error;
      return data as PhotoDetail;
    },
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
}

// ─── MAP HOOKS ──────────────────────────────────────────────────

export function useMapPhotos() {
  return useQuery({
    queryKey: ["map-photos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("photos")
        .select("id, title_ar, title_en, lat, lng, storage_path, governorate_id, governorates(name_ar), heritage_categories(color)")
        .eq("status", "published")
        .not("lat", "is", null)
        .not("lng", "is", null);
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 15,
  });
}

export function useMapMarkers() {
  return useQuery({
    queryKey: QK.mapMarkers(),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_map_markers");
      if (error) throw error;
      return (data ?? []) as MapMarker[];
    },
    staleTime: 1000 * 60 * 15,
  });
}

// ─── TIMELINE HOOKS ─────────────────────────────────────────────

export function useTimelineData() {
  return useQuery({
    queryKey: QK.timeline(),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_timeline_data");
      if (error) throw error;
      return (data ?? []) as TimelineData[];
    },
    staleTime: 1000 * 60 * 15,
  });
}

// ─── STATS HOOKS ────────────────────────────────────────────────

export function useArchiveStats() {
  return useQuery({
    queryKey: QK.stats(),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_archive_stats");
      if (error) throw error;
      return data as ArchiveStats;
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ─── COMMENT HOOKS ──────────────────────────────────────────────

export function useComments(photoId: string) {
  return useQuery({
    queryKey: QK.comments(photoId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*, profiles(display_name, avatar_url)")
        .eq("photo_id", photoId)
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ photoId, body }: { photoId: string; body: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("comments").insert({
        photo_id: photoId,
        user_id: user?.id ?? null,
        body,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: (_, { photoId }) => {
      qc.invalidateQueries({ queryKey: QK.comments(photoId) });
    },
  });
}

// ─── FAVORITE HOOKS ─────────────────────────────────────────────

export function useFavorites(userId: string | undefined) {
  return useQuery({
    queryKey: QK.favorites(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select("photo_id, photos(*)")
        .eq("user_id", userId!);
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (photoId: string) => {
      const { data, error } = await supabase.rpc("toggle_favorite", { p_photo_id: photoId });
      if (error) throw error;
      return data as { favorited: boolean };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

// ─── TAXONOMY HOOKS ─────────────────────────────────────────────

export function useGovernorates() {
  return useQuery({
    queryKey: QK.governorates(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("governorates")
        .select("*")
        .order("name_ar");
      if (error) throw error;
      return (data ?? []) as Governorate[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour (rarely changes)
  });
}

// ─── ADMIN HOOKS ────────────────────────────────────────────────

export function useAdminComments(statusFilter?: "pending" | "approved" | "rejected" | "all") {
  return useQuery({
    queryKey: ["admin", "comments", statusFilter],
    queryFn: async () => {
      let q = supabase
        .from("comments")
        .select("*, profiles(display_name, avatar_url), photos(title_ar)")
        .order("created_at", { ascending: false });
      
      if (statusFilter && statusFilter !== "all") {
        q = q.eq("status", statusFilter);
      }
      
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAdminUpdateCommentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const { error } = await supabase.from("comments").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "comments"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
      qc.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}

export function useAdminDashboardStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const [photos, gov, cat, comments] = await Promise.all([
        supabase.from("photos").select("id", { count: "exact" }),
        supabase.from("governorates").select("id", { count: "exact" }),
        supabase.from("heritage_categories").select("id", { count: "exact" }),
        supabase.from("comments").select("id", { count: "exact" }).eq("status", "pending"),
      ]);
      return {
        photos: photos.count ?? 0,
        governorates: gov.count ?? 0,
        categories: cat.count ?? 0,
        pendingComments: comments.count ?? 0,
      };
    },
  });
}

export function useHeritageCategories() {
  return useQuery({
    queryKey: QK.categories(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("heritage_categories")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as HeritageCategory[];
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useTags() {
  return useQuery({
    queryKey: QK.tags(),
    queryFn: async () => {
      const { data, error } = await supabase.from("tags").select("*").order("name_ar");
      if (error) throw error;
      return (data ?? []) as Tag[];
    },
    staleTime: 1000 * 60 * 60,
  });
}

// ─── ADMIN MUTATIONS ────────────────────────────────────────────

export function useApproveComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('comments')
        .update({ status: 'approved' })
        .eq('id', commentId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments'] }),
  });
}

export function useRejectComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('comments')
        .update({ status: 'rejected' })
        .eq('id', commentId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments'] }),
  });
}

export function useDeletePhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (photoId: string) => {
      const { error } = await supabase
        .from('photos')
        .update({ status: 'archived' })
        .eq('id', photoId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['photos'] }),
  });
}

export function useAdminAddPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ files, payload, tags }: { files: File[]; payload: any; tags?: string[] }) => {
      if (files.length === 0) throw new Error("No files provided");

      const uploadedPaths: string[] = [];
      
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `photos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('archive')
          .upload(filePath, file);

        if (uploadError) throw uploadError;
        uploadedPaths.push(filePath);
      }

      const { data: insertedPhoto, error: insertError } = await supabase.from('photos').insert({
        ...payload,
        storage_path: uploadedPaths[0],
        additional_paths: uploadedPaths.slice(1),
      }).select('id').single();

      if (insertError) throw insertError;

      if (tags && tags.length > 0) {
        const tagInserts = tags.map((tagId: string) => ({ photo_id: insertedPhoto.id, tag_id: tagId }));
        const { error: tagError } = await supabase.from('photo_tags').insert(tagInserts);
        if (tagError) throw tagError;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['photos'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useAdminEditPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, newFiles, existingPaths, payload, tags }: { id: string; newFiles: File[]; existingPaths: string[]; payload: any; tags?: string[] }) => {
      const uploadedPaths: string[] = [];
      
      for (const file of newFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `photos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('archive')
          .upload(filePath, file);

        if (uploadError) throw uploadError;
        uploadedPaths.push(filePath);
      }

      const allPaths = [...existingPaths, ...uploadedPaths];
      
      let storagePath = allPaths.length > 0 ? allPaths[0] : payload.storage_path;
      let additionalPaths = allPaths.length > 0 ? allPaths.slice(1) : [];

      const { error: updateError } = await supabase.from('photos').update({
        ...payload,
        storage_path: storagePath,
        additional_paths: additionalPaths,
      }).eq('id', id);

      if (updateError) throw updateError;

      if (tags) {
        await supabase.from('photo_tags').delete().eq('photo_id', id);
        if (tags.length > 0) {
          const tagInserts = tags.map((tagId: string) => ({ photo_id: id, tag_id: tagId }));
          const { error: tagError } = await supabase.from('photo_tags').insert(tagInserts);
          if (tagError) throw tagError;
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['photos'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useAdminDeletePhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('photos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['photos'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

// ─── ADMIN USERS HOOKS ──────────────────────────────────────────

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAdminUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: 'user' | 'editor' | 'admin' }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}
