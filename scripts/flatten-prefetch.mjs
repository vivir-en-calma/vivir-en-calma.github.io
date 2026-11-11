// Next.js 16 (output: "export") guarda las precargas de segmentos como
// out/<ruta>/__next.<segmento>/__PAGE__.txt, pero el navegador las pide como
// out/<ruta>/__next.<segmento>.__PAGE__.txt. En un hosting estático (GitHub Pages)
// eso produce 404 y se pierde la precarga. Este script crea las copias con el
// nombre que pide el navegador. Se ejecuta automáticamente después de `npm run build`.
import { copyFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "out");
let copies = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (!statSync(full).isDirectory()) continue;
    if (name.startsWith("__next.")) flatten(full, dir, name);
    else walk(full);
  }
}

function flatten(segDir, parent, prefix) {
  for (const name of readdirSync(segDir)) {
    const full = join(segDir, name);
    const flatName = `${prefix}.${name}`;
    if (statSync(full).isDirectory()) {
      flatten(full, parent, flatName);
    } else {
      const target = join(parent, flatName);
      if (!existsSync(target)) {
        copyFileSync(full, target);
        copies += 1;
      }
    }
  }
}

if (existsSync(OUT)) {
  walk(OUT);
  console.log(`flatten-prefetch: ${copies} archivo(s) de precarga copiados`);
}
