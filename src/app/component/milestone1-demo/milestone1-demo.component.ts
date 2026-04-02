import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
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

export type MilestoneHubView =
  | 'hub'
  | 'governance'
  | 'fuel-map'
  | 'fuel-integrity'
  | 'assets-map'
  | 'assets-report';

@Component({
  selector: 'app-milestone1-demo',
  templateUrl: './milestone1-demo.component.html',
  styleUrls: ['./milestone1-demo.component.scss'],
})
export class Milestone1DemoComponent implements OnInit, AfterViewInit, OnDestroy {
  private static readonly bodyDarkClass = 'milestone1-demo-dark';

  loading = true;
  /** Governance Center hub or a module screen */
  activeView: MilestoneHubView = 'hub';
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

  /** Pulsating skeleton while “heavy security query” runs after filter change */
  integrityFilterLoading = false;
  /** Increments after each filter settle to retrigger integrity scanner beam */
  integrityScanGeneration = 0;
  /** Toggles to force CSS animation restart on the integrity scanner overlay */
  integrityScannerReset = false;

  /** Animated KPI values on governance */
  displaySavings = 0;
  displayLiters = 0;
  private kpiAnimationFrame = 0;

  /** Bar / irregularity chart entrance */
  dashboardChartsAnimated = false;

  /** Modal: conservation % (mock), animated width */
  modalConservationTarget = 85;
  modalConservationDisplay = 0;
  private conservationRaf = 0;

  /** Photo scanner replay when opening modal */
  modalScannerKey = 0;
  modalPhotoScanReset = false;

  /** Matches SCSS `@media (max-width: 640px)` — stacked cards instead of the fixed-width table. */
  integrityMobileLayout = false;

  private integrityFilterDebounce?: ReturnType<typeof setTimeout>;

  /** Root-absolute path; file is PNG (ChatGPT export was mislabeled as .svg). */
  readonly logoSrc = '/assets/imagens/inovathec-logo.png';

