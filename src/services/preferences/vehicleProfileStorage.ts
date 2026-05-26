/** @deprecated Import from @/services/vehicle/vehicleStorage */
export {
  clearVehicleProfile,
  getVehicleProfile,
  isVehicleProfileComplete,
  setVehicleProfile,
  subscribeVehicleProfile,
} from "@/services/vehicle/vehicleStorage";

export {
  defaultVehicleProfile,
  estimateFuelFromLegacyProfile as estimateFuelFromVehicle,
  estimateVehicle,
} from "@/services/vehicle/vehicleEstimator";

export type { VehicleProfile } from "@/services/vehicle/types";
