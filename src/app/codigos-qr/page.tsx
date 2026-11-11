import type { Metadata } from "next";
import HojaQr from "@/components/compartir/HojaQr";

export const metadata: Metadata = {
  title: "Código QR · Vivir en calma",
  description: "Código QR para imprimir y compartir la cartilla interactiva «Vivir en calma».",
};

export default function CodigosQrPage() {
  // El QR impreso apunta a /qr/, que reenvía a la cartilla (ver src/app/qr/page.tsx).
  const recursos = [{ ruta: "/qr/", titulo: "Vivir en calma", detalle: "Cartilla interactiva · Proyecto Libélula", archivo: "vivir-en-calma" }];

  return (
    <div className="qr-hoja">
      <header className="c-hero simple no-print">
        <p className="eyebrow">Para compartir</p>
        <h1>Código QR</h1>
        <p className="c-sub">Imprímelo o descárgalo para ponerlo en carteleras, salas de espera o materiales del proyecto. Abre la cartilla.</p>
      </header>
      <HojaQr recursos={recursos} />
    </div>
  );
}
