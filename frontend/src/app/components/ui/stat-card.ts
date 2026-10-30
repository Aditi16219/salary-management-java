import { Component, input } from '@angular/core';

export type StatCardColor = 'indigo' | 'blue' | 'violet' | 'sky';

const colorMap: Record<StatCardColor, string> = {
  indigo: 'border-indigo-500 bg-indigo-50',
  blue: 'border-blue-500 bg-blue-50',
  violet: 'border-violet-500 bg-violet-50',
  sky: 'border-sky-500 bg-sky-50',
};

const textMap: Record<StatCardColor, string> = {
  indigo: 'text-indigo-700',
  blue: 'text-blue-700',
  violet: 'text-violet-700',
  sky: 'text-sky-700',
};

@Component({
  selector: 'app-stat-card',
  template: `
    <div class="rounded-lg border-l-4 p-4 shadow-sm" [class]="colorMap[color()]">
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
  readonly color = input<StatCardColor>('indigo');
}
