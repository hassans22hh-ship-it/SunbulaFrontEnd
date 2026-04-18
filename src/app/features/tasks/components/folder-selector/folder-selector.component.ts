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
  templateUrl: './folder-selector.component.html',
  styleUrl: './folder-selector.component.scss'
})
export class FolderSelectorComponent implements ControlValueAccessor {
  folders = input<FolderDto[]>([]);

  value: string | null = null;
  disabled = false;

  onChange: (value: string | null) => void = () => {};
  onTouched: () => void = () => {};

  onChangeEl(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    const finalVal = val === '' ? null : val;
    this.value = finalVal;
    this.onChange(finalVal);
    this.onTouched();
  }

  writeValue(obj: string | null): void { this.value = obj; }
  registerOnChange(fn: (value: string | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }
}
