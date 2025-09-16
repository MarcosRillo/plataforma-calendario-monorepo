/**
 * Public Calendar Layout
 * Layout for the public calendar view without admin sidebar
 */

import { type ReactNode } from 'react';

interface PublicCalendarLayoutProps {
  children: ReactNode;
}

export default function PublicCalendarLayout({ children }: PublicCalendarLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}