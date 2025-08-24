import React, { useMemo } from 'react';
import { useLocalStore } from '@/store/localStore';
import { RequestCard } from '@/components/RequestCard';
import { getSession, findUserById } from '@/auth/storage';

/**
 * Shows requests either:
 * - mode="open": all OPEN requests (for inspectors)
 * - mode="mine": requests created by the current user's email (for clients)
 * default = "open"
 */
export function RequestList({ mode = 'open' as 'open' | 'mine' }) {
  const { requests } = useLocalStore();

  const currentEmail = useMemo(() => {
    try {
      const s = getSession();
      if (!s) return '';
      const u = findUserById(s.userId);
      return u?.email ?? '';
    } catch {
      return '';
    }
  }, []);

  const rows = useMemo(() => {
    if (mode === 'mine') {
      if (!currentEmail) return [];
      return requests.filter(r => r.client.email === currentEmail);
    }
    // mode === 'open'
    return requests.filter(r => r.status === 'open');
  }, [mode, currentEmail, requests]);

  if (!rows.length) {
    return <div className="p-4 text-sm opacity-70">No requests to show.</div>;
  }

  return (
    <div className="grid gap-4">
      {rows.map(req => (
        <RequestCard key={req.id} request={req} />
      ))}
    </div>
  );
}
