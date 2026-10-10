// Prueba de la lógica de la calculadora de tallas con las tablas reales de
// src/content/data/tallas.json. Uso:
//   node --experimental-strip-types .github/scripts/test-size-calc.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { parseCell, recommend, sizeAliases, toSaved } from "../../src/lib/sizeCalc.ts";

const { brands } = JSON.parse(readFileSync(new URL("../../src/content/data/tallas.json", import.meta.url), "utf8"));
const get = (r, brand, kind) => r.brands.find((b) => b.id === brand).items.find((i) => i.kind === kind);
let n = 0;
const ok = (name, fn) => {
  fn();
  n++;
  console.log("ok -", name);
};

ok("parser de celdas", () => {
  assert.deepEqual(parseCell("84-88"), [84, 88]);
  assert.deepEqual(parseCell("hasta 58"), [-Infinity, 58]);
  assert.deepEqual(parseCell("menos de 60"), [-Infinity, 60]);
  assert.deepEqual(parseCell("más de 72"), [72, Infinity]);
  assert.deepEqual(parseCell("72 o más"), [72, Infinity]);
  assert.deepEqual(parseCell("162"), [159, 165]);
  assert.deepEqual(parseCell("15,2", 0), [15.2, 15.2]);
  assert.equal(parseCell("—"), null);
});

ok("hombre 178/98/86/102 → Allstar 102 (estatura alta, encaja bien); VE 50", () => {
  const r = recommend(brands, { profile: "hombre", height: 178, chest: 98, waist: 86, hip: 102 });
  const s = get(r, "allstar", "suit");
  assert.equal(s.label, "102");
  assert.match(s.table, /alta estatura/);
  assert.equal(s.fit, "good");
  assert.equal(s.variant, true);
  assert.equal(get(r, "ve", "suit").label, "50");
  // PBT/Grant no tiene tablas: usa las de VE y lo dice
  const p = get(r, "pbt", "suit");
  assert.equal(p.label, "50");
  assert.equal(p.borrowed, true);
});

ok("hombre 172/98/86/102 → Allstar 50 (estatura normal), medida de altura aproximada no", () => {
  const r = recommend(brands, { profile: "hombre", height: 172, chest: 98, waist: 86, hip: 102 });
  const s = get(r, "allstar", "suit");
  assert.equal(s.label, "50");
  assert.match(s.table, /estatura normal/);
  assert.equal(s.fit, "good");
});

ok("hombre alto 190/108/92/108 usa la tabla de estatura alta", () => {
  const r = recommend(brands, { profile: "hombre", height: 190, chest: 108, waist: 92, hip: 108 });
  assert.match(get(r, "allstar", "suit").table, /alta/);
});

ok("niña 141/77/69/84 → infantil 146 o 152, sin 'fuera de tabla'", () => {
  const r = recommend(brands, { profile: "nino", height: 141, chest: 77, waist: 69, hip: 84 });
  const a = get(r, "allstar", "suit");
  assert.ok(["146", "152"].includes(a.label), a.label);
  assert.notEqual(a.fit, "out");
});

ok("niño 138 cm (tercio alto de 134-140) → aviso 'la siguiente'", () => {
  const r = recommend(brands, { profile: "nino", height: 138, chest: 72, waist: 62, hip: 76 });
  const a = get(r, "allstar", "suit");
  assert.equal(a.label, "140");
  assert.equal(a.grow, "146");
  assert.equal(get(r, "ve", "suit").grow, "146");
});

ok("niño 124 cm (tercio bajo) → sin aviso", () => {
  const r = recommend(brands, { profile: "nino", height: 124, chest: 65, waist: 59, hip: 71 });
  assert.equal(get(r, "allstar", "suit").grow, undefined);
});

ok("mano 20,3 cm → guante 8; 20,4 → 8,5 (hacia arriba)", () => {
  assert.equal(get(recommend(brands, { profile: "hombre", height: 178, hand: 20.3 }), "ve", "glove").label, "8");
  const g = get(recommend(brands, { profile: "hombre", height: 178, hand: 20.4 }), "ve", "glove");
  assert.equal(g.label, "8,5");
  const r = recommend(brands, { profile: "hombre", height: 178, hand: 20.3 });
  assert.equal(get(r, "allstar", "glove").label, "8");
  assert.equal(get(r, "pbt", "glove").label, "8");
});

ok("cabeza 57 → careta Allstar 0 (S); 58 (empate) → la mayor 1 (M)", () => {
  assert.equal(get(recommend(brands, { profile: "hombre", height: 178, head: 57 }), "allstar", "mask").label, "0 (S)");
  assert.equal(get(recommend(brands, { profile: "hombre", height: 178, head: 58 }), "allstar", "mask").label, "1 (M)");
  assert.equal(get(recommend(brands, { profile: "hombre", height: 178, head: 75 }), "allstar", "mask").label, "3 (XL)");
  assert.equal(get(recommend(brands, { profile: "hombre", height: 178, head: 62 }), "ve", "mask").label, "Small");
});

ok("peto: Allstar por altura y pecho; VE y NPT por talla de traje", () => {
  const r = recommend(brands, { profile: "hombre", height: 178, chest: 98, waist: 86, hip: 102 });
  assert.ok(get(r, "allstar", "vest"));
  assert.equal(get(r, "ve", "vest").label, "M"); // traje 50 → VE hombre 48-50
  assert.equal(get(r, "npt", "vest").label, "XL");
});

ok("zapatillas 40 → UK 6,5 / US 7; 41 entre 40 2/3 y 41 1/3", () => {
  const s = recommend(brands, { profile: "hombre", height: 178, shoe: 40 }).shoe;
  assert.equal(s.label, "40");
  assert.equal(s.extra.find((e) => e.header === "UK").value, "6,5");
  assert.equal(recommend(brands, { profile: "hombre", height: 178, shoe: 41 }).shoe.label, "41 1/3");
  assert.equal(recommend(brands, { profile: "hombre", height: 178, shoe: 70 }).shoe.fit, "out");
});

ok("medidas absurdas → fuera de tabla", () => {
  const r = recommend(brands, { profile: "hombre", height: 230, chest: 160, waist: 140, hip: 150 });
  assert.equal(get(r, "allstar", "suit").fit, "out");
});

ok("tallas guardadas y alias", () => {
  assert.deepEqual(sizeAliases("0 (S)").sort(), ["0", "0 (S)", "S"].sort());
  assert.ok(sizeAliases("X-Small").includes("XS"));
  assert.ok(sizeAliases("7,5").includes("7.5"));
  const saved = toSaved(recommend(brands, { profile: "hombre", height: 178, chest: 98, waist: 86, hip: 102, head: 57 }));
  assert.ok(saved.brands.allstar.suit.includes("102"));
  assert.ok(saved.brands.allstar.mask.includes("S"));
});

console.log(`\n${n} grupos de pruebas correctos`);
