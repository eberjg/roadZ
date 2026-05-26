const EPA_BASE = "https://www.fueleconomy.gov/ws/rest";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24;

type CacheEntry<T> = { expiresAt: number; value: T };

const cache = new Map<string, CacheEntry<unknown>>();

function cacheGet<T>(key: string): T | null {
  const hit = cache.get(key);
  if (!hit || hit.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return hit.value as T;
}

function cacheSet<T>(key: string, value: T) {
  cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value });
}

export type EpaMenuItem = { text: string; value: string };

export function parseEpaMenuItems(xml: string): EpaMenuItem[] {
  const items: EpaMenuItem[] = [];
  const pattern =
    /<menuItem>\s*<text>([^<]*)<\/text>\s*<value>([^<]*)<\/value>\s*<\/menuItem>/g;
  let match = pattern.exec(xml);
  while (match) {
    const text = decodeXmlEntities(match[1].trim());
    const value = match[2].trim();
    if (text && value) {
      items.push({ text, value });
    }
    match = pattern.exec(xml);
  }
  return items;
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function readXmlTag(xml: string, tag: string): string | null {
  const match = new RegExp(`<${tag}>([^<]*)</${tag}>`).exec(xml);
  return match ? decodeXmlEntities(match[1].trim()) : null;
}

function readXmlNumber(xml: string, tag: string): number | null {
  const raw = readXmlTag(xml, tag);
  if (!raw) {
    return null;
  }
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : null;
}

export type EpaVehicleRecord = {
  id: string;
  year: number;
  make: string;
  model: string;
  trimLabel: string;
  cityMpg: number;
  highwayMpg: number;
  combinedMpg: number;
  fuelTypeRaw: string;
  driveRaw: string;
  vClass: string;
  cylinders: number | null;
  displacement: number | null;
  rangeMiles: number | null;
};

export function parseEpaVehicle(xml: string): EpaVehicleRecord | null {
  const id = readXmlTag(xml, "id");
  const make = readXmlTag(xml, "make");
  const model = readXmlTag(xml, "model");
  const year = readXmlNumber(xml, "year");
  if (!id || !make || !model || !year) {
    return null;
  }

  const cityE = readXmlNumber(xml, "cityE");
  const highwayE = readXmlNumber(xml, "highwayE");
  const city08 = readXmlNumber(xml, "city08");
  const highway08 = readXmlNumber(xml, "highway08");
  const comb08 = readXmlNumber(xml, "comb08");
  const combE = readXmlNumber(xml, "combE");

  const isEv = (cityE ?? 0) > 0 || (highwayE ?? 0) > 0 || (combE ?? 0) > 0;
  const cityMpg = Math.round(isEv ? (cityE ?? combE ?? 0) : (city08 ?? comb08 ?? 24));
  const highwayMpg = Math.round(
    isEv ? (highwayE ?? combE ?? cityMpg) : (highway08 ?? comb08 ?? cityMpg),
  );
  const combinedMpg = Math.round(isEv ? (combE ?? cityMpg) : (comb08 ?? (cityMpg + highwayMpg) / 2));

  const trany = readXmlTag(xml, "trany") ?? "";
  const displ = readXmlTag(xml, "displ");
  const trimLabel = [trany, displ ? `${displ}L` : ""].filter(Boolean).join(" · ") || "Base trim";

  return {
    id,
    year,
    make,
    model,
    trimLabel,
    cityMpg: Math.max(1, cityMpg),
    highwayMpg: Math.max(1, highwayMpg),
    combinedMpg: Math.max(1, combinedMpg),
    fuelTypeRaw: readXmlTag(xml, "fuelType1") ?? readXmlTag(xml, "fuelType") ?? "Regular Gasoline",
    driveRaw: readXmlTag(xml, "drive") ?? "",
    vClass: readXmlTag(xml, "VClass") ?? "",
    cylinders: readXmlNumber(xml, "cylinders"),
    displacement: displ ? Number(displ) : null,
    rangeMiles: readXmlNumber(xml, "range"),
  };
}

async function fetchEpa(path: string): Promise<string> {
  const url = `${EPA_BASE}${path}`;
  const cached = cacheGet<string>(url);
  if (cached) {
    return cached;
  }

  const response = await fetch(url, {
    headers: { Accept: "application/xml", "User-Agent": "roadZ/1.0 (+https://roadz.app)" },
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error(`EPA request failed (${response.status})`);
  }

  const xml = await response.text();
  cacheSet(url, xml);
  return xml;
}

export async function fetchEpaMenu(path: string): Promise<EpaMenuItem[]> {
  const xml = await fetchEpa(path);
  return parseEpaMenuItems(xml);
}

export async function fetchEpaVehicleById(id: string): Promise<EpaVehicleRecord | null> {
  const xml = await fetchEpa(`/vehicle/${encodeURIComponent(id)}`);
  return parseEpaVehicle(xml);
}
