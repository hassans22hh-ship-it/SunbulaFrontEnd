import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value as string;
    if (!v) return null;

    const hasUpper   = /[A-Z]/.test(v);
    const hasLower   = /[a-z]/.test(v);
    const hasDigit   = /\d/.test(v);
    const hasSpecial = /[^a-zA-Z\d]/.test(v);
    const hasLength  = v.length >= 8;

    if (!hasUpper || !hasLower || !hasDigit || !hasSpecial || !hasLength) {
      return { passwordStrength: { hasUpper, hasLower, hasDigit, hasSpecial, hasLength } };
    }
    return null;
  };
}

export function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm  = group.get('confirmPassword')?.value;

  if (password && confirm && password !== confirm) {
    return { passwordMismatch: true };
  }
  return null;
}
