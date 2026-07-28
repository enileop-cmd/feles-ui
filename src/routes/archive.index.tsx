import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { usePhotos, useGovernorates, useHeritageCategories, useTags } from "@/lib/queries";
import { PhotoTile } from "@/components/PhotoTile";
import { SkeletonCard } from "@/components/SkeletonCard";
import { PageHeader } from "@/components/PageHeader";
import { ChevronDown, X, Filter, Search, Calendar } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/contexts/LanguageContext";

export const Route = createFileRoute("/archive/")({
  validateSearch: (search) => ({
    gov: typeof search.gov === "string" ? search.gov : undefined,
  }),
  head: () => ({
    meta: [
      { title: "الأرشيف · عدسة فيليكس" },
      { name: "description", content: "تصفّح آلاف الصور من الأرشيف البصري اليمني." },
    ],
  }),
  component: ArchivePage,
});

function ArchivePage() {
  const { language, t } = useLanguage();
  const { gov: govParam } = Route.useSearch();
  const [gov, setGov] = useState<string | null>(govParam ?? null);
  const [cat, setCat] = useState<string | null>(null);
  const [tagId, setTagId] = useState<string | null>(null);
  const [yearRange, setYearRange] = useState<[number, number]>([1900, 2024]);
  const [debouncedYearRange, setDebouncedYearRange] = useState<[number, number]>([1900, 2024]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedYearRange(yearRange);
    }, 400);
    return () => clearTimeout(handler);
  }, [yearRange]);

  const { data: photos, isLoading } = usePhotos({ 
    governorateId: gov, 
    categoryId: cat, 
    tagId, 
    yearRange: debouncedYearRange[0] === 1900 && debouncedYearRange[1] === 2024 ? null : debouncedYearRange,
    search: search || null 
  });
  const { data: governorates } = useGovernorates();
  const { data: categories } = useHeritageCategories();
  const { data: tags } = useTags();

  const activeCount = [gov, cat, tagId].filter(Boolean).length;

  // Inline filter content below instead of extracting to a component inside render

  return (
    <>
      <PageHeader
        kicker={t("archive")}
        title={t("archive")}
        description={t("archive")}
      >
        <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {isLoading ? t("loading") : `${photos?.length ?? 0} ${t("results")}`}
        </div>
      </PageHeader>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Mobile Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 lg:hidden">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("searchArchive")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface border border-foreground/10 rounded-sm pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex items-center justify-center gap-2 bg-surface border border-foreground/10 px-4 py-2.5 rounded-sm hover:bg-foreground/5 transition-colors text-sm font-medium">
                <Filter className="size-4" />
                {t("filters")} {activeCount > 0 && `(${activeCount})`}
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] border-l-0 bg-background pt-16">
              <SheetTitle className="sr-only">{t("filters")}</SheetTitle>
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    {t("filters")} {activeCount > 0 && <span className="text-accent">({activeCount})</span>}
                  </h3>
                  {activeCount > 0 && (
                    <button
                      onClick={() => { setGov(null); setCat(null); setTagId(null); setYearRange([1900, 2024]); }}
                      className="text-xs text-accent hover:underline inline-flex items-center gap-1"
                    >
                      <X className="size-3" /> {t("clear")}
                    </button>
                  )}
                </div>

                <FilterGroup title={t("governorate")}>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {governorates?.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => setGov(gov === g.id ? null : g.id)}
                        className={`flex items-center justify-between w-full text-sm py-1.5 px-2 rounded transition-colors ${
                          gov === g.id ? "bg-accent/10 text-accent font-medium" : "hover:bg-foreground/5"
                        }`}
                      >
                        <span>{language === 'en' ? g.name_en : g.name_ar}</span>
                      </button>
                    ))}
                  </div>
                </FilterGroup>

                <FilterGroup title={t("heritageCategory")}>
                  <div className="space-y-1.5">
                    {categories?.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setCat(cat === c.id ? null : c.id)}
                        className={`flex items-center gap-2.5 w-full text-sm py-1.5 px-2 rounded transition-colors ${
                          cat === c.id ? "bg-accent/10 text-accent font-medium" : "hover:bg-foreground/5"
                        }`}
                      >
                        <span className="size-2 rounded-full shrink-0" style={{ background: c.color }} />
                        <span>{language === 'en' ? c.name_en : c.name_ar}</span>
                      </button>
                    ))}
                  </div>
                </FilterGroup>

                <FilterGroup title={t("tags")}>
                  <div className="flex flex-wrap gap-1.5">
                    {tags?.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTagId(tagId === t.id ? null : t.id)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          tagId === t.id
                            ? "bg-accent text-accent-foreground border-accent font-medium"
                            : "border-foreground/10 hover:bg-foreground/5"
                        }`}
                      >
                        {language === 'en' ? t.name_en : t.name_ar}
                      </button>
                    ))}
                  </div>
                </FilterGroup>

                <FilterGroup title={t("timeEra")}>
                  <div className="pt-4 pb-2 px-2">
                    <Slider 
                      value={yearRange} 
                      min={1900} 
                      max={2024} 
                      step={1} 
                      onValueChange={(val: any) => setYearRange(val)} 
                      className="touch-none"
                    />
                    <div className="flex items-center justify-between mt-4 text-xs font-mono text-muted-foreground">
                      <span>{yearRange[0]}</span>
                      <span>{yearRange[1]}</span>
                    </div>
                  </div>
                </FilterGroup>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-10">
          <aside className="hidden lg:block w-72 shrink-0 border-l border-foreground/10 pl-10">
            <div className="sticky top-24">
              <div className="relative mb-8">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("searchArchive")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-surface border border-foreground/10 rounded-sm pl-4 pr-10 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    {t("filters")} {activeCount > 0 && <span className="text-accent">({activeCount})</span>}
                  </h3>
                  {activeCount > 0 && (
                    <button
                      onClick={() => { setGov(null); setCat(null); setTagId(null); setYearRange([1900, 2024]); }}
                      className="text-xs text-accent hover:underline inline-flex items-center gap-1"
                    >
                      <X className="size-3" /> {t("clear")}
                    </button>
                  )}
                </div>

                <FilterGroup title={t("governorate")}>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {governorates?.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => setGov(gov === g.id ? null : g.id)}
                        className={`flex items-center justify-between w-full text-sm py-1.5 px-2 rounded transition-colors ${
                          gov === g.id ? "bg-accent/10 text-accent font-medium" : "hover:bg-foreground/5"
                        }`}
                      >
                        <span>{language === 'en' ? g.name_en : g.name_ar}</span>
                      </button>
                    ))}
                  </div>
                </FilterGroup>

                <FilterGroup title={t("heritageCategory")}>
                  <div className="space-y-1.5">
                    {categories?.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setCat(cat === c.id ? null : c.id)}
                        className={`flex items-center gap-2.5 w-full text-sm py-1.5 px-2 rounded transition-colors ${
                          cat === c.id ? "bg-accent/10 text-accent font-medium" : "hover:bg-foreground/5"
                        }`}
                      >
                        <span className="size-2 rounded-full shrink-0" style={{ background: c.color }} />
                        <span>{language === 'en' ? c.name_en : c.name_ar}</span>
                      </button>
                    ))}
                  </div>
                </FilterGroup>

                <FilterGroup title={t("tags")}>
                  <div className="flex flex-wrap gap-1.5">
                    {tags?.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTagId(tagId === t.id ? null : t.id)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          tagId === t.id
                            ? "bg-accent text-accent-foreground border-accent font-medium"
                            : "border-foreground/10 hover:bg-foreground/5"
                        }`}
                      >
                        {language === 'en' ? t.name_en : t.name_ar}
                      </button>
                    ))}
                  </div>
                </FilterGroup>

                <FilterGroup title={t("timeEra")}>
                  <div className="pt-4 pb-2 px-2">
                    <Slider 
                      value={yearRange} 
                      min={1900} 
                      max={2024} 
                      step={1} 
                      onValueChange={(val: any) => setYearRange(val)} 
                      className="touch-none"
                    />
                    <div className="flex items-center justify-between mt-4 text-xs font-mono text-muted-foreground">
                      <span>{yearRange[0]}</span>
                      <span>{yearRange[1]}</span>
                    </div>
                  </div>
                </FilterGroup>
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : !photos || photos.length === 0 ? (
              <div className="border border-dashed border-foreground/15 rounded-sm py-24 text-center bg-surface">
                <p className="text-muted-foreground">{t("noResults")}</p>
                <button
                  onClick={() => { setGov(null); setCat(null); setTagId(null); setSearch(""); setYearRange([1900, 2024]); }}
                  className="mt-4 text-accent hover:underline text-sm font-medium"
                >
                  {t("resetFilters")}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                {photos.map((p, i) => (
                  <PhotoTile key={p.id} photo={p} className={i % 3 === 1 ? "md:translate-y-8" : ""} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <div>
      <div 
        className="flex items-center justify-between mb-3 cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4 className="text-sm font-semibold">{title}</h4>
        <ChevronDown className={`size-3.5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>
      {isOpen && children}
    </div>
  );
}