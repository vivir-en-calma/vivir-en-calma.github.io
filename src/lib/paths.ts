// Ruta base del sitio (vacía en local; "/<repositorio>" si se publica en
// https://<usuario>.github.io/<repositorio>/). next/image no antepone el basePath
// a las rutas en texto, así que se agrega aquí.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBase(path: string): string {
  return `${BASE_PATH}${path}`;
}
