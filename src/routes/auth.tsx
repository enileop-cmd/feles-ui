import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول · عدسة فيليكس" },
      { name: "description", content: "سجّل الدخول أو أنشئ حساباً للتعليق وحفظ المفضلة." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [loading, setLoading] = useState(false);

  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [displayName, setDisplayName] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
        toast.success("أهلاً بعودتك! تم تسجيل الدخول بنجاح.");
        navigate({ to: "/" });
      } else if (mode === "signup") {
        await signUp(email, password, displayName);
        toast.success("تم إنشاء الحساب! يرجى تأكيد البريد الإلكتروني.");
      } else {
        await resetPassword(email);
        toast.success("تم إرسال رابط الاستعادة إلى بريدك الإلكتروني.");
        setMode("signin");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg.includes("Invalid login") ? "البريد الإلكتروني أو كلمة المرور غير صحيحة." : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-16rem)] grid place-items-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent block mb-3">
            عدسة فيليكس
          </span>
          <h1 className="text-3xl font-bold">
            {mode === "signin" ? "أهلاً بعودتك" : mode === "signup" ? "انضم إلى الأرشيف" : "استعادة كلمة المرور"}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {mode === "signin"
              ? "سجّل الدخول لحفظ المفضلة والتعليق على الصور."
              : mode === "signup"
              ? "أنشئ حساباً لتفعيل التعليق والمفضلة."
              : "أدخل بريدك الإلكتروني وسنرسل لك رابط الاستعادة."}
          </p>
        </div>

        {mode !== "reset" && (
          <div className="grid grid-cols-2 p-1 bg-foreground/5 rounded-sm mb-8">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`py-2 text-sm rounded-sm transition-colors ${
                  mode === m ? "bg-background shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "signin" ? "تسجيل الدخول" : "إنشاء حساب"}
              </button>
            ))}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <Field label="الاسم الكامل" type="text" placeholder="فهد الظرافي"
              value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          )}
          <Field label="البريد الإلكتروني" type="email" placeholder="name@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)} required />

          {mode !== "reset" && (
            <Field label="كلمة المرور" type="password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          )}

          {mode === "signin" && (
            <div className="text-left">
              <button type="button" onClick={() => setMode("reset")} className="text-xs text-accent hover:underline">
                نسيت كلمة المرور؟
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-accent-foreground py-3 text-sm rounded-sm hover:opacity-90 transition font-medium mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "جاري التحميل..." : mode === "signin" ? "تسجيل الدخول" : mode === "signup" ? "إنشاء الحساب" : "إرسال رابط الاستعادة"}
          </button>

          {mode === "reset" && (
            <button type="button" onClick={() => setMode("signin")}
              className="w-full text-muted-foreground hover:text-foreground py-3 text-sm rounded-sm transition">
              العودة لتسجيل الدخول
            </button>
          )}
        </form>

        {mode !== "reset" && (
          <>
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-foreground/10" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">أو</span>
              <div className="flex-1 h-px bg-foreground/10" />
            </div>
            <button
              type="button"
              className="w-full border border-foreground/10 py-3 text-sm rounded-sm hover:bg-foreground/5 transition flex items-center justify-center gap-2 font-medium"
            >
              <svg className="size-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              المتابعة عبر Google
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground mb-1.5 block">{label}</span>
      <input
        {...props}
        className="w-full border border-foreground/10 rounded-sm px-3 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition placeholder:text-muted-foreground/50"
      />
    </label>
  );
}