import { Navigate, Route, BrowserRouter, Routes } from "react-router-dom";

import { AppShell } from "@/components/layout/AppShell";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider, RequireAuth } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import LoginPage from "@/pages/Login";
import DashboardPage from "@/pages/Dashboard";
import WorkspacePage from "@/pages/Workspace";
import KnowledgeSearchPage from "@/pages/KnowledgeSearch";
import AnalyticsPage from "@/pages/Analytics";

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                element={
                  <RequireAuth>
                    <AppShell />
                  </RequireAuth>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/workspace" element={<WorkspacePage />} />
                <Route path="/knowledge" element={<KnowledgeSearchPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
