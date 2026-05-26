export type TripInput = {
  startPlace: string;
  destinationPlace: string;
  /** ZIP extracted for weather/fuel APIs — may match a ZIP inside an address */
  startZip: string;
  destinationZip: string;
  vehicleMpg: number;
  gasPrice: number;
};

export type TripResult = {
  distanceMiles: number;
  gallonsNeeded: number;
  fuelCost: number;
  driveTimeHours: number;
  driveTimeLabel: string;
};
