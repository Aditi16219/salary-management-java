import { Component, computed, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ChevronLeft, ChevronRight, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-pagination',
  imports: [LucideAngularModule, DecimalPipe],
  template: `
    <div class="flex items-center justify-between mt-4 text-sm text-gray-600">
      <span>{{ start() | number }}–{{ end() | number }} of {{ total() | number }}</span>
      <div class="flex items-center gap-1">
        <button
          (click)="pageChange.emit(page() - 1)"
          [disabled]="page() === 1"
          class="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <lucide-icon [img]="ChevronLeftIcon" [size]="18" />
        </button>
        <span class="px-2">Page {{ page() }} of {{ totalPages() }}</span>
        <button
          (click)="pageChange.emit(page() + 1)"
          [disabled]="page() >= totalPages()"
          class="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <lucide-icon [img]="ChevronRightIcon" [size]="18" />
        </button>
      </div>
    </div>
  `,
})
export class Pagination {
  protected readonly ChevronLeftIcon = ChevronLeft;
  protected readonly ChevronRightIcon = ChevronRight;

  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly total = input.required<number>();

  readonly pageChange = output<number>();

  protected readonly totalPages = computed(() => Math.ceil(this.total() / this.pageSize()));
  protected readonly start = computed(() => (this.page() - 1) * this.pageSize() + 1);
  protected readonly end = computed(() => Math.min(this.page() * this.pageSize(), this.total()));
}
