import { Component, input } from '@angular/core';

export type StatCardColor = 'teal' | 'cyan' | 'emerald' | 'sky';

const colorMap: Record<StatCardColor, string> = {
  teal: 'border-teal-500 bg-teal-50',
  cyan: 'border-cyan-500 bg-cyan-50',
  emerald: 'border-emerald-500 bg-emerald-50',
  sky: 'border-sky-500 bg-sky-50',
};

const textMap: Record<StatCardColor, string> = {
  teal: 'text-teal-700',
  cyan: 'text-cyan-700',
  emerald: 'text-emerald-700',
  sky: 'text-sky-700',
};

@Component({
  selector: 'app-stat-card',
  template: `
    <div class="rounded-xl border-l-4 p-4 shadow-sm" [class]="colorMap[color()]">
      <p class="text-xs font-semibold uppercase tracking-wide" [class]="textMap[color()]">{{ label() }}</p>
      <p class="text-2xl font-bold text-gray-900 mt-1">{{ value() }}</p>
      @if (sub()) {
        <p class="text-xs text-gray-400 mt-1">{{ sub() }}</p>
      }
    </div>
  `,
})
export class StatCard {
  protected readonly colorMap = colorMap;
  protected readonly textMap = textMap;

  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly sub = input<string>();
  readonly color = input<StatCardColor>('teal');
}
