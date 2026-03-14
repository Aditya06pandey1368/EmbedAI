// app/(dashboard)/layout.tsx

import Sidebar from "@/components/dashboard/Sidebar";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-950">

      {/* Sidebar — fixed on the left */}
      <Sidebar />

      {/* Main content area — takes remaining width */}
      <div className="flex-1 flex flex-col">
        <DashboardNavbar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>

    </div>
  );
}