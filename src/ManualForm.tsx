// ganz oben:
'use client'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Square,
  CheckSquare,
  ArrowRight,
  Download,
  Upload,
  Wand2,
  Clipboard,
  FileJson,
  Save,
  Shuffle,
  RotateCw,
  Plus,
  Trash,
  MessageSquare,
  Bell,
  AtSign,
  X,
  Trash2,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  Paperclip,
  Pencil,
  User,
  PlayCircle,
  Circle,
  Wrench,
  Users,
  Handshake,
  Accessibility,
  Users2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { RichTextarea } from '@/components/ui/rich-textarea'
import cn from 'classnames'
import AITab from './AITab'
import { useUser } from './context/UserContext'
import SectionNav from './manual-form/SectionNav'
import { NAV_ITEMS, NavKey } from './manual-form/nav-items'
import { InfoTooltip } from './components/InfoTooltip'
import { systems, type System, type RegulationStatus, type DevelopmentStatus, type SystemPropertyOption, type UiTypeOption, type TenantSeparationOption } from './mock/systems'



const STAGES = [
  "Erstellung",
  "Vorprüfung",
  "Vorstellung BR",
  "Abstimmung BR",
  "Freigabe"
];

// -------------------- Rollen (Badges) --------------------
// Typen für Rollen
 type Role = {
  id: number;
  number: string; // Nummer der Rolle
  systemName: string; // Rollenname im System
  shopName: string; // Name im CAIMAN Rollenshop
  userName: string; // Nutzer der Rolle
  tasks: string[]; // Prozessuale Aufgaben
  permissions: string[]; // IT-Berechtigungen [Sichten]
  expanded?: boolean;
  editing?: boolean;
};

// -------------------- Schnittstellen --------------------
type InterfaceTypeOption = 'Schnittstelle' | 'API' | 'Microservice' | 'Manuell';
type InterfaceDirectionOption = 'Eingehend' | 'Ausgehend' | 'Bidirektional';

type InterfacePartner = {
  id: number;
  psi: string;
  name: string;
};

type InterfaceEntry = {
  id: number;
  number: string;
  name: string;
  type: InterfaceTypeOption;
  partner: InterfacePartner | null;
  direction: InterfaceDirectionOption;
  personalData: boolean | null;
  smallGroupData: boolean | null;
  dataDetails: string;
  purpose: string;
  attachments: string[];
  expanded?: boolean;
  editing?: boolean;
};

// Initialdaten basierend auf deiner Vorgabe

// -------------------- Basisinformationen --------------------
const ORGS: { code: string; label: string }[] = [
  { code: "Konzernweit", label: "Konzernweit (Alle Gesellschaften/Betriebe)" },
  { code: "DTAG", label: "DTAG (Deutsche Telekom AG)" },
  { code: "DTIT", label: "DTIT (Deutsche Telekom IT GmbH)" },
  { code: "DTS", label: "DTS (Deutsche Telekom Service GmbH)" },
  { code: "DTSE", label: "DTSE (Deutsche Telekom Services Europe SE)" },
  { code: "DTT", label: "DTT (Deutsche Telekom Technik)" },
  { code: "DTTZA", label: "DTTZA (DT Technik - Betrieb Zentrum Access)" },
  { code: "DTTZC", label: "DTTZC (DT Technik - Betrieb Zentrum Core)" },
  { code: "GHQ", label: "GHQ (DT AG - Betriebe Konzernzentrale)" },
  { code: "GK", label: "GK (DT Geschäftskunden GmbH)" },
  { code: "GSUS", label: "GSUS (DT AG - Betrieb Group Supply Services)" },
  { code: "IOT", label: "IOT (Deutsche Telekom IoT GmbH)" },
  { code: "ISP", label: "ISP (DT Individual Solutions & Products GmbH)" },
  { code: "PVG", label: "PVG (DT Privatkunden-Vertrieb GmbH)" },
  { code: "SEC", label: "SEC (Deutsche Telekom Security GmbH)" },
  { code: "TDG", label: "TDG (Telekom Deutschland GmbH)" },
  { code: "TI", label: "TI (DT AG - Betrieb Technology & Innovation)" },
  { code: "TSI", label: "TSI (T-Systems International GmbH)" },
  { code: "WS", label: "WS (TDG - Betrieb Zentrum Wholesale)" }
];

type BasisMatrixEntry = {
  active: boolean;
  data: boolean;
  activeCount: number;
  dataCount: number;
};

type BasisInfo = {
  shortName: string; // Kurzbezeichnung des Systems / Projekts
  longName: string; // Langbezeichnung des Systems / Projekts
  psi: string; // PSI-Nummer
  regulationStatus: RegulationStatus; // Regelungsstatus des IT-Systems / Projekts
  developmentStatus: DevelopmentStatus; // Entwicklungsstatus
  replacingLegacy: boolean; // Ablösung Altsystem
  legacyPsi: string; // PSI-Nummer Altsystem
  legacyShortName: string; // Kurzbezeichnung Altsystem
  legacyNotes: string; // Weitere Anmerkungen Altsystem
  shortDescription: string; // Kurzbeschreibung des Systems (Rich Text)
  aiPlanned: boolean; // KI geplant/vorhanden
  interfacesPlanned: boolean; // Schnittstellen geplant/vorhanden
  systemProperty: SystemPropertyOption; // Systemeigenschaft
  uiType: UiTypeOption; // Benutzeroberfläche
  tenantSeparation: TenantSeparationOption; // Mandantentrennung
  matrix: Record<string, BasisMatrixEntry>; // Betroffene Gesellschaften/Betriebe
};

const makeInitialBasis = (): BasisInfo => ({
  shortName: "",
  longName: "",
  psi: "",
  regulationStatus: "Neu",
  developmentStatus: "in Vorbereitung",
  replacingLegacy: false,
  legacyPsi: "",
  legacyShortName: "",
  legacyNotes: "",
  shortDescription: "",
  aiPlanned: false,
  interfacesPlanned: false,
  systemProperty: "none",
  uiType: "gui",
  tenantSeparation: "none",
  matrix: ORGS.reduce((acc, o) => {
    acc[o.code] = { active: false, data: false, activeCount: 0, dataCount: 0 };
    return acc;
  }, {} as Record<string, BasisMatrixEntry>)
});

// -------------------- Kommentare (Sichtbarkeit, Reminders, Global-Übersicht) --------------------
const VISIBILITY = {
  ALL: "Alle",
  GROUP: "Gruppe",
  USER: "Einzelner Nutzer",
  PRIVATE: "Nur ich"
} as const;

type Visibility = typeof VISIBILITY[keyof typeof VISIBILITY];

type CommentT = {
  id: number;
  text: string;
  read: boolean;
  visibility: Visibility;
  user?: string;
  group?: string;
  reminder?: number;
  reminderShown?: boolean;
  replies?: CommentT[];
};

type SectionComments = Record<string, CommentT[]>;

const makeInitialComments = (): SectionComments => ({
  basis: [
    { id: 1, text: "Bitte Kurzbeschreibung ergänzen.", read: false, replies: [], visibility: VISIBILITY.ALL },
    { id: 2, text: "Falsches Format im Feld 'Projekt-ID'", read: true, replies: [], visibility: VISIBILITY.ALL }
  ],
  system: [
    {
      id: 3,
      text: "Architekturdiagramm anhängen. @Max",
      read: false,
      replies: [{ id: 31, text: "Diagramm wird nachgereicht.", read: true, visibility: VISIBILITY.ALL }],
      visibility: VISIBILITY.GROUP,
      group: "Architektur-Team"
    }
  ],
  apis: [{ id: 4, text: "Liste der externen Endpunkte prüfen.", read: true, replies: [], visibility: VISIBILITY.ALL }],
  roles: [
    { id: 8, text: "Neue Rolle TA 2 prüfen. @Anna #Recruiting", read: false, replies: [], visibility: VISIBILITY.ALL }
  ],
  reports: [
    { id: 5, text: "Report-Frequenz monatlich bestätigen.", read: false, replies: [], visibility: VISIBILITY.ALL }
  ],
  privacy: [{ id: 6, text: "AVV hochladen.", read: true, replies: [], visibility: VISIBILITY.ALL }],
  ai: [
    { id: 7, text: "Modelldokumentation (Bias) ergänzen.", read: false, replies: [], visibility: VISIBILITY.PRIVATE, reminder: Date.now() + 1000 * 60 * 60 }
  ]
});

// --- Demo-Mentions ---
const MENTION_USERS = ["Max", "Anna", "Sven", "Lisa", "IT-Support"];
const MENTION_GROUPS = ["Architektur-Team", "Recruiting", "HR", "Datenschutz"];

