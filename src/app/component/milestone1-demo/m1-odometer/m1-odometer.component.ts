import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-m1-odometer',
  templateUrl: './m1-odometer.component.html',
  styleUrls: ['./m1-odometer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class M1OdometerComponent implements OnChanges, OnDestroy {
  @Input() value = 0;
  @Input() rollKey = 0;
  @Input() minDigits = 1;
  /** Duração do giro por coluna — mais alto = número sobe mais devagar. */
  @Input() durationMs = 3600;
  @Input() staggerMs = 110;

  readonly digits0to9 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  colCount = 1;
  offsets: number[] = [0];
  transitionOn = false;

  private rollFinishTimer?: ReturnType<typeof setTimeout>;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnDestroy(): void {
    if (this.rollFinishTimer !== undefined) {
      clearTimeout(this.rollFinishTimer);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] || changes['rollKey']) {
      this.startRoll();
    }
  }

  staggerDelay(i: number): number {
    return (this.colCount - 1 - i) * this.staggerMs;
  }

  transformForCol(i: number): string {
    const y = this.offsets[i] ?? 0;
    return `translateY(-${y}em)`;
  }

  get ariaLabel(): string {
    return String(Math.max(0, Math.floor(this.value)));
  }

  private startRoll(): void {
    const v = Math.max(0, Math.floor(this.value));
    let digits = v.toString().split('').map((c) => parseInt(c, 10));
    while (digits.length < this.minDigits) {
      digits.unshift(0);
    }
    this.colCount = digits.length;
    const targets = [...digits];

    if (this.reducedMotion()) {
      this.transitionOn = true;
      this.offsets = [...targets];
      this.cdr.markForCheck();
      return;
    }

    if (this.rollFinishTimer !== undefined) {
      clearTimeout(this.rollFinishTimer);
      this.rollFinishTimer = undefined;
    }

    // Fase 1: rolos em 0, sem transição — precisa ser pintado no ecrã.
    this.transitionOn = false;
    this.offsets = targets.map(() => 0);
    this.cdr.detectChanges();

    // Fase 2: após um frame + pequeno atraso, ativar transição até ao alvo.
    // Sem isto, o browser muitas vezes “salta” direto para o valor final (sem animação).
    requestAnimationFrame(() => {
      this.rollFinishTimer = setTimeout(() => {
        this.rollFinishTimer = undefined;
        if (this.reducedMotion()) {
          return;
        }
        this.transitionOn = true;
        this.offsets = [...targets];
        this.cdr.detectChanges();
      }, 55);
    });
  }

  private reducedMotion(): boolean {
    return (
      typeof globalThis.matchMedia === 'function' &&
      globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
}
