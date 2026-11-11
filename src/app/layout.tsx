import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Raleway } from "next/font/google";
import SinConexion from "@/components/pwa/SinConexion";
import { BotonGuia } from "@/components/guia/Guia";
import { ilustracion } from "@/lib/cartilla";
import "./globals.css";
import "./cartilla.css";
import "./vivir-en-calma.css";
import "./libro.css";

// La cartilla impresa usa Raleway: la herramienta conserva esa misma tipografía.
const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  // Durante la fase de pruebas la herramienta no debe aparecer en buscadores.
  robots: process.env.NEXT_PUBLIC_NO_INDEXAR === "1" ? { index: false, follow: false } : undefined,
  title: "Vivir en calma · Cartilla interactiva Libélula",
  description:
    "Una guía para cuidar mi cuerpo, mis emociones y mi bienestar: siete módulos para comprender la hipertensión y la diabetes, con ejercicios para practicar.",
};

export const viewport: Viewport = {
  themeColor: "#197885",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={raleway.variable} suppressHydrationWarning>
      <body>
        <div className="cartilla" style={{ ["--fondo-pag" as string]: `url(${ilustracion("fondo")})` }}>
          <header className="c-top">
            <div className="c-wrap">
              <Link href="/" className="c-brand">
                Vivir en calma
              </Link>
              <nav className="c-top-links">
                <BotonGuia className="c-ayuda">¿Cómo funciona?</BotonGuia>
              </nav>
            </div>
          </header>
          <main className="c-wrap c-main">{children}</main>
          <footer className="c-foot">
            <div className="c-wrap">
              <p>
                Cartilla para pacientes · Proyecto de Investigación Libélula. Lo que registras en los ejercicios se guarda solo en este
                dispositivo.
              </p>
              <p className="c-foot-links">
                <Link href="/creditos/">Créditos y referencias</Link>
                <Link href="/codigos-qr/">Código QR</Link>
              </p>
            </div>
          </footer>
        </div>
        <SinConexion />
      </body>
    </html>
  );
}
