import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Reusable pagination control. Pages are zero-based.
 * Renders nothing when there is a single page or less.
 */
@Component({
  selector: 'app-paginator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (totalPages() > 1) {
      <div class="mt-6 flex justify-center gap-2">
        <button
          type="button"
          (click)="go(page() - 1)"
          [disabled]="page() === 0"
          class="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 disabled:opacity-40 hover:border-slate-600"
        >← Previous</button>
        <span class="flex items-center px-4 text-sm text-slate-400">{{ page() + 1 }} / {{ totalPages() }}</span>
        <button
          type="button"
          (click)="go(page() + 1)"
          [disabled]="page() === totalPages() - 1"
          class="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 disabled:opacity-40 hover:border-slate-600"
        >Next →</button>
      </div>
    }
  `,
})
export class PaginatorComponent {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly pageChange = output<number>();

  go(page: number) {
    if (page < 0 || page >= this.totalPages()) return;
    this.pageChange.emit(page);
  }
}
