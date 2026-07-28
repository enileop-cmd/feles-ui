import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useGovernorates, useHeritageCategories, useTags } from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/taxonomy")({
  component: TaxonomyAdmin,
});

function TaxonomyAdmin() {
  const qc = useQueryClient();
  const { data: governorates, isLoading: loadingGov } = useGovernorates();
  const { data: heritageCategories, isLoading: loadingCat } = useHeritageCategories();
  const { data: tags, isLoading: loadingTags } = useTags();

  const [activeModal, setActiveModal] = useState<{ type: "gov" | "cat" | "tag", item?: any } | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async ({ table, id }: { table: string, id: string }) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { table }) => {
      toast.success("تم الحذف بنجاح");
      if (table === "governorates") qc.invalidateQueries({ queryKey: ["governorates"] });
      if (table === "heritage_categories") qc.invalidateQueries({ queryKey: ["heritageCategories"] });
      if (table === "tags") qc.invalidateQueries({ queryKey: ["tags"] });
    },
    onError: () => toast.error("حدث خطأ أثناء الحذف"),
  });

  const handleDelete = (table: string, id: string) => {
    if (confirm("هل أنت متأكد من الحذف؟ قد يؤثر ذلك على الصور المرتبطة.")) {
      deleteMutation.mutate({ table, id });
    }
  };

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-3xl font-bold">التصنيفات والوسوم</h1>
      <p className="text-muted-foreground mt-1 text-sm mb-8">
        إدارة المحافظات والفئات التراثية والوسوم لضمان أرشيف نظيف.
      </p>

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel 
          title="المحافظات" 
          count={governorates?.length ?? 0} 
          isLoading={loadingGov}
          onAdd={() => setActiveModal({ type: "gov" })}
        >
          {governorates?.map((g) => (
            <Row 
              key={g.id} 
              title={g.name_ar} 
              sub={g.name_en ?? "—"} 
              onEdit={() => setActiveModal({ type: "gov", item: g })}
              onDelete={() => handleDelete("governorates", g.id)}
            />
          ))}
        </Panel>
        
        <Panel 
          title="فئات التراث" 
          count={heritageCategories?.length ?? 0} 
          isLoading={loadingCat}
          onAdd={() => setActiveModal({ type: "cat" })}
        >
          {heritageCategories?.map((c) => (
            <Row 
              key={c.id} 
              title={c.name_ar} 
              sub={c.name_en ?? "—"} 
              color={c.color ?? "#000"}
              onEdit={() => setActiveModal({ type: "cat", item: c })}
              onDelete={() => handleDelete("heritage_categories", c.id)}
            />
          ))}
        </Panel>
        
        <Panel 
          title="الوسوم" 
          count={tags?.length ?? 0} 
          isLoading={loadingTags}
          onAdd={() => setActiveModal({ type: "tag" })}
        >
          <div className="flex flex-wrap gap-2 p-4">
            {tags?.map((t) => (
              <span key={t.id} className="inline-flex items-center gap-2 text-xs bg-foreground/5 border border-foreground/10 px-2.5 py-1 rounded-full group cursor-pointer" onClick={() => setActiveModal({ type: "tag", item: t })}>
                #{t.name_ar}
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete("tags", t.id); }} 
                  className="text-muted-foreground hover:text-destructive opacity-50 group-hover:opacity-100"
                >
                  ×
                </button>
              </span>
            ))}
            {(!tags || tags.length === 0) && (
              <p className="text-muted-foreground text-sm w-full text-center">لا توجد وسوم مضافة.</p>
            )}
          </div>
        </Panel>
      </div>

      {activeModal && (
        <Modal 
          type={activeModal.type} 
          item={activeModal.item} 
          onClose={() => setActiveModal(null)} 
        />
      )}
    </div>
  );
}

