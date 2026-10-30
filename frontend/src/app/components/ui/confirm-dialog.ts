import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title()"
        class="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4"
      >
        <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ title() }}</h3>
        <p class="text-gray-600 text-sm mb-6">{{ message() }}</p>
        <div class="flex justify-end gap-3">
          <button
            (click)="cancel.emit()"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            (click)="confirm.emit()"
            [attr.aria-label]="title()"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            {{ confirmLabel() }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDialog {
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly confirmLabel = input('Delete');

  readonly confirm = output<void>();
  readonly cancel = output<void>();
}
