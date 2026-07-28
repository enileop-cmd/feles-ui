import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Menu, User, Heart, LogOut, ChevronDown, Shield, Sun, Moon } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "next-themes";
import { toast } from "sonner";

type TranslationKey = "home" | "archive" | "timeline" | "map" | "heritage" | "about";

const NAV: { to: string; labelKey: TranslationKey }[] = [
  { to: "/", labelKey: "home" },
  { to: "/archive", labelKey: "archive" },
  { to: "/timeline", labelKey: "timeline" },
  { to: "/map", labelKey: "map" },
  { to: "/heritage", labelKey: "heritage" },
  { to: "/about", labelKey: "about" },
];

export function Navbar() {
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  async function handleSignOut() {
    try {
      await signOut();
      toast.success("تم تسجيل الخروج بنجاح.");
      navigate({ to: "/" });
    } catch {
      toast.error("حدث خطأ أثناء تسجيل الخروج.");
    }
  }

  const avatarLetter = profile?.display_name?.[0] ?? user?.email?.[0]?.toUpperCase() ?? "م";

  return (
    <nav className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-foreground/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4 md:gap-8 min-w-0">
          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="lg:hidden p-2 -ml-2 text-foreground/80 hover:text-foreground">
                <Menu className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px]">
              <SheetTitle className="sr-only">القائمة الرئيسية</SheetTitle>
              <div className="flex flex-col gap-6 mt-8">
                <Link to="/" className="text-xl font-bold tracking-tight text-accent mb-4">
                  عدسة فيليكس
                </Link>
                <div className="flex flex-col gap-4">
                  {NAV.map((n) => (
                    <Link
                      key={n.to}
                      to={n.to}
                      activeOptions={{ exact: n.to === "/" }}
                      activeProps={{ className: "text-accent font-semibold" }}
                      className="text-lg text-foreground/80 hover:text-accent transition-colors"
                    >
                      {t(n.labelKey)}
                    </Link>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-foreground/10 flex flex-col gap-3">
                  {user ? (
                    <>
                      <Link to="/favorites" className="flex items-center gap-2 text-sm font-medium">
                        <Heart className="size-4 text-accent" /> {t("favorites")}
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" className="flex items-center gap-2 text-sm font-medium">
                          <Shield className="size-4 text-accent" /> {t("dashboard")}
                        </Link>
                      )}
                      <button onClick={handleSignOut} className="flex items-center gap-2 text-sm text-destructive mt-2">
                        <LogOut className="size-4" /> {t("signOut")}
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/auth"
                      className="bg-accent text-accent-foreground text-center px-4 py-3 rounded-sm hover:opacity-90 transition-all font-semibold"
                    >
                      {t("signIn")}
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link to="/" className="text-xl font-bold tracking-tight text-accent shrink-0">
            عدسة فيليكس
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-5 text-sm font-medium text-foreground/80">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                activeProps={{ className: "text-accent" }}
                className="hover:text-accent transition-colors whitespace-nowrap"
              >
                {t(n.labelKey)}
              </Link>
            ))}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            aria-label="بحث"
            className="grid place-items-center size-9 rounded-md border border-foreground/10 hover:bg-foreground/5 transition"
          >
            <Search className="size-4" />
          </button>
          
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative grid place-items-center size-9 rounded-md border border-foreground/10 hover:bg-foreground/5 transition"
          >
            <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </button>

          <button 
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="text-[11px] font-mono uppercase tracking-widest border border-foreground/10 px-2.5 py-1.5 rounded hover:bg-foreground hover:text-background transition-all"
          >
            {language === 'ar' ? 'EN' : 'AR'}
          </button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 border border-foreground/10 rounded-sm px-2 py-1.5 hover:bg-foreground/5 transition-colors text-sm">
                  <div className="size-6 rounded-full bg-accent/20 text-accent grid place-items-center text-xs font-bold">
                    {avatarLetter}
                  </div>
                  <ChevronDown className="size-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <div className="px-3 py-2 border-b border-foreground/10">
                  <p className="text-sm font-semibold truncate">{profile?.display_name ?? "مستخدم"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link to="/favorites" className="flex items-center gap-2 cursor-pointer">
                    <Heart className="size-4" /> {t("favorites")}
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                      <Shield className="size-4" /> {t("dashboard")}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer flex items-center gap-2">
                  <LogOut className="size-4" /> {t("signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/auth"
              className="hidden sm:inline-flex bg-accent text-accent-foreground px-4 py-2 text-sm rounded-sm hover:opacity-90 transition-all whitespace-nowrap"
            >
              {t("signIn")}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}