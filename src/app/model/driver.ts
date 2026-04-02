import { EDriverStatus } from "./enums/e-driver-status";
import { ELicenseCategory } from "./enums/e-license-category";
import { Phone } from "./phone";

export type Driver = {
    id: number;
    name: string;
    phones: Phone[] | [];
    gender: string;
    email: string;
    birthDate: string;
    cpf: string;
    rg: string;
    naturality: string | null;
    nationality: string | null;
    licenseNumber: string;
    licenseIssueDate: string;
    licenseExpireDate: string;
    licenseCategory: ELicenseCategory;
    licenseIssuingBody: string;
    status: EDriverStatus;
}