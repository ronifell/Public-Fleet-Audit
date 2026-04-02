import { Permission } from "./permission"
export type Group = {
    id: number,
    name: string,
    description: string,
    permissions: Permission[]
}