import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex justify-center py-12">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500"></div>
    </div>
  `,
})
export class SpinnerComponent {}
