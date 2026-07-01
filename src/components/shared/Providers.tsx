'use client';

import { type ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthProvider';
import DownloadGate from './DownloadGate';
import SignupSpotlight from './SignupSpotlight';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SignupSpotlight>
        <DownloadGate>
          {children}
        </DownloadGate>
      </SignupSpotlight>
    </AuthProvider>
  );
}
