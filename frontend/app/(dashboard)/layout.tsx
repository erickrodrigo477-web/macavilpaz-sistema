import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import MobileNav from "@/app/components/MobileNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Sidebar: oculto en móvil, visible en escritorio */}
      <div className="sidebar-desktop">
        <Sidebar />
      </div>
      <div style={{ 
        flex: 1, 
        display: "flex", 
        flexDirection: "column", 
        overflow: "hidden",
        position: "relative"
      }}>
        <Topbar />
        <main style={{ 
          flex: 1, 
          overflow: "auto", 
          padding: "1.25rem",
          background: "var(--bg-primary)",
          display: "flex",
          flexDirection: "column"
        }}>
          <div
            className="page-content"
            style={{
              flex: 1,
              background: "var(--bg-card)",
              borderRadius: "1.5rem",
              boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
              border: "1px solid var(--border)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column"
            }}
          >
            {children}
          </div>
        </main>
      </div>
      {/* Bottom nav: solo visible en móvil */}
      <MobileNav />
    </div>
  );
}
