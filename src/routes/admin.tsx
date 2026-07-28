import { createFileRoute, Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { NotFoundComponent } from "./__root";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  LayoutDashboard,
  ImageIcon,
  Tags,
  MessageSquare,
  Users,
  ArrowLeft,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "لوحة الإدارة · عدسة فيليكس" },
      { name: "description", content: "لوحة إدارة الأرشيف والمحتوى والمستخدمين." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { t } = useLanguage();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, profile, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  const NAV = [
    { to: "/admin", label: t("statsPanel"), icon: LayoutDashboard, exact: true },
    { to: "/admin/photos", label: t("photos"), icon: ImageIcon },
    { to: "/admin/taxonomy", label: t("taxonomy"), icon: Tags },
    { to: "/admin/comments", label: t("comments"), icon: MessageSquare },
    { to: "/admin/users", label: t("usersList"), icon: Users },
  ];

  if (isLoading) return null;
  if (!isAdmin) return <NotFoundComponent />;

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground">
            <ArrowLeft className="size-4" /> {t("backToSite")}
          </Link>
          <h1 className="text-xl font-bold mt-4 text-sidebar-primary">
            عدسة فيليكس
            <span className="block text-[10px] font-mono uppercase tracking-widest text-sidebar-foreground/50 mt-1">
              {t("adminPanel")}
            </span>
          </h1>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to as never}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <n.icon className="size-4 shrink-0" />
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-sidebar-primary text-sidebar-primary-foreground grid place-items-center text-sm font-bold">
              {profile?.display_name?.[0] ?? user?.email?.[0]?.toUpperCase() ?? "م"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{profile?.display_name ?? "مسؤول"}</p>
              <p className="text-[10px] font-mono uppercase tracking-widest text-sidebar-foreground/50">
                مدير
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}