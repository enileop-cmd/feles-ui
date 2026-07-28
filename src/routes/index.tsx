import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Map, Clock, Grid3x3, Sparkles } from "lucide-react";
import { useFeaturedPhotos, useHeritageCategories, useTimelineData, useGovernorates, useArchiveStats } from "@/lib/queries";
import { PhotoTile } from "@/components/PhotoTile";
import { SkeletonCard } from "@/components/SkeletonCard";
import { getPhotoUrl, getPlaceholderGradient } from "@/lib/storage";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { data: featuredPhotos, isLoading: loadingFeatured } = useFeaturedPhotos(8);
  const { data: categories, isLoading: loadingCategories } = useHeritageCategories();
  const { data: timelineDecades, isLoading: loadingTimeline } = useTimelineData();
  const { data: stats } = useArchiveStats();
  const { data: governorates } = useGovernorates();
  
  // Use first featured photo or fallback as hero
  const heroPhoto = featuredPhotos?.[0];
  const heroGovName = heroPhoto?.governorates?.name_ar ?? "صنعاء";
  const heroYear = heroPhoto?.year ?? 1974;
  const heroTitle = heroPhoto?.title_ar ?? "بيوت صنعاء القديمة عند الغروب";
  const heroImageUrl = heroPhoto?.storage_path ? getPhotoUrl(heroPhoto.storage_path) : null;
  const heroBackground = heroImageUrl 
    ? { backgroundImage: `url(${heroImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: getPlaceholderGradient(heroPhoto?.id ?? "hero") };

  return (
    <>
      {/* Hero */}
      <section className="px-6 py-14 md:py-24 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-12 gap-10 md:gap-14 items-end">
          <div className="md:col-span-7 animate-fade-in-up">
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent mb-5 block">
              مشروع توثيق الذاكرة البصرية · اليمن
            </span>
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] text-balance mb-8">
              حِفظُ التاريخ اليمني،
              <br />
              <span className="text-accent">صورةً بصورة.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed mb-8">
              أرشيف رقمي بصري للتراث غير المادي في اليمن؛ يوثّق الأماكن، الحرف، الزوامل،
              والطقوس والحكايات الشعبية، عبر واجهة سلسة ثنائية اللغة.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/archive"
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-5 py-3 text-sm rounded-sm hover:opacity-90 transition-all"
              >
                استكشاف الأرشيف
                <ArrowLeft className="size-4" />
              </Link>
              <Link
                to="/map"
                className="inline-flex items-center gap-2 border border-foreground/15 px-5 py-3 text-sm rounded-sm hover:bg-foreground/5 transition-all"
              >
                <Map className="size-4" />
                خريطة اليمن التفاعلية
              </Link>
            </div>
          </div>
          <div className="md:col-span-5 animate-fade-in-up [animation-delay:200ms]">
            <div
              className="w-full aspect-[4/5] outline outline-1 -outline-offset-1 outline-black/5 rounded-sm relative group overflow-hidden bg-foreground/5"
              style={heroBackground}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent" />
              <div className="absolute top-4 right-4 bg-background/90 backdrop-blur px-3 py-1.5 rounded-sm">
                <p className="text-[10px] font-mono uppercase tracking-widest text-foreground/70">
                  صورة الغلاف
                </p>
              </div>
              <div className="absolute bottom-5 right-5 left-5 text-white">
                <p className="text-xs font-mono opacity-80">
                  {heroGovName} · {heroYear}
                </p>
                <p className="text-lg font-semibold mt-1">{heroTitle}</p>
                <p className="text-[10px] font-mono opacity-70 mt-2">
                  {heroPhoto?.lat ? heroPhoto.lat.toFixed(4) : "15.3694"}° N, {heroPhoto?.lng ? heroPhoto.lng.toFixed(4) : "44.1910"}° E
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick nav */}
      <section className="px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-foreground/10 border border-foreground/10 rounded-sm overflow-hidden">
          {[
            { to: "/archive", icon: Grid3x3, ar: "أرشيف الصور", n: stats ? `${stats.total_photos} صورة` : "..." },
            { to: "/timeline", icon: Clock, ar: "الجدول الزمني", n: stats ? `${stats.total_decades} حقبة` : "..." },
            { to: "/map", icon: Map, ar: "الخريطة", n: stats ? `${stats.total_locations} موقع` : "..." },
            { to: "/heritage", icon: Sparkles, ar: "التراث غير المادي", n: stats ? `${stats.total_categories} فئات` : "..." },
          ].map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="group bg-background p-6 md:p-8 hover:bg-surface transition-colors flex flex-col gap-6"
            >
              <q.icon className="size-6 text-accent" />
              <div>
                <p className="text-base font-semibold group-hover:text-accent transition-colors">
                  {q.ar}
                </p>
                <p className="text-xs font-mono text-muted-foreground mt-1 uppercase tracking-wider">
                  {q.n}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured archive */}
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent block mb-3">
              أحدث الإضافات
            </span>
            <h2 className="text-3xl md:text-4xl font-bold">مقتطفات من الأرشيف</h2>
          </div>
          <Link
            to="/archive"
            className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-accent hover:gap-4 transition-all"
          >
            كل الصور
            <ArrowLeft className="size-4" />
          </Link>
        </div>
        
        {loadingFeatured ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredPhotos?.slice(0, 4).map((p, i) => (
              <PhotoTile key={p.id} photo={p} className={i % 2 === 1 ? "md:translate-y-8" : ""} />
            ))}
          </div>
        )}
      </section>

      {/* Heritage strip */}
      <section className="px-6 py-20 bg-surface/50 border-y border-foreground/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <h2 className="text-3xl font-bold">فئات التراث</h2>
            <Link to="/heritage" className="text-sm font-semibold text-accent hover:underline">
              عرض الكل
            </Link>
          </div>
          
          {loadingCategories ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-48 rounded bg-foreground/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories?.slice(0, 4).map((c) => (
                <Link
                  key={c.id}
                  to="/heritage/$categoryId"
                  params={{ categoryId: c.slug }}
                  className="group block bg-background border border-foreground/10 p-6 rounded-sm hover:border-accent/40 transition-colors"
                >
                  <div
                    className="w-full h-24 rounded-sm mb-5"
                    style={{ background: `linear-gradient(135deg, ${c.color} 0%, ${c.color}80 100%)` }}
                  />
                  <h3 className="text-lg font-semibold mt-2 group-hover:text-accent transition-colors">
                    {c.name_ar}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                    {c.desc_ar}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Map + Timeline preview */}
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="relative aspect-square bg-surface rounded-full border border-foreground/10 p-8">
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-accent/10 via-transparent to-foreground/5" />
              <div className="absolute inset-0 grid place-items-center">
                <div className="w-64 h-64 border border-accent/20 rounded-full animate-pulse" />
              </div>
              {[
                { top: "30%", left: "40%" },
                { top: "55%", left: "62%" },
                { top: "70%", left: "35%" },
                { top: "78%", left: "70%" },
              ].map((m, i) => (
                <div key={i} className="absolute group" style={{ top: m.top, left: m.left }}>
                  <div className="w-3 h-3 bg-accent rounded-full animate-ping absolute" />
                  <div className="w-3 h-3 bg-accent rounded-full relative" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap bg-foreground text-background text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {governorates?.[i]?.name_ar ?? ["صنعاء", "شبام", "زبيد", "المكلا"][i]}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent block mb-3">
              جغرافياً وزمنياً
            </span>
            <h2 className="text-4xl font-bold mb-6">التوزيع عبر اليمن والعصور</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              تصفّح الأرشيف عبر خريطة اليمن التفاعلية، أو تتبّع التحولات المعمارية
              والاجتماعية عبر جدول زمني موثّق يمتد من مطلع القرن العشرين حتى اليوم.
            </p>
            <div className="space-y-5">
              {loadingTimeline ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 w-full rounded bg-foreground/5 animate-pulse" />
                ))
              ) : (
                timelineDecades?.slice(0, 3).map((d, i) => (
                  <div
                    key={d.decade}
                    className={`flex items-start gap-4 border-r-2 pr-6 ${
                      i === 1 ? "border-accent" : "border-accent/20"
                    }`}
                  >
                    <span className="font-mono text-sm text-accent shrink-0 w-16">{d.decade}s</span>
                    <div>
                      <h4 className="font-semibold">{d.label_ar}</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {d.desc_ar}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-3 mt-10">
              <Link
                to="/map"
                className="inline-flex items-center gap-2 font-semibold text-accent hover:gap-4 transition-all"
              >
                استكشاف الخريطة كاملة
                <ArrowLeft className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
