import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-16 px-6 mt-24">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
        <div className="md:col-span-2 max-w-sm">
          <h2 className="text-2xl font-bold mb-4 text-accent">عدسة فيليكس</h2>
          <p className="text-sm text-background/60 leading-relaxed">
            مشروع غير ربحي لحفظ التراث غير المادي والذاكرة البصرية اليمنية للأجيال
            القادمة والباحثين حول العالم.
          </p>
        </div>
        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-widest text-accent mb-5">استكشاف</h4>
          <ul className="space-y-2.5 text-sm text-background/70">
            <li><Link to="/archive" className="hover:text-accent transition-colors">الأرشيف</Link></li>
            <li><Link to="/timeline" className="hover:text-accent transition-colors">الجدول الزمني</Link></li>
            <li><Link to="/map" className="hover:text-accent transition-colors">الخريطة</Link></li>
            <li><Link to="/heritage" className="hover:text-accent transition-colors">التراث</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-widest text-accent mb-5">المنصة</h4>
          <ul className="space-y-2.5 text-sm text-background/70">
            <li><Link to="/about" className="hover:text-accent transition-colors">عن المشروع</Link></li>
            <li><Link to="/auth" className="hover:text-accent transition-colors">تسجيل الدخول</Link></li>
            <li><Link to="/favorites" className="hover:text-accent transition-colors">مفضلاتي</Link></li>
            <li><Link to="/admin" className="hover:text-accent transition-colors">لوحة الإدارة</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-14 pt-6 border-t border-background/10 flex flex-col sm:flex-row justify-between gap-2 text-[10px] font-mono uppercase tracking-widest text-background/40">
        <span>© 2026 عدسة فيليكس — جميع الحقوق محفوظة</span>
        <span>صنع في اليمن</span>
      </div>
    </footer>
  );
}