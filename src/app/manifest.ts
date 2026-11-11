import type { MetadataRoute } from "next";
import { withBase } from "@/lib/paths";

// Permite instalar la herramienta en el celular como una aplicación.
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Experiencia Libélula",
    short_name: "Libélula",
    description: "Vivir en calma: cartilla interactiva para cuidar el cuerpo, las emociones y el bienestar con hipertensión y diabetes.",
    lang: "es",
    start_url: withBase("/"),
    scope: withBase("/"),
    display: "standalone",
    background_color: "#f7f8fa",
    theme_color: "#1d4285",
    icons: [
      { src: withBase("/img/icono-192.png"), sizes: "192x192", type: "image/png" },
      { src: withBase("/img/icono-512.png"), sizes: "512x512", type: "image/png" },
      { src: withBase("/img/icono-maskable-512.png"), sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
