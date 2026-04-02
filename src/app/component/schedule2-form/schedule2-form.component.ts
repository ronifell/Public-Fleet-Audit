import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// Imports dos Modelos e Serviços
import { Driver } from 'src/app/model/driver';
import { Schedule2 } from 'src/app/model/schedule2';
import { User } from 'src/app/model/user';
import { Vehicle } from 'src/app/model/vehicle';
import { DriverService } from 'src/app/service/driver.service';
import { Schedule2Service } from 'src/app/service/schedule2.service';
import { StoragesService } from 'src/app/service/storages.service';
import { VehicleService } from 'src/app/service/vehicle.service';

@Component({
    selector: 'app-schedule2-form',
    templateUrl: './schedule2-form.component.html',
    styleUrls: ['./schedule2-form.component.css'],
    providers: [DatePipe]
})
export class Schedule2FormComponent implements OnInit {

    vehiclesList: Vehicle[] = [];
    driversList: Driver[] = [];
    user: User = <User>{};
    schedule: Schedule2 = <Schedule2>{};

    areDatesSelected: boolean = false;

    // VARIÁVEIS DE CONTROLE
    canWrite: boolean = false; // Define se é Admin/Writer (Pode definir motorista e status)
    isEditMode: boolean = false; // Define se está editando um existente

    statusFinais = ['FINALIZADO', 'CANCELADO', 'RECUSADO', 'EXPIRADO', 'NAO_INICIADO'];

    // Opções de Status para o Admin alterar na edição
    get statusOptions() {
        const currentStatus = this.validateForm.get('status')?.value;

        // Definição de todas as opções com Labels amigáveis
        const allOptions = {
            SOLICITADO: { label: 'Solicitado', value: 'SOLICITADO' },
            AGENDADO: { label: 'Agendado / Confirmado', value: 'AGENDADO' },
            EM_ANDAMENTO: { label: 'Em Andamento (Viagem iniciada)', value: 'EM_ANDAMENTO' },
            FINALIZADO: { label: 'Finalizado', value: 'FINALIZADO' },
            CANCELADO: { label: 'Cancelado', value: 'CANCELADO' },
            RECUSADO: { label: 'Recusado', value: 'RECUSADO' },
            EXPIRADO: { label: 'Expirado (Automático)', value: 'EXPIRADO' },
            NAO_INICIADO: { label: 'Não Iniciado', value: 'NAO_INICIADO'},
        };

        // Se for um NOVO agendamento (ainda não salvo), Admin pode criar como:
        if (!this.isEditMode) {
            return [allOptions.AGENDADO, allOptions.SOLICITADO];
        }

        // LÓGICA DE TRANSIÇÃO DE ESTADOS
        switch (currentStatus) {
            case 'SOLICITADO':
                // De solicitado pode ir para: Confirmado, Recusado ou Cancelado
                return [
                    allOptions.SOLICITADO,
                    allOptions.AGENDADO,
                    allOptions.RECUSADO,
                    allOptions.CANCELADO
                ];

            case 'AGENDADO':
                // De agendado pode: Iniciar viagem, Cancelar ou voltar para Solicitado (correção)
                return [
                    allOptions.AGENDADO,
                    allOptions.EM_ANDAMENTO,
                    allOptions.CANCELADO,
                    allOptions.SOLICITADO
                ];

            case 'EM_ANDAMENTO':
                // Se já saiu, só pode Finalizar.
                return [
                    allOptions.EM_ANDAMENTO,
                    allOptions.FINALIZADO
                ];

            case 'FINALIZADO':
            case 'CANCELADO':
            case 'RECUSADO':
            case 'NAO_INICIADO':
            case 'EXPIRADO':
                // Estados finais geralmente não mudam, mas deixamos o próprio para visualização
                return [{ label: currentStatus, value: currentStatus }];

            default:
                // Fallback: mostra tudo se der erro de lógica
                return Object.values(allOptions);
        }
    }

