import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "عن المنصة · عدسة فيليكس" },
      { name: "description", content: "قصة مشروع عدسة فيليكس للحفاظ على التراث البصري اليمني." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <PageHeader
        kicker="عن المنصة"
        title="قصة عدسة فيليكس"
        description="مبادرة لتوثيق وأرشفة التراث البصري واللامادي لليمن، ليبقى حياً للأجيال القادمة."
      />

      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 space-y-16">
        <section className="prose prose-stone dark:prose-invert max-w-none text-foreground/90">
          <p className="text-xl leading-relaxed text-foreground font-medium mb-8">
            "عدسة فيليكس" هو مشروع أرشيفي رقمي يهدف إلى جمع وتوثيق التراث البصري لليمن، 
            من الصور الفوتوغرافية النادرة للمدن والقرى والمعالم التاريخية، إلى جانب التوثيق 
            المرئي للتراث اللامادي من عادات وتقاليد وحرف يدوية.
          </p>

          <p className="text-lg leading-relaxed text-muted-foreground bg-accent/5 p-6 rounded-md border-r-4 border-accent">
            <strong>عن الاسم:</strong> كلمة "فيليكس" (Felix) تعني "السعيد"، وهو الاسم المطلق على اليمن قديماً (العربية السعيدة - Arabia Felix). نسعى من خلال هذه العدسة إلى تسليط الضوء على الإرث السعيد والمشرق لهذا البلد الأصيل.
          </p>

          <h2 className="text-2xl font-bold text-accent mt-12 mb-6">رؤيتنا</h2>
          <p className="leading-relaxed">
            نسعى لبناء أكبر مكتبة بصرية تفاعلية للتراث اليمني، تكون مرجعاً للباحثين والمهتمين 
            والأجيال الشابة. نؤمن بأن الصورة ليست مجرد توثيق للحظة، بل هي وعاء يحمل في طياته 
            قصصاً وتاريخاً وهوية يجب الحفاظ عليها من الاندثار في ظل التحولات السريعة التي يمر بها اليمن.
          </p>

          <h2 className="text-2xl font-bold text-accent mt-12 mb-6">منهجية الأرشفة</h2>
          <p className="leading-relaxed">
            نعتمد في توثيق المواد الأرشيفية على مجموعة من المعايير الدقيقة التي تضمن جودة وموثوقية المعلومات:
          </p>
          <ul className="space-y-2 my-6 list-disc list-inside">
            <li><strong className="text-foreground">التوثيق الجغرافي:</strong> تحديد الموقع الدقيق للصورة على مستوى المحافظة والمديرية.</li>
            <li><strong className="text-foreground">التوثيق الزمني:</strong> ربط الصور بحقبتها الزمنية لتسهيل قراءة التحولات التاريخية.</li>
            <li><strong className="text-foreground">تصنيف التراث:</strong> ربط الصور بفئات التراث المادي واللامادي لتكوين سياق ثقافي متكامل.</li>
          </ul>

          <h2 className="text-2xl font-bold text-accent mt-12 mb-6">ساهم معنا</h2>
          <p className="leading-relaxed">
            الأرشيف هو جهد جماعي. نرحب دائماً بمساهمات المصورين، والباحثين، والعائلات التي تمتلك صوراً 
            تاريخية نادرة لليمن. يمكنك التواصل معنا للمساهمة في إثراء هذا السجل الوطني.
          </p>
        </section>

        <div className="bg-surface border border-foreground/10 rounded-sm p-8 text-center mt-12">
          <h3 className="text-xl font-bold mb-3">تواصل معنا</h3>
          <p className="text-muted-foreground text-sm mb-6">
            للاستفسارات والمساهمات أو الإبلاغ عن أي معلومات تحتاج إلى تصحيح في الأرشيف.
          </p>
          <a href="mailto:contact@felixlens.org" className="inline-block bg-accent text-accent-foreground px-6 py-3 rounded-sm font-medium hover:opacity-90 transition-opacity">
            contact@felixlens.org
          </a>
        </div>
      </div>
    </>
  );
}