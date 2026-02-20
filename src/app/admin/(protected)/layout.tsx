import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;

  let valid = false;
  if (token) {
    try {
      valid = verifySession(token);
    } catch {
      valid = false;
    }
  }

  if (!valid) {
    redirect("/admin/login");
  }

  return <>{children}</>;
}
