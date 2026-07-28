import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { useAdminUsers, useAdminUpdateUserRole } from "@/lib/queries";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  component: UsersAdmin,
});

const ROLE_AR: Record<string, string> = {
  user: "مستخدم",
  editor: "محرر",
  admin: "مدير",
};

const ROLE_STYLE: Record<string, string> = {
  user: "bg-foreground/5 text-foreground/70",
  editor: "bg-blue-100 text-blue-700",
  admin: "bg-emerald-100 text-emerald-700",
};

function UsersAdmin() {
  const { data: users, isLoading } = useAdminUsers();
  const updateRole = useAdminUpdateUserRole();
  const [search, setSearch] = useState("");
  
  const filteredUsers = users?.filter(u => 
    (u.email || "").toLowerCase().includes(search.toLowerCase()) || 
    (u.display_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = (id: string, role: "user" | "editor" | "admin") => {
    updateRole.mutate(
      { id, role },
      {
        onSuccess: () => toast.success("تم تحديث صلاحية المستخدم"),
        onError: () => toast.error("حدث خطأ أثناء التحديث"),
      }
    );
  };

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-3xl font-bold">المستخدمين</h1>
      <p className="text-muted-foreground mt-1 text-sm mb-6">
        إدارة صلاحيات المستخدمين والمدراء.
      </p>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input 
          type="text"
          placeholder="ابحث بالاسم أو البريد الإلكتروني..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-4 pr-10 py-2 border border-foreground/10 rounded-sm bg-surface text-sm focus:outline-none focus:border-accent"
        />
      </div>

      <div className="border border-foreground/10 rounded-sm bg-surface overflow-hidden">
        <table className="w-full text-sm text-left rtl:text-right">
          <thead className="bg-foreground/5 font-semibold">
            <tr>
              <th className="px-6 py-3">المستخدم</th>
              <th className="px-6 py-3">تاريخ التسجيل</th>
              <th className="px-6 py-3">الصلاحية الحالية</th>
              <th className="px-6 py-3 text-center">تغيير الصلاحية</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/5">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-muted-foreground">جاري التحميل...</td>
              </tr>
            ) : (!filteredUsers || filteredUsers.length === 0) ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-muted-foreground">لا يوجد مستخدمين.</td>
              </tr>
            ) : filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-foreground/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-accent/15 text-accent grid place-items-center font-bold">
                      {u.display_name?.[0] ?? "م"}
                    </div>
                    <div>
                      <p className="font-semibold">{u.display_name ?? "غير محدد"}</p>
                      <p className="text-xs text-muted-foreground">{u.email || `ID: ${u.id.substring(0, 8)}`}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-muted-foreground text-xs">
                  {new Date(u.created_at).toLocaleDateString("ar")}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded ${ROLE_STYLE[u.role ?? 'user']}`}>
                    {ROLE_AR[u.role ?? 'user'] ?? u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <select
                      className="border border-foreground/10 rounded-sm text-xs bg-background py-1.5 px-2 focus:outline-none focus:border-accent disabled:opacity-50"
                      value={u.role ?? 'user'}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                      disabled={updateRole.isPending}
                    >
                      <option value="user">مستخدم عادي</option>
                      <option value="editor">محرر</option>
                      <option value="admin">مدير</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}