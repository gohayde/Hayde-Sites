import React from 'react';

interface PageLayoutProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
}

export default function PageLayout({ title, subtitle, children, headerActions }: PageLayoutProps) {
  return (
    <div className="page active">
      {(title || headerActions) && (
        <div className="page-header">
          <div>
            {title && <h1 className="page-title">{title}</h1>}
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>
          {headerActions && (
            <div className="flex items-center gap-3">
              {headerActions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
