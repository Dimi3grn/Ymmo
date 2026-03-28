import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import BiensPage from "./pages/BiensPage";
import BienDetailPage from "./pages/BienDetailPage";
import LoginPage from "./pages/LoginPage";
import AgencesPage from "./pages/AgencesPage";
import DashboardPage from "./pages/DashboardPage";
import AgentLayout from "./pages/agent/AgentLayout";
import AgentBiensPage from "./pages/agent/AgentBiensPage";
import AgentBienFormPage from "./pages/agent/AgentBienFormPage";
import AgentRdvPage from "./pages/agent/AgentRdvPage";
import AgentTransactionsPage from "./pages/agent/AgentTransactionsPage";
import AgentClientsPage from "./pages/agent/AgentClientsPage";
import AdminUsersPage from "./pages/agent/AdminUsersPage";
import ClientEspacePage from "./pages/client/ClientEspacePage";

const AGENT_ROLES = ["Agent", "AdminAgence", "AdminSiege"];

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-white">
          <Navbar />
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/biens" element={<BiensPage />} />
            <Route path="/biens/:id" element={<BienDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/agences" element={<AgencesPage />} />

            {/* Client */}
            <Route path="/mon-espace" element={<ProtectedRoute><ClientEspacePage /></ProtectedRoute>} />

            {/* Agent / Admin */}
            <Route path="/agent" element={<ProtectedRoute roles={AGENT_ROLES}><AgentLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/agent/biens" replace />} />
              <Route path="biens" element={<AgentBiensPage />} />
              <Route path="biens/nouveau" element={<AgentBienFormPage />} />
              <Route path="biens/:id/modifier" element={<AgentBienFormPage />} />
              <Route path="rdv" element={<AgentRdvPage />} />
              <Route path="transactions" element={<AgentTransactionsPage />} />
              <Route path="clients" element={<AgentClientsPage />} />
              <Route path="utilisateurs" element={<AdminUsersPage />} />
            </Route>

            {/* Dashboard (admin) */}
            <Route path="/dashboard" element={<ProtectedRoute roles={["AdminAgence", "AdminSiege"]}><DashboardPage /></ProtectedRoute>} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
