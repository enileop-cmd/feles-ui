import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, lazy, Suspense, useEffect } from "react";
import { useMapPhotos } from "@/lib/queries";
import { PageHeader } from "@/components/PageHeader";
import { PhotoTile } from "@/components/PhotoTile";
import { MapPin, ExternalLink, X, Map as MapIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

const MapClient = lazy(() => import("@/components/MapClient"));

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "الخريطة التفاعلية · عدسة فيليكس" },
      { name: "description", content: "خريطة اليمن التفاعلية لاستكشاف المواقع المؤرشفة." },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: mapPhotos } = useMapPhotos();

  const selectedPhoto = useMemo(
    () => mapPhotos?.find((p: any) => p.id === selectedPhotoId) ?? null,
    [mapPhotos, selectedPhotoId]
  );

  return (
    <>
      <PageHeader
        kicker="الخريطة التفاعلية"
        title="اليمن على الخريطة"
        description="تصفح المواقع الموثقة في الأرشيف عبر الخريطة التفاعلية."
      />

      <div className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Map surface */}
        <div className="relative bg-surface border border-foreground/10 rounded-sm overflow-hidden aspect-[4/3] lg:aspect-auto lg:h-[700px] z-10">
          
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center bg-foreground/5">
              <div className="flex flex-col items-center text-muted-foreground">
                <MapIcon className="size-8 mb-2 animate-pulse" />
                <span className="text-sm font-medium">جاري تحميل الخريطة...</span>
              </div>
            </div>
          }>
            {isMounted && mapPhotos && (
              <MapClient 
                mapPhotos={mapPhotos} 
                selectedPhotoId={selectedPhotoId} 
                setSelectedPhotoId={setSelectedPhotoId} 
              />
            )}
          </Suspense>

          <div className="absolute top-4 right-4 bg-background/95 backdrop-blur border border-foreground/10 rounded-sm px-3 py-2 z-[400] shadow-sm">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              {mapPhotos?.length ?? 0} موقع موثق
            </p>
          </div>
        </div>

        {/* Place card */}
        <aside className="bg-surface border border-foreground/10 rounded-sm p-6 h-fit lg:sticky lg:top-24 z-20">
          {selectedPhoto ? (
            <>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-accent">موقع</span>
                  <h3 className="text-2xl font-bold mt-1">{selectedPhoto.title_ar}</h3>
                  <p className="text-xs font-mono text-muted-foreground mt-1">
                    {selectedPhoto.lat?.toFixed(4)}° N, {selectedPhoto.lng?.toFixed(4)}° E
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPhotoId(null)}
                  className="text-muted-foreground hover:text-foreground bg-foreground/5 p-1.5 rounded-sm hover:bg-foreground/10 transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="mb-6">
                <PhotoTile photo={selectedPhoto} />
              </div>

              <div className="space-y-2.5">
                <Link
                  to="/archive/$photoId"
                  params={{ photoId: selectedPhoto.id }}
                  className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground text-sm font-medium px-4 py-3 rounded-sm hover:opacity-90 transition-opacity"
                >
                  <span>عرض التفاصيل والصور</span>
                  <MapPin className="size-4" />
                </Link>
                <a
                  href={`https://www.google.com/maps/@${selectedPhoto.lat},${selectedPhoto.lng},15z`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 border border-foreground/10 text-sm font-medium px-4 py-3 rounded-sm hover:bg-foreground/5 transition-colors"
                >
                  <span>فتح في خرائط Google</span>
                  <ExternalLink className="size-4" />
                </a>
              </div>
            </>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6">
              <div className="size-12 rounded-full bg-foreground/5 flex items-center justify-center mb-4">
                <MapPin className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">اختر موقعاً من الخريطة</p>
              <p className="text-xs text-muted-foreground mt-2">
                اضغط على أي علامة على الخريطة لعرض تفاصيلها والصور المرتبطة بها.
              </p>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}