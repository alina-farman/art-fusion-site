"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const isLoginPage = pathname === "/admin/login";

    // agar admin nahi hai aur login page nahi hai
    if (!user || user.role !== "admin") {
      if (!isLoginPage) {
        router.replace("/admin/login");
      }
    } else {
      // agar admin hai aur login page pe hai → dashboard bhejo
      if (isLoginPage) {
        router.replace("/admin");
      }
    }

    setLoading(false);
  }, [pathname]);

  if (loading) return null; // 👈 blinking stop

  return <>{children}</>;
}
