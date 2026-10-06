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

  // 4. Session storage check (if user switched role in this tab session)
  const sessionView = sessionStorage.getItem('beeyou_active_device_view');
  if (sessionView === 'caregiver') return 'caregiver';
  if (sessionView === 'child') return 'child';

  return 'child';
}

export default function App() {
  const [role, setRole] = useState<'caregiver' | 'child'>(getActiveRole);

  useEffect(() => {
    const handlePopState = () => {
      setRole(getActiveRole());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (role === 'caregiver') {
    return <CaregiverApp />;
  }

  return <ChildApp />;
}
