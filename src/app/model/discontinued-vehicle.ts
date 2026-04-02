import { Vehicle } from "./vehicle";

export type DiscontinuedVehicle = {
    id: number;
    vehicle: Vehicle;
    date: string;
    time: string;
    processNumber: string;
    description: string | null;
}