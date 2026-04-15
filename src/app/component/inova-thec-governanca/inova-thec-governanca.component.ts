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
import { environment } from '../../../environments/environment';
import { NavigationEnd, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, filter, timeout } from 'rxjs/operators';
import * as L from 'leaflet';

interface MotorResult {
  id: number;
  transacaoId: string;
  placa: string;
  postoLat: number;
  postoLng: number;
  volumeLitros: number;
  valorTotal: number;
  glosaStatus: string;
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
  bens_patrimonio?: Array<{
    id: number;
    tombo: string;
    descricao: string;
    conservacaoPercent: number;
    responsavel: string;
    situacao: string;
    valorPatrimonial: number;
    integrityHash: string;
  }>;
  resumo_patrimonio?: {
    total_bens_catalogados: number;
    total_vistorias_realizadas: number;
    valor_patrimonial_total: number;
    bens_sincronizados: number;
    bens_em_revisao: number;
  };
}

interface IntegrityRow {
  id: number;
  date: string;
  department: string;
  plate: string;
  liters: number;
  amount: number;
  calculatedHash: string;
  verified: boolean;
}

interface GlosaItem {
  id: string;
  placa: string;
  orgao: string;
  valor: number;
  motivo: string;
  status: 'pendente' | 'homologado' | 'diligenciado' | 'impugnado';
}

type ItView =
  | 'portal'
  | 'frota-menu'
  | 'patrimonio-menu'
  | 'frota-tela'
  | 'patrimonio-tela';

@Component({
  selector: 'app-inova-thec-governanca',
  templateUrl: './inova-thec-governanca.component.html',
  styleUrls: ['./inova-thec-governanca.component.scss'],
})
export class InovaThecGovernancaComponent implements OnInit, AfterViewInit, OnDestroy {
  private static readonly bodyClass = 'inova-thec-body';
  /** Espelha `body.milestone1-demo-dark` para estilos globais do botão Menu principal (Marco 1). */
  private static readonly bodyThemeDarkClass = 'inova-thec-theme-dark';
  private static readonly themeStorageKey = 'vehicle-management-theme';

  loading = true;
  view: ItView = 'portal';
  module: 'frota' | 'patrimonio' | null = null;
  darkMode = false;
  themeIconSpinning = false;
  /** Rota: homologacao | vetoracao | pericia | trilha | tribunal | economicidade | certificacao | central | registro | cautelas | custodia | residual | georef | extrator */
  tela = '';

  /** Valores exibidos com contagem 0 → alvo (homologação / central) */
  homologDisplay = { fleet: 0, savings: 0, liters: 0 };
  centralDisplay = { custody: 0, audits: 0 };
  private kpiCountUpRaf = 0;
  private static readonly KPI_COUNT_UP_MS = 950;
  private static cachedDemoData?: DemoData;
  private static cachedIntegrityRows?: IntegrityRow[];

  demoData?: DemoData;
  integrityRows: IntegrityRow[] = [];
  selectedMapRecord?: MotorResult;

  map?: L.Map;
  mapReady = false;
  /** Invalida tentativas antigas de init do mapa ao navegar de novo */
  private mapScheduleGen = 0;

  /** Perícia imagem */
  periciaPreviewUrl: string | null = null;
  periciaLaserOn = false;
  periciaGpsWatchId?: number;
  periciaGpsAccuracy?: number;
  periciaOutOfRadius = false;

  /** Certificação fé pública — 4 fotos */
  certSlots: Array<{ url: string | null; done: boolean }> = [
    { url: null, done: false },
    { url: null, done: false },
    { url: null, done: false },
    { url: null, done: false },
  ];
  certCardFlipped = false;
  certHash = '';

  /** Registro fé pública — carimbo */
  registroSealed = false;
  registroHash = '';

  /** Avaliação residual */
  residualAnos = 5;
  residualValor = 0;

  /** Tribunal glosas */
  glosas: GlosaItem[] = [];

  /** Economicidade — alerta desvio */
  economicidadeAlert = false;

  /** Typewriter patrimônio */
  typewriterText = '';
  private typewriterFull = 'Integridade Criptográfica de Ativos Estaduais...';
  private typewriterTimer?: ReturnType<typeof setInterval>;

  /** Extrator prova */
  extratorPreview: string | null = null;
  extratorSweep = false;

  /** Rodapé Marco 1 — “resto” SHA (mesmo comportamento do hub em /milestone1-demo) */
  hubFooterHashLocked = false;
  hubLiveFooterHash = '';
  hubFixedFooterHash = '';
  private hubFooterHashTimer?: ReturnType<typeof setInterval>;

  /** Estado de carregamento inicial (sem animação forçada). */
  private initialRevealDone = false;

