import { createFileRoute } from "@tanstack/react-router";
import { useTimelineData } from "@/lib/queries";
import { PageHeader } from "@/components/PageHeader";
import { PhotoTile } from "@/components/PhotoTile";
import { Clock } from "lucide-react";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "الجدول الزمني · عدسة فيليكس" },
      { name: "description", content: "رحلة زمنية بصرية عبر تاريخ اليمن، من مطلع القرن العشرين حتى اليوم." },
    ],
  }),
  component: TimelinePage,
});

function TimelinePage() {
  const { data: timelineData, isLoading } = useTimelineData();

  return (
    <>
      <PageHeader
        kicker="الجدول الزمني"
        title="رحلة اليمن البصرية عبر القرن"
        description="تتبع التحولات المعمارية والاجتماعية والثقافية عبر الحقب الزمنية المختلفة في تاريخ اليمن الحديث."
      />

      <div className="max-w-6xl mx-auto px-6 py-20 relative">
        {/* Center Line for Desktop, Left for Mobile */}
        <div className="absolute top-20 bottom-20 left-6 md:left-1/2 w-px bg-foreground/10 md:-translate-x-1/2" />

        {isLoading ? (
          <div className="space-y-24">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-60 w-full rounded bg-foreground/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-24">
            {timelineData?.map((d, index) => {
              const isEven = index % 2 === 0;
              const hasPhotos = d.photos && d.photos.length > 0;
              return (
                <div key={d.decade} className="relative flex flex-col md:flex-row items-center gap-8 md:gap-16 group">
                  
                  {/* Timeline Dot */}
                  <div className="absolute left-6 md:left-1/2 w-8 h-8 rounded-full bg-background border-4 border-foreground/10 md:-translate-x-1/2 -translate-x-3.5 z-10 group-hover:border-accent transition-colors grid place-items-center">
                    <div className={`w-2 h-2 rounded-full ${hasPhotos ? 'bg-accent' : 'bg-foreground/20'}`} />
                  </div>

                  {/* Content Side */}
                  <div className={`flex-1 w-full pl-10 md:pl-0 ${isEven ? 'md:text-left md:pr-16 md:order-1' : 'md:text-right md:pl-16 md:order-2'}`}>
                    <div className={`flex items-center gap-3 mb-3 ${isEven ? 'md:justify-end' : 'md:justify-start'}`}>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground bg-foreground/5 px-2 py-1 rounded-sm">
                        {d.photo_count} مادة مؤرشفة
                      </span>
                      <h3 className="text-4xl font-bold text-accent font-mono tracking-tight">{d.decade}s</h3>
                    </div>
                    
                    <h4 className="text-2xl font-bold mb-3">{d.label_ar}</h4>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                      {d.desc_ar}
                    </p>
                  </div>

                  {/* Photos Side */}
                  <div className={`flex-1 w-full pl-10 md:pl-0 ${isEven ? 'md:order-2' : 'md:order-1'}`}>
                    {hasPhotos ? (
                      <div className="grid grid-cols-2 gap-3 md:gap-4 relative">
                        {d.photos.slice(0, 4).map((p, i) => (
                          <div key={p.id} className={`${i % 2 !== 0 ? 'mt-6' : ''}`}>
                            <PhotoTile photo={{
                              id: p.id,
                              title_ar: p.title_ar,
                              year: p.year,
                              aspect: p.aspect,
                              storage_path: p.storage_path,
                              governorates: p.governorate
                            }} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-dashed border-foreground/15 rounded-sm p-8 text-center bg-surface">
                        <Clock className="size-6 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">لا توجد صور موثّقة في هذا العقد بعد.</p>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}