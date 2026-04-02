import { ETravelStatus } from "./enums/e-travel-status";
import { User } from "./user";
import { VehicleTravel } from "./vehicle-travel";

export type Schedule = {
    id: number;
    startDate: string;
    startTime: string;
    endDate: string | null;
    endTime: string | null;
    processNumber: string;
    arrival: string;
    departure: string;
    personInChargeName: string;
    personInChargePhone: string;
    plaintiffUnit: string;
    passengersAmount: number;
    travels: VehicleTravel[];
    status: ETravelStatus;
    requestUser: User | null;
}