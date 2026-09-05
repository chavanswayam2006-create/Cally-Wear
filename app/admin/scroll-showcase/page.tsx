"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminScrollShowcasePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/hero-showcase");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p className="text-sm text-[#99948D]">Redirecting to Hero Showcase...</p>
    </div>
  );
}
