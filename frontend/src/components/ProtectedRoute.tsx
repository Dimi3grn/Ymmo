import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Props {
  children: React.ReactNode;
  roles?: string[];
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { isAuthenticated, utilisateur } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && utilisateur && !roles.includes(utilisateur.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
}
