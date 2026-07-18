import {
  Sprout,
  Users,
  GraduationCap,
  Leaf,
  Droplets,
  Shield,
  ClipboardList,
  BarChart3,
  FlaskConical,
  SearchCheck,
  Banknote,
  Wheat,
  Home,
  HeartHandshake,
  CloudSun,
  Database,
  Globe,
  CircleDot,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  sprout: Sprout,
  users: Users,
  "graduation-cap": GraduationCap,
  leaf: Leaf,
  droplets: Droplets,
  shield: Shield,
  "clipboard-list": ClipboardList,
  "bar-chart-3": BarChart3,
  "flask-conical": FlaskConical,
  "search-check": SearchCheck,
  banknote: Banknote,
  wheat: Wheat,
  home: Home,
  "heart-handshake": HeartHandshake,
  "cloud-sun": CloudSun,
  database: Database,
  globe: Globe,
};

/** Renders a lucide icon by the name stored in the CMS, with a safe fallback. */
export function CmsIcon({ name, className }: { name?: string | null; className?: string }) {
  const Icon = (name && ICONS[name]) || CircleDot;
  return <Icon className={className} aria-hidden="true" />;
}
