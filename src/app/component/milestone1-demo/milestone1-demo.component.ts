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
  UF?: string;
  nome_estabelecimento?: string;
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

interface ControlTowerToast {
  id: number;
  message: string;
  kind: 'ok' | 'info' | 'warn';
}

export type MilestoneHubView =
  | 'hub'
  | 'governance'
  | 'fuel-map'
  | 'fuel-integrity'
  | 'assets-map'
  | 'assets-report'
  | 'assets-timeline';

export type PatrimonyTimelineKind = 'tombamento' | 'cautela' | 'vistoria';

export interface PatrimonyTimelineEvent {
  id: string;
  kind: PatrimonyTimelineKind;
  title: string;
  detail: string;
  at: string;
  integrityHash: string;
  /** Quando true, “Comparar Hashes” acusa divergência neste evento */
  tampered?: boolean;
}

export interface PatrimonyChainRow {
  tombo: string;
  descricao: string;
  inpiRegistro: string;
  integrityHash: string;
  situacao: string;
}

export type TimelineCompareState = 'idle' | 'ok' | 'fail';

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
  displayGrossSpending = 0;
  displayActualSpending = 0;
  displaySavingsPercent = 0;
  private kpiAnimationFrame = 0;

  /** Torre de controle — toasts automáticos (canto superior direito) */
  controlTowerToasts: ControlTowerToast[] = [];
  private toastSeq = 0;
  private toastIntervalId?: ReturnType<typeof setInterval>;
  private toastTimeouts: ReturnType<typeof setTimeout>[] = [];

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

  /** Relatório de patrimônio — hodômetro com rolos (app-m1-odometer) */
  assetsReportCatalogedTotal = 0;
  assetsReportAuditTotal = 0;
  assetsKpiOdometerRollKey = 0;

  /** Aura na modal de ficha (patrimônio) ao abrir — ~2s */
  modalPatrimonyValidationFlash = false;

  /** Cobertura laser sobre filtros + tabela (auditoria em conformidade) */
  integrityLaserSweep = false;

  /** Mapa patrimônio — skeleton até primeiro paint dos dados */
  assetsMapDataSkeleton = true;

  /** Inventário — skeleton da cadeia SHA + INPI */
  assetsReportChainLoading = true;

  /** AP04 / INPI — leitor simulado (protótipo) */
  ap04ScannerOpen = false;
  ap04Scanning = false;
  ap04ShutterPulse = false;
  ap04PhotoCaptured = false;
  ap04PhotoFlash = false;
  ap04Saving = false;
  ap04LiveGps = '';
  ap04LiveTime = '';
  private ap04StampInterval?: ReturnType<typeof setInterval>;
  private ap04ScanDoneTimer?: ReturnType<typeof setTimeout>;

  /** Timeline — entrada escalonada e comparação de hashes */
  timelineRevealActive = false;
  timelineCompareState: TimelineCompareState = 'idle';
  private timelineCompareFailRound = false;

  private integrityFilterDebounce?: ReturnType<typeof setTimeout>;
  private assetsMapSkeletonTimer?: ReturnType<typeof setTimeout>;
  private assetsReportSkeletonTimer?: ReturnType<typeof setTimeout>;

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
        if (this.activeView === 'assets-report') {
          setTimeout(() => {
            this.triggerAssetsKpiOdometerRoll();
            this.cdr.markForCheck();
          }, 0);
        }
        if (this.activeView === 'governance') {
          this.queueKpiAnimation();
          setTimeout(() => {
            this.dashboardChartsAnimated = true;
            this.cdr.markForCheck();
          }, 80);
        }
        this.syncControlTowerToasts();
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
    this.clearControlTowerToasts();
    this.stopAp04LiveStamp();
    if (this.ap04ScanDoneTimer) {
      clearTimeout(this.ap04ScanDoneTimer);
    }
    if (this.integrityFilterDebounce) {
      clearTimeout(this.integrityFilterDebounce);
    }
    if (this.assetsMapSkeletonTimer) {
      clearTimeout(this.assetsMapSkeletonTimer);
    }
    if (this.assetsReportSkeletonTimer) {
      clearTimeout(this.assetsReportSkeletonTimer);
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

  /** Assets module: map, inventário e timeline */
  get isAssetsModuleView(): boolean {
    return (
      this.activeView === 'assets-map' ||
      this.activeView === 'assets-report' ||
      this.activeView === 'assets-timeline'
    );
  }

  get moduleTitleLine(): string {
    switch (this.activeView) {
      case 'governance':
        return 'Monitoramento e Inteligência Fiscal';
      case 'fuel-map':
        return 'Georreferenciamento de Prova';
      case 'fuel-integrity':
        return 'Conformidade e Anti-Fraude';
      case 'assets-map':
        return 'Vistoria e Censo (Fé Pública)';
      case 'assets-report':
        return 'Inventário e Tombamento';
      case 'assets-timeline':
        return 'Timeline de Auditoria (perícia digital)';
      default:
        return '';
    }
  }

  get moduleSubtitle(): string {
    if (this.isFuelModuleView) {
      return 'Auditoria, feixe de integridade e SHA-256 para imutabilidade dos dados.';
    }
    if (this.activeView === 'assets-report') {
      return 'SIG-PATRIMÔNIO — inventário, tombamento e trilha de integridade documental.';
    }
    if (this.activeView === 'assets-timeline') {
      return 'Histórico imutável do bem — INPI, AP04 distinto e cadeia SHA-256 auditável.';
    }
    if (this.isAssetsModuleView) {
      return 'SIG-PATRIMÔNIO — vistoria, censo e georreferenciamento para prova técnica.';
    }
    return 'Centro de governança — Inovathec Soluções Ltda.';
  }

  goToHub(): void {
    if (this.activeView === 'fuel-map' || this.activeView === 'assets-map') {
      this.destroyMap();
    }
    this.stopAp04LiveStamp();
    this.ap04ScannerOpen = false;
    this.ap04Scanning = false;
    this.activeView = 'hub';
    this.dashboardChartsAnimated = false;
    this.timelineRevealActive = false;
    this.syncControlTowerToasts();
  }

  playRipple(ev: MouseEvent): void {
    const el = ev.currentTarget as HTMLElement | null;
    if (!el) {
      return;
    }
    el.classList.remove('m1-ripple-active');
    void el.offsetWidth;
    el.classList.add('m1-ripple-active');
    window.setTimeout(() => el.classList.remove('m1-ripple-active'), 650);
  }

  setView(view: MilestoneHubView): void {
    if (
      (this.activeView === 'fuel-map' || this.activeView === 'assets-map') &&
      view !== 'fuel-map' &&
      view !== 'assets-map'
    ) {
      this.destroyMap();
    }

    if (this.assetsMapSkeletonTimer) {
      clearTimeout(this.assetsMapSkeletonTimer);
      this.assetsMapSkeletonTimer = undefined;
    }
    if (this.assetsReportSkeletonTimer) {
      clearTimeout(this.assetsReportSkeletonTimer);
      this.assetsReportSkeletonTimer = undefined;
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
      this.assetsMapDataSkeleton = true;
      setTimeout(() => {
        this.ensureMapInitialized();
        this.map?.invalidateSize();
        this.renderViewportMarkers(view === 'assets-map');
      }, 150);
      this.assetsMapSkeletonTimer = window.setTimeout(() => {
        this.assetsMapDataSkeleton = false;
        this.assetsMapSkeletonTimer = undefined;
        this.cdr.markForCheck();
      }, 700);
    } else {
      this.assetsMapDataSkeleton = false;
    }

    if (view === 'fuel-integrity') {
      this.triggerIntegrityScan();
    }

    if (view === 'assets-report' && this.demoData) {
      this.assetsReportChainLoading = true;
      setTimeout(() => {
        this.triggerAssetsKpiOdometerRoll();
        this.cdr.markForCheck();
      }, 0);
      this.assetsReportSkeletonTimer = window.setTimeout(() => {
        this.assetsReportChainLoading = false;
        this.assetsReportSkeletonTimer = undefined;
        this.cdr.markForCheck();
      }, 650);
    } else if (view !== 'assets-report') {
      this.assetsReportChainLoading = false;
    }

    if (view === 'assets-timeline') {
      this.timelineRevealActive = false;
      this.timelineCompareState = 'idle';
      window.setTimeout(() => {
        this.timelineRevealActive = true;
        this.cdr.markForCheck();
      }, 80);
    } else {
      this.timelineRevealActive = false;
    }

    this.syncControlTowerToasts();
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
    this.integrityLaserSweep = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.integrityScannerReset = false;
      this.cdr.markForCheck();
    }, 40);
    setTimeout(() => {
      this.integrityLaserSweep = false;
      this.cdr.markForCheck();
    }, 3600);
  }

  private queueKpiAnimation(): void {
    const targetS = this.totalSavings;
    const targetL = this.totalLiters;
    const targetG = this.grossSpending;
    const targetA = this.actualSpending;
    const targetP = this.savingsPercent;
    this.displaySavings = 0;
    this.displayLiters = 0;
    this.displayGrossSpending = 0;
    this.displayActualSpending = 0;
    this.displaySavingsPercent = 0;
    if (this.kpiAnimationFrame) {
      cancelAnimationFrame(this.kpiAnimationFrame);
    }
    const reduceMotion =
      typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      this.displaySavings = targetS;
      this.displayLiters = targetL;
      this.displayGrossSpending = targetG;
      this.displayActualSpending = targetA;
      this.displaySavingsPercent = targetP;
      this.cdr.markForCheck();
      return;
    }
    const duration = 2400;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      this.displaySavings = targetS * ease;
      this.displayLiters = targetL * ease;
      this.displayGrossSpending = targetG * ease;
      this.displayActualSpending = targetA * ease;
      this.displaySavingsPercent = targetP * ease;
      this.cdr.markForCheck();
      if (t < 1) {
        this.kpiAnimationFrame = requestAnimationFrame(tick);
      } else {
        this.displaySavings = targetS;
        this.displayLiters = targetL;
        this.displayGrossSpending = targetG;
        this.displayActualSpending = targetA;
        this.displaySavingsPercent = targetP;
        this.cdr.markForCheck();
      }
    };
    this.kpiAnimationFrame = requestAnimationFrame(tick);
  }

  private triggerAssetsKpiOdometerRoll(): void {
    if (!this.demoData) {
      return;
    }
    this.assetsReportCatalogedTotal = this.demoData.resultados_motor_glosa.length;
    this.assetsReportAuditTotal = this.demoData.abastecimentos.length;
    this.assetsKpiOdometerRollKey++;
    this.cdr.markForCheck();
  }

  scrollToSha256Footer(): void {
    const el = this.document.getElementById('m1-sha256-footer-anchor');
    el?.scrollIntoView({ behavior: 'smooth', block: 'end' });
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
    const supplies = this.demoData?.abastecimentos || [];
    supplies.forEach((s) => {
      parts.push(
        `[${s.license_plate}] R$ ${s.emission_value.toFixed(2)} · ${s.liters} L · ${s.cidade}/${s.UF ?? '—'}`
      );
      parts.push(`[${s.license_plate}] ${(s.nome_estabelecimento || 'Posto').slice(0, 22)}… confirmado`);
    });
    (this.demoData?.resultados_motor_glosa || []).forEach((r) => {
      parts.push(`[${r.placa}] Motor glosa: ${r.glosaStatus} · R$ ${r.valorTotal.toFixed(2)} · ${r.volumeLitros} L`);
    });
    this.filteredIntegrityRows.slice(0, 4).forEach((row) => {
      const shortHash = row.calculatedHash.slice(0, 8).toUpperCase();
      parts.push(`[${row.plate}] SHA-256 ${shortHash}… trilha ativa`);
    });
    if (!parts.length) {
      return '[SISTEMA] Aguardando registros de auditoria…';
    }
    return parts.join('      ◆      ');
  }

  get auditTickerAssets(): string {
    const labels = ['PREDIO-01', 'MONUMENTO-05', 'SITIO-03', 'MUSEU-07', 'CENTRO-12'];
    const items = (this.demoData?.resultados_motor_glosa || []).slice(0, 6);
    const parts: string[] = [];
    items.forEach((r, i) => {
      const tag = labels[i % labels.length];
      parts.push(`[${tag}] Tombo ${r.placa} · R$ ${r.valorTotal.toFixed(2)} (referência patrimonial)`);
      parts.push(`[${tag}] Vistoria AO VIVO · conservação sincronizada · Acre`);
    });
    return parts.join('      ◆      ') || '[SIG-PATRIMÔNIO] Monitoramento em tempo real…';
  }

  /** Ticker no hub — fluxo contínuo para não “congelar” a apresentação */
  get auditTickerHub(): string {
    const parts: string[] = [
      'TORRE DE CONTROLE · Inovathec · Governança SEAGRI',
      'SIG-FROTA — combustível · SIG-PATRIMÔNIO · SHA-256 · tempo real',
    ];
    const supplies = this.demoData?.abastecimentos || [];
    supplies.forEach((s) => {
      parts.push(`[${s.license_plate}] R$ ${s.emission_value.toFixed(2)} · auditoria em curso`);
    });
    (this.demoData?.resultados_motor_glosa || []).slice(0, 5).forEach((r) => {
      parts.push(`[${r.placa}] Georef. validado · R$ ${r.valorTotal.toFixed(2)}`);
    });
    return parts.join('      ◆      ');
  }

  get auditTickerText(): string {
    if (this.activeView === 'hub') {
      return this.auditTickerHub;
    }
    if (
      this.activeView === 'assets-map' ||
      this.activeView === 'assets-report' ||
      this.activeView === 'assets-timeline'
    ) {
      return this.auditTickerAssets;
    }
    return this.auditTickerFuel;
  }

  trackToastById(_index: number, t: ControlTowerToast): number {
    return t.id;
  }

  private syncControlTowerToasts(): void {
    this.clearControlTowerTimers();
    this.controlTowerToasts = [];
    if (this.loading || this.activeView === 'hub') {
      this.cdr.markForCheck();
      return;
    }
    const kick = window.setTimeout(() => {
      this.pushControlTowerToast();
      this.cdr.markForCheck();
    }, 900);
    this.toastTimeouts.push(kick);
    this.toastIntervalId = window.setInterval(() => {
      this.pushControlTowerToast();
      this.cdr.markForCheck();
    }, 6800);
  }

  private clearControlTowerTimers(): void {
    if (this.toastIntervalId !== undefined) {
      clearInterval(this.toastIntervalId);
      this.toastIntervalId = undefined;
    }
    this.toastTimeouts.forEach((id) => clearTimeout(id));
    this.toastTimeouts = [];
  }

  private clearControlTowerToasts(): void {
    this.clearControlTowerTimers();
    this.controlTowerToasts = [];
  }

  private pushControlTowerToast(): void {
    const id = ++this.toastSeq;
    const next = this.nextToastPayload();
    this.controlTowerToasts = [...this.controlTowerToasts.slice(-2), { id, ...next }];
    const removeAfter = window.setTimeout(() => {
      this.controlTowerToasts = this.controlTowerToasts.filter((t) => t.id !== id);
      this.cdr.markForCheck();
    }, 5200);
    this.toastTimeouts.push(removeAfter);
  }

  private nextToastPayload(): Pick<ControlTowerToast, 'message' | 'kind'> {
    const fuel: Pick<ControlTowerToast, 'message' | 'kind'>[] = [
      { message: 'Abastecimento confirmado — cartão e volume validados', kind: 'ok' },
      { message: 'Georreferenciamento sincronizado com o motor de glosa', kind: 'info' },
      { message: 'Novo fechamento de perímetro — Acre (área ativa)', kind: 'info' },
      { message: 'Alerta: transação fora do raio — dedução automática acionada', kind: 'warn' },
      { message: 'SHA-256 gravado — trilha de imutabilidade atualizada', kind: 'ok' },
      { message: 'Painel fiscal: ROI dentro da meta operacional', kind: 'info' },
    ];
    const assets: Pick<ControlTowerToast, 'message' | 'kind'>[] = [
      { message: 'Vistoria de patrimônio registrada — fé pública AP 04', kind: 'ok' },
      { message: 'Tombo sincronizado — inventário em tempo real', kind: 'info' },
      { message: 'Conservação do bem atualizada no painel pericial', kind: 'info' },
      { message: 'Geolocalização confirmada — dentro do perímetro delimitado', kind: 'ok' },
      { message: 'Cadeia de integridade: hash verificado no bloco', kind: 'info' },
    ];
    const pool =
      this.activeView === 'assets-map' ||
      this.activeView === 'assets-report' ||
      this.activeView === 'assets-timeline'
        ? assets
        : fuel;
    return pool[(this.toastSeq + this.activeView.length) % pool.length];
  }

  get patrimonyChainRows(): PatrimonyChainRow[] {
    const rows = this.demoData?.resultados_motor_glosa || [];
    const labels = ['Imóvel histórico', 'Monumento tombado', 'Bem móvel catalogado', 'Acervo museológico', 'Patrimônio público'];
    return rows.slice(0, 8).map((r, i) => ({
      tombo: r.placa,
      descricao: `${labels[i % labels.length]} · ${r.transacaoId}`,
      inpiRegistro: `INPI-BR-2024-PAT-${(827400 + r.id).toString(36).toUpperCase()}`,
      integrityHash: r.integrityHash || `sim-${r.id}-${r.placa}`,
      situacao: r.glosaStatus === 'APROVADO' ? 'Sincronizado / válido' : 'Em revisão pericial',
    }));
  }

  get timelineEvents(): PatrimonyTimelineEvent[] {
    const base = this.selectedMapRecord || this.demoData?.resultados_motor_glosa?.[0];
    const tombo = base?.placa ?? 'TOMBO-DEMO';
    const h = (suffix: string) =>
      base?.integrityHash
        ? `${base.integrityHash.slice(0, 24)}${suffix}`
        : `a1f2c9${tombo}${suffix}`.padEnd(64, '0').slice(0, 64);
    return [
      {
        id: 'ev-1',
        kind: 'tombamento',
        title: 'Tombamento inicial',
        detail: `Registro definitivo do bem ${tombo} — livro tombo digital AP04.`,
        at: '2023-08-14T09:22:00-05:00',
        integrityHash: h('01'),
      },
      {
        id: 'ev-2',
        kind: 'cautela',
        title: 'Termo de cautela',
        detail: 'Responsabilidade formal do gestor e vinculação ao inventário SIG-PATRIMÔNIO.',
        at: '2024-01-20T14:05:00-05:00',
        integrityHash: h('02'),
        tampered: true,
      },
      {
        id: 'ev-3',
        kind: 'vistoria',
        title: 'Vistoria 1 — censo',
        detail: 'Georreferenciamento e índice de conservação homologados.',
        at: '2024-06-02T11:40:00-05:00',
        integrityHash: h('03'),
      },
      {
        id: 'ev-4',
        kind: 'vistoria',
        title: 'Vistoria 2 — fé pública (hoje)',
        detail: 'Captura AP04 com carimbo dinâmico GPS + timestamp — trilha ativa.',
        at: new Date().toISOString(),
        integrityHash: h('04'),
      },
    ];
  }

  openAp04Scanner(fromFab = false): void {
    if (this.ap04ScanDoneTimer) {
      clearTimeout(this.ap04ScanDoneTimer);
      this.ap04ScanDoneTimer = undefined;
    }
    this.ap04ScannerOpen = true;
    this.ap04Scanning = true;
    if (fromFab) {
      this.ap04ShutterPulse = true;
      window.setTimeout(() => {
        this.ap04ShutterPulse = false;
        this.cdr.markForCheck();
      }, 450);
    }
    this.ap04ScanDoneTimer = window.setTimeout(() => {
      this.ap04ScanDoneTimer = undefined;
      if (!this.ap04ScannerOpen) {
        return;
      }
      this.ap04Scanning = false;
      this.ap04ScannerOpen = false;
      this.ap04PhotoCaptured = true;
      this.ap04PhotoFlash = true;
      window.setTimeout(() => {
        this.ap04PhotoFlash = false;
        this.cdr.markForCheck();
      }, 280);
      this.startAp04LiveStamp();
      this.cdr.markForCheck();
    }, 2800);
    this.cdr.markForCheck();
  }

  closeAp04Scanner(): void {
    if (this.ap04ScanDoneTimer) {
      clearTimeout(this.ap04ScanDoneTimer);
      this.ap04ScanDoneTimer = undefined;
    }
    this.ap04ScannerOpen = false;
    this.ap04Scanning = false;
    this.cdr.markForCheck();
  }

  startAp04LiveStamp(): void {
    this.stopAp04LiveStamp();
    const lat = this.selectedMapRecord?.postoLat ?? -9.974;
    const lng = this.selectedMapRecord?.postoLng ?? -67.81;
    const tick = () => {
      const jitter = (Math.random() - 0.5) * 0.00002;
      this.ap04LiveGps = `${(lat + jitter).toFixed(6)}, ${(lng + jitter).toFixed(6)} (WGS-84)`;
      this.ap04LiveTime = new Date().toISOString();
      this.cdr.markForCheck();
    };
    tick();
    this.ap04StampInterval = window.setInterval(tick, 400);
  }

  stopAp04LiveStamp(): void {
    if (this.ap04StampInterval) {
      clearInterval(this.ap04StampInterval);
      this.ap04StampInterval = undefined;
    }
  }

  confirmAp04PublicFaith(): void {
    this.ap04Saving = true;
    this.stopAp04LiveStamp();
    window.setTimeout(() => {
      this.ap04Saving = false;
      this.ap04PhotoCaptured = false;
      this.cdr.markForCheck();
    }, 900);
    this.cdr.markForCheck();
  }

  compareTimelineHashes(): void {
    this.timelineCompareFailRound = !this.timelineCompareFailRound;
    this.timelineCompareState = this.timelineCompareFailRound ? 'fail' : 'ok';
    window.setTimeout(() => {
      this.timelineCompareState = 'idle';
      this.cdr.markForCheck();
    }, 1900);
    this.cdr.markForCheck();
  }

  timelineItemCompareClass(ev: PatrimonyTimelineEvent): string {
    if (this.timelineCompareState === 'idle') {
      return '';
    }
    if (this.timelineCompareState === 'ok') {
      return 'm1-timeline-card--flash-ok';
    }
    return ev.tampered ? 'm1-timeline-card--flash-bad' : 'm1-timeline-card--flash-ok';
  }

  exportPatrimonyOfficialPdf(): void {
    const rows = this.patrimonyChainRows
      .map(
        (row) =>
          `<tr>
            <td>${row.tombo}</td>
            <td>${row.descricao}</td>
            <td style="font-weight:700;color:#11CDEF;">${row.inpiRegistro}</td>
            <td style="font-family:monospace;font-size:9px;color:#11CDEF;word-break:break-all;">${row.integrityHash}</td>
            <td>${row.situacao}</td>
          </tr>`
      )
      .join('');
    const html = `
      <!DOCTYPE html><html><head><meta charset="utf-8"><title>Relatório oficial — SIG-PATRIMÔNIO · Cadeia de integridade</title>
      <style>
        body { font-family: 'Segoe UI', system-ui, sans-serif; color: #0f172a; padding: 24px; }
        h1 { font-size: 18px; margin: 0 0 8px; }
        h2 { font-size: 14px; color: #334155; margin: 0 0 20px; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px; vertical-align: top; }
        th { background: #f1f5f9; text-align: left; }
        .foot { margin-top: 20px; font-size: 10px; color: #64748b; }
        .seal { color: #11CDEF; font-weight: 700; letter-spacing: 0.04em; }
      </style></head><body>
      <h1>SIG-PATRIMÔNIO — Inventário e tombamento (impressão oficial)</h1>
      <h2>Cadeia de integridade SHA-256 · registro INPI exclusivo · gestão AP04 distinta</h2>
      <table>
        <thead>
          <tr>
            <th>Tombamento</th>
            <th>Descrição</th>
            <th>Registro INPI (texto-fonte)</th>
            <th>SHA-256 (integridade)</th>
            <th>Situação</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="foot"><span class="seal">SHA-256</span> — cada linha reproduz o selo exibido no painel “Cadeia de integridade”. Documento gerado para auditoria (simulação).</p>
      </body></html>
    `;
    const popup = window.open('', '_blank');
    if (popup) {
      popup.document.write(html);
      popup.document.close();
      popup.print();
    }
  }

  getMapDistanceMeters(record: MotorResult): number {
    const vehicleLat = record.postoLat + (record.id % 2 ? 0.0028 : 0.0095);
    const vehicleLng = record.postoLng + (record.id % 2 ? 0.0015 : 0.009);
    return this.haversineMeters(record.postoLat, record.postoLng, vehicleLat, vehicleLng);
  }

  isAutomaticDeduction(record: MotorResult): boolean {
    return this.getMapDistanceMeters(record) > 500;
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
    this.modalPatrimonyValidationFlash = false;
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
    if (this.activeView === 'assets-map') {
      requestAnimationFrame(() => {
        this.modalPatrimonyValidationFlash = true;
        this.cdr.markForCheck();
        setTimeout(() => {
          this.modalPatrimonyValidationFlash = false;
          this.cdr.markForCheck();
        }, 2000);
      });
    }
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
    this.modalPatrimonyValidationFlash = false;
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
      <html><head><title>Relatório de integridade SIG-FROTA</title></head><body>
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
        html: `<span class="map-live-pulse map-live-pulse--posto" style="animation-delay:${(idx * 0.11).toFixed(2)}s" aria-hidden="true">${postoGlyph}</span>`,
        iconSize: [26, 26],
      });
      const pulseWarn = automaticDeduction ? ' map-live-pulse--warn' : '';
      const dropClass = assetMode ? ' asset-drop' : '';
      const assetLabel = assetMode ? this.assetIconLabel(idx) : 'A/E';
      const pinTitle = assetMode ? 'Bem patrimonial' : 'Ativo / equipamento';
      const assetHtml = isSelected
        ? `<span class="asset-pin asset-pin-selected map-live-pulse${pulseWarn}${dropClass}" style="animation-delay:${(idx * 0.09).toFixed(2)}s" title="${pinTitle}" aria-label="${pinTitle}">${assetLabel}</span>`
        : `<span class="asset-pin map-live-pulse${pulseWarn}${dropClass}" style="animation-delay:${(idx * 0.09).toFixed(2)}s" title="${pinTitle}" aria-label="${pinTitle}">${assetLabel}</span>`;
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
