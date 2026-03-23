import { ChangeDetectionStrategy, Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FolderDto } from '@shared/models/task.models';

@Component({
  selector: 'sb-folder-selector',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FolderSelectorComponent),
      multi: true
    }
  ],
  template: `
    <div class="folder-selector">
      <select 
        [disabled]="disabled" 
        [value]="value || ''" 
        (change)="onChangeEl($event)"
        (blur)="onTouched()"
        class="input-field"
      >
        <option value="">No Folder (Inbox)</option>
        @for (folder of folders(); track folder.id) {
          <option [value]="folder.id">{{ folder.name }}</option>
        }
      </select>
      
      <!-- Optional: Custom styled dropdown could be implemented here for a richer UI -->
    </div>
  `,
  styles: [`
    .folder-selector { position: relative; width: 100%; }
  `]
})
export class FolderSelectorComponent implements ControlValueAccessor {
  folders = input<FolderDto[]>([]);
  
  value: string | null = null;
  disabled = false;
  
  onChange: any = () => {};
  onTouched: any = () => {};

  onChangeEl(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    const finalVal = val === '' ? null : val;
    this.value = finalVal;
    this.onChange(finalVal);
    this.onTouched();
  }

  writeValue(obj: any): void {
    this.value = obj;
  }
  
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
