import { Button } from '@/components/ui/button';
import { useUser } from '@/UserContext';

interface ProfileMenuProps {
  onClose?: () => void;
  onAdmin?: () => void;
}

export function ProfileMenu({ onClose, onAdmin }: ProfileMenuProps) {
  const { user, roles, activeRole, setActiveRole, logout } = useUser();
  const isAdmin = roles.some((r) => r.name === 'Admin');

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveRole(e.target.value);
    onClose?.();
  };

  const handleLogout = () => {
    logout();
    onClose?.();
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="font-semibold">{user?.name}</div>
      <label className="text-sm">
        Rolle
        <select
          className="mt-1 block w-full border rounded"
          value={activeRole ?? ''}
          onChange={handleRoleChange}
        >
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </label>
      {isAdmin && (
        <Button onClick={() => { onAdmin?.(); onClose?.(); }} className="mt-2" variant="neutral">
          Admin Panel
        </Button>
      )}
      <Button onClick={handleLogout} className="mt-2">
        Logout
      </Button>
    </div>
  );
}

export default ProfileMenu;
