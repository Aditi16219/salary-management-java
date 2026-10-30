import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
})
export class Layout {
  protected readonly navItems = [
    { path: '/', label: 'Employees' },
    { path: '/insights', label: 'Insights' },
  ];
}
