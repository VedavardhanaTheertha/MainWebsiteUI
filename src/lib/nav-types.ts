// Shared shape for content.*.nav — declared explicitly because the generated
// content.ts infers a large literal union (one shape per distinct nav item)
// that's awkward to narrow at each call site.
export interface NavChild {
  key: string;
  label: string;
  href: string;
}

export interface NavItem {
  key: string;
  label: string;
  href?: string;
  children?: NavChild[];
}
