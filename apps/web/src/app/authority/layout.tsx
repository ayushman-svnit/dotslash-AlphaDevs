export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 flex flex-col font-sans">
      {children}
    </div>
  );
}
