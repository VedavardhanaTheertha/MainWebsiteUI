import { DesktopHeader } from "./DesktopHeader";
import { MobileHeader } from "./MobileHeader";

export function Header() {
  return (
    <>
      <MobileHeader />
      <DesktopHeader />
    </>
  );
}
