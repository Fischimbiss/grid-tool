import { FileText, Cog, Share2, UserCog, BarChart3, Lock, Bot } from 'lucide-react';

export const NAV_ITEMS = [
  { key: 'basis', label: 'Basisinformationen', Icon: FileText },
  { key: 'system', label: 'Systembeschreibung', Icon: Cog },
  { key: 'apis', label: 'Schnittstellen', Icon: Share2 },
  { key: 'roles', label: 'Rollen / Berechtigungen', Icon: UserCog },
  { key: 'reports', label: 'Reports / Auswertungen / Anzeigen', Icon: BarChart3 },
  { key: 'privacy', label: 'Datenschutz / Compliance', Icon: Lock },
  { key: 'ai', label: 'Künstliche Intelligenz', Icon: Bot },
] as const;

export type NavKey = typeof NAV_ITEMS[number]['key'];
