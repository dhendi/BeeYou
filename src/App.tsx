/**
 * BeeYou: Master Application Entry & Router
 * Strictly isolates Caregiver Controller and Child/User Tablet environments.
 */

import React, { useState, useEffect } from 'react';
import { CaregiverApp } from './components/CaregiverApp';
import { ChildApp } from './components/ChildApp';

function getActiveRole(): 'caregiver' | 'child' {
  if (typeof window === 'undefined') return 'child';

  // 1. Port 3001 is dedicated Caregiver Controller Hub
  if (window.location.port === '3001') return 'caregiver';

  // 2. Explicit route /caregiver is dedicated Caregiver Controller
  if (window.location.pathname.startsWith('/caregiver')) return 'caregiver';

  // 3. Explicit URL parameter ?role=caregiver or ?role=child
  const params = new URLSearchParams(window.location.search);
  const roleParam = params.get('role') || params.get('mode') || (params.get('caregiver') === 'true' ? 'caregiver' : null);
  if (roleParam === 'caregiver') return 'caregiver';
  if (roleParam === 'child') return 'child';

  // 4. Storage checks (if user logged in or switched role)
  const sessionView = sessionStorage.getItem('beeyou_active_device_view') || sessionStorage.getItem('beeyou_user_role');
  if (sessionView === 'caregiver') return 'caregiver';
  if (sessionView === 'child' || sessionView === 'child_dependent') return 'child';

  const localView = localStorage.getItem('beeyou_active_device_view') || localStorage.getItem('beeyou_user_role');
  if (localView === 'caregiver') return 'caregiver';
  if (localView === 'child' || localView === 'child_dependent') return 'child';

  return 'child';
}

export default function App() {
  const [role, setRole] = useState<'caregiver' | 'child'>(getActiveRole);

  useEffect(() => {
    const handleRoleUpdate = (e?: any) => {
      if (e?.detail?.role) {
        setRole(e.detail.role);
      } else {
        setRole(getActiveRole());
      }
    };

    window.addEventListener('popstate', handleRoleUpdate);
    window.addEventListener('beeyou_role_change' as any, handleRoleUpdate);
    return () => {
      window.removeEventListener('popstate', handleRoleUpdate);
      window.removeEventListener('beeyou_role_change' as any, handleRoleUpdate);
    };
  }, []);

  if (role === 'caregiver') {
    return <CaregiverApp key="caregiver-root-app" />;
  }

  return <ChildApp key="child-root-app" />;
}