  constructor(
    private readonly http: HttpClient,
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly renderer: Renderer2,
    private readonly ngZone: NgZone,
    private readonly cdr: ChangeDetectorRef
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
        setTimeout(() => this.ensureMapInitialized(), 0);
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  ngAfterViewInit(): void {
    this.refreshIntegrityMobileLayout();
    this.ensureMapInitialized();
  }

  ngOnDestroy(): void {
    this.destroyMap();
    if (this.integrityFilterDebounce) {
      clearTimeout(this.integrityFilterDebounce);
    }
    if (this.kpiAnimationFrame) {
      cancelAnimationFrame(this.kpiAnimationFrame);
    }
    if (this.conservationRaf) {
      cancelAnimationFrame(this.conservationRaf);
    }
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

  /** Fuel module: governance, geo audit, integrity */
  get isFuelModuleView(): boolean {
    return (
      this.activeView === 'governance' ||
      this.activeView === 'fuel-map' ||
      this.activeView === 'fuel-integrity'
    );
  }

  /** Assets module: map + report */
  get isAssetsModuleView(): boolean {
    return this.activeView === 'assets-map' || this.activeView === 'assets-report';
  }

  get moduleTitleLine(): string {
    switch (this.activeView) {
      case 'governance':
        return 'Siga Frota | Combustível — Monitoramento e Inteligência Fiscal';
      case 'fuel-map':
        return 'Siga Frota | Combustível — Georreferenciamento de Prova';
      case 'fuel-integrity':
        return 'Siga Frota | Combustível — Conformidade de Dados e Anti-Fraude';
      case 'assets-map':
        return 'Patrimônio Histórico | Inventário e Monitoramento';
      case 'assets-report':
        return 'Relatório de Patrimônio Histórico';
      default:
        return '';
    }
  }

  get moduleSubtitle(): string {
    if (this.isFuelModuleView) {
      return 'Auditoria, feixe de integridade e SHA-256 para imutabilidade dos dados.';
    }
    if (this.activeView === 'assets-report') {
      return 'Módulo de Integridade de Patrimônio — consolidação de bens tombados e validação documental.';
    }
    if (this.isAssetsModuleView) {
      return 'Patrimônio histórico — inventário, vistoria e monitoramento por georreferenciamento.';
    }
    return 'Centro de governança — Inovathec Soluções Ltda.';
  }

  goToHub(): void {
    if (this.activeView === 'fuel-map' || this.activeView === 'assets-map') {
      this.destroyMap();
    }
    this.activeView = 'hub';
    this.dashboardChartsAnimated = false;
  }

  setView(view: MilestoneHubView): void {
    if (
      (this.activeView === 'fuel-map' || this.activeView === 'assets-map') &&
      view !== 'fuel-map' &&
      view !== 'assets-map'
    ) {
      this.destroyMap();
    }

    this.activeView = view;

    if (view === 'governance') {
      this.queueKpiAnimation();
      setTimeout(() => {
        this.dashboardChartsAnimated = true;
        this.cdr.markForCheck();
      }, 80);
    } else {
      this.dashboardChartsAnimated = false;
    }

    if (view === 'fuel-map' || view === 'assets-map') {
      setTimeout(() => {
        this.ensureMapInitialized();
        this.map?.invalidateSize();
        this.renderViewportMarkers(view === 'assets-map');
      }, 150);
    }

    if (view === 'fuel-integrity') {
      this.triggerIntegrityScan();
    }
  }

  onIntegrityFilterInteraction(): void {
    if (this.integrityFilterDebounce) {
      clearTimeout(this.integrityFilterDebounce);
    }
    this.integrityFilterLoading = true;
    this.integrityFilterDebounce = setTimeout(() => {
      this.integrityFilterLoading = false;
      this.triggerIntegrityScan();
      this.cdr.markForCheck();
    }, 550);
  }

  private triggerIntegrityScan(): void {
    this.integrityScanGeneration++;
    this.integrityScannerReset = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.integrityScannerReset = false;
      this.cdr.markForCheck();
    }, 40);
  }

  private queueKpiAnimation(): void {
    const targetS = this.totalSavings;
    const targetL = this.totalLiters;
    this.displaySavings = 0;
    this.displayLiters = 0;
    if (this.kpiAnimationFrame) {
      cancelAnimationFrame(this.kpiAnimationFrame);
    }
    const duration = 1200;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      this.displaySavings = targetS * ease;
      this.displayLiters = targetL * ease;
      this.cdr.markForCheck();
      if (t < 1) {
        this.kpiAnimationFrame = requestAnimationFrame(tick);
      } else {
        this.displaySavings = targetS;
        this.displayLiters = targetL;
        this.cdr.markForCheck();
      }
    };
    this.kpiAnimationFrame = requestAnimationFrame(tick);
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

  /** Width % for animated ROI bars (0 until dashboardChartsAnimated) */
  get roiGrossBarPercent(): number {
    return this.dashboardChartsAnimated ? 100 : 0;
  }

