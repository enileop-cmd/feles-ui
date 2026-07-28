import { createFileRoute, Link } from "@tanstack/react-router";
import { useHeritageCategories, usePhotos } from "@/lib/queries";
import { PhotoTile } from "@/components/PhotoTile";
import { SkeletonCard } from "@/components/SkeletonCard";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/heritage/$categoryId")({
  head: () => ({
    meta: [{ title: "فئة تراث · عدسة فيليكس" }],
  }),
  notFoundComponent: () => (
    <div className="max-w-3xl mx-auto p-16 text-center">
      <h1 className="text-3xl font-bold">الفئة غير موجودة</h1>
      <Link to="/heritage" className="text-accent underline mt-6 inline-block">عودة إلى التراث</Link>
    </div>
  ),
  component: HeritageCategoryPage,
});

function HeritageCategoryPage() {
  const { categoryId } = Route.useParams();
  const { data: categories } = useHeritageCategories();
  const { data: photos, isLoading } = usePhotos({ categoryId });

  const category = categories?.find((c) => c.id === categoryId);

  return (
    <>
      <header className="relative overflow-hidden border-b border-foreground/5">
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: `linear-gradient(135deg, ${category?.color ?? "#0F766E"} 0%, transparent 60%)` }}
        />
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <Link to="/heritage" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent mb-8">
            <ArrowLeft className="size-4" />
            كل الفئات
          </Link>
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent block mb-4">
            فئة تراثية · {category?.name_en ?? ""}
          </span>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">{category?.name_ar ?? "…"}</h1>
          <p className="text-lg text-muted-foreground mt-5 max-w-2xl leading-relaxed">
            {category?.desc_ar}
          </p>
          <p className="text-xs font-mono uppercase tracking-widest text-accent mt-6">
            {photos?.length ?? 0} مادة مؤرشفة
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : !photos || photos.length === 0 ? (
          <div className="border border-dashed border-foreground/15 rounded-sm py-20 text-center text-muted-foreground">
            لا توجد مواد في هذه الفئة بعد.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {photos.map((p, i) => (
              <PhotoTile key={p.id} photo={p} className={i % 2 === 1 ? "md:translate-y-6" : ""} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}