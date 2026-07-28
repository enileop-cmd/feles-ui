import { createFileRoute, Link } from "@tanstack/react-router";
import { useFavorites } from "@/lib/queries";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { PhotoTile } from "@/components/PhotoTile";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Heart, FolderPlus } from "lucide-react";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "المفضلة · عدسة فيليكس" },
      { name: "description", content: "الصور التي قمت بحفظها من الأرشيف." },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { user } = useAuth();
  const { data: favorites, isLoading } = useFavorites(user?.id);

  const favoritePhotos = favorites?.map((f: any) => f.photos).filter(Boolean) ?? [];

  if (!user) {
    return (
      <>
        <PageHeader kicker="المساحة الشخصية" title="الصور المفضلة" description="سجّل دخولك لحفظ الصور المفضلة." />
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <Heart className="size-12 text-muted-foreground/30 mx-auto mb-6" />
          <p className="text-muted-foreground mb-4">يجب تسجيل الدخول لعرض مفضلتك.</p>
          <Link to="/auth" className="bg-accent text-accent-foreground px-5 py-2.5 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity">
            تسجيل الدخول
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        kicker="المساحة الشخصية"
        title="الصور المفضلة"
        description="الصور التي قمت بحفظها لسهولة الوصول إليها لاحقاً."
      >
        <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground bg-surface border border-foreground/10 px-3 py-1.5 rounded-sm inline-flex items-center gap-2">
          <Heart className="size-3 fill-accent text-accent" />
          {favoritePhotos.length} صور محفوظة
        </div>
      </PageHeader>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-4 border-b border-foreground/10 w-full pb-px">
            <button className="pb-3 border-b-2 border-accent text-foreground font-semibold text-sm px-2">
              كل المفضلة
            </button>
            <button className="pb-3 border-b-2 border-transparent text-muted-foreground hover:text-foreground text-sm px-2 transition-colors">
              المجموعات
            </button>
          </div>
        </div>

        <div className="mb-12">
          <button className="w-full py-8 border border-dashed border-foreground/20 rounded-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors flex flex-col items-center justify-center gap-2 group">
            <div className="size-10 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-foreground/10 transition-colors">
              <FolderPlus className="size-5" />
            </div>
            <span className="text-sm font-medium">إنشاء مجموعة جديدة</span>
            <span className="text-xs">قم بتنظيم صورك المفضلة في مجموعات مخصصة</span>
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : favoritePhotos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {favoritePhotos.map((p: any) => (
              <PhotoTile key={p.id} photo={p} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-foreground/15 rounded-sm py-24 text-center bg-surface">
            <Heart className="size-8 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">لم تقم بإضافة أي صور للمفضلة بعد.</p>
            <Link to="/archive" className="text-accent hover:underline text-sm font-medium mt-4 inline-block">
              تصفح الأرشيف
            </Link>
          </div>
        )}
      </div>
    </>
  );
}