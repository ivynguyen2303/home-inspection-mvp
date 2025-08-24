import { useLocalStore, Role } from '@/store/localStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Search } from 'lucide-react';

export function RoleSwitch() {
  const { role, setRole } = useLocalStore();

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center text-sm text-muted-foreground">
        <User className="w-4 h-4 mr-1" />
        Role:
      </div>
      <Select value={role} onValueChange={(value: Role) => setRole(value)}>
        <SelectTrigger className="w-32" data-testid="select-role">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="client" data-testid="role-client">
            <div className="flex items-center">
              <Search className="w-4 h-4 mr-2" />
              Client
            </div>
          </SelectItem>
          <SelectItem value="inspector" data-testid="role-inspector">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              Inspector
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}