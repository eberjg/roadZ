export type MockFuelStop = {
  id: string;
  name: string;
  city: string;
  mileMarker: number;
  gasPrice: number;
  foodAvailable: boolean;
  restroomAvailable: boolean;
  open24h: boolean;
};

/** Deterministic fuel stops along long-haul routes (mile marker from trip start). */
export const MOCK_FUEL_STOPS: MockFuelStop[] = [
  {
    id: "stop-1",
    name: "Sunrise Travel Plaza",
    city: "Ocala, FL",
    mileMarker: 280,
    gasPrice: 3.79,
    foodAvailable: true,
    restroomAvailable: true,
    open24h: true,
  },
  {
    id: "stop-2",
    name: "Riverbend Fuel & Go",
    city: "Valdosta, GA",
    mileMarker: 520,
    gasPrice: 3.65,
    foodAvailable: true,
    restroomAvailable: true,
    open24h: false,
  },
  {
    id: "stop-3",
    name: "Highway 75 Stop",
    city: "Nashville, TN",
    mileMarker: 890,
    gasPrice: 3.49,
    foodAvailable: true,
    restroomAvailable: true,
    open24h: true,
  },
  {
    id: "stop-4",
    name: "Crossroads Station",
    city: "Little Rock, AR",
    mileMarker: 1250,
    gasPrice: 3.39,
    foodAvailable: false,
    restroomAvailable: true,
    open24h: true,
  },
  {
    id: "stop-5",
    name: "Prairie Rest Stop",
    city: "Amarillo, TX",
    mileMarker: 1680,
    gasPrice: 3.29,
    foodAvailable: true,
    restroomAvailable: true,
    open24h: true,
  },
  {
    id: "stop-6",
    name: "Desert Mile Fuel",
    city: "Albuquerque, NM",
    mileMarker: 2100,
    gasPrice: 3.59,
    foodAvailable: true,
    restroomAvailable: true,
    open24h: true,
  },
  {
    id: "stop-7",
    name: "Mountain View Gas",
    city: "Boise, ID",
    mileMarker: 2550,
    gasPrice: 3.89,
    foodAvailable: true,
    restroomAvailable: true,
    open24h: false,
  },
  {
    id: "stop-8",
    name: "Pacific Route Station",
    city: "Portland, OR",
    mileMarker: 2950,
    gasPrice: 4.15,
    foodAvailable: true,
    restroomAvailable: true,
    open24h: true,
  },
];

export function getStopsAlongRoute(totalDistanceMiles: number): MockFuelStop[] {
  return MOCK_FUEL_STOPS.filter((stop) => stop.mileMarker < totalDistanceMiles).sort(
    (a, b) => a.mileMarker - b.mileMarker,
  );
}