  get roiActualBarPercent(): number {
    if (!this.grossSpending) {
      return 0;
    }
    const p = (this.actualSpending / this.grossSpending) * 100;
    return this.dashboardChartsAnimated ? p : 0;
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

  /** Irregularity row bar length (mock scale max 10) */
  irregularityBarPercent(item: { value: number }): number {
    const max = Math.max(...this.topIrregularities.map((i) => i.value), 1);
    return this.dashboardChartsAnimated ? (item.value / max) * 100 : 0;
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

  get auditTickerFuel(): string {
    const parts: string[] = [];
    this.filteredIntegrityRows.slice(0, 6).forEach((row) => {
      const shortHash = row.calculatedHash.slice(0, 8).toUpperCase();
      parts.push(`[${row.plate}] SHA-256 verificado (${shortHash})…`);
      const m = 200 + (row.id * 37) % 400;
      parts.push(`[${row.plate}] Local validado (${m}m)…`);
    });
    if (!parts.length) {
      return '[SISTEMA] Aguardando registros de auditoria…';
    }
    return parts.join('   •   ');
  }

  get auditTickerAssets(): string {
    const labels = ['PREDIO-01', 'MONUMENTO-05', 'SITIO-03', 'MUSEU-07', 'CENTRO-12'];
    const items = (this.demoData?.resultados_motor_glosa || []).slice(0, 4);
    const parts: string[] = [];
    items.forEach((r, i) => {
      const tag = labels[i % labels.length];
      parts.push(`[${tag}] Localização confirmada — tombo ${r.placa}…`);
      parts.push(`[${tag}] Registro auditado — SHA-256 (cadeia de integridade)…`);
    });
    return parts.join('   •   ') || '[PATRIMÔNIO] Monitoramento em tempo real…';
  }

  get auditTickerText(): string {
    if (this.activeView === 'assets-map' || this.activeView === 'assets-report') {
      return this.auditTickerAssets;
    }
    return this.auditTickerFuel;
  }

  getMapDistanceMeters(record: MotorResult): number {
    const vehicleLat = record.postoLat + (record.id % 2 ? 0.0028 : 0.0095);
    const vehicleLng = record.postoLng + (record.id % 2 ? 0.0015 : 0.009);
    return this.haversineMeters(record.postoLat, record.postoLng, vehicleLat, vehicleLng);
  }

  isAutomaticDeduction(record: MotorResult): boolean {
    return this.getMapDistanceMeters(record) > 500;
  }

  /** Operational / “validated” → green sonar pulse on asset map */
  isAssetOperational(record: MotorResult): boolean {
    return record.glosaStatus === 'APROVADO' && !this.isAutomaticDeduction(record);
  }

  getMapTooltipText(record: MotorResult): string {
    const distance = this.getMapDistanceMeters(record);
    const m = Math.round(distance);
    if (this.activeView === 'assets-map') {
      return this.isAutomaticDeduction(record)
        ? `Fora do perímetro delimitado – ${m} m`
        : `Localização confirmada – ${m} m (dentro da área delimitada)`;
    }
    return this.isAutomaticDeduction(record)
      ? `Dedução automática – ${m} m`
      : `Dentro do limite – ${m} m`;
  }

  /** Índice simulado de conservação para o painel de patrimônio (demo). */
  patrimonyConservationPercent(record: MotorResult): string {
    const p = 62 + (record.id * 13) % 34;
    return `${p}% (índice simulado)`;
  }

  patrimonyLocationStatusMessage(record: MotorResult): string {
    if (this.isAutomaticDeduction(record)) {
      return 'Fora da área delimitada — verificar deslocamento do bem.';
    }
    return 'Localização confirmada — dentro da área delimitada.';
  }

  selectRecord(record: MotorResult): void {
    this.selectedMapRecord = record;
    if (this.activeView === 'fuel-map' || this.activeView === 'assets-map') {
      const vehicleLat = record.postoLat + (record.id % 2 ? 0.0028 : 0.0095);
      const vehicleLng = record.postoLng + (record.id % 2 ? 0.0015 : 0.009);
      this.map?.panTo([vehicleLat, vehicleLng], { animate: true, duration: 0.6 });
      this.renderViewportMarkers(this.activeView === 'assets-map');
    }
  }

  openPinDetailModal(record: MotorResult): void {
    this.pinDetailRecord = record;
    this.modalConservationTarget = 65 + (record.id * 17) % 35;
    this.modalConservationDisplay = 0;
    this.modalScannerKey++;
    this.modalPhotoScanReset = true;
    this.pinDetailModalVisible = true;
    if (this.conservationRaf) {
      cancelAnimationFrame(this.conservationRaf);
    }
    setTimeout(() => {
      this.modalPhotoScanReset = false;
      this.cdr.markForCheck();
    }, 40);
    setTimeout(() => this.animateConservationBar(), 120);
  }

  private animateConservationBar(): void {
    const target = this.modalConservationTarget;
    const t0 = performance.now();
    const dur = 900;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      const ease = 1 - Math.pow(1 - t, 2);
      this.modalConservationDisplay = target * ease;
      this.cdr.markForCheck();
      if (t < 1) {
        this.conservationRaf = requestAnimationFrame(step);
      } else {
        this.modalConservationDisplay = target;
        this.cdr.markForCheck();
      }
    };
    this.conservationRaf = requestAnimationFrame(step);
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

  /** Creates the Leaflet map once the container exists (fuel / assets tab). */
  private ensureMapInitialized(): void {
    const mapId = 'milestone-map';
    if (!this.demoData || !document.getElementById(mapId)) {
      return;
    }
    if (this.activeView !== 'fuel-map' && this.activeView !== 'assets-map') {
      return;
    }
    if (this.mapReady && this.map) {
      return;
    }
    this.map = L.map(mapId, { zoomControl: true }).setView([-15.601411, -56.097892], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> (contribuintes)',
    }).addTo(this.map);

    this.map.on('moveend', () => this.renderViewportMarkers(this.activeView === 'assets-map'));
    this.renderViewportMarkers(this.activeView === 'assets-map');
    this.mapReady = true;
  }

  private destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
    this.mapReady = false;
  }

