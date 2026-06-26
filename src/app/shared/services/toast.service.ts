import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly current = signal<Toast | null>(null);

  private timer: ReturnType<typeof setTimeout> | null = null;

  show(message: string, type: ToastType = 'success', durationMs = 4000) {
    if (this.timer) clearTimeout(this.timer);
    this.current.set({ message, type });
    this.timer = setTimeout(() => this.current.set(null), durationMs);
  }

  dismiss() {
    if (this.timer) clearTimeout(this.timer);
    this.current.set(null);
  }
}
