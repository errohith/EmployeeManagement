import {
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Brand } from "./Brand";

const navigation = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard, end: true },
  { label: "Reviews", to: "/reviews", icon: ClipboardList, end: true },
  { label: "Submit review", to: "/reviews/new", icon: ClipboardCheck, end: false },
  { label: "Employees", to: "/employees", icon: Users, end: false },
  { label: "Review periods", to: "/review-periods", icon: CalendarDays, end: false },
];

export function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="sidebar">
      <Brand />
      <div className="sidebar-section-label">WORKSPACE</div>
      <nav aria-label="Main navigation" className="sidebar-nav">
        {navigation.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            className={({ isActive }) =>
              `nav-link${
                isActive ||
                (to === "/reviews" &&
                  pathname.startsWith("/reviews/") &&
                  pathname !== "/reviews/new")
                  ? " nav-link-active"
                  : ""
              }`
            }
            end={end}
            key={label}
            to={to}
          >
            <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
            <span>{label}</span>
            {label === "Submit review" && <span className="nav-new-dot" />}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-avatar">HR</div>
        <div className="sidebar-user-copy">
          <strong>People team</strong>
          <span>Workspace admin</span>
        </div>
      </div>
    </aside>
  );
}