    public customPatterns = {
      'P': { pattern: new RegExp('[a-zA-Z\u00C0-\u00FF ]') }
    };

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private service: Schedule2Service,
        private driverService: DriverService,
        private vehicleService: VehicleService,
        private storageService: StoragesService,
        private datePipe: DatePipe,
    ) { }

    ngOnInit(): void {
        this.user = this.storageService.getUser();

        // VERIFICA PERMISSÃO
        this.canWrite = this.storageService.validateUserPermission("SCHEDULE_WRITE");

        // VERIFICA SE É EDIÇÃO (ID na URL) OU CRIAÇÃO
        this.route.queryParams.subscribe(params => {
            if (params['id']) {
                this.isEditMode = true;
                this.loadScheduleForEdit(params['id']);
            } else {
                // Se não é edição, verifica se veio da tela de consulta
                this.handleCreateFromConsult();

                // Se for criação e NÃO tiver permissão, desabilita driver e status por padrão
                if (!this.canWrite) {
                    this.validateForm.get('driver')?.disable();
                    this.validateForm.get('vehicle')?.disable();
                    this.validateForm.get('status')?.disable();
                }
            }
        });
    }

    // --- LÓGICA DE EDIÇÃO ---
    loadScheduleForEdit(id: number) {
        this.service.getSchedulesById(id).subscribe({
            next: (res: Schedule2) => {
                this.schedule = res;

                // Converter strings para Date (para os componentes visuais)
                const dtInicio = res.startDate ? new Date(res.startDate + 'T00:00:00') : null;
                const dtFim = res.endDate ? new Date(res.endDate + 'T00:00:00') : null;
                const timeStart = this.createDateFromTime(res.startTime);
                const timeEnd = this.createDateFromTime(res.endTime);

                // Preencher formulário
                this.validateForm.patchValue({
                    startDate: dtInicio,
                    endDate: dtFim,
                    startTime: timeStart,
                    endTime: timeEnd,
                    passengersAmount: res.passengersAmount,
                    personInChargeName: res.personInChargeName,
                    personInChargePhone: Number(res.personInChargePhone),
                    arrival: res.arrival,
                    departure: res.departure,
                    vehicle: res.vehicle,
                    driver: res.driver,
                    status: res.status // Carrega o status atual
                });

                // Carregar listas (apenas se tiver datas válidas) para permitir trocar motorista se for admin
                if (res.startDate && res.endDate) {
                    this.updateAvailability(res.startDate, res.endDate);
                }

                // TRAVAR CAMPOS QUE NÃO PODEM MUDAR NA EDIÇÃO
                this.lockFieldsForEditing();
            },
            error: (err) => console.error('Erro ao carregar agendamento', err)
        });
    }

    lockFieldsForEditing() {
        // Lista de campos imutáveis na edição
        const fieldsToLock = [
            'startDate', 'endDate', 'startTime', 'endTime',
            'arrival', 'departure', 'passengersAmount',
            'vehicle', 'personInChargeName', 'personInChargePhone', 
            'requestUser', 'driver', 'vehicle', 'status'
        ];

        fieldsToLock.forEach(field => {
            this.validateForm.get(field)?.disable();
        });
        
        if(!this.canWrite || this.statusFinais.includes(this.schedule.status)){
            // Se for usuário comum editando, ou se já estiver nos status finais, trava tudo
            return;
        }

        this.validateForm.get('driver')?.enable();
        this.validateForm.get('vehicle')?.enable();
        this.validateForm.get('status')?.enable();
    }

    // --- LÓGICA DE CRIAÇÃO (Via Consulta) ---
    handleCreateFromConsult() {
        const navState = history.state;
        if (navState && navState.vehicle && navState.dates) {
            const startStr = navState.dates.start;
            const endStr = navState.dates.end;
            const dtInicio = new Date(startStr + 'T00:00:00');
            const dtFim = new Date(endStr + 'T00:00:00');

            this.validateForm.patchValue({
                startDate: dtInicio,
                endDate: dtFim,
                vehicle: navState.vehicle,
                passengersAmount: navState.vehicle.passengersAmount
            });

            this.updateAvailability(startStr, endStr);
        }
    }

    // --- DEFINIÇÃO DO FORMULÁRIO ---
    validateForm = this.formBuilder.group({
        startDate: this.formBuilder.control<Date | null>(null, [Validators.required]),
        endDate: this.formBuilder.control<Date | null>(null, [Validators.required]),
        startTime: this.formBuilder.control<Date | null>(null),
        endTime: this.formBuilder.control<Date | null>(null),

        arrival: this.formBuilder.control<string | null>(null),
        departure: this.formBuilder.control<string | null>(null),
        personInChargeName: this.formBuilder.control<string | null>(null),
        personInChargePhone: this.formBuilder.control<number | null>(null),
        passengersAmount: this.formBuilder.control<number | null>(null, Validators.required),

        vehicle: this.formBuilder.control<Vehicle | null>(null, Validators.required),
        driver: this.formBuilder.control<Driver | null>(null),
        requestUser: this.formBuilder.control<User | null>(this.user),

        status: this.formBuilder.control<string>('SOLICITADO', Validators.required)
    }, { validators: this.dateRangeValidator });


    // --- MÉTODOS AUXILIARES ---

    createDateFromTime(timeStr: string | null): Date | null {
        if (!timeStr) return null;
        const d = new Date();
        const [hours, minutes] = timeStr.split(':');
        d.setHours(+hours);
        d.setMinutes(+minutes);
        d.setSeconds(0);
        return d;
    }

    dateRangeValidator(group: AbstractControl): ValidationErrors | null {
        const start = group.get('startDate')?.value;
        const end = group.get('endDate')?.value;
        if (start && end && start > end) return { dateRange: true };
        return null;
    }

    compareFn = (o1: any, o2: any) => (o1 && o2 ? o1.id === o2.id : o1 === o2);
    changeStartDate(date: Date): void { this.checkAndSearch(); }
    changeEndDate(date: Date): void { this.checkAndSearch(); }

    checkAndSearch() {
        const start = this.validateForm.get('startDate')?.value;
        const end = this.validateForm.get('endDate')?.value;
        
        if (start && end && !this.validateForm.hasError('dateRange')) {
            const sDate = this.datePipe.transform(start, "yyyy-MM-dd");
            const eDate = this.datePipe.transform(end, "yyyy-MM-dd");
        
            if (sDate && eDate) this.updateAvailability(sDate, eDate);
        } else {
            this.areDatesSelected = false;
            this.vehiclesList = [];
            this.driversList = [];
        }
    }

    updateAvailability(startStr: string | null, endStr: string | null): void {
        if (!startStr || !endStr) return; // Proteção contra nulos

        this.areDatesSelected = true;
        this.vehicleService.getAvailable(startStr, endStr).subscribe({ next: (res) => this.vehiclesList = res });
        this.driverService.getAvailable(startStr, endStr).subscribe({ next: (res) => this.driversList = res });
    }

    changeDriver(driver: Driver) { }
    changeVehicle(vehicle: Vehicle) { }


    // --- SUBMISSÃO E SALVAMENTO ---

    validInput(ignoredEvent?: any) {
        if (this.validateForm.invalid) {
            Object.values(this.validateForm.controls).forEach(control => {
                if (control.invalid) {
                    control.markAsDirty();
                    control.updateValueAndValidity({ onlySelf: true });
                }
            });
            return;
        }

        // IMPORTANTE: getRawValue() recupera até os campos disabled (travados na edição)
        const formValues = this.validateForm.getRawValue();

        // LÓGICA DO STATUS
        let statusFinal = formValues.status; // Pega o que está no form (pode ter sido editado pelo Admin)

        // Se for CRIAÇÃO (não edição), aplicamos a regra automática
        if (!this.isEditMode) {
            if (this.canWrite) {
                statusFinal = 'AGENDADO'; // Admin já cria aprovado
            } else {
                statusFinal = 'SOLICITADO'; // Comum cria pendente
            }
        }

        const newSchedule: Schedule2 = {
            ...this.schedule, // Mantém ID e outros dados originais

            // Dados do formulário
            passengersAmount: formValues.passengersAmount || 0,
            personInChargeName: formValues.personInChargeName || '',
            personInChargePhone: formValues.personInChargePhone?.toString() || '',
            arrival: formValues.arrival || '',
            departure: formValues.departure || '',
            status: statusFinal,

            // Relacionamentos
            requestUser: this.schedule.requestUser || this.user,
            vehicle: formValues.vehicle!,
            driver: formValues.driver || undefined, // undefined se nulo

            // Conversões para Backend
            startDate: this.datePipe.transform(formValues.startDate, "yyyy-MM-dd")!,
            endDate: this.datePipe.transform(formValues.endDate, "yyyy-MM-dd")!,
            startTime: this.datePipe.transform(formValues.startTime, "HH:mm")!,
            endTime: this.datePipe.transform(formValues.endTime, "HH:mm")!,

            processNumber: this.schedule.processNumber || ''
        } as Schedule2;

        this.saveSchedule(newSchedule);
    }

    saveSchedule(scheduleToSave: Schedule2) {
        this.service.saveSchedule(scheduleToSave).subscribe({
            next: (res) => {
                // Sucesso
            },
            complete: () => {
                this.router.navigate(['/schedules']);
            },
            error: (err) => console.error(err)
        });
    }
}