import type { Employee } from "../types/api";
import { useApiResource } from "./useApiResource";

export function useEmployees() {
  return useApiResource<Employee[]>("/employees");
}
