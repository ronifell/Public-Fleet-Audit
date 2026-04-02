import { ELicenseCategory } from "./enums/e-license-category";
import { Brand } from "./brand";

export type CarModel = {
    id: number;
    brand: Brand;
    name: string;
    year: string;
    requiredLicense: ELicenseCategory;
    fuelCapacity: string;
    enginePower: string;
}