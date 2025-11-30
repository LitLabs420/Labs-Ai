"use client";

import AuthGate from "@/components/AuthGate";
import DashboardShell from "@/components/DashboardShell";

export default function DashboardPage() {
  return (
    <main>
      <AuthGate>
        <DashboardShell />
      </AuthGate>
    </main>
  );
}
