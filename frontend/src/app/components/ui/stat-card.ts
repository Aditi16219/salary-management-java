import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  template: `
    <div class="bg-white rounded-lg border border-gray-200 p-4">
      <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ label() }}</p>
      <p class="text-2xl font-bold text-gray-900 mt-1">{{ value() }}</p>
      @if (sub()) {
        <p class="text-xs text-gray-400 mt-1">{{ sub() }}</p>
      }
    </div>
  `,
})
export class StatCard {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly sub = input<string>();
}
