import { Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Alert } from "../components/Alert";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { PageHeading } from "../components/PageHeading";
import { useEmployees } from "../hooks/useEmployees";

export function EmployeesPage() {
  const employees = useEmployees();
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () =>
      (employees.data ?? []).filter((employee) =>
        `${employee.employee_id} ${employee.name} ${employee.department ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [employees.data, search],
  );

  return (
    <>
      <PageHeading
        eyebrow="YOUR ORGANIZATION"
        title="Employees"
        description="Browse employee profiles and review status."
      />
      <section className="panel">
        <div className="directory-toolbar">
          <div className="directory-count">
            <span className="stat-icon stat-icon-blue"><Users size={17} /></span>
            <strong>{employees.data?.length ?? 0} team members</strong>
          </div>
          <label className="search-input">
            <Search size={16} />
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, ID or department"
              value={search}
            />
          </label>
        </div>
        {employees.error && <Alert>{employees.error}</Alert>}
        {employees.loading ? (
          <LoadingState label="Loading employees…" />
        ) : filtered.length ? (
          <div className="employee-grid">
            {filtered.map((employee, index) => (
              <article className="employee-card" key={employee.id}>
                <div className={`employee-card-avatar avatar-color-${index % 5}`}>{employee.name.slice(0, 1)}</div>
                <div className="employee-card-main">
                  <strong>{employee.name}</strong>
                  <span>{employee.employee_id}</span>
                </div>
                <span className={`employee-status ${employee.status.toLowerCase() === "active" ? "employee-status-active" : ""}`}>
                  {employee.status}
                </span>
                <div className="employee-card-meta">
                  <span>{employee.department ?? "No department"}</span>
                  <span>{employee.email ?? "No email address"}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="No employees found" description="Try a different name, employee ID, or department." />
        )}
      </section>
    </>
  );
}
