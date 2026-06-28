'use client';

import { type ReactNode } from 'react';
import DownloadGate from './DownloadGate';
import SignupSpotlight from './SignupSpotlight';

export default function Providers({ children }: { children: ReactNode }) {
  return (
  <SignupSpotlight>
    <DownloadGate>
      {children}
    </DownloadGate>
  </SignupSpotlight>
);
}
