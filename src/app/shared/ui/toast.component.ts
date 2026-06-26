import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (toast.current(); as t) {
      <div
        role="alert"
        class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-start gap-3 rounded-xl px-5 py-4 shadow-2xl min-w-72 max-w-sm
          {{ t.type === 'success' ? 'bg-emerald-900 border border-emerald-700 text-emerald-100'
            : t.type === 'error'  ? 'bg-red-900 border border-red-700 text-red-100'
            : 'bg-slate-800 border border-slate-600 text-slate-100' }}"
      >
        <span class="mt-0.5 text-lg leading-none">
          {{ t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ' }}
        </span>
        <p class="flex-1 text-sm leading-snug">{{ t.message }}</p>
        <button
          (click)="toast.dismiss()"
          class="ml-2 text-current opacity-60 hover:opacity-100 leading-none text-base"
          aria-label="Close"
        >×</button>
      </div>
    }
  `,
})
export class ToastComponent {
  readonly toast = inject(ToastService);
}