  private renderViewportMarkers(assetMode: boolean): void {
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

    dataToRender.forEach((record, idx) => {
      const vehicleLat = record.postoLat + (record.id % 2 ? 0.0028 : 0.0095);
      const vehicleLng = record.postoLng + (record.id % 2 ? 0.0015 : 0.009);
      const distance = this.haversineMeters(record.postoLat, record.postoLng, vehicleLat, vehicleLng);
      const automaticDeduction = distance > 500;
      const isSelected = this.selectedMapRecord?.id === record.id;
      const color = automaticDeduction ? '#d7263d' : '#1f8b4c';

      const postoGlyph = assetMode ? this.patrimonyReferenceIcon(idx) : '⛽';
      const postoIcon = L.divIcon({
        className: 'marker marker-posto',
        html: `<span>${postoGlyph}</span>`,
        iconSize: [26, 26],
      });
      const op = this.isAssetOperational(record);
      const pulseClass = assetMode && op ? ' asset-pulse' : '';
      const dropClass = assetMode ? ' asset-drop' : '';
      const assetLabel = assetMode ? this.assetIconLabel(idx) : 'A/E';
      const pinTitle = assetMode ? 'Bem patrimonial' : 'Ativo / equipamento';
      const assetHtml = isSelected
        ? `<span class="asset-pin asset-pin-selected${pulseClass}${dropClass}" style="animation-delay:${idx * 0.07}s" title="${pinTitle}" aria-label="${pinTitle}">${assetLabel}</span>`
        : `<span class="asset-pin${pulseClass}${dropClass}" style="animation-delay:${idx * 0.07}s" title="${pinTitle}" aria-label="${pinTitle}">${assetLabel}</span>`;
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

      L.polyline(
        [
          [record.postoLat, record.postoLng],
          [vehicleLat, vehicleLng],
        ],
        { color, weight: 3, dashArray: automaticDeduction ? '8 6' : undefined }
      ).addTo(this.map!);
    });
  }

  private assetIconLabel(index: number): string {
    const icons = ['🏛', '🏢', '📍', '⛪', '🗿'];
    return icons[index % icons.length];
  }

  /** Ponto de referência no mapa de patrimônio (sem posto de combustível). */
  private patrimonyReferenceIcon(index: number): string {
    const icons = ['🏛', '🏛', '📍', '⛪', '🏢'];
    return icons[index % icons.length];
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
