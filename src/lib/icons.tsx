import {
  BookOpen,
  Calendar,
  Clock,
  HeartHandshake,
  Images,
  Mail,
  MapPin,
  Phone,
  Sun,
  Users,
  type LucideIcon,
} from "lucide-react";

// Content YAML references icons by name (e.g. icon: "Sun"). Only the names
// actually used in content/*.yml need to be registered here — this keeps the
// icon set small and intentional rather than exposing all ~6000 lucide icons.
const ICONS: Record<string, LucideIcon> = {
  Sun,
  HeartHandshake,
  BookOpen,
  Users,
  Calendar,
  Images,
  MapPin,
  Phone,
  Mail,
  Clock,
};

export function getIcon(name: string): LucideIcon {
  return ICONS[name] ?? Sun;
}
