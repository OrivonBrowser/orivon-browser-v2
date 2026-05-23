import React from 'react';
import Dashboard from './Dashboard';

interface NewTabProps { onNavigate: (url: string) => void; }

export default function NewTab({ onNavigate }: NewTabProps) {
  return <Dashboard onOpenBrowser={onNavigate} isMinimal={true} />;
}
