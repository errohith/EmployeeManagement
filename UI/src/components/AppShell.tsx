import { Bell, Search } from "lucide-react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-divider">/</span>
            <strong>Performance</strong>
          </div>
          <div className="topbar-actions">
            <span className="topbar-period">FY 2026</span>
            <button className="icon-button" aria-label="Search" type="button">
              <Search size={18} />
            </button>
            <button
              className="icon-button notification-button"
              aria-label="Notifications"
              type="button"
            >
              <Bell size={18} />
              <span />
            </button>
            <div className="topbar-avatar" aria-label="People team account">
              PT
            </div>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
