import { CarModel } from "./car-model";
import { Driver } from "./driver";
import { EVehicleStatus } from "./enums/e-vehicle-status";
import { Fuel } from "./fuel";
import { VehicleType } from "./vehicle-type";

export type Vehicle = {
    id: number;
    type: VehicleType;
    carModel: CarModel;
    licensePlate: string;
    chassi: string;
    renavam: string;
    status: EVehicleStatus;
    active: boolean;
    manufacturingDate: string;
    purchaseDate: string;
    patrimony: number;
    drivenQuilometers: number;
    acquisitionProcessNumber: number;
    fixedDriver: Driver | null;
    passengersAmount: number;
    fuels: Fuel[];
    
}