function HighlightedText({ text }: { text: string }) {
  const parts = text.split(/([@#][\w-]+)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (/^[@#]/.test(p)) {
          const isUser = p.startsWith("@");
          return (
            <span key={i} className={`${isUser ? "text-sky-700 bg-sky-50" : "text-violet-700 bg-violet-50"} px-1 rounded`}>{p}</span>
          );
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

interface ManualFormProps {
  system?: System
}

export default function ManualForm({ system }: ManualFormProps) {
  const { role } = useUser()
  const [user, setUser] = useState({
    name: 'Ich',
    avatar: '',
    roles: ['BR', 'F.SysV', 'HR'],
    groups: ['Architektur-Team'],
    currentRole: role,
  });
  const [showProfile, setShowProfile] = useState(false);
  const hasRole = (r: string) => role === r;
  const isBR = role === 'BR';
  const canEdit = role === 'FSysV';
  const [currentStage, setCurrentStage] = useState(2); // 0-based index of the current status
  // active Tab
  const [activeKey, setActiveKey] = useState<NavKey>(NAV_ITEMS[0].key);

  // Rollen-State
  const [roles, setRoles] = useState<Role[]>(() => {
    if (system && system.categories.roles) {
      return system.categories.roles as Role[];
    }
    return [];
  });

  const makeInterfaceFromString = (name: string, idx: number): InterfaceEntry => ({
    id: Date.now() + idx,
    number: `I-${idx + 1}`,
    name,
    type: 'Schnittstelle',
    partner: null,
    direction: 'Bidirektional',
    personalData: null,
    smallGroupData: null,
    dataDetails: '',
    purpose: '',
    attachments: [],
    expanded: false,
    editing: false,
  });

  const [interfaces, setInterfaces] = useState<InterfaceEntry[]>(() => {
    if (system && system.categories.interfaces?.length) {
      return system.categories.interfaces.map((name, idx) => makeInterfaceFromString(name, idx));
    }
    return [];
  });

  const emptyInterfaceDraft = (): Omit<InterfaceEntry, 'id' | 'expanded' | 'editing'> => ({
    number: '',
    name: '',
    type: 'Schnittstelle',
    partner: null,
    direction: 'Eingehend',
    personalData: null,
    smallGroupData: null,
    dataDetails: '',
    purpose: '',
    attachments: [],
  });

  const [interfaceDraft, setInterfaceDraft] = useState<Omit<InterfaceEntry, 'id' | 'expanded' | 'editing'>>(() => emptyInterfaceDraft());
  const [interfaceSearchTerms, setInterfaceSearchTerms] = useState<Record<string, string>>({ draft: '' });

  // Basisinformationen State
  const [basis, setBasis] = useState<BasisInfo>(() => {
    const initial = makeInitialBasis();
    if (system) {
      return {
        ...initial,
        shortName: system.shortName,
        longName: system.longName,
        psi: system.categories.basis.psi,
        regulationStatus: system.categories.basis.regulationStatus,
        developmentStatus: system.categories.basis.developmentStatus,
        replacingLegacy: system.categories.basis.replacingLegacy,
        legacyPsi: system.categories.basis.legacyPsi,
        legacyShortName: system.categories.basis.legacyShortName,
        legacyNotes: system.categories.basis.legacyNotes,
        shortDescription: system.categories.basis.shortDescription,
        aiPlanned: system.categories.basis.aiPlanned,
        interfacesPlanned: system.categories.basis.interfacesPlanned,
        systemProperty: system.categories.basis.systemProperty,
        uiType: system.categories.basis.uiType,
        tenantSeparation: system.categories.basis.tenantSeparation,
        matrix: { ...initial.matrix, ...(system.categories.basis.matrix || {}) },
      };
    }
    return initial;
  });

  const [shortNameEdited, setShortNameEdited] = useState(false);
  const [longNameEdited, setLongNameEdited] = useState(false);
  const [legacyShortNameEdited, setLegacyShortNameEdited] = useState(false);

  const [matrixExpanded, setMatrixExpanded] = useState(false);

  // -------------------- Versionierung & Change Requests --------------------
  type Snapshot = {
    basis: BasisInfo;
    roles: Array<Omit<Role, 'expanded' | 'editing'>>;
    interfaces: Array<Omit<InterfaceEntry, 'expanded' | 'editing'>>;
  };

  type VersionRecord = {
    version: string; // e.g. "1.0", "1.1"
    snapshot: Snapshot;
    createdAt: number;
    createdBy: string;
  };

  type DiffItem = {
    path: string; // e.g. "basis.shortName" or "roles[0].systemName"
    type: 'added' | 'removed' | 'changed';
    before?: any;
    after?: any;
  };

  type ChangeRequestRecord = {
    id: string;
    version: string; // proposed version (next from current)
    fromVersion: string; // the base approved version
    proposed: Snapshot; // full proposed snapshot
    changes: DiffItem[]; // computed diff vs base
    status: 'open' | 'approved' | 'rejected';
    createdAt: number;
    createdBy: string;
    decidedAt?: number;
    decidedBy?: string;
  };

  type VersioningState = {
    gripId: string;
    currentVersion: string | null; // becomes "1.0" after first Freigabe
    versions: VersionRecord[]; // approved versions, latest matches currentVersion
    changeRequests: ChangeRequestRecord[]; // open and decided CRs
    activeView: { kind: 'current' } | { kind: 'cr'; id: string };
  };

  const versioningKey = `versioning-${system?.id ?? 'draft'}`;

  const loadVersioning = (): VersioningState => {
    try {
      const raw = localStorage.getItem(versioningKey);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      gripId: '1234-ABC-15',
      currentVersion: null,
      versions: [],
      changeRequests: [],
      activeView: { kind: 'current' },
    };
  };

  const [versioning, setVersioning] = useState<VersioningState>(loadVersioning);

  const persistVersioning = (next: VersioningState) => {
    setVersioning(next);
    try {
      localStorage.setItem(versioningKey, JSON.stringify(next));
    } catch {}
  };

  const getSnapshot = useCallback((): Snapshot => {
    const normalizeRole = (r: Role): Omit<Role, 'expanded' | 'editing'> => ({
      id: r.id,
      number: r.number,
      systemName: r.systemName,
      shopName: r.shopName,
      userName: r.userName,
      tasks: r.tasks,
      permissions: r.permissions,
    });
    const normalizeInterface = (i: InterfaceEntry): Omit<InterfaceEntry, 'expanded' | 'editing'> => ({
      id: i.id,
      number: i.number,
      name: i.name,
      type: i.type,
      partner: i.partner,
      direction: i.direction,
      personalData: i.personalData,
      smallGroupData: i.smallGroupData,
      dataDetails: i.dataDetails,
      purpose: i.purpose,
      attachments: i.attachments,
    });
    return {
      basis,
      roles: roles.map(normalizeRole),
      interfaces: interfaces.map(normalizeInterface),
    };
  }, [basis, interfaces, roles]);

  const pathJoin = (base: string, segment: string) => (base ? `${base}.${segment}` : segment);

  const diffValues = (before: any, after: any, basePath = ''): DiffItem[] => {
    if (typeof before !== 'object' || before === null || typeof after !== 'object' || after === null) {
      if (JSON.stringify(before) !== JSON.stringify(after)) {
        return [{ path: basePath || '(root)', type: 'changed', before, after }];
      }
      return [];
    }

    if (Array.isArray(before) && Array.isArray(after)) {
      // naive array diff based on index
      const max = Math.max(before.length, after.length);
      const items: DiffItem[] = [];
      for (let i = 0; i < max; i++) {
        const p = `${basePath}[${i}]`;
        if (i >= before.length) {
          items.push({ path: p, type: 'added', after: after[i] });
        } else if (i >= after.length) {
          items.push({ path: p, type: 'removed', before: before[i] });
        } else {
          items.push(...diffValues(before[i], after[i], p));
        }
      }
      return items;
    }

    // object diff
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    const diffs: DiffItem[] = [];
    keys.forEach((k) => {
      const p = pathJoin(basePath, k);
      if (!(k in before)) {
        diffs.push({ path: p, type: 'added', after: (after as any)[k] });
      } else if (!(k in after)) {
        diffs.push({ path: p, type: 'removed', before: (before as any)[k] });
      } else {
        const sub = diffValues((before as any)[k], (after as any)[k], p);
        diffs.push(...sub);
      }
    });
    return diffs;
  };

  const computeDiff = useCallback((from: Snapshot, to: Snapshot): DiffItem[] => {
    const diffs: DiffItem[] = [];
    diffs.push(...diffValues(from.basis, to.basis, 'basis'));
    diffs.push(...diffValues(from.roles, to.roles, 'roles'));
    diffs.push(...diffValues(from.interfaces, to.interfaces, 'interfaces'));
    return diffs;
  }, []);

  const createBaseline = useCallback(() => {
    if (versioning.currentVersion) return;
    const initialVersion = '1.0';
    const snapshot = getSnapshot();
    const vr: VersionRecord = {
      version: initialVersion,
      snapshot,
      createdAt: Date.now(),
      createdBy: user.name,
    };
    const nextState: VersioningState = {
      ...versioning,
      currentVersion: initialVersion,
      versions: [vr],
    };
    persistVersioning(nextState);
  }, [versioning, getSnapshot, user.name]);

  const openCrFromCurrent = useCallback(() => {
    if (!versioning.currentVersion) return;
    const base = versioning.versions.find((v) => v.version === versioning.currentVersion);
    if (!base) return;
    if (versioning.changeRequests.some((cr) => cr.status === 'open')) return;
    const proposed = getSnapshot();
    const changes = computeDiff(base.snapshot, proposed);
    if (changes.length === 0) return;
    const cr: ChangeRequestRecord = {
      id: `${Date.now()}`,
      version: nextVersion(versioning.currentVersion),
      fromVersion: versioning.currentVersion,
      proposed,
      changes,
      status: 'open',
      createdAt: Date.now(),
      createdBy: user.name,
    };
    const nextState: VersioningState = {
      ...versioning,
      changeRequests: [cr, ...versioning.changeRequests],
      activeView: { kind: 'cr', id: cr.id },
    };
    persistVersioning(nextState);
  }, [versioning, getSnapshot, computeDiff, user.name]);

  const nextVersion = (current: string): string => {
    const [majStr, minStr] = current.split('.');
    const major = Number(majStr || '1');
    const minor = Number(minStr || '0');
    if (minor < 9) return `${major}.${minor + 1}`;
    return `${major + 1}.0`;
  };


  // Neuer-Badge-Entwurf
  const [draft, setDraft] = useState<
    Omit<Role, "id" | "tasks" | "permissions"> & { tasks?: string; permissions?: string }
  >({ number: "", systemName: "", shopName: "", userName: "", expanded: true, editing: true });

  // Kommentare State
  const [commentsBySection, setCommentsBySection] = useState<SectionComments>(
    makeInitialComments()
  );
  const [expandedCommentSections, setExpandedCommentSections] = useState<Record<string, boolean>>({});
  const [collapsedComments, setCollapsedComments] = useState<Record<string, boolean>>({}); // Kompaktansicht pro Bereich

  // Global (allgemeine) Kommentare UI
  const [showGlobalComments, setShowGlobalComments] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [globalOnlyUnread, setGlobalOnlyUnread] = useState(false);
  const [globalOnlyReminders, setGlobalOnlyReminders] = useState(false);
  const [globalVisibility, setGlobalVisibility] = useState<Visibility | "ALLE">("ALLE");
  const [globalSort, setGlobalSort] = useState<"neueste" | "älteste" | "bereich">("neueste");

  // Bearbeiter Panel
  const [showBearbeiter, setShowBearbeiter] = useState(false);
  const [bearbeiter, setBearbeiter] = useState({
    fSysV: 'Anna Fach',
    tSysV: 'Thomas Technik',
    aspHR: 'Hannah HR',
    aspBR: 'Bruno Rat',
    aspSBV: 'Sven SBV',
    group: 'Systemgruppe A',
  });
  const [editingBearbeiter, setEditingBearbeiter] = useState<string | null>(null);
  const BEARBEITER_FIELDS = [
    { key: 'fSysV', label: 'F.SysV', title: 'fachseitige Systemverantwortung', Icon: User },
    { key: 'tSysV', label: 'T.SysV', title: 'Technische Systemverantwortung', Icon: Wrench },
    { key: 'aspHR', label: 'ASP HR', title: 'Ansprechpartner Human Ressources', Icon: Users },
    { key: 'aspBR', label: 'ASP BR', title: 'Ansprechpartner Betriebsrat', Icon: Handshake },
    { key: 'aspSBV', label: 'ASP SBV', title: 'Ansprechpartner Schwerbehinderten vertretung', Icon: Accessibility },
    { key: 'group', label: 'Systemgruppe KBR', title: '', Icon: Users2 },
  ] as const;

  const canEditBearbeiterField = (key: string) => {
    if (!isBR) return true;
    return key === 'aspBR' || key === 'group';
  };

  // Demo: aktueller Nutzer & Gruppen (für Sichtbarkeiten)
  const currentUser = user.name;
  const currentGroups = user.groups;

  const activeItem = NAV_ITEMS.find((n) => n.key === activeKey) || NAV_ITEMS[0];

  // Refs für Scroll-to-Comment
  const commentItemRefs = useRef<Record<string, Record<number, HTMLElement>>>({});

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUser((prev) => ({ ...prev, avatar: url }));
    }
  };

  // Persistenz
  useEffect(() => {
    localStorage.setItem("roles-badges", JSON.stringify(roles));
  }, [roles]);
  useEffect(() => {
    localStorage.setItem("commentsBySection", JSON.stringify(commentsBySection));
  }, [commentsBySection]);
  useEffect(() => {
    localStorage.setItem("basis-info", JSON.stringify(basis));
  }, [basis]);

  // Create baseline version 1.0 when first time reaching Freigabe
  useEffect(() => {
    const isAtFreigabe = currentStage === STAGES.length - 1;
    if (!isAtFreigabe) return;
    if (versioning.currentVersion) return;
    // Create 1.0
    const initialVersion = '1.0';
    const snapshot = getSnapshot();
    const vr: VersionRecord = {
      version: initialVersion,
      snapshot,
      createdAt: Date.now(),
      createdBy: user.name,
    };
    const nextState: VersioningState = {
      ...versioning,
      currentVersion: initialVersion,
      versions: [vr],
    };
    persistVersioning(nextState);
  }, [currentStage]);

  const [suppressCR, setSuppressCR] = useState(false);

  // Auto-create or update CR on any change after Freigabe
  useEffect(() => {
    if (suppressCR) return;
    if (!versioning.currentVersion) return; // only after baseline exists
    const base = versioning.versions.find(v => v.version === versioning.currentVersion);
    if (!base) return;

    const proposed = getSnapshot();
    const changes = computeDiff(base.snapshot, proposed);
    const hasChanges = changes.length > 0;

    const openCr = versioning.changeRequests.find(cr => cr.status === 'open');
    if (!hasChanges) {
      // If no changes and we had an open CR, we keep it but with empty diff (user reverted changes)
      if (openCr) {
        const updated: VersioningState = {
          ...versioning,
          changeRequests: versioning.changeRequests.map(cr => cr.id === openCr.id ? { ...cr, proposed, changes } : cr)
        };
        persistVersioning(updated);
      }
      return;
    }

    if (openCr) {
      const updated: VersioningState = {
        ...versioning,
        changeRequests: versioning.changeRequests.map(cr => cr.id === openCr.id ? { ...cr, proposed, changes } : cr)
      };
      persistVersioning(updated);
      return;
    }

    // create new CR
    const newVersion = nextVersion(versioning.currentVersion);
    const cr: ChangeRequestRecord = {
      id: `${Date.now()}`,
      version: newVersion,
      fromVersion: versioning.currentVersion,
      proposed,
      changes,
      status: 'open',
      createdAt: Date.now(),
      createdBy: user.name,
    };
    const nextState: VersioningState = {
      ...versioning,
      changeRequests: [cr, ...versioning.changeRequests],
      activeView: versioning.activeView.kind === 'current' ? { kind: 'cr', id: cr.id } : versioning.activeView,
    };
    persistVersioning(nextState);
  }, [basis, roles]);

  const activeCr = versioning.activeView.kind === 'cr' ? versioning.changeRequests.find(cr => cr.id === versioning.activeView.id) : undefined;

  const approveCr = () => {
    if (!activeCr) return;
    // Apply proposed snapshot to state and finalize version
    setSuppressCR(true);
    try {
      // apply basis
      setBasis(activeCr.proposed.basis);
      // apply roles
      setRoles(activeCr.proposed.roles as any);

      const vr: VersionRecord = {
        version: activeCr.version,
        snapshot: activeCr.proposed,
        createdAt: Date.now(),
        createdBy: user.name,
      };
      const updated: VersioningState = {
        ...versioning,
        currentVersion: activeCr.version,
        versions: [...versioning.versions, vr],
        changeRequests: versioning.changeRequests.map(cr => cr.id === activeCr.id ? { ...cr, status: 'approved', decidedAt: Date.now(), decidedBy: user.name } : cr),
        activeView: { kind: 'current' },
      };
      persistVersioning(updated);
    } finally {
      setTimeout(() => setSuppressCR(false), 0);
    }
  };

  const rejectCr = () => {
    if (!activeCr) return;
    const updated: VersioningState = {
      ...versioning,
      changeRequests: versioning.changeRequests.map(cr => cr.id === activeCr.id ? { ...cr, status: 'rejected', decidedAt: Date.now(), decidedBy: user.name } : cr),
      activeView: { kind: 'current' },
    };
    persistVersioning(updated);
  };

  // Reminder-Popups für private Wiedervorlagen
  useEffect(() => {
    const interval = setInterval(() => {
      setCommentsBySection((prev) => {
        const clone: SectionComments = JSON.parse(JSON.stringify(prev));
        Object.values(clone).flat().forEach((c: CommentT) => {
          if (c.visibility === VISIBILITY.PRIVATE && c.reminder && Date.now() > c.reminder && !c.reminderShown) {
            alert(`Erinnerung: Kommentar "${c.text}" ist fällig.`);
            c.reminderShown = true;
          }
        });
        return clone;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Ableitungen
  const canSee = (c: CommentT) => {
    if (c.visibility === VISIBILITY.ALL) return true;
    if (c.visibility === VISIBILITY.PRIVATE) return true; // im echten System nur Ersteller
    if (c.visibility === VISIBILITY.USER) return c.user === currentUser;
    if (c.visibility === VISIBILITY.GROUP) return !!(c.group && currentGroups.includes(c.group));
    return true;
  };

  const unreadBySection = useMemo(() => {
    const map: Record<string, number> = {};
    NAV_ITEMS.forEach((n) => {
      const arr = (commentsBySection[n.key] || []).filter(canSee);
      map[n.key] = arr.filter((c) => !c.read).length;
    });
    return map;
  }, [commentsBySection]);

  const allWithSection = useMemo(
    () => NAV_ITEMS.flatMap((n) => (commentsBySection[n.key] || []).map((c) => ({ sectionKey: n.key, sectionLabel: n.label, c }))),
    [commentsBySection]
  );
  const allVisible = allWithSection.filter(({ c }) => canSee(c));
  const totalComments = allVisible.length;
  const totalUnread = allVisible.filter(({ c }) => !c.read).length;
  const duePrivateReminders = allVisible.filter(({ c }) => c.visibility === VISIBILITY.PRIVATE && c.reminder && Date.now() > (c.reminder || 0));

  const globalFiltered = useMemo(() => {
    let arr = allVisible.slice();
    if (globalOnlyUnread) arr = arr.filter(({ c }) => !c.read);
    if (globalOnlyReminders) arr = arr.filter(({ c }) => c.visibility === VISIBILITY.PRIVATE && !!c.reminder);
    if (globalVisibility !== "ALLE") arr = arr.filter(({ c }) => c.visibility === globalVisibility);
    if (globalSearch) arr = arr.filter(({ c }) => `${c.text}`.toLowerCase().includes(globalSearch.toLowerCase()));
    if (globalSort === "neueste") arr.sort((a, b) => b.c.id - a.c.id);
    if (globalSort === "älteste") arr.sort((a, b) => a.c.id - b.c.id);
    if (globalSort === "bereich") arr.sort((a, b) => a.sectionLabel.localeCompare(b.sectionLabel));
    return arr;
  }, [allVisible, globalSearch, globalOnlyUnread, globalOnlyReminders, globalVisibility, globalSort]);

  // Actions Kommentare
  const scrollToFirstUnread = (key: string) => {
    const arr = (commentsBySection[key] || []).filter(canSee);
    const firstUnread = arr.find((c) => !c.read);
    if (!firstUnread) return;
    setTimeout(() => {
      const el = commentItemRefs.current?.[key]?.[firstUnread.id];
      if (el?.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const jumpToComment = (sectionKey: string, commentId: number) => {
    setActiveKey(sectionKey);
    setExpandedCommentSections((prev) => ({ ...prev, [sectionKey]: true }));
    setTimeout(() => {
      const el = commentItemRefs.current?.[sectionKey]?.[commentId];
      if (el?.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
    setShowGlobalComments(false);
  };

  const markAllReadInSection = (key: string) => {
    if (isBR) return; // BR: read-only
    setCommentsBySection((prev) => ({
      ...prev,
      [key]: (prev[key] || []).map((c) => ({ ...c, read: true }))
    }));
  };

  const toggleRead = (key: string, id: number) => {
    if (isBR) return; // BR: read-only
    setCommentsBySection((prev) => ({
      ...prev,
      [key]: (prev[key] || []).map((c) => (c.id === id ? { ...c, read: !c.read } : c))
    }));
  };

  const addReply = (sectionKey: string, commentId: number, text: string) => {
    if (isBR) return; // BR: read-only
    setCommentsBySection((prev) => ({
      ...prev,
      [sectionKey]: (prev[sectionKey] || []).map((c) =>
        c.id === commentId
          ? {
              ...c,
              replies: [...(c.replies || []), { id: Date.now(), text, read: false, visibility: VISIBILITY.ALL }]
            }
          : c
      )
    }));
  };

  const addComment = (
    sectionKey: string,
    text: string,
    visibility: Visibility = VISIBILITY.ALL,
    user?: string,
    group?: string,
    reminderISO?: string
  ) => {
    if (isBR) return; // BR: read-only
    const reminder = visibility === VISIBILITY.PRIVATE && reminderISO ? new Date(reminderISO).getTime() : undefined;
    setCommentsBySection((prev) => ({
      ...prev,
      [sectionKey]: [
        ...prev[sectionKey],
        { id: Date.now(), text, read: false, replies: [], visibility, user, group, reminder }
      ]
    }));
  };

  // --- Rollen-Helper
  const toggleExpand = (id: number) => setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, expanded: !r.expanded } : r)));
  const toggleEdit = (id: number) => setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, editing: !r.editing, expanded: true } : r)));
  const removeRole = (id: number) => setRoles((prev) => prev.filter((r) => r.id !== id));
  const updateRoleField = (id: number, field: keyof Role, value: any) => setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  const updateRoleList = (id: number, field: "tasks" | "permissions", multiline: string) => {
    const list = multiline.split("\n").map((s) => s.trim()).filter(Boolean);
    setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: list } : r)));
  };
  const addDraftAsRole = () => {
    if (!draft.number?.trim() || !draft.systemName?.trim()) return;
    const newRole: Role = {
      id: Date.now(),
      number: draft.number.trim(),
      systemName: draft.systemName.trim(),
      shopName: draft.shopName?.trim() || "",
      userName: draft.userName?.trim() || "",
      tasks: (draft as any).tasks ? (draft as any).tasks.split("\n").map((s: string) => s.trim()).filter(Boolean) : [],
      permissions: (draft as any).permissions ? (draft as any).permissions.split("\n").map((s: string) => s.trim()).filter(Boolean) : [],
      expanded: true,
      editing: false
    };
    setRoles((prev) => [newRole, ...prev]);
    setDraft({ number: "", systemName: "", shopName: "", userName: "", expanded: true, editing: true });
  };

  // --- Schnittstellen-Helper
  const toggleInterfaceExpand = (id: number) =>
    setInterfaces((prev) => prev.map((i) => (i.id === id ? { ...i, expanded: !i.expanded } : i)));

  const toggleInterfaceEdit = (id: number) =>
    setInterfaces((prev) => prev.map((i) => (i.id === id ? { ...i, editing: !i.editing, expanded: true } : i)));

  const removeInterface = (id: number) => setInterfaces((prev) => prev.filter((i) => i.id !== id));

  const updateInterfaceField = (id: number, field: keyof InterfaceEntry, value: any) =>
    setInterfaces((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  const updateInterfaceDraft = (field: keyof typeof interfaceDraft, value: any) =>
    setInterfaceDraft((prev) => ({ ...prev, [field]: value }));

  const parseSystemToPartner = (systemId: number): InterfacePartner | null => {
    const sys = systems.find((s) => s.id === systemId);
    if (!sys) return null;
    return { id: sys.id, psi: sys.categories.basis.psi, name: sys.shortName };
  };

  const selectInterfacePartner = (key: string | number, partner: InterfacePartner | null) => {
    if (key === 'draft') {
      setInterfaceDraft((prev) => ({ ...prev, partner }));
    } else {
      setInterfaces((prev) => prev.map((i) => (i.id === key ? { ...i, partner } : i)));
    }
    setInterfaceSearchTerms((prev) => ({ ...prev, [key]: partner ? `${partner.psi} – ${partner.name}` : '' }));
  };

  const handlePartnerSearchChange = (key: string | number, value: string) => {
    setInterfaceSearchTerms((prev) => ({ ...prev, [key]: value }));
  };

  const getPartnerOptions = (term: string) => {
    const q = term.toLowerCase();
    if (!q) return systems.slice(0, 5);
    return systems
      .filter(
        (s) =>
          s.categories.basis.psi.toLowerCase().includes(q) ||
          s.shortName.toLowerCase().includes(q) ||
          s.longName.toLowerCase().includes(q) ||
          `${s.id}`.includes(q)
      )
      .slice(0, 6);
  };

  const addInterface = () => {
    if (!interfaceDraft.number.trim() || !interfaceDraft.name.trim()) return;
    const newInterface: InterfaceEntry = {
      id: Date.now(),
      ...interfaceDraft,
      expanded: true,
      editing: false,
    };
    setInterfaces((prev) => [newInterface, ...prev]);
    setInterfaceDraft(emptyInterfaceDraft());
    setInterfaceSearchTerms((prev) => ({ ...prev, draft: '' }));
  };

  // Draft-Kommentar je Tab
  const [commentDrafts, setCommentDrafts] = useState<Record<string, { text: string; visibility: Visibility; user?: string; group?: string; reminder?: string }>>({});
  const currentDraft = commentDrafts[activeKey] || { text: "", visibility: VISIBILITY.ALL, user: "", group: "", reminder: "" };

  const setDraftField = (field: string, value: string) =>
    setCommentDrafts((prev) => ({ ...prev, [activeKey]: { ...currentDraft, [field]: value } }));

  // --- Mentions (einfaches Autocomplete) ---
  type MentionState = { open: boolean; type: "@" | "#" | null; query: string; options: string[] };
  const [mention, setMention] = useState<MentionState>({ open: false, type: null, query: "", options: [] });

  const updateMentionState = (value: string) => {
    const m = value.match(/(^|\s)([@#])(\w{0,20})$/);
    if (m) {
      const type = m[2] as "@" | "#";
      const q = m[3] || "";
      const source = type === "@" ? MENTION_USERS : MENTION_GROUPS;
      const opts = source.filter((x) => x.toLowerCase().startsWith(q.toLowerCase())).slice(0, 6);
      setMention({ open: true, type, query: q, options: opts });
    } else {
      setMention({ open: false, type: null, query: "", options: [] });
    }
  };

  const handleDraftChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setDraftField("text", val);
    updateMentionState(val);
  };

  const insertMention = (choice: string) => {
    const val = currentDraft.text || "";
    const replaced = val.replace(/(^|\s)([@#])(\w{0,20})$/, (_m, s, t) => `${s}${t}${choice} `);
    setDraftField("text", replaced);
    setMention({ open: false, type: null, query: "", options: [] });
  };

  // Utils
  const truncate = (s: string, n = 100) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

  // Basis-Helfer
  const updateBasisField = <K extends keyof BasisInfo>(field: K, value: BasisInfo[K]) =>
    setBasis((b) => ({ ...b, [field]: value }));
  const setMatrixValue = (
    code: string,
    key: keyof BasisMatrixEntry,
    value: boolean | number
  ) =>
    setBasis((b) => ({
      ...b,
      matrix: { ...b.matrix, [code]: { ...b.matrix[code], [key]: value } }
    }));
  const setMatrixChecked = (code: string, key: "active" | "data", checked: boolean) =>
    setBasis((b) => {
      const entry = b.matrix[code];
      const updated: BasisMatrixEntry = { ...entry, [key]: checked } as BasisMatrixEntry;
      if (!checked) {
        if (key === "active") updated.activeCount = 0;
        if (key === "data") updated.dataCount = 0;
      }
      return { ...b, matrix: { ...b.matrix, [code]: updated } };
    });
  const setMatrixCount = (
    code: string,
    key: "activeCount" | "dataCount",
    count: number
  ) => setMatrixValue(code, key, count);
  const selectAll = (type: "active" | "data", checked: boolean) =>
    setBasis((b) => ({
      ...b,
      matrix: Object.fromEntries(
        Object.entries(b.matrix).map(([k, v]) => [
          k,
          {
            ...v,
            [type]: checked,
            ...(checked ? {} : { [`${type}Count`]: 0 })
          }
        ])
      )
    }));

  const handleRegulationStatusChange = (nextStatus: RegulationStatus) => {
    setBasis((prev) => {
      const updated: BasisInfo = { ...prev, regulationStatus: nextStatus };
      if (nextStatus === "Nachregelung" || nextStatus === "Überführung") {
        updated.developmentStatus = "bereits im Wirkbetrieb";
      } else if (prev.developmentStatus === "bereits im Wirkbetrieb") {
        updated.developmentStatus = "in Vorbereitung";
      }
      return updated;
    });
  };

  const resetBasis = () => {
    setBasis(makeInitialBasis());
    setShortNameEdited(false);
    setLongNameEdited(false);
    setLegacyShortNameEdited(false);
  };

  const handleShortNameChange = (value: string) => {
    setShortNameEdited(true);
    updateBasisField("shortName", value);
  };

  const handleLongNameChange = (value: string) => {
    setLongNameEdited(true);
    updateBasisField("longName", value);
  };

  const handleLegacyShortNameChange = (value: string) => {
    setLegacyShortNameEdited(true);
    updateBasisField("legacyShortName", value);
  };

  useEffect(() => {
    const trimmed = basis.psi.trim();
    if (!trimmed) return;
    const match = systems.find((s) => s.categories.basis.psi.toLowerCase() === trimmed.toLowerCase());
    if (!match) return;
    let changed = false;
    setBasis((prev) => {
      const next = { ...prev };
      if (!shortNameEdited && prev.shortName !== match.shortName) {
        next.shortName = match.shortName;
        changed = true;
      }
      if (!longNameEdited && prev.longName !== match.longName) {
        next.longName = match.longName;
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [basis.psi, longNameEdited, shortNameEdited]);

  useEffect(() => {
    if (!basis.replacingLegacy) {
      setLegacyShortNameEdited(false);
      if (basis.legacyPsi || basis.legacyShortName || basis.legacyNotes) {
        setBasis((prev) => ({
          ...prev,
          legacyPsi: "",
          legacyShortName: "",
          legacyNotes: "",
        }));
      }
      return;
    }
    const trimmed = basis.legacyPsi.trim();
    if (!trimmed || legacyShortNameEdited) return;
    const match = systems.find((s) => s.categories.basis.psi.toLowerCase() === trimmed.toLowerCase());
    if (!match) return;
    setBasis((prev) => (prev.legacyShortName === match.shortName ? prev : { ...prev, legacyShortName: match.shortName }));
  }, [basis.legacyPsi, basis.legacyShortName, basis.legacyNotes, basis.replacingLegacy, legacyShortNameEdited]);

    return (
      <div className="p-6 bg-gray-200 text-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{basis.shortName || 'SYSTEM NAME'}</h1>
          <div className="text-gray-600 mt-1">
            <div className="flex items-center gap-3">
              <span className="block">GRIP-ID: {versioning.gripId}</span>
              <div className="min-w-[220px]">
                <Select
                  value={versioning.activeView.kind === 'current' ? 'current' : `cr:${versioning.activeView.id}`}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'current') {
                      persistVersioning({ ...versioning, activeView: { kind: 'current' } });
                    } else if (val.startsWith('cr:')) {
                      const id = val.slice(3);
                      persistVersioning({ ...versioning, activeView: { kind: 'cr', id } });
                    }
                  }}
                >
                  <option value="current">Aktuelle Version: {versioning.currentVersion ?? '—'}</option>
                  {versioning.changeRequests
                    .filter(cr => cr.status === 'open')
                    .map(cr => (
                      <option key={cr.id} value={`cr:${cr.id}`}>
                        Change Request v{cr.version} (offen)
                      </option>
                    ))}
                </Select>
              </div>
              <div className="flex items-center gap-2 ml-3">
                {!versioning.currentVersion ? (
                  <Button size="sm" onClick={createBaseline}>Baseline v1.0 erstellen</Button>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={openCrFromCurrent}
                    disabled={versioning.changeRequests.some(cr => cr.status === 'open')}
                    title={versioning.changeRequests.some(cr => cr.status === 'open') ? 'Es gibt bereits einen offenen CR' : ''}
                  >
                    CR manuell anlegen
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="bg-pink-500 hover:bg-pink-600 text-white"
            onClick={() => setShowBearbeiter(true)}
          >
            <User size={16} /> Bearbeiter
          </Button>
          <button
            onClick={() => setShowProfile(true)}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 flex items-center justify-center bg-white"
          >
            {user.avatar ? (
              <img src={user.avatar} alt="Profil" className="w-full h-full object-cover" />
            ) : (
              <User size={20} className="text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* CR Banner / Änderungsmodus inkl. Historie */}
      {versioning.activeView.kind === 'cr' && activeCr && (
        <div className="mb-4 rounded-md border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Change Request v{activeCr.version} (von v{activeCr.fromVersion})</div>
              <div className="text-xs text-gray-600">Erstellt von {activeCr.createdBy} am {new Date(activeCr.createdAt).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="neutral" onClick={() => persistVersioning({ ...versioning, activeView: { kind: 'current' } })}>Zur aktuellen Version</Button>
              {isBR ? (
                <>
                  <Button onClick={approveCr} disabled={activeCr.changes.length === 0}>Freigeben & Übernehmen</Button>
                  <Button variant="danger" onClick={rejectCr}>Ablehnen</Button>
                </>
              ) : (
                <Button disabled title="Nur BR kann freigeben">Freigeben</Button>
              )}
            </div>
          </div>
          <div className="mt-3">
            <div className="text-sm font-medium mb-2">Änderungsmodus inkl. Historie</div>
            {activeCr.changes.length === 0 ? (
              <div className="text-sm text-gray-500">Keine Änderungen gegenüber v{activeCr.fromVersion}.</div>
            ) : (
              <div className="max-h-64 overflow-auto border rounded-md">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2 w-36">Art</th>
                      <th className="text-left p-2">Pfad</th>
                      <th className="text-left p-2 w-1/3">Vorher</th>
                      <th className="text-left p-2 w-1/3">Nachher</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeCr.changes.map((c, i) => (
                      <tr key={i} className={
                        c.type === 'added' ? 'bg-green-50' : c.type === 'removed' ? 'bg-red-50' : 'bg-yellow-50'
                      }>
                        <td className="p-2">
                          {c.type === 'added' ? 'Hinzugefügt' : c.type === 'removed' ? 'Gelöscht' : 'Geändert'}
                        </td>
                        <td className="p-2">{c.path}</td>
                        <td className="p-2 text-xs text-gray-700 whitespace-pre-wrap">{typeof c.before === 'undefined' ? '—' : JSON.stringify(c.before, null, 2)}</td>
                        <td className="p-2 text-xs text-gray-700 whitespace-pre-wrap">{typeof c.after === 'undefined' ? '—' : JSON.stringify(c.after, null, 2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fortschritt */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        {STAGES.map((stage, idx) => {
          const isApproved = currentStage === STAGES.length - 1;
          const isDone = idx < currentStage || (isApproved && idx <= currentStage);
          const isCurrent = idx === currentStage && !isApproved;
          const statusIcon = isDone
            ? <CheckCircle size={18} />
            : isCurrent
              ? <PlayCircle size={18} />
              : <Circle size={18} />;
          const bgClass = isDone
            ? isApproved
              ? "bg-green-500 text-white"
              : "bg-pink-500 text-white"
            : isCurrent
              ? "bg-blue-500 text-white"
              : "bg-gray-300 text-gray-600";
          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center cursor-pointer"
              onClick={() => setCurrentStage(idx)}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${bgClass}`}>
                {statusIcon}
              </div>
              <span className="text-sm text-center">{stage}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Sidebar */}
        <div className="col-span-1 md:col-span-1">
          <div className="mb-4">
            <SectionNav
              activeKey={activeKey}
              onSelect={setActiveKey}
              unreadBySection={unreadBySection}
              onJumpToFirstUnread={(key) => {
                setActiveKey(key);
                setExpandedCommentSections((prev) => ({ ...prev, [key]: true }));
                scrollToFirstUnread(key);
              }}
            />
          </div>

          {/* Allgemeine Kommentare (klickbar) */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setShowGlobalComments(true)}>
                  <MessageSquare size={16} />
                  <span className="text-sm">Kommentare (gesamt: {totalComments})</span>
                </div>
                <div className="flex items-center gap-2">
                  {duePrivateReminders.length > 0 && (
                    <span className="flex items-center text-xs rounded-full px-2 py-0.5 bg-amber-500 text-white" title="Fällige private Wiedervorlagen">
                      <Bell size={12} className="mr-1" /> {duePrivateReminders.length}
                    </span>
                  )}
                  {totalUnread > 0 && (
                    <span className="text-xs rounded-full px-2 py-0.5 bg-blue-600 text-white">{totalUnread} neu</span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Paperclip size={16} />
                <span className="text-sm">Anhänge (3)</span>
              </div>
              <div>
                <Button size="sm" variant="secondary" onClick={() => setShowGlobalComments(true)}>Alle Kommentare anzeigen</Button>
              </div>
            </CardContent>
          </Card>

          {/* Versionen */}
          <div className="mt-4">
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="font-semibold">Versionen</div>
                {versioning.versions.length === 0 ? (
                  <div className="text-sm text-gray-500">Noch keine freigegebene Version.</div>
                ) : (
                  <ul className="text-sm space-y-1">
                    {versioning.versions.map(v => (
                      <li key={v.version} className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">v{v.version}</span>
                          <span className="text-gray-500 ml-2">{new Date(v.createdAt).toLocaleString()}</span>
                        </div>
                        <span className="text-xs text-gray-500">{v.createdBy}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Change Requests */}
          <div className="mt-4">
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="font-semibold">Change Requests</div>
                {versioning.changeRequests.length === 0 ? (
                  <div className="text-sm text-gray-500">Keine Change Requests.</div>
                ) : (
                  <ul className="text-sm space-y-1">
                    {versioning.changeRequests.map(cr => (
                      <li key={cr.id} className="flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="truncate">
                            CR v{cr.version} von v{cr.fromVersion}
                          </div>
                          <div className="text-xs text-gray-500">{new Date(cr.createdAt).toLocaleString()} • {cr.createdBy}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${cr.status === 'open' ? 'bg-amber-100 text-amber-700' : cr.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{cr.status}</span>
                          <Button size="sm" variant="secondary" onClick={() => persistVersioning({ ...versioning, activeView: { kind: 'cr', id: cr.id } })}>Öffnen</Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-1 lg:col-span-4 min-w-0 overflow-x-auto">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="font-semibold mb-3">{activeItem.label}</h2>

                {activeKey === "roles" ? (
                  <div className="space-y-4">
                    {/* Add new badge */}
                    {canEdit ? (
                      <div className="rounded-xl border bg-white p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-semibold">Neue Rolle hinzufügen</div>
                          <Button size="sm" onClick={addDraftAsRole}>
                            <Plus className="mr-2" size={16} /> Hinzufügen
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Nummer</label>
                            <Input value={draft.number} onChange={(e) => setDraft({ ...draft, number: e.target.value })} placeholder="z.B. TA 2" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Rollenname im System</label>
                            <Input value={draft.systemName} onChange={(e) => setDraft({ ...draft, systemName: e.target.value })} placeholder="z.B. Hiring Manager" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Name im CAIMAN Rollenshop</label>
                            <Input value={draft.shopName} onChange={(e) => setDraft({ ...draft, shopName: e.target.value })} placeholder="z.B. SKM-DC-..." />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Nutzer der Rolle</label>
                            <Input value={draft.userName} onChange={(e) => setDraft({ ...draft, userName: e.target.value })} placeholder="z.B. Recruiter" />
                          </div>
                          <div className="sm:col-span-2 xl:col-span-2">
                            <label className="block text-xs text-gray-500 mb-1">Prozessuale Aufgaben (je Zeile)</label>
                            <Textarea rows={3} value={(draft as any).tasks || ""} onChange={(e) => setDraft({ ...draft, tasks: e.target.value })} placeholder="Eine Aufgabe pro Zeile" />
                          </div>
                          <div className="sm:col-span-2 xl:col-span-2">
                            <label className="block text-xs text-gray-500 mb-1">IT-Berechtigungen [Sichten] (je Zeile)</label>
                            <Textarea rows={3} value={(draft as any).permissions || ""} onChange={(e) => setDraft({ ...draft, permissions: e.target.value })} placeholder="Eine Berechtigung pro Zeile" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border bg-gray-50 p-4 text-gray-400">
                        Keine Berechtigung neue Rollen hinzuzufügen.
                      </div>
                    )}

                    {/* Rollen-Badges */}
                    <div className="space-y-3">
                      {roles.map((role) => (
                        <div key={role.id} className="rounded-2xl border bg-white">
                          {/* Badge Header */}
                          <div
                            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 rounded-2xl"
                            onClick={() => toggleExpand(role.id)}
                          >
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                              <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-gray-100 font-medium">
                                {role.number}
                              </span>
                              <span className="font-medium">{role.systemName}</span>
                              <span className="text-gray-500 text-sm">Nutzer: {role.userName || "—"}</span>
                              {role.shopName && (
                                <span className="text-gray-500 text-sm">CAIMAN: {role.shopName}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {canEdit ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title={role.editing ? "Bearbeiten beenden" : "Bearbeiten"}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleEdit(role.id);
                                  }}
                                >
                                  <Pencil size={16} />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled
                                  title="Keine Berechtigung"
                                >
                                  <Pencil size={16} />
                                </Button>
                              )}
                              {canEdit ? (
                                <Button
                                  variant="danger"
                                  size="icon"
                                  title="Löschen"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeRole(role.id);
                                  }}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              ) : (
                                <Button
                                  variant="danger"
                                  size="icon"
                                  disabled
                                  title="Keine Berechtigung"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              )}
                              <Button variant="ghost" size="icon">
                                {role.expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                              </Button>
                            </div>
                          </div>

                          {/* Details */}
                          {role.expanded && (
                            <div className="px-4 pb-4">
                              {!role.editing ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Rollenbeschreibung – Prozessuale Aufgaben</label>
                                    <ul className="list-disc list-inside space-y-1 bg-gray-50 rounded-md p-3">
                                      {role.tasks.length ? role.tasks.map((t, i) => <li key={i}>{t}</li>) : <li className="text-gray-400">Keine Aufgaben hinterlegt</li>}
                                    </ul>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">IT-Berechtigungen [Sichten]</label>
                                    <ul className="list-disc list-inside space-y-1 bg-gray-50 rounded-md p-3">
                                      {role.permissions.length ? role.permissions.map((p, i) => <li key={i}>{p}</li>) : <li className="text-gray-400">Keine Berechtigungen hinterlegt</li>}
                                    </ul>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                                    <div>
                                      <label className="block text-xs text-gray-500 mb-1">Nummer</label>
                                      <Input value={role.number} onChange={(e) => updateRoleField(role.id, "number", e.target.value)} />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-500 mb-1">Rollenname im System</label>
                                      <Input value={role.systemName} onChange={(e) => updateRoleField(role.id, "systemName", e.target.value)} />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-500 mb-1">Name im CAIMAN Rollenshop</label>
                                      <Input value={role.shopName} onChange={(e) => updateRoleField(role.id, "shopName", e.target.value)} />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-500 mb-1">Nutzer der Rolle</label>
                                      <Input value={role.userName} onChange={(e) => updateRoleField(role.id, "userName", e.target.value)} />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-xs text-gray-500 mb-1">Prozessuale Aufgaben (je Zeile)</label>
                                      <Textarea rows={6} value={role.tasks.join("\n")} onChange={(e) => updateRoleList(role.id, "tasks", e.target.value)} />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-500 mb-1">IT-Berechtigungen [Sichten] (je Zeile)</label>
                                      <Textarea rows={6} value={role.permissions.join("\n")} onChange={(e) => updateRoleList(role.id, "permissions", e.target.value)} />
                                    </div>
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    {canEdit ? (
                                      <>
                                        <Button variant="neutral" onClick={() => toggleEdit(role.id)}>Abbrechen</Button>
                                        <Button onClick={() => toggleEdit(role.id)}>Speichern</Button>
                                      </>
                                    ) : (
                                      <>
                                        <Button variant="neutral" disabled>Abbrechen</Button>
                                        <Button disabled>Speichern</Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : activeKey === "apis" ? (
                  <div className="space-y-4">
                    {canEdit ? (
                      <div className="rounded-xl border bg-white p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">Schnittstelle hinzufügen</div>
                            <p className="text-xs text-gray-500">Füge eine neue Schnittstelle / API / Microservice hinzu.</p>
                          </div>
                          <Button size="sm" onClick={addInterface}>
                            <Plus className="mr-2" size={16} /> Hinzufügen
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Nummer</label>
                            <Input
                              value={interfaceDraft.number}
                              onChange={(e) => updateInterfaceDraft('number', e.target.value)}
                              placeholder="z.B. SI-01"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Bezeichnung</label>
                            <Input
                              value={interfaceDraft.name}
                              onChange={(e) => updateInterfaceDraft('name', e.target.value)}
                              placeholder="z.B. HR-Reporting API"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Typ</label>
                            <Select
                              value={interfaceDraft.type}
                              onChange={(e) => updateInterfaceDraft('type', e.target.value as InterfaceTypeOption)}
                            >
                              <option value="Schnittstelle">Schnittstelle</option>
                              <option value="API">API</option>
                              <option value="Microservice">Microservice</option>
                              <option value="Manuell">Manuell</option>
                            </Select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Schnittstellenpartner / System</label>
                            <Input
                              value={interfaceSearchTerms.draft || interfaceDraft.partner ? `${interfaceDraft.partner?.psi} – ${interfaceDraft.partner?.name}` : ''}
                              onChange={(e) => handlePartnerSearchChange('draft', e.target.value)}
                              placeholder="System-ID, PSI-Nr. oder Name"
                            />
                            <div className="mt-1 text-[11px] text-gray-500">Datenbank wird durchsucht – Einfachauswahl.</div>
                            <div className="mt-2 rounded-md border bg-gray-50 divide-y">
                              {getPartnerOptions(interfaceSearchTerms.draft || '').map((opt) => (
                                <button
                                  key={opt.id}
                                  type="button"
                                  className="w-full text-left px-2 py-1 text-sm hover:bg-white"
                                  onClick={() => selectInterfacePartner('draft', parseSystemToPartner(opt.id))}
                                >
                                  <div className="font-medium">{opt.shortName}</div>
                                  <div className="text-xs text-gray-500">{opt.categories.basis.psi} · {opt.longName}</div>
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Richtung / Typ der Schnittstelle</label>
                            <Select
                              value={interfaceDraft.direction}
                              onChange={(e) => updateInterfaceDraft('direction', e.target.value as InterfaceDirectionOption)}
                            >
                              <option value="Eingehend">Eingehend</option>
                              <option value="Ausgehend">Ausgehend</option>
                              <option value="Bidirektional">Bidirektional</option>
                            </Select>
                          </div>
                          <div>
                            <span className="block text-xs text-gray-500 mb-1">Personenbezogene Beschäftigtendaten - Frage A</span>
                            <div className="flex gap-4 text-sm">
                              <label className="inline-flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="personalDataDraft"
                                  checked={interfaceDraft.personalData === true}
                                  onChange={() => updateInterfaceDraft('personalData', true)}
                                />
                                <span>Ja</span>
                              </label>
                              <label className="inline-flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="personalDataDraft"
                                  checked={interfaceDraft.personalData === false}
                                  onChange={() => updateInterfaceDraft('personalData', false)}
                                />
                                <span>Nein</span>
                              </label>
                            </div>
                          </div>
                          {interfaceDraft.personalData === false && (
                            <div>
                              <span className="block text-xs text-gray-500 mb-1">
                                Daten von Personengruppen kleiner 5 Personen - Frage B
                              </span>
                              <div className="flex gap-4 text-sm">
                                <label className="inline-flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name="smallGroupDraft"
                                    checked={interfaceDraft.smallGroupData === true}
                                    onChange={() => updateInterfaceDraft('smallGroupData', true)}
                                  />
                                  <span>Ja</span>
                                </label>
                                <label className="inline-flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name="smallGroupDraft"
                                    checked={interfaceDraft.smallGroupData === false}
                                    onChange={() => updateInterfaceDraft('smallGroupData', false)}
                                  />
                                  <span>Nein</span>
                                </label>
                              </div>
                            </div>
                          )}
                        </div>

                        {(interfaceDraft.personalData || interfaceDraft.smallGroupData) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">
                                Art der personenbezogenen Daten / Personengruppen
                              </label>
                              <RichTextarea
                                value={interfaceDraft.dataDetails}
                                onChange={(v) => updateInterfaceDraft('dataDetails', v)}
                                rows={3}
                                toolbar
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Zweckbestimmung</label>
                              <RichTextarea
                                value={interfaceDraft.purpose}
                                onChange={(v) => updateInterfaceDraft('purpose', v)}
                                rows={3}
                                toolbar
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs text-gray-500 mb-1">Anhänge</label>
                              <div className="flex flex-wrap gap-2 items-center text-sm">
                                <Button variant="neutral" size="sm">
                                  <Paperclip size={14} className="mr-1" /> Datei auswählen
                                </Button>
                                <span className="text-xs text-gray-500">(Upload-Demo, keine echten Daten gespeichert)</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-xl border bg-gray-50 p-4 text-gray-400">Keine Berechtigung Schnittstellen zu bearbeiten.</div>
                    )}

                    <div className="space-y-3">
                      {interfaces.length === 0 ? (
                        <div className="rounded-xl border border-dashed bg-gray-50 p-6 text-center text-gray-500">
                          Noch keine Schnittstellen erfasst.
                        </div>
                      ) : (
                        interfaces.map((api) => {
                          const searchTerm = interfaceSearchTerms[api.id] ?? (api.partner ? `${api.partner.psi} – ${api.partner.name}` : '');
                          return (
                            <div key={api.id} className="rounded-2xl border bg-white">
                              <div
                                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 rounded-2xl"
                                onClick={() => toggleInterfaceExpand(api.id)}
                              >
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                  <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-gray-100 font-medium">
                                    {api.number}
                                  </span>
                                  <span className="font-medium">{api.name}</span>
                                  <span className="text-gray-500 text-sm">Typ: {api.type}</span>
                                  <span className="text-gray-500 text-sm">Richtung: {api.direction}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {canEdit ? (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleInterfaceEdit(api.id);
                                      }}
                                    >
                                      <Pencil size={16} />
                                    </Button>
                                  ) : (
                                    <Button variant="ghost" size="icon" disabled title="Keine Berechtigung">
                                      <Pencil size={16} />
                                    </Button>
                                  )}
                                  {canEdit ? (
                                    <Button
                                      variant="danger"
                                      size="icon"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeInterface(api.id);
                                      }}
                                    >
                                      <Trash2 size={16} />
                                    </Button>
                                  ) : (
                                    <Button variant="danger" size="icon" disabled title="Keine Berechtigung">
                                      <Trash2 size={16} />
                                    </Button>
                                  )}
                                  <Button variant="ghost" size="icon">
                                    {api.expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                  </Button>
                                </div>
                              </div>

                              {api.expanded && (
                                <div className="px-4 pb-4 space-y-4">
                                  {!api.editing ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-sm">
                                      <div className="rounded-lg bg-gray-50 p-3">
                                        <div className="text-xs text-gray-500">Schnittstellenpartner</div>
                                        <div className="font-medium">
                                          {api.partner ? `${api.partner.psi} – ${api.partner.name}` : '—'}
                                        </div>
                                      </div>
                                      <div className="rounded-lg bg-gray-50 p-3">
                                        <div className="text-xs text-gray-500">Personenbezogene Daten</div>
                                        <div className="font-medium">
                                          {api.personalData === null
                                            ? 'Nicht bewertet'
                                            : api.personalData
                                              ? 'Ja'
                                              : 'Nein'}
                                        </div>
                                      </div>
                                      <div className="rounded-lg bg-gray-50 p-3">
                                        <div className="text-xs text-gray-500">Daten kleiner Gruppen</div>
                                        <div className="font-medium">
                                          {api.smallGroupData === null ? 'Nicht bewertet' : api.smallGroupData ? 'Ja' : 'Nein'}
                                        </div>
                                      </div>
                                      {(api.personalData || api.smallGroupData) && (
                                        <div className="md:col-span-2 xl:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                                          <div>
                                            <div className="text-xs text-gray-500 mb-1">Art der Daten</div>
                                            <div className="rounded-lg bg-gray-50 p-3 whitespace-pre-wrap">
                                              {api.dataDetails || 'Keine Angaben'}
                                            </div>
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-500 mb-1">Zweckbestimmung</div>
                                            <div className="rounded-lg bg-gray-50 p-3 whitespace-pre-wrap">
                                              {api.purpose || 'Keine Angaben'}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                        <div>
                                          <label className="block text-xs text-gray-500 mb-1">Nummer</label>
                                          <Input value={api.number} onChange={(e) => updateInterfaceField(api.id, 'number', e.target.value)} />
                                        </div>
                                        <div>
                                          <label className="block text-xs text-gray-500 mb-1">Bezeichnung</label>
                                          <Input value={api.name} onChange={(e) => updateInterfaceField(api.id, 'name', e.target.value)} />
                                        </div>
                                        <div>
                                          <label className="block text-xs text-gray-500 mb-1">Typ</label>
                                          <Select value={api.type} onChange={(e) => updateInterfaceField(api.id, 'type', e.target.value as InterfaceTypeOption)}>
                                            <option value="Schnittstelle">Schnittstelle</option>
                                            <option value="API">API</option>
                                            <option value="Microservice">Microservice</option>
                                            <option value="Manuell">Manuell</option>
                                          </Select>
                                        </div>
                                        <div>
                                          <label className="block text-xs text-gray-500 mb-1">Schnittstellenpartner / System</label>
                                          <Input
                                            value={searchTerm}
                                            onChange={(e) => handlePartnerSearchChange(api.id, e.target.value)}
                                            placeholder="System-ID, PSI-Nr. oder Name"
                                          />
                                          <div className="mt-2 rounded-md border bg-gray-50 divide-y">
                                            {getPartnerOptions(searchTerm).map((opt) => (
                                              <button
                                                key={opt.id}
                                                type="button"
                                                className="w-full text-left px-2 py-1 text-sm hover:bg-white"
                                                onClick={() => selectInterfacePartner(api.id, parseSystemToPartner(opt.id))}
                                              >
                                                <div className="font-medium">{opt.shortName}</div>
                                                <div className="text-xs text-gray-500">{opt.categories.basis.psi} · {opt.longName}</div>
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                        <div>
                                          <label className="block text-xs text-gray-500 mb-1">Richtung / Typ der Schnittstelle</label>
                                          <Select value={api.direction} onChange={(e) => updateInterfaceField(api.id, 'direction', e.target.value as InterfaceDirectionOption)}>
                                            <option value="Eingehend">Eingehend</option>
                                            <option value="Ausgehend">Ausgehend</option>
                                            <option value="Bidirektional">Bidirektional</option>
                                          </Select>
                                        </div>
                                        <div>
                                          <span className="block text-xs text-gray-500 mb-1">Personenbezogene Beschäftigtendaten - Frage A</span>
                                          <div className="flex gap-4 text-sm">
                                            <label className="inline-flex items-center gap-2">
                                              <input
                                                type="radio"
                                                name={`personalData-${api.id}`}
                                                checked={api.personalData === true}
                                                onChange={() => updateInterfaceField(api.id, 'personalData', true)}
                                              />
                                              <span>Ja</span>
                                            </label>
                                            <label className="inline-flex items-center gap-2">
                                              <input
                                                type="radio"
                                                name={`personalData-${api.id}`}
                                                checked={api.personalData === false}
                                                onChange={() => updateInterfaceField(api.id, 'personalData', false)}
                                              />
                                              <span>Nein</span>
                                            </label>
                                          </div>
                                        </div>
                                        {api.personalData === false && (
                                          <div>
                                            <span className="block text-xs text-gray-500 mb-1">Daten von Personengruppen kleiner 5 Personen - Frage B</span>
                                            <div className="flex gap-4 text-sm">
                                              <label className="inline-flex items-center gap-2">
                                                <input
                                                  type="radio"
                                                  name={`smallGroup-${api.id}`}
                                                  checked={api.smallGroupData === true}
                                                  onChange={() => updateInterfaceField(api.id, 'smallGroupData', true)}
                                                />
                                                <span>Ja</span>
                                              </label>
                                              <label className="inline-flex items-center gap-2">
                                                <input
                                                  type="radio"
                                                  name={`smallGroup-${api.id}`}
                                                  checked={api.smallGroupData === false}
                                                  onChange={() => updateInterfaceField(api.id, 'smallGroupData', false)}
                                                />
                                                <span>Nein</span>
                                              </label>
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      {(api.personalData || api.smallGroupData) && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          <div>
                                            <label className="block text-xs text-gray-500 mb-1">Art der personenbezogenen Daten / Personengruppen</label>
                                            <RichTextarea value={api.dataDetails} onChange={(v) => updateInterfaceField(api.id, 'dataDetails', v)} rows={3} toolbar />
                                          </div>
                                          <div>
                                            <label className="block text-xs text-gray-500 mb-1">Zweckbestimmung</label>
                                            <RichTextarea value={api.purpose} onChange={(v) => updateInterfaceField(api.id, 'purpose', v)} rows={3} toolbar />
                                          </div>
                                          <div className="md:col-span-2">
                                            <label className="block text-xs text-gray-500 mb-1">Anhänge</label>
                                            <div className="flex flex-wrap gap-2 items-center text-sm">
                                              <Button variant="neutral" size="sm">
                                                <Paperclip size={14} className="mr-1" /> Datei auswählen
                                              </Button>
                                              <span className="text-xs text-gray-500">(Upload-Demo, keine echten Daten gespeichert)</span>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      <div className="flex justify-end gap-2">
                                        <Button variant="neutral" onClick={() => toggleInterfaceEdit(api.id)}>Abbrechen</Button>
                                        <Button onClick={() => toggleInterfaceEdit(api.id)}>Speichern</Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="rounded-lg border bg-amber-50 p-4 text-sm">
                      <div className="font-medium">Import-Funktion für CSV</div>
                      <p className="text-xs text-amber-800 mt-1">
                        Beim Hochladen werden nur Änderungen übernommen; unveränderte Inhalte bleiben bestehen.
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <input type="file" accept=".csv" className="text-sm" disabled={!canEdit} />
                        <Button size="sm" variant="secondary" disabled={!canEdit}>
                          <Upload size={16} className="mr-1" /> CSV abgleichen
                        </Button>
                        {!canEdit && <span className="text-xs text-gray-500">Keine Bearbeitungsrechte</span>}
                      </div>
                    </div>
                  </div>
                ) : activeKey === "basis" ? (
                  <fieldset disabled={!canEdit} className="space-y-6">
                    {/* BASIS: Stammdaten */}
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            <span className="flex items-center gap-2">
                              PSI-Nummer*
                              <InfoTooltip content="Systemname wird bei bekannter PSI-Nummer automatisch ergänzt." />
                            </span>
                          </label>
                          <Input
                            value={basis.psi}
                            onChange={(e) => updateBasisField("psi", e.target.value)}
                            placeholder="z.B. PSI-123456"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Name Kurzbezeichnung des Systems / Projekts*</label>
                          <Input
                            value={basis.shortName}
                            onChange={(e) => handleShortNameChange(e.target.value)}
                            placeholder="z.B. CAIMAN"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Langbezeichnung des Systems / Projekts</label>
                          <Input
                            value={basis.longName}
                            onChange={(e) => handleLongNameChange(e.target.value)}
                            placeholder="Vollständiger Systemname"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            <span className="flex items-center gap-2">
                              Regelungsstatus des IT-System / Projekts*
                              <InfoTooltip
                                content={
                                  <div className="space-y-1">
                                    <div>
                                      <span className="font-semibold">Neu</span> – Neues System / Projekt (bisher konzernweit noch nicht im Einsatz)
                                    </div>
                                    <div>
                                      <span className="font-semibold">Nachregelung</span> – bestehendes System (bisher ohne Mitbestimmung)
                                    </div>
                                    <div>
                                      <span className="font-semibold">Überführung</span> – bestehendes System (mit vorhandener KBR/GBR/BR-Regelung)
                                    </div>
                                  </div>
                                }
                              />
                            </span>
                          </label>
                          <Select
                            value={basis.regulationStatus}
                            onChange={(e) => handleRegulationStatusChange(e.target.value as RegulationStatus)}
                          >
                            <option value="Neu">Neu</option>
                            <option value="Nachregelung">Nachregelung</option>
                            <option value="Überführung">Überführung</option>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Entwicklungsstatus*</label>
                          <Select
                            value={basis.developmentStatus}
                            onChange={(e) => updateBasisField("developmentStatus", e.target.value as DevelopmentStatus)}
                          >
                            <option value="in Vorbereitung">in Vorbereitung</option>
                            <option value="in Planung">in Planung</option>
                            <option value="in Pilotierung">in Pilotierung</option>
                            <option value="bereits im Wirkbetrieb">bereits im Wirkbetrieb</option>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="block text-xs text-gray-500">Ablösung Altsystem*</span>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <label className="inline-flex items-center gap-2">
                            <input
                              type="radio"
                              name="legacy-replacement"
                              checked={basis.replacingLegacy === true}
                              onChange={() => updateBasisField("replacingLegacy", true)}
                            />
                            <span>Ja</span>
                          </label>
                          <label className="inline-flex items-center gap-2">
                            <input
                              type="radio"
                              name="legacy-replacement"
                              checked={basis.replacingLegacy === false}
                              onChange={() => updateBasisField("replacingLegacy", false)}
                            />
                            <span>Nein</span>
                          </label>
                        </div>

                        {basis.replacingLegacy && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">
                                <span className="flex items-center gap-2">
                                  PSI-Nummer Altsystem
                                  <InfoTooltip content="Kurzbezeichnung wird – sofern bekannt – automatisch ergänzt." />
                                </span>
                              </label>
                              <Input
                                value={basis.legacyPsi}
                                onChange={(e) => updateBasisField("legacyPsi", e.target.value)}
                                placeholder="z.B. PSI-654321"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Name Kurzbezeichnung des Altsystems</label>
                              <Input
                                value={basis.legacyShortName}
                                onChange={(e) => handleLegacyShortNameChange(e.target.value)}
                                placeholder="z.B. LegacyCRM"
                              />
                            </div>
                            <div className="lg:col-span-2">
                              <label className="block text-xs text-gray-500 mb-1">Weitere Anmerkungen zum Altsystem</label>
                              <Textarea
                                rows={3}
                                value={basis.legacyNotes}
                                onChange={(e) => updateBasisField("legacyNotes", e.target.value)}
                                placeholder="Relevante Informationen zum Altsystem"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Kurzbeschreibung des Systems*</label>
                        <RichTextarea
                          value={basis.shortDescription}
                          onChange={(value) => updateBasisField("shortDescription", value)}
                          placeholder="Kurzbeschreibung des Systems"
                          toolbar
                          disabled={!canEdit}
                        />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <span className="block text-xs text-gray-500 mb-1">KI geplant/vorhanden*</span>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <label className="inline-flex items-center gap-2">
                              <input
                                type="radio"
                                name="ai-planned"
                                checked={basis.aiPlanned === true}
                                onChange={() => updateBasisField("aiPlanned", true)}
                              />
                              <span>Ja</span>
                            </label>
                            <label className="inline-flex items-center gap-2">
                              <input
                                type="radio"
                                name="ai-planned"
                                checked={basis.aiPlanned === false}
                                onChange={() => updateBasisField("aiPlanned", false)}
                              />
                              <span>Nein</span>
                            </label>
                          </div>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500 mb-1">Schnittstellen geplant/vorhanden*</span>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <label className="inline-flex items-center gap-2">
                              <input
                                type="radio"
                                name="interfaces-planned"
                                checked={basis.interfacesPlanned === true}
                                onChange={() => updateBasisField("interfacesPlanned", true)}
                              />
                              <span>Ja</span>
                            </label>
                            <label className="inline-flex items-center gap-2">
                              <input
                                type="radio"
                                name="interfaces-planned"
                                checked={basis.interfacesPlanned === false}
                                onChange={() => updateBasisField("interfacesPlanned", false)}
                              />
                              <span>Nein</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          <span className="flex items-center gap-2">
                            Systemeigenschaft*
                            <InfoTooltip
                              content={
                                <div className="space-y-2">
                                  <div>
                                    <span className="font-semibold">Datendrehscheibe / Middleware:</span> Für die Festlegung eines IT-Systems als Datendrehscheibe oder Middleware ist entscheidend, ob Anwender im engeren Sinne auf verarbeitete Daten zugreifen können. Prüfen Sie:
                                    <ul className="mt-1 list-disc pl-5 space-y-0.5">
                                      <li>Hat das System nur eine Admin- oder Betriebs-/Betreiberrolle?</li>
                                      <li>
                                        Falls ja: beschränken sich diese Rollen ausschließlich auf Betrieb und Konfiguration und sind mögliche Auswertungen niemand anderem zugänglich?
                                      </li>
                                    </ul>
                                  </div>
                                  <div>
                                    <span className="font-semibold">Ohne Login- und Beschäftigtendaten:</span> Beispiele für personenbezogene Beschäftigtendaten sind u.a.:
                                    <ul className="mt-1 list-disc pl-5 space-y-0.5">
                                      <li>Private Anschrift, Telefonnummer, Geburtsdatum</li>
                                      <li>E-Mail-Adressen</li>
                                      <li>Personal- oder Auftragsnummern</li>
                                      <li>Kontodaten und Log-In-Daten</li>
                                      <li>Beginn/Ende von Verbindungen, dynamische IP-Adressen, Ortungsdaten</li>
                                      <li>Einsatzplanung, Urlaubs- und Vertreterlisten</li>
                                      <li>Nicht öffentlich zugängliche personenbezogene Daten in Netzwerken</li>
                                      <li>Pseudonymisierte Daten</li>
                                    </ul>
                                  </div>
                                </div>
                              }
                            />
                          </span>
                        </label>
                        <Select
                          value={basis.systemProperty}
                          onChange={(e) => updateBasisField("systemProperty", e.target.value as SystemPropertyOption)}
                        >
                          <option value="datendrehscheibe">Datendrehscheibe / Middleware</option>
                          <option value="ohneLogin">Ohne Login und Beschäftigtendaten</option>
                          <option value="none">Keine der genannten Optionen</option>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Benutzeroberfläche (GUI)</label>
                          <Select
                            value={basis.uiType}
                            onChange={(e) => updateBasisField("uiType", e.target.value as UiTypeOption)}
                          >
                            <option value="gui">GUI (Web-Applikation / Client / App)</option>
                            <option value="admin">Administrative Oberfläche (keine Nutzer, nur Administratoren)</option>
                            <option value="terminal">Terminalfenster (Command Line)</option>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            <span className="flex items-center gap-2">
                              Mandantentrennung
                              <InfoTooltip content="Mandantentrennung bedeutet, dass Daten und Prozesse verschiedener Mandanten sauber voneinander abgegrenzt sind. Logische Trennung: gemeinsame Datenbasis, getrennt über Rollen/Berechtigungen. Physische Trennung: eigene Server, Datenbanken oder Instanzen je Mandant." />
                            </span>
                          </label>
                          <Select
                            value={basis.tenantSeparation}
                            onChange={(e) => updateBasisField("tenantSeparation", e.target.value as TenantSeparationOption)}
                          >
                            <option value="none">ohne Trennung</option>
                            <option value="logical">logische Trennung (z.B. über Berechtigungen)</option>
                            <option value="physical">physische Trennung (z.B. getrennte Datenhaltung)</option>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* BASIS: Auswahl-Matrix */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Betroffene Gesellschaften / Betriebe</h3>
                          <p className="text-xs text-gray-500">Erfassen Sie potentiell Nutzende und potentielle Datenbetroffenheit pro Organisationseinheit.</p>
                        </div>
                        <Button variant="neutral" size="sm" onClick={() => setMatrixExpanded((e) => !e)} className="flex items-center gap-1">
                          {matrixExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          {matrixExpanded ? "Einklappen" : "Bearbeiten"}
                        </Button>
                      </div>

                      {matrixExpanded ? (
                        <>
                          <div className="flex items-center justify-end gap-2 text-sm">
                            <span className="text-gray-500">Alle:</span>
                            <label className="inline-flex items-center gap-1">
                              <Checkbox
                                checked={Object.values(basis.matrix).every((m) => m.active)}
                                onChange={(e) => selectAll("active", e.target.checked)}
                              />
                              <span>Potentiell Nutzende</span>
                            </label>
                            <label className="inline-flex items-center gap-1">
                              <Checkbox
                                checked={Object.values(basis.matrix).every((m) => m.data)}
                                onChange={(e) => selectAll("data", e.target.checked)}
                              />
                              <span>Potentielle Datenbetroffenheit</span>
                            </label>
                          </div>

                          <div className="overflow-auto rounded-lg border bg-white">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="text-left p-2">Gesellschaft / Betrieb</th>
                                  <th className="text-left p-2 w-64">Anzahl potentiell Nutzende</th>
                                  <th className="text-left p-2 w-64">Anzahl potentielle Datenbetroffenheit</th>
                                </tr>
                              </thead>
                              <tbody>
                                {ORGS.map((o) => (
                                  <tr key={o.code} className="border-t">
                                    <td className="p-2">
                                      <div className="font-medium">{o.code}</div>
                                      <div className="text-xs text-gray-500">{o.label}</div>
                                    </td>
                                    <td className="p-2">
                                      <div className="flex items-center gap-2">
                                        <Checkbox
                                          checked={basis.matrix[o.code]?.active || false}
                                          onChange={(e) =>
                                            setMatrixChecked(o.code, "active", e.target.checked)
                                          }
                                        />
                                        <Input
                                          type="number"
                                          className="w-24"
                                          value={basis.matrix[o.code]?.activeCount || 0}
                                          onChange={(e) => setMatrixCount(o.code, "activeCount", Number(e.target.value) || 0)}
                                          disabled={!basis.matrix[o.code]?.active}
                                        />
                                      </div>
                                    </td>
                                    <td className="p-2">
                                      <div className="flex items-center gap-2">
                                        <Checkbox
                                          checked={basis.matrix[o.code]?.data || false}
                                          onChange={(e) =>
                                            setMatrixChecked(o.code, "data", e.target.checked)
                                          }
                                        />
                                        <Input
                                          type="number"
                                          className="w-24"
                                          value={basis.matrix[o.code]?.dataCount || 0}
                                          onChange={(e) => setMatrixCount(o.code, "dataCount", Number(e.target.value) || 0)}
                                          disabled={!basis.matrix[o.code]?.data}
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button variant="danger" onClick={resetBasis}>Zurücksetzen</Button>
                            <Button onClick={() => localStorage.setItem("basis-info", JSON.stringify(basis))}>Speichern</Button>
                          </div>
                        </>
                      ) : (
                        <div className="overflow-auto rounded-lg border bg-white">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="text-left p-2">Gesellschaft / Betrieb</th>
                                <th className="text-left p-2 w-64">Anzahl potentiell Nutzende</th>
                                <th className="text-left p-2 w-64">Anzahl potentielle Datenbetroffenheit</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(basis.matrix)
                                .filter(([_, v]) => v.active || v.data)
                                .map(([code, v]) => {
                                  const org = ORGS.find((o) => o.code === code);
                                  if (!org) return null;
                                  return (
                                    <tr key={code} className="border-t">
                                      <td className="p-2">
                                        <div className="font-medium">{org.code}</div>
                                        <div className="text-xs text-gray-500">{org.label}</div>
                                      </td>
                                      <td className="p-2">{v.active ? v.activeCount : "-"}</td>
                                      <td className="p-2">{v.data ? v.dataCount : "-"}</td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </fieldset>
                ) : activeKey === "ai" ? (
                  <AITab canEdit={canEdit} lastSnapshot={system?.categories.ai} />
                ) : (
                  <div className="rounded-md border p-4 text-sm text-gray-600 bg-white">
                    Inhalt für <span className="font-medium">{activeItem.label}</span>
                  </div>
                )}
              </div>

              {/* Weitere Angaben */}
              <div>
                <h2 className="font-semibold mb-3">Weitere Angaben</h2>
                <Textarea placeholder="Hier können zusätzliche Informationen eingetragen werden..." disabled={!canEdit} />
              </div>

              {/* Kommentare – immer unten im Bereich */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} />
                    <h3 className="font-medium">Kommentare – {activeItem.label}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Ungelesen: {unreadBySection[activeKey] || 0}</span>
                    <Button
                      variant="neutral"
                      size="sm"
                      onClick={() => setExpandedCommentSections((prev) => ({ ...prev, [activeKey]: !prev[activeKey] }))}
                    >
                      {expandedCommentSections[activeKey] ? "Kommentare ausblenden" : `Kommentare anzeigen (${(commentsBySection[activeKey] || []).length})`}
                    </Button>
                    <Button
                      variant="neutral"
                      size="sm"
                      onClick={() => setCollapsedComments((prev) => ({ ...prev, [activeKey]: true }))}
                      title="Alle Kommentare kompakt anzeigen"
                    >Alle einklappen</Button>
                    {collapsedComments[activeKey] && (
                      <Button
                        variant="neutral"
                        size="sm"
                        onClick={() => setCollapsedComments((prev) => ({ ...prev, [activeKey]: false }))}
                        title="Alle Kommentare wieder voll anzeigen"
                      >Alle ausklappen</Button>
                    )}
                    {unreadBySection[activeKey] > 0 && (
                      <Button variant="neutral" size="sm" onClick={() => markAllReadInSection(activeKey)}>Alle als gelesen markieren</Button>
                    )}
                  </div>
                </div>

                {expandedCommentSections[activeKey] && (
                  <div className="space-y-2">
                    {(commentsBySection[activeKey] || []).filter(canSee).map((c) => (
                      <div
                        key={c.id}
                        ref={(el) => {
                          commentItemRefs.current[activeKey] = commentItemRefs.current[activeKey] || {} as any;
                          if (el) commentItemRefs.current[activeKey][c.id] = el;
                        }}
                        className={`rounded-md border bg-white ${collapsedComments[activeKey] ? "px-3 py-2" : "p-3"} ${c.read ? "opacity-80" : "ring-1 ring-pink-200"}`}
                      >
                        {collapsedComments[activeKey] ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <MessageSquare size={16} className="shrink-0" />
                              <div className="truncate text-sm min-w-0">
                                <HighlightedText text={truncate(c.text, 140)} />
                              </div>
                            </div>
                            <div className="ml-3 text-xs text-gray-500 shrink-0">
                              {c.replies?.length ? `• ${c.replies.length} Antw.` : ""}
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2 items-start">
                            <MessageSquare className="mt-0.5" size={16} />
                            <div className="flex-1">
                              <div className="text-sm whitespace-pre-line">
                                <HighlightedText text={c.text} />
                                <div className="text-xs text-gray-500 italic">
                                  Sichtbarkeit: {c.visibility}
                                  {c.user ? ` (an: ${c.user})` : ""}
                                  {c.group ? ` (Gruppe: ${c.group})` : ""}
                                  {c.replies && c.replies.length > 0 ? ` • ${c.replies.length} Antworten` : ""}
                                </div>
                                {c.visibility === VISIBILITY.PRIVATE && c.reminder && (
                                  <div className="flex items-center text-xs text-pink-600 mt-1">
                                    <Bell size={12} className="mr-1" /> Erinnerung am {new Date(c.reminder).toLocaleString()}
                                  </div>
                                )}
                              </div>
                              {c.replies && c.replies.length > 0 && (
                                <div className="mt-2 ml-6 space-y-2">
                                  {c.replies.map((r) => (
                                    <div key={r.id} className={`rounded-md border p-2 bg-gray-50 text-sm ${r.read ? "opacity-80" : "ring-1 ring-pink-100"}`}>
                                      <AtSign size={12} className="inline mr-1" /> <HighlightedText text={r.text} />
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="mt-2 flex items-center gap-2">
                                <Button size="sm" variant="neutral" onClick={() => toggleRead(activeKey, c.id)}>
                                  {c.read ? "Als ungelesen markieren" : "Als gelesen markieren"}
                                </Button>
                                <Button size="sm" variant="neutral" onClick={() => addReply(activeKey, c.id, "@Max Danke! #HR")} disabled={isBR}>Antworten</Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Kommentar-Eingabe mit Sichtbarkeit & Wiedervorlage */}
                    <div className="rounded-md border p-3 bg-white space-y-3">
                      <label className="text-sm text-gray-600">Neuer Kommentar</label>
                      <Textarea value={currentDraft.text} onChange={handleDraftChange} placeholder={`Kommentar zu "${activeItem.label}" hinzufügen... (Nutze @Nutzer und #Gruppe)`} disabled={isBR} />

                      {mention.open && (
                        <div className="border rounded-md p-2 bg-gray-50 text-sm">
                          <div className="mb-1 text-xs text-gray-500">Vorschläge für {mention.type === "@" ? "Personen" : "Gruppen"}</div>
                          <div className="flex flex-wrap gap-2">
                            {mention.options.length ? (
                              mention.options.map((opt) => (
                                <button key={opt} className="px-2 py-1 rounded-md bg-white border text-gray-700 hover:bg-gray-100" onClick={() => insertMention(opt)}>
                                  {mention.type}{opt}
                                </button>
                              ))
                            ) : (
                              <span className="text-gray-400">Keine Treffer</span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-500 mb-1">Sichtbarkeit</label>
                          <select className="border rounded-md px-2 py-1 bg-white" value={currentDraft.visibility} onChange={(e) => setDraftField("visibility", e.target.value)} disabled={isBR}>
                            <option value={VISIBILITY.ALL}>Alle</option>
                            <option value={VISIBILITY.GROUP}>Gruppe</option>
                            <option value={VISIBILITY.USER}>Einzelner Nutzer</option>
                            <option value={VISIBILITY.PRIVATE}>Nur ich (Wiedervorlage möglich)</option>
                          </select>
                        </div>
                        {currentDraft.visibility === VISIBILITY.USER && (
                          <div className="flex flex-col">
                            <label className="text-xs text-gray-500 mb-1">Nutzer</label>
                            <Input value={currentDraft.user || ""} onChange={(e) => setDraftField("user", e.target.value)} placeholder="Nutzername" disabled={isBR} />
                          </div>
                        )}
                        {currentDraft.visibility === VISIBILITY.GROUP && (
                          <div className="flex flex-col">
                            <label className="text-xs text-gray-500 mb-1">Gruppe</label>
                            <Input value={currentDraft.group || ""} onChange={(e) => setDraftField("group", e.target.value)} placeholder="Gruppenname" disabled={isBR} />
                          </div>
                        )}
                        {currentDraft.visibility === VISIBILITY.PRIVATE && (
                          <div className="flex flex-col">
                            <label className="text-xs text-gray-500 mb-1">Erinnerung (Datum & Uhrzeit)</label>
                            <Input type="datetime-local" value={currentDraft.reminder || ""} onChange={(e) => setDraftField("reminder", e.target.value)} disabled={isBR} />
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 justify-end">
                        <Button variant="neutral" onClick={() => setCommentDrafts((prev) => ({ ...prev, [activeKey]: { text: "", visibility: VISIBILITY.ALL } }))} disabled={isBR}>Zurücksetzen</Button>
                        <Button
                          onClick={() => {
                            if (!currentDraft.text?.trim()) return;
                            addComment(activeKey, currentDraft.text.trim(), currentDraft.visibility as Visibility, currentDraft.user, currentDraft.group, currentDraft.reminder);
                            setCommentDrafts((prev) => ({ ...prev, [activeKey]: { text: "", visibility: VISIBILITY.ALL } }));
                          }}
                        >
                          Senden
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Globales Kommentar-Modal */}
      {showGlobalComments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowGlobalComments(false)}></div>
          <div className="relative bg-white w-full max-w-5xl max-h-[80vh] rounded-xl shadow-xl p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare />
                <h3 className="text-lg font-semibold">Alle Kommentare</h3>
              </div>
              <Button variant="neutral" onClick={() => setShowGlobalComments(false)}><X size={16} className="mr-1"/> Schließen</Button>
            </div>

            {/* Filterleiste */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3 mb-4">
              <div className="sm:col-span-2 xl:col-span-2">
                <Input placeholder="Suchen…" value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="onlyUnread"
                  checked={globalOnlyUnread}
                  onChange={() => setGlobalOnlyUnread(!globalOnlyUnread)}
                />
                <label htmlFor="onlyUnread" className="text-sm">nur Ungelesene</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="onlyRem"
                  checked={globalOnlyReminders}
                  onChange={() => setGlobalOnlyReminders(!globalOnlyReminders)}
                />
                <label htmlFor="onlyRem" className="text-sm flex items-center gap-1"><Bell size={12}/> nur Wiedervorlagen</label>
              </div>
              <div>
                <select className="border rounded-md px-2 py-1 w-full" value={globalVisibility} onChange={(e) => setGlobalVisibility(e.target.value as any)}>
                  <option value="ALLE">Alle Sichtbarkeiten</option>
                  <option value={VISIBILITY.ALL}>Öffentlich</option>
                  <option value={VISIBILITY.GROUP}>Gruppe</option>
                  <option value={VISIBILITY.USER}>Einzelner Nutzer</option>
                  <option value={VISIBILITY.PRIVATE}>Nur ich</option>
                </select>
              </div>
              <div>
                <select className="border rounded-md px-2 py-1 w-full" value={globalSort} onChange={(e) => setGlobalSort(e.target.value as any)}>
                  <option value="neueste">Sortieren: Neueste zuerst</option>
                  <option value="älteste">Sortieren: Älteste zuerst</option>
                  <option value="bereich">Sortieren: Nach Bereich</option>
                </select>
              </div>
            </div>

            {/* Ergebnisliste */}
            <div className="overflow-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left p-2 w-40">Bereich</th>
                    <th className="text-left p-2">Kommentar</th>
                    <th className="text-left p-2 w-48">Sichtbarkeit</th>
                    <th className="text-left p-2 w-44">Fällig</th>
                    <th className="text-right p-2 w-64">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {globalFiltered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-500">Keine Kommentare gefunden.</td>
                    </tr>
                  )}
                  {globalFiltered.map(({ sectionKey, sectionLabel, c }) => (
                    <tr key={`${sectionKey}-${c.id}`} className={c.read ? "bg-white" : "bg-pink-50"}>
                      <td className="p-2 align-top">
                        <div className="font-medium">{sectionLabel}</div>
                        <div className="text-xs text-gray-500">ID: {c.id}</div>
                      </td>
                      <td className="p-2 align-top">
                        <div className="whitespace-pre-line"><HighlightedText text={c.text} /></div>
                        {c.replies?.length ? (
                          <div className="text-xs text-gray-500 mt-1">• {c.replies.length} Antworten</div>
                        ) : null}
                      </td>
                      <td className="p-2 align-top text-xs text-gray-600">
                        {c.visibility}
                        {c.user ? ` (an: ${c.user})` : ""}
                        {c.group ? ` (Gruppe: ${c.group})` : ""}
                      </td>
                      <td className="p-2 align-top text-xs">
                        {c.visibility === VISIBILITY.PRIVATE && c.reminder ? (
                          <span className="inline-flex items-center gap-1"><Bell size={12}/> {new Date(c.reminder).toLocaleString()}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-2 align-top">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="secondary" onClick={() => jumpToComment(sectionKey, c.id)}>Öffnen</Button>
                          <Button size="sm" variant="neutral" onClick={() => toggleRead(sectionKey, c.id)}>
                            {c.read ? "Ungelesen" : "Gelesen"}
                          </Button>
                          <Button size="sm" variant="neutral" onClick={() => addReply(sectionKey, c.id, "Antwort aus Übersicht…")} disabled={isBR}>Antworten</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Bearbeiter Panel */}
      {showBearbeiter && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowBearbeiter(false)}></div>
          <div className="relative bg-white w-96 h-full shadow-xl p-6 overflow-y-auto border-l border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Bearbeiter</h3>
              <Button variant="neutral" size="sm" onClick={() => setShowBearbeiter(false)}>
                <X size={16} className="mr-1" /> Schließen
              </Button>
            </div>
            <div className="space-y-4">
              {BEARBEITER_FIELDS.map(({ key, label, title, Icon }) => {
                const isEditing = editingBearbeiter === key;
                const canEditField = canEditBearbeiterField(key);
                const fieldValue = bearbeiter[key as keyof typeof bearbeiter] as string;

                const handleChange = (value: string) => {
                  if (!canEditField) return;
                  setBearbeiter((prev) => ({ ...prev, [key]: value }));
                };

                return (
                  <div
                    key={key}
                    className="flex items-center gap-3 p-3 border rounded-md hover:bg-gray-50"
                  >
                    <Icon size={18} className="text-gray-600" />
                    <div className="flex-1" title={title}>
                      <div className="text-sm font-medium">{label}</div>
                      {isEditing ? (
                        key === 'group' ? (
                          <select
                            className="mt-1 w-full border rounded px-2 py-1 text-sm"
                            value={fieldValue}
                            onChange={(e) => handleChange(e.target.value)}
                            disabled={!canEditField}
                          >
                            <option>Systemgruppe A</option>
                            <option>Systemgruppe B</option>
                            <option>Systemgruppe C</option>
                          </select>
                        ) : (
                          <Input
                            className="mt-1"
                            value={fieldValue}
                            onChange={(e) => handleChange(e.target.value)}
                            disabled={!canEditField}
                          />
                        )
                      ) : (
                        <div className="mt-1 text-sm text-gray-700">{fieldValue}</div>
                      )}
                    </div>
                    <div>
                      {isEditing ? (
                        <Button size="sm" variant="secondary" onClick={() => setEditingBearbeiter(null)}>
                          Speichern
                        </Button>
                      ) : (
                        <button
                          type="button"
                          className={`p-1 ${canEditField ? 'text-gray-500 hover:text-gray-700' : 'text-gray-300 cursor-not-allowed'}`}
                          onClick={() => {
                            if (!canEditField) return;
                            setEditingBearbeiter(key as string);
                          }}
                          disabled={!canEditField}
                          aria-label={
                            canEditField
                              ? `${label} bearbeiten`
                              : `${label} bearbeiten nicht erlaubt`
                          }
                          title={canEditField ? 'Bearbeiten' : 'Keine Berechtigung'}
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* Profil Panel */}
      {showProfile && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowProfile(false)}></div>
          <div className="relative bg-white w-80 h-full shadow-xl p-6 overflow-y-auto border-l border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Profil</h3>
              <Button variant="neutral" size="sm" onClick={() => setShowProfile(false)}>
                <X size={16} className="mr-1" /> Schließen
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={40} className="text-gray-400" />
                    )}
                  </div>
                  <input id="avatarUpload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  <label htmlFor="avatarUpload" className="absolute bottom-0 right-0 p-1 bg-white rounded-full border cursor-pointer">
                    <Pencil size={14} />
                  </label>
                </div>
                <div className="mt-2 font-medium">{user.name}</div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Aktive Rolle</label>
                <select
                  className="border rounded px-2 py-1 w-full"
                  value={user.currentRole}
                  onChange={(e) => setUser((u) => ({ ...u, currentRole: e.target.value }))}
                >
                  {user.roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="font-medium mb-1">Rollen</div>
                <ul className="list-disc list-inside text-sm">
                  {user.roles.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-medium mb-1">Gruppen</div>
                <ul className="list-disc list-inside text-sm">
                  {user.groups.map((g) => (
                    <li key={g}>{g}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

