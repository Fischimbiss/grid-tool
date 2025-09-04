import { NAV_ITEMS, NavKey } from './nav-items';
import { Card, CardContent } from '../components/ui/card';

interface Props {
  activeKey: NavKey;
  onSelect: (key: NavKey) => void;
  unreadBySection: Record<string, number>;
  onJumpToFirstUnread: (key: NavKey) => void;
}

export function SectionNav({ activeKey, onSelect, unreadBySection, onJumpToFirstUnread }: Props) {
  return (
    <Card>
      <CardContent className="p-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ key, label, Icon }) => (
            <li key={key}>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => onSelect(key)}
                  className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition ${
                    key === activeKey ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' : 'hover:bg-gray-100'
                  }`}
                >
                  <Icon size={14} aria-hidden="true" />
                  <span>{label}</span>
                </button>
                {unreadBySection[key] > 0 && (
                  <button
                    aria-label="Zum ersten ungelesenen Kommentar springen"
                    title="Zum ersten ungelesenen Kommentar springen"
                    onClick={() => onJumpToFirstUnread(key)}
                    className={`ml-2 shrink-0 text-xs rounded-full px-2 py-0.5 text-white hover:opacity-90 ${
                      unreadBySection[key] > 3
                        ? 'bg-red-600'
                        : unreadBySection[key] > 1
                        ? 'bg-orange-500'
                        : 'bg-blue-500'
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
  );
}

export default SectionNav;
