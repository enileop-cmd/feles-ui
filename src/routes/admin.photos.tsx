import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { usePhotos, useAdminDeletePhoto } from "@/lib/queries";
import { Plus, Search, MoreVertical, Edit2, Trash2, ImageIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/photos")({
  component: AdminPhotos,
});

function AdminPhotos() {
  const [search, setSearch] = useState("");
  const { data: photos, isLoading } = usePhotos({ search: search || null });
  const deleteMutation = useAdminDeletePhoto();

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الصورة نهائياً؟")) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success("تم الحذف بنجاح"),
        onError: () => toast.error("حدث خطأ أثناء الحذف"),
      });
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">إدارة الأرشيف</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            إضافة، تعديل، أو أرشفة الصور في قاعدة البيانات.
          </p>
        </div>
        <Link
          to="/admin/photos/new"
          className="bg-accent text-accent-foreground px-4 py-2 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="size-4" />
          إضافة صورة جديدة
        </Link>
      </div>

      <div className="bg-surface border border-foreground/10 rounded-sm">
        <div className="p-4 border-b border-foreground/10 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث بالعنوان أو اسم المصور..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-foreground/10 rounded-sm pl-4 pr-10 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div className="text-sm text-muted-foreground font-mono">
            {photos?.length ?? 0} صورة
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-foreground/5 text-muted-foreground font-medium border-b border-foreground/10">
              <tr>
                <th className="px-6 py-3">الصورة</th>
                <th className="px-6 py-3">العنوان</th>
                <th className="px-6 py-3">المصور</th>
                <th className="px-6 py-3">الموقع</th>
                <th className="px-6 py-3">التاريخ</th>
                <th className="px-6 py-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">جاري التحميل...</td>
                </tr>
              ) : photos?.map((photo) => (
                <tr key={photo.id} className="hover:bg-foreground/[0.02] transition-colors">
                  <td className="px-6 py-3">
                    <div 
                      className="w-12 h-12 rounded-sm bg-accent/10 flex items-center justify-center overflow-hidden"
                    >
                      {photo.image_url ? (
                        <img src={photo.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="size-4 text-accent" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3 font-medium max-w-xs truncate" title={photo.title_ar}>
                    {photo.title_ar}
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {photo.photographer_name ?? "مجهول"}
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {[photo.governorates?.name_ar, photo.district_name, photo.neighborhood_name].filter(Boolean).join(" - ") || "غير محدد"}
                  </td>
                  <td className="px-6 py-3 font-mono text-xs">
                    {photo.year ?? "غير محدد"}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Link to="/admin/photos/$photoId/edit" params={{ photoId: photo.id }} className="p-1.5 text-muted-foreground hover:text-accent bg-foreground/5 hover:bg-accent/10 rounded-sm transition-colors" title="تعديل">
                        <Edit2 className="size-4" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(photo.id)}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 text-muted-foreground hover:text-red-500 bg-foreground/5 hover:bg-red-500/10 rounded-sm transition-colors disabled:opacity-50" title="حذف"
                      >
                        <Trash2 className="size-4" />
                      </button>
                      <button className="p-1.5 text-muted-foreground hover:text-foreground bg-foreground/5 hover:bg-foreground/10 rounded-sm transition-colors" title="المزيد">
                        <MoreVertical className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!photos || photos.length === 0) && !isLoading && (
            <div className="p-12 text-center text-muted-foreground text-sm">
              لا توجد صور مطابقة لبحثك.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}