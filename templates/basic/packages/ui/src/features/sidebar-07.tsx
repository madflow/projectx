"use client";

import { useState, type ReactNode } from "react";
import "./features.css";

export function Sidebar07({
  children,
  header,
  footer,
  navigation,
  className,
}: {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  navigation?: ReactNode;
  className?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`ui-feature-layout ${className ?? ""}`} data-collapsed={collapsed}>
      <aside className="ui-feature-sidebar">
        {header && <div className="ui-feature-sidebar-header">{header}</div>}
        <nav className="ui-feature-sidebar-nav" aria-label="Main navigation">
          {navigation}
        </nav>
        {footer && <div className="ui-feature-sidebar-footer">{footer}</div>}
      </aside>
      <div className="ui-feature-sidebar-main">
        <header className="ui-feature-sidebar-toolbar">
          <button
            type="button"
            className="ui-feature-sidebar-toggle"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((value) => !value)}
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M9 4v16" />
            </svg>
          </button>
        </header>
        <main className="ui-feature-sidebar-content">{children}</main>
      </div>
    </div>
  );
}

export function Sidebar07Item({
  icon,
  label,
  href,
}: {
  icon: ReactNode;
  label: string;
  href: string;
}) {
  return (
    <a className="ui-feature-sidebar-item" href={href} title={label}>
      {icon}
      <span>{label}</span>
    </a>
  );
}
