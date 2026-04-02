import { Component, OnInit } from '@angular/core';
import { Schedule2 } from 'src/app/model/schedule2';
import { User } from 'src/app/model/user';
import { Schedule2Service } from 'src/app/service/schedule2.service';
import { StoragesService } from 'src/app/service/storages.service';

@Component({
    selector: 'app-scheduling',
    templateUrl: './scheduling.component.html',
    styleUrls: ['./scheduling.component.css']
})
export class SchedulingComponent implements OnInit {

    constructor(
        private service: Schedule2Service,
        private storagesService: StoragesService,
    ) { }

    // Variáveis atualizadas para Schedule2
    schedules: Schedule2[] = [];
    cards: Schedule2[] = [];
    user: User = <User>{};

    // Dicionário para pintar o calendário
    dates: datesData = {};

    selectedDate: Date = new Date();
    lastSelectedDate: number = 0;
    lastSelectedMonth: number = 0;

    canShowDates: boolean = false;
    canShowCards: boolean = false;
    isAdmin: boolean = false;

    ngOnInit(): void {
        const currDate = new Date();
        // Gera as strings para buscar o mês atual e o próximo (ex: 2023-10-01 e 2023-12-01)
        let [dateStr1, dateStr2] = this.generateDatesStrings(currDate);

        this.lastSelectedMonth = currDate.getMonth();

        // 1. Define Permissões e Usuário Atual
        this.isAdmin = this.storagesService.validateUserPermission("ADMIN");
        this.user = this.storagesService.getUser();

        // 2. Busca inicial
        this.getDates(dateStr1, dateStr2);
    }


    // Busca agendamentos no backend (Lógica condicional ADMIN vs COMUM)
    getDates(firstDate: string, secondDate: string) {

        if (this.isAdmin) {
            // Cenário 1: ADMIN - Busca TODOS os agendamentos do período
            this.service.getPeriodSchedules(firstDate, secondDate).subscribe({
                next: (response: Schedule2[]) => {
                    this.schedules = response;
                },
                complete: () => {
                    this.createDict();
                },
                error: (err) => console.error(err)
            });

        } else {
            // Cenário 2: USUÁRIO COMUM - Busca APENAS OS SEUS agendamentos
            if (this.user && this.user.id) {
                this.service.getPeriodSchedulesByUserId(firstDate, secondDate, this.user.id).subscribe({
                    next: (response: Schedule2[]) => {
                        this.schedules = response;
                    },
                    complete: () => {
                        this.createDict();
                    },
                    error: (err) => console.error(err)
                });
            }
        }
    }

    /**
     * Cria o dicionário que mapeia "Mês-Dia" -> Lista de Agendamentos
     * Usado para exibir as bolinhas (badges) no calendário
     */
    createDict() {
        this.dates = {};

        this.schedules.forEach((schedule) => {
            // Mapeia data de ida
            if (schedule.startDate) {
                this.createDateValues(schedule, schedule.startDate, 'success');
            }
            // Mapeia data de volta
            if (schedule.endDate) {
                this.createDateValues(schedule, schedule.endDate, 'error'); // error = vermelho
            }
        });

        this.canShowDates = true;
    }

    /**
     * Lógica corrigida para processar a string 'yyyy-MM-dd'
     */
    createDateValues(schedule: Schedule2, dateString: string, type: 'success' | 'error') {
        if (!dateString) return;

        // dateString vem como "2025-10-25"
        const parts = dateString.split('-'); // [0]=ano, [1]=mês, [2]=dia

        const year = parseInt(parts[0]);
        const monthIndex = parseInt(parts[1]) - 1; // JS meses são 0-11
        const day = parseInt(parts[2]);

        let strIndex = `${monthIndex}-${day}`;

        if (!(this.dates.hasOwnProperty(strIndex))) {
            this.dates[strIndex] = [];
        }

        // Adiciona ao dicionário
        this.dates[strIndex].push({
            type: type,
            content: `${schedule.departure} -> ${schedule.arrival}` || 'Agend.', // Fallback se não tiver numero
            value: schedule
        });
    }

    /**
     * Quando o usuário muda o mês ou seleciona um dia
     */
    selectChange(selectedDate: Date) {
        // Se mudou de mês, recarrega os dados do servidor
        if (selectedDate.getMonth() != this.lastSelectedMonth) {
            this.lastSelectedMonth = selectedDate.getMonth();
            let [dateStr1, dateStr2] = this.generateDatesStrings(selectedDate);

            this.cards = [];
            this.canShowCards = false;
            this.canShowDates = false; // Esconde enquanto carrega

            this.getDates(dateStr1, dateStr2);
        } else {
            // Se clicou num dia do mesmo mês, mostra os detalhes (cards)
            this.cardsControl(selectedDate);
        }
    }


    // Controla a exibição dos Cards abaixo do calendário
    cardsControl(selectedDate: Date) {
        const dayClicked = selectedDate.getDate();

        // Lógica de Toggle: Se clicar no mesmo dia que já está aberto, fecha.
        if (this.lastSelectedDate == dayClicked && this.canShowCards) {
            this.canShowCards = false;
            return;
        }

        this.lastSelectedDate = dayClicked;
        this.cards = [];

        // Recupera do dicionário usando a mesma chave "Mês-Dia"
        const key = `${selectedDate.getMonth()}-${dayClicked}`;
        const dataList = this.dates[key];

        if (dataList && dataList.length > 0) {
            for (let item of dataList) {
                // Evita duplicatas visuais se for ida e volta no mesmo dia
                if (!this.cards.find(c => c.id === item.value.id)) {
                    this.cards.push(item.value);
                }
            }
            this.canShowCards = true;
        } else {
            this.canShowCards = false;
        }
    }

    // --- Auxiliar: Gera strings para API ---
    generateDatesStrings(date: Date) {
        const year = date.getFullYear();
        const month = date.getMonth(); // 0-11

        // Data 1: Primeiro dia do mês atual
        const startMonth = month + 1; // 1-12
        const startStr = `${year}-${startMonth.toString().padStart(2, '0')}-01`;

        // Data 2: Primeiro dia do mês seguinte + 1 (para pegar periodo cheio)
        // Lógica simples: vamos pegar até o final do próximo mês para garantir
        // Ou conforme sua lógica original: 2 meses pra frente

        // Usando Date do JS para somar meses sem dor de cabeça com virada de ano
        const nextDate = new Date(year, month + 2, 1);
        const endStr = `${nextDate.getFullYear()}-${(nextDate.getMonth() + 1).toString().padStart(2, '0')}-01`;

        return [startStr, endStr];
    }
}

type datesData = {
    [key: string]: { type: string, content: string, value: Schedule2 }[]
};