function Panel({ title, count, isLoading, children, onAdd }: { title: string; count: number; isLoading?: boolean; children: React.ReactNode; onAdd: () => void }) {
  return (
    <section className="border border-foreground/10 rounded-sm bg-surface flex flex-col max-h-[500px]">
      <header className="p-4 border-b border-foreground/10 flex items-center justify-between shrink-0">
        <div>
          <h3 className="font-bold">{title}</h3>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {isLoading ? "جاري التحميل..." : `${count} عنصر`}
          </p>
        </div>
        <button onClick={onAdd} className="inline-flex items-center gap-1.5 text-xs bg-accent text-accent-foreground px-3 py-1.5 rounded-sm hover:opacity-90 disabled:opacity-50">
          <Plus className="size-3.5" /> إضافة
        </button>
      </header>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <p className="p-6 text-center text-sm text-muted-foreground">جاري التحميل...</p>
        ) : count === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">لا توجد بيانات.</p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

function Row({ title, sub, color, onEdit, onDelete }: { title: string; sub: string; color?: string; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-foreground/5 last:border-0 hover:bg-foreground/[0.02] transition-colors">
      <div className="flex items-center gap-3">
        {color && <div className="size-3 rounded-full shrink-0" style={{ background: color }} />}
        <div>
          <p className="font-semibold text-sm">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onEdit} className="p-1.5 text-muted-foreground hover:text-accent bg-foreground/5 hover:bg-accent/10 rounded-sm transition-colors">
          <Pencil className="size-3.5" />
        </button>
        <button onClick={onDelete} className="p-1.5 text-muted-foreground hover:text-destructive bg-foreground/5 hover:bg-red-500/10 rounded-sm transition-colors">
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function Modal({ type, item, onClose }: { type: "gov" | "cat" | "tag"; item?: any; onClose: () => void }) {
  const qc = useQueryClient();
  const [formData, setFormData] = useState({
    name_ar: item?.name_ar || "",
    name_en: item?.name_en || "",
    color: item?.color || "#000000",
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      let table = type === "gov" ? "governorates" : type === "cat" ? "heritage_categories" : "tags";
      const payload: any = { name_ar: formData.name_ar, name_en: formData.name_en || null };
      if (type === "cat") payload.color = formData.color;
      
      if (!item?.id) {
        payload.slug = (formData.name_en || formData.name_ar).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-_أ-ي]/g, '') + '-' + Date.now().toString().slice(-4);
      }

      if (item?.id) {
        const { error } = await supabase.from(table).update(payload).eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(table).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(item ? "تم التعديل بنجاح" : "تمت الإضافة بنجاح");
      if (type === "gov") qc.invalidateQueries({ queryKey: ["governorates"] });
      if (type === "cat") qc.invalidateQueries({ queryKey: ["heritageCategories"] });
      if (type === "tag") qc.invalidateQueries({ queryKey: ["tags"] });
      onClose();
    },
    onError: () => toast.error("حدث خطأ أثناء الحفظ"),
  });

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-surface border border-foreground/10 rounded-sm shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">{item ? "تعديل" : "إضافة"} {type === "gov" ? "محافظة" : type === "cat" ? "فئة" : "وسم"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground mb-1.5 block">الاسم بالعربية <span className="text-red-500">*</span></span>
            <input 
              value={formData.name_ar} 
              onChange={e => setFormData({ ...formData, name_ar: e.target.value })}
              className="w-full border border-foreground/10 rounded-sm px-3 py-2 text-sm bg-background focus:outline-none focus:border-accent" 
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground mb-1.5 block">الاسم بالإنجليزية</span>
            <input 
              value={formData.name_en} 
              onChange={e => setFormData({ ...formData, name_en: e.target.value })}
              className="w-full border border-foreground/10 rounded-sm px-3 py-2 text-sm bg-background focus:outline-none focus:border-accent" 
            />
          </label>
          {type === "cat" && (
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground mb-1.5 block">اللون (Hex)</span>
              <input 
                type="color"
                value={formData.color} 
                onChange={e => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10 border border-foreground/10 rounded-sm p-1 bg-background focus:outline-none focus:border-accent" 
              />
            </label>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-foreground/5">
          <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground px-4 py-2">إلغاء</button>
          <button 
            onClick={() => saveMutation.mutate()} 
            disabled={saveMutation.isPending || !formData.name_ar}
            className="text-sm bg-accent text-accent-foreground px-5 py-2 rounded-sm hover:opacity-90 disabled:opacity-50"
          >
            {saveMutation.isPending ? "جاري الحفظ..." : "حفظ"}
          </button>
        </div>
      </div>
    </div>
  );
}