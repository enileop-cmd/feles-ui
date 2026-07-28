import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminDashboardStats, useAdminComments, usePhotos } from "@/lib/queries";
import { Plus, ArrowLeft, ImageIcon } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { profile, user } = useAuth();
  const { data: stats } = useAdminDashboardStats();
  const { data: comments } = useAdminComments("pending");
  const { data: photos } = usePhotos({ perPage: 5 });

  const kpis = [
    { labelAr: "صور مؤرشفة", value: stats?.photos ?? 0, delta: "إجمالي" },
    { labelAr: "أماكن ممثّلة", value: stats?.governorates ?? 0, delta: "إجمالي" },
    { labelAr: "فئات تراثية", value: stats?.categories ?? 0, delta: "إجمالي" },
    { labelAr: "تعليقات بانتظار المراجعة", value: stats?.pendingComments ?? 0, delta: "تحتاج تدخلك" },
  ];

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-end justify-between mb-10">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
            نظرة عامة
          </span>
          <h1 className="text-3xl font-bold mt-2">أهلاً، {profile?.display_name?.split(" ")[0] ?? "مسؤول"} 👋</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            ملخّص سريع لحالة الأرشيف اليوم.
          </p>
        </div>
        <Link
          to="/admin/photos/new"
          className="inline-flex items-center gap-2 bg-accent text-accent-foreground text-sm px-4 py-2.5 rounded-sm hover:opacity-90"
        >
          <Plus className="size-4" /> إضافة صورة جديدة
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {kpis.map((k) => (
          <div key={k.labelAr} className="border border-foreground/10 rounded-sm p-5 bg-surface">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {k.labelAr}
            </p>
            <p className="text-3xl font-bold mt-2">{k.value}</p>
            <p className="text-[11px] text-accent mt-1">{k.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="border border-foreground/10 rounded-sm p-6 bg-surface">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold">أحدث الصور المضافة</h3>
            <Link to="/admin/photos" className="text-xs text-accent hover:underline">عرض الكل</Link>
          </div>
          <ul className="space-y-3">
            {photos?.slice(0, 5).map((p) => (
              <li key={p.id} className="flex items-center gap-3">
                <div className="size-10 rounded-sm shrink-0 bg-accent/10 grid place-items-center">
                  <ImageIcon className="size-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{p.title_ar}</p>
                  <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
                    {new Date(p.created_at).toLocaleDateString("ar")}
                  </p>
                </div>
                <ArrowLeft className="size-4 text-muted-foreground" />
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-foreground/10 rounded-sm p-6 bg-surface">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold">تعليقات بانتظار المراجعة</h3>
            <Link to="/admin/comments" className="text-xs text-accent hover:underline">إدارة</Link>
          </div>
          <ul className="space-y-4">
            {comments?.slice(0, 5).map((c) => (
              <li key={c.id} className="flex gap-3">
                <div className="size-8 rounded-full bg-accent/15 text-accent grid place-items-center text-xs font-bold shrink-0">
                  {c.profiles?.display_name?.[0] ?? "م"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold">{c.profiles?.display_name ?? "مستخدم"}</p>
                    <span className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                      بانتظار
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.body}</p>
                  <p className="text-[10px] text-accent mt-1 truncate">على: {c.photos?.title_ar}</p>
                </div>
              </li>
            ))}
            {(!comments || comments.length === 0) && (
              <p className="text-sm text-muted-foreground">لا توجد تعليقات جديدة.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}