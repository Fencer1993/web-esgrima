// Prueba de la lógica del entrenador de pies con los datos reales de
// src/content/data/entrenador.json. Uso:
//   node --experimental-strip-types .github/scripts/test-footwork.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { nextInterval, pickMove, simulate } from "../../src/lib/footwork.ts";

const data = JSON.parse(readFileSync(new URL("../../src/content/data/entrenador.json", import.meta.url), "utf8"));
const { movimientos, niveles, ajustes, primera } = data;
const limit = ajustes.limitePista;

// Generador pseudoaleatorio con semilla (para que la prueba sea repetible).
const seeded = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

for (const lvl of niveles) {
  for (const seed of [1, 7, 42]) {
    const run = simulate(movimientos, lvl.id, limit, 200, seeded(seed));
    assert.equal(run.length, 200, `${lvl.id}: se generaron 200 órdenes`);
    const worst = Math.max(...run.map((r) => Math.abs(r.pos)));
    assert.ok(worst <= limit, `${lvl.id}: posición máxima ${worst} > ${limit}`);
    const ids = new Set(run.map((r) => r.id));
    const allowed = new Set(movimientos.filter((m) => m.niveles.includes(lvl.id) && m.peso > 0).map((m) => m.id));
    for (const id of ids) assert.ok(allowed.has(id), `${lvl.id}: «${id}» no es de este nivel`);
    assert.ok(ids.size >= Math.min(4, allowed.size), `${lvl.id}: poca variedad (${ids.size})`);
    assert.ok(!run.some((r, i) => i > 0 && r.id === run[i - 1].id), `${lvl.id}: orden repetida seguida`);
  }
  console.log("ok - nivel", lvl.id);
}

// En el límite se fuerza la orden contraria.
assert.ok(pickMove(movimientos, "iniciacion", limit, limit, () => 0.5).paso < 0);
assert.ok(pickMove(movimientos, "iniciacion", -limit, limit, () => 0.5).paso > 0);
console.log("ok - límite de la pista fuerza la orden contraria");

// Modo reacción: solo movimientos con color.
const react = simulate(movimientos, "competicion", limit, 200, seeded(3), true);
assert.ok(react.every((r) => movimientos.find((m) => m.id === r.id).color), "reacción: solo órdenes con color");
assert.ok(Math.max(...react.map((r) => Math.abs(r.pos))) <= limit);
console.log("ok - modo reacción");

// Intervalos dentro del rango del nivel y con mínimo para evitar destellos.
for (const lvl of niveles) {
  for (let i = 0; i < 200; i++) {
    const s = nextInterval(lvl, Math.random, 1 / ajustes.cambiosPorSegundoMax);
    assert.ok(s >= lvl.min - 1e-9 && s <= lvl.max + 1e-9 && s >= 0.5);
  }
}
assert.ok(movimientos.some((m) => m.id === primera), "existe la orden inicial");
for (const m of movimientos) for (const l of ["es", "fr", "en"]) assert.ok(m[l], `${m.id} sin texto ${l}`);
console.log("ok - intervalos y textos en es/fr/en");
