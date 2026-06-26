import { ChangeDetectionStrategy, Component, input, output, signal, computed, HostListener, ElementRef, inject } from '@angular/core';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-select-filter',
  standalone: true,
  host: { class: 'block w-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full">
      <button
        type="button"
        (click)="toggle()"
        aria-haspopup="listbox"
        [attr.aria-expanded]="open()"
        [attr.aria-label]="selectedLabel()"
        class="w-full flex items-center gap-2 overflow-hidden rounded-xl border px-3 py-2.5 text-sm transition-colors focus:outline-none focus:border-indigo-500"
        [class]="open()
          ? 'border-indigo-500 bg-slate-800 text-white'
          : selected()
            ? 'border-indigo-400 bg-slate-800 text-white'
            : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-300'"
      >
        <ng-content />
        <span class="truncate min-w-0 flex-1 text-left">{{ selectedLabel() }}</span>
        <svg class="h-3.5 w-3.5 shrink-0 transition-transform" [class.rotate-180]="open()"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      @if (open()) {
        <div role="listbox" class="absolute left-0 top-full z-50 mt-1 min-w-40 rounded-xl border border-slate-700 bg-slate-800 py-1 shadow-xl">
          <button
            type="button"
            role="option"
            [attr.aria-selected]="!selected()"
            (click)="select('')"
            class="w-full px-4 py-2 text-left text-sm transition-colors"
            [class]="!selected() ? 'text-indigo-400 bg-slate-700' : 'text-slate-400 hover:bg-slate-700 hover:text-white'"
          >
            {{ placeholder() }}
          </button>
          @for (opt of options(); track opt.value) {
            <button
              type="button"
              role="option"
              [attr.aria-selected]="value() === opt.value"
              (click)="select(opt.value)"
              class="w-full px-4 py-2 text-left text-sm transition-colors"
              [class]="value() === opt.value ? 'text-indigo-400 bg-slate-700' : 'text-slate-300 hover:bg-slate-700 hover:text-white'"
            >
              {{ opt.label }}
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class SelectFilterComponent {
  private readonly el = inject(ElementRef);

  readonly placeholder = input<string>('All');
  readonly options = input.required<SelectOption[]>();
  readonly value = input<string>('');
  readonly valueChange = output<string>();

  readonly open = signal(false);

  readonly selected = computed(() => !!this.value());
  readonly selectedLabel = computed(() => {
    if (!this.value()) return this.placeholder();
    return this.options().find(o => o.value === this.value())?.label ?? this.placeholder();
  });

  toggle() { this.open.update(v => !v); }

  select(val: string) {
    this.valueChange.emit(val);
    this.open.set(false);
  }

  @HostListener('document:click', ['$event'])
  onOutsideClick(e: MouseEvent) {
    if (!this.el.nativeElement.contains(e.target)) {
      this.open.set(false);
    }
  }

  @HostListener('keydown.escape')
  onEscape() {
    this.open.set(false);
  }
}
