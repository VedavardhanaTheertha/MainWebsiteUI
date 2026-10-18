const categoryTones: Record<string, string> = {
  festival: "bg-[var(--color-warning-50)] text-[var(--color-saffron-900)]",
  concert: "bg-[var(--color-info-50)] text-[var(--color-info-500)]",
  dance: "bg-[var(--color-danger-50)] text-[var(--color-danger-500)]",
  yakshagana: "bg-[var(--color-danger-50)] text-[var(--color-danger-500)]",
  pravachana: "bg-[var(--color-plum-50)] text-[var(--color-plum-500)]",
  utsava: "bg-[var(--color-saffron-100)] text-[var(--color-text-brand)]",
  pooja: "bg-[var(--color-warning-50)] text-[var(--color-saffron-900)]",
  parayana: "bg-[var(--color-info-50)] text-[var(--color-info-500)]",
  annadaana: "bg-[var(--color-success-50)] text-[var(--color-success-500)]",
  special: "bg-[var(--color-success-50)] text-[var(--color-success-500)]",
};

export function categoryToneClassName(code?: string): string {
  return code && Object.hasOwn(categoryTones, code)
    ? categoryTones[code]
    : categoryTones.utsava;
}
