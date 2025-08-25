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
  FileText,
  Cog,
  Share2,
  UserCog,
  BarChart3,
  Lock,
  Bot,
  MessageSquare,
  Bell,
  AtSign,
  X,
  Trash2,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  Paperclip
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import cn from 'classnames'

// Navigationseinträge
const NAV_ITEMS = [
  { key: "basis", label: "Basisinformationen", Icon: FileText },
  { key: "system", label: "Systembeschreibung", Icon: Cog },
  { key: "apis", label: "Schnittstellen", Icon: Share2 },
  { key: "roles", label: "Rollen / Berechtigungen", Icon: UserCog },
  { key: "reports", label: "Auswertungen / Reports", Icon: BarChart3 },
  { key: "privacy", label: "Datenschutz / Compliance", Icon: Lock },
  { key: "ai", label: "Künstliche Intelligenz", Icon: Bot }
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

// Initialdaten basierend auf deiner Vorgabe
const initialRoles: Role[] = [
  {
    id: 1,
    number: "TA 1",
    systemName: "Recruiter",
    shopName: "SKM-DC-Recuiter",
    userName: "Recruiter",
    tasks: [
      "Stellen anlegen und veröffentlichen",
      "Kalibrierung",
      "Sichtung und Prüfung von Kandidat*innen und Bewerber*innen",
      "Kontaktieren von Kandidat*innen und Bewerber*innen",
      "Kandidat*innen und Bewerber*innen in verschiedene Auswahlstatus verschieben",
      "Absagen verschicken",
      "Bewerber*innen zu Interviews einladen",
      "Feedback der Führungskraft einholen",
      "Communities anlegen und verwalten",
      "Events und Kampagnen aufsetzen und managen"
    ],
    permissions: [
      "Stellenausschreibungen",
      "Kandidatendaten",
      "Bewerberdaten",
      "Communities",
      "Events",
      "Feedback Center",
      "Scheduling Center",
      "Reporting"
    ],
    expanded: false,
    editing: false
  }
];

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

type BasisMatrixEntry = { active: boolean; data: boolean };

type BasisInfo = {
  shortName: string; // Name/Kurzbezeichnung des Systems
  longName: string; // Langbezeichnung des Systems
  psi: string; // PSI-Nummer
  appId: string; // T-App-ID/Sol-App-ID (alt: ICTO/COM)
  shortDescription: string; // Kurzbeschreibung
  matrix: Record<string, BasisMatrixEntry>; // Betroffene Gesellschaften/Betriebe
};

const makeInitialBasis = (): BasisInfo => ({
  shortName: "",
  longName: "",
  psi: "",
  appId: "",
  shortDescription: "",
  matrix: ORGS.reduce((acc, o) => {
    acc[o.code] = { active: false, data: false };
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

export default function ToolReviewMockup() {
  // active Tab
  const [activeKey, setActiveKey] = useState(NAV_ITEMS[0].key);

  // Rollen-State
  const [roles, setRoles] = useState<Role[]>(() => {
    const saved = localStorage.getItem("roles-badges");
    return saved ? JSON.parse(saved) : initialRoles;
  });

  // Basisinformationen State
  const [basis, setBasis] = useState<BasisInfo>(() => {
    const saved = localStorage.getItem("basis-info");
    return saved ? JSON.parse(saved) : makeInitialBasis();
  });

  // Neuer-Badge-Entwurf
  const [draft, setDraft] = useState<
    Omit<Role, "id" | "tasks" | "permissions"> & { tasks?: string; permissions?: string }
  >({ number: "", systemName: "", shopName: "", userName: "", expanded: true, editing: true });

  // Kommentare State
  const [commentsBySection, setCommentsBySection] = useState<SectionComments>(() => {
    const saved = localStorage.getItem("commentsBySection");
    return saved ? JSON.parse(saved) : makeInitialComments();
  });
  const [expandedCommentSections, setExpandedCommentSections] = useState<Record<string, boolean>>({});
  const [collapsedComments, setCollapsedComments] = useState<Record<string, boolean>>({}); // Kompaktansicht pro Bereich

  // Global (allgemeine) Kommentare UI
  const [showGlobalComments, setShowGlobalComments] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [globalOnlyUnread, setGlobalOnlyUnread] = useState(false);
  const [globalOnlyReminders, setGlobalOnlyReminders] = useState(false);
  const [globalVisibility, setGlobalVisibility] = useState<Visibility | "ALLE">("ALLE");
  const [globalSort, setGlobalSort] = useState<"neueste" | "älteste" | "bereich">("neueste");

  // Demo: aktueller Nutzer & Gruppen (für Sichtbarkeiten)
  const currentUser = "Ich";
  const currentGroups = ["Architektur-Team"];

  const activeItem = NAV_ITEMS.find((n) => n.key === activeKey) || NAV_ITEMS[0];

  // Refs für Scroll-to-Comment
  const commentItemRefs = useRef<Record<string, Record<number, HTMLElement>>>({});

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
    setCommentsBySection((prev) => ({
      ...prev,
      [key]: (prev[key] || []).map((c) => ({ ...c, read: true }))
    }));
  };

  const toggleRead = (key: string, id: number) => {
    setCommentsBySection((prev) => ({
      ...prev,
      [key]: (prev[key] || []).map((c) => (c.id === id ? { ...c, read: !c.read } : c))
    }));
  };

  const addReply = (sectionKey: string, commentId: number, text: string) => {
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
  const updateBasisField = (field: keyof BasisInfo, value: string) => setBasis((b) => ({ ...b, [field]: value }));
  const setMatrix = (code: string, key: keyof BasisMatrixEntry, checked: boolean) =>
    setBasis((b) => ({ ...b, matrix: { ...b.matrix, [code]: { ...b.matrix[code], [key]: checked } } }));
  const selectAll = (type: keyof BasisMatrixEntry, checked: boolean) =>
    setBasis((b) => ({
      ...b,
      matrix: Object.fromEntries(Object.entries(b.matrix).map(([k, v]) => [k, { ...v, [type]: checked }]))
    }));

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">TOOL TITLE</h1>
        <span className="text-gray-500 block mt-1">ID: 1234-ABC-15</span>
      </div>

      {/* Fortschritt */}
      <div className="flex items-center justify-between mb-6">
        {["Stage 1", "Stage 2", "Stage 3", "Stage 4", "Stage 5"].map((stage, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${idx < 3 ? "bg-pink-500 text-white" : "bg-gray-300"}`}>
              {idx < 3 ? <CheckCircle size={18} /> : idx + 1}
            </div>
            <span className="text-sm text-center">{stage}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Sidebar */}
        <div className="col-span-1">
          <Card className="mb-4">
            <CardContent className="p-4 space-y-2">
              <div className="font-bold">Navigation</div>
              <ul className="text-sm space-y-1">
                {NAV_ITEMS.map(({ key, label, Icon }) => (
                  <li key={key}>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setActiveKey(key)}
                        className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition ${
                          key === activeKey ? "bg-pink-50 text-pink-700 ring-1 ring-pink-200" : "hover:bg-gray-100"
                        }`}
                      >
                        <Icon size={14} />
                        <span>{label}</span>
                      </button>
                      {unreadBySection[key] > 0 && (
                        <button
                          title="Zum ersten ungelesenen Kommentar springen"
                          onClick={() => {
                            setActiveKey(key);
                            setExpandedCommentSections((prev) => ({ ...prev, [key]: true }));
                            scrollToFirstUnread(key);
                          }}
                          className={`ml-2 shrink-0 text-xs rounded-full px-2 py-0.5 text-white hover:opacity-90 ${
                            unreadBySection[key] > 3 ? "bg-red-600" : unreadBySection[key] > 1 ? "bg-orange-500" : "bg-blue-500"
                          }`}
                        >
                          {unreadBySection[key]}
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

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
                    <span className="text-xs rounded-full px-2 py-0.5 bg-pink-600 text-white">{totalUnread} neu</span>
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
        </div>

        {/* Main Content */}
        <div className="col-span-4">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="font-semibold mb-3">{activeItem.label}</h2>

                {activeKey === "roles" ? (
                  <div className="space-y-4">
                    {/* Add new badge */}
                    <div className="rounded-xl border bg-white p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold">Neue Rolle hinzufügen</div>
                        <Button size="sm" onClick={addDraftAsRole}>
                          <Plus className="mr-2" size={16} /> Hinzufügen
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-500 mb-1">Prozessuale Aufgaben (je Zeile)</label>
                          <Textarea rows={3} value={(draft as any).tasks || ""} onChange={(e) => setDraft({ ...draft, tasks: e.target.value })} placeholder="Eine Aufgabe pro Zeile" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-500 mb-1">IT-Berechtigungen [Sichten] (je Zeile)</label>
                          <Textarea rows={3} value={(draft as any).permissions || ""} onChange={(e) => setDraft({ ...draft, permissions: e.target.value })} placeholder="Eine Berechtigung pro Zeile" />
                        </div>
                      </div>
                    </div>

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
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title={role.editing ? "Bearbeiten beenden" : "Bearbeiten"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleEdit(role.id);
                                }}
                              >
                                <Pencil size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700"
                                title="Löschen"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeRole(role.id);
                                }}
                              >
                                <Trash2 size={16} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                {role.expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                              </Button>
                            </div>
                          </div>

                          {/* Details */}
                          {role.expanded && (
                            <div className="px-4 pb-4">
                              {!role.editing ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    <Button variant="outline" onClick={() => toggleEdit(role.id)}>Abbrechen</Button>
                                    <Button onClick={() => toggleEdit(role.id)}>Speichern</Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : activeKey === "basis" ? (
                  <div className="space-y-6">
                    {/* BASIS: Stammdaten */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Name/Kurzbezeichnung des Systems</label>
                        <Input value={basis.shortName} onChange={(e) => updateBasisField("shortName", e.target.value)} placeholder="z.B. CAIMAN" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Langbezeichnung des Systems</label>
                        <Input value={basis.longName} onChange={(e) => updateBasisField("longName", e.target.value)} placeholder="Vollständiger Systemname" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">PSI-Nummer</label>
                        <Input value={basis.psi} onChange={(e) => updateBasisField("psi", e.target.value)} placeholder="z.B. PSI-123456" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">T-App-ID/Sol-App-ID (alt: ICTO/COM)</label>
                        <Input value={basis.appId} onChange={(e) => updateBasisField("appId", e.target.value)} placeholder="z.B. T-APP-xxxx / SOL-APP-xxxx" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">Kurzbeschreibung</label>
                        <Textarea rows={3} value={basis.shortDescription} onChange={(e) => updateBasisField("shortDescription", e.target.value)} placeholder="Kurzbeschreibung des Systems" />
                      </div>
                    </div>

                    {/* BASIS: Auswahl-Matrix */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Betroffene Gesellschaften/Betriebe</h3>
                          <p className="text-xs text-gray-500">Wähle pro Einheit die Betroffenheit: <span className="font-medium">Aktive Nutzung</span> und/oder <span className="font-medium">Datenbetroffenheit</span>.</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">Alle:</span>
                          <label className="inline-flex items-center gap-1">
                            <Checkbox checked={Object.values(basis.matrix).every((m) => m.active)} onCheckedChange={(c) => selectAll("active", Boolean(c))} />
                            <span>Aktive Nutzung</span>
                          </label>
                          <label className="inline-flex items-center gap-1">
                            <Checkbox checked={Object.values(basis.matrix).every((m) => m.data)} onCheckedChange={(c) => selectAll("data", Boolean(c))} />
                            <span>Datenbetroffenheit</span>
                          </label>
                        </div>
                      </div>

                      <div className="overflow-auto rounded-lg border bg-white">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left p-2">Gesellschaft / Betrieb</th>
                              <th className="text-left p-2 w-40">Aktive Nutzung</th>
                              <th className="text-left p-2 w-48">Datenbetroffenheit</th>
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
                                  <label className="inline-flex items-center gap-2">
                                    <Checkbox checked={basis.matrix[o.code]?.active || false} onCheckedChange={(c) => setMatrix(o.code, "active", Boolean(c))} />
                                    <span>Ja</span>
                                  </label>
                                </td>
                                <td className="p-2">
                                  <label className="inline-flex items-center gap-2">
                                    <Checkbox checked={basis.matrix[o.code]?.data || false} onCheckedChange={(c) => setMatrix(o.code, "data", Boolean(c))} />
                                    <span>Ja</span>
                                  </label>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setBasis(makeInitialBasis())}>Zurücksetzen</Button>
                        <Button onClick={() => localStorage.setItem("basis-info", JSON.stringify(basis))}>Speichern</Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border p-4 text-sm text-gray-600 bg-white">
                    Inhalt für <span className="font-medium">{activeItem.label}</span>
                  </div>
                )}
              </div>

              {/* Weitere Angaben */}
              <div>
                <h2 className="font-semibold mb-3">Weitere Angaben</h2>
                <Textarea placeholder="Hier können zusätzliche Informationen eingetragen werden..." />
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
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedCommentSections((prev) => ({ ...prev, [activeKey]: !prev[activeKey] }))}
                    >
                      {expandedCommentSections[activeKey] ? "Kommentare ausblenden" : `Kommentare anzeigen (${(commentsBySection[activeKey] || []).length})`}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCollapsedComments((prev) => ({ ...prev, [activeKey]: true }))}
                      title="Alle Kommentare kompakt anzeigen"
                    >Alle einklappen</Button>
                    {collapsedComments[activeKey] && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCollapsedComments((prev) => ({ ...prev, [activeKey]: false }))}
                        title="Alle Kommentare wieder voll anzeigen"
                      >Alle ausklappen</Button>
                    )}
                    {unreadBySection[activeKey] > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => markAllReadInSection(activeKey)}>Alle als gelesen markieren</Button>
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
                                <Button size="sm" variant="ghost" onClick={() => toggleRead(activeKey, c.id)}>
                                  {c.read ? "Als ungelesen markieren" : "Als gelesen markieren"}
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => addReply(activeKey, c.id, "@Max Danke! #HR")}>Antworten</Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Kommentar-Eingabe mit Sichtbarkeit & Wiedervorlage */}
                    <div className="rounded-md border p-3 bg-white space-y-3">
                      <label className="text-sm text-gray-600">Neuer Kommentar</label>
                      <Textarea value={currentDraft.text} onChange={handleDraftChange} placeholder={`Kommentar zu "${activeItem.label}" hinzufügen... (Nutze @Nutzer und #Gruppe)`} />

                      {mention.open && (
                        <div className="border rounded-md p-2 bg-gray-50 text-sm">
                          <div className="mb-1 text-xs text-gray-500">Vorschläge für {mention.type === "@" ? "Personen" : "Gruppen"}</div>
                          <div className="flex flex-wrap gap-2">
                            {mention.options.length ? (
                              mention.options.map((opt) => (
                                <button key={opt} className="px-2 py-1 rounded-md bg-white border hover:bg-gray-100" onClick={() => insertMention(opt)}>
                                  {mention.type}{opt}
                                </button>
                              ))
                            ) : (
                              <span className="text-gray-400">Keine Treffer</span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-500 mb-1">Sichtbarkeit</label>
                          <select className="border rounded-md px-2 py-1 bg-white" value={currentDraft.visibility} onChange={(e) => setDraftField("visibility", e.target.value)}>
                            <option value={VISIBILITY.ALL}>Alle</option>
                            <option value={VISIBILITY.GROUP}>Gruppe</option>
                            <option value={VISIBILITY.USER}>Einzelner Nutzer</option>
                            <option value={VISIBILITY.PRIVATE}>Nur ich (Wiedervorlage möglich)</option>
                          </select>
                        </div>
                        {currentDraft.visibility === VISIBILITY.USER && (
                          <div className="flex flex-col">
                            <label className="text-xs text-gray-500 mb-1">Nutzer</label>
                            <Input value={currentDraft.user || ""} onChange={(e) => setDraftField("user", e.target.value)} placeholder="Nutzername" />
                          </div>
                        )}
                        {currentDraft.visibility === VISIBILITY.GROUP && (
                          <div className="flex flex-col">
                            <label className="text-xs text-gray-500 mb-1">Gruppe</label>
                            <Input value={currentDraft.group || ""} onChange={(e) => setDraftField("group", e.target.value)} placeholder="Gruppenname" />
                          </div>
                        )}
                        {currentDraft.visibility === VISIBILITY.PRIVATE && (
                          <div className="flex flex-col">
                            <label className="text-xs text-gray-500 mb-1">Erinnerung (Datum & Uhrzeit)</label>
                            <Input type="datetime-local" value={currentDraft.reminder || ""} onChange={(e) => setDraftField("reminder", e.target.value)} />
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setCommentDrafts((prev) => ({ ...prev, [activeKey]: { text: "", visibility: VISIBILITY.ALL } }))}>Zurücksetzen</Button>
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
              <Button variant="outline" onClick={() => setShowGlobalComments(false)}><X size={16} className="mr-1"/> Schließen</Button>
            </div>

            {/* Filterleiste */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
              <div className="md:col-span-2">
                <Input placeholder="Suchen…" value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="onlyUnread" checked={globalOnlyUnread} onCheckedChange={() => setGlobalOnlyUnread(!globalOnlyUnread)} />
                <label htmlFor="onlyUnread" className="text-sm">nur Ungelesene</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="onlyRem" checked={globalOnlyReminders} onCheckedChange={() => setGlobalOnlyReminders(!globalOnlyReminders)} />
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
                          <Button size="sm" variant="outline" onClick={() => toggleRead(sectionKey, c.id)}>
                            {c.read ? "Ungelesen" : "Gelesen"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => addReply(sectionKey, c.id, "Antwort aus Übersicht…")}>Antworten</Button>
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
    </div>
  );
}

