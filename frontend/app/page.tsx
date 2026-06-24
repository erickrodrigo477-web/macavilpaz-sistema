"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import ThemeToggle from "./components/ThemeToggle";
import ScrollReveal from "./components/ScrollReveal";

export default function LandingPage() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evitar error de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? (resolvedTheme || theme) : "dark";
  const backgroundImage = currentTheme === "dark" 
    ? "/fondo_main_oscuro.jpg" 
    : "/fondo_main_claro.jpg";

  return (
    <div className="flex-col" style={{ minHeight: "100vh", background: "var(--bg-primary)", position: "relative" }}>
      {/* Background decorativo */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        background: "radial-gradient(ellipse at 20% 50%, #f8717110 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #3b82f610 0%, transparent 50%)",
        pointerEvents: "none",
      }} />

      {/* Navbar Superior */}
      <header className="glass-nav flex-between" style={{ 
        top: "1.5rem", left: "50%", transform: "translateX(-50%)", width: "95%", maxWidth: "1400px",
        height: "70px", borderRadius: "99px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        padding: "0 2.5rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
            <div style={{
              width: "40px", height: "40px",
              background: "var(--accent)",
              borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.2rem", fontWeight: "800", color: "white"
            }}>M</div>
            <span style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-primary)" }}>
              Macavilpaz
            </span>
          </Link>

          {/* Links de Navegación (Visibles en desktop) */}
          <nav style={{ display: "none", alignItems: "center", gap: "1.5rem", marginLeft: "2rem" }} className="desktop-nav">
            <a href="#quienes-somos" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.95rem", fontWeight: "500" }}>Nosotros</a>
            <a href="#caracteristicas" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.95rem", fontWeight: "500" }}>El Sistema</a>
          </nav>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <ThemeToggle />

          <Link href="/login" style={{ textDecoration: "none" }}>
            <button className="btn-primary" style={{ padding: "0.5rem 1.25rem", borderRadius: "99px", boxShadow: "0 2px 8px rgba(248, 113, 113, 0.3)" }}>
              Iniciar Sesión
            </button>
          </Link>
        </div>
      </header>

        {/* Contenido Principal (Hero Section) */}
      <main className="flex-col items-center" style={{ flex: 1, position: "relative", zIndex: 1 }}>
        
        <section className="section-padding flex-col items-center flex-center" style={{ minHeight: "100vh", width: "100%" }}>
          
          {/* Fondo Dinámico con Zoom (Ken Burns) */}
          <div className="animate-zoom-bg" style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 0,
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4)), url('${backgroundImage}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
          }} />

          {/* Contenedor Superior para los textos (encima del fondo) */}
          <div className="flex-col items-center" style={{ position: "relative", zIndex: 2 }}>
            <ScrollReveal delay={0}>
              <h1 className="hero-title" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)", textAlign: "center", color: "#fff" }}>
                <span style={{ color: "var(--accent)" }}>Constructora Macavilpaz</span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <p style={{
                fontSize: "clamp(1rem, 2vw, 1.25rem)",
                color: "#e2e8f0",
                maxWidth: "600px",
                marginBottom: "3rem",
                lineHeight: "1.6",
                textShadow: "0 1px 5px rgba(0,0,0,0.8)"
              }}>
                Plataforma centralizada para la gestión, seguimiento y asignación de obras, maquinaria pesada y suministros de construcción.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
                
                <a href="#caracteristicas" style={{ textDecoration: "none" }}>
                  <button className="btn-secondary" style={{ padding: "0.875rem 2rem", fontSize: "1rem", background: "rgba(255,255,255,0.1)", color: "white", borderColor: "rgba(255,255,255,0.3)", backdropFilter: "blur(4px)" }}>
                    Ver Características
                  </button>
                </a>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Sección: Quiénes Somos */}
        <section id="quienes-somos" className="section-padding" style={{ 
          width: "100%", 
          background: "linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)",
        }}>
          {/* Elementos decorativos de fondo */}
          <div style={{ position: "absolute", top: "-10%", right: "-5%", width: "400px", height: "400px", background: "radial-gradient(circle, #f8717115 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: "300px", height: "300px", background: "radial-gradient(circle, #3b82f615 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

          <div className="container-custom" style={{ zIndex: 1 }}>
            
            <ScrollReveal>
              <div style={{ textAlign: "center", marginBottom: "4rem" }}>
                <div style={{ display: "inline-block", color: "var(--accent)", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", fontSize: "0.85rem", marginBottom: "1rem" }}>
                  Nuestra Esencia
                </div>
                <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "900", color: "var(--text-primary)", lineHeight: "1.2" }}>
                  Construyendo el Futuro <br/><span style={{ color: "var(--accent)" }}>Metro a Metro</span>
                </h2>
              </div>
            </ScrollReveal>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", alignItems: "stretch" }}>
              
              <ScrollReveal delay={100}>
                {/* Tarjeta de Historia */}
                <div className="card" style={{ 
                  padding: "3rem", 
                  background: "var(--bg-card)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
                  border: "1px solid var(--border)",
                  display: "flex", flexDirection: "column", justifyContent: "center",
                  height: "100%"
                }}>
                  
                  <h3 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "1rem", color: "var(--text-primary)" }}>
                    Más de 15 años liderando
                  </h3>
                  <p style={{ color: "var(--text-secondary)", lineHeight: "1.8", fontSize: "1rem" }}>
                    Especialistas en infraestructura vial, edificaciones comerciales y residenciales de gran escala. Implementamos tecnología de punta para un control logístico milimétrico.
                  </p>
                </div>
              </ScrollReveal>

              {/* Grid de Stats Animados */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
                
                <ScrollReveal delay={250}>
                  <div className="card" style={{ 
                    padding: "2rem", 
                    background: "linear-gradient(135deg, var(--accent) 0%, #b82b2b 100%)", 
                    color: "white", 
                    border: "none",
                    display: "flex", alignItems: "center", gap: "2rem",
                    boxShadow: "0 10px 30px rgba(248, 113, 113, 0.3)"
                  }}>
                    <div style={{ fontSize: "3.5rem", fontWeight: "900", lineHeight: 1 }}>+50</div>
                    <div>
                      <h4 style={{ fontSize: "1.1rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>Obras</h4>
                      <span style={{ fontSize: "0.9rem", opacity: 0.9 }}>Ejecutadas con éxito</span>
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={400}>
                  <div className="card" style={{ 
                    padding: "2rem", 
                    background: "var(--bg-card)", 
                    border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", gap: "2rem",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
                  }}>
                    <div style={{ fontSize: "3.5rem", fontWeight: "900", lineHeight: 1, color: "var(--text-primary)" }}>24/7</div>
                    <div>
                      <h4 style={{ fontSize: "1.1rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-primary)" }}>Logística</h4>
                      <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Monitoreo integrado</span>
                    </div>
                  </div>
                </ScrollReveal>

              </div>
            </div>

          </div>
        </section>

        {/* Sección: Características del Sistema */}
        <section id="caracteristicas" className="section-padding" style={{ 
          width: "100%", 
          /* Patrón de Malla de Puntos */
          backgroundImage: "radial-gradient(rgba(128, 128, 128, 0.25) 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px"
        }}>
          {/* Luz de fondo suave */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "60vw", height: "60vw", background: "radial-gradient(circle, #f871710A 0%, transparent 60%)", borderRadius: "50%", pointerEvents: "none", zIndex: 0 }} />

          <div className="container-custom" style={{ zIndex: 1 }}>
            
            <ScrollReveal>
              <div style={{ textAlign: "center", marginBottom: "4rem" }}>
                <div style={{ display: "inline-block", color: "var(--accent)", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", fontSize: "0.85rem", marginBottom: "1rem" }}>
                  Potencia Operativa
                </div>
                <h2 style={{ fontSize: "2.5rem", fontWeight: "900", color: "var(--text-primary)", marginBottom: "1rem" }}>
                  Módulos del Sistema
                </h2>
                <p style={{ color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto", fontSize: "1.05rem", lineHeight: "1.7" }}>
                  La Suite completa de Macavilpaz integra logística de construcción corporativa, control de almacenes y rastreo financiero de activos pesados. Todo en un solo panel de control.
                </p>
              </div>
            </ScrollReveal>

            <div className="feature-grid">
              <ScrollReveal delay={100}>
                <div className="card card-feature" style={{ borderTop: "4px solid #f97316", height: "100%" }}>
                  <div style={{ marginBottom: "1rem", background: "#f9731615", width: "max-content", padding: "12px", borderRadius: "12px" }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 14.76V3.5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v11.26"/><path d="M12 21H3c-1.1 0-2-.9-2-2v-4.5M19 21h2c1.1 0 2-.9 2-2V9"/><path d="M21 9V5a2 2 0 0 0-2-2h-3"/><path d="M14 21v-4"/><path d="M10 21v-4"/><path d="M6 21v-4"/>
                    </svg>
                  </div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem", color: "var(--text-primary)" }}>Maquinaria Pesada</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6" }}>
                    Registro completo de activos fijos, fechas de mantenimiento, estado operativo y depreciación de la flota.
                  </p>
                </div>
              </ScrollReveal>
              
              <ScrollReveal delay={200}>
                <div className="card card-feature" style={{ borderTop: "4px solid #3b82f6", height: "100%" }}>
                  <div style={{ marginBottom: "1rem", background: "#3b82f615", width: "max-content", padding: "12px", borderRadius: "12px" }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
                      <path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>
                    </svg>
                  </div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem", color: "var(--text-primary)" }}>Gestión de Obras</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6" }}>
                    Creación de proyectos, asignación de presupuestos y control de campamentos activos e inactivos.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={300}>
                <div className="card card-feature" style={{ borderTop: "4px solid #10b981", height: "100%" }}>
                  <div style={{ marginBottom: "1rem", background: "#10b98115", width: "max-content", padding: "12px", borderRadius: "12px" }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
                    </svg>
                  </div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem", color: "var(--text-primary)" }}>Suministros y Bodega</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6" }}>
                    Control estricto, entradas y salidas de materiales con alertas automáticas de bajo stock en campamento.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={400}>
                <div className="card card-feature" style={{ borderTop: "4px solid #8b5cf6", height: "100%" }}>
                  <div style={{ marginBottom: "1rem", background: "#8b5cf615", width: "max-content", padding: "12px", borderRadius: "12px" }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/>
                    </svg>
                  </div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem", color: "var(--text-primary)" }}>Trazabilidad Total</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6" }}>
                    Historial completo de a qué obra fue asignado cada vehículo y qué ingeniero aprobó los suministros.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

      </main>

      {/* Footer Público */}
      <footer style={{
        position: "relative", zIndex: 1,
        padding: "2rem 5%",
        borderTop: "1px solid var(--border)",
        background: "var(--bg-secondary)",
        textAlign: "center"
      }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          © {new Date().getFullYear()} Constructora Macavilpaz. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
