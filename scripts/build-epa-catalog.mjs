#!/usr/bin/env node
/**
 * Downloads EPA vehicles.csv and builds src/data/epaVehicleCatalog.json
 * Run: node scripts/build-epa-catalog.mjs
 */
import { mkdirSync, writeFileSync, createReadStream } from "fs";
import { createInterface } from "readline";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outPath = join(root, "src/data/epaVehicleCatalog.json");
const zipPath = join(root, ".cache/epa-vehicles.zip");
const csvPath = join(root, ".cache/vehicles.csv");

const EPA_ZIP = "https://www.fueleconomy.gov/feg/epadata/vehicles.csv.zip";

async function download() {
  mkdirSync(join(root, ".cache"), { recursive: true });
  const response = await fetch(EPA_ZIP);
  if (!response.ok) {
    throw new Error(`EPA download failed: ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(zipPath, buffer);
  execSync(`unzip -o -q "${zipPath}" -d "${join(root, ".cache")}"`);
  execSync(`mv "${join(root, ".cache/vehicles.csv")}" "${csvPath}" 2>/dev/null || true`);
}

function parseCsvLine(line, headers) {
  const parts = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      parts.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  parts.push(current);
  const row = {};
  headers.forEach((h, i) => {
    row[h] = (parts[i] ?? "").trim();
  });
  return row;
}

async function buildCatalog() {
  const modelsByMake = new Map();
  const fileStream = createReadStream(csvPath, { encoding: "utf8" });
  const rl = createInterface({ input: fileStream, crlfDelay: Infinity });
  let headers = null;
  let lineNum = 0;

  for await (const line of rl) {
    lineNum++;
    if (lineNum === 1) {
      headers = line.split(",");
      continue;
    }
    const row = parseCsvLine(line, headers);
    const make = row.make?.trim();
    const model = row.model?.trim();
    if (!make || !model) {
      continue;
    }
    if (!modelsByMake.has(make)) {
      modelsByMake.set(make, new Set());
    }
    modelsByMake.get(make).add(model);
  }

  const makes = Array.from(modelsByMake.keys()).sort((a, b) => a.localeCompare(b));
  const models = {};
  for (const [make, set] of modelsByMake) {
    models[make] = Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  const catalog = {
    generatedAt: new Date().toISOString(),
    source: "fueleconomy.gov/epadata/vehicles.csv",
    makeCount: makes.length,
    makes,
    modelsByMake: models,
  };

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(catalog));
  console.log(`Wrote ${outPath} — ${makes.length} makes`);
}

async function main() {
  console.log("Downloading EPA vehicle database…");
  await download();
  console.log("Building catalog…");
  await buildCatalog();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
