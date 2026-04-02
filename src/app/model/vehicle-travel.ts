import { Checklist } from "./checklist";
import { Driver } from "./driver";
import { ETravelStatus } from "./enums/e-travel-status";
import { Fuel } from "./fuel";
import { Vehicle } from "./vehicle";

export type VehicleTravel = {
    id: number;
    schedule_id: number;
    vehicle: Vehicle;
    driver: Driver;
    passengersAmount: number;
    diaryValue: number;
    fuel: Fuel | null;
    departureQuilometers: number | null;
    arrivalQuilometers: number | null;
    drivenQuilometers: number | null;
    usedFuelAmount: string | null;
    registry: string | null;
    status: ETravelStatus;
    checklist: Checklist;
}