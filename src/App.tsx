import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { LoadingState, NotFoundState } from "@/components/design-system/States";
import AppErrorBoundary from "@/components/system/AppErrorBoundary";

// The landing page is the public entry point and must stay in the initial
// bundle so the cinematic experience is not gated behind a chunk fetch.
import LandingPage from "@/pages/landing/LandingPage";

// Application shells are small and shared, so they stay eager.
import OfficerShell from "@/components/shells/OfficerShell";
import AdminShell from "@/components/shells/AdminShell";
import SeniorShell from "@/components/shells/SeniorShell";
import ConsumerShell from "@/components/shells/ConsumerShell";

import { ModulePlaceholderPage, ConsumerReportHome } from "@/pages/placeholders";
import { MODULE_ROUTES } from "@/routes/moduleRoutes";

// ── Route-level code splitting ───────────────────────────────────────────
// Workspace screens are loaded on demand so a citizen visiting the landing
// page never downloads the government operations modules.
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));

const OfficerDashboard = lazy(() => import("@/pages/officer/OfficerDashboard"));
const InspectionListPage = lazy(() => import("@/pages/officer/InspectionListPage"));
const NewInspectionPage = lazy(() => import("@/pages/officer/NewInspectionPage"));
const InspectionReviewPage = lazy(() => import("@/pages/officer/InspectionReviewPage"));
const OfficerComplaintsPage = lazy(() => import("@/pages/officer/OfficerComplaintsPage"));
const OfficerComplaintDetailPage = lazy(() => import("@/pages/officer/OfficerComplaintDetailPage"));

const ConsumerNewReport = lazy(() => import("@/pages/consumer/ConsumerNewReport"));
const ConsumerTrack = lazy(() => import("@/pages/consumer/ConsumerTrack"));
const ConsumerSuccess = lazy(() => import("@/pages/consumer/ConsumerSuccess"));

const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminOfficers = lazy(() => import("@/pages/admin/AdminOfficers"));
const AdminProducts = lazy(() => import("@/pages/admin/AdminProducts"));
const AdminManufacturers = lazy(() => import("@/pages/admin/AdminManufacturers"));
const AdminInspections = lazy(() => import("@/pages/admin/AdminInspections"));
const AdminComplaints = lazy(() => import("@/pages/admin/AdminComplaints"));
const AdminViolations = lazy(() => import("@/pages/admin/AdminViolations"));
const AdminRules = lazy(() => import("@/pages/admin/AdminRules"));
const AdminReports = lazy(() => import("@/pages/admin/AdminReports"));
const AdminAuditLogs = lazy(() => import("@/pages/admin/AdminAuditLogs"));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));

const SeniorDashboard = lazy(() => import("@/pages/senior/SeniorDashboard"));
const SeniorAnalytics = lazy(() => import("@/pages/senior/SeniorAnalytics"));
const SeniorCompliance = lazy(() => import("@/pages/senior/SeniorCompliance"));
const SeniorRisk = lazy(() => import("@/pages/senior/SeniorRisk"));
const SeniorTrends = lazy(() => import("@/pages/senior/SeniorTrends"));

/** Officer paths that now have real screens rather than placeholders. */
const OFFICER_IMPLEMENTED = [
  "dashboard",
  "inspections",
  "inspections/new",
  "inspections/:id",
  "complaints",
  "complaints/:id",
];

/** Wraps a workspace subtree with a suspense boundary and an error boundary. */
function WorkspaceBoundary({ children }: { children: React.ReactNode }) {
  return (
    <AppErrorBoundary>
      <Suspense fallback={<LoadingState message="Opening workspace…" />}>{children}</Suspense>
    </AppErrorBoundary>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public landing page — approved design, unchanged and eagerly loaded. */}
          <Route path="/" element={<LandingPage />} />

          <Route
            path="/login"
            element={
              <WorkspaceBoundary>
                <LoginPage />
              </WorkspaceBoundary>
            }
          />

          {/* ── INSPECTION OFFICER ── */}
          <Route
            path="/officer/*"
            element={
              <ProtectedRoute workspace="OFFICER">
                <OfficerShell>
                  <WorkspaceBoundary>
                    <Routes>
                      <Route path="dashboard" element={<OfficerDashboard />} />
                      <Route path="inspections" element={<InspectionListPage />} />
                      <Route path="inspections/new" element={<NewInspectionPage />} />
                      <Route path="inspections/:id" element={<InspectionReviewPage />} />
                      <Route path="complaints" element={<OfficerComplaintsPage />} />
                      <Route path="complaints/:id" element={<OfficerComplaintDetailPage />} />
                      {MODULE_ROUTES.INSPECTION_OFFICER.filter(
                        (route) => !OFFICER_IMPLEMENTED.includes(route.path),
                      ).map((route) => (
                        <Route
                          key={route.path}
                          path={route.path}
                          element={<ModulePlaceholderPage role="INSPECTION_OFFICER" route={route} />}
                        />
                      ))}
                      <Route path="*" element={<NotFoundState />} />
                    </Routes>
                  </WorkspaceBoundary>
                </OfficerShell>
              </ProtectedRoute>
            }
          />

          {/* ── DEPARTMENT ADMIN ── */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute workspace="ADMIN">
                <AdminShell>
                  <WorkspaceBoundary>
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="officers" element={<AdminOfficers />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="manufacturers" element={<AdminManufacturers />} />
                      <Route path="inspections" element={<AdminInspections />} />
                      <Route path="complaints" element={<AdminComplaints />} />
                      <Route path="violations" element={<AdminViolations />} />
                      <Route path="rules" element={<AdminRules />} />
                      <Route path="reports" element={<AdminReports />} />
                      <Route path="audit-logs" element={<AdminAuditLogs />} />
                      <Route path="settings" element={<AdminSettings />} />
                      <Route path="*" element={<NotFoundState />} />
                    </Routes>
                  </WorkspaceBoundary>
                </AdminShell>
              </ProtectedRoute>
            }
          />

          {/* ── SENIOR OFFICER ── */}
          <Route
            path="/senior/*"
            element={
              <ProtectedRoute workspace="SENIOR">
                <SeniorShell>
                  <WorkspaceBoundary>
                    <Routes>
                      <Route path="dashboard" element={<SeniorDashboard />} />
                      <Route path="analytics" element={<SeniorAnalytics />} />
                      <Route path="compliance" element={<SeniorCompliance />} />
                      <Route path="risk" element={<SeniorRisk />} />
                      <Route path="trends" element={<SeniorTrends />} />
                      <Route path="*" element={<NotFoundState />} />
                    </Routes>
                  </WorkspaceBoundary>
                </SeniorShell>
              </ProtectedRoute>
            }
          />

          {/*
            ── CONSUMER ──
            Deliberately public. Reporting an unsafe product is a citizen
            service; requiring a government login would defeat its purpose.
            Government roles are steered back to their own workspace by the
            consumer shell rather than being hard-blocked here.
          */}
          <Route
            path="/report/*"
            element={
              <ConsumerShell>
                <WorkspaceBoundary>
                  <Routes>
                    <Route index element={<ConsumerReportHome />} />
                    <Route path="new" element={<ConsumerNewReport />} />
                    <Route path="track" element={<ConsumerTrack />} />
                    <Route path="success" element={<ConsumerSuccess />} />
                    <Route path="*" element={<NotFoundState />} />
                  </Routes>
                </WorkspaceBoundary>
              </ConsumerShell>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
