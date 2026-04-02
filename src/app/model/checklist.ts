import { VehicleTravel } from "./vehicle-travel";

export type Checklist = {
    id: number;
    travel: number;
    buzina: string | null;
    cinto: string | null;
    vidros: string | null;
    macaco: string | null;
    quebraSol: string | null;
    triangulo: string | null;
    retrovisorInterno: string | null;
    retrovisoresLaterais: string | null;
    chaveDeRoda: string | null;
    extensor: string | null;
    indicadoresPainel: string | null;
    luzPlaca: string | null;
    oleoMotor: string | null;
    oleoFreio: string | null;
    luzFreio: string | null;
    luzRe: string | null;
    nivelAgua: string | null;
    alarme: string | null;
    pneus: string | null;
    travas: string | null;
    farois: string | null;
    extintor: string | null;
    lanternasDianteiras: string | null;
    lanternasTraseiras: string | null;
    estepe: string | null;
    alerta: string | null;
    cartaoAbastecimentoComCondutor: string | null;
    habilitacaoCondutor: string | null;
    vencimentoCarteira: string | null;
    categoriaCarteira: string | null;
    paraBrisas: string | null;
    bancos: string | null;
    documentoVeiculo: string | null;
    assinaturaMotorista: string | Blob | null;
    assinaturaResponsavel: string | Blob | null;
}

type TravelSend = {
    id: number
}
