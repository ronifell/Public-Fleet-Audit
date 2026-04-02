import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  Component,
  HostListener,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';

interface MotorResult {
  id: number;
  transacaoId: string;
  transacaoTimestamp: string;
  placa: string;
  postoLat: number;
  postoLng: number;
  volumeLitros: number;
  valorTotal: number;
  glosaStatus: string;
  observacao: string;
  integrityHash: string;
}

interface Supply {
  id: number;
  cod_transaction: string;
  transaction_date: string;
  license_plate: string;
  driver_name: string;
  liters: number;
  emission_value: number;
  cidade: string;
  integrityHash: string;
}

interface DemoData {
  abastecimentos: Supply[];
  resultados_motor_glosa: MotorResult[];
  resumo_dashboard: {
    economia_gerada: number;
    valor_total_transacoes: number;
    valor_glosado: number;
    total_transacoes: number;
  };
}

interface IntegrityRow {
  id: number;
  date: string;
  department: string;
  plate: string;
  liters: number;
  amount: number;
  providedHash: string;
  calculatedHash: string;
  verified: boolean;
}

@Component({
  selector: 'app-milestone1-demo',
  templateUrl: './milestone1-demo.component.html',
  styleUrls: ['./milestone1-demo.component.scss'],
})
export class Milestone1DemoComponent implements OnInit, AfterViewInit, OnDestroy {
  private static readonly bodyDarkClass = 'milestone1-demo-dark';

  loading = true;
  activeTab: 'dashboard' | 'mapa' | 'integridade' = 'dashboard';
  darkMode = false;

  demoData?: DemoData;
  map?: L.Map;
  mapReady = false;
  selectedMapRecord?: MotorResult;
  pinDetailModalVisible = false;
  pinDetailRecord?: MotorResult;
  viewportRecords: MotorResult[] = [];
  integrityRows: IntegrityRow[] = [];
  departmentFilter = 'all';
  dateFilter = '';

  /** Matches SCSS `@media (max-width: 640px)` — stacked cards instead of the fixed-width table. */
  integrityMobileLayout = false;

  constructor(
    private readonly http: HttpClient,
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly renderer: Renderer2,
    private readonly ngZone: NgZone
  ) {}

