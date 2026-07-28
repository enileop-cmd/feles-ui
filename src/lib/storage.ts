import { supabase } from "./supabase";

const PHOTOS_BUCKET     = "archive";
const THUMBNAILS_BUCKET = "thumbnails";
const AVATARS_BUCKET    = "avatars";

// ─── GET PUBLIC URL ─────────────────────────────────────────────

export function getPhotoUrl(storagePath: string | null | undefined): string | null {
  if (!storagePath) return null;
  const { data } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(storagePath);
  return data?.publicUrl ?? null;
}

export function getThumbUrl(storagePath: string | null | undefined): string | null {
  if (!storagePath) return null;
  const { data } = supabase.storage.from(THUMBNAILS_BUCKET).getPublicUrl(storagePath);
  return data?.publicUrl ?? null;
}

export function getAvatarUrl(storagePath: string | null | undefined): string | null {
  if (!storagePath) return null;
  const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(storagePath);
  return data?.publicUrl ?? null;
}

// ─── UPLOAD PHOTO ───────────────────────────────────────────────

export interface UploadResult {
  storagePath: string;
  publicUrl: string;
  fileSizeKb: number;
  width: number;
  height: number;
  aspect: "portrait" | "landscape" | "square";
}

export async function uploadPhoto(file: File, photoId: string): Promise<UploadResult> {
  // Determine aspect ratio from image dimensions
  const dims = await getImageDimensions(file);
  const aspect = dims.width > dims.height * 1.1
    ? "landscape"
    : dims.height > dims.width * 1.1
    ? "portrait"
    : "square";

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${photoId}/${photoId}.${ext}`;

  const { error } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw error;

  const { data } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path);

  return {
    storagePath: path,
    publicUrl: data.publicUrl,
    fileSizeKb: Math.round(file.size / 1024),
    width: dims.width,
    height: dims.height,
    aspect,
  };
}

// ─── UPLOAD AVATAR ──────────────────────────────────────────────

export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${userId}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw error;

  const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// ─── DELETE PHOTO FILES ─────────────────────────────────────────

export async function deletePhotoFiles(storagePath: string, thumbPath?: string | null) {
  const paths = [storagePath];
  if (thumbPath) paths.push(thumbPath);

  const { error } = await supabase.storage.from(PHOTOS_BUCKET).remove(paths);
  if (error) throw error;
}

// ─── HELPERS ────────────────────────────────────────────────────

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = url;
  });
}

// ─── PLACEHOLDER GRADIENT (while image loads) ───────────────────
// Used as a CSS background when no photo is uploaded yet (dev/mock mode)

const GRADIENTS = [
  "linear-gradient(135deg,#3b1f0e,#a4562b,#f0b565)",
  "linear-gradient(135deg,#2d1a0d,#8a5a2d,#e0b877)",
  "linear-gradient(135deg,#0a2540,#2b5c8a,#c46a8f)",
  "linear-gradient(135deg,#2d3a1a,#6a7a3d,#b8a86d)",
  "linear-gradient(135deg,#f0e5cd,#c9a86a,#7a5a2d)",
  "linear-gradient(135deg,#1a1a1a,#5c4a3d,#a08a6d)",
  "linear-gradient(135deg,#2d1a0d,#7a3d2d,#c46a3d)",
  "linear-gradient(135deg,#3d2d0d,#8a6a2d,#e0c88a)",
];

export function getPlaceholderGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}
