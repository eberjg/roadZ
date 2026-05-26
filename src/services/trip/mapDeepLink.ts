/** Read start/end from URL — supports handoff from map apps. */
export function readMapHandoffFromSearch(search: string): {
  start: string | null;
  destination: string | null;
} {
  const params = new URLSearchParams(search);
  const start =
    params.get("from") ??
    params.get("start") ??
    params.get("saddr") ??
    params.get("origin") ??
    null;
  const destination =
    params.get("to") ??
    params.get("destination") ??
    params.get("daddr") ??
    params.get("dest") ??
    null;
  return { start, destination };
}
