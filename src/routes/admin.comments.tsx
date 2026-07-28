import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAdminComments, useAdminUpdateCommentStatus } from "@/lib/queries";
import { Check, X, Trash2, Ban, ImageIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/comments")({
  component: CommentsAdmin,
});

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};
const STATUS_AR: Record<string, string> = {
  pending: "بانتظار",
  approved: "منشور",
  rejected: "مرفوض",
};

type FilterStatus = "all" | "pending" | "approved" | "rejected";

const filters: { label: string; value: FilterStatus }[] = [
  { label: "الكل", value: "all" },
  { label: "بانتظار المراجعة", value: "pending" },
  { label: "المنشورة", value: "approved" },
  { label: "المرفوضة", value: "rejected" },
];

function CommentsAdmin() {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const { data: comments, isLoading } = useAdminComments(filter);
  const updateStatus = useAdminUpdateCommentStatus();

  const handleUpdate = (id: string, status: "approved" | "rejected") => {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => toast.success("تم تحديث حالة التعليق"),
        onError: () => toast.error("حدث خطأ ما"),
      }
    );
  };

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-3xl font-bold">التعليقات</h1>
      <p className="text-muted-foreground mt-1 text-sm mb-8">
        مراجعة، قبول، رفض، وحذف التعليقات.
      </p>

      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filter === f.value
                ? "bg-accent text-accent-foreground border-accent"
                : "border-foreground/10 hover:bg-foreground/5"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading && <p className="text-muted-foreground py-10 text-center">جاري التحميل...</p>}
        {!isLoading && (!comments || comments.length === 0) && (
          <p className="text-muted-foreground py-10 text-center">لا توجد تعليقات.</p>
        )}
        {comments?.map((c) => (
          <div key={c.id} className="border border-foreground/10 rounded-sm p-5 bg-surface flex gap-4">
            <div className="size-10 rounded-full bg-accent/15 text-accent grid place-items-center font-bold shrink-0">
              {c.profiles?.display_name?.[0] ?? "م"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm">{c.profiles?.display_name ?? "مستخدم غير معروف"}</p>
                <span
                  className={`text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded ${
                    STATUS_STYLE[c.status ?? "pending"]
                  }`}
                >
                  {STATUS_AR[c.status ?? "pending"]}
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString("ar")}
                </span>
              </div>
              <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{c.body}</p>
              {c.photos && (
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <div className="size-6 rounded-sm bg-accent/10 grid place-items-center">
                    <ImageIcon className="size-3 text-accent" />
                  </div>
                  <span className="truncate">على الصورة: {c.photos.title_ar}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5 shrink-0">
              {c.status !== "approved" && (
                <button
                  onClick={() => handleUpdate(c.id, "approved")}
                  disabled={updateStatus.isPending}
                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-sm disabled:opacity-50"
                  title="قبول"
                >
                  <Check className="size-4" />
                </button>
              )}
              {c.status !== "rejected" && (
                <button
                  onClick={() => handleUpdate(c.id, "rejected")}
                  disabled={updateStatus.isPending}
                  className="p-2 text-amber-600 hover:bg-amber-50 rounded-sm disabled:opacity-50"
                  title="رفض"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}