// Genera out/sw.js con la lista de todos los archivos de la compilación, para que la
// herramienta quede guardada en el dispositivo y funcione sin conexión. La versión
// cambia cuando cambia cualquier archivo, así el celular descarga la nueva versión.
// Se ejecuta automáticamente después de `npm run build` (ver package.json).
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const OUT = join(process.cwd(), "out");
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const EXCLUIR = new Set(["sw.js", "404.html", "404/index.html"]);

function listar(dir) {
  return readdirSync(dir).flatMap((n) => {
    const full = join(dir, n);
    if (statSync(full).isDirectory()) return n.startsWith("__next.") ? [] : listar(full);
    return [full];
  });
}

const archivos = listar(OUT)
  .map((f) => relative(OUT, f).split(sep).join("/"))
  .filter((f) => !EXCLUIR.has(f))
  .sort();

const hash = createHash("sha256");
for (const f of archivos) hash.update(f).update(readFileSync(join(OUT, f)));
const version = hash.digest("hex").slice(0, 12);

// Las páginas se piden por su carpeta («/conocerme/»), no por «index.html».
const urls = archivos.map((f) => `${BASE}/${f.replace(/(^|\/)index\.html$/, "$1")}`);

const plantilla = readFileSync(join(process.cwd(), "scripts", "sw-plantilla.js"), "utf8");
const sw = plantilla
  .replace("__VERSION__", version)
  .replace("__BASE__", BASE)
  .replace("__ARCHIVOS__", JSON.stringify(urls, null, 2));
if (/__(VERSION|BASE|ARCHIVOS)__/.test(sw)) throw new Error("generar-sw: quedaron marcadores sin reemplazar en sw.js");
writeFileSync(join(OUT, "sw.js"), sw);
console.log(`generar-sw: ${urls.length} archivos para uso sin conexión (versión ${version})`);
