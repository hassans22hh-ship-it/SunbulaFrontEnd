/* core/layout/shell/shell.component.ts */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { ToastComponent } from '../../../shared/ui/toast/toast.component';

@Component({
  selector: 'sb-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, ToastComponent],
  templateUrl: './shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {}
