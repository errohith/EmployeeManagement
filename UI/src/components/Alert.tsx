import { AlertCircle, CheckCircle2 } from "lucide-react";

interface AlertProps {
  children: string;
  variant?: "error" | "success";
}

export function Alert({ children, variant = "error" }: AlertProps) {
  const Icon = variant === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div className={`alert alert-${variant}`} role="alert">
      <Icon aria-hidden="true" size={18} />
      <span>{children}</span>
    </div>
  );
}
