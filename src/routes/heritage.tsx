import { createFileRoute, Link } from "@tanstack/react-router";
import { useHeritageCategories } from "@/lib/queries";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/heritage")({
  head: () => ({
    meta: [
      { title: "التراث غير المادي · عدسة فيليكس" },
      { name: "description", content: "فئات التراث غير المادي في اليمن: العمارة، الحرف، الزوامل، الطقوس، الحكايات، المخطوطات." },
    ],
  }),
  component: HeritagePage,
});

function HeritagePage() {
  const { data: categories } = useHeritageCategories();

  return (
    <>
      <PageHeader
        kicker="التراث غير المادي"
        title="ذاكرة يمنية حيّة"
        description="فئات مركزية تجمع الأرشيف البصري والقصص المرتبطة بالتراث اليمني غير المادي."
      />

      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories?.map((c) => (
          <Link
            key={c.id}
            to="/heritage/$categoryId"
            params={{ categoryId: c.id }}
            className="group block border border-foreground/10 rounded-sm p-6 hover:border-accent/40 transition-colors bg-surface/50"
          >
            <div
              className="w-full h-32 rounded-sm mb-5 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${c.color} 0%, ${c.color}90 100%)` }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold text-white/20">{c.name_ar?.charAt(0)}</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {c.name_en}
              </span>
            </div>
            <h3 className="text-xl font-bold group-hover:text-accent transition-colors">
              {c.name_ar}
            </h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{c.desc_ar}</p>
          </Link>
        ))}
      </div>
    </>
  );
}