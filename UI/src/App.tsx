import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { EmployeesPage } from "./pages/EmployeesPage";
import { ReviewDetailsPage } from "./pages/ReviewDetailsPage";
import { ReviewFormPage } from "./pages/ReviewFormPage";
import { ReviewsPage } from "./pages/ReviewsPage";
import { ReviewPeriodsPage } from "./pages/ReviewPeriodsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="reviews/new" element={<ReviewFormPage />} />
        <Route path="reviews/:reviewId" element={<ReviewDetailsPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="review-periods" element={<ReviewPeriodsPage />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Route>
    </Routes>
  );
}
