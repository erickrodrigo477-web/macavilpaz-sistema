import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { AuthProvider } from "./context/AuthContext";

export const metadata: Metadata = {
  title: "Macavilpaz - Sistema de Activos Fijos",
  // [x] Reparar botón de cambio de tema (restaurar atributos de ThemeProvider)
  // [x] Animaciones de scroll funcionales y visibles
  // [x] Estética premium finalizada (Landing Page)
  description: "Gestión eficiente de activos y suministros para la construcción",
};
import { ThemeProvider } from "./components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