  async ngOnInit(): Promise<void> {
    this.refreshIntegrityMobileLayout();
    this.http.get<DemoData>('assets/mock/auditoria_motor_exemplo.json').subscribe({
      next: async (data) => {
        this.demoData = data;
        this.selectedMapRecord = data.resultados_motor_glosa[0];
        this.viewportRecords = data.resultados_motor_glosa;
        this.integrityRows = await this.buildIntegrityRows(data);
        this.loading = false;
        setTimeout(() => this.initializeMap(), 0);
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  ngAfterViewInit(): void {
    this.refreshIntegrityMobileLayout();
    this.initializeMap();
  }

  ngOnDestroy(): void {
    this.destroyMap();
    this.renderer.removeClass(this.document.body, Milestone1DemoComponent.bodyDarkClass);
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.refreshIntegrityMobileLayout();
  }

  private refreshIntegrityMobileLayout(): void {
    const next = typeof window !== 'undefined' && window.innerWidth <= 640;
    if (next !== this.integrityMobileLayout) {
      this.integrityMobileLayout = next;
    }
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    if (this.darkMode) {
      this.renderer.addClass(this.document.body, Milestone1DemoComponent.bodyDarkClass);
    } else {
      this.renderer.removeClass(this.document.body, Milestone1DemoComponent.bodyDarkClass);
    }
  }

  setTab(tab: 'dashboard' | 'mapa' | 'integridade'): void {
    if (this.activeTab === 'mapa' && tab !== 'mapa') {
      this.destroyMap();
    }

    this.activeTab = tab;
    if (tab === 'mapa') {
      setTimeout(() => {
        this.initializeMap();
        this.map?.invalidateSize();
        this.renderViewportMarkers();
      }, 150);
    }
  }

  get totalLiters(): number {
    return (this.demoData?.abastecimentos || []).reduce((acc, item) => acc + item.liters, 0);
  }

  get totalFleet(): number {
    return 3150;
  }

  get grossSpending(): number {
    return this.demoData?.resumo_dashboard.valor_total_transacoes || 0;
  }

  get actualSpending(): number {
    return this.grossSpending - this.totalSavings;
  }

  get totalSavings(): number {
    return this.demoData?.resumo_dashboard.economia_gerada || 0;
  }

  get savingsPercent(): number {
    if (!this.grossSpending) {
      return 0;
    }
    return (this.totalSavings / this.grossSpending) * 100;
  }

  get topIrregularities(): Array<{ name: string; value: number }> {
    const source = this.demoData?.resultados_motor_glosa || [];
    const byDepartment = new Map<string, number>();
    source.forEach((row, index) => {
      const key = this.mockDepartment(index);
      if (row.glosaStatus !== 'APROVADO') {
        byDepartment.set(key, (byDepartment.get(key) || 0) + 1);
      }
    });
    return Array.from(byDepartment.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }

  get filteredIntegrityRows(): IntegrityRow[] {
    return this.integrityRows.filter((row) => {
      const byDepartment = this.departmentFilter === 'all' || row.department === this.departmentFilter;
      const byDate = !this.dateFilter || row.date.startsWith(this.dateFilter);
      return byDepartment && byDate;
    });
  }

  get departments(): string[] {
    return Array.from(new Set(this.integrityRows.map((row) => row.department)));
  }

  getMapDistanceMeters(record: MotorResult): number {
    // Simula GPS do veiculo deslocado em relacao ao posto.
    const vehicleLat = record.postoLat + (record.id % 2 ? 0.0028 : 0.0095);
    const vehicleLng = record.postoLng + (record.id % 2 ? 0.0015 : 0.009);
    return this.haversineMeters(record.postoLat, record.postoLng, vehicleLat, vehicleLng);
  }

  isAutomaticDeduction(record: MotorResult): boolean {
    return this.getMapDistanceMeters(record) > 500;
  }

  /** Same text previously shown on the polyline tooltip; now shown in the map corner overlay. */
  getMapTooltipText(record: MotorResult): string {
    const distance = this.getMapDistanceMeters(record);
    return this.isAutomaticDeduction(record)
      ? `Dedução automática – ${Math.round(distance)} m`
      : `Dentro do limite – ${Math.round(distance)} m`;
  }

  selectRecord(record: MotorResult): void {
    this.selectedMapRecord = record;
    if (this.activeTab === 'mapa') {
      const vehicleLat = record.postoLat + (record.id % 2 ? 0.0028 : 0.0095);
      const vehicleLng = record.postoLng + (record.id % 2 ? 0.0015 : 0.009);
      this.map?.panTo([vehicleLat, vehicleLng], { animate: true, duration: 0.6 });
      this.renderViewportMarkers();
    }
  }

  openPinDetailModal(record: MotorResult): void {
    this.pinDetailRecord = record;
    this.pinDetailModalVisible = true;
  }

  closePinDetailModal(): void {
    this.pinDetailModalVisible = false;
  }

  exportMockPdf(): void {
    const rows = this.filteredIntegrityRows
      .map(
        (row) =>
          `<tr><td>${row.date}</td><td>${row.department}</td><td>${row.plate}</td><td>${row.liters}</td><td>R$ ${row.amount.toFixed(
            2
          )}</td><td>${row.calculatedHash}</td><td>${row.verified ? 'Verificado / imutável' : 'Em revisão'}</td></tr>`
      )
      .join('');
    const html = `
      <html><head><title>Relatório de integridade SIG-Frota</title></head><body>
      <h2>Relatório de integridade – Painel de auditoria (PDF simulado)</h2>
      <table border="1" cellpadding="6" cellspacing="0">
      <tr><th>Data</th><th>Departamento</th><th>Placa</th><th>Litros</th><th>Valor</th><th>SHA-256</th><th>Situação</th></tr>
      ${rows}
      </table>
      <p><strong>Declaração de integridade:</strong> todas as linhas incluem simulação de hash SHA-256 para auditoria de imutabilidade.</p>
      </body></html>
    `;
    const popup = window.open('', '_blank');
    if (popup) {
      popup.document.write(html);
      popup.document.close();
      popup.print();
    }
  }

  private initializeMap(): void {
    if (!this.demoData || this.mapReady || !document.getElementById('milestone-map')) {
      return;
    }
    this.map = L.map('milestone-map', { zoomControl: true }).setView([-15.601411, -56.097892], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> (contribuintes)',
    }).addTo(this.map);

    this.map.on('moveend', () => this.renderViewportMarkers());
    this.renderViewportMarkers();
    this.mapReady = true;
  }

  private destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
    this.mapReady = false;
  }

  private renderViewportMarkers(): void {
    if (!this.map || !this.demoData) {
      return;
    }

    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        this.map?.removeLayer(layer);
      }
    });

    const bounds = this.map.getBounds();
    this.viewportRecords = this.demoData.resultados_motor_glosa.filter((record) =>
      bounds.contains(L.latLng(record.postoLat, record.postoLng))
    );
    const dataToRender = this.viewportRecords.length ? this.viewportRecords : this.demoData.resultados_motor_glosa;

    dataToRender.forEach((record) => {
      const vehicleLat = record.postoLat + (record.id % 2 ? 0.0028 : 0.0095);
      const vehicleLng = record.postoLng + (record.id % 2 ? 0.0015 : 0.009);
      const distance = this.haversineMeters(record.postoLat, record.postoLng, vehicleLat, vehicleLng);
      const automaticDeduction = distance > 500;
      const isSelected = this.selectedMapRecord?.id === record.id;
      const color = automaticDeduction ? '#d7263d' : '#1f8b4c';

      const postoIcon = L.divIcon({ className: 'marker marker-posto', html: '<span>⛽</span>', iconSize: [26, 26] });
      const assetHtml = isSelected
        ? '<span class="asset-pin asset-pin-selected" title="Ativo / equipamento" aria-label="Ativo / equipamento">A/E</span>'
        : '<span class="asset-pin" title="Ativo / equipamento" aria-label="Ativo / equipamento">A/E</span>';
      const assetIcon = L.divIcon({
        className: 'marker marker-asset',
        html: assetHtml,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      L.marker([record.postoLat, record.postoLng], { icon: postoIcon }).addTo(this.map!);
      const assetMarker = L.marker([vehicleLat, vehicleLng], { icon: assetIcon }).addTo(this.map!);
      assetMarker.on('click', () => {
        this.ngZone.run(() => {
          this.selectRecord(record);
          this.openPinDetailModal(record);
        });
      });

      const line = L.polyline(
        [
          [record.postoLat, record.postoLng],
          [vehicleLat, vehicleLng],
        ],
        { color, weight: 3, dashArray: automaticDeduction ? '8 6' : undefined }
      ).addTo(this.map!);
    });
  }

  private async buildIntegrityRows(data: DemoData): Promise<IntegrityRow[]> {
    const rows = await Promise.all(
      data.abastecimentos.map(async (item, index) => {
        const payload = `${item.cod_transaction}|${item.transaction_date}|${item.license_plate}|${item.driver_name}|${item.liters}|${item.emission_value}`;
        const calculatedHash = await this.sha256(payload);
        const providedHash = item.integrityHash || '';
        return {
          id: item.id,
          date: item.transaction_date.slice(0, 10),
          department: this.mockDepartment(index),
          plate: item.license_plate,
          liters: item.liters,
          amount: item.emission_value,
          providedHash,
          calculatedHash,
          verified: !!providedHash,
        };
      })
    );
    return rows;
  }

  private async sha256(value: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private mockDepartment(index: number): string {
    const departments = ['Operações', 'Saúde', 'Educação', 'Infraestrutura', 'Administração'];
    return departments[index % departments.length];
  }

  private haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
