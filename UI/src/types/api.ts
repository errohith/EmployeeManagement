export interface Employee {
  id: number;
  employee_id: string;
  name: string;
  department: string | null;
  email: string | null;
  status: string;
}

export interface ReviewPeriod {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
}

export interface ReviewCreate {
  employee_id: number;
  period_id: number;
  quality_rating: number;
  delivery_rating: number;
  teamwork_rating: number;
  comments: string;
}

export interface Review {
  id: number;
  employee_id: number;
  employee_code?: string;
  employee_name?: string;
  period_id: number;
  period_name?: string;
  quality_rating: number;
  delivery_rating: number;
  teamwork_rating: number;
  average_rating: number;
  comments: string;
  created_at: string;
}

export interface ReviewFilters {
  employeeId?: number;
  periodId?: number;
  limit?: number;
  offset?: number;
}
