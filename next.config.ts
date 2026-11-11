import type { NextConfig } from "next";

// Sitio 100 % estático para publicarse sin costo en GitHub Pages.
// Si se publica en https://<usuario>.github.io/<repositorio>/, definir
// NEXT_PUBLIC_BASE_PATH=/<repositorio> al compilar. En dominio propio o
// subdominio institucional se deja vacío.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
};

export default nextConfig;