  gpsLockBanner = 'Trava anti-GPS falso ativa — alta precisão obrigatória em 100% do tempo.';

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly renderer: Renderer2,
    private readonly ngZone: NgZone,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.restoreThemeMode();
    this.renderer.addClass(this.document.body, InovaThecGovernancaComponent.bodyClass);
    this.syncBodyThemeDarkClass();
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe((e) => {
      const path = (e.urlAfterRedirects || e.url || '').split('?')[0];
      this.syncFromUrl(path);
      this.syncKpiCountUpAfterNavigate();
      this.cdr.markForCheck();
    });
    /* Após o router fixar a URL (deep link / reutilização do mesmo componente) */
    queueMicrotask(() => {
      this.syncFromUrl();
      this.syncKpiCountUpAfterNavigate();
      this.cdr.markForCheck();
    });
    const hasCache =
      !!InovaThecGovernancaComponent.cachedDemoData &&
      !!InovaThecGovernancaComponent.cachedIntegrityRows;
    if (hasCache) {
      this.applyLoadedData(
        InovaThecGovernancaComponent.cachedDemoData!,
        InovaThecGovernancaComponent.cachedIntegrityRows!
      );
      this.finishInitialLoad();
      this.fetchDemoData(false);
      return;
    }
    this.fetchDemoData(true);
  }

  private fetchDemoData(finishWithLoader: boolean): void {
    this.http
      .get<DemoData>(`${environment.API_URL}/auditoria/motor`)
      .pipe(
        timeout(8000),
        catchError(() => this.http.get<DemoData>('assets/mock/DB.json')),
        catchError(() =>
          of({
            abastecimentos: [],
            resultados_motor_glosa: [],
            resumo_dashboard: {
              economia_gerada: 0,
              valor_total_transacoes: 0,
              valor_glosado: 0,
              total_transacoes: 0,
            },
          } as DemoData)
        )
      )
      .subscribe({
        next: async (data) => {
          const integrityRows = await this.buildIntegrityRows(data);
          InovaThecGovernancaComponent.cachedDemoData = data;
          InovaThecGovernancaComponent.cachedIntegrityRows = integrityRows;
          this.applyLoadedData(data, integrityRows);
          if (finishWithLoader) {
            this.finishInitialLoad();
          }
        },
        error: () => {
          if (finishWithLoader) {
            this.finishInitialLoad();
          }
        },
      });
  }

  private applyLoadedData(data: DemoData, integrityRows: IntegrityRow[]): void {
    this.demoData = data;
    this.selectedMapRecord = data.resultados_motor_glosa[0];
    this.integrityRows = integrityRows;
    this.glosas = this.buildGlosasMock(data);
    this.updateResidual();
    this.syncKpiCountUpAfterNavigate();
    this.cdr.markForCheck();
  }

  /** Encerra o carregamento assim que os dados iniciais estiverem prontos. */
  private finishInitialLoad(): void {
    if (this.initialRevealDone) {
      return;
    }
    this.initialRevealDone = true;
    this.loading = false;
    this.syncHubFooterScratchLifecycle();
    this.cdr.markForCheck();
    this.scheduleEnsureMap();
  }

  ngAfterViewInit(): void {
    this.scheduleEnsureMap();
  }

  ngOnDestroy(): void {
    this.mapScheduleGen++;
    this.renderer.removeClass(this.document.body, InovaThecGovernancaComponent.bodyClass);
    this.renderer.removeClass(this.document.body, InovaThecGovernancaComponent.bodyThemeDarkClass);
    this.destroyMap();
    this.stopPericiaGps();
    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
    }
    this.clearHubFooterHashScratch();
    this.cancelKpiCountUpAnimation();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.map?.invalidateSize();
  }

  /** @param pathOverride URL já normalizada (ex.: NavigationEnd.urlAfterRedirects) */
  private syncFromUrl(pathOverride?: string): void {
    const path = ((pathOverride ?? this.router.url) || '').split('?')[0];
    const parts = path.split('/').filter((p) => p);
    if (parts[0] !== 'inova-thec') {
      return;
    }
    if (parts.length === 1) {
      this.view = 'portal';
      this.module = null;
      this.tela = '';
      this.stopPatrimonioTypewriter();
      this.stopPericiaGps();
      this.applyMapLifecycle();
      this.syncKpiCountUpAfterNavigate();
      this.syncHubFooterScratchLifecycle();
      return;
    }
    if (parts[1] === 'sig-frota') {
      this.module = 'frota';
      this.stopPatrimonioTypewriter();
      if (!parts[2]) {
        this.view = 'frota-menu';
        this.tela = '';
        this.stopPericiaGps();
      } else {
        this.view = 'frota-tela';
        this.tela = parts[2];
        if (this.tela === 'pericia') {
          this.startPericiaGps();
        } else {
          this.stopPericiaGps();
        }
      }
      this.applyMapLifecycle();
      this.syncKpiCountUpAfterNavigate();
      this.syncHubFooterScratchLifecycle();
      return;
    }
    if (parts[1] === 'sig-patrimonio') {
      this.module = 'patrimonio';
      this.stopPericiaGps();
      if (!parts[2]) {
        this.view = 'patrimonio-menu';
        this.tela = '';
        this.startPatrimonioTypewriter();
      } else {
        this.view = 'patrimonio-tela';
        this.tela = parts[2];
        this.stopPatrimonioTypewriter();
      }
      this.applyMapLifecycle();
      this.syncKpiCountUpAfterNavigate();
      this.syncHubFooterScratchLifecycle();
      return;
    }
  }

  /** Marco 1: `m1-hub-footer-scratch` só no hub; aqui só no portal. */
  get m1ShowHubFooterScratch(): boolean {
    return this.view === 'portal';
  }

  private syncHubFooterScratchLifecycle(): void {
    if (this.view === 'portal' && !this.hubFooterHashLocked && !this.loading) {
      this.startHubFooterHashScratch();
    } else if (this.view !== 'portal') {
      this.clearHubFooterHashScratch();
    }
  }

  private cancelKpiCountUpAnimation(): void {
    if (this.kpiCountUpRaf !== 0) {
      cancelAnimationFrame(this.kpiCountUpRaf);
      this.kpiCountUpRaf = 0;
    }
  }

  private kpiCountUpPrefersReducedMotion(): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** Inicia ou reinicia contagem quando a rota é homologação / central e há dados. */
  private syncKpiCountUpAfterNavigate(): void {
    this.cancelKpiCountUpAnimation();
    if (!this.demoData) {
      return;
    }
    if (this.tela === 'homologacao') {
      this.startHomologacaoKpiCountUp();
    } else if (this.tela === 'central') {
      this.startCentralKpiCountUp();
    }
  }

  private startHomologacaoKpiCountUp(): void {
    const target = this.homologacaoKpis;
    if (this.kpiCountUpPrefersReducedMotion()) {
      this.homologDisplay = { fleet: target.fleet, savings: target.savings, liters: target.liters };
      this.cdr.markForCheck();
      return;
    }
    const duration = InovaThecGovernancaComponent.KPI_COUNT_UP_MS;
    const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const ease = (u: number) => 1 - (1 - u) ** 3;

    this.homologDisplay = { fleet: 0, savings: 0, liters: 0 };
    this.cdr.markForCheck();

    const step = (now: number) => {
      const elapsed = now - t0;
      const u = Math.min(1, elapsed / duration);
      const e = ease(u);
      this.homologDisplay = {
        fleet: Math.round(target.fleet * e),
        savings: target.savings * e,
        liters: target.liters * e,
      };
      this.cdr.markForCheck();
      if (u < 1) {
        this.kpiCountUpRaf = requestAnimationFrame(step);
      } else {
        this.homologDisplay = {
          fleet: target.fleet,
          savings: target.savings,
          liters: target.liters,
        };
        this.kpiCountUpRaf = 0;
        this.cdr.markForCheck();
      }
    };

    this.kpiCountUpRaf = requestAnimationFrame(step);
  }

  private startCentralKpiCountUp(): void {
    const resumoPat = this.demoData!.resumo_patrimonio;
    const custody = resumoPat?.total_bens_catalogados ?? this.demoData!.resultados_motor_glosa.length;
    const audits = resumoPat?.total_vistorias_realizadas ?? this.demoData!.abastecimentos.length;
    if (this.kpiCountUpPrefersReducedMotion()) {
      this.centralDisplay = { custody, audits };
      this.cdr.markForCheck();
      return;
    }
    const duration = InovaThecGovernancaComponent.KPI_COUNT_UP_MS;
    const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const ease = (u: number) => 1 - (1 - u) ** 3;

    this.centralDisplay = { custody: 0, audits: 0 };
    this.cdr.markForCheck();

    const step = (now: number) => {
      const elapsed = now - t0;
      const u = Math.min(1, elapsed / duration);
      const e = ease(u);
      this.centralDisplay = {
        custody: Math.round(custody * e),
        audits: Math.round(audits * e),
      };
      this.cdr.markForCheck();
      if (u < 1) {
        this.kpiCountUpRaf = requestAnimationFrame(step);
      } else {
        this.centralDisplay = { custody, audits };
        this.kpiCountUpRaf = 0;
        this.cdr.markForCheck();
      }
    };

    this.kpiCountUpRaf = requestAnimationFrame(step);
  }

  private applyMapLifecycle(): void {
    const need =
      (this.module === 'frota' && this.tela === 'vetoracao') ||
      (this.module === 'patrimonio' && this.tela === 'georef');
    if (!need) {
      this.destroyMap();
      return;
    }
    this.scheduleEnsureMap();
  }

  /**
   * O #it-map só existe após o *ngIf; `NgZone.onStable` pode nunca emitir se a zona já está estável.
   * Fazemos polling até o elemento existir com altura e recriamos o mapa se o DOM for outro nó (Leaflet + Angular).
   */
  private scheduleEnsureMap(): void {
    const needMap =
      (this.module === 'frota' && this.tela === 'vetoracao') ||
      (this.module === 'patrimonio' && this.tela === 'georef');
    if (!needMap || !this.demoData || this.loading) {
      return;
    }
    const gen = ++this.mapScheduleGen;
    this.cdr.detectChanges();

    let attempts = 0;
    const maxAttempts = 80;

    const bumpMap = () => {
      if (gen !== this.mapScheduleGen) {
        return;
      }
      this.map?.invalidateSize();
      if (this.mapReady && this.map && this.demoData) {
        this.renderMapLayers();
      }
    };

    const tick = () => {
      if (gen !== this.mapScheduleGen) {
        return;
      }
      const still =
        (this.module === 'frota' && this.tela === 'vetoracao') ||
        (this.module === 'patrimonio' && this.tela === 'georef');
      if (!still || !this.demoData || this.loading) {
        return;
      }
      const el = this.document.getElementById('it-map') as HTMLElement | null;
      const h = el?.getBoundingClientRect().height ?? 0;
      attempts++;

      /* Altura 0 durante animação de rota: após ~25 tentativas força init mesmo assim */
      if (el && (h >= 8 || attempts >= 25)) {
        this.ensureMap();
        this.cdr.markForCheck();
        bumpMap();
        setTimeout(bumpMap, 120);
        setTimeout(bumpMap, 400);
        setTimeout(bumpMap, 900);
        return;
      }

      if (attempts < maxAttempts) {
        setTimeout(tick, 30);
      }
    };

    setTimeout(tick, 0);
  }

  private startPatrimonioTypewriter(): void {
    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
    }
    this.typewriterText = '';
    let i = 0;
    this.typewriterTimer = setInterval(() => {
      if (i < this.typewriterFull.length) {
        this.typewriterText += this.typewriterFull[i];
        i++;
        this.cdr.markForCheck();
      } else {
        if (this.typewriterTimer) {
          clearInterval(this.typewriterTimer);
          this.typewriterTimer = undefined;
        }
      }
    }, 42);
  }

  private stopPatrimonioTypewriter(): void {
    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = undefined;
    }
  }

  private queueInovaNavigation(commands: (string | number)[]): void {
    if (this.loading) {
      return;
    }
    void this.router.navigate(commands);
  }

  goPortal(): void {
    if (this.loading) {
      return;
    }
    void this.router.navigate(['/inova-thec']).then(() => {
      this.scheduleEnsureMap();
      this.cdr.markForCheck();
    });
  }

  goBack(): void {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
      return;
    }
    void this.router.navigate(['/']);
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

  toggleDarkMode(): void {
    this.themeIconSpinning = true;
    window.setTimeout(() => {
      this.themeIconSpinning = false;
      this.cdr.markForCheck();
    }, 700);
    if (this.view === 'portal') {
      this.lockHubFooterScratch();
    }
    this.darkMode = !this.darkMode;
    this.persistThemeMode();
    this.syncBodyThemeDarkClass();
    this.cdr.markForCheck();
  }

  private syncBodyThemeDarkClass(): void {
    if (this.darkMode) {
      this.renderer.addClass(this.document.body, InovaThecGovernancaComponent.bodyThemeDarkClass);
    } else {
      this.renderer.removeClass(this.document.body, InovaThecGovernancaComponent.bodyThemeDarkClass);
    }
  }

  private restoreThemeMode(): void {
    try {
      const saved = localStorage.getItem(InovaThecGovernancaComponent.themeStorageKey);
      if (saved === 'light') {
        this.darkMode = false;
      } else if (saved === 'dark') {
        this.darkMode = true;
      }
    } catch {
      // no-op: keep default when storage is unavailable
    }
  }

  private persistThemeMode(): void {
    try {
      localStorage.setItem(InovaThecGovernancaComponent.themeStorageKey, this.darkMode ? 'dark' : 'light');
    } catch {
      // no-op
    }
  }

  goFrotaMenu(): void {
    this.queueInovaNavigation(['/inova-thec/sig-frota']);
  }

  goFrotaTela(t: string): void {
    this.queueInovaNavigation(['/inova-thec/sig-frota', t]);
  }

  goPatrimonioMenu(): void {
    this.queueInovaNavigation(['/inova-thec/sig-patrimonio']);
  }

  goPatrimonioTela(t: string): void {
    this.queueInovaNavigation(['/inova-thec/sig-patrimonio', t]);
  }

  get isFrotaTela(): boolean {
    return this.view === 'frota-tela';
  }

  get isPatrimonioTela(): boolean {
    return this.view === 'patrimonio-tela';
  }

  get showHomeInModule(): boolean {
    return this.view === 'frota-menu' || this.view === 'patrimonio-menu' || this.isFrotaTela || this.isPatrimonioTela;
  }

  /** Mapa / distância */
  getMapDistanceMeters(record: MotorResult): number {
    const vehicleLat = record.postoLat + (record.id % 2 ? 0.0028 : 0.0095);
    const vehicleLng = record.postoLng + (record.id % 2 ? 0.0015 : 0.009);
    return this.haversineMeters(record.postoLat, record.postoLng, vehicleLat, vehicleLng);
  }

  isOutOf500m(record: MotorResult): boolean {
    return this.getMapDistanceMeters(record) > 500;
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

  private async buildIntegrityRows(data: DemoData): Promise<IntegrityRow[]> {
    const rows = await Promise.all(
      data.abastecimentos.map(async (item, index) => {
        const payload = `${item.cod_transaction}|${item.transaction_date}|${item.license_plate}|${item.driver_name}|${item.liters}|${item.emission_value}`;
        const calculatedHash = await this.sha256(payload);
        return {
          id: item.id,
          date: item.transaction_date.slice(0, 10),
          department: this.mockDepartment(index),
          plate: item.license_plate,
          liters: item.liters,
          amount: item.emission_value,
          calculatedHash,
          verified: !!item.integrityHash,
        };
      })
    );
    return rows;
  }

  private mockDepartment(index: number): string {
    const departments = ['Operações', 'Saúde', 'Educação', 'Infraestrutura', 'Administração'];
    return departments[index % departments.length];
  }

  private async sha256(value: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private buildGlosasMock(data: DemoData): GlosaItem[] {
    return (data.resultados_motor_glosa || []).slice(0, 6).map((r, i) => ({
      id: `G-${r.id}`,
      placa: r.placa,
      orgao: this.mockDepartment(i),
      valor: r.valorTotal,
      motivo: r.glosaStatus !== 'APROVADO' ? 'Divergência pericial / volume' : 'Auditoria preventiva',
      status: 'pendente',
    }));
  }

  setGlosaStatus(id: string, status: GlosaItem['status']): void {
    this.glosas = this.glosas.map((g) => (g.id === id ? { ...g, status } : g));
  }

  get auditTicker(): string {
    const parts: string[] = [];
    (this.demoData?.abastecimentos || []).forEach((s) => {
      parts.push(`[${s.license_plate}] R$ ${s.emission_value.toFixed(2)} · SHA-256 em trânsito`);
    });
    (this.demoData?.resultados_motor_glosa || []).forEach((r) => {
      parts.push(`[${r.placa}] ${r.transacaoId} · ${r.glosaStatus}`);
    });
    return parts.join('      ◆      ') || '[SISTEMA] Trilha ativa…';
  }

  /** Texto do segundo letreiro do rodapé — mesma lógica que `auditTickerText` no Marco 1 */
  get m1AuditTickerText(): string {
    if (this.view === 'portal') {
      return this.m1AuditTickerHub;
    }
    if (this.module === 'patrimonio') {
      return this.m1AuditTickerAssets;
    }
    return this.m1AuditTickerFuel;
  }

  /** Cópia literal dos getters `auditTickerFuel` / `auditTickerAssets` / `auditTickerHub` de milestone1-demo */
  private get m1AuditTickerFuel(): string {
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
    this.integrityRows.slice(0, 4).forEach((row) => {
      const shortHash = row.calculatedHash.slice(0, 8).toUpperCase();
      parts.push(`[${row.plate}] SHA-256 ${shortHash}… trilha ativa`);
    });
    if (!parts.length) {
      return '[SISTEMA] Aguardando registros de auditoria…';
    }
    return parts.join('      ◆      ');
  }

  private get m1AuditTickerAssets(): string {
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

  private get m1AuditTickerHub(): string {
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

  private tickHubFooterHash(): void {
    const hex = '0123456789abcdef';
    let s = '';
    for (let i = 0; i < 64; i++) {
      s += hex[Math.floor(Math.random() * 16)];
    }
    this.hubLiveFooterHash = s;
    this.cdr.markForCheck();
  }

  private clearHubFooterHashScratch(): void {
    if (this.hubFooterHashTimer != null) {
      clearInterval(this.hubFooterHashTimer);
      this.hubFooterHashTimer = undefined;
    }
  }

  private startHubFooterHashScratch(): void {
    this.clearHubFooterHashScratch();
    if (this.hubFooterHashLocked || this.loading) {
      return;
    }
    this.tickHubFooterHash();
    this.hubFooterHashTimer = setInterval(() => this.tickHubFooterHash(), 100);
  }

  private lockHubFooterScratch(): void {
    this.clearHubFooterHashScratch();
    this.hubFooterHashLocked = true;
    const fromData =
      this.demoData?.abastecimentos?.[0]?.integrityHash ?? this.integrityRows?.[0]?.calculatedHash;
    this.hubFixedFooterHash =
      (fromData && String(fromData).replace(/\s/g, '')) ||
      this.hubLiveFooterHash ||
      '0'.repeat(64);
  }

  /** Leaflet */
  private ensureMap(): void {
    const needMap =
      (this.module === 'frota' && this.tela === 'vetoracao') ||
      (this.module === 'patrimonio' && this.tela === 'georef');
    if (!needMap || !this.demoData) {
      return;
    }
    const el = this.document.getElementById('it-map') as HTMLElement | null;
    if (!el) {
      return;
    }

    if (this.map) {
      if (this.map.getContainer() === el) {
        /* Não destruir se whenReady ainda não correu (evita mapa órfão). */
        if (this.mapReady) {
          this.map.invalidateSize();
          this.renderMapLayers();
        }
        return;
      }
      this.destroyMap();
    }

    const initial: L.LatLngExpression =
      this.tela === 'georef' ? [-9.0238, -70.812] : [-15.601411, -56.097892];
    const zoom = this.tela === 'georef' ? 7 : 11;
    /* Fora da zona do Angular: o Leaflet dispara muitos timers/DOM; evita corrida com CD. */
    this.ngZone.runOutsideAngular(() => {
      const map = L.map(el, { zoomControl: true }).setView(initial, zoom);
      /* URL única (sem {s}): alguns ambientes bloqueiam subdomínios a.tile / b.tile. */
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      this.map = map;
      this.mapReady = false;
      map.whenReady(() => {
        this.ngZone.run(() => {
          this.mapReady = true;
          this.renderMapLayers();
          this.cdr.markForCheck();
        });
      });
    });
  }

  private destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
    this.mapReady = false;
  }

  private renderMapLayers(): void {
    if (!this.map || !this.demoData) {
      return;
    }
    /* Visão inicial já definida em ensureMap(); não repetir setView aqui (evita moveend / reflow). */
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker || layer instanceof L.Polyline) {
        this.map?.removeLayer(layer);
      }
    });
    const records = this.demoData.resultados_motor_glosa;
    if (this.tela === 'vetoracao') {
      records.forEach((record, idx) => {
        const vehicleLat = record.postoLat + (record.id % 2 ? 0.0028 : 0.0095);
        const vehicleLng = record.postoLng + (record.id % 2 ? 0.0015 : 0.009);
        const warn = this.isOutOf500m(record);
        const color = warn ? '#d7263d' : '#2dce89';
        const pulseClass = warn ? 'it-pulse it-pulse--warn' : 'it-pulse';
        const postoIcon = L.divIcon({
          className: 'it-marker',
          html: `<span class="${pulseClass}" style="animation-delay:${idx * 0.08}s">⛽</span>`,
          iconSize: [28, 28],
        });
        const vehIcon = L.divIcon({
          className: 'it-marker',
          html: `<span class="${pulseClass}" style="animation-delay:${idx * 0.06}s">📍</span>`,
          iconAnchor: [14, 14],
          iconSize: [28, 28],
        });
        L.marker([record.postoLat, record.postoLng], { icon: postoIcon }).addTo(this.map!);
        L.marker([vehicleLat, vehicleLng], { icon: vehIcon }).addTo(this.map!);
        L.polyline(
          [
            [record.postoLat, record.postoLng],
            [vehicleLat, vehicleLng],
          ],
          {
            color,
            weight: 3,
            className: warn ? 'it-line it-line--dash' : 'it-line it-line--pulse',
          }
        ).addTo(this.map!);
      });
    }
    if (this.tela === 'georef') {
      records.forEach((record, idx) => {
        const intensity = 0.35 + (idx % 5) * 0.12;
        L.circleMarker([record.postoLat, record.postoLng], {
          radius: 18 + (idx % 4) * 6,
          fillColor: '#ff6b00',
          color: '#ff9500',
          weight: 1,
          fillOpacity: intensity,
          className: 'it-heat it-heat--breathe',
        }).addTo(this.map!);
      });
    }
  }

  flyToSelected(): void {
    const r = this.selectedMapRecord || this.demoData?.resultados_motor_glosa[0];
    if (r && this.map) {
      this.map.flyTo([r.postoLat, r.postoLng], 12, { duration: 1.2 });
    }
  }

  selectRecord(record: MotorResult): void {
    this.selectedMapRecord = record;
    if (this.map && (this.tela === 'vetoracao' || this.tela === 'georef')) {
      const vehicleLat = record.postoLat + (record.id % 2 ? 0.0028 : 0.0095);
      const vehicleLng = record.postoLng + (record.id % 2 ? 0.0015 : 0.009);
      this.map.panTo([vehicleLat, vehicleLng], { animate: true, duration: 0.5 });
    }
    this.updatePericiaRadiusAlert();
    this.cdr.markForCheck();
  }

  /** Perícia */
  triggerPericiaCamera(): void {
    this.periciaLaserOn = true;
    setTimeout(() => {
      this.periciaLaserOn = false;
      this.cdr.markForCheck();
    }, 2400);
    const input = this.document.getElementById('it-pericia-cam') as HTMLInputElement | null;
    input?.click();
  }

  onPericiaFile(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file?.type.startsWith('image/')) {
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = this.document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          input.value = '';
          return;
        }
        ctx.drawImage(img, 0, 0);
        const rec = this.selectedMapRecord || this.demoData?.resultados_motor_glosa[0];
        const lat = rec?.postoLat ?? -9.974;
        const lng = rec?.postoLng ?? -67.81;
        const stamp = `${new Date().toISOString()} · GPS ${lat.toFixed(5)}, ${lng.toFixed(5)} · anti-spoof ativo`;
        const barH = Math.max(36, Math.round(canvas.height * 0.08));
        ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
        ctx.fillRect(0, canvas.height - barH, canvas.width, barH);
        ctx.fillStyle = '#b8ff6a';
        ctx.font = `${Math.max(11, Math.round(canvas.width * 0.016))}px system-ui, sans-serif`;
        ctx.fillText(stamp, 10, canvas.height - Math.round(barH / 2.5));
        this.periciaPreviewUrl = canvas.toDataURL('image/jpeg', 0.88);
        this.updatePericiaRadiusAlert();
        this.ngZone.run(() => this.cdr.markForCheck());
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  private startPericiaGps(): void {
    this.stopPericiaGps();
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return;
    }
    this.periciaGpsWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        this.periciaGpsAccuracy = pos.coords.accuracy;
        this.ngZone.run(() => {
          this.updatePericiaRadiusAlert();
          this.cdr.markForCheck();
        });
      },
      () => {
        this.ngZone.run(() => this.cdr.markForCheck());
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
  }

  private stopPericiaGps(): void {
    if (this.periciaGpsWatchId != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.periciaGpsWatchId);
      this.periciaGpsWatchId = undefined;
    }
  }

  private updatePericiaRadiusAlert(): void {
    const rec = this.selectedMapRecord || this.demoData?.resultados_motor_glosa[0];
    this.periciaOutOfRadius = rec ? this.isOutOf500m(rec) : false;
  }

  get gpsSpoofWarning(): boolean {
    return this.periciaGpsAccuracy != null && this.periciaGpsAccuracy > 120;
  }

  /** Certificação 4 fotos */
  triggerCertSlot(i: number): void {
    const input = this.document.getElementById(`it-cert-${i}`) as HTMLInputElement | null;
    input?.click();
  }

  onCertFile(i: number, ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file?.type.startsWith('image/')) {
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      this.certSlots = this.certSlots.map((s, j) => (j === i ? { url, done: true } : s));
      void this.refreshCertHash();
      this.ngZone.run(() => this.cdr.markForCheck());
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  private async refreshCertHash(): Promise<void> {
    const payload = this.certSlots.map((s) => (s.url ? '1' : '0')).join('|');
    this.certHash = await this.sha256(payload + Date.now());
  }

  toggleCertFlip(): void {
    this.certCardFlipped = !this.certCardFlipped;
  }

  /** Registro carimbo */
  async selarRegistro(): Promise<void> {
    const base = this.selectedMapRecord?.integrityHash || (await this.sha256('registro' + Date.now()));
    this.registroHash = base;
    this.registroSealed = true;
    this.cdr.markForCheck();
  }

  /** Residual */
  updateResidual(): void {
    const base = this.demoData?.resumo_patrimonio?.valor_patrimonial_total
      ?? this.demoData?.resumo_dashboard.valor_total_transacoes
      ?? 1_200_000;
    const anos = this.residualAnos;
    const factor = Math.max(0.15, 1 - anos * 0.12);
    this.residualValor = base * factor;
  }

  get residualHue(): string {
    const t = this.residualAnos / 20;
    const h = Math.round(120 - t * 120);
    const l = Math.max(56, Math.round(74 - t * 24));
    return `${h}, 88%, ${l}%`;
  }

  /** Economicidade mock streamgraph deviation */
  toggleEconomicidadeDevio(): void {
    this.economicidadeAlert = !this.economicidadeAlert;
  }

  /** Extrator */
  triggerExtratorCam(): void {
    const input = this.document.getElementById('it-extrator-cam') as HTMLInputElement | null;
    input?.click();
  }

  onExtratorFile(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file?.type.startsWith('image/')) {
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = this.document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          input.value = '';
          return;
        }
        ctx.drawImage(img, 0, 0);
        const rec = this.selectedMapRecord || this.demoData?.resultados_motor_glosa[0];
        const lat = rec?.postoLat ?? -9.0238;
        const lng = rec?.postoLng ?? -70.812;
        const stamp = `GPS ${lat.toFixed(5)}, ${lng.toFixed(5)} · ${new Date().toISOString()}`;
        ctx.fillStyle = 'rgba(0, 40, 86, 0.82)';
        ctx.fillRect(0, 0, canvas.width, 44);
        ctx.fillStyle = '#7ecbff';
        ctx.font = `${Math.max(12, canvas.width * 0.02)}px system-ui`;
        ctx.fillText(stamp, 12, 28);
        this.extratorPreview = canvas.toDataURL('image/jpeg', 0.9);
        this.ngZone.run(() => this.cdr.markForCheck());
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  exararCertificado(): void {
    this.extratorSweep = true;
    setTimeout(() => {
      this.extratorSweep = false;
      this.exportPdf('patrimonio');
      this.cdr.markForCheck();
    }, 1800);
  }

  /** PDFs */
  exportPdf(kind: 'frota' | 'patrimonio'): void {
    const seal = 'DADO INVIOLÁVEL - SISTEMA DE FÉ PÚBLICA';
    const wm =
      'a1f2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const qr = `${origin}/inova-thec/sig-frota/trilha`;
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qr)}`;

    const timbre = `
      <div class="hdr">
        <div class="brand">INOVA THEC SOLUÇÕES LTDA</div>
        <div class="org">ÓRGÃO PÚBLICO — BRASÃO (SIMULADO)</div>
      </div>`;

    if (kind === 'frota') {
      const rows = this.integrityRows
        .slice(0, 8)
        .map(
          (r) =>
            `<tr><td>${r.date}</td><td>${r.plate}</td><td>${r.liters}</td><td>R$ ${r.amount.toFixed(2)}</td><td style="font-size:7px;font-family:monospace">${r.calculatedHash}</td></tr>`
        )
        .join('');
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>SIG-FROTA — Relatório</title>
      <style>
        body { font-family: Segoe UI, system-ui, sans-serif; padding: 28px; color: #0a1628; position: relative; }
        body::before { content: '${wm}'; position: fixed; inset: 0; font-size: 8px; color: rgba(10,22,40,0.04); word-break: break-all; white-space: pre-wrap; pointer-events: none; z-index: 0; }
        .hdr { display:flex; justify-content:space-between; border-bottom:2px solid #0a3d62; padding-bottom:12px; margin-bottom:16px; }
        .brand { font-weight:800; color:#0a3d62; }
        .org { font-size:11px; color:#64748b; }
        h1 { font-size:17px; }
        .mapbox { height:140px; background:linear-gradient(135deg,#0a3d62,#111); color:#8ec5ff; display:flex; align-items:center; justify-content:center; margin:12px 0; border-radius:8px; font-size:12px; }
        .photos { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin:12px 0; }
        .ph { height:72px; background:#e2e8f0; border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:10px; color:#64748b; }
        table { width:100%; border-collapse:collapse; font-size:9px; }
        th,td { border:1px solid #cbd5e1; padding:5px; }
        th { background:#f1f5f9; }
        .seal { margin-top:20px; padding:10px; border:2px solid #0a3d62; text-align:center; font-weight:800; letter-spacing:.06em; color:#0a3d62; }
      </style></head><body>
      ${timbre}
      <h1>SIG-FROTA — Mapa da glosa, prova pericial e contraprova</h1>
      <div class="mapbox">Mapa da glosa (representação gráfica — OSM / SIG-FROTA)</div>
      <div class="photos"><div class="ph">Foto pericial 1</div><div class="ph">Foto pericial 2</div><div class="ph">Foto pericial 3</div><div class="ph">Foto pericial 4</div></div>
      <p style="font-size:10px;"><img src="${qrSrc}" width="100" height="100" alt="QR" style="float:right;margin-left:12px"/> QR Code de contraprova vinculado à trilha SHA-256.</p>
      <table><thead><tr><th>Data</th><th>Placa</th><th>Litros</th><th>Valor</th><th>SHA-256</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="seal">${seal}</div>
      </body></html>`;
      this.openPrint(html);
      return;
    }

    const hist = (this.demoData?.abastecimentos || [])
      .slice(0, 4)
      .map((s) => `<li>${s.driver_name} — ${s.transaction_date.slice(0, 10)}</li>`)
      .join('');
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>SIG-PATRIMÔNIO — Relatório</title>
    <style>
      body { font-family: Segoe UI, system-ui, sans-serif; padding: 28px; color: #0a1628; position: relative; }
      body::before { content: '${wm}'; position: fixed; inset: 0; font-size: 8px; color: rgba(10,22,40,0.04); word-break: break-all; white-space: pre-wrap; pointer-events: none; z-index: 0; }
      .hdr { display:flex; justify-content:space-between; border-bottom:2px solid #1e3a5f; padding-bottom:12px; margin-bottom:16px; }
      .brand { font-weight:800; color:#1e3a5f; }
      .org { font-size:11px; color:#64748b; }
      h1 { font-size:17px; }
      .val { font-size:22px; font-weight:800; color:#4169e1; }
      .seal { margin-top:20px; padding:10px; border:2px solid #4169e1; text-align:center; font-weight:800; letter-spacing:.06em; color:#1e3a5f; }
    </style></head><body>
    ${timbre}
    <h1>SIG-PATRIMÔNIO — Valor residual e prova pericial</h1>
    <p>Valor residual homologado (simulação):</p>
    <p class="val">R$ ${this.residualValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
    <p>Foto pericial com carimbo GPS/hora anexa ao processo digital.</p>
    <p><strong>Histórico de responsáveis:</strong></p>
    <ul style="font-size:11px;">${hist}</ul>
    <div class="seal">${seal}</div>
    </body></html>`;
    this.openPrint(html);
  }

  private openPrint(html: string): void {
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
      w.print();
    }
  }

  get homologacaoKpis(): { fleet: number; savings: number; liters: number } {
    return {
      fleet: 3150,
      savings: this.demoData?.resumo_dashboard.economia_gerada ?? 0,
      liters: (this.demoData?.abastecimentos || []).reduce((a, s) => a + s.liters, 0),
    };
  }
}
