import { Driver } from "./driver";
import { ETravelStatus } from "./enums/e-travel-status";
import { User } from "./user";
import { Vehicle } from "./vehicle";

export type Schedule2 = {
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
    passengersAmount: number;
    vehicle: Vehicle;
    driver: Driver | null;
    status: ETravelStatus;
    requestUser: User | null;
    approvalUser: User | null;
    
    // ADICIONAR DEPOIS
    // approvalDate: string | null;
    // approvalTime: string | null;
    // denialDate: string | null;
    // denialTime: string | null;
    // reason: string | null;
    // createdAt: string;
    // updatedAt: string;
}
