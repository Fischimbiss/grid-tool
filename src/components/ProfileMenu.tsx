import { useContext } from 'react';
import { UserContext } from '@/UserContext';
import { Button } from '@/components/ui/button';

interface ProfileMenuProps {
  onClose?: () => void;
}

export function ProfileMenu({ onClose }: ProfileMenuProps) {
  const { username, roles, activeRole, setActiveRole, logout } = useContext(UserContext);

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
      <div className="font-semibold">{username}</div>
      <label className="text-sm">
        Rolle
        <select
          className="mt-1 block w-full border rounded"
          value={activeRole}
          onChange={handleRoleChange}
        >
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
      <Button onClick={handleLogout} className="mt-2">
        Logout
      </Button>
    </div>
  );
}

export default ProfileMenu;
