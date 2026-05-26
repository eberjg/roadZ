import type { OperationalStatus } from "@/services/operations/types";

export type WeatherCondition =
  | "clear"
  | "rain"
  | "thunderstorm"
  | "snow"
  | "fog"
  | "wind"
  | "extreme_heat";

export type WeatherZone = {
  id: string;
  mileStart: number;
  mileEnd: number;
  city: string;
  condition: WeatherCondition;
  temperatureF: number;
  precipitationMm: number;
  windMph: number;
  visibilityMiles: number;
  summary: string;
  icon: string;
};

export type SevereWeatherAlert = {
  id: string;
  code: string;
  message: string;
  severity: OperationalStatus;
  mileMarker: number;
};

export type WeatherTimelineEntry = {
  id: string;
  label: string;
  mileMarker: number;
  timeLabel: string;
  condition: WeatherCondition;
  icon: string;
  temperatureF: number;
  isSevere: boolean;
  completed: boolean;
};

export type RoadRiskAssessment = {
  score: number;
  level: OperationalStatus;
  visibilityRisk: "low" | "moderate" | "high";
  combinedFatigueWeatherRisk: string;
  factors: string[];
};

export type WeatherIntelligence = {
  source: "openweather" | "mock";
  completedMile: number;
  current: WeatherZone;
  routeZones: WeatherZone[];
  severeAlerts: SevereWeatherAlert[];
  timeline: WeatherTimelineEntry[];
  risk: RoadRiskAssessment;
};

export type WeatherRequest = {
  startZip: string;
  destinationZip: string;
  totalDistanceMiles: number;
  completedDistanceMiles: number;
  fatigueStatus?: OperationalStatus;
  drivingSessionHours?: number;
};

export type OpenWeatherResponse = {
  main: { temp: number };
  weather: Array<{ main: string; description: string }>;
  wind: { speed: number };
  visibility: number;
};
