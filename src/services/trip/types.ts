export type TripInput = {
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
