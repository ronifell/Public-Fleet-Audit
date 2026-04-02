import { Driver } from "./driver";
import { Vehicle } from "./vehicle";

export type Alerts = {
    id: number;
    vehicle: Vehicle | null;
    driver: Driver | null;
    creationDate: string;
    alertDate: string | null;
    vehicleQuilometers: number | null;
    alertQuilometers: number | null;
    enabled: boolean;
}