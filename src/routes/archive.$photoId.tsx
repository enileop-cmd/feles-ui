import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { usePhotoDetail, useComments, useAddComment, useToggleFavorite, usePhotos, useFavorites } from "@/lib/queries";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getPhotoUrl, getPlaceholderGradient } from "@/lib/storage";
import { Heart, Share2, MapPin, MessageCircle, ArrowLeft, Maximize2, Clock, User, Info, ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PhotoTile } from "@/components/PhotoTile";
import { SkeletonCard } from "@/components/SkeletonCard";

export const Route = createFileRoute("/archive/$photoId")({
  head: () => ({
    meta: [{ title: "صورة · عدسة فيليكس" }],
  }),
  component: PhotoDetail,
  notFoundComponent: () => (
    <div className="max-w-3xl mx-auto p-16 text-center">
      <h1 className="text-3xl font-bold">الصورة غير موجودة</h1>
      <p className="text-muted-foreground mt-3">قد تكون الصورة قد أزيلت من الأرشيف.</p>
      <Link to="/archive" className="text-accent underline mt-6 inline-block">العودة للأرشيف</Link>
    </div>
  ),
});

function PhotoDetail() {
  const { t, language } = useLanguage();
  const { photoId } = Route.useParams();
  const { data: detail, isLoading } = usePhotoDetail(photoId);
  const { data: photoComments, isLoading: loadingComments } = useComments(photoId);
  const addComment = useAddComment();
  const toggleFavorite = useToggleFavorite();
  const { user } = useAuth();
  const [commentBody, setCommentBody] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { data: favorites } = useFavorites(user?.id);
  const isFavorite = favorites?.some((f: any) => f.photo_id === photoId) ?? false;

  // Fetch some related photos by category or gov
  const { data: relatedPhotos } = usePhotos({
    categoryId: detail?.category?.id,
    perPage: 4,
  });


  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    toast.success(language === "en" ? "Link copied to clipboard" : "تم نسخ الرابط بنجاح");
  }

  async function handleFavorite() {
    if (!user) return;
    await toggleFavorite.mutateAsync(photoId);
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentBody.trim()) return;
    await addComment.mutateAsync({ photoId, body: commentBody });
    setCommentBody("");
    toast.success(language === "en" ? "Comment sent and awaiting review" : "تم إرسال التعليق وهو بانتظار مراجعة الإدارة");
  }

  if (isLoading || !detail) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="pt-24 min-h-screen px-6">
          <SkeletonCard className="h-96" />
        </div>
      </div>
    );
  }

  const { photo, category, governorate } = detail;
  const allImages = [
    ...(photo?.storage_path ? [photo.storage_path] : []),
    ...(photo?.additional_paths || [])
  ];
  const currentImagePath = allImages[currentImageIndex] || null;
  const imageUrl = currentImagePath ? getPhotoUrl(currentImagePath) : null;
  
  const backgroundStyle = imageUrl
    ? { backgroundImage: `url(${imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: getPlaceholderGradient(photoId) };

  const catName = category ? (language === "en" ? category.name_en : category.name_ar) : "";
  const catColor = category?.color || "#555";
  const govName = governorate ? (language === "en" ? governorate.name_en : governorate.name_ar) : "";
  const locationParts = [govName];
  if (photo?.district_name) locationParts.push(photo.district_name);
  if (photo?.neighborhood_name) locationParts.push(photo.neighborhood_name);
  const fullLocation = locationParts.filter(Boolean).join("، ");
  
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };
  
  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <Link to="/archive" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group w-fit">
        <ArrowLeft className={`size-4 transition-transform group-hover:-translate-x-1 ${language === 'en' ? 'rotate-180 group-hover:translate-x-1 group-hover:-translate-x-0' : ''}`} />
        {t("archive")}
      </Link>

      <div className="grid lg:grid-cols-[1fr_400px] gap-10 items-start">
        {/* Photo */}
        <div className="space-y-4">
          <div className="space-y-4">
            <Dialog>
              <DialogTrigger asChild>
                <div
                  className="relative w-full aspect-[4/3] rounded-sm overflow-hidden cursor-zoom-in group bg-foreground/5"
                  style={backgroundStyle}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <button className="absolute bottom-4 left-4 bg-background/80 backdrop-blur p-2 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="size-4" />
                  </button>
                  
                  {allImages.length > 1 && (
                    <>
                      <button 
                        onClick={handlePrevImage} 
                        className="absolute top-1/2 -translate-y-1/2 left-4 bg-background/80 hover:bg-background text-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <ChevronLeft className="size-5" />
                      </button>
                      <button 
                        onClick={handleNextImage} 
                        className="absolute top-1/2 -translate-y-1/2 right-4 bg-background/80 hover:bg-background text-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <ChevronRight className="size-5" />
                      </button>
                      <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur px-3 py-1.5 rounded-sm text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        {currentImageIndex + 1} / {allImages.length}
                      </div>
                    </>
                  )}
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-5xl bg-background border-none p-2">
                <DialogTitle className="sr-only">{language === 'en' && photo.title_en ? photo.title_en : photo.title_ar}</DialogTitle>
                <div className="relative w-full aspect-[4/3] rounded overflow-hidden" style={backgroundStyle}>
                  {allImages.length > 1 && (
                    <>
                      <button 
                        onClick={handlePrevImage} 
                        className="absolute top-1/2 -translate-y-1/2 left-4 bg-background/50 hover:bg-background text-foreground p-3 rounded-full transition-all"
                      >
                        <ChevronLeft className="size-6" />
                      </button>
                      <button 
                        onClick={handleNextImage} 
                        className="absolute top-1/2 -translate-y-1/2 right-4 bg-background/50 hover:bg-background text-foreground p-3 rounded-full transition-all"
                      >
                        <ChevronRight className="size-6" />
                      </button>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative aspect-[4/3] rounded overflow-hidden border-2 transition-all ${currentImageIndex === idx ? 'border-accent' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={getPhotoUrl(img)} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action bar */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleFavorite}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm font-medium border transition-colors ${
                isFavorite
                  ? "bg-red-500/10 text-red-500 border-red-500/30"
                  : "border-foreground/10 hover:bg-foreground/5"
              }`}
            >
              <Heart className={`size-4 ${isFavorite ? "fill-current" : ""}`} />
              {isFavorite ? t("saved") : t("save")}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm font-medium border border-foreground/10 hover:bg-foreground/5 transition-colors"
            >
              <Share2 className="size-4" />
              {t("share")}
            </button>
          </div>
        </div>

        {/* Metadata panel */}
        <aside className="space-y-8 lg:sticky lg:top-24">
          {/* Title & Category */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ background: `${catColor}20`, color: catColor }}
              >
                {catName}
              </span>
            </div>
            <h1 className="text-3xl font-bold leading-snug">{language === "en" && photo.title_en ? photo.title_en : photo.title_ar}</h1>
            {language === "ar" && photo.title_en && (
              <p className="text-sm text-muted-foreground mt-1 font-mono">{photo.title_en}</p>
            )}
          </div>

          {/* Description */}
          {((language === "en" && photo.description_en) || photo.description_ar) && (
            <p className="text-muted-foreground leading-relaxed text-sm">
              {language === "en" && photo.description_en ? photo.description_en : photo.description_ar}
            </p>
          )}

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-4 border border-foreground/10 rounded-sm p-5 bg-surface">
            <MetaItem icon={<MapPin className="size-3.5" />} label={t("governorate")} value={fullLocation || "—"} />
            <MetaItem icon={<Clock className="size-3.5" />} label={t("year")} value={photo.year?.toString() ?? "—"} />
            <MetaItem icon={<User className="size-3.5" />} label={t("photographer")} value={photo.photographer ?? "—"} />
            <MetaItem icon={<MapPin className="size-3.5" />} label={t("coordinates")} value={
              photo.lat && photo.lng
                ? <a href={`https://www.google.com/maps/search/?api=1&query=${photo.lat},${photo.lng}`} target="_blank" rel="noreferrer" className="text-accent hover:underline">{`${Number(photo.lat).toFixed(4)}°, ${Number(photo.lng).toFixed(4)}°`}</a>
                : "—"
            } />
            {photo.source && (
              <MetaItem icon={<MessageCircle className="size-3.5" />} label={language === "en" ? "Source" : "المصدر"} value={photo.source} />
            )}
          </div>
          
          {((language === "en" && photo.additional_details_en) || photo.additional_details_ar) && (
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 text-sm text-accent bg-accent/10 px-4 py-2 rounded-sm hover:bg-accent/20 transition-colors w-full justify-center mt-4">
                  <Info className="size-4" />
                  {language === "en" ? "Read more details" : "اقرأ المزيد من التفاصيل"}
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogTitle>{language === "en" ? "Additional Details" : "تفاصيل إضافية"}</DialogTitle>
                <div className="mt-4 text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm">
                  {language === "en" && photo.additional_details_en ? photo.additional_details_en : photo.additional_details_ar}
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Tags */}
          {detail.tags && detail.tags.length > 0 && (
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">{t("tags")}</h3>
              <div className="flex flex-wrap gap-1.5">
                {detail.tags.map((t: any) => (
                  <span
                    key={t.id}
                    className="text-xs px-2.5 py-1 rounded-full border border-foreground/10 text-muted-foreground"
                  >
                    {language === 'en' ? t.name_en : t.name_ar}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-4">
              <MessageCircle className="size-4 text-accent" />
              {t("comments")} ({photoComments?.length ?? 0})
            </h3>

            {user ? (
              <form onSubmit={handleComment} className="mb-6">
                <textarea
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  placeholder={t("addComment")}
                  rows={3}
                  className="w-full bg-surface border border-foreground/10 rounded-sm p-3 text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                />
                <button
                  type="submit"
                  disabled={addComment.isPending || !commentBody.trim()}
                  className="mt-2 bg-accent text-accent-foreground px-4 py-2 text-sm rounded-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {addComment.isPending ? t("sending") : t("send")}
                </button>
              </form>
            ) : (
              <Link
                to="/auth"
                className="block text-center text-sm text-accent border border-accent/20 rounded-sm py-2.5 mb-6 hover:bg-accent/5 transition-colors"
              >
                {t("loginToComment")}
              </Link>
            )}

            {loadingComments ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <div key={i} className="h-12 rounded bg-foreground/5 animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {photoComments?.map((c: any) => (
                  <div key={c.id} className="bg-surface rounded-sm p-4 border border-foreground/5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="size-6 rounded-full bg-accent/20 flex items-center justify-center">
                        <User className="size-3 text-accent" />
                      </div>
                      <span className="text-xs font-medium">{c.profiles?.display_name ?? t("anonymous")}</span>
                      <span className={`text-xs text-muted-foreground ${language === 'ar' ? 'mr-auto' : 'ml-auto'}`}>
                        {new Date(c.created_at).toLocaleDateString(language === 'ar' ? 'ar-YE' : 'en-US')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{c.body}</p>
                  </div>
                ))}
                {photoComments?.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">{t("noComments")}</p>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Related photos */}
      {relatedPhotos && relatedPhotos.length > 0 && (
        <section className="mt-20 pt-12 border-t border-foreground/10">
          <h2 className="text-xl font-bold mb-8">{t("relatedPhotos")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedPhotos.filter(p => p.id !== photo.id).slice(0, 4).map((p: any) => (
              <PhotoTile key={p.id} photo={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-[10px] font-mono uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}