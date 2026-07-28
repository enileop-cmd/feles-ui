import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getPhotoUrl } from "@/lib/storage";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useGovernorates, useHeritageCategories, useAdminEditPhoto, useTags } from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/photos_/$photoId/edit")({
  component: EditPhoto,
});

function EditPhoto() {
  const navigate = useNavigate();
  const { photoId } = Route.useParams();
  
  const { data: governorates } = useGovernorates();
  const { data: categories } = useHeritageCategories();
  const { data: tags } = useTags();
  const editMutation = useAdminEditPhoto();

  const { data: photoData, isLoading } = useQuery({
    queryKey: ["admin", "photo", photoId],
    queryFn: async () => {
      const { data, error } = await supabase.from("photos").select("*, photo_tags(tag_id)").eq("id", photoId).single();
      if (error) throw error;
      return data;
    }
  });

  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [existingPaths, setExistingPaths] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title_ar: "",
    title_en: "",
    description_ar: "",
    description_en: "",
    governorate_id: "",
    category_id: "",
    photographer_name: "",
    year: "",
    district: "",
    neighborhood: "",
    latitude: "",
    longitude: "",
    source: "",
    additional_details_ar: "",
    additional_details_en: "",
    storage_path: ""
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (photoData) {
      setFormData({
        title_ar: photoData.title_ar || "",
        title_en: photoData.title_en || "",
        description_ar: photoData.description_ar || "",
        description_en: photoData.description_en || "",
        governorate_id: photoData.governorate_id || "",
        category_id: photoData.category_id || "",
        photographer_name: photoData.photographer || "",
        year: photoData.year ? String(photoData.year) : "",
        district: photoData.district_name || "",
        neighborhood: photoData.neighborhood_name || "",
        latitude: photoData.lat ? String(photoData.lat) : "",
        longitude: photoData.lng ? String(photoData.lng) : "",
        source: photoData.source || "",
        additional_details_ar: photoData.additional_details_ar || "",
        additional_details_en: photoData.additional_details_en || "",
        storage_path: photoData.storage_path || ""
      });
      setExistingPaths([
        ...(photoData.storage_path ? [photoData.storage_path] : []),
        ...(photoData.additional_paths || [])
      ]);
      setSelectedTags(photoData.photo_tags?.map((pt: any) => pt.tag_id) || []);
    }
  }, [photoData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title_ar || !formData.governorate_id) return toast.error("يجب تعبئة الحقول الأساسية");

    toast.promise(
      editMutation.mutateAsync({
        id: photoId,
        newFiles,
        existingPaths,
        payload: {
          title_ar: formData.title_ar,
          title_en: formData.title_en || null,
          description_ar: formData.description_ar || null,
          description_en: formData.description_en || null,
          governorate_id: formData.governorate_id,
          category_id: formData.category_id || null,
          photographer: formData.photographer_name || null,
          year: formData.year ? parseInt(formData.year) : null,
          lat: formData.latitude ? parseFloat(formData.latitude) : null,
          lng: formData.longitude ? parseFloat(formData.longitude) : null,
          source: formData.source || null,
          additional_details_ar: formData.additional_details_ar || null,
          additional_details_en: formData.additional_details_en || null,
          storage_path: formData.storage_path || null,
          district_name: formData.district || null,
          neighborhood_name: formData.neighborhood || null,
        },
        tags: selectedTags,
      }),
      {
        loading: "جاري الحفظ...",
        success: () => {
          navigate({ to: "/admin/photos" });
          return "تم تحديث الصورة بنجاح";
        },
        error: "حدث خطأ أثناء الحفظ",
      }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setNewFiles(prev => [...prev, ...Array.from(e.dataTransfer.files!)]);
    }
  };

  if (isLoading) return <div className="p-8">جاري التحميل...</div>;

  return (
    <div className="p-8 max-w-4xl">
      <Link to="/admin/photos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent mb-6">
        <ArrowLeft className="size-4" /> عودة إلى الصور
      </Link>
      <h1 className="text-3xl font-bold">تعديل الصورة</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        قم بتعديل بيانات الصورة وحفظها.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* Uploader */}
        <section 
          className="relative border-2 border-dashed border-foreground/15 rounded-sm p-10 text-center bg-surface hover:bg-foreground/5 transition-colors cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <input id="file-upload" type="file" multiple className="hidden" accept="image/*" onChange={handleFileChange} />
          {existingPaths.length > 0 || newFiles.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {existingPaths.map((p, i) => (
                <div key={`existing-${i}`} className="relative group border rounded overflow-hidden aspect-video">
                  <img src={getPhotoUrl(p)} className="w-full h-full object-cover" />
                  <button type="button" onClick={(e) => { e.stopPropagation(); setExistingPaths(existingPaths.filter((_, idx) => idx !== i)); }} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="size-4" />
                  </button>
                  {i === 0 && <span className="absolute bottom-1 left-1 bg-accent text-white text-[10px] px-2 py-0.5 rounded">الغلاف</span>}
                </div>
              ))}
              {newFiles.map((f, i) => (
                <div key={`new-${i}`} className="relative group border-2 border-accent rounded overflow-hidden aspect-video">
                  <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" />
                  <button type="button" onClick={(e) => { e.stopPropagation(); setNewFiles(newFiles.filter((_, idx) => idx !== i)); }} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="size-4" />
                  </button>
                  {existingPaths.length === 0 && i === 0 && <span className="absolute bottom-1 left-1 bg-accent text-white text-[10px] px-2 py-0.5 rounded">الغلاف</span>}
                </div>
              ))}
            </div>
          ) : (
            <>
              <Upload className="size-8 mx-auto text-accent mb-3" />
              <p className="font-semibold">اسحب الصور هنا أو انقر للاختيار</p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP · حتى 20 ميغابايت</p>
            </>
          )}
        </section>

        {/* Bilingual */}
        <section className="grid md:grid-cols-2 gap-6">
          <SectionCard title="المحتوى بالعربية">
            <Field label="العنوان" required value={formData.title_ar} onChange={e => setFormData({...formData, title_ar: e.target.value})} placeholder="مثال: بيوت صنعاء القديمة" />
            <TextField label="الوصف" value={formData.description_ar} onChange={e => setFormData({...formData, description_ar: e.target.value})} placeholder="سياق وأهمية الصورة…" />
            <TextField label="تفاصيل إضافية" value={formData.additional_details_ar} onChange={e => setFormData({...formData, additional_details_ar: e.target.value})} placeholder="تفاصيل مطولة تظهر في نافذة منبثقة…" />
          </SectionCard>
          <SectionCard title="Content in English">
            <Field label="Title" value={formData.title_en} onChange={e => setFormData({...formData, title_en: e.target.value})} placeholder="e.g. Old Sanaa houses" />
            <TextField label="Description" value={formData.description_en} onChange={e => setFormData({...formData, description_en: e.target.value})} placeholder="Context and importance…" />
            <TextField label="Additional Details" value={formData.additional_details_en} onChange={e => setFormData({...formData, additional_details_en: e.target.value})} placeholder="Long details for popup…" />
          </SectionCard>
        </section>

        {/* Geo */}
        <SectionCard title="الموقع الجغرافي">
          <div className="grid md:grid-cols-3 gap-4">
            <SelectField label="المحافظة" required value={formData.governorate_id} onChange={e => setFormData({...formData, governorate_id: e.target.value})}>
              <option value="">اختر المحافظة...</option>
              {governorates?.map((g) => (
                <option key={g.id} value={g.id}>{g.name_ar}</option>
              ))}
            </SelectField>
            <Field label="المديرية" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} placeholder="مثال: صنعاء القديمة" />
            <Field label="المنطقة / الحي" value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} placeholder="مثال: باب اليمن" />
          </div>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <Field label="خط العرض (Latitude)" type="number" step="any" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} placeholder="15.3547" />
            <Field label="خط الطول (Longitude)" type="number" step="any" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} placeholder="44.2067" />
          </div>
        </SectionCard>

        {/* Classification */}
        <SectionCard title="التصنيف">
          <div className="grid md:grid-cols-2 gap-4">
            <SelectField label="فئة التراث" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
              <option value="">اختر الفئة...</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>{c.name_ar}</option>
              ))}
            </SelectField>
            <Field label="المصور" value={formData.photographer_name} onChange={e => setFormData({...formData, photographer_name: e.target.value})} placeholder="اسم المصور" />
          </div>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <Field label="السنة" type="number" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} placeholder="1974" />
            <Field label="المصدر" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} placeholder="مثال: أرشيف جامعة صنعاء" />
          </div>
        </SectionCard>

        {/* Tags */}
        <SectionCard title="الوسوم (Tags)">
          <div className="flex flex-wrap gap-3">
            {tags?.map(tag => (
              <label key={tag.id} className="flex items-center gap-2 text-sm bg-background border border-foreground/10 px-3 py-1.5 rounded-sm cursor-pointer hover:bg-foreground/5">
                <input
                  type="checkbox"
                  className="accent-accent"
                  checked={selectedTags.includes(tag.id)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedTags([...selectedTags, tag.id]);
                    else setSelectedTags(selectedTags.filter(id => id !== tag.id));
                  }}
                />
                {tag.name_ar}
              </label>
            ))}
            {(!tags || tags.length === 0) && (
              <span className="text-muted-foreground text-sm">لا توجد وسوم متاحة.</span>
            )}
          </div>
        </SectionCard>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-foreground/5">
          <button type="submit" disabled={editMutation.isPending} className="flex items-center justify-center gap-2 text-sm bg-accent text-accent-foreground px-5 py-2.5 rounded-sm hover:opacity-90 disabled:opacity-50">
            {editMutation.isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              "حفظ التعديلات"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-foreground/10 rounded-sm p-6 bg-surface">
      <h3 className="text-sm font-bold mb-4">{title}</h3>
      {children}
    </section>
  );
}
function Field({ label, ...p }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block mb-3 last:mb-0">
      <span className="text-xs font-semibold text-muted-foreground mb-1.5 block">{label} {p.required && <span className="text-red-500">*</span>}</span>
      <input {...p} className="w-full border border-foreground/10 rounded-sm px-3 py-2 text-sm bg-background focus:outline-none focus:border-accent" />
    </label>
  );
}
function TextField({ label, ...p }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground mb-1.5 block">{label}</span>
      <textarea {...p} rows={4} className="w-full border border-foreground/10 rounded-sm px-3 py-2 text-sm bg-background focus:outline-none focus:border-accent resize-none" />
    </label>
  );
}
function SelectField({ label, children, ...p }: { label: string; children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground mb-1.5 block">{label} {p.required && <span className="text-red-500">*</span>}</span>
      <select {...p} className="w-full border border-foreground/10 rounded-sm px-3 py-2 text-sm bg-background focus:outline-none focus:border-accent">
        {children}
      </select>
    </label>
  );
}