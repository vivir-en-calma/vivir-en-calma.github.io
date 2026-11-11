import type { Metadata } from "next";
import { withBase } from "@/lib/paths";

// Destino de los códigos QR impresos. Los QR apuntan siempre a /qr/ y esta página
// reenvía aquí: para cambiar a dónde llevan todos los QR basta con cambiar esta línea
// (una ruta de la cartilla como "/" o "/nutrirme/", o una dirección completa https://…).
const DESTINO_QR = "/";

const destino = /^https?:\/\//.test(DESTINO_QR) ? DESTINO_QR : withBase(DESTINO_QR);

export const metadata: Metadata = {
  title: "Vivir en calma",
  robots: { index: false, follow: true },
};

export default function Qr() {
  return (
    <div className="qr-redirige">
      <meta httpEquiv="refresh" content={`0;url=${destino}`} />
      <script dangerouslySetInnerHTML={{ __html: `location.replace(${JSON.stringify(destino)})` }} />
      <p>
        Abriendo la cartilla… Si no se abre sola, <a href={destino}>toca aquí</a>.
      </p>
    </div>
  );
}
