import { Group } from "./group"
import { Permission } from "./permission"

export type User = {
    id: number,
    fullName: string,
    userName: string,
    password: string,
    registrationNumber: string,
    groups: Group[],
    permissions: Permission[],
    status: string,
    active: boolean